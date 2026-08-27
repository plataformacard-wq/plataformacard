"use client";

import React, { useState, useMemo } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShoppingBag,
  Send,
  CheckCircle2,
  Search,
  Loader2,
  FileText,
  MessageCircle,
  CheckCheck,
  Building2,
  ExternalLink,
} from "lucide-react";
import { formatPrice } from "./utils";

interface CatalogProductItem {
  id: string;
  name: string;
  sku?: string | null;
  price?: number | null;
  compare_at_price?: number | null;
  image_url?: string | null;
}

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
  slug,
  whatsappNumber,
}) => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{
    orderId: string;
    blingOrderId?: string | null;
    totalAmount: number;
    savedItems: any[];
    savedNotes: string;
  } | null>(null);

  const handleQuantityChange = (productId: string, val: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: Math.max(0, val) }));
  };

  const selectedItems = useMemo(() => {
    return products
      .filter((p) => (quantities[p.id] || 0) > 0)
      .map((p) => {
        const price = b2bPrices[p.sku || ""] ?? p.price ?? 0;
        const qty = quantities[p.id];
        return {
          id: p.id,
          sku: p.sku || p.id,
          name: p.name,
          price,
          quantity: qty,
          subtotal: qty * price,
        };
      });
  }, [products, quantities, b2bPrices]);

  const totalQuantity = useMemo(() => {
    return Object.values(quantities).reduce((sum, q) => sum + q, 0);
  }, [quantities]);

  const totalAmount = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + item.subtotal, 0);
  }, [selectedItems]);

  const totalMarketAmount = useMemo(() => {
    return products.reduce((acc, p) => {
      const qty = quantities[p.id] || 0;
      const anchor = p.compare_at_price && p.compare_at_price > (p.price || 0) ? p.compare_at_price : (p.price || 0);
      return acc + (anchor * qty);
    }, 0);
  }, [products, quantities]);

  const totalEconomy = useMemo(() => {
    return Math.max(0, totalMarketAmount - totalAmount);
  }, [totalMarketAmount, totalAmount]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  // Mensagem formatada do WhatsApp Mockup
  const whatsappFormattedText = useMemo(() => {
    const itemsToFormat = orderSuccess ? orderSuccess.savedItems : selectedItems;
    const currentNotes = orderSuccess ? orderSuccess.savedNotes : notes;
    const total = orderSuccess ? orderSuccess.totalAmount : totalAmount;

    let msg = `🏢 *NOVO PEDIDO ATACADO B2B*\n`;
    msg += `*Empresa:* ${companyName}\n`;
    if (orderSuccess?.orderId) {
      msg += `*ID do Pedido:* ${orderSuccess.orderId}\n`;
    }
    msg += `------------------------------------\n`;

    itemsToFormat.forEach((item, idx) => {
      msg += `${idx + 1}. *${item.quantity}x* ${item.name} (${item.sku || "N/A"})\n`;
      msg += `   └ Valor: ${formatPrice(item.price)} un. | Subtotal: ${formatPrice(item.subtotal)}\n`;
    });

    msg += `------------------------------------\n`;
    msg += `📦 *Total de Itens:* ${itemsToFormat.reduce((acc, it) => acc + it.quantity, 0)} unidades\n`;
    msg += `💰 *Valor Total do Pedido:* ${formatPrice(total)}\n`;

    if (currentNotes.trim()) {
      msg += `📝 *Observações / Faturamento:* ${currentNotes.trim()}\n`;
    }

    return msg;
  }, [companyName, orderSuccess, selectedItems, notes, totalAmount]);

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
          notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrderSuccess({
          orderId: data.orderId,
          blingOrderId: data.blingOrderId,
          totalAmount: data.totalAmount,
          savedItems: [...selectedItems],
          savedNotes: notes,
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

  const handleSendToWhatsApp = () => {
    if (!whatsappNumber) {
      alert("Número do WhatsApp da empresa não cadastrado.");
      return;
    }
    const cleanNumber = whatsappNumber.replace(/\D/g, "");
    const url = `https://wa.me/55${cleanNumber}?text=${encodeURIComponent(whatsappFormattedText)}`;
    window.open(url, "_blank");
  };

  const handleResetAndClose = () => {
    setQuantities({});
    setNotes("");
    setOrderSuccess(null);
    onClose();
  };

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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--public-text-dim)] hover:text-[var(--public-text-main)]"
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
                    const isSelected = qty > 0;

                    return (
                      <div
                        key={p.id}
                        className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-emerald-500/5 border-emerald-500/40 shadow-sm"
                            : "bg-[var(--public-bg)]/60 border-[var(--public-card-border)] hover:border-emerald-500/20"
                        }`}
                      >
                        {/* Imagem + Infos */}
                        <div className="flex items-center gap-3 min-w-0">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="w-12 h-12 object-cover rounded-xl border border-[var(--public-card-border)] shrink-0 bg-[var(--public-card-bg)]"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-[var(--public-card-bg)] border border-[var(--public-card-border)] flex items-center justify-center text-[10px] font-mono text-[var(--public-text-dim)] shrink-0">
                              SKU
                            </div>
                          )}

                          <div className="min-w-0">
                            <h4 className="font-bold text-xs sm:text-sm text-[var(--public-text-main)] truncate">
                              {p.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {p.sku && (
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[var(--public-bg)] text-[var(--public-text-dim)] border border-[var(--public-card-border)]">
                                  {p.sku}
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
                            onClick={() => handleQuantityChange(p.id, qty - 1)}
                            disabled={qty === 0}
                            className="w-8 h-8 rounded-xl border border-[var(--public-card-border)] bg-[var(--public-card-bg)] text-[var(--public-text-main)] font-black text-sm hover:bg-[var(--public-bg)] active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer shadow-sm"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            className="w-12 h-8 text-center text-xs font-black rounded-xl border border-[var(--public-card-border)] bg-[var(--public-bg)] text-[var(--public-text-main)] focus:outline-none focus:border-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            value={qty === 0 ? "" : qty}
                            placeholder="0"
                            onChange={(e) =>
                              handleQuantityChange(
                                p.id,
                                parseInt(e.target.value || "0", 10)
                              )
                            }
                          />
                          <button
                            onClick={() => handleQuantityChange(p.id, qty + 1)}
                            className="w-8 h-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white font-black text-sm active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
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
                        className="text-xs text-[var(--public-text-dim)] hover:text-[var(--public-text-main)]"
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
            /* Tela de Sucesso Híbrida: ERP + Mockup WhatsApp */
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shadow-lg shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="text-center space-y-1.5 max-w-md">
                <h3 className="text-xl sm:text-2xl font-black text-[var(--public-text-main)]">
                  Pedido B2B Concluído com Sucesso!
                </h3>
                <p className="text-xs sm:text-sm text-[var(--public-text-dim)] leading-relaxed">
                  Seu pedido de{" "}
                  <strong className="text-emerald-500 font-extrabold">
                    {formatPrice(orderSuccess.totalAmount)}
                  </strong>{" "}
                  foi registrado no sistema e integrado com a central de pedidos.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--public-bg)] border border-[var(--public-card-border)] text-xs font-mono text-[var(--public-text-dim)] mt-2">
                  <span>ID:</span>
                  <strong className="text-[var(--public-text-main)]">{orderSuccess.orderId}</strong>
                </div>
              </div>

              {/* Mockup Visual de Mensagem do WhatsApp */}
              <div className="w-full max-w-md bg-[#efeae2] dark:bg-[#0b141a] p-4 rounded-2xl border border-[var(--public-card-border)] shadow-inner space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-bold px-1">
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Comprovante WhatsApp (Pré-visualização)</span>
                  </span>
                  <span>Agora</span>
                </div>

                <div className="bg-white dark:bg-[#202c33] p-3.5 rounded-2xl rounded-tr-sm shadow-sm text-xs font-sans space-y-2 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
                  <pre className="whitespace-pre-wrap font-sans text-[11px] leading-relaxed select-text">
                    {whatsappFormattedText}
                  </pre>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
                    <span>Enviado</span>
                    <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                </div>
              </div>

              {/* Ações de Finalização */}
              <div className="w-full max-w-md space-y-2.5 pt-2">
                {whatsappNumber && (
                  <button
                    onClick={handleSendToWhatsApp}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs sm:text-sm tracking-wide transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Enviar Comprovante no WhatsApp Comercial</span>
                  </button>
                )}

                <button
                  onClick={handleResetAndClose}
                  className="w-full py-3 px-6 rounded-xl border border-[var(--public-card-border)] bg-[var(--public-card-bg)] text-[var(--public-text-dim)] hover:text-[var(--public-text-main)] font-bold text-xs transition-all active:scale-[0.99] cursor-pointer"
                >
                  Voltar ao Catálogo
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
