"use client";

import React, { useState } from "react";
import { Check, Copy, ExternalLink, ShieldCheck, RefreshCw, Send } from "lucide-react";

export interface B2bClient {
  id: string;
  cnpj_cpf: string;
  company_name: string;
  trade_name?: string;
  phone_whatsapp: string;
  access_token: string;
  assigned_price_key: string;
  status: 'pending_approval' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
}

interface B2bClientsListProps {
  clients: B2bClient[];
  slug: string;
  onUpdateClient: (id: string, updates: Partial<B2bClient>) => Promise<void>;
}

export const B2bClientsList: React.FC<B2bClientsListProps> = ({ clients, slug, onUpdateClient }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const approvedClients = clients.filter(c => c.status === "approved");

  const getClientUrl = (token: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/${slug}?b2b=${token}`;
    }
    return `https://www.plataformashop.com.br/${slug}?b2b=${token}`;
  };

  const handleCopyLink = (token: string, id: string) => {
    const url = getClientUrl(token);
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSendWhatsApp = (client: B2bClient) => {
    const url = getClientUrl(client.access_token);
    const message = `Olá *${client.trade_name || client.company_name}*! 👋\n\nSeu acesso exclusivo ao catálogo B2B da *Maj Mobilidade* foi liberado com suas condições e tabela especial!\n\nAcesse no link em 1 clique:\n${url}`;
    const cleanPhone = client.phone_whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handlePriceKeyChange = async (id: string, newKey: string) => {
    setLoadingId(id);
    await onUpdateClient(id, { assigned_price_key: newKey });
    setLoadingId(null);
  };

  if (approvedClients.length === 0) {
    return (
      <div className="p-8 text-center bg-[var(--dash-surface-element)] rounded-2xl border border-[var(--dash-border-subtle)]">
        <ShieldCheck className="w-12 h-12 mx-auto text-[var(--dash-text-muted)] mb-3 opacity-60" />
        <p className="text-[var(--dash-text-secondary)] font-medium">Nenhum cliente B2B liberado no momento.</p>
        <p className="text-sm text-[var(--dash-text-muted)] mt-1">
          Cadastre novos lojistas ou aprove as solicitações pendentes para liberar tabelas personalizadas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-[var(--dash-border-subtle)] bg-[var(--dash-surface)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--dash-surface-element)] text-[var(--dash-text-secondary)] border-b border-[var(--dash-border-subtle)]">
            <tr>
              <th className="p-4 font-semibold">Empresa / CNPJ</th>
              <th className="p-4 font-semibold">WhatsApp</th>
              <th className="p-4 font-semibold">Tabela de Preço Atribuída</th>
              <th className="p-4 font-semibold text-right">Ações Exclusivas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--dash-border-subtle)]">
            {approvedClients.map((client) => (
              <tr key={client.id} className="hover:bg-[var(--dash-surface-element)] transition-colors">
                <td className="p-4">
                  <div className="font-semibold text-[var(--dash-text-primary)]">
                    {client.company_name}
                  </div>
                  <div className="text-xs text-[var(--dash-text-muted)] font-mono mt-0.5">
                    CNPJ: {client.cnpj_cpf}
                  </div>
                </td>

                <td className="p-4 text-[var(--dash-text-secondary)]">
                  {client.phone_whatsapp}
                </td>

                <td className="p-4">
                  <select
                    className="dash-select text-xs font-semibold rounded-lg border border-[var(--dash-border-subtle)] bg-[var(--dash-surface-element)] text-[var(--dash-text-primary)] pl-3 py-1.5 focus:outline-none"
                    value={client.assigned_price_key}
                    disabled={loadingId === client.id}
                    onChange={(e) => handlePriceKeyChange(client.id, e.target.value)}
                  >
                    <option value="tabela_x">Tabela X (VIP)</option>
                    <option value="tabela_y">Tabela Y (Margem Ajustada)</option>
                    <option value="tabela_z">Tabela Z (Plus / Atacado)</option>
                    <option value="bling">Preço Base (Bling)</option>
                  </select>
                </td>

                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleCopyLink(client.access_token, client.id)}
                      className="px-3 py-1.5 text-xs font-medium rounded-xl border border-[var(--dash-border-subtle)] bg-[var(--dash-surface-element)] text-[var(--dash-text-primary)] hover:border-emerald-500/50 transition-all flex items-center gap-1.5"
                      title="Copiar Link Exclusivo"
                    >
                      {copiedId === client.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[var(--dash-text-muted)]" />
                          <span>Link 1-Clique</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleSendWhatsApp(client)}
                      className="px-3 py-1.5 text-xs font-medium rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
