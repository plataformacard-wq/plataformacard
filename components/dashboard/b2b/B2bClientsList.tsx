"use client";

import React, { useState } from "react";
import { 
  Check, 
  Copy, 
  ShieldCheck, 
  Send, 
  Building2, 
  Phone
} from "lucide-react";
import { motion } from "framer-motion";

export interface B2bClient {
  id: string;
  cnpj_cpf: string;
  company_name: string;
  trade_name?: string;
  phone_whatsapp: string;
  access_token: string;
  assigned_price_key: string;
  anchor_percent?: number | null;
  status: "pending_approval" | "approved" | "rejected";
  notes?: string;
  created_at: string;
  organization_id?: string;
}

interface B2bClientsListProps {
  clients: B2bClient[];
  slug: string;
  customTables?: { key: string; label: string }[];
  defaultAnchorPercent?: number;
  onUpdateClient: (id: string, updates: Partial<B2bClient>) => Promise<void>;
}

export const B2bClientsList: React.FC<B2bClientsListProps> = ({
  clients,
  slug,
  customTables = [],
  defaultAnchorPercent = 30,
  onUpdateClient,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editingAnchorId, setEditingAnchorId] = useState<string | null>(null);
  const [anchorInputVal, setAnchorInputVal] = useState<string>("");

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
    const cleanPhone = client.phone_whatsapp.replace(/\D/g, "");
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handlePriceKeyChange = async (id: string, newKey: string) => {
    setLoadingId(id);
    await onUpdateClient(id, { assigned_price_key: newKey });
    setLoadingId(null);
  };

  const handleSaveAnchorPercent = async (id: string) => {
    setLoadingId(id);
    const val = anchorInputVal.trim();
    await onUpdateClient(id, { anchor_percent: val !== "" ? Number(val) : null });
    setEditingAnchorId(null);
    setLoadingId(null);
  };

  if (clients.length === 0) {
    return (
      <div className="p-10 text-center bg-[var(--dash-surface)] rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-3">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h3 className="text-sm font-bold text-[var(--dash-text-primary)]">
            Nenhum lojista homologado encontrado
          </h3>
          <p className="text-xs text-[var(--dash-text-secondary)] leading-relaxed">
            Cadastre novos parceiros através do botão no topo ou aprove as solicitações recebidas na aba ao lado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {clients.map((client, idx) => {
        const isCopied = copiedId === client.id;
        const isUpdating = loadingId === client.id;

        return (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface)] hover:border-emerald-500/30 hover:shadow-sm transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 group"
          >
            {/* 1. Informações da Empresa / Lojista */}
            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs shrink-0">
                {(client.trade_name || client.company_name).charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm text-[var(--dash-text-primary)] truncate max-w-sm">
                    {client.company_name}
                  </h3>
                  {client.trade_name && (
                    <span className="text-xs text-[var(--dash-text-muted)]">
                      ({client.trade_name})
                    </span>
                  )}
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider shrink-0">
                    Homologado
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-[var(--dash-text-secondary)] font-mono flex-wrap">
                  <span className="flex items-center gap-1">
                    <Building2 size={12} className="text-[var(--dash-text-muted)]" />
                    <span>CNPJ: {client.cnpj_cpf}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone size={12} className="text-[var(--dash-text-muted)]" />
                    <span>{client.phone_whatsapp}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Seleção de Tabela + Ações */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200/60 dark:border-white/5">
              
              {/* Seletor de Tabela Dinâmico */}
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-semibold text-[var(--dash-text-muted)] uppercase tracking-wider hidden sm:inline">
                  Tabela:
                </label>
                <select
                  disabled={isUpdating}
                  className="dash-select text-xs font-semibold rounded-lg border border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface-secondary)] text-[var(--dash-text-primary)] pl-3 py-1.5 focus:outline-none focus:border-emerald-500/50 cursor-pointer disabled:opacity-50"
                  value={client.assigned_price_key || "valor_1"}
                  onChange={(e) => handlePriceKeyChange(client.id, e.target.value)}
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

              {/* Badge / Edição de % Ancoragem */}
              <div className="flex items-center gap-1.5">
                <label className="text-[11px] font-semibold text-[var(--dash-text-muted)] uppercase tracking-wider hidden sm:inline">
                  Âncora:
                </label>
                {editingAnchorId === client.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="500"
                      autoFocus
                      className="w-16 text-xs font-mono font-bold rounded-lg border border-emerald-500 bg-[var(--dash-surface-secondary)] text-[var(--dash-text-primary)] px-2 py-1 focus:outline-none"
                      value={anchorInputVal}
                      placeholder={String(defaultAnchorPercent)}
                      onChange={(e) => setAnchorInputVal(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveAnchorPercent(client.id);
                        if (e.key === "Escape") setEditingAnchorId(null);
                      }}
                    />
                    <button
                      onClick={() => handleSaveAnchorPercent(client.id)}
                      className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer"
                      title="Salvar % Ancoragem"
                    >
                      <Check size={11} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingAnchorId(client.id);
                      setAnchorInputVal(client.anchor_percent !== null && client.anchor_percent !== undefined ? String(client.anchor_percent) : "");
                    }}
                    disabled={isUpdating}
                    className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface-secondary)] hover:border-emerald-500/40 text-[var(--dash-text-primary)] transition-all cursor-pointer flex items-center gap-1"
                    title="Clique para personalizar a porcentagem de ancoragem"
                  >
                    <span className="text-emerald-500">
                      +{client.anchor_percent !== null && client.anchor_percent !== undefined ? client.anchor_percent : defaultAnchorPercent}%
                    </span>
                    <span className="text-[10px] text-[var(--dash-text-muted)] font-sans font-normal">
                      {client.anchor_percent !== null && client.anchor_percent !== undefined ? "(custom)" : "(padrão)"}
                    </span>
                  </button>
                )}
              </div>

              {/* Botão Copiar Link */}
              <button
                onClick={() => handleCopyLink(client.access_token, client.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
                  isCopied
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                    : "border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface-secondary)] text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)] hover:border-emerald-500/30"
                }`}
                title="Copiar link com token em 1-clique"
              >
                {isCopied ? (
                  <>
                    <Check size={12} className="text-emerald-500" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Link 1-Clique</span>
                  </>
                )}
              </button>

              {/* Botão WhatsApp */}
              <button
                onClick={() => handleSendWhatsApp(client)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                title="Enviar link de acesso via WhatsApp"
              >
                <Send size={12} />
                <span>WhatsApp</span>
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
