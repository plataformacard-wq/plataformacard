"use client";

import React, { useState, useMemo } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import {
  X,
  Trash2,
  Plus,
  Minus,
  MessageSquare,
  ShoppingBag,
  Send,
  MapPin,
  CreditCard,
  User,
  AlertCircle,
  Check,
} from "lucide-react";
import { CartItem, CheckoutData } from "../types/cart";
import { formatPrice } from "../utils";

interface CartDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  whatsappNumber: string | null;
  slug: string;
  catalogName?: string | null;
  accentColor?: string | null;
  minOrderValue?: number | null;
  deliveryOptions?: string[] | null;
  paymentMethods?: string[] | null;
  onSendOrder: (data: CheckoutData) => void;
}

export function CartDrawerModal({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  whatsappNumber,
  slug,
  catalogName,
  accentColor,
  minOrderValue = 0,
  deliveryOptions = ["retirada", "entrega"],
  paymentMethods = ["pix", "cartao", "dinheiro"],
  onSendOrder,
}: CartDrawerModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"retirada" | "entrega">(
    (deliveryOptions?.[0] as "retirada" | "entrega") || "retirada"
  );
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>(
    paymentMethods?.[0] || "pix"
  );
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"items" | "checkout">("items");
  const [validationError, setValidationError] = useState<string | null>(null);

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  }, [items]);

  const effectiveMinOrder = minOrderValue || 0;
  const isMinOrderReached = subtotal >= effectiveMinOrder;

  // Real-time WhatsApp Message Mockup Preview
  const whatsappPreviewText = useMemo(() => {
    let msg = `🛒 *NOVO PEDIDO - ${catalogName || "Catálogo Virtual"}*\n`;
    msg += `------------------------------------\n`;

    items.forEach((item, idx) => {
      let line = `${idx + 1}. *${item.quantity}x* ${item.product.name}`;
      if (item.selectedColor) line += ` (${item.selectedColor})`;
      if (item.selectedSpec) line += ` [${item.selectedSpec.chave}: ${item.selectedSpec.valor}]`;
      line += ` - ${formatPrice(item.unitPrice * item.quantity)}`;
      msg += `${line}\n`;
    });

    msg += `------------------------------------\n`;
    msg += `💰 *Total dos Produtos:* ${formatPrice(subtotal)}\n\n`;

    if (customerName.trim()) {
      msg += `👤 *Cliente:* ${customerName.trim()}\n`;
    }
    msg += `🚚 *Forma de Entrega:* ${
      deliveryMethod === "entrega" ? "Entrega no Endereço" : "Retirada no Local"
    }\n`;
    if (deliveryMethod === "entrega" && address.trim()) {
      msg += `📍 *Endereço:* ${address.trim()}\n`;
    }
    msg += `💳 *Pagamento:* ${paymentMethod.toUpperCase()}\n`;
    if (notes.trim()) {
      msg += `📝 *Observações:* ${notes.trim()}\n`;
    }

    return msg;
  }, [items, subtotal, customerName, deliveryMethod, address, paymentMethod, notes, catalogName]);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!customerName.trim()) {
      setValidationError("Por favor, informe seu nome.");
      return;
    }

    if (deliveryMethod === "entrega" && !address.trim()) {
      setValidationError("Por favor, informe o endereço completo de entrega.");
      return;
    }

    if (!isMinOrderReached) {
      setValidationError(
        `O valor mínimo para pedido é ${formatPrice(effectiveMinOrder)}.`
      );
      return;
    }

    onSendOrder({
      customerName: customerName.trim(),
      deliveryMethod,
      address: deliveryMethod === "entrega" ? address.trim() : undefined,
      paymentMethod,
      notes: notes.trim() || undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex justify-end bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-md h-full bg-[var(--public-card-bg)] text-[var(--public-text-main)] border-l border-[var(--public-card-border)] flex flex-col shadow-2xl"
        >
          {/* Topo do Drawer */}
          <div className="p-6 border-b border-[var(--public-card-border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="p-2.5 rounded-2xl text-white flex items-center justify-center shadow-sm"
                style={{ backgroundColor: accentColor || "#10b981" }}
              >
                <ShoppingBag size={20} />
              </div>
              <div>
                <h3 className="font-black text-lg text-[var(--public-text-main)] leading-tight">
                  Sua Comanda
                </h3>
                <p className="text-xs text-[var(--public-text-dim)] font-bold">
                  {items.length} {items.length === 1 ? "item selecionado" : "itens selecionados"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={onClearCart}
                  title="Esvaziar comanda"
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-[var(--public-text-dim)] hover:bg-[var(--public-bg)] hover:text-[var(--public-text-main)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Seletor de Abas */}
          <div className="flex border-b border-[var(--public-card-border)] p-1.5 bg-[var(--public-bg)]">
            <button
              onClick={() => setActiveTab("items")}
              className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                activeTab === "items"
                  ? "bg-[var(--public-card-bg)] text-[var(--public-text-main)] shadow-sm border border-[var(--public-card-border)]"
                  : "text-[var(--public-text-dim)] hover:text-[var(--public-text-main)]"
              }`}
            >
              1. Itens da Comanda ({items.length})
            </button>
            <button
              onClick={() => setActiveTab("checkout")}
              className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                activeTab === "checkout"
                  ? "bg-[var(--public-card-bg)] text-[var(--public-text-main)] shadow-sm border border-[var(--public-card-border)]"
                  : "text-[var(--public-text-dim)] hover:text-[var(--public-text-main)]"
              }`}
            >
              2. Dados & WhatsApp
            </button>
          </div>

          {/* Conteúdo Principal */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="p-4 rounded-full bg-[var(--public-bg)] text-[var(--public-text-dim)] border border-[var(--public-card-border)]">
                  <ShoppingBag size={48} />
                </div>
                <div>
                  <h4 className="font-black text-base text-[var(--public-text-main)]">
                    Sua comanda está vazia
                  </h4>
                  <p className="text-xs text-[var(--public-text-dim)] mt-1 font-medium">
                    Navegue pelo catálogo e adicione os produtos que deseja encomendar.
                  </p>
                </div>
              </div>
            ) : activeTab === "items" ? (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-bg)] flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-sm text-[var(--public-text-main)] truncate">
                        {item.product.name}
                      </h4>
                      {(item.selectedColor || item.selectedSpec) && (
                        <p className="text-[11px] text-[var(--public-text-dim)] font-bold mt-0.5">
                          {item.selectedColor && `Cor: ${item.selectedColor} `}
                          {item.selectedSpec &&
                            `[${item.selectedSpec.chave}: ${item.selectedSpec.valor}]`}
                        </p>
                      )}
                      <p
                        className="text-xs font-black mt-1"
                        style={{ color: accentColor || "#10b981" }}
                      >
                        {formatPrice(item.unitPrice * item.quantity)}
                      </p>
                    </div>

                    {/* Controles de Quantidade */}
                    <div className="flex items-center gap-2 bg-[var(--public-card-bg)] border border-[var(--public-card-border)] p-1.5 rounded-xl shadow-sm">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="p-1 rounded-lg hover:bg-[var(--public-bg)] text-[var(--public-text-main)] transition-colors font-black"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-xs font-black w-6 text-center text-[var(--public-text-main)]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="p-1 rounded-lg hover:bg-[var(--public-bg)] text-[var(--public-text-main)] transition-colors font-black"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}

                {/* Mockup Preview em Tempo Real da Mensagem (com excelente contraste no tema claro e escuro) */}
                <div className="mt-6 pt-6 border-t border-[var(--public-card-border)] space-y-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-emerald-500" />
                    <h5 className="text-xs font-black uppercase tracking-wider text-[var(--public-text-dim)]">
                      Pré-visualização da Comanda WhatsApp
                    </h5>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 font-mono text-[11px] leading-relaxed text-emerald-950 dark:text-emerald-200 whitespace-pre-wrap select-none shadow-inner font-extrabold">
                    {whatsappPreviewText}
                  </div>
                </div>
              </div>
            ) : (
              /* Aba de Checkout e Dados */
              <form onSubmit={handleCheckoutSubmit} className="space-y-5">
                {validationError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-black flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Nome do Cliente */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-[var(--public-text-dim)] uppercase tracking-wider flex items-center gap-1.5">
                    <User size={14} style={{ color: accentColor || "#10b981" }} /> Seus Dados (Nome):
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--public-bg)] border border-[var(--public-card-border)] text-sm font-bold text-[var(--public-text-main)] placeholder:text-[var(--public-text-dim)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Forma de Entrega */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-[var(--public-text-dim)] uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={14} style={{ color: accentColor || "#10b981" }} /> Tipo de Entrega:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {deliveryOptions?.includes("retirada") && (
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod("retirada")}
                        className={`p-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition-all ${
                          deliveryMethod === "retirada"
                            ? "bg-emerald-500 text-white border-emerald-500 shadow-md"
                            : "bg-[var(--public-bg)] text-[var(--public-text-main)] border-[var(--public-card-border)]"
                        }`}
                      >
                        {deliveryMethod === "retirada" && <Check size={14} />}
                        Retirada no Local
                      </button>
                    )}
                    {deliveryOptions?.includes("entrega") && (
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod("entrega")}
                        className={`p-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition-all ${
                          deliveryMethod === "entrega"
                            ? "bg-emerald-500 text-white border-emerald-500 shadow-md"
                            : "bg-[var(--public-bg)] text-[var(--public-text-main)] border-[var(--public-card-border)]"
                        }`}
                      >
                        {deliveryMethod === "entrega" && <Check size={14} />}
                        Entrega em Casa
                      </button>
                    )}
                  </div>
                </div>

                {/* Endereço se entrega */}
                {deliveryMethod === "entrega" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-[var(--public-text-dim)] uppercase tracking-wider">
                      Endereço Completo de Entrega:
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Rua, número, bairro, complemento e cidade..."
                      className="w-full p-3 rounded-xl bg-[var(--public-bg)] border border-[var(--public-card-border)] text-xs font-bold text-[var(--public-text-main)] placeholder:text-[var(--public-text-dim)] focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>
                )}

                {/* Forma de Pagamento */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-[var(--public-text-dim)] uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard size={14} style={{ color: accentColor || "#10b981" }} /> Forma de Pagamento Pretendida:
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="dash-select w-full rounded-xl border border-[var(--public-card-border)] bg-[var(--public-bg)] text-[var(--public-text-main)] pl-3 py-2.5 text-xs font-extrabold focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {paymentMethods?.includes("pix") && (
                      <option value="pix">Pix (Aprovação Instantânea)</option>
                    )}
                    {paymentMethods?.includes("cartao") && (
                      <option value="cartao">Cartão de Crédito / Débito</option>
                    )}
                    {paymentMethods?.includes("dinheiro") && (
                      <option value="dinheiro">Dinheiro no Momento da Entrega</option>
                    )}
                  </select>
                </div>

                {/* Observações */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-[var(--public-text-dim)] uppercase tracking-wider">
                    Observações do Pedido (Opcional):
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: sem cebola, para presente, retirar às 15h..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--public-bg)] border border-[var(--public-card-border)] text-xs font-bold text-[var(--public-text-main)] placeholder:text-[var(--public-text-dim)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </form>
            )}
          </div>

          {/* Rodapé Fixo do Drawer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[var(--public-card-border)] bg-[var(--public-card-bg)] space-y-4">
              <div className="flex items-center justify-between text-sm font-extrabold text-[var(--public-text-main)]">
                <span>Subtotal ({items.length} itens):</span>
                <span
                  className="text-lg font-black"
                  style={{ color: accentColor || "#10b981" }}
                >
                  {formatPrice(subtotal)}
                </span>
              </div>

              {effectiveMinOrder > 0 && (
                <div className="text-[11px] font-bold text-[var(--public-text-dim)] flex items-center justify-between">
                  <span>Valor Mínimo do Pedido:</span>
                  <span
                    className={
                      isMinOrderReached ? "text-emerald-600 dark:text-emerald-400 font-black" : "text-rose-500 font-black"
                    }
                  >
                    {formatPrice(effectiveMinOrder)}
                  </span>
                </div>
              )}

              {activeTab === "items" ? (
                <button
                  onClick={() => setActiveTab("checkout")}
                  className="w-full py-3.5 rounded-xl font-black text-sm text-white shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: accentColor || "#10b981",
                  }}
                >
                  <span>Preencher Dados e Concluir</span>
                  <Send size={16} />
                </button>
              ) : (
                <button
                  onClick={handleCheckoutSubmit}
                  disabled={!isMinOrderReached}
                  className="w-full py-3.5 rounded-xl font-black text-sm text-white shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "#25D366", // WhatsApp Green
                  }}
                >
                  <Send size={18} />
                  <span>Enviar Pedido no WhatsApp</span>
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
