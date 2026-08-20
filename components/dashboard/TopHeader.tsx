"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  ChevronDown, 
  User, 
  LogOut,
  Menu,
  ExternalLink,
  MessageCircle,
  Package,
  Clock,
  X,
  ArrowRight,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useGlobalBranding } from "@/components/providers/GlobalBrandingProvider";
import { getAccessStatusName, getAccessStatusColor } from "@/lib/utils/permissions";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { smartSearchMatch } from "@/lib/utils/smart-search";
import { QuickSearchProductModal, QuickSearchProduct } from "./QuickSearchProductModal";

interface TopHeaderProps {
  nome: string;
  avatar: string | null;
  role: string;
  isDark: boolean;
  toggleTheme: () => void;
  handleLogout: () => void;
  onMenuClick: () => void;
  slug?: string | null;
  isReady: boolean;
  businessModel?: "B2B" | "B2C" | "CaaS" | "ALL_SERVICE";
  isAdminPath?: boolean;
  subscriptionStatus?: string;
  notifications?: any[];
  jobTitle?: string | null;
  granularPermissions?: any;
}

export function TopHeader({ 
  nome, 
  avatar, 
  role, 
  isDark, 
  toggleTheme, 
  handleLogout,
  onMenuClick,
  slug,
  isReady,
  businessModel,
  isAdminPath,
  subscriptionStatus,
  notifications = [],
  jobTitle,
  granularPermissions
}: TopHeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  // Estados de busca preditiva (Live Popover)
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [productsList, setProductsList] = useState<QuickSearchProduct[]>([]);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);
  const [hasFetchedProducts, setHasFetchedProducts] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedProductModal, setSelectedProductModal] = useState<QuickSearchProduct | null>(null);

  const searchRef = useRef<HTMLDivElement | null>(null);
  const isB2B = businessModel === "B2B" || businessModel === "ALL_SERVICE";
  const isCaaS = businessModel === "CaaS";
  const { globalIconUrl } = useGlobalBranding();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const [lastReadTime, setLastReadTime] = useState(0);

  // Busca produtos no Supabase (em cache local para respostas instantâneas)
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

  // Produtos filtrados via smartSearchMatch
  const matchingProducts = globalSearchQuery.trim()
    ? productsList.filter((p) => smartSearchMatch(p, globalSearchQuery)).slice(0, 6)
    : [];

  useEffect(() => {
    const savedTime = localStorage.getItem("last_read_bell_time");
    if (savedTime) setLastReadTime(parseInt(savedTime, 10));
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasUnread = notifications.some(n => new Date(n.created_at).getTime() > lastReadTime);

  const handleOpenNotifications = () => {
    const nextState = !isNotificationsOpen;
    setIsNotificationsOpen(nextState);
    if (nextState && notifications.length > 0) {
      const latest = new Date(notifications[0].created_at).getTime();
      setLastReadTime(latest);
      localStorage.setItem("last_read_bell_time", latest.toString());
    }
  };

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
        setSelectedProductModal(item);
        setIsPopoverOpen(false);
      } else if (globalSearchQuery.trim()) {
        setIsPopoverOpen(false);
        router.push(`/dashboard/estoque?search=${encodeURIComponent(globalSearchQuery.trim())}`);
      }
    }
  };

  const handleSelectProduct = (product: QuickSearchProduct) => {
    setSelectedProductModal(product);
    setIsPopoverOpen(false);
  };

  const handleViewAllResults = () => {
    setIsPopoverOpen(false);
    router.push(`/dashboard/estoque?search=${encodeURIComponent(globalSearchQuery.trim())}`);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b bg-[var(--dash-bg)]/80 px-4 md:px-6 backdrop-blur-xl">
        <div className="flex items-center gap-3 md:gap-4 flex-1">
          <button 
            onClick={onMenuClick}
            className="rounded-lg p-2 hover:bg-[var(--dash-hover-bg)] lg:hidden text-[var(--dash-text-primary)]"
          >
            <Menu size={20} />
          </button>
          
          {/* Campo de Busca Principal (Com Popover Flutuante) */}
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
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {subscriptionStatus && !isAdminPath && role !== "seller" && (
            <div className={`hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded border text-[10px] font-bold uppercase tracking-wider ${
              subscriptionStatus === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
              subscriptionStatus === 'trialing' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
              subscriptionStatus === 'past_due' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
              'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                subscriptionStatus === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' :
                subscriptionStatus === 'trialing' ? 'bg-purple-500' :
                subscriptionStatus === 'past_due' ? 'bg-amber-500 animate-pulse' :
                'bg-zinc-500'
              }`} />
              {subscriptionStatus === 'active' ? 'Assinatura Ativa' :
               subscriptionStatus === 'trialing' ? 'Período de Teste' :
               subscriptionStatus === 'past_due' ? 'Pagamento Atrasado' :
               'Assinatura'}
            </div>
          )}

          <div ref={notificationsRef} className="relative">
            <button 
              onClick={handleOpenNotifications}
              className="relative rounded-lg p-2.5 text-[var(--dash-text-secondary)] hover:bg-[var(--dash-hover-bg)] hover:text-primary transition-all"
            >
              <Bell size={20} />
              {hasUnread && (
                <span className="absolute right-2 top-2 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                </span>
              )}
            </button>

            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-80 rounded-[27px] p-0 shadow-2xl overflow-hidden z-[100] border border-[var(--dash-border)] bg-[var(--dash-surface)]"
                >
                  <div className="px-4 py-3 border-b border-[var(--dash-border)]/50 flex items-center justify-between">
                    <p className="text-sm font-bold text-[var(--dash-text-primary)]">Notificações</p>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-[var(--dash-hover-bg)] px-2 py-0.5 rounded-full text-[var(--dash-text-muted)]">
                      {notifications.length} recentes
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar flex flex-col">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-[var(--dash-text-muted)] text-xs flex flex-col items-center gap-2">
                        <Bell size={24} className="opacity-20" />
                        <p>Nenhuma notificação por enquanto.</p>
                      </div>
                    ) : (
                      notifications.map((n, idx) => {
                        const isLead = n.notification_type === 'new_lead';
                        const isUpdate = n.notification_type === 'catalog_update';
                        const dateStr = new Date(n.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

                        return (
                          <div key={idx} className="flex gap-3 px-4 py-3 hover:bg-[var(--dash-hover-bg)] transition-colors border-b border-[var(--dash-border)]/30 last:border-0 cursor-pointer">
                            <div className={`mt-0.5 h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${
                              isLead ? "bg-emerald-500/10 text-emerald-500" : 
                              isUpdate ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"
                            }`}>
                              {isLead ? <MessageCircle size={14} /> : isUpdate ? <Package size={14} /> : <Bell size={14} />}
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <p className="text-xs font-bold text-[var(--dash-text-primary)] truncate">
                                {isLead ? `Novo Lead para ${n.product_name}` : 
                                 isUpdate ? `${n.action_type === 'INSERT' ? 'Novo Produto' : n.action_type === 'UPDATE' ? 'Produto Atualizado' : 'Produto Removido'} (${n.catalog_name})` : 
                                 n.product_name || "Aviso do Sistema"}
                              </p>
                              <p className="text-[10px] text-[var(--dash-text-muted)] mt-0.5 truncate leading-tight">
                                {isLead ? `Vendedor: ${n.seller_name}` : 
                                 isUpdate ? n.product_name : 
                                 "Confira mais detalhes no sistema"}
                              </p>
                              <p className="text-[9px] text-[var(--dash-text-muted)] font-medium mt-1 flex items-center gap-1 opacity-70">
                                <Clock size={10} /> {dateStr}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg p-2.5 text-[var(--dash-text-secondary)] hover:bg-[var(--dash-hover-bg)] hover:text-primary transition-all"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {!isAdminPath && slug && (
            <Link
              href={isB2B ? `/${slug}/catalogo` : `/${slug}`}
              target="_blank"
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap shadow-lg ${
                isReady 
                  ? "bg-emerald-500 text-white shadow-emerald-500/20 hover:scale-105" 
                  : "bg-[var(--dash-hover-bg)] text-[var(--dash-text-secondary)] border border-[var(--dash-border)] opacity-80 hover:opacity-100"
              }`}
              title={isReady ? "Seu sistema está online" : "Ainda em rascunho - Complete o checklist"}
            >
              {isReady ? <ExternalLink size={18} /> : <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />}
              <span className="hidden lg:inline">
                {isCaaS || isB2B ? "Ver catálogo online" : "Visualizar cartão online"}
              </span>
              <span className="lg:hidden">{isCaaS || isB2B ? "Catálogo" : "Cartão"}</span>
            </Link>
          )}

          <div className="h-8 w-[1px] bg-[var(--dash-border)] mx-1" />

          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 sm:gap-3 rounded-lg p-1 pr-2 transition-all hover:bg-[var(--dash-hover-bg)]"
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={nome}
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg object-contain"
                />
              ) : (role === "main_admin" && globalIconUrl) ? (
                <img
                  src={globalIconUrl}
                  alt={nome}
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg object-contain p-1"
                />
              ) : (
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-primary text-white text-xs sm:text-sm font-bold shadow-sm">
                  {nome.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden sm:flex flex-col items-start text-left">
                <span className="text-xs font-semibold leading-none text-[var(--dash-text-primary)]">{role === "main_admin" ? "Gestor Global" : nome}</span>
                <span className="text-[10px] text-[var(--dash-text-muted)] font-medium capitalize mt-1 leading-none">
                  {role === "main_admin" ? "MAIN Admin" : 
                   businessModel === "CaaS" ? "Gestor de Catálogo" :
                   role === "b2b_admin" ? "Gestor Empresarial" : 
                   role === "b2c_admin" ? "Gestor Individual" : 
                   role === "caas_admin" ? "Gestor de Catálogo" : 
                   role === "seller" ? (jobTitle || "Vendedor") : role}
                </span>
                {role === 'seller' && (
                  <span className={`mt-1.5 inline-flex items-center rounded px-1.5 py-[2px] text-[9px] font-black uppercase tracking-widest border ${getAccessStatusColor(getAccessStatusName(granularPermissions))}`}>
                    {getAccessStatusName(granularPermissions)}
                  </span>
                )}
              </div>
              <ChevronDown size={14} className={`text-[var(--dash-text-muted)] transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-64 rounded-[27px] p-2 shadow-2xl overflow-hidden z-[100] border border-[var(--dash-border)] bg-[var(--dash-surface)]"
                >
                  <div className="px-3 py-2 mb-1 border-b border-[var(--dash-border)]/50 pb-3">
                    <p className="text-[10px] font-bold text-[var(--dash-text-muted)] uppercase tracking-wider">Conta</p>
                    <p className="text-xs font-medium text-[var(--dash-text-primary)] mt-0.5 truncate">{role === "main_admin" ? "Gestor Global" : nome}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Link
                      href="/dashboard/perfil#perfil"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--dash-text-secondary)] transition-all hover:bg-[var(--dash-hover-bg)] hover:text-primary"
                    >
                      <User size={16} />
                      Meu Perfil
                    </Link>
                  </div>
                  <div
                    role="button"
                    onClick={(e) => {
                      console.log("Logout clicado!");
                      handleLogout();
                    }}
                    className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer"
                  >
                    <LogOut size={16} />
                    Sair
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Modal Rápido de Detalhes do Produto */}
      <QuickSearchProductModal
        product={selectedProductModal}
        onClose={() => setSelectedProductModal(null)}
      />
    </>
  );
}
