"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Image from "next/image";
import { sanitizeText } from "../utils";

import React, { memo } from "react";

const CatalogBannerCarouselBase = ({ 
  banners, 
  highlightProducts, 
  primaryColor,
  handleOpenProduct,
  bannerSpeedSeconds = 5,
  bannerInitialIndex = 0,
  products = []
}: { 
  banners: any[] | null, 
  highlightProducts: any[], 
  primaryColor: string,
  handleOpenProduct: (product: any) => void,
  bannerSpeedSeconds?: number,
  bannerInitialIndex?: number,
  products?: any[]
}) => {
  const items = useMemo(() => {
    let finalItems: any[] = [];
    
    // 1. Process custom banners first
    if (banners && banners.length > 0) {
      const processedBanners = banners.filter(b => b.active !== false).reduce((acc: any[], b) => {
        if (b.type === 'product' && b.product_id && products) {
          const p = products.find(prod => prod.id === b.product_id);
          if (p) {
            acc.push({
              image_url: p.image_url,
              title: p.name,
              description: p.description ? (() => {
                const cleanText = sanitizeText(p.description).replace(/<[^>]*>/g, '');
                return cleanText.substring(0, 120) + (cleanText.length > 120 ? '...' : '');
              })() : '',
              button_text: p.type === 'service' ? 'Ver Serviço' : 'Ver Produto',
              is_product: true,
              product: p
            });
          }
        } else {
          acc.push({
            ...b,
            image_url: b.image_desktop_url, // fallback
            is_product: false
          });
        }
        return acc;
      }, []);
      finalItems = [...processedBanners];
    }

    // 2. Append highlight products that aren't already explicitly added as a custom banner
    const existingProductIds = finalItems.filter(item => item.is_product).map(item => item.product?.id);
    
    const highlightItems = highlightProducts
      .filter(p => !existingProductIds.includes(p.id))
      .map(p => ({
        image_url: p.image_url,
        title: p.name,
        description: p.description ? (() => {
          const cleanText = sanitizeText(p.description).replace(/<[^>]*>/g, '');
          return cleanText.substring(0, 120) + (cleanText.length > 120 ? '...' : '');
        })() : '',
        button_text: p.type === 'service' ? 'Ver Serviço' : 'Ver Produto',
        is_product: true,
        product: p
      }));

    return [...finalItems, ...highlightItems];
  }, [banners, highlightProducts, products]);

  const [currentIndex, setCurrentIndex] = useState(() => {
    if (items.length === 0) return 0;
    if (bannerInitialIndex === -1) {
      return Math.floor(Math.random() * items.length);
    }
    return Math.min(Math.max(0, bannerInitialIndex), items.length - 1);
  });

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, (bannerSpeedSeconds || 5) * 1000);
    return () => clearInterval(interval);
  }, [items, bannerSpeedSeconds]);

  if (items.length === 0) return null;

  // Garantir que currentIndex está dentro dos limites caso items mude ou seja inicializado errado
  const safeCurrentIndex = isNaN(currentIndex) ? 0 : Math.max(0, Math.min(currentIndex, items.length - 1));
  const currentItem = items[safeCurrentIndex];

  if (!currentItem) return null;

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  };

  const handleAction = () => {
    if (currentItem.is_product && currentItem.product) {
      handleOpenProduct(currentItem.product);
    } else if (currentItem.button_link) {
      if (currentItem.button_link.startsWith('#')) {
        const targetId = currentItem.button_link.substring(1);
        const targetProd = highlightProducts.find(p => p.id === targetId);
        if (targetProd) {
          handleOpenProduct(targetProd);
        } else {
          window.location.hash = targetId;
        }
      } else {
        window.open(currentItem.button_link, "_blank");
      }
    }
  };

  return (
    <div className="relative w-full h-[150px] sm:h-[180px] md:h-[220px] rounded-3xl overflow-hidden mb-8 shadow-sm border border-[var(--public-card-border)] bg-[var(--public-card-bg)] group select-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={safeCurrentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Background Image */}
          <div 
            className={`absolute inset-0 bg-cover bg-center transition-all duration-500 ${
              currentItem.is_product 
                ? 'opacity-100' 
                : 'blur-none opacity-100 scale-100'
            }`}
          >
            {/* Responsividade para Banners Customizados */}
            {currentItem.is_product ? (
              <div className="absolute inset-0 z-0">
                <Image
                  src={currentItem.image_url || "/placeholder-banner.png"}
                  alt={currentItem.title || "Banner"}
                  fill
                  priority
                  className="object-cover opacity-25 blur-[1px] scale-105"
                />
              </div>
            ) : (
              <div className="absolute inset-0 z-0">
                {currentItem.image_mobile_url && currentItem.image_desktop_url ? (
                  <>
                    <div className="sm:hidden relative w-full h-full">
                      <Image src={currentItem.image_mobile_url} alt={currentItem.title || "Banner"} fill priority className="object-cover" />
                    </div>
                    <div className="hidden sm:block relative w-full h-full">
                      <Image src={currentItem.image_desktop_url} alt={currentItem.title || "Banner"} fill priority className="object-cover" />
                    </div>
                  </>
                ) : (
                  <Image src={currentItem.image_desktop_url || currentItem.image_mobile_url || ""} alt={currentItem.title || "Banner"} fill priority className="object-cover" />
                )}
              </div>
            )}
          </div>

          {/* Text readability overlay for custom banners with text */}
          {!currentItem.is_product && (currentItem.title || currentItem.description) && (
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-10" />
          )}

          {/* Banner Layout */}
          <div className="relative w-full h-full flex items-center justify-between z-10 px-6 sm:px-12">
            {/* Left side text overlay */}
            <div className="flex flex-col justify-center max-w-[65%] sm:max-w-[55%] z-20">
              <h2 className={`text-base sm:text-lg md:text-xl font-black tracking-tight leading-tight line-clamp-1 ${
                currentItem.is_product ? 'text-[var(--public-text-main)]' : 'text-white'
              }`}>
                {currentItem.title}
              </h2>
              {currentItem.description && (
                <div className="mt-1.5 backdrop-blur-md px-3 py-1.5 rounded-xl border shadow-sm w-fit max-w-full description-sticker">
                  <p className={`text-[10px] sm:text-xs md:text-sm line-clamp-2 leading-relaxed font-medium ${
                    currentItem.is_product ? 'text-[var(--public-text-dim)]' : 'text-zinc-200'
                  }`}>
                    {currentItem.description}
                  </p>
                </div>
              )}
              <button
                onClick={handleAction}
                className="mt-3 px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-black w-fit transition-all flex items-center gap-1.5 hover:opacity-90 active:scale-95 text-white border-none shadow-sm cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                {currentItem.button_text || "Ver mais"}
                <ArrowRight size={12} className="sm:w-3 sm:h-3" />
              </button>
            </div>

            {/* Right side floating image */}
            {currentItem.is_product && (
              <div className="relative h-[85%] aspect-square flex items-center justify-center z-20 hidden sm:flex rounded-2xl overflow-hidden shadow-md bg-white border border-black/5">
                <Image 
                  src={currentItem.image_url || "/placeholder-product.png"} 
                  alt={currentItem.title || "Produto"} 
                  fill
                  sizes="(max-width: 768px) 0vw, 33vw"
                  className="object-contain p-3 transition-transform duration-500 hover:scale-105"
                />
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}

      {/* Indicators/Dots */}
      {items.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all border-none cursor-pointer ${currentIndex === idx ? 'w-4' : 'w-1.5 opacity-40'}`}
              style={{ backgroundColor: currentIndex === idx ? primaryColor : 'var(--public-text-main)' }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CatalogBannerCarousel = memo(CatalogBannerCarouselBase);
