"use client";

import { m as motion, LayoutGroup } from "framer-motion";
import { Package, Search, Maximize2, Tag, Check, Layers, ChevronRight, MessageCircle, Clock, Share2, ChevronLeft, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import { sanitizeText, formatPrice } from "../utils";
import React, { memo } from "react";

const ProductCard = memo(({
  product,
  isExpanded,
  isEmbed,
  isMobile,
  primaryColor,
  isB2B,
  priceMode,
  hidePrices,
  sellerStatus,
  isAcceptingOrders,
  businessStatus,
  selectedImageIndex,
  setSelectedImageIndex,
  handleOpenProduct,
  handleCloseProduct,
  expandedDescriptionId,
  setExpandedDescriptionId,
  trackLead,
  trackAnalyticsEvent,
  profileId,
  catalogId,
  organizationId,
  slug,
  hideCta,
  whatsapp,
  whatsappTemplate,
  fullName,
  handleShare,
  lastViewTimestamp,
  enableShoppingCart,
  onAddToCart,
  cartItems,
  onUpdateQuantity
}: any) => {
  const { ref, inView } = useInView({
    triggerOnce: false,
    rootMargin: '800px 0px',
  });

  const hasMultipleImages = product.image_urls && product.image_urls.length > 0;
  const productGallery = product.image_url ? [product.image_url, ...(product.image_urls || [])] : (product.image_urls || []);
  
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const isNew = product.created_at ? new Date(product.created_at).getTime() > sevenDaysAgo : false;
  const isUpdated = product.updated_at ? new Date(product.updated_at).getTime() > sevenDaysAgo && !isNew : false;
  
  const wpUrl = (() => {
    if (!whatsapp) return null;
    const cleanNumber = whatsapp.replace(/\D/g, "");
    const priceText = priceMode === "wholesale" 
      ? (product.wholesale_price ? formatPrice(product.wholesale_price) : "")
      : (product.price ? formatPrice(product.price) : "");
    
    let msg = whatsappTemplate || `Olá {seller_name}! Quero o {item_type}: {item_name} {item_price} \nREF: {item_sku}\nLink: {item_url}`;
    msg = msg.replace(/{seller_name}/g, fullName || "Vendedor");
    msg = msg.replace(/{item_type}/g, product.type === 'service' ? 'serviço' : 'produto');
    msg = msg.replace(/{item_name}/g, product.name);
    msg = msg.replace(/{item_price}/g, priceText || "");
    msg = msg.replace(/{item_sku}/g, product.sku || "");
    msg = msg.replace(/{item_url}/g, typeof window !== 'undefined' ? `${window.location.origin}/${slug}/catalogo#${product.id}` : "");
    
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg.trim())}`;
  })();

  return (
    <motion.div
      ref={ref}
      layout={isEmbed && isMobile}
      id={product.id}
      onClick={(e) => {
        if (!isExpanded) handleOpenProduct(product, e);
      }}
      whileHover={(sellerStatus === 'paused' || isAcceptingOrders === false) ? {} : { y: -4 }}
      className={`flex flex-col h-full group relative bg-[var(--public-card-bg)] border ${isExpanded ? 'border-emerald-500 shadow-xl' : 'border-[var(--public-card-border)] shadow-[0_2px_12px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgb(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.3)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)]'} rounded-xl overflow-hidden transition-all duration-300 ${(sellerStatus === 'paused' || isAcceptingOrders === false) ? 'cursor-default opacity-90' : (isExpanded ? '' : 'cursor-pointer hover:border-emerald-500/30')}`}
    >
      {(inView || isEmbed) ? (
        <>
      <div className={`aspect-square relative overflow-hidden bg-[var(--public-card-bg)] flex items-center justify-center ${isExpanded ? 'p-4' : 'p-0'}`}>
        {isExpanded && (
          <button 
            onClick={(e) => { e.stopPropagation(); handleCloseProduct(); }}
            className="absolute top-4 right-4 z-50 h-10 w-10 rounded-full bg-black/45 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 shadow-md cursor-pointer"
          >
            <X size={20} />
          </button>
        )}
        {product.is_in_stock === false && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
            <span className="bg-rose-600 !text-white text-[10px] font-black px-4 py-2 rounded-full shadow-2xl border border-rose-500">
              ESGOTADO
            </span>
          </div>
        )}
        {product.image_url ? (
          <Image 
            src={isExpanded ? (productGallery[selectedImageIndex] || product.image_url) : product.image_url} 
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className={`object-contain transition-transform duration-500 ${isExpanded ? '' : 'group-hover:scale-110'} ${product.is_in_stock === false ? 'opacity-40 grayscale-[0.5]' : ''}`}
          />
        ) : (
          <Package size={48} className={`text-[var(--public-text-dim)] ${product.is_in_stock === false ? 'opacity-30' : ''}`} />
        )}

        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {product.type === 'service' && (
            <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[8px] font-black px-2 py-1 rounded-md shadow-lg border border-emerald-400/30 uppercase tracking-widest">
              Serviço
            </span>
          )}
          {isNew && (
            <span className="text-black text-[10px] font-black px-3 py-1 rounded-full shadow-lg border" style={{ backgroundColor: primaryColor, borderColor: `${primaryColor}aa` }}>
              NOVO
            </span>
          )}
          {isUpdated && (
            <span className="bg-blue-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg border border-blue-400">
              ATUALIZADO
            </span>
          )}
        </div>

        {!isExpanded && (sellerStatus !== 'paused' && isAcceptingOrders !== false) && (
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/10">
              <Maximize2 size={18} className="text-white" />
            </div>
          </div>
        )}
      </div>

      {isExpanded && hasMultipleImages && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          className="px-4 pb-2 -mt-2 overflow-x-auto no-scrollbar"
        >
          <div className="flex gap-2 justify-center">
            {productGallery.map((url: string, idx: number) => (
              <button 
                key={idx} 
                onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(idx); }}
                className={`relative h-12 w-12 sm:h-16 sm:w-16 rounded-lg border-2 flex-shrink-0 overflow-hidden cursor-pointer ${selectedImageIndex === idx ? 'border-emerald-500 scale-105' : 'border-[var(--public-card-border)] opacity-60'}`}
              >
                <Image src={url} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        </motion.div>
      )}

      <div className="p-4 sm:p-6 flex flex-col flex-1 relative">
        <div className="mb-2 sm:mb-4 flex flex-col gap-1.5 sm:gap-2 items-start relative z-10">
          <h3 className="inline-block text-sm sm:text-base font-black tracking-tight text-[var(--public-text-main)] bg-[var(--public-bg)] border border-[var(--public-card-border)] px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl shadow-sm break-words-strategy">
              {product.name}
          </h3>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
            {product.is_in_stock === false ? (
              <span className="bg-rose-500 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-sm">
                Esgotado
              </span>
            ) : product.stock_quantity !== null && product.stock_quantity !== undefined && Math.floor(product.stock_quantity) <= 3 ? (
              <span className="bg-amber-500 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-sm animate-pulse">
                Apenas {Math.floor(product.stock_quantity)} un!
              </span>
            ) : null}

            {product.show_highlight && product.highlight_text && (
              <div className="bg-emerald-500/10 text-emerald-500 text-[8px] sm:text-[9px] font-black px-2 py-0.5 sm:px-3 sm:py-1 rounded-md border border-emerald-500/20 flex items-center gap-1 animate-in fade-in zoom-in duration-300 w-fit break-words-strategy">
                <Tag size={10} className="sm:w-3 sm:h-3 animate-pulse" />
                {sanitizeText(product.highlight_text)}
              </div>
            )}
          </div>
        </div>
        
        {product.description && (
          <div className="relative z-10 mb-3 sm:mb-5">
            <div 
              className={`text-[var(--public-text-dim)] text-[10px] sm:text-sm leading-relaxed break-words-strategy [&_*]:!whitespace-normal [&_*]:!max-w-full ${isExpanded && expandedDescriptionId === product.id ? '' : 'line-clamp-2'}`}
              dangerouslySetInnerHTML={{ __html: sanitizeText(product.description) }}
            />
            {isExpanded && product.description.length > 80 && expandedDescriptionId !== product.id && (
              <button 
                onClick={(e) => { e.stopPropagation(); setExpandedDescriptionId(product.id); }}
                className="text-emerald-500 text-xs font-bold mt-2 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                Ler mais <ChevronRight size={12} />
              </button>
            )}
          </div>
        )}

        {isExpanded && expandedDescriptionId === product.id && product.show_specs !== false && product.specs && product.specs.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 mb-6 relative z-10">
            <h4 className="flex items-center gap-2 text-[var(--public-text-main)] font-extrabold text-sm mb-3">
              <Package size={16} className="text-emerald-500" />
              {product.specs_title || "Especificações Técnicas"}
            </h4>
            <div className="grid gap-2">
              {product.specs.map((spec: any, i: number) => (
                <div key={i} className="flex items-center justify-between bg-[var(--public-bg)] border border-[var(--public-card-border)] rounded-lg px-3 py-2">
                  <span className="text-xs text-[var(--public-text-dim)] font-bold">{spec.chave}</span>
                  <span className="text-sm text-[var(--public-text-main)] font-bold">{spec.valor}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="flex flex-col gap-3 mt-auto relative pt-2 z-10 w-full">
          {/* Preço (se habilitado) */}
          {(!hidePrices && product.is_in_stock !== false && (
            (product.price !== null && Number(product.price) > 0) ||
            (product.wholesale_price !== null && Number(product.wholesale_price) > 0) ||
            (product.has_retail !== false && product.price !== null) || 
            (product.has_wholesale && product.wholesale_price !== null)
          )) && (
            <div className="flex flex-col items-start w-full">
              <div className="flex flex-col gap-1 w-full">
                {product.compare_at_price && product.compare_at_price > (product.price || 0) && (
                  <div className="flex items-center justify-between gap-1 flex-wrap w-full">
                    <div className="text-[10px] sm:text-xs font-semibold text-[var(--public-text-dim)] flex items-center gap-1">
                      <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-[var(--public-text-dim)]/70 font-bold">
                        {isB2B ? "Sugerido (Mercado):" : "De:"}
                      </span>
                      <span className="line-through">{formatPrice(product.compare_at_price)}</span>
                    </div>

                    {product.price && product.compare_at_price > product.price && (
                      <span className="px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 whitespace-nowrap">
                        -{Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% (Economize {formatPrice(product.compare_at_price - product.price)})
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-baseline gap-1 sm:gap-1.5">
                  <span className="text-[8px] sm:text-[9px] font-black text-emerald-500 uppercase tracking-wider">
                    {isB2B ? "Parceiro Atacado:" : product.compare_at_price ? "Por:" : "Preço:"}
                  </span>
                  <p className="text-base sm:text-xl font-extrabold text-[var(--primary-color)] leading-none" style={{ color: primaryColor }}>
                    {formatPrice(product.price)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botões do Card em modo colapsado */}
          {!isExpanded && (sellerStatus !== 'paused' && isAcceptingOrders !== false) && (
            <div className="flex flex-col gap-2 w-full mt-1">
              {/* 1. Botão do WhatsApp (Destaque Principal / Chamativo no topo) */}
              {!hideCta && wpUrl && (
                product.is_in_stock !== false ? (
                  businessStatus.isAvailableNow ? (
                    <a
                      href={wpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        void trackLead(product.name);
                        void trackAnalyticsEvent({
                          profileId,
                          catalogId,
                          organizationId: organizationId,
                          productId: product.id,
                          eventType: "whatsapp_click",
                          pageType: "product_card",
                          metadata: { slug, productName: product.name, priceMode }
                        });
                      }}
                      className="flex items-center justify-center gap-1.5 w-full py-2.5 px-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black rounded-lg shadow-md hover:shadow-lg transition-all text-[11px] sm:text-xs uppercase tracking-normal whitespace-nowrap active:scale-95 cursor-pointer"
                    >
                      <MessageCircle size={16} />
                      Pedir no WhatsApp
                    </a>
                  ) : (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        void trackAnalyticsEvent({
                          profileId,
                          catalogId,
                          organizationId: organizationId,
                          productId: product.id,
                          eventType: "whatsapp_click",
                          pageType: "product_card",
                          metadata: { slug, productName: product.name, priceMode }
                        });
                      }}
                      className="w-full"
                    >
                      <a
                        href={wpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 w-full py-2.5 px-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black rounded-lg shadow-md transition-all text-[11px] sm:text-xs uppercase tracking-normal whitespace-nowrap"
                      >
                        <MessageCircle size={16} />
                        Pedir no WhatsApp
                      </a>
                    </div>
                  )
                ) : null
              )}

              {/* 2. Botão de Carrinho / Comanda (apenas se habilitado) */}
              {enableShoppingCart && onAddToCart && product.is_in_stock !== false && (
                (() => {
                  const existingItem = cartItems?.find((i: any) => i.product.id === product.id);
                  if (existingItem && onUpdateQuantity) {
                    return (
                      <div 
                        onClick={(e) => e.stopPropagation()} 
                        className="flex items-center justify-between gap-2 w-full py-1.5 px-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg shadow-sm"
                      >
                        <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 whitespace-nowrap">Na comanda:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onUpdateQuantity(existingItem.id, -1)}
                            className="w-6 h-6 rounded bg-[var(--public-card-bg)] border border-emerald-500/30 flex items-center justify-center font-black text-xs text-rose-500 hover:bg-rose-500/10"
                          >
                            -
                          </button>
                          <span className="font-black text-xs px-1 text-[var(--public-text-main)]">
                            {existingItem.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(existingItem.id, 1)}
                            className="w-6 h-6 rounded bg-[var(--public-card-bg)] border border-emerald-500/30 flex items-center justify-center font-black text-xs text-emerald-500 hover:bg-emerald-500/10"
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
                        onAddToCart(product);
                      }}
                      className="flex items-center justify-center gap-1.5 w-full py-2 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-black rounded-lg transition-all text-[11px] sm:text-xs uppercase tracking-normal whitespace-nowrap cursor-pointer active:scale-95"
                    >
                      + Adicionar à Comanda
                    </button>
                  );
                })()
              )}

              {/* Botão Saiba mais apenas se o WhatsApp e o Carrinho estiverem desativados */}
              {!enableShoppingCart && hideCta && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenProduct(product, e);
                  }}
                  className="flex items-center justify-center gap-1.5 w-full py-2 px-2 bg-transparent border font-bold rounded-lg transition-all text-[11px] sm:text-xs uppercase tracking-normal whitespace-nowrap cursor-pointer"
                  style={{ borderColor: primaryColor, color: primaryColor }}
                >
                  Saiba mais
                </button>
              )}
            </div>
          )}
        </div>

        {isExpanded && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 pt-5 border-t border-[var(--public-card-border)] relative z-20">
            {!hideCta && wpUrl && (
              product.is_in_stock !== false ? (
                businessStatus.isAvailableNow ? (
                  <a
                    href={wpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      void trackLead(product.name);
                      void trackAnalyticsEvent({
                        profileId,
                        catalogId,
                        organizationId: organizationId,
                        productId: product.id,
                        eventType: "whatsapp_click",
                        pageType: "product_accordion",
                        metadata: { slug, productName: product.name, priceMode }
                      });
                    }}
                    className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-[#25D366] hover:opacity-90 text-white font-black rounded-lg shadow-lg transition-all text-xs uppercase tracking-wider cursor-pointer"
                  >
                    <MessageCircle size={18} />
                    Fazer Pedido via WhatsApp
                  </a>
                ) : (
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      void trackAnalyticsEvent({
                        profileId,
                        catalogId,
                        productId: product.id,
                        eventType: "whatsapp_click_closed",
                        pageType: "product_accordion",
                        metadata: { slug, productName: product.name, priceMode }
                      });
                    }}
                    className="flex flex-col items-center justify-center gap-1 w-full py-3 px-4 bg-[var(--public-bg)] text-[var(--public-text-dim)] rounded-lg border border-[var(--public-card-border)] transition-all cursor-pointer hover:bg-[var(--public-card-border)]/20"
                  >
                    <div className="flex items-center gap-1.5 font-black text-[10px] uppercase tracking-wider">
                      <Clock size={14} />
                      Estabelecimento Fechado
                    </div>
                    <span className="text-[9px] font-medium opacity-70">Clique para registrar interesse mesmo fechado</span>
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[var(--public-bg)] text-[var(--public-text-dim)] font-black rounded-lg border border-[var(--public-card-border)] text-xs uppercase tracking-wider cursor-not-allowed opacity-60">
                  <Package size={16} />
                  Produto Indisponível
                </div>
              )
            )}

            <button 
              onClick={(e) => {
                e.stopPropagation();
                const baseUrl = window.location.href.split('#')[0];
                handleShare(
                  product.name,
                  product.description?.replace(/<[^>]*>/g, '').substring(0, 100) || "",
                  `${baseUrl}#${product.id}`
                );
              }}
              className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-transparent border border-[var(--public-card-border)] text-[var(--public-text-dim)] font-bold rounded-lg hover:bg-[var(--public-bg)] transition-all text-[10px] uppercase tracking-widest cursor-pointer"
            >
              <Share2 size={14} />
              Compartilhar este Produto
            </button>
          </motion.div>
        )}
      </div>
      </>
      ) : (
        <div className="h-full w-full min-h-[300px] flex items-center justify-center bg-[var(--public-card-border)]/10 animate-pulse" />
      )}
    </motion.div>
  );
});

