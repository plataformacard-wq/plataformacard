"use client";

import React, { useState } from "react";
import { Lock, Sparkles, Building2, FileSpreadsheet, ShieldCheck, ArrowRight } from "lucide-react";
import UpgradeModal from "@/components/dashboard/upsell/UpgradeModal";

export const B2bUpgradeGateCard: React.FC = () => {
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  return (
    <>
      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        feature="b2b_portal"
        targetPlan="sales_team"
      />

      <div className="p-8 sm:p-12 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface)] text-center space-y-6 max-w-3xl mx-auto shadow-2xl relative overflow-hidden my-6">
        {/* Glow de fundo */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-lg">
          <Building2 className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recurso Exclusivo Sales Team & Enterprise</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[var(--dash-text-primary)] tracking-tight">
            Portal B2B & Vendas no Atacado
          </h2>

          <p className="text-xs sm:text-sm text-[var(--dash-text-secondary)] leading-relaxed">
            Crie tabelas de preços personalizadas por cliente, sincronize estoques e valores via Google Sheets em tempo real, proteja seus acessos com WhatsApp OTP e receba pedidos em lote.
          </p>
        </div>

        {/* Benefícios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto pt-2">
          <div className="p-3.5 rounded-xl border border-slate-200/60 dark:border-white/5 bg-[var(--dash-surface-secondary)]/50 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--dash-text-primary)]">
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              <span>Google Sheets Sync</span>
            </div>
            <p className="text-[11px] text-[var(--dash-text-muted)]">
              Preços por SKU atualizados em tempo real via planilha.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200/60 dark:border-white/5 bg-[var(--dash-surface-secondary)]/50 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--dash-text-primary)]">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>WhatsApp OTP & Segurança</span>
            </div>
            <p className="text-[11px] text-[var(--dash-text-muted)]">
              Links mágicos com código de validação de dispositivo.
            </p>
          </div>
        </div>

        <div className="pt-4 max-w-sm mx-auto">
          <button
            onClick={() => setIsUpgradeOpen(true)}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm tracking-wide transition-all shadow-xl hover:shadow-emerald-500/25 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Desbloquear Portal B2B</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};
