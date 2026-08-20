"use client";

import { useState } from "react";
import { Sun, Moon, Menu, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useGlobalBranding } from "@/components/providers/GlobalBrandingProvider";
import { QuickSearchProductModal, QuickSearchProduct } from "./QuickSearchProductModal";
import { HeaderSearchPopover } from "./header/HeaderSearchPopover";
import { HeaderNotificationsMenu } from "./header/HeaderNotificationsMenu";
import { HeaderUserMenu } from "./header/HeaderUserMenu";

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
  products?: any[];
  onOpenAnalyticsModal?: (type: "out_of_stock" | "low_stock" | "categories" | "global_stock") => void;
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
  granularPermissions,
  products = [],
  onOpenAnalyticsModal
}: TopHeaderProps) {
  const [selectedProductModal, setSelectedProductModal] = useState<QuickSearchProduct | null>(null);

  const isB2B = businessModel === "B2B" || businessModel === "ALL_SERVICE";
  const isCaaS = businessModel === "CaaS";
  const { globalIconUrl } = useGlobalBranding();

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
          
          {/* Componente de Busca Preditiva de Produtos */}
          <HeaderSearchPopover 
            products={products}
            onSelectProduct={(product) => setSelectedProductModal(product)} 
            onOpenAnalyticsModal={onOpenAnalyticsModal}
          />
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

          {/* Componente de Notificações */}
          <HeaderNotificationsMenu notifications={notifications} />

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

          {/* Componente de Menu do Usuário */}
          <HeaderUserMenu
            nome={nome}
            avatar={avatar}
            role={role}
            globalIconUrl={globalIconUrl}
            businessModel={businessModel}
            jobTitle={jobTitle}
            granularPermissions={granularPermissions}
            handleLogout={handleLogout}
          />
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
