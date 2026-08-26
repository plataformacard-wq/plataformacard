"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, XCircle, Send, Sparkles } from "lucide-react";
import { B2bClient } from "./B2bClientsList";

interface B2bPendingRequestsListProps {
  clients: B2bClient[];
  slug: string;
  onUpdateClient: (id: string, updates: Partial<B2bClient>) => Promise<void>;
}

export const B2bPendingRequestsList: React.FC<B2bPendingRequestsListProps> = ({ clients, slug, onUpdateClient }) => {
  const [selectedKeys, setSelectedKeys] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const pendingClients = clients.filter(c => c.status === "pending_approval");

  const getClientUrl = (token: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/${slug}?b2b=${token}`;
    }
    return `https://www.plataformashop.com.br/${slug}?b2b=${token}`;
  };

  const handleApprove = async (client: B2bClient) => {
    setLoadingId(client.id);
    const assignedKey = selectedKeys[client.id] || client.assigned_price_key || 'tabela_x';

    await onUpdateClient(client.id, {
      status: 'approved',
      assigned_price_key: assignedKey
    });

    const url = getClientUrl(client.access_token);
    const message = `🎉 *Boas-vindas à Maj Mobilidade!*\n\nSua solicitação de cadastro B2B para *${client.trade_name || client.company_name}* foi aprovada com sucesso com ofertas e condições exclusivas!\n\nAcesse seu catálogo de revendedor no link abaixo:\n${url}`;
    const cleanPhone = client.phone_whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');

    setLoadingId(null);
  };

  const handleReject = async (id: string) => {
    setLoadingId(id);
    await onUpdateClient(id, { status: 'rejected' });
    setLoadingId(null);
  };

  if (pendingClients.length === 0) {
    return (
      <div className="p-8 text-center bg-[var(--dash-surface-element)] rounded-2xl border border-[var(--dash-border-subtle)]">
        <Sparkles className="w-10 h-10 mx-auto text-emerald-400 mb-2 opacity-80" />
        <p className="text-[var(--dash-text-secondary)] font-medium">Nenhuma solicitação pendente no momento.</p>
        <p className="text-xs text-[var(--dash-text-muted)] mt-1">
          Quando novos lojistas se cadastrarem pelo site, os pedidos de análise de ofertas aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
        <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-[var(--dash-text-secondary)] leading-relaxed">
          <strong className="text-amber-400 font-semibold block mb-0.5">Retenção Ativa ("Preparando Ofertas Especiais"):</strong>
          Estes lojistas preencheram a solicitação no site e estão aguardando a seleção da tabela de preço para receber o link de liberação.
        </div>
      </div>

      <div className="space-y-3">
        {pendingClients.map((client) => {
          const currentKey = selectedKeys[client.id] || client.assigned_price_key || 'tabela_x';

          return (
            <div
              key={client.id}
              className="p-4 rounded-2xl border border-[var(--dash-border-subtle)] bg-[var(--dash-surface)] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-[var(--dash-text-primary)]">
                    {client.company_name}
                  </h4>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Aguardando Análise
                  </span>
                </div>
                <div className="text-xs text-[var(--dash-text-muted)] font-mono">
                  CNPJ: {client.cnpj_cpf} • Tel: {client.phone_whatsapp}
                </div>
                <div className="text-[11px] text-[var(--dash-text-muted)]">
                  Solicitado em: {new Date(client.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-[var(--dash-text-muted)]">
                    Definir Tabela de Preço:
                  </label>
                  <select
                    className="dash-select text-xs font-semibold rounded-lg border border-[var(--dash-border-subtle)] bg-[var(--dash-surface-element)] text-[var(--dash-text-primary)] pl-3 py-1.5 focus:outline-none"
                    value={currentKey}
                    onChange={(e) => setSelectedKeys(prev => ({ ...prev, [client.id]: e.target.value }))}
                  >
                    <option value="tabela_x">Tabela X (VIP)</option>
                    <option value="tabela_y">Tabela Y (Margem Ajustada)</option>
                    <option value="tabela_z">Tabela Z (Plus / Atacado)</option>
                    <option value="bling">Preço Base (Bling)</option>
                  </select>
                </div>

                <button
                  onClick={() => handleReject(client.id)}
                  disabled={loadingId === client.id}
                  className="p-2 text-xs font-medium rounded-xl border border-[var(--dash-border-subtle)] hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-400 transition-all"
                  title="Recusar Solicitação"
                >
                  <XCircle className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleApprove(client)}
                  disabled={loadingId === client.id}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aprovar & Disparar WhatsApp</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
