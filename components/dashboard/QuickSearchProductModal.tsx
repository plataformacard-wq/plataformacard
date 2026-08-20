"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, ExternalLink, ArrowRight, Tag, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export interface QuickSearchProduct {
  id: string;
  name: string;
  sku?: string | null;
  image_url?: string | null;
  stock_quantity?: number | null;
  is_in_stock?: boolean | null;
  price?: number | null;
  promotional_price?: number | null;
  categories?: { name?: string } | null;
  category_name?: string | null;
}

interface QuickSearchProductModalProps {
  product: QuickSearchProduct | null;
  onClose: () => void;
}

export function QuickSearchProductModal({ product, onClose }: QuickSearchProductModalProps) {
  const router = useRouter();

  const qty = product?.stock_quantity ?? 0;
  const isInStock = (product?.is_in_stock ?? true) && qty > 0;
  const isLowStock = isInStock && qty <= 5;
  const isOutOfStock = !product?.is_in_stock || qty <= 0;

  const priceFormatted = product?.price != null
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price)
    : "R$ 0,00";

  const promoPriceFormatted = product?.promotional_price != null && product.promotional_price > 0
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.promotional_price)
    : null;

  const categoriesProp: any = product?.categories;
  const categoryName = (Array.isArray(categoriesProp) ? categoriesProp[0]?.name : categoriesProp?.name) || product?.category_name || "Sem categoria";

  const handleNavigateToStock = () => {
    if (!product) return;
    onClose();
    router.push(`/dashboard/estoque?search=${encodeURIComponent(product.name)}`);
  };

  const handleNavigateToCatalog = () => {
    onClose();
    router.push(`/dashboard/catalogo`);
  };

  return (
    <AnimatePresence>
      {product && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-lg overflow-hidden rounded-[27px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-2xl"
          >
          {/* Botão Fechar */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-[var(--dash-text-muted)] hover:bg-[var(--dash-hover-bg)] hover:text-[var(--dash-text-primary)] transition-all"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Foto Miniatura do Produto */}
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[27px] border border-[var(--dash-border)] bg-[var(--dash-bg)] flex items-center justify-center shadow-inner">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Package size={36} className="text-[var(--dash-text-muted)] opacity-50" />
              )}
            </div>

            {/* Informações Principais */}
            <div className="flex flex-1 flex-col text-center sm:text-left min-w-0">
              {/* Badge de Status */}
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
                    <XCircle size={12} /> 🔴 Esgotado
                  </span>
                ) : isLowStock ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <AlertTriangle size={12} /> 🟡 Estoque Baixo ({qty} un)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <CheckCircle2 size={12} /> 🟢 Em Estoque ({qty} un)
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-[var(--dash-text-primary)] leading-tight truncate">
                {product.name}
              </h3>

              <div className="mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-[var(--dash-text-muted)]">
                {product.sku && (
                  <span className="font-mono bg-[var(--dash-hover-bg)] px-2 py-0.5 rounded text-[11px]">
                    SKU: {product.sku}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Tag size={12} /> {categoryName}
                </span>
              </div>

              {/* Preço */}
              <div className="mt-3 flex items-baseline justify-center sm:justify-start gap-2">
                {promoPriceFormatted ? (
                  <>
                    <span className="text-xl font-extrabold text-emerald-500">
                      {promoPriceFormatted}
                    </span>
                    <span className="text-xs text-[var(--dash-text-muted)] line-through">
                      {priceFormatted}
                    </span>
                  </>
                ) : (
                  <span className="text-xl font-extrabold text-[var(--dash-text-primary)]">
                    {priceFormatted}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 border-t border-[var(--dash-border)]/50 pt-4">
            <button
              onClick={handleNavigateToStock}
              className="w-full flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary/90 transition-all shadow-md active:scale-95"
            >
              Ver no Estoque
              <ArrowRight size={14} />
            </button>
            <button
              onClick={handleNavigateToCatalog}
              className="w-full flex-1 flex items-center justify-center gap-2 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-hover-bg)] px-4 py-2.5 text-xs font-bold text-[var(--dash-text-primary)] hover:bg-[var(--dash-border)] transition-all active:scale-95"
            >
              Ver no Catálogo
              <ExternalLink size={14} />
            </button>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
