"use client";

import React, { useState } from "react";
import { 
  Store, 
  CheckCircle2, 
  Clock, 
  Power, 
  Sparkles,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { BusinessHours, getBusinessStatus } from "@/lib/utils/time";

interface StoreQuickStatusCardProps {
  businessHours: BusinessHours;
  organizationId: string | null;
  onUpdateOverride: (newOverride: "open" | "closed" | null) => Promise<void>;
}

export const StoreQuickStatusCard: React.FC<StoreQuickStatusCardProps> = ({
  businessHours,
  organizationId,
  onUpdateOverride,
}) => {
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const status = getBusinessStatus(businessHours);
  const currentOverride = businessHours.manual_override ?? null;

  const handleSelectMode = async (mode: "open" | "closed" | null) => {
    if (updating || mode === currentOverride) return;

    setUpdating(true);
    setFeedback(null);

    try {
      await onUpdateOverride(mode);
      const msg = 
        mode === "open" ? "Loja definida como ABERTA imediatamente!" :
        mode === "closed" ? "Loja definida como FECHADA temporariamente!" :
        "Loja configurada para seguir a Grade Automática!";
      
      setFeedback(msg);
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      console.error("Erro ao alternar status da loja:", err);
      setFeedback("Erro ao atualizar status. Tente novamente.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface)] space-y-4 shadow-sm relative overflow-hidden">
      
      {/* Topo do Card: Título + Badge de Status em Tempo Real */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border shrink-0 transition-colors ${
            status.isOpenNow
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
          }`}>
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-[var(--dash-text-primary)]">
                Status Operacional da Loja
              </h2>
              {updating && <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />}
            </div>
            <p className="text-xs text-[var(--dash-text-secondary)] mt-0.5">
              Abra ou feche a loja instantaneamente em 1 clique, sem precisar configurar horários.
            </p>
          </div>
        </div>

        {/* Badge de Status Atual */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className={`px-3 py-1 text-xs font-bold rounded-full border uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all ${
            status.isOpenNow
              ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30 ring-2 ring-emerald-500/10"
              : "bg-rose-500/15 text-rose-400 border-rose-500/30 ring-2 ring-rose-500/10"
          }`}>
            <span className={`w-2 h-2 rounded-full ${status.isOpenNow ? "bg-emerald-500 animate-pulse" : "bg-rose-400"}`} />
            <span>{status.message}</span>
          </span>
        </div>
      </div>

      {/* Seletor Segmentado de 3 Modos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        
        {/* Modo 1: Forçar Aberto */}
        <button
          type="button"
          onClick={() => handleSelectMode("open")}
          disabled={updating}
          className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer active:scale-98 ${
            currentOverride === "open"
              ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30 shadow-sm"
              : "border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface-secondary)] hover:border-emerald-500/40 text-[var(--dash-text-secondary)]"
          }`}
        >
          <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
            currentOverride === "open"
              ? "bg-emerald-500 text-white"
              : "bg-emerald-500/10 text-emerald-500"
          }`}>
            <Power className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs text-[var(--dash-text-primary)] flex items-center gap-1.5">
              <span>🟢 Aberto Agora</span>
              {currentOverride === "open" && <CheckCircle2 size={13} className="text-emerald-500" />}
            </div>
            <p className="text-[11px] text-[var(--dash-text-muted)] mt-0.5 leading-snug">
              Força a loja aberta 24h ou para plantão imediato.
            </p>
          </div>
        </button>

        {/* Modo 2: Automático pela Grade */}
        <button
          type="button"
          onClick={() => handleSelectMode(null)}
          disabled={updating}
          className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer active:scale-98 ${
            currentOverride === null
              ? "border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500/30 shadow-sm"
              : "border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface-secondary)] hover:border-cyan-500/40 text-[var(--dash-text-secondary)]"
          }`}
        >
          <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
            currentOverride === null
              ? "bg-cyan-500 text-white"
              : "bg-cyan-500/10 text-cyan-400"
          }`}>
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs text-[var(--dash-text-primary)] flex items-center gap-1.5">
              <span>🕒 Grade Automática</span>
              {currentOverride === null && <CheckCircle2 size={13} className="text-cyan-400" />}
            </div>
            <p className="text-[11px] text-[var(--dash-text-muted)] mt-0.5 leading-snug">
              Abre e fecha conforme a tabela de horários abaixo.
            </p>
          </div>
        </button>

        {/* Modo 3: Forçar Fechado */}
        <button
          type="button"
          onClick={() => handleSelectMode("closed")}
          disabled={updating}
          className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer active:scale-98 ${
            currentOverride === "closed"
              ? "border-rose-500 bg-rose-500/10 ring-1 ring-rose-500/30 shadow-sm"
              : "border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface-secondary)] hover:border-rose-500/40 text-[var(--dash-text-secondary)]"
          }`}
        >
          <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
            currentOverride === "closed"
              ? "bg-rose-500 text-white"
              : "bg-rose-500/10 text-rose-400"
          }`}>
            <Power className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs text-[var(--dash-text-primary)] flex items-center gap-1.5">
              <span>🔴 Fechado Agora</span>
              {currentOverride === "closed" && <CheckCircle2 size={13} className="text-rose-400" />}
            </div>
            <p className="text-[11px] text-[var(--dash-text-muted)] mt-0.5 leading-snug">
              Pausa ou recesso imediato de emergência.
            </p>
          </div>
        </button>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </motion.div>
      )}
    </div>
  );
};
