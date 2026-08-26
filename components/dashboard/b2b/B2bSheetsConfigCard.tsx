"use client";

import React, { useState, useEffect } from "react";
import { FileSpreadsheet, RefreshCw, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";

interface B2bSheetsConfigCardProps {
  organizationId: string;
}

export const B2bSheetsConfigCard: React.FC<B2bSheetsConfigCardProps> = ({ organizationId }) => {
  const [sheetId, setSheetId] = useState("");
  const [tabName, setTabName] = useState("Precos");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!organizationId) return;

    fetch(`/api/b2b/sync-sheets?organizationId=${organizationId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config) {
          setSheetId(data.config.sheet_id || "");
          setTabName(data.config.tab_name || "Precos");
          setLastSyncedAt(data.config.last_synced_at || null);
        }
      })
      .catch((err) => console.error("Erro ao carregar config Sheets:", err));
  }, [organizationId]);

  const handleSync = async () => {
    if (!sheetId.trim()) {
      setMessage({ type: "error", text: "Informe o ID da planilha do Google Sheets." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/b2b/sync-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, sheetId: sheetId.trim(), tabName: tabName.trim() })
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setLastSyncedAt(new Date().toISOString());
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
    <div className="p-6 rounded-2xl border border-[var(--dash-border-subtle)] bg-[var(--dash-surface)] space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-[var(--dash-text-primary)]">
              Integração Google Sheets (Tabelas X, Y, Z)
            </h3>
            <p className="text-xs text-[var(--dash-text-muted)] mt-0.5">
              Sincronize os preços atacadistas por SKU mantendo o cadastro base do Bling intocado.
            </p>
          </div>
        </div>

        {lastSyncedAt && (
          <div className="text-right text-xs text-[var(--dash-text-muted)]">
            <span className="block font-medium text-emerald-400">Ativa</span>
            Última sync: {new Date(lastSyncedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="md:col-span-2 space-y-1">
          <label className="text-xs font-semibold text-[var(--dash-text-secondary)]">
            ID da Planilha (Google Sheets ID):
          </label>
          <input
            type="text"
            className="w-full text-xs rounded-xl border border-[var(--dash-border-subtle)] bg-[var(--dash-surface-element)] text-[var(--dash-text-primary)] px-3 py-2 focus:outline-none focus:border-emerald-500/50"
            placeholder="Ex: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
            value={sheetId}
            onChange={(e) => setSheetId(e.target.value)}
          />
          <span className="text-[11px] text-[var(--dash-text-muted)] block">
            Copie o código que fica no link da planilha: `docs.google.com/spreadsheets/d/<b>ID_AQUI</b>/edit`
          </span>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[var(--dash-text-secondary)]">
            Nome da Aba:
          </label>
          <input
            type="text"
            className="w-full text-xs rounded-xl border border-[var(--dash-border-subtle)] bg-[var(--dash-surface-element)] text-[var(--dash-text-primary)] px-3 py-2 focus:outline-none focus:border-emerald-500/50"
            placeholder="Precos"
            value={tabName}
            onChange={(e) => setTabName(e.target.value)}
          />
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
          message.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
        }`}>
          {message.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-[var(--dash-border-subtle)]">
        <a
          href="https://docs.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-1"
        >
          <span>Como compartilhar a planilha pública</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        <button
          onClick={handleSync}
          disabled={loading}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Sincronizando..." : "Sincronizar Planilha Agora"}</span>
        </button>
      </div>
    </div>
  );
};
