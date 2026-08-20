"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, X, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { smartSearchMatch } from "@/lib/utils/smart-search";
import { QuickSearchProduct } from "../QuickSearchProductModal";

interface HeaderSearchPopoverProps {
  onSelectProduct: (product: QuickSearchProduct) => void;
}

export function HeaderSearchPopover({ onSelectProduct }: HeaderSearchPopoverProps) {
  const router = useRouter();
  const supabase = createClient();

  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [productsList, setProductsList] = useState<QuickSearchProduct[]>([]);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);
  const [hasFetchedProducts, setHasFetchedProducts] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const searchRef = useRef<HTMLDivElement | null>(null);

  const fetchSearchProducts = useCallback(async () => {
    if (hasFetchedProducts || isFetchingProducts) return;
    setIsFetchingProducts(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, sku, image_url, stock_quantity, is_in_stock, price, promotional_price, categories(name)")
        .is("deleted_at", null)
        .order("name");

      if (!error && data) {
        setProductsList(data as any[]);
        setHasFetchedProducts(true);
      }
    } catch (e) {
      console.error("Erro ao buscar produtos para pesquisa:", e);
    } finally {
      setIsFetchingProducts(false);
    }
  }, [supabase, hasFetchedProducts, isFetchingProducts]);

  const matchingProducts = globalSearchQuery.trim()
    ? productsList.filter((p) => smartSearchMatch(p, globalSearchQuery)).slice(0, 6)
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchFocus = () => {
    fetchSearchProducts();
    if (globalSearchQuery.trim()) {
      setIsPopoverOpen(true);
    }
  };

  const handleSearchChange = (val: string) => {
    setGlobalSearchQuery(val);
    setHighlightedIndex(-1);
    fetchSearchProducts();
    if (val.trim()) {
      setIsPopoverOpen(true);
    } else {
      setIsPopoverOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isPopoverOpen || matchingProducts.length === 0) {
      if (e.key === "Enter" && globalSearchQuery.trim()) {
        setIsPopoverOpen(false);
        router.push(`/dashboard/estoque?search=${encodeURIComponent(globalSearchQuery.trim())}`);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < matchingProducts.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : matchingProducts.length - 1));
    } else if (e.key === "Escape") {
      setIsPopoverOpen(false);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && matchingProducts[highlightedIndex]) {
        const item = matchingProducts[highlightedIndex];
        onSelectProduct(item);
        setIsPopoverOpen(false);
      } else if (globalSearchQuery.trim()) {
        setIsPopoverOpen(false);
        router.push(`/dashboard/estoque?search=${encodeURIComponent(globalSearchQuery.trim())}`);
      }
    }
  };

  const handleSelectProduct = (product: QuickSearchProduct) => {
    onSelectProduct(product);
    setIsPopoverOpen(false);
  };

  const handleViewAllResults = () => {
    setIsPopoverOpen(false);
    router.push(`/dashboard/estoque?search=${encodeURIComponent(globalSearchQuery.trim())}`);
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-xs md:max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-text-muted)] pointer-events-none" size={18} />
      <input 
        type="text" 
        value={globalSearchQuery}
        onFocus={handleSearchFocus}
        onChange={(e) => handleSearchChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Buscar produtos, SKUs, esgotados..." 
        className="h-10 w-full rounded-lg border border-[var(--dash-border)] bg-[var(--dash-input-bg)] pl-10 pr-8 text-xs md:text-sm text-[var(--dash-text-primary)] outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-[var(--dash-text-muted)]"
      />
      {globalSearchQuery && (
        <button
          onClick={() => {
            setGlobalSearchQuery("");
            setIsPopoverOpen(false);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"
        >
          <X size={14} />
        </button>
      )}

      {/* Live Search Popover Dropdown */}
      <AnimatePresence>
        {isPopoverOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="absolute left-0 top-full mt-2 w-full min-w-[300px] sm:min-w-[380px] max-w-[440px] rounded-[27px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-2 shadow-2xl z-[100] overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-[var(--dash-border)]/50 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--dash-text-muted)]">
                Pré-resultados em Tempo Real
              </span>
              {isFetchingProducts && <Loader2 size={12} className="animate-spin text-primary" />}
            </div>

            <div className="max-h-80 overflow-y-auto custom-scrollbar p-1 space-y-1">
              {matchingProducts.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-[var(--dash-text-muted)]">
                  Nenhum produto encontrado para &quot;{globalSearchQuery}&quot;
                </div>
              ) : (
                matchingProducts.map((p, idx) => {
                  const qty = p.stock_quantity ?? 0;
                  const isInStock = (p.is_in_stock ?? true) && qty > 0;
                  const isLowStock = isInStock && qty <= 5;
                  const isOutOfStock = !p.is_in_stock || qty <= 0;
                  const isHighlighted = highlightedIndex === idx;

                  const priceFormatted = p.price != null
                    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.price)
                    : null;

                  return (
                    <div
                      key={p.id || idx}
                      onClick={() => handleSelectProduct(p)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                        isHighlighted
                          ? "bg-[var(--dash-hover-bg)] ring-1 ring-primary/30"
                          : "hover:bg-[var(--dash-hover-bg)]"
                      }`}
                    >
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] flex items-center justify-center">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <Package size={18} className="text-[var(--dash-text-muted)] opacity-50" />
                        )}
                      </div>

                      <div className="flex flex-1 flex-col min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-[var(--dash-text-primary)] truncate">
                            {p.name}
                          </p>
                          {priceFormatted && (
                            <span className="text-xs font-extrabold text-primary shrink-0">
                              {priceFormatted}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-0.5">
                          {p.sku && (
                            <span className="text-[10px] text-[var(--dash-text-muted)] font-mono truncate">
                              SKU: {p.sku}
                            </span>
                          )}

                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider text-red-500 bg-red-500/10 px-1.5 py-0.2 rounded border border-red-500/20">
                              🔴 Esgotado
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                              🟡 Baixo ({qty})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                              🟢 {qty} un
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {globalSearchQuery.trim() && (
              <div className="p-1 border-t border-[var(--dash-border)]/50">
                <button
                  onClick={handleViewAllResults}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
                >
                  Ver todos os resultados no Estoque
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
