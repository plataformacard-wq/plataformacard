export default function PromoValueConfig({
  actionType,
  valueType,
  setValueType,
  adjustValue,
  setAdjustValue,
  isCatalogCaas,
  targetChannel,
  setTargetChannel
}: any) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[var(--dash-surface-secondary)] border border-[var(--dash-border)] p-5 rounded-lg">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-secondary)]">
            Tipo de Ajuste
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setValueType("percentage")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                valueType === "percentage"
                  ? "bg-primary border-primary text-white"
                  : "border-[var(--dash-border)] hover:bg-[var(--dash-hover-bg)]"
              }`}
            >
              Porcentagem (%)
            </button>
            <button
              type="button"
              onClick={() => setValueType("fixed")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                valueType === "fixed"
                  ? "bg-primary border-primary text-white"
                  : "border-[var(--dash-border)] hover:bg-[var(--dash-hover-bg)]"
              }`}
            >
              Valor Fixo (R$)
            </button>
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-secondary)] flex items-center justify-between">
            <span>
              {actionType === "apply_promo" ? "Porcentagem de Desconto" : "Valor do Acréscimo"}
            </span>
            <span className="text-[10px] text-[var(--dash-text-muted)] italic">
              {actionType === "apply_promo" ? "Ex: 10 = 10% de desconto" : "Ex: 5 = adiciona R$ 5"}
            </span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--dash-text-secondary)]">
              {valueType === "percentage" ? "%" : "R$"}
            </span>
            <input
              type="number"
              min="0.01"
              step="any"
              value={adjustValue}
              onChange={(e) => setAdjustValue(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-lg pl-10 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Canal de Preço (Apenas para CaaS) */}
      {isCatalogCaas && (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-secondary)]">
            Canal de Preço a Reajustar
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTargetChannel("both")}
              className={`flex-1 py-3 text-xs font-bold rounded-lg border transition-all ${
                targetChannel === "both"
                  ? "bg-primary border-primary text-white font-bold"
                  : "border-[var(--dash-border)] bg-[var(--dash-surface-secondary)] hover:bg-[var(--dash-hover-bg)]"
              }`}
            >
              Ambos (B2C & B2B)
            </button>
            <button
              type="button"
              onClick={() => setTargetChannel("b2c")}
              className={`flex-1 py-3 text-xs font-bold rounded-lg border transition-all ${
                targetChannel === "b2c"
                  ? "bg-primary border-primary text-white font-bold"
                  : "border-[var(--dash-border)] bg-[var(--dash-surface-secondary)] hover:bg-[var(--dash-hover-bg)]"
              }`}
            >
              Apenas Varejo (B2C)
            </button>
            <button
              type="button"
              onClick={() => setTargetChannel("b2b")}
              className={`flex-1 py-3 text-xs font-bold rounded-lg border transition-all ${
                targetChannel === "b2b"
                  ? "bg-primary border-primary text-white font-bold"
                  : "border-[var(--dash-border)] bg-[var(--dash-surface-secondary)] hover:bg-[var(--dash-hover-bg)]"
              }`}
            >
              Apenas Atacado (B2B)
            </button>
          </div>
        </div>
      )}
    </>
  );
}
