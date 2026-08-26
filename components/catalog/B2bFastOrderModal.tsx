"use client";

import React, { useState } from "react";
import { X, ShoppingBag, Send, CheckCircle2, AlertCircle } from "lucide-react";

interface CatalogProductItem {
  id: string;
  name: string;
  sku?: string;
  price: number;
  image_url?: string;
}

interface B2bFastOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: CatalogProductItem[];
  b2bPrices: Record<string, number>;
  clientToken: string;
  companyName: string;
  slug: string;
}

export const B2bFastOrderModal: React.FC<B2bFastOrderModalProps> = ({
  isOpen,
  onClose,
  products,
  b2bPrices,
  clientToken,
  companyName,
  slug
}) => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ orderId: string; blingOrderId?: string; totalAmount: number } | null>(null);

  if (!isOpen) return null;

  const handleQuantityChange = (productId: string, val: number) => {
    setQuantities(prev => ({ ...prev, [productId]: Math.max(0, val) }));
  };

  const selectedItems = products
    .filter(p => (quantities[p.id] || 0) > 0)
    .map(p => {
      const price = b2bPrices[p.sku || ''] || p.price || 0;
      const qty = quantities[p.id];
      return {
        id: p.id,
        sku: p.sku || p.id,
        name: p.name,
        price,
        quantity: qty,
        subtotal: qty * price
      };
    });

  const totalAmount = selectedItems.reduce((acc, item) => acc + item.subtotal, 0);

  const handleSubmitOrder = async () => {
    if (selectedItems.length === 0) {
      alert("Selecione a quantidade de pelo menos um produto para continuar.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/b2b/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: clientToken,
          items: selectedItems,
          notes
        })
      });

      const data = await res.json();
      if (data.success) {
        setOrderSuccess({
          orderId: data.orderId,
          blingOrderId: data.blingOrderId,
          totalAmount: data.totalAmount
        });
      } else {
        alert(data.error || "Erro ao processar pedido B2B.");
      }
    } catch (err) {
      alert("Erro de conexão ao enviar pedido B2B.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl p-6 rounded-3xl border border-emerald-500/30 bg-[var(--dash-surface)] shadow-2xl relative space-y-5 max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[var(--dash-text-muted)] hover:bg-[var(--dash-surface-element)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!orderSuccess ? (
          <>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[var(--dash-text-primary)]">
                  Pedido em Lote B2B — {companyName}
                </h3>
                <p className="text-xs text-[var(--dash-text-muted)]">
                  Preços de atacado aplicados automaticamente pela sua tabela autorizada.
                </p>
              </div>
            </div>

            {/* Lista de Produtos em Grade */}
            <div className="flex-1 overflow-y-auto pr-1 divide-y divide-[var(--dash-border-subtle)] rounded-2xl border border-[var(--dash-border-subtle)] bg-[var(--dash-surface-element)]">
              {products.map((p) => {
                const finalPrice = b2bPrices[p.sku || ''] || p.price || 0;
                const qty = quantities[p.id] || 0;

                return (
                  <div key={p.id} className="p-3 flex items-center justify-between gap-3 hover:bg-[var(--dash-surface)] transition-colors">
                    <div className="flex items-center gap-3">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-10 h-10 object-cover rounded-xl border border-[var(--dash-border-subtle)]" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border-subtle)] flex items-center justify-center text-xs font-mono text-[var(--dash-text-muted)]">
                          SKU
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-xs text-[var(--dash-text-primary)] line-clamp-1">
                          {p.name}
                        </h4>
                        <div className="text-[11px] text-[var(--dash-text-muted)] font-mono">
                          SKU: {p.sku || 'N/A'} • Preço B2B: <strong className="text-emerald-400">R$ {finalPrice.toFixed(2)}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleQuantityChange(p.id, qty - 1)}
                        className="w-7 h-7 rounded-lg border border-[var(--dash-border-subtle)] bg-[var(--dash-surface)] text-[var(--dash-text-primary)] font-bold text-sm hover:border-emerald-500/50"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        className="w-12 text-center text-xs font-bold rounded-lg border border-[var(--dash-border-subtle)] bg-[var(--dash-surface)] text-[var(--dash-text-primary)] py-1 focus:outline-none"
                        value={qty}
                        onChange={(e) => handleQuantityChange(p.id, parseInt(e.target.value || '0', 10))}
                      />
                      <button
                        onClick={() => handleQuantityChange(p.id, qty + 1)}
                        className="w-7 h-7 rounded-lg border border-[var(--dash-border-subtle)] bg-[var(--dash-surface)] text-[var(--dash-text-primary)] font-bold text-sm hover:border-emerald-500/50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rodapé e Resumo do Pedido */}
            <div className="space-y-3 pt-2 border-t border-[var(--dash-border-subtle)]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--dash-text-secondary)] font-medium">
                  Total de Itens: <strong className="text-[var(--dash-text-primary)]">{selectedItems.length}</strong>
                </span>
                <span className="text-[var(--dash-text-secondary)] font-medium">
                  Valor Total B2B: <strong className="text-emerald-400 text-lg">R$ {totalAmount.toFixed(2)}</strong>
                </span>
              </div>

              <button
                onClick={handleSubmitOrder}
                disabled={loading || selectedItems.length === 0}
                className="w-full py-3 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? "Enviando Pedido ao Bling..." : "Finalizar Pedido B2B"}</span>
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-xl text-[var(--dash-text-primary)]">
                Pedido B2B Concluído!
              </h3>
              <p className="text-xs text-[var(--dash-text-secondary)]">
                Seu pedido no valor de <strong className="text-emerald-400">R$ {orderSuccess.totalAmount.toFixed(2)}</strong> foi registrado com sucesso.
              </p>
              {orderSuccess.blingOrderId && (
                <div className="p-2 rounded-xl bg-emerald-500/10 text-xs font-mono text-emerald-400 border border-emerald-500/20">
                  Integrado no Bling ERP (ID: {orderSuccess.blingOrderId})
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-sm"
            >
              Concluir e Voltar ao Catálogo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
