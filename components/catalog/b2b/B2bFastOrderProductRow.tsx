import React from "react";
import { formatPrice } from "../utils";
import { CatalogProductItem } from "../hooks/useB2bFastOrder";

interface B2bFastOrderProductRowProps {
  product: CatalogProductItem;
  quantity: number;
  finalPrice: number;
  onQuantityChange: (productId: string, val: number) => void;
}

export const B2bFastOrderProductRow: React.FC<B2bFastOrderProductRowProps> = ({
  product,
  quantity,
  finalPrice,
  onQuantityChange,
}) => {
  const isSelected = quantity > 0;

  return (
    <div
      className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
        isSelected
          ? "bg-emerald-500/5 border-emerald-500/40 shadow-sm"
          : "bg-[var(--public-bg)]/60 border-[var(--public-card-border)] hover:border-emerald-500/20"
      }`}
    >
      {/* Imagem + Infos */}
      <div className="flex items-center gap-3 min-w-0">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-12 h-12 object-cover rounded-xl border border-[var(--public-card-border)] shrink-0 bg-[var(--public-card-bg)]"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-[var(--public-card-bg)] border border-[var(--public-card-border)] flex items-center justify-center text-[10px] font-mono text-[var(--public-text-dim)] shrink-0">
            SKU
          </div>
        )}

        <div className="min-w-0">
          <h4 className="font-bold text-xs sm:text-sm text-[var(--public-text-main)] truncate">
            {product.name}
          </h4>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {product.sku && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[var(--public-bg)] text-[var(--public-text-dim)] border border-[var(--public-card-border)]">
                {product.sku}
              </span>
            )}
            <span className="text-xs font-black text-emerald-500">
              {formatPrice(finalPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Contador de Quantidade Moderno */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onQuantityChange(product.id, quantity - 1)}
          disabled={quantity === 0}
          className="w-8 h-8 rounded-xl border border-[var(--public-card-border)] bg-[var(--public-card-bg)] text-[var(--public-text-main)] font-black text-sm hover:bg-[var(--public-bg)] active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer shadow-sm"
        >
          -
        </button>
        <input
          type="number"
          min="0"
          className="w-12 h-8 text-center text-xs font-black rounded-xl border border-[var(--public-card-border)] bg-[var(--public-bg)] text-[var(--public-text-main)] focus:outline-none focus:border-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          value={quantity === 0 ? "" : quantity}
          placeholder="0"
          onChange={(e) =>
            onQuantityChange(
              product.id,
              parseInt(e.target.value || "0", 10)
            )
          }
        />
        <button
          onClick={() => onQuantityChange(product.id, quantity + 1)}
          className="w-8 h-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white font-black text-sm active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-sm"
        >
          +
        </button>
      </div>
    </div>
  );
};
