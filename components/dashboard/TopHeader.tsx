"use client";
import { useState, useRef, useEffect } from "react";
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
  Clock
} from "lucide-react";
import Link from "next/link";
import { useGlobalBranding } from "@/components/providers/GlobalBrandingProvider";
import { getAccessStatusName, getAccessStatusColor } from "@/lib/utils/permissions";

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
  const isB2B = businessModel === "B2B" || businessModel === "ALL_SERVICE";
  const isCaaS = businessModel === "CaaS";
  const { globalIconUrl } = useGlobalBranding();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const [lastReadTime, setLastReadTime] = useState(0);

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

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b bg-[var(--dash-bg)]/80 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="rounded-lg p-2 hover:bg-[var(--dash-hover-bg)] lg:hidden"
        >
          <Menu size={20} />
        </button>
        
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-text-muted)]" size={18} />
          <input 
            type="text" 
            placeholder="Buscar recursos..." 
            className="h-10 w-64 rounded-xl border bg-[var(--dash-input-bg)] pl-10 pr-4 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {subscriptionStatus && !isAdminPath && role !== "seller" && (
          <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
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
            className="relative rounded-xl p-2.5 text-[var(--dash-text-secondary)] hover:bg-[var(--dash-hover-bg)] hover:text-primary transition-all"
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
          className="rounded-xl p-2.5 text-[var(--dash-text-secondary)] hover:bg-[var(--dash-hover-bg)] hover:text-primary transition-all"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>


        {!isAdminPath && slug && (
          <Link
            href={isB2B ? `/${slug}/catalogo` : `/${slug}`}
            target="_blank"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap shadow-lg ${
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
            className="flex items-center gap-3 rounded-xl p-1 pr-2 transition-all hover:bg-[var(--dash-hover-bg)]"
          >
            {avatar ? (
              <img
                src={avatar}
                alt={nome}
                className="h-9 w-9 rounded-lg object-contain"
              />
            ) : (role === "main_admin" && globalIconUrl) ? (
              <img
                src={globalIconUrl}
                alt={nome}
                className="h-9 w-9 rounded-lg object-contain p-1"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white text-sm font-bold shadow-sm">
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
                    className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--dash-text-secondary)] transition-all hover:bg-[var(--dash-hover-bg)] hover:text-primary"
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
                  className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer"
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
  );
}
