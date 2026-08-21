"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Package, 
  X, 
  ArrowRight, 
  Loader2, 
  AlertTriangle, 
  XCircle, 
  Layers, 
  BarChart3, 
  ArrowUpRight,
  Users,
  User,
  Mail,
  Phone
} from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  smartSearchMatch, 
  detectAnalyticsQuery, 
  AnalyticsQueryType,
  smartSearchCollaboratorMatch,
  SearchCollaboratorItem
} from "@/lib/utils/smart-search";
import { getSellers } from "@/lib/dashboard/sellerActions";
import { QuickSearchProduct } from "../QuickSearchProductModal";

interface HeaderSearchPopoverProps {
  products?: QuickSearchProduct[];
  collaborators?: SearchCollaboratorItem[];
  onSelectProduct?: (product: QuickSearchProduct) => void;
  onOpenAnalyticsModal?: (type: "out_of_stock" | "low_stock" | "categories" | "global_stock") => void;
}

export function HeaderSearchPopover({ 
  products: initialProducts = [], 
  collaborators = [],
  onSelectProduct, 
  onOpenAnalyticsModal 
}: HeaderSearchPopoverProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [globalSearchQuery, setGlobalSearchQuery] = useState(searchParams?.get("search") || "");
  const [productsList, setProductsList] = useState<QuickSearchProduct[]>(initialProducts);
  const [collaboratorsList, setCollaboratorsList] = useState<SearchCollaboratorItem[]>(collaborators);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);
  const [hasFetchedProducts, setHasFetchedProducts] = useState(initialProducts.length > 0 && collaborators.length > 0);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const searchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialProducts.length > 0) {
      setProductsList(initialProducts);
    }
  }, [initialProducts]);

  useEffect(() => {
    if (collaborators.length > 0) {
      setCollaboratorsList(collaborators);
    }
  }, [collaborators]);

  useEffect(() => {
    const urlQuery = searchParams?.get("search");
    if (urlQuery !== null && urlQuery !== undefined && urlQuery !== globalSearchQuery) {
      setGlobalSearchQuery(urlQuery);
    }
  }, [searchParams]);

  const fetchSearchProducts = useCallback(async () => {
    if (hasFetchedProducts || isFetchingProducts) return;
    setIsFetchingProducts(true);
    try {
      const shadowOrgId = typeof document !== 'undefined'
        ? document.cookie.split("; ").find((row) => row.startsWith("shadow_org_id="))?.split("=")[1]
        : null;

      if (initialProducts.length === 0) {
        let query = supabase
          .from("products")
          .select("id, name, sku, image_url, stock_quantity, is_in_stock, price, compare_at_price, category_id, categories(name), organization_id")
          .is("deleted_at", null);

        if (shadowOrgId) {
          query = query.eq("organization_id", shadowOrgId);
        }

        let res: any = await query.order("name");

        if (res.error) {
          console.warn("[HeaderSearchPopover] Fallback para busca direta sem join:", res.error.message);
          let fallbackQuery = supabase
            .from("products")
            .select("id, name, sku, image_url, stock_quantity, is_in_stock, price, compare_at_price, category_id, organization_id")
            .is("deleted_at", null);

          if (shadowOrgId) {
            fallbackQuery = fallbackQuery.eq("organization_id", shadowOrgId);
          }
          res = await fallbackQuery.order("name");
        }

        if (res.data) {
          setProductsList(res.data as any[]);
        }
      }

      if (collaborators.length === 0) {
        try {
          const sRes = await getSellers();
          if (sRes?.sellers && sRes.sellers.length > 0) {
            setCollaboratorsList(sRes.sellers as any[]);
          }
        } catch (sErr) {
          console.warn("Erro ao buscar colaboradores fallback no HeaderSearchPopover:", sErr);
        }
      }

      setHasFetchedProducts(true);
    } catch (e) {
      console.error("Erro ao buscar dados para pesquisa:", e);
    } finally {
      setIsFetchingProducts(false);
    }
  }, [supabase, hasFetchedProducts, isFetchingProducts, initialProducts, collaborators]);

  const activeProducts = (initialProducts && initialProducts.length > 0) ? initialProducts : productsList;
  const activeCollaborators = (collaborators && collaborators.length > 0) ? collaborators : collaboratorsList;

  const matchingProducts = globalSearchQuery.trim()
    ? activeProducts.filter((p) => smartSearchMatch(p, globalSearchQuery)).slice(0, 5)
    : [];

  const matchingCollaborators = globalSearchQuery.trim()
    ? activeCollaborators.filter((c) => smartSearchCollaboratorMatch(c, globalSearchQuery)).slice(0, 4)
    : [];

  const detectedAnalytics = detectAnalyticsQuery(globalSearchQuery);

  const hasAnyResults = matchingProducts.length > 0 || matchingCollaborators.length > 0 || detectedAnalytics !== null;

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
    if (!isPopoverOpen) return;

    const totalSelectable = matchingCollaborators.length + matchingProducts.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < totalSelectable - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : totalSelectable - 1));
    } else if (e.key === "Escape") {
      setIsPopoverOpen(false);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        if (highlightedIndex < matchingCollaborators.length) {
          handleSelectCollaborator(matchingCollaborators[highlightedIndex]);
          return;
        }
        const productIndex = highlightedIndex - matchingCollaborators.length;
        if (matchingProducts[productIndex]) {
          handleSelectProduct(matchingProducts[productIndex]);
          return;
        }
      }
      
      if (detectedAnalytics && onOpenAnalyticsModal) {
        handleSelectAnalytics(detectedAnalytics);
      } else if (matchingCollaborators.length > 0 && matchingProducts.length === 0) {
        handleSelectCollaborator(matchingCollaborators[0]);
      } else if (matchingProducts.length > 0) {
        handleSelectProduct(matchingProducts[0]);
      } else if (globalSearchQuery.trim()) {
        setIsPopoverOpen(false);
        router.push(`/dashboard/estoque?search=${encodeURIComponent(globalSearchQuery.trim())}`);
      }
    }
  };

  const handleSelectProduct = (product: QuickSearchProduct) => {
    setIsPopoverOpen(false);
    if (onSelectProduct) onSelectProduct(product);
    router.push(`/dashboard/catalogo?editProduct=${product.id}`);
  };

  const handleSelectCollaborator = (collaborator: SearchCollaboratorItem) => {
    setIsPopoverOpen(false);
    router.push(`/dashboard/vendedores?editSeller=${collaborator.id}`);
  };

  const handleSelectAnalytics = (type: AnalyticsQueryType) => {
    if (!type) return;
    setIsPopoverOpen(false);
    if (onOpenAnalyticsModal) {
      onOpenAnalyticsModal(type);
    } else {
      router.push(`/dashboard/estoque?search=${encodeURIComponent(globalSearchQuery.trim())}`);
    }
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
        placeholder="Buscar produtos, equipe, SKUs, esgotados..." 
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

            {/* Banner de Atalho para Modal Analítico */}
            {detectedAnalytics && (
              <div className="p-1 border-b border-[var(--dash-border)]/40 mb-1">
                <button
                  type="button"
                  onClick={() => handleSelectAnalytics(detectedAnalytics)}
                  className={`w-full flex items-center justify-between gap-3 p-3 rounded-[27px] transition-all cursor-pointer text-left shadow-sm active:scale-95 ${
                    detectedAnalytics === "out_of_stock"
                      ? "bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20"
                      : detectedAnalytics === "low_stock"
                      ? "bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500/20"
                      : detectedAnalytics === "categories"
                      ? "bg-purple-500/10 border border-purple-500/30 text-purple-500 hover:bg-purple-500/20"
                      : "bg-blue-500/10 border border-blue-500/30 text-blue-500 hover:bg-blue-500/20"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-current/10 shrink-0">
                      {detectedAnalytics === "out_of_stock" && <XCircle size={18} />}
                      {detectedAnalytics === "low_stock" && <AlertTriangle size={18} />}
                      {detectedAnalytics === "categories" && <Layers size={18} />}
                      {detectedAnalytics === "global_stock" && <BarChart3 size={18} />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-black uppercase tracking-wider leading-tight truncate">
                        {detectedAnalytics === "out_of_stock" && "Abrir Diagnóstico de Esgotados"}
                        {detectedAnalytics === "low_stock" && "Abrir Alertas de Estoque Baixo"}
                        {detectedAnalytics === "categories" && "Abrir Volumetria por Categoria"}
                        {detectedAnalytics === "global_stock" && "Abrir Visão Geral do Estoque"}
                      </span>
                      <span className="text-[10px] font-medium opacity-80 leading-none mt-1 truncate">
                        Clique para visualizar o painel completo
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="shrink-0 opacity-80" />
                </button>
              </div>
            )}

            <div className="max-h-80 overflow-y-auto custom-scrollbar p-1 space-y-2">
              {!hasAnyResults ? (
                <div className="px-4 py-6 text-center text-xs text-[var(--dash-text-muted)]">
                  Nenhum resultado encontrado para &quot;{globalSearchQuery}&quot;
                </div>
              ) : (
                <>
                  {/* SEÇÃO DE COLABORADORES */}
                  {matchingCollaborators.length > 0 && (
                    <div className="space-y-1">
                      <div className="px-3 py-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-500">
                        <Users size={12} />
                        <span>Equipe & Colaboradores ({matchingCollaborators.length})</span>
                      </div>

                      {matchingCollaborators.map((c, cIdx) => {
                        const isHighlighted = highlightedIndex === cIdx;
                        const colabName = c.full_name || c.name || "Colaborador";
                        const colabRole = c.job_title || (c.role === "admin" ? "Administrador" : "Vendedor");
                        const isColabActive = c.status !== "inactive" && c.is_active !== false;

                        return (
                          <div
                            key={c.id || cIdx}
                            onClick={() => handleSelectCollaborator(c)}
                            onMouseEnter={() => setHighlightedIndex(cIdx)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                              isHighlighted
                                ? "bg-emerald-500/10 ring-1 ring-emerald-500/30"
                                : "hover:bg-[var(--dash-hover-bg)]"
                            }`}
                          >
                            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-xs">
                              {c.avatar_url ? (
                                <img src={c.avatar_url} alt={colabName} className="h-full w-full object-cover rounded-full" />
                              ) : (
                                <span>{colabName.charAt(0).toUpperCase()}</span>
                              )}
                            </div>

                            <div className="flex flex-1 flex-col min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-bold text-[var(--dash-text-primary)] truncate">
                                  {colabName}
                                </p>
                                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                                  {colabRole}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 mt-0.5 text-[10px] text-[var(--dash-text-muted)]">
                                {c.email && (
                                  <span className="flex items-center gap-1 truncate max-w-[150px]">
                                    <Mail size={10} className="shrink-0" />
                                    {c.email}
                                  </span>
                                )}
                                {c.whatsapp && (
                                  <span className="flex items-center gap-1 shrink-0">
                                    <Phone size={10} className="shrink-0" />
                                    {c.whatsapp}
                                  </span>
                                )}
                                <span className={`inline-flex items-center gap-0.5 text-[8px] font-black uppercase ml-auto ${
                                  isColabActive ? "text-emerald-500" : "text-zinc-400"
                                }`}>
                                  {isColabActive ? "🟢 Ativo" : "⚪ Inativo"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* SEÇÃO DE PRODUTOS */}
                  {matchingProducts.length > 0 && (
                    <div className="space-y-1 pt-1">
                      {matchingCollaborators.length > 0 && (
                        <div className="px-3 py-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[var(--dash-text-muted)] border-t border-[var(--dash-border)]/40 mt-1 pt-2">
                          <Package size={12} />
                          <span>Produtos ({matchingProducts.length})</span>
                        </div>
                      )}

                      {matchingProducts.map((p, idx) => {
                        const itemIndex = matchingCollaborators.length + idx;
                        const qty = p.stock_quantity ?? 0;
                        const isInStock = (p.is_in_stock ?? true) && qty > 0;
                        const isLowStock = isInStock && qty <= 5;
                        const isOutOfStock = !p.is_in_stock || qty <= 0;
                        const isHighlighted = highlightedIndex === itemIndex;

                        const priceFormatted = p.price != null
                          ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.price)
                          : null;

                        return (
                          <div
                            key={p.id || idx}
                            onClick={() => handleSelectProduct(p)}
                            onMouseEnter={() => setHighlightedIndex(itemIndex)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                              isHighlighted
                                ? "bg-[var(--dash-hover-bg)] ring-1 ring-primary/30"
                                : "hover:bg-[var(--dash-hover-bg)]"
                            }`}
                          >
                            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] flex items-center justify-center">
                              {p.image_url ? (
                                <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                              ) : (
                                <Package size={16} className="text-[var(--dash-text-muted)] opacity-50" />
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
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {globalSearchQuery.trim() && matchingProducts.length > 0 && (
              <div className="p-1 border-t border-[var(--dash-border)]/50 mt-1">
                <button
                  onClick={handleViewAllResults}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
                >
                  Ver todos os produtos no Estoque
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