const CategorySectionBase = ({
  filteredCategories,
  searchQuery,
  primaryColor,
  isEmbed,
  isMobile,
  selectedProductId,
  handleOpenProduct,
  handleCloseProduct,
  sellerStatus,
  isAcceptingOrders,
  selectedImageIndex,
  setSelectedImageIndex,
  priceMode,
  setPriceMode,
  whatsapp,
  whatsappTemplate,
  slug,
  fullName,
  isB2B,
  expandedDescriptionId,
  setExpandedDescriptionId,
  trackLead,
  trackAnalyticsEvent,
  profileId,
  catalogId,
  organizationId,
  handleShare,
  hidePrices,
  hideCta,
  whatsappUrl,
  businessStatus,
  lastViewTimestamp,
  enableShoppingCart,
  onAddToCart,
  cartItems,
  onUpdateQuantity
}: any) => {
  return (
    <div className="space-y-16 relative">
      {(sellerStatus === 'paused' || isAcceptingOrders === false) && (
        <div className="mb-8 w-full">
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-xl text-center shadow-sm">
            <span className="font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Indisponível para atendimento imediato
            </span>
            <p className="text-xs mt-1 opacity-80">
              {isAcceptingOrders === false 
                ? "Loja temporariamente em recesso. Não estamos aceitando pedidos no momento." 
                : "As informações abaixo são puramente para consulta de vitrine."}
            </p>
          </div>
        </div>
      )}
      
      {filteredCategories.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center p-12 sm:p-20 rounded-2xl border border-dashed border-[var(--public-card-border)] bg-[var(--public-card-bg)] max-w-xl mx-auto shadow-sm"
          >
            <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 flex items-center justify-center mb-6">
              <Package size={32} />
            </div>
            <h3 className="text-xl font-bold text-[var(--public-text-main)] mb-2">
              {searchQuery ? "Nenhum resultado encontrado" : "Catálogo Vazio ou Indisponível"}
            </h3>
            <p className="text-sm text-[var(--public-text-dim)] leading-relaxed mb-8 max-w-md">
              {searchQuery 
                ? `Não encontramos nenhum item correspondente a "${searchQuery}". Tente buscar por outros termos.`
                : "Nenhum produto foi publicado neste catálogo ainda. Por favor, entre em contato direto com o consultor para solicitar a lista de produtos ou mais informações."
              }
            </p>
            {!searchQuery && !hideCta && whatsappUrl && (
              <Link
                href={whatsappUrl}
                target="_blank"
                className="flex items-center justify-center gap-2 bg-[#25D366] hover:opacity-90 text-white px-6 py-4 rounded-lg text-sm font-bold transition-all shadow-lg w-full cursor-pointer"
                onClick={() => trackLead()}
              >
                <MessageCircle size={18} />
                Chamar no WhatsApp
              </Link>
            )}
          </motion.div>
        )}

        {filteredCategories.map((category: any, idx: number) => (
          <motion.section 
            key={category.id}
            id={`categoria-${category.id}`}
            className="scroll-mt-32"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 mb-6 sm:mb-8">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tighter text-[var(--public-text-main)] flex items-center gap-3">
                  <span className="w-2.5 h-6 sm:h-8 md:h-10 rounded-full" style={{ backgroundColor: primaryColor }} />
                  {category.name}
                </h2>
                {category.description && (
                  <p className="text-[var(--public-text-dim)] text-xs sm:text-sm mt-1 sm:mt-2 ml-5">{category.description}</p>
                )}
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-[var(--public-text-dim)] uppercase tracking-widest bg-[var(--public-card-bg)] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-[var(--public-card-border)] shadow-sm w-fit">
                {category.products.length} {category.products.every((p: any) => p.type === 'service') ? 'serviços' : category.products.some((p: any) => p.type === 'service') ? 'itens' : 'produtos'}
              </span>
            </div>

            <div className={`grid ${isEmbed ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"}`}>
              {category.products.map((product: any) => {
                const isExpanded = isEmbed && isMobile && selectedProductId === product.id;
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isExpanded={isExpanded}
                    isEmbed={isEmbed}
                    isMobile={isMobile}
                    primaryColor={primaryColor}
                    isB2B={isB2B}
                    priceMode={isExpanded ? priceMode : "retail"}
                    hidePrices={hidePrices}
                    sellerStatus={sellerStatus}
                    isAcceptingOrders={isAcceptingOrders}
                    businessStatus={businessStatus}
                    selectedImageIndex={isExpanded ? selectedImageIndex : 0}
                    setSelectedImageIndex={setSelectedImageIndex}
                    handleOpenProduct={handleOpenProduct}
                    handleCloseProduct={handleCloseProduct}
                    expandedDescriptionId={isExpanded ? expandedDescriptionId : null}
                    setExpandedDescriptionId={setExpandedDescriptionId}
                    trackLead={trackLead}
                    trackAnalyticsEvent={trackAnalyticsEvent}
                    profileId={profileId}
                    catalogId={catalogId}
                    organizationId={organizationId}
                    slug={slug}
                    hideCta={hideCta}
                    whatsapp={whatsapp}
                    whatsappTemplate={whatsappTemplate}
                    fullName={fullName}
                    handleShare={handleShare}
                    lastViewTimestamp={lastViewTimestamp}
                    enableShoppingCart={enableShoppingCart}
                    onAddToCart={onAddToCart}
                    cartItems={cartItems}
                    onUpdateQuantity={onUpdateQuantity}
                  />
                );
              })}
            </div>
          </motion.section>
        ))}

      {filteredCategories.length === 0 && searchQuery && (
        <div className="py-20 text-center">
          <div className="bg-[var(--public-card-bg)] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--public-card-border)]">
            <Search size={32} className="text-[var(--public-text-dim)]" />
          </div>
          <h3 className="text-xl font-bold text-[var(--public-text-main)] mb-2">Nenhum item encontrado</h3>
          <p className="text-[var(--public-text-dim)]">Tente buscar por termos diferentes (produtos ou serviços) ou confira outras categorias.</p>
        </div>
      )}
    </div>
  );
};

export const CategorySection = memo(CategorySectionBase);
