"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, MessageCircle, Share2 } from "lucide-react";
import PublicThemeToggle from "@/components/PublicThemeToggle";
import React, { memo } from "react";

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
  organizationId
}: any) => {
  if (isEmbed) return null;

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-[var(--public-glass-bg)] border-b border-[var(--public-card-border)] px-8 sm:px-6 py-3 sm:py-4 backdrop-blur-xl shadow-sm"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <Link href={`/${slug}`} className="flex items-center gap-1.5 group text-[var(--public-text-dim)] hover:text-[var(--public-text-main)] transition-colors shrink-0">
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs sm:text-sm font-medium hidden xs:inline">Voltar</span>
        </Link>

        <div className="flex-1 flex items-center justify-center sm:justify-start gap-3 min-w-0">
          {isPureCatalog && logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-7 sm:h-9 w-auto object-contain" />
          ) : (
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div className="absolute inset-[-2px] rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-400 opacity-60" />
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName || "Avatar"} className="h-9 w-9 sm:h-11 sm:w-11 rounded-full object-cover border-2 border-[var(--public-card-bg)] relative z-10" />
                ) : (
                  <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-[var(--public-card-bg)] flex items-center justify-center text-xs font-bold border-2 border-[var(--public-card-bg)] relative z-10" style={{ color: primaryColor }}>
                    {(fullName || slug || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--public-card-bg)] z-20 ${businessStatus.isAvailableNow ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              </div>
              
              <div className="min-w-0 flex flex-col">
                <div className="flex items-center gap-2">
                  <p className="text-sm sm:text-base font-bold text-[var(--public-text-main)] leading-none truncate">
                    {fullName || "Vendedor"}
                  </p>
                  <span className="hidden sm:inline-block text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider border border-emerald-500/20">
                    {businessStatus.statusMessage}
                  </span>
                </div>
                {bio && (
                  <p className="text-[10px] sm:text-xs text-[var(--public-text-dim)] truncate mt-1 max-w-[200px] sm:max-w-xs font-medium">
                    {bio}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {!hideCta && whatsappUrl && (
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
              className="hidden sm:flex items-center gap-2 bg-[#25D366] hover:opacity-90 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg cursor-pointer"
            >
              <MessageCircle size={14} />
              WhatsApp
            </button>
          )}
          <PublicThemeToggle className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center bg-[var(--public-bg)] border border-[var(--public-card-border)] hover:bg-[var(--public-card-bg)] transition-colors text-[var(--public-text-main)] shadow-sm" />
          <button 
            onClick={() => handleShare(
              catalogName || "Catálogo",
              catalogDescription || "",
              window.location.href.split('#')[0]
            )}
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center bg-[var(--public-bg)] border border-[var(--public-card-border)] hover:bg-[var(--public-card-bg)] transition-colors text-[var(--public-text-main)] shadow-sm cursor-pointer"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export const CatalogHeader = memo(CatalogHeaderBase);
