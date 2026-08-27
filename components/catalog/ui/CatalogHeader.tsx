"use client";

import { m as motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, MessageCircle, Share2, ShieldCheck, ShoppingBag, Building2, Sparkles, LogOut } from "lucide-react";
import PublicThemeToggle from "@/components/PublicThemeToggle";
import React, { memo } from "react";
import Image from "next/image";

const CatalogHeaderBase = ({
  isEmbed,
  slug,
  isPureCatalog,
  logoUrl,
  avatarUrl,
  fullName,
  primaryColor,
  businessStatus,
  bio,
  hideCta,
  whatsappUrl,
  handleShare,
  setShowWarning,
  trackAnalyticsEvent,
  trackLead,
  catalogName,
  catalogDescription,
  profileId,
  catalogId,
  organizationId,
  acceptsMessagesWhenClosed = true,
  isB2B = false,
  b2bClient = null,
  onOpenFastOrder,
  onOpenRegister,
  onLogoutB2b,
}: any) => {
  if (isEmbed) return null;

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-[var(--public-glass-bg)] border-b border-[var(--public-card-border)] backdrop-blur-xl shadow-sm px-4 sm:px-6 py-2.5 sm:py-3"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        
        {/* 1. Esquerda: Logo / Identidade da Loja */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 shrink-0">
          {!isPureCatalog && !b2bClient && (
            <Link 
              href={`/${slug}`} 
              className="flex items-center gap-1 text-[var(--public-text-dim)] hover:text-[var(--public-text-main)] transition-colors p-1 -ml-1 rounded-lg hover:bg-[var(--public-card-bg)]"
              title="Voltar"
            >
              <ChevronLeft size={20} />
            </Link>
          )}

          <div className="flex items-center gap-2.5 min-w-0">
            {isPureCatalog && logoUrl ? (
              <Image 
                src={logoUrl} 
                alt="Logo" 
                width={140} 
                height={36} 
                priority 
                className="h-7 sm:h-8 w-auto object-contain shrink-0" 
              />
            ) : (
              <div className="relative shrink-0">
                {!isPureCatalog && (
                  <div className="absolute inset-[-2px] rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-400 opacity-60" />
                )}
                {avatarUrl ? (
                  <Image 
                    src={avatarUrl} 
                    alt={fullName || "Avatar"} 
                    width={38} 
                    height={38} 
                    priority 
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover border border-[var(--public-card-bg)] relative z-10" 
                  />
                ) : (
                  <div 
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[var(--public-card-bg)] flex items-center justify-center text-xs font-bold border border-[var(--public-card-bg)] relative z-10" 
                    style={{ color: primaryColor }}
                  >
                    {(fullName || slug || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                {!isPureCatalog && (
                  <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--public-card-bg)] z-20 ${businessStatus.isAvailableNow ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                )}
              </div>
            )}
            
            <div className="min-w-0 hidden xs:flex flex-col">
              <div className="flex items-center gap-1.5">
                <p className="text-xs sm:text-sm font-bold text-[var(--public-text-main)] leading-tight truncate max-w-[120px] sm:max-w-[180px] md:max-w-[220px]">
                  {fullName || (isPureCatalog ? "Catálogo" : "Vendedor")}
                </p>
                <span className="inline-block shrink-0 text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider border border-emerald-500/20 whitespace-nowrap">
                  {businessStatus.statusMessage}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Centro: Badge Integrada de Usuário B2B / Convite para Revenda */}
        {isB2B && (
          <div className="flex-1 flex items-center justify-center min-w-0 px-2">
            {b2bClient ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 max-w-full text-xs shadow-sm">
                <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 shrink-0">
                  <ShieldCheck size={13} />
                </div>
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                  <span className="font-bold text-[var(--public-text-main)] truncate max-w-[130px] sm:max-w-[200px]">
                    {b2bClient.company_name}
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded-md bg-emerald-500 text-white uppercase tracking-wider whitespace-nowrap shrink-0">
                    Parceiro Homologado
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => onOpenRegister?.()}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[var(--public-card-bg)] border border-[var(--public-card-border)] text-emerald-500 hover:text-emerald-400 hover:border-emerald-500/40 transition-all shadow-sm cursor-pointer"
              >
                <Sparkles size={13} className="text-emerald-400" />
                <span>Quero ser Revendedor</span>
              </button>
            )}
          </div>
        )}

        {/* 3. Direita: Ações (Pedido em Lote, WhatsApp, Tema, Compartilhar) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {isB2B && b2bClient ? (
            <>
              <button
                onClick={() => onOpenFastOrder?.()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <ShoppingBag size={13} />
                <span className="hidden sm:inline">Pedido em Lote</span>
                <span className="sm:hidden">Lote</span>
              </button>
              <button
                onClick={onLogoutB2b}
                className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium rounded-xl border border-[var(--public-card-border)] bg-[var(--public-card-bg)] text-[var(--public-text-dim)] hover:text-rose-500 hover:border-rose-500/30 transition-all cursor-pointer flex items-center gap-1"
                title="Sair do ambiente B2B"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </>
          ) : (
            <>
              {isB2B && (
                <button
                  onClick={() => onOpenRegister?.()}
                  className="md:hidden inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                >
                  <Sparkles size={12} />
                  <span>Revenda</span>
                </button>
              )}
              {!hideCta && whatsappUrl && (
                !businessStatus.isAvailableNow && !acceptsMessagesWhenClosed ? (
                  <button
                    disabled
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all opacity-60 cursor-not-allowed bg-[var(--public-card-border)] text-[var(--public-text-muted)]"
                  >
                    <MessageCircle size={13} />
                    <span>Fechado</span>
                  </button>
                ) : (
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      if (!businessStatus.isAvailableNow) {
                        setShowWarning(true);
                        void trackAnalyticsEvent({
                          profileId,
                          catalogId,
                          eventType: "whatsapp_click_closed",
                          pageType: "catalog_header",
                          metadata: { slug }
                        });
                      } else {
                        void trackLead();
                        void trackAnalyticsEvent({
                          profileId,
                          catalogId,
                          organizationId: organizationId,
                          eventType: "whatsapp_click",
                          pageType: "catalog_header",
                          metadata: { slug }
                        });
                        window.open(whatsappUrl, "_blank");
                      }
                    }}
                    className="hidden sm:flex items-center gap-1.5 bg-[#25D366] hover:opacity-90 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    <MessageCircle size={13} />
                    <span>WhatsApp</span>
                  </button>
                )
              )}
            </>
          )}

          <PublicThemeToggle className="h-8 w-8 rounded-full flex items-center justify-center bg-[var(--public-bg)] border border-[var(--public-card-border)] hover:bg-[var(--public-card-bg)] transition-colors text-[var(--public-text-main)] shadow-sm" />
          
          <button 
            onClick={() => handleShare(
              catalogName || "Catálogo",
              catalogDescription || "",
              window.location.href.split('#')[0]
            )}
            className="h-8 w-8 rounded-full flex items-center justify-center bg-[var(--public-bg)] border border-[var(--public-card-border)] hover:bg-[var(--public-card-bg)] transition-colors text-[var(--public-text-main)] shadow-sm cursor-pointer"
            title="Compartilhar"
          >
            <Share2 size={15} />
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export const CatalogHeader = memo(CatalogHeaderBase);
