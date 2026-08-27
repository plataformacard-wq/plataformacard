"use client";

import React, { useState, useEffect } from "react";
import { 
  FileSpreadsheet, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Info, 
  Link2,
  Download,
  BookOpen
} from "lucide-react";
import { B2bSheetsInstructionsModal } from "./B2bSheetsInstructionsModal";

interface B2bSheetsConfigCardProps {
  organizationId: string;
  onSyncSuccess?: (customTables: { key: string; label: string }[]) => void;
}

export const B2bSheetsConfigCard: React.FC<B2bSheetsConfigCardProps> = ({ organizationId, onSyncSuccess }) => {
  const [sheetUrl, setSheetUrl] = useState("");
  const [tabName, setTabName] = useState("Precos");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  useEffect(() => {
    if (!organizationId) return;

    fetch(`/api/b2b/sync-sheets?organizationId=${organizationId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config) {
          const rawId = data.config.sheet_id || "";
          if (rawId.startsWith("http")) {
            setSheetUrl(rawId);
          } else if (rawId) {
            setSheetUrl(`https://docs.google.com/spreadsheets/d/${rawId}/edit`);
          } else {
            setSheetUrl("");
          }
          setTabName(data.config.tab_name || "Precos");
          setLastSyncedAt(data.config.last_synced_at || null);
          if (data.config.custom_tables && data.config.custom_tables.length > 0) {
            onSyncSuccess?.(data.config.custom_tables);
          }
        }
      })
      .catch((err) => console.error("Erro ao carregar config Sheets:", err));
  }, [organizationId]);

  const handleDownloadTemplate = () => {
    const url = `/api/b2b/template-sheet?organizationId=${organizationId}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelo_precos_b2b.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSync = async () => {
    if (!sheetUrl.trim()) {
      setMessage({ type: "error", text: "Cole o link completo da planilha do Google Sheets." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/b2b/sync-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          organizationId, 
          sheetId: sheetUrl.trim(), 
          tabName: tabName.trim() 
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setLastSyncedAt(new Date().toISOString());
        if (data.customTables && data.customTables.length > 0) {
          onSyncSuccess?.(data.customTables);
        }
      } else {
        setMessage({ type: "error", text: data.error || data.message || "Falha na sincronização." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erro de conexão ao sincronizar." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface)] space-y-5 shadow-sm">
        
        {/* Header do Card com Botões de Ajuda e Download */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--dash-text-primary)]">
                Integração Google Sheets (Tabelas de Atacado)
              </h3>
              <p className="text-xs text-[var(--dash-text-secondary)] mt-0.5">
                Sincronize 4 faixas de preços por SKU mantendo o cadastro base do catálogo intocado.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              title="Baixar planilha pré-preenchida com seus produtos"
            >
              <Download size={13} />
              <span>Baixar Modelo (.CSV)</span>
            </button>

            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface-secondary)] text-[var(--dash-text-primary)] hover:border-cyan-500/40 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <BookOpen size={13} className="text-cyan-400" />
              <span>Guia Passo a Passo</span>
            </button>
          </div>
        </div>

        {/* Formulário de Configuração */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-[var(--dash-text-primary)] flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-cyan-500" />
              <span>Link Completo da Planilha (Google Sheets):</span>
            </label>
            <input
              type="text"
              className="w-full text-xs rounded-xl border border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface-secondary)] text-[var(--dash-text-primary)] px-3.5 py-2.5 focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
              placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
            />
            <span className="text-[11px] text-[var(--dash-text-muted)] block">
              Basta copiar e colar o link completo da planilha do seu navegador.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--dash-text-primary)]">
              Nome da Aba:
            </label>
            <input
              type="text"
              className="w-full text-xs rounded-xl border border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface-secondary)] text-[var(--dash-text-primary)] px-3.5 py-2.5 focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
              placeholder="Precos"
              value={tabName}
              onChange={(e) => setTabName(e.target.value)}
            />
            <span className="text-[11px] text-[var(--dash-text-muted)] block">
              Nome da aba na planilha (ex: <code>Precos</code>)
            </span>
          </div>
        </div>

        {/* Dica de Estrutura Oficial de Colunas */}
        <div className="p-3.5 rounded-xl bg-[var(--dash-surface-secondary)] border border-slate-200/80 dark:border-white/10 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs text-[var(--dash-text-secondary)] space-y-0.5">
            <span className="font-semibold text-[var(--dash-text-primary)] block">
              Estrutura oficial das colunas da planilha:
            </span>
            <p className="font-mono text-[11px] text-cyan-600 dark:text-cyan-400">
              PRODUTO | SKU (ID) | PREÇO SUGERIDO (VAREJO) | VALOR 1 | VALOR 2 | VALOR 3 | VALOR 4
            </p>
          </div>
        </div>

        {message && (
          <div className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
            message.type === "success" 
              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
          }`}>
            {message.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Footer com Ações e Status */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200/60 dark:border-white/5">
          <div className="text-xs text-[var(--dash-text-muted)]">
            {lastSyncedAt ? (
              <span>
                Última sincronização: <strong className="text-emerald-500">{new Date(lastSyncedAt).toLocaleDateString("pt-BR")} às {new Date(lastSyncedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</strong>
              </span>
            ) : (
              <span>Nenhuma sincronização realizada ainda.</span>
            )}
          </div>

          <button
            onClick={handleSync}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Sincronizando..." : "Sincronizar Planilha Agora"}</span>
          </button>
        </div>
      </div>

      {/* Modal de Instruções Passo a Passo */}
      <B2bSheetsInstructionsModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        onDownloadTemplate={handleDownloadTemplate}
      />
    </>
  );
};
