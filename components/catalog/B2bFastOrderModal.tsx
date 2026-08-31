"use client";

import React from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShoppingBag,
  Send,
  Search,
  Loader2,
  FileText,
} from "lucide-react";
import { formatPrice } from "./utils";
import { useB2bFastOrder, CatalogProductItem } from "./hooks/useB2bFastOrder";
import { B2bFastOrderProductRow } from "./b2b/B2bFastOrderProductRow";
import { B2bFastOrderSuccessView } from "./b2b/B2bFastOrderSuccessView";

interface B2bFastOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: CatalogProductItem[];
  b2bPrices: Record<string, number>;
  clientToken: string;
  companyName: string;
  slug: string;
  whatsappNumber?: string | null;
}

export const B2bFastOrderModal: React.FC<B2bFastOrderModalProps> = ({
  isOpen,
  onClose,
  products,
  b2bPrices,
  clientToken,
  companyName,
  whatsappNumber,
}) => {
  const {
    quantities,
    notes,
    setNotes,
    searchQuery,
    setSearchQuery,
    loading,
    showNotes,
    setShowNotes,
    orderSuccess,
    handleQuantityChange,
    selectedItems,
    totalQuantity,
    totalAmount,
    totalMarketAmount,
    totalEconomy,
    filteredProducts,
    whatsappFormattedText,
    handleSubmitOrder,
    handleSendToWhatsApp,
    handleResetAndClose,
  } = useB2bFastOrder({
    products,
    b2bPrices,
    clientToken,
    companyName,
    whatsappNumber,
    onClose,
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-2xl bg-[var(--public-card-bg)] border border-[var(--public-card-border)] text-[var(--public-text-main)] rounded-2xl shadow-2xl relative flex flex-col max-h-[92vh] overflow-hidden"
        >
          {/* Header do Modal */}
          <div className="p-5 sm:p-6 border-b border-[var(--public-card-border)] flex items-center justify-between gap-4 shrink-0 bg-[var(--public-bg)]/40">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 shrink-0">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base sm:text-lg text-[var(--public-text-main)] leading-tight truncate">
                    Pedido em Lote Atacado
                  </h3>
                  <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-full bg-emerald-500 text-white uppercase tracking-wider whitespace-nowrap shrink-0">
                    B2B
                  </span>
                </div>
                <p className="text-xs text-[var(--public-text-dim)] truncate mt-0.5 font-medium">
                  {companyName} • <span className="text-emerald-500 font-semibold">Condições Comerciais Exclusivas</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleResetAndClose}
              className="p-2 rounded-full hover:bg-[var(--public-bg)] text-[var(--public-text-dim)] hover:text-[var(--public-text-main)] transition-colors shrink-0 cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!orderSuccess ? (
            <>
              {/* Barra de Busca de Produtos */}
              <div className="p-4 sm:px-6 border-b border-[var(--public-card-border)] bg-[var(--public-bg)]/20 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 text-[var(--public-text-dim)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar veículo ou peça por nome ou SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[var(--public-bg)] border border-[var(--public-card-border)] text-[var(--public-text-main)] placeholder-[var(--public-text-dim)] focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--public-text-dim)] hover:text-[var(--public-text-main)] cursor-pointer"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>

              {/* Lista de Produtos em Grade Rápida */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5 divide-y-0">
                {filteredProducts.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[var(--public-text-dim)]">
                    Nenhum produto encontrado para a busca "{searchQuery}".
                  </div>
                ) : (
                  filteredProducts.map((p) => {
                    const finalPrice = b2bPrices[p.sku || ""] ?? p.price ?? 0;
                    const qty = quantities[p.id] || 0;

                    return (
                      <B2bFastOrderProductRow
                        key={p.id}
                        product={p}
                        quantity={qty}
                        finalPrice={finalPrice}
                        onQuantityChange={handleQuantityChange}
                      />
                    );
                  })
                )}
              </div>

              {/* Observações Opcionais */}
              <div className="px-5 sm:px-6 py-2 border-t border-[var(--public-card-border)] bg-[var(--public-bg)]/30 shrink-0">
                {!showNotes ? (
                  <button
                    onClick={() => setShowNotes(true)}
                    className="text-[11px] font-semibold text-[var(--public-text-dim)] hover:text-emerald-500 flex items-center gap-1.5 transition-colors cursor-pointer py-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>+ Adicionar observações para o faturamento (opcional)</span>
                  </button>
                ) : (
                  <div className="space-y-1.5 py-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[var(--public-text-dim)]">Observações do Pedido:</span>
                      <button
                        onClick={() => setShowNotes(false)}
                        className="text-xs text-[var(--public-text-dim)] hover:text-[var(--public-text-main)] cursor-pointer"
                      >
                        Ocultar
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ex: Entregar na filial 2, faturar com prazo negociado..."
                      className="w-full text-xs rounded-xl bg-[var(--public-bg)] border border-[var(--public-card-border)] text-[var(--public-text-main)] p-2.5 focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Footer / Resumo e Finalização */}
              <div className="p-5 sm:p-6 border-t border-[var(--public-card-border)] bg-[var(--public-card-bg)] shrink-0 space-y-4 shadow-lg">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold text-[var(--public-text-dim)] block">
                      Volume Total:
                    </span>
                    <span className="text-sm font-black text-[var(--public-text-main)]">
                      {totalQuantity} {totalQuantity === 1 ? "unidade" : "unidades"} ({selectedItems.length} {selectedItems.length === 1 ? "item" : "itens"})
                    </span>
                  </div>

                  <div className="text-right">
                    {totalEconomy > 0 && (
                      <div className="flex items-center justify-end gap-1.5 text-xs text-[var(--public-text-dim)] mb-0.5">
                        <span className="text-[10px] uppercase opacity-70">Mercado:</span>
                        <span className="line-through">{formatPrice(totalMarketAmount)}</span>
                      </div>
                    )}
                    <span className="text-xl sm:text-2xl font-black text-emerald-500 tracking-tight block">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>
                </div>

                {totalEconomy > 0 && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center justify-between">
                    <span>✨ Economia neste Pedido:</span>
                    <span className="font-extrabold">{formatPrice(totalEconomy)} (-{Math.round((totalEconomy / totalMarketAmount) * 100)}%)</span>
                  </div>
                )}

                <button
                  onClick={handleSubmitOrder}
                  disabled={loading || selectedItems.length === 0}
                  className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm tracking-wide transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processando Pedido Atacadista...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Finalizar Pedido B2B</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Tela de Sucesso Híbrida */
            <B2bFastOrderSuccessView
              orderSuccess={orderSuccess}
              whatsappFormattedText={whatsappFormattedText}
              whatsappNumber={whatsappNumber}
              onSendToWhatsApp={handleSendToWhatsApp}
              onResetAndClose={handleResetAndClose}
            />
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
