"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { 
  X, 
  Percent, 
  Tags, 
  TrendingDown, 
  TrendingUp, 
  RefreshCw, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  HelpCircle,
  Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number | null;
  compare_at_price?: number | null;
  category_id: string | null;
  sku?: string | null;
}

interface BulkPromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  catalogId: string;
  orgId: string;
  categories: Category[];
  products: Product[];
}

type ActionType = "apply_promo" | "apply_markup" | "revert";
type ScopeType = "all" | "category" | "product";
type ValueType = "percentage" | "fixed";

export default function BulkPromoModal({
  isOpen,
  onClose,
  onSuccess,
  catalogId,
  orgId,
  categories,
  products
}: BulkPromoModalProps) {
  const [mounted, setMounted] = useState(false);
  const [actionType, setActionType] = useState<ActionType>("apply_promo");
  const [scope, setScope] = useState<ScopeType>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [productSearch, setProductSearch] = useState<string>("");
  const [valueType, setValueType] = useState<ValueType>("percentage");
  const [adjustValue, setAdjustValue] = useState<string>("10");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Reset values when modal opens/closes or action type changes
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(false);
      setIsProcessing(false);
      // Default selections
      if (categories.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(categories[0].id);
      }
      if (products.length > 0 && !selectedProductId) {
        setSelectedProductId(products[0].id);
      }
    }
  }, [isOpen, actionType, categories, products]);

  // Filter products for the search dropdown in product scope
  const filteredSearchProducts = useMemo(() => {
    if (!productSearch) return products.slice(0, 100);
    return products.filter(p => 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
      (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
    ).slice(0, 100);
  }, [products, productSearch]);

  // Set the first matching product ID when search updates if not already selected
  useEffect(() => {
    if (scope === "product" && filteredSearchProducts.length > 0) {
      const exists = filteredSearchProducts.some(p => p.id === selectedProductId);
      if (!exists) {
        setSelectedProductId(filteredSearchProducts[0].id);
      }
    }
  }, [filteredSearchProducts, scope, selectedProductId]);

  // Calculations for Preview
  const previewData = useMemo(() => {
    if (actionType !== "revert" && (!adjustValue || isNaN(Number(adjustValue)))) {
      return { affectedCount: 0, items: [] };
    }

    const valueNum = Number(adjustValue);

    // 1. Filter products by scope
    const targets = products.filter(p => {
      if (scope === "all") return true;
      if (scope === "category") return p.category_id === selectedCategoryId;
      if (scope === "product") return p.id === selectedProductId;
      return false;
    });

    // 2. Map and calculate new prices
    const mapped = targets.map(p => {
      const currentPrice = p.price ?? 0;
      let newPrice = currentPrice;

      if (actionType === "revert") {
        newPrice = (p.compare_at_price !== undefined && p.compare_at_price !== null) ? p.compare_at_price : currentPrice;
      } else {
        // For promo we subtract, for markup we add
        const multiplier = actionType === "apply_promo" ? -1 : 1;
        const adjustment = multiplier * Math.abs(valueNum);

        if (valueType === "percentage") {
          newPrice = currentPrice * (1 + adjustment / 100);
        } else {
          newPrice = currentPrice + adjustment;
        }
      }

      return {
        id: p.id,
        name: p.name,
        currentPrice,
        compareAtPrice: p.compare_at_price ?? null,
        newPrice: Math.max(0, Number(newPrice.toFixed(2)))
      };
    });

    return {
      affectedCount: mapped.length,
      items: mapped.slice(0, 5) // Show top 5 preview items
    };
  }, [actionType, scope, selectedCategoryId, selectedProductId, valueType, adjustValue, products]);

  // Submit Handler
  const handleSubmit = async () => {
    if (!catalogId) {
      setError("Catálogo ativo não encontrado.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const categoryIdParam = scope === "category" ? selectedCategoryId : null;
      const productIdParam = scope === "product" ? selectedProductId : null;

      if (actionType === "revert") {
        const { error: rpcError } = await supabase.rpc("revert_bulk_promotions", {
          p_catalog_id: catalogId,
          p_category_id: categoryIdParam,
          p_product_id: productIdParam
        });

        if (rpcError) throw rpcError;
      } else {
        const rawVal = Number(adjustValue);
        if (isNaN(rawVal) || rawVal <= 0) {
          throw new Error("Por favor, digite um valor maior que zero.");
        }

        // Promo is negative value (discount), markup is positive value (increase)
        const finalValue = actionType === "apply_promo" ? -rawVal : rawVal;
        const isPromotion = actionType === "apply_promo";

        const { error: rpcError } = await supabase.rpc("apply_bulk_price_adjustment", {
          p_catalog_id: catalogId,
          p_category_id: categoryIdParam,
          p_product_id: productIdParam,
          p_adjustment_type: valueType,
          p_value: finalValue,
          p_is_promotion: isPromotion
        });

        if (rpcError) throw rpcError;
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);

    } catch (err: any) {
      console.error("Erro ao aplicar ajustes:", err);
      setError(err.message || "Erro desconhecido ao processar reajuste em massa.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !mounted) return null;

  // Stacking context fix: use React Portal
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="w-full max-w-2xl overflow-hidden rounded-[32px] border shadow-2xl flex flex-col max-h-[90vh]"
          style={{ 
            background: "var(--dash-surface)", 
            borderColor: "var(--dash-border)",
            color: "var(--dash-text-primary)"
          }}
        >
          {/* Header */}
          <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: "var(--dash-border)" }}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {actionType === "apply_promo" ? (
                  <Tags size={20} />
                ) : actionType === "apply_markup" ? (
                  <TrendingUp size={20} />
                ) : (
                  <RefreshCw size={20} />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">Ajustes e Promoções em Massa</h2>
                <p className="text-xs text-[var(--dash-text-muted)]">Configure descontos ou markups para múltiplos itens</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-[var(--dash-hover-bg)] rounded-full transition-colors"
              disabled={isProcessing}
            >
              <X size={20} className="text-[var(--dash-text-muted)]" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-10 text-center space-y-4"
                >
                  <div className="h-20 w-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <CheckCircle size={48} className="animate-bounce" />
                  </div>
                  <h3 className="text-xl font-bold">Ajuste Aplicado com Sucesso!</h3>
                  <p className="text-sm text-[var(--dash-text-muted)] max-w-sm">
                    As alterações foram persistidas no banco de dados e serão exibidas no catálogo imediatamente.
                  </p>
                  <span className="text-xs text-[var(--dash-text-muted)] animate-pulse">Atualizando grade de produtos...</span>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Step 1: Action Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-secondary)]">
                      Qual tipo de ajuste deseja fazer?
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setActionType("apply_promo")}
                        className={`p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all hover:border-primary/50 ${
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
                        className={`p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all hover:border-emerald-500/50 ${
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
                        className={`p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all hover:border-amber-500/50 ${
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

                  {/* Step 2: Scope Selector */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-secondary)]">
                        Escopo da Alteração
                      </label>
                      <select
                        value={scope}
                        onChange={(e) => setScope(e.target.value as ScopeType)}
                        className="w-full bg-[var(--dash-surface-secondary)] border border-[var(--dash-border)] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      >
                        <option value="all">Todo o Catálogo</option>
                        <option value="category">Por Categoria</option>
                        <option value="product">Por Produto Específico</option>
                      </select>
                    </div>

                    {/* Conditional Filters based on scope */}
                    {scope === "category" && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-secondary)]">
                          Selecione a Categoria
                        </label>
                        <select
                          value={selectedCategoryId}
                          onChange={(e) => setSelectedCategoryId(e.target.value)}
                          className="w-full bg-[var(--dash-surface-secondary)] border border-[var(--dash-border)] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {scope === "product" && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-secondary)]">
                          Selecione o Produto
                        </label>
                        <div className="relative">
                          <input 
                            type="text"
                            placeholder="Buscar produto por nome ou SKU..."
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            className="w-full bg-[var(--dash-surface-secondary)] border border-[var(--dash-border)] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all mb-1"
                          />
                          <select
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                            className="w-full bg-[var(--dash-surface-secondary)] border border-[var(--dash-border)] rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all max-h-32"
                          >
                            {filteredSearchProducts.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} {p.sku ? `(SKU: ${p.sku})` : ""} - {p.price ? `R$ ${p.price}` : "Sem preço"}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 3: Value configuration (hide for Revert) */}
                  {actionType !== "revert" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[var(--dash-surface-secondary)] border border-[var(--dash-border)] p-5 rounded-2xl">
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
                            className="w-full bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Preview Area */}
                  <div className="space-y-2 bg-[var(--dash-surface-secondary)] border border-[var(--dash-border)] p-5 rounded-2xl">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-secondary)] flex items-center justify-between">
                      <span>Simulação do Reajuste</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary font-bold">
                        {previewData.affectedCount} produto(s) afetado(s)
                      </span>
                    </h4>

                    {previewData.affectedCount > 0 ? (
                      <div className="space-y-2 pt-2">
                        <div className="text-[11px] font-bold text-[var(--dash-text-muted)] uppercase grid grid-cols-3 border-b border-[var(--dash-border)] pb-1.5 px-2">
                          <span>Nome do Produto</span>
                          <span className="text-right">Preço Atual</span>
                          <span className="text-right">Novo Preço</span>
                        </div>
                        <div className="divide-y divide-[var(--dash-border)]">
                          {previewData.items.map((item) => (
                            <div key={item.id} className="grid grid-cols-3 text-xs py-2 px-2 items-center hover:bg-[var(--dash-hover-bg)]/30 rounded-lg">
                              <span className="font-semibold truncate pr-4">{item.name}</span>
                              <span className="text-right text-[var(--dash-text-secondary)]">
                                R$ {item.currentPrice.toFixed(2)}
                              </span>
                              <span className="text-right font-bold text-emerald-500 flex items-center justify-end gap-1">
                                {actionType === "apply_promo" && item.compareAtPrice === null && (
                                  <span className="line-through text-[var(--dash-text-muted)] text-[10px] font-normal mr-1">
                                    R$ {item.currentPrice.toFixed(2)}
                                  </span>
                                )}
                                R$ {item.newPrice.toFixed(2)}
                              </span>
                            </div>
                          ))}
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          {!success && (
            <div className="p-6 border-t flex items-center justify-between" style={{ borderColor: "var(--dash-border)" }}>
              <div className="flex gap-2 items-center text-xs text-[var(--dash-text-muted)]">
                <HelpCircle size={14} />
                <span>As alterações no banco são imediatas</span>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[var(--dash-hover-bg)] transition-colors"
                  style={{ color: "var(--dash-text-secondary)" }}
                  disabled={isProcessing}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isProcessing || previewData.affectedCount === 0}
                  className={`flex items-center gap-2 px-8 py-2.5 text-white rounded-xl font-bold text-sm shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    actionType === "apply_promo"
                      ? "bg-primary shadow-primary/20 hover:opacity-90"
                      : actionType === "apply_markup"
                      ? "bg-emerald-600 shadow-emerald-900/20 hover:bg-emerald-700"
                      : "bg-amber-600 shadow-amber-900/20 hover:bg-amber-700"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Play size={14} className="fill-current" />
                      Confirmar Reajuste
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-800 flex items-center gap-3">
              <AlertCircle className="text-red-500 shrink-0" size={18} />
              <p className="text-xs text-red-800 dark:text-red-300 font-medium">{error}</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body
  );
}
