import React from "react";
import { Sparkles, Lock } from "lucide-react";
import { FeatureKey } from "@/lib/plans/feature-matrix";

interface VendedoresUpsellBannerProps {
  sellerLimit: number;
  onRequestUpgrade: (feature: FeatureKey) => void;
}

export default function VendedoresUpsellBanner({
  sellerLimit,
  onRequestUpgrade,
}: VendedoresUpsellBannerProps) {
  if (sellerLimit !== 1) return null;

  return (
    <div className="relative overflow-hidden rounded-[27px] border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider">
            <Lock size={12} /> Plano Starter (1 Usuário - Gestor)
          </div>
          <h3 className="text-base font-bold text-[var(--dash-text-primary)]">
            Adicione Colaboradores e Vendedores à sua Equipe
          </h3>
          <p className="text-xs text-[var(--dash-text-muted)] leading-relaxed max-w-2xl">
            Seu plano atual permite apenas 1 usuário (o Gestor). Faça o upgrade para o plano <strong className="text-amber-400">PRO</strong> (até 3 colaboradores) ou <strong className="text-amber-400">Sales Team</strong> (até 10 colaboradores) para criar perfis para seus vendedores.
          </p>
        </div>
        <button
          onClick={() => onRequestUpgrade("sales_team")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-gradient-to-r from-amber-500 to-emerald-500 text-[var(--dash-text-primary)] font-extrabold text-xs shadow-md transition-transform active:scale-95 whitespace-nowrap"
        >
          <Sparkles size={14} /> Fazer Upgrade de Plano
        </button>
      </div>
    </div>
  );
}
