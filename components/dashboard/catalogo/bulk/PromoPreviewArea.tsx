import { AlertCircle } from "lucide-react";

export default function PromoPreviewArea({
  previewData,
  isCatalogCaas,
  targetChannel,
  actionType
}: any) {
  return (
    <div className="space-y-2 bg-[var(--dash-surface-secondary)] border border-[var(--dash-border)] p-5 rounded-xl">
      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-secondary)] flex items-center justify-between">
        <span>Simulação do Reajuste</span>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary font-bold">
          {previewData.affectedCount} produto(s) afetado(s)
        </span>
      </h4>

      {previewData.affectedCount > 0 ? (
        <div className="space-y-2 pt-2">
          {!isCatalogCaas ? (
            <div className="text-[11px] font-bold text-[var(--dash-text-muted)] uppercase grid grid-cols-3 border-b border-[var(--dash-border)] pb-1.5 px-2">
              <span>Nome do Produto</span>
              <span className="text-right">Preço Atual</span>
              <span className="text-right">Novo Preço</span>
            </div>
          ) : (
            <div className="text-[11px] font-bold text-[var(--dash-text-muted)] uppercase flex justify-between border-b border-[var(--dash-border)] pb-1.5 px-2">
              <span>Nome do Produto</span>
              <span>Simulação de Reajuste (B2C / B2B)</span>
            </div>
          )}
          <div className="divide-y divide-[var(--dash-border)]">
            {previewData.items.map((item: any) => {
              if (isCatalogCaas) {
                return (
                  <div key={item.id} className="py-2 px-2 hover:bg-[var(--dash-hover-bg)]/30 rounded-lg">
                    <div className="flex justify-between items-start gap-4">
                      <span className="font-semibold truncate text-xs flex-1 text-left">{item.name}</span>
                      <div className="text-right space-y-1">
                        {(targetChannel === "b2c" || targetChannel === "both") && item.currentB2c > 0 && (
                          <div className="flex items-center justify-end gap-1 text-[10px]">
                            <span className="text-[8px] text-[var(--dash-text-muted)] uppercase font-bold">Varejo:</span>
                            <span className="text-[var(--dash-text-secondary)] line-through opacity-60">R$ {item.currentB2c.toFixed(2)}</span>
                            <span className="font-bold text-emerald-500">R$ {item.newB2c.toFixed(2)}</span>
                          </div>
                        )}
                        {(targetChannel === "b2b" || targetChannel === "both") && item.currentB2b > 0 && (
                          <div className="flex items-center justify-end gap-1 text-[10px]">
                            <span className="text-[8px] text-emerald-600 uppercase font-bold">Atacado:</span>
                            <span className="text-[var(--dash-text-secondary)] line-through opacity-60">R$ {item.currentB2b.toFixed(2)}</span>
                            <span className="font-bold text-emerald-500">R$ {item.newB2b.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // Render padrão para catálogo não-CaaS
              return (
                <div key={item.id} className="grid grid-cols-3 text-xs py-2 px-2 items-center hover:bg-[var(--dash-hover-bg)]/30 rounded-lg">
                  <span className="font-semibold truncate pr-4">{item.name}</span>
                  <span className="text-right text-[var(--dash-text-secondary)]">
                    R$ {item.currentB2c.toFixed(2)}
                  </span>
                  <span className="text-right font-bold text-emerald-500 flex items-center justify-end gap-1">
                    {actionType === "apply_promo" && item.compareAtPrice === null && (
                      <span className="line-through text-[var(--dash-text-muted)] text-[10px] font-normal mr-1">
                        R$ {item.currentB2c.toFixed(2)}
                      </span>
                    )}
                    R$ {item.newB2c.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
          {previewData.affectedCount > 5 && (
            <p className="text-[10px] text-[var(--dash-text-muted)] text-center pt-2 italic">
              E mais {previewData.affectedCount - 5} produtos serão reajustados...
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-[var(--dash-text-muted)]">
          <AlertCircle className="opacity-30 mb-2" size={24} />
          <p className="text-xs">Nenhum produto atende aos critérios do escopo selecionado.</p>
        </div>
      )}
    </div>
  );
}
