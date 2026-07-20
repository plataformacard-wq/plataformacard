"use client";

import { m as motion, AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import { Search, X } from "lucide-react";
import { createPortal } from "react-dom";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { ProductCatalogClientProps } from "./types";
import { useProductCatalog } from "./hooks/useProductCatalog";
import { CatalogHeader } from "./ui/CatalogHeader";
import { CatalogBannerCarousel } from "./ui/CatalogBannerCarousel";
import { CategorySection } from "./ui/CategorySection";
import { ProductModal } from "./ui/ProductModal";
import { LgpdConsentBanner } from "./ui/LgpdConsentBanner";

export default function ProductCatalogClient(props: ProductCatalogClientProps) {
  const {
    slug,
    isPureCatalog,
    logoUrl,
    avatarUrl,
    fullName,
    accentColor,
    isEmbed,
    bio,
    hideCta,
    catalogName,
    catalogDescription,
    profileId,
    catalogId,
    organizationId,
    sellerStatus,
    isAcceptingOrders,
    bannerSpeedSeconds,
    bannerInitialIndex,
    products,
    whatsapp,
    whatsappTemplate,
    acceptsMessagesWhenClosed,
    isB2B,
    hidePrices
  } = props;

  const catalog = useProductCatalog(props);
  const { state, computed, actions } = catalog;
  const primaryColor = accentColor || "#10b981";

  return (
    <LazyMotion features={domAnimation} strict>
      <div 
        id="catalog-content-wrapper"
        className={`w-full public-theme-container pb-20 selection:bg-emerald-500/30 !max-w-none !mx-0 ${isEmbed ? "min-h-0" : "min-h-screen"}`}
        style={{ 
          "--primary-color": primaryColor,
          width: '100%',
          maxWidth: 'none'
        } as any}
      >
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/5 dark:bg-blue-500/10 blur-[100px] rounded-full" />
        </div>

      <CatalogHeader
        isEmbed={isEmbed}
        slug={slug}
        isPureCatalog={isPureCatalog}
        logoUrl={logoUrl}
        avatarUrl={avatarUrl}
        fullName={fullName}
        primaryColor={primaryColor}
        businessStatus={computed.businessStatus}
        bio={bio}
        hideCta={hideCta}
        whatsappUrl={computed.whatsappUrl}
        handleShare={actions.handleShare}
        setShowWarning={actions.setShowWarning}
        trackAnalyticsEvent={trackAnalyticsEvent}
        trackLead={actions.trackLead}
        catalogName={catalogName}
        catalogDescription={catalogDescription}
        profileId={profileId}
        catalogId={catalogId}
        organizationId={organizationId}
        acceptsMessagesWhenClosed={acceptsMessagesWhenClosed}
      />
      
      <main className={`${isEmbed ? 'w-full px-8 sm:px-6 relative' : 'max-w-6xl mx-auto px-8 sm:px-6'} ${isEmbed ? 'pt-4 sm:pt-6' : 'pt-8 sm:pt-12'} z-10`}>
        {state.localShowBanners && (
          <CatalogBannerCarousel 
            banners={state.localBanners || []}
            highlightProducts={computed.highlightProducts} 
            products={products}
            primaryColor={primaryColor} 
            handleOpenProduct={actions.handleOpenProduct}
            bannerSpeedSeconds={bannerSpeedSeconds}
            bannerInitialIndex={bannerInitialIndex}
          />
        )}
        <section className="mb-12">
          {isEmbed && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--public-glass-bg)] border border-[var(--public-card-border)] backdrop-blur-md shadow-sm w-fit"
            >
              <div className={`w-2 h-2 rounded-full ${computed.businessStatus.isAvailableNow ? 'bg-emerald-500' : 'bg-slate-400'} ${computed.businessStatus.isAvailableNow ? 'animate-pulse' : ''}`} />
              <span className="text-[10px] font-black text-[var(--public-text-main)] uppercase tracking-wider">
                {computed.businessStatus.statusMessage}
              </span>
            </motion.div>
          )}
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl md:text-4xl font-black tracking-tighter text-[var(--public-text-main)] mb-4"
          >
            {catalogName || "Catálogo"}
          </motion.h1>
          {catalogDescription && (
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-[var(--public-text-dim)] text-lg leading-relaxed ${isEmbed ? 'w-full' : 'max-w-2xl'}`}
            >
              {catalogDescription}
            </motion.p>
          )}
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`mt-6 sm:mt-8 relative ${isEmbed ? 'w-full' : 'max-w-xl'}`}
          >
            <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[var(--public-text-muted)]">
              <Search size={18} className="sm:w-5 sm:h-5" />
            </div>
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={state.searchQuery}
              onChange={(e) => actions.setSearchQuery(e.target.value)}
              className="w-full bg-[var(--public-card-bg)] border border-[var(--public-card-border)] rounded-xl py-3 sm:py-4 pl-10 sm:pl-12 pr-4 sm:pr-6 text-sm sm:text-base text-[var(--public-text-main)] placeholder:text-[var(--public-text-dim)] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
            />
          </motion.div>
        </section>

        <CategorySection
          filteredCategories={computed.filteredCategories}
          searchQuery={state.searchQuery}
          primaryColor={primaryColor}
          isEmbed={isEmbed}
          isMobile={state.isMobile}
          selectedProductId={(isEmbed && state.isMobile) ? state.selectedProductId : null}
          handleOpenProduct={actions.handleOpenProduct}
          handleCloseProduct={actions.handleCloseProduct}
          sellerStatus={sellerStatus}
          isAcceptingOrders={isAcceptingOrders}
          selectedImageIndex={(isEmbed && state.isMobile) ? state.selectedImageIndex : 0}
          setSelectedImageIndex={actions.setSelectedImageIndex}
          priceMode={state.priceMode}
          setPriceMode={actions.setPriceMode}
          whatsapp={whatsapp}
          whatsappTemplate={whatsappTemplate}
          slug={slug}
          fullName={fullName}
          isB2B={isB2B}
          expandedDescriptionId={(isEmbed && state.isMobile) ? state.expandedDescriptionId : null}
          setExpandedDescriptionId={actions.setExpandedDescriptionId}
          trackLead={actions.trackLead}
          trackAnalyticsEvent={trackAnalyticsEvent}
          profileId={profileId}
          catalogId={catalogId}
          organizationId={organizationId}
          handleShare={actions.handleShare}
          hidePrices={hidePrices}
          hideCta={hideCta}
          whatsappUrl={computed.whatsappUrl}
          businessStatus={computed.businessStatus}
          lastViewTimestamp={state.lastViewTimestamp}
        />
      </main>

      {!isEmbed && (
        <footer className="mt-32 pb-20 text-center">
          <div className="flex items-center justify-center gap-3 text-[var(--public-text-dim)] text-xs font-bold uppercase tracking-[0.2em]">
            <span className="w-8 h-px bg-[var(--public-card-border)]" />
            PlataformaShop
            <span className="w-8 h-px bg-[var(--public-card-border)]" />
          </div>
        </footer>
      )}

      <ProductModal
        hasMounted={state.hasMounted}
        isEmbed={isEmbed}
        isMobile={state.isMobile}
        selectedProduct={computed.selectedProduct}
        setSelectedProductId={actions.setSelectedProductId}
        modalY={state.modalY}
        selectedImageUrl={computed.selectedImageUrl}
        isZoomed={state.isZoomed}
        zoomOrigin={state.zoomOrigin}
        handleImageZoomMove={actions.handleImageZoomMove}
        setIsZoomed={actions.setIsZoomed}
        hasMultipleImages={computed.hasMultipleImages}
        selectedImageIndex={state.selectedImageIndex}
        setSelectedImageIndex={actions.setSelectedImageIndex}
        selectedProductGallery={computed.selectedProductGallery}
        isB2B={isB2B}
        hidePrices={hidePrices}
        priceMode={state.priceMode}
        setPriceMode={actions.setPriceMode}
        productWhatsappUrl={computed.productWhatsappUrl}
        trackLead={actions.trackLead}
        trackAnalyticsEvent={trackAnalyticsEvent}
        profileId={profileId}
        catalogId={catalogId}
        organizationId={organizationId}
        slug={slug}
        handleShare={actions.handleShare}
        businessStatus={computed.businessStatus}
        hideCta={hideCta}
        primaryColor={primaryColor}
      />

      <style jsx global>{`
        .description-sticker {
          background-color: rgba(255, 255, 255, 0.75);
          border-color: rgba(0, 0, 0, 0.08);
        }
        [data-theme="dark"] .description-sticker {
          background-color: rgba(20, 20, 20, 0.75);
          border-color: rgba(255, 255, 255, 0.08);
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .ql-description-content { line-height: 1.8; font-size: 0.95rem; color: var(--public-text-dim); width: 100% !important; max-width: 100% !important; }
        .ql-description-content *, .break-words-strategy { 
          word-break: normal !important; 
          overflow-wrap: break-word !important; 
          hyphens: auto !important; 
          -webkit-hyphens: auto !important; 
          max-width: 100% !important; 
          box-sizing: border-box !important; 
        }
        .ql-description-content p { margin-bottom: 1.25rem; }
        .ql-description-content b, .ql-description-content strong { font-weight: 900; color: var(--public-text-main); }
        .public-footer-sticky { background-color: var(--public-card-bg) !important; }
        .public-footer-fade { background-image: linear-gradient(to top, var(--public-card-bg), transparent) !important; }
      `}</style>

      {/* Modal de Aviso Empático */}
      {state.hasMounted && createPortal(
        <AnimatePresence>
          {state.showWarning && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90"
              onClick={() => actions.setShowWarning(false)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative border border-[var(--public-card-border)] rounded-xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl"
                style={{ backgroundColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#18181b' : '#ffffff' }}
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={() => actions.setShowWarning(false)}
                  className="absolute top-4 right-4 text-[var(--public-text-dim)] hover:text-[var(--public-text-main)] p-2 rounded-full bg-[var(--public-status-bg)] transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
                <div className="w-16 h-16 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[var(--public-text-main)] mb-2">
                  Consultor Indisponível
                </h3>
                <p className="text-sm text-[var(--public-text-dim)] mb-8 leading-relaxed">
                  O consultor está temporariamente ausente ou fora do horário. Sua mensagem será entregue, mas o tempo de resposta pode ser maior que o habitual.
                </p>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      actions.setShowWarning(false);
                      void actions.trackLead();
                      void trackAnalyticsEvent({
                        profileId,
                        catalogId,
                        organizationId: organizationId,
                        eventType: "whatsapp_click",
                        pageType: "warning_modal",
                        metadata: { slug, action: "continue" }
                      });
                      if (computed.whatsappUrl) window.open(computed.whatsappUrl, "_blank");
                    }}
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    Estou ciente, continuar
                  </button>
                  <button
                    onClick={() => actions.setShowWarning(false)}
                    className="w-full bg-transparent border border-[var(--public-card-border)] hover:bg-[var(--public-bg)] text-[var(--public-text-main)] font-bold py-3 px-4 rounded-lg transition-colors cursor-pointer"
                  >
                    Voltar ao catálogo
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
      <LgpdConsentBanner primaryColor={primaryColor} isEmbed={isEmbed} />
    </div>
    </LazyMotion>
  );
}
