"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, XCircle, Send, Sparkles, Building2, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { B2bClient } from "./B2bClientsList";

interface B2bPendingRequestsListProps {
  clients: B2bClient[];
  slug: string;
  customTables?: { key: string; label: string }[];
  onUpdateClient: (id: string, updates: Partial<B2bClient>) => Promise<void>;
}

export const B2bPendingRequestsList: React.FC<B2bPendingRequestsListProps> = ({
  clients,
  slug,
  customTables = [],
  onUpdateClient,
}) => {
  const [selectedKeys, setSelectedKeys] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const getClientUrl = (token: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/${slug}?b2b=${token}`;
    }
    return `https://www.plataformashop.com.br/${slug}?b2b=${token}`;
  };

  const handleApprove = async (client: B2bClient) => {
    setLoadingId(client.id);
    const assignedKey = selectedKeys[client.id] || client.assigned_price_key || (customTables[0]?.key || "valor_1");

    await onUpdateClient(client.id, {
      status: "approved",
      assigned_price_key: assignedKey,
    });

    const url = getClientUrl(client.access_token);
    const message = `🎉 *Boas-vindas à Maj Mobilidade!*\n\nSua solicitação de cadastro B2B para *${client.trade_name || client.company_name}* foi aprovada com sucesso com ofertas e condições exclusivas!\n\nAcesse seu catálogo de revendedor no link abaixo:\n${url}`;
    const cleanPhone = client.phone_whatsapp.replace(/\D/g, "");
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");

    setLoadingId(null);
  };

  const handleReject = async (id: string) => {
    if (!confirm("Tem certeza que deseja recusar esta solicitação de cadastro?")) return;
    setLoadingId(id);
    await onUpdateClient(id, { status: "rejected" });
    setLoadingId(null);
  };

  if (clients.length === 0) {
    return (
      <div className="p-10 text-center bg-[var(--dash-surface)] rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-3">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h3 className="text-sm font-bold text-[var(--dash-text-primary)]">
            Nenhuma solicitação pendente no momento
          </h3>
          <p className="text-xs text-[var(--dash-text-secondary)] leading-relaxed">
            Quando novos lojistas solicitarem acesso atacadista pelo site, os pedidos para liberação aparecerão aqui.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Banner Informativo de Retenção */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
          <Clock className="w-4 h-4" />
        </div>
        <div className="text-xs text-[var(--dash-text-secondary)] leading-relaxed">
          <strong className="text-amber-400 font-semibold block mb-0.5">
            Retenção Comercial Ativa ("Preparando Ofertas Especiais"):
          </strong>
          Estes revendedores preencheram a solicitação no catálogo e aguardam autorização. Ao aprovar, o sistema libera o acesso e abre o WhatsApp com a mensagem pronta.
        </div>
      </div>

      {/* Grid de Cards de Solicitações */}
      <div className="grid grid-cols-1 gap-3">
        {clients.map((client, idx) => {
          const currentKey = selectedKeys[client.id] || client.assigned_price_key || (customTables[0]?.key || "valor_1");
          const isProcessing = loadingId === client.id;

          return (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-[var(--dash-surface)] hover:shadow-sm transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              {/* Infos do Lead */}
              <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                  <Building2 size={18} />
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-[var(--dash-text-primary)] truncate max-w-sm">
                      {client.company_name}
                    </h3>
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider shrink-0">
                      Aguardando Liberação
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-[var(--dash-text-secondary)] font-mono flex-wrap">
                    <span>CNPJ: {client.cnpj_cpf}</span>
                    <span>•</span>
                    <span>WhatsApp: {client.phone_whatsapp}</span>
                    <span>•</span>
                    <span className="text-[var(--dash-text-muted)] font-sans text-[11px]">
                      {new Date(client.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Controles de Decisão */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200/60 dark:border-white/5">
                
                {/* Seletor de Tabela a Atribuir */}
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-semibold text-[var(--dash-text-muted)] uppercase tracking-wider hidden sm:inline">
                    Tabela:
                  </label>
                  <select
                    disabled={isProcessing}
                    className="dash-select text-xs font-semibold rounded-lg border border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface-secondary)] text-[var(--dash-text-primary)] pl-3 py-1.5 focus:outline-none focus:border-emerald-500/50 cursor-pointer disabled:opacity-50"
                    value={currentKey}
                    onChange={(e) => setSelectedKeys((prev) => ({ ...prev, [client.id]: e.target.value }))}
                  >
                    {customTables.length > 0 ? (
                      customTables.map((t) => (
                        <option key={t.key} value={t.key}>
                          {t.label}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="valor_1">Tabela 1 (Valor 1)</option>
                        <option value="valor_2">Tabela 2 (Valor 2)</option>
                        <option value="valor_3">Tabela 3 (Valor 3)</option>
                        <option value="valor_4">Tabela 4 (Valor 4)</option>
                      </>
                    )}
                    <option value="bling">Preço Base (Bling / Catálogo)</option>
                  </select>
                </div>

                {/* Botão Recusar */}
                <button
                  onClick={() => handleReject(client.id)}
                  disabled={isProcessing}
                  className="p-2 text-xs font-semibold rounded-lg border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                  title="Recusar Solicitação"
                >
                  <XCircle size={15} />
                </button>

                {/* Botão Aprovar e Notificar */}
                <button
                  onClick={() => handleApprove(client)}
                  disabled={isProcessing}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 size={13} />
                  <span>Aprovar & Disparar WhatsApp</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
