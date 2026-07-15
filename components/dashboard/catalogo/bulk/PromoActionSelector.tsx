import { Tags, TrendingUp, RefreshCw } from "lucide-react";

export default function PromoActionSelector({ actionType, setActionType }: { actionType: string, setActionType: (a: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-secondary)]">
        Qual tipo de ajuste deseja fazer?
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setActionType("apply_promo")}
          className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all hover:border-primary/50 ${
            actionType === "apply_promo" 
              ? "border-primary bg-primary/5 shadow-md shadow-primary/5 font-bold" 
              : "border-[var(--dash-border)] bg-[var(--dash-surface-secondary)]"
          }`}
        >
          <Tags className={`h-5 w-5 ${actionType === "apply_promo" ? "text-primary" : "text-[var(--dash-text-muted)]"}`} />
          <span className="text-sm font-semibold">Aplicar Promoção</span>
          <span className="text-[10px] text-[var(--dash-text-muted)] leading-tight">
            Aplica desconto e preenche Preço De/Por.
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActionType("apply_markup")}
          className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all hover:border-emerald-500/50 ${
            actionType === "apply_markup" 
              ? "border-emerald-500 bg-emerald-500/5 shadow-md shadow-emerald-500/5 font-bold" 
              : "border-[var(--dash-border)] bg-[var(--dash-surface-secondary)]"
          }`}
        >
          <TrendingUp className={`h-5 w-5 ${actionType === "apply_markup" ? "text-emerald-500" : "text-[var(--dash-text-muted)]"}`} />
          <span className="text-sm font-semibold">Reajuste de Preço</span>
          <span className="text-[10px] text-[var(--dash-text-muted)] leading-tight">
            Altera preços finais direto (sem criar promoção).
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActionType("revert")}
          className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all hover:border-amber-500/50 ${
            actionType === "revert" 
              ? "border-amber-500 bg-amber-500/5 shadow-md shadow-amber-500/5 font-bold" 
              : "border-[var(--dash-border)] bg-[var(--dash-surface-secondary)]"
          }`}
        >
          <RefreshCw className={`h-5 w-5 ${actionType === "revert" ? "text-amber-500" : "text-[var(--dash-text-muted)]"}`} />
          <span className="text-sm font-semibold">Limpar Promoções</span>
          <span className="text-[10px] text-[var(--dash-text-muted)] leading-tight">
            Restaura os valores originais e limpa tags.
          </span>
        </button>
      </div>
    </div>
  );
}
