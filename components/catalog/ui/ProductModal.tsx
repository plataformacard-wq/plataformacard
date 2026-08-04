"use client";

import { m as motion, AnimatePresence } from "framer-motion";
import { Package, X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Tag, Check, Layers, Info, MessageCircle, Clock, Share2 } from "lucide-react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { sanitizeText, formatPrice } from "../utils";

export const ProductModal = ({
  hasMounted,
  isEmbed,
  isMobile,
  selectedProduct,
  setSelectedProductId,
  modalY,
  selectedImageUrl,
  isZoomed,
  zoomOrigin,
  handleImageZoomMove,
  setIsZoomed,
  hasMultipleImages,
  selectedImageIndex,
  setSelectedImageIndex,
  selectedProductGallery,
  isB2B,
  hidePrices,
  priceMode,
  setPriceMode,
  productWhatsappUrl,
  trackLead,
  trackAnalyticsEvent,
  profileId,
  catalogId,
  organizationId,
  slug,
  handleShare,
  businessStatus,
  hideCta,
  primaryColor,
  enableShoppingCart,
  onAddToCart,
  cartItems,
  onUpdateQuantity
}: any) => {
  if (!hasMounted || !selectedProduct || (isEmbed && isMobile)) return null;

  return createPortal(
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex justify-center p-4 sm:p-8"
        style={{
          alignItems: isEmbed ? 'flex-start' : 'center',
          paddingTop: isEmbed ? Math.max(20, modalY - 250) : undefined
        }}
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedProductId(null)}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-[95%] sm:w-full max-w-2xl bg-[var(--public-card-bg)] border border-[var(--public-card-border)] rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[95vh] public-modal-content z-10"
        >
          {/* Pinned Close Button */}
          <button 
            onClick={() => setSelectedProductId(null)}
            className="absolute top-4 right-4 z-40 h-10 w-10 rounded-full bg-black/45 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <X size={20} />
          </button>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="w-full bg-[var(--public-card-bg)] flex flex-col relative shrink-0">
            <div 
              className="relative aspect-[16/10] overflow-hidden flex items-center justify-center p-4 group"
              onMouseMove={isZoomed ? handleImageZoomMove : undefined}
            >
              {selectedImageUrl ? (
                <motion.div 
                  key={selectedImageUrl}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: isZoomed ? 2.5 : 1 }}
                  transition={{ 
                    scale: { type: "spring", stiffness: 200, damping: 25 },
                    opacity: { duration: 0.2 }
                  }}
                  style={{ transformOrigin: isZoomed ? (zoomOrigin || "center center") : "center center" }}
                  className={`relative w-full h-full ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                  onClick={() => setIsZoomed(!isZoomed)}
                >
                  <Image 
                    src={selectedImageUrl} 
                    alt={selectedProduct.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    className="object-contain"
                  />
                </motion.div>
              ) : (
                <Package size={100} className="text-[var(--public-text-dim)]" />
              )}

              {selectedImageUrl && (
                <button
                  onClick={(e) => { e.stopPropagation(); setIsZoomed(!isZoomed); }}
                  className={`absolute bottom-4 right-4 z-20 flex items-center gap-2 bg-black/60 hover:bg-black/80 text-white px-4 py-2 rounded-full backdrop-blur-md transition-all border border-white/10 shadow-lg cursor-pointer ${isZoomed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                >
                  {isZoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
                  <span className="text-xs font-bold uppercase tracking-wider">{isZoomed ? "Voltar" : "Lupa"}</span>
                </button>
              )}

              {hasMultipleImages && (
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedImageIndex((prev: number) => prev === 0 ? selectedProductGallery.length - 1 : prev - 1); }}
                    className="pointer-events-auto h-10 w-10 rounded-full bg-[var(--public-glass-bg)] border border-[var(--public-card-border)] shadow-lg flex items-center justify-center text-[var(--public-text-main)] hover:scale-110 transition-transform cursor-pointer"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedImageIndex((prev: number) => prev === selectedProductGallery.length - 1 ? 0 : prev + 1); }}
                    className="pointer-events-auto h-10 w-10 rounded-full bg-[var(--public-glass-bg)] border border-[var(--public-card-border)] shadow-lg flex items-center justify-center text-[var(--public-text-main)] hover:scale-110 transition-transform cursor-pointer"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>

            {hasMultipleImages && (
              <div className="p-3 border-t border-[var(--public-card-border)] flex gap-2 overflow-x-auto no-scrollbar justify-center bg-[var(--public-bg)]">
                {selectedProductGallery.map((url: string, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative h-14 w-14 rounded-lg border-2 flex-shrink-0 transition-all overflow-hidden cursor-pointer ${
                      selectedImageIndex === idx ? "border-emerald-500 scale-105" : "border-[var(--public-card-border)] opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={url} alt="" fill sizes="56px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col min-w-0 relative">
            <div className="sticky top-0 z-20 px-6 sm:px-8 py-5 bg-[var(--public-glass-bg)] backdrop-blur-md border-b border-[var(--public-card-border)]">
              <div className="flex flex-col gap-4">
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--public-text-main)] leading-tight break-words-strategy">
                  {selectedProduct.name}
                </h2>
                
                {selectedProduct.show_highlight && selectedProduct.highlight_text && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs sm:text-sm font-black uppercase tracking-wider shadow-sm w-fit break-words-strategy"
                  >
                    <Tag size={14} className="animate-pulse" />
                    {selectedProduct.highlight_text}
                  </motion.div>
                )}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                      selectedProduct.is_in_stock === false 
                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                        : selectedProduct.stock_quantity !== null && selectedProduct.stock_quantity !== undefined && Math.floor(selectedProduct.stock_quantity) <= 3
                          ? 'bg-amber-500 text-white border-amber-500 shadow-lg'
                          : 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] border-[var(--primary-color)]/20' 
                    }`} style={selectedProduct.is_in_stock !== false && !(selectedProduct.stock_quantity !== null && selectedProduct.stock_quantity !== undefined && Math.floor(selectedProduct.stock_quantity) <= 3) ? { backgroundColor: `${primaryColor}1a`, color: primaryColor, borderColor: `${primaryColor}33` } : {}}>
                      {selectedProduct.is_in_stock === false 
                        ? 'Esgotado' 
                        : selectedProduct.stock_quantity !== null && selectedProduct.stock_quantity !== undefined && Math.floor(selectedProduct.stock_quantity) <= 3
                          ? `Apenas ${Math.floor(selectedProduct.stock_quantity)} un!`
                          : 'Disponível'}
                    </span>
                    {selectedProduct.sku && (
                      <span className="px-2 py-1 rounded-md bg-[var(--public-bg)] border border-[var(--public-card-border)] text-[10px] font-black text-[var(--public-text-main)] uppercase tracking-widest">
                        REF: {selectedProduct.sku}
                      </span>
                    )}
                  </div>

                  {selectedProduct.show_colors && selectedProduct.colors && selectedProduct.colors.length > 0 && (
                    <div className="flex flex-col gap-1.5 bg-[var(--public-bg)] px-3.5 py-2 rounded-xl border border-[var(--public-card-border)]">
                      <span className="text-[9px] font-black text-[var(--public-text-dim)] uppercase tracking-widest">Opções de Cores</span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {selectedProduct.colors.map((c: any, i: number) => {
                          const name = typeof c === "string" ? `Cor ${i + 1}` : c.name;
                          const hex = typeof c === "string" ? c : c.hex || "#71717A";
                          const isOutOfStock = typeof c === "object" && (c.stock_quantity === 0 || c.is_in_stock === false);

                          return (
                            <div
                              key={i}
                              className={`relative flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-bold transition-all ${
                                isOutOfStock
                                  ? "opacity-40 border-rose-500/30 bg-rose-500/5 cursor-not-allowed"
                                  : "border-[var(--public-card-border)] bg-[var(--public-card-bg)] hover:scale-105"
                              }`}
                              title={isOutOfStock ? `${name} (Esgotado)` : `${name} (Disponível)`}
                            >
                              <span
                                className="h-3.5 w-3.5 rounded-full border border-black/20 shrink-0"
                                style={{ backgroundColor: hex }}
                              />
                              <span className="text-[10px] text-[var(--public-text-main)] font-semibold">
                                {name}
                              </span>
                              {isOutOfStock && (
                                <span className="text-[8px] uppercase tracking-tighter text-rose-500 font-bold ml-0.5">
                                  [Esgotado]
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 sm:px-10 py-8 pb-12 min-w-0">
              {selectedProduct.is_in_stock !== false && (
                hidePrices || 
                (selectedProduct.has_retail !== false && selectedProduct.price !== null) || 
                (selectedProduct.has_wholesale && selectedProduct.wholesale_price !== null)
              ) && (
                <div className="space-y-6 mb-8">
                  <div className="bg-[var(--public-bg)] border border-[var(--public-card-border)] rounded-xl p-6">
                    <div className="space-y-6">
                      {hidePrices ? (
                        <div className="flex flex-col items-center text-center p-4">
                          <p className="text-sm font-bold text-[var(--public-text-main)] mb-1">Preço sob consulta</p>
                          <p className="text-xs text-[var(--public-text-dim)]">Entre em contato via WhatsApp para negociar.</p>
                        </div>
                      ) : (
                        <>
                          {selectedProduct.has_retail !== false && (!isB2B || !selectedProduct.has_wholesale) && (
                            <div 
                              onClick={() => setPriceMode("retail")}
                              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                                priceMode === "retail" ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "bg-[var(--public-card-bg)] border-[var(--public-card-border)] opacity-60 hover:opacity-100"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-[var(--public-text-dim)] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                  <Tag size={12} /> Preço de Varejo
                                </p>
                                {priceMode === "retail" && <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center"><Check size={10} className="text-black" /></div>}
                              </div>
                              <div className="flex flex-col gap-1">
                                {selectedProduct.compare_at_price && (
                                  <div className="flex items-center gap-2 text-sm font-bold text-[var(--public-text-dim)]">
                                    <span className="text-[10px] uppercase opacity-60">De</span>
                                    <span className="line-through">{formatPrice(selectedProduct.compare_at_price)}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  {selectedProduct.compare_at_price && <span className="text-[10px] uppercase text-emerald-500/80 font-black">Por</span>}
                                  <p className="text-2xl font-extrabold text-emerald-400">
                                    {formatPrice(selectedProduct.price) || "Consulte"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {selectedProduct.has_wholesale && (
                            <div 
                              onClick={() => setPriceMode("wholesale")}
                              className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                                priceMode === "wholesale" ? "bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/10" : "bg-[var(--public-card-bg)] border-[var(--public-card-border)] opacity-60 hover:opacity-100"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                  <Layers size={12} /> Preço de Atacado
                                </p>
                                {priceMode === "wholesale" && <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center"><Check size={10} className="text-black" /></div>}
                              </div>
                              <p className="text-2xl font-extrabold text-emerald-400">
                                {formatPrice(selectedProduct.wholesale_price) || "Consulte"}
                              </p>
                              {selectedProduct.wholesale_min_quantity && (
                                <div className="mt-2">
                                  <span className="inline-block bg-emerald-500 !text-white text-[9px] font-black px-2 py-0.5 rounded-sm shadow-lg shadow-emerald-500/20 uppercase tracking-wider">
                                    Mínimo de {selectedProduct.wholesale_min_quantity} unidades
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-8">
                {selectedProduct.description && (
                  <div>
                    <h4 className="flex items-center gap-2 text-[var(--public-text-main)] font-extrabold text-lg mb-4">
                      <Info size={20} className="text-emerald-500" />
                      Descrição do Produto
                    </h4>
                    {(() => {
                      const cleanHTML = (html: string) => {
                        if (!html) return '';
                        return html.replace(/\u00a0/g, ' ').replace(/\u00ad/g, '').replace(/&nbsp;/g, ' ').replace(/&shy;/g, '');
                      };
                      return (
                        <div className="w-full block overflow-hidden">
                          <div 
                            className="text-sm leading-relaxed ql-description-content"
                            style={{ width: '100%', wordBreak: 'normal', overflowWrap: 'break-word', hyphens: 'none', WebkitHyphens: 'none', whiteSpace: 'pre-wrap', boxSizing: 'border-box' }}
                            dangerouslySetInnerHTML={{ __html: cleanHTML(selectedProduct.description) }}
                          />
                        </div>
                      );
                    })()}
                  </div>
                )}

                {selectedProduct.show_specs !== false && selectedProduct.specs && selectedProduct.specs.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 text-[var(--public-text-main)] font-extrabold text-lg mb-4">
                      <Package size={20} className="text-emerald-500" />
                      {selectedProduct.specs_title || "Especificações Técnicas"}
                    </h4>
                    <div className="grid gap-2">
                      {selectedProduct.specs.map((spec: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-[var(--public-bg)] border border-[var(--public-card-border)] rounded-xl px-4 py-3">
                          <span className="text-sm text-[var(--public-text-dim)] font-bold">{spec.chave}</span>
                          <span className="text-base text-[var(--public-text-main)] font-bold">{spec.valor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Close Scrollable Body */}
          </div>

          {productWhatsappUrl && (
              <div className="relative px-6 sm:px-8 py-5 border-t border-[var(--public-card-border)] z-30 public-footer-sticky shrink-0">
                <div className="absolute inset-x-0 -top-12 h-12 pointer-events-none public-footer-fade" />
                <div className="relative">
                  {!hideCta && (
                    selectedProduct.is_in_stock !== false ? (
                      businessStatus.isAvailableNow ? (
                        <motion.a
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          href={productWhatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            void trackLead(selectedProduct.name);
                            void trackAnalyticsEvent({
                              profileId,
                              catalogId,
                              organizationId,
                              productId: selectedProduct.id,
                              eventType: "whatsapp_click",
                              pageType: "product_modal",
                              metadata: { slug, productName: selectedProduct.name, priceMode }
                            });
                          }}
                          className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-[#25D366] hover:opacity-90 text-white font-black rounded-xl shadow-xl transition-all text-sm uppercase tracking-wider"
                          style={{ boxShadow: `0 10px 30px #25D36633` }}
                        >
                          <MessageCircle size={20} />
                          Fazer Pedido via WhatsApp
                        </motion.a>
                      ) : (
                        <div 
                          onClick={() => {
                            void trackAnalyticsEvent({
                              profileId,
                              catalogId,
                              productId: selectedProduct.id,
                              eventType: "whatsapp_click_closed",
                              pageType: "product_modal",
                              metadata: { slug, productName: selectedProduct.name, priceMode }
                            });
                          }}
                          className="flex flex-col items-center justify-center gap-1 w-full py-3 px-6 bg-[var(--public-bg)] text-[var(--public-text-dim)] rounded-xl border border-[var(--public-card-border)] transition-all cursor-pointer hover:bg-[var(--public-card-border)]/20"
                        >
                          <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider">
                            <Clock size={16} />
                            Estabelecimento Fechado
                          </div>
                          <span className="text-[10px] font-medium opacity-70">Clique para registrar interesse mesmo fechado</span>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-[var(--public-bg)] text-[var(--public-text-dim)] font-black rounded-xl border border-[var(--public-card-border)] transition-all text-sm uppercase tracking-wider cursor-not-allowed opacity-60">
                        <Package size={20} />
                        Produto Indisponível
                      </div>
                    )
                  )}

                  {/* Posição 2: Botão de Carrinho / Comanda (se habilitado) */}
                  {enableShoppingCart && onAddToCart && selectedProduct.is_in_stock !== false && (
                    (() => {
                      const existingItem = cartItems?.find((i: any) => i.product.id === selectedProduct.id);
                      if (existingItem && onUpdateQuantity) {
                        return (
                          <div 
                            onClick={(e) => e.stopPropagation()} 
                            className="mt-3 flex items-center justify-between gap-2 w-full py-2 px-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl shadow-sm"
                          >
                            <span className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">Na comanda:</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onUpdateQuantity(existingItem.id, -1)}
                                className="w-7 h-7 rounded-lg bg-[var(--public-card-bg)] border border-emerald-500/30 flex items-center justify-center font-black text-sm text-rose-500 hover:bg-rose-500/10"
                              >
                                -
                              </button>
                              <span className="font-black text-sm px-2 text-[var(--public-text-main)]">
                                {existingItem.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(existingItem.id, 1)}
                                className="w-7 h-7 rounded-lg bg-[var(--public-card-bg)] border border-emerald-500/30 flex items-center justify-center font-black text-sm text-emerald-500 hover:bg-emerald-500/10"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(selectedProduct);
                          }}
                          className="mt-3 flex items-center justify-center gap-1.5 w-full py-3 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-black rounded-xl transition-all text-xs uppercase tracking-wider cursor-pointer active:scale-95 whitespace-nowrap"
                        >
                          + Adicionar à Comanda
                        </button>
                      );
                    })()
                  )}

                  {/* Posição 3: Compartilhar este Produto */}
                  <button 
                    onClick={() => {
                      const baseUrl = window.location.href.split('#')[0];
                      handleShare(
                        selectedProduct.name,
                        selectedProduct.description?.replace(/<[^>]*>/g, '').substring(0, 100) || "",
                        `${baseUrl}#${selectedProduct.id}`
                      );
                    }}
                    className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-transparent border border-[var(--public-card-border)] text-[var(--public-text-dim)] font-bold rounded-xl hover:bg-[var(--public-bg)] hover:text-[var(--public-text-main)] transition-all text-xs uppercase tracking-wider cursor-pointer whitespace-nowrap"
                  >
                    <Share2 size={16} />
                    Compartilhar este Produto
                  </button>
                  
                  <p className="text-[10px] text-center text-[var(--public-text-dim)] mt-3 opacity-60 leading-normal">
                    Ao iniciar o contato, você concorda com o uso de seus dados estritamente para atendimento comercial, em conformidade com a LGPD.
                  </p>
                </div>
              </div>
            )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
