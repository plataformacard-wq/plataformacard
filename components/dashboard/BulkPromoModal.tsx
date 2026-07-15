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
import PromoActionSelector from "@/components/dashboard/catalogo/bulk/PromoActionSelector";
import PromoScopeSelector from "@/components/dashboard/catalogo/bulk/PromoScopeSelector";
import PromoValueConfig from "@/components/dashboard/catalogo/bulk/PromoValueConfig";
import PromoPreviewArea from "@/components/dashboard/catalogo/bulk/PromoPreviewArea";

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

  // CaaS and multi-channel pricing states
  const [targetChannel, setTargetChannel] = useState<"b2c" | "b2b" | "both">("both");
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isCatalogCaas, setIsCatalogCaas] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Fetch CaaS products and overrides if we are in a CaaS tenant context
  useEffect(() => {
    if (!isOpen || !catalogId) return;

    async function checkAndFetchProducts() {
      // If we don't have an orgId, we are either editing a master catalog directly as admin, or it's a standard catalog without org context
      if (!orgId) {
        setLocalProducts(products);
        setIsCatalogCaas(false);
        return;
      }

      setLoadingProducts(true);
      try {
        // Check if catalog is CaaS/platform type
        const { data: catData } = await supabase
          .from("catalogs")
          .select("catalog_type")
          .eq("id", catalogId)
          .maybeSingle();

        const isCaasType = catData?.catalog_type === "CaaS" || catData?.catalog_type === "platform";
        setIsCatalogCaas(isCaasType);

        if (isCaasType) {
          // Fetch master catalog products
          const { data: masterProds } = await supabase
            .from("products")
            .select("id, name, price, compare_at_price, category_id, sku, wholesale_price, has_retail, has_wholesale")
            .in("category_id", categories.map(c => c.id))
            .eq("is_active", true)
            .is("deleted_at", null);

          if (masterProds && masterProds.length > 0) {
            // Fetch overrides for this organization
            const { data: overrides } = await supabase
              .from("organization_product_overrides")
              .select("*")
              .eq("organization_id", orgId)
              .in("product_id", masterProds.map(p => p.id));

            const merged = masterProds.map(p => {
              const o = overrides?.find(ov => ov.product_id === p.id);
              return {
                ...p,
                is_caas: true,
                price: (o?.price_b2c !== undefined && o?.price_b2c !== null) ? o.price_b2c : p.price,
                compare_at_price: (o?.compare_at_price !== undefined && o?.compare_at_price !== null) ? o.compare_at_price : p.compare_at_price,
                wholesale_price: (o?.price_b2b !== undefined && o?.price_b2b !== null) ? o.price_b2b : p.wholesale_price,
                has_retail: o?.has_retail !== null && o?.has_retail !== undefined ? o.has_retail : p.has_retail,
                has_wholesale: o?.has_wholesale !== null && o?.has_wholesale !== undefined ? o.has_wholesale : p.has_wholesale,
                is_active: o ? (o.is_available ?? false) : false
              };
            });
            setLocalProducts(merged);
          } else {
            setLocalProducts([]);
          }
        } else {
          setLocalProducts(products);
        }
      } catch (err) {
        console.error("Error fetching/checking products for bulk adjustments:", err);
        setLocalProducts(products);
      } finally {
        setLoadingProducts(false);
      }
    }

    void checkAndFetchProducts();
  }, [isOpen, catalogId, orgId, products, categories]);

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
      if (localProducts.length > 0 && !selectedProductId) {
        setSelectedProductId(localProducts[0].id);
      }
    }
  }, [isOpen, actionType, categories, localProducts]);

  // Filter products for the search dropdown in product scope
  const filteredSearchProducts = useMemo(() => {
    if (!productSearch) return localProducts.slice(0, 100);
    return localProducts.filter(p => 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
      (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
    ).slice(0, 100);
  }, [localProducts, productSearch]);

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
    const targets = localProducts.filter(p => {
      if (scope === "all") return true;
      if (scope === "category") return p.category_id === selectedCategoryId;
      if (scope === "product") return p.id === selectedProductId;
      return false;
    });

    // 2. Map and calculate new prices
    const mapped = targets.map(p => {
      const currentB2c = p.price ?? 0;
      const currentB2b = (p as any).wholesale_price ?? 0;
      let newB2c = currentB2c;
      let newB2b = currentB2b;

      if (actionType === "revert") {
        newB2c = (p.compare_at_price !== undefined && p.compare_at_price !== null) ? p.compare_at_price : currentB2c;
        newB2b = currentB2b; // Revert de promoção não afeta atacado
      } else {
        const multiplier = actionType === "apply_promo" ? -1 : 1;
        const adjustment = multiplier * Math.abs(valueNum);

        if (isCatalogCaas) {
          if (targetChannel === "b2c" || targetChannel === "both") {
            if (p.price !== null && p.price !== undefined) {
              if (valueType === "percentage") {
                newB2c = currentB2c * (1 + adjustment / 100);
              } else {
                newB2c = currentB2c + adjustment;
              }
            }
          }
          if (targetChannel === "b2b" || targetChannel === "both") {
            if ((p as any).wholesale_price !== null && (p as any).wholesale_price !== undefined) {
              if (valueType === "percentage") {
                newB2b = currentB2b * (1 + adjustment / 100);
              } else {
                newB2b = currentB2b + adjustment;
              }
            }
          }
        } else {
          // Catálogo padrão
          if (valueType === "percentage") {
            newB2c = currentB2c * (1 + adjustment / 100);
          } else {
            newB2c = currentB2c + adjustment;
          }
        }
      }

      return {
        id: p.id,
        name: p.name,
        currentB2c,
        newB2c: Math.max(0, Number(newB2c.toFixed(2))),
        currentB2b,
        newB2b: Math.max(0, Number(newB2b.toFixed(2))),
        compareAtPrice: p.compare_at_price ?? null
      };
    });

    return {
      affectedCount: mapped.length,
      items: mapped.slice(0, 5) // Show top 5 preview items
    };
  }, [actionType, scope, selectedCategoryId, selectedProductId, valueType, adjustValue, localProducts, isCatalogCaas, targetChannel]);

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

      if (isCatalogCaas) {
        if (actionType === "revert") {
          const { error: rpcError } = await supabase.rpc("revert_bulk_promotions_caas", {
            p_org_id: orgId,
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

          const { error: rpcError } = await supabase.rpc("apply_bulk_price_adjustment_caas", {
            p_org_id: orgId,
            p_catalog_id: catalogId,
            p_category_id: categoryIdParam,
            p_product_id: productIdParam,
            p_adjustment_type: valueType,
            p_value: finalValue,
            p_is_promotion: isPromotion,
            p_target_channel: targetChannel
          });

          if (rpcError) throw rpcError;
        }
      } else {
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
          className="w-full max-w-2xl overflow-hidden rounded-xl border shadow-2xl flex flex-col max-h-[90vh]"
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
              {loadingProducts ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-sm font-semibold text-[var(--dash-text-secondary)]">Carregando catálogo e overrides...</p>
                </div>
              ) : success ? (
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
                  <PromoActionSelector actionType={actionType} setActionType={setActionType as any} />

                  {/* Step 2: Scope Selector */}
                  <PromoScopeSelector 
                    scope={scope}
                    setScope={setScope}
                    selectedCategoryId={selectedCategoryId}
                    setSelectedCategoryId={setSelectedCategoryId}
                    categories={categories}
                    selectedProductId={selectedProductId}
                    setSelectedProductId={setSelectedProductId}
                    productSearch={productSearch}
                    setProductSearch={setProductSearch}
                    filteredSearchProducts={filteredSearchProducts}
                  />

                  {/* Step 3: Value configuration (hide for Revert) */}
                  {actionType !== "revert" && (
                    <PromoValueConfig 
                      actionType={actionType}
                      valueType={valueType}
                      setValueType={setValueType}
                      adjustValue={adjustValue}
                      setAdjustValue={setAdjustValue}
                      isCatalogCaas={isCatalogCaas}
                      targetChannel={targetChannel}
                      setTargetChannel={setTargetChannel}
                    />
                  )}

                  {/* Step 4: Preview Area */}
                  <PromoPreviewArea 
                    previewData={previewData}
                    isCatalogCaas={isCatalogCaas}
                    targetChannel={targetChannel}
                    actionType={actionType}
                  />
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
