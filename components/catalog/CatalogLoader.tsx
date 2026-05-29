"use client";

import React from "react";

type CatalogLoaderProps = {
  isEmbed?: boolean;
};

export default function CatalogLoader({ isEmbed = false }: CatalogLoaderProps) {
  return (
    <div className="w-full min-h-screen public-theme-container flex flex-col justify-start items-center p-6 sm:p-8 overflow-hidden select-none">
      {/* Custom Styles for Loader and Shimmer */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes custom-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes custom-spin-reverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-spin-custom {
          animation: custom-spin 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-spin-reverse {
          animation: custom-spin-reverse 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .shimmer {
          background: linear-gradient(
            90deg,
            var(--public-card-bg) 25%,
            var(--public-card-border) 37%,
            var(--public-card-bg) 63%
          );
          background-size: 400% 100%;
          animation: shimmer-animation 1.4s ease infinite;
        }
        @keyframes shimmer-animation {
          0% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}} />

      {/* Center Top Glowing Loader Indicator */}
      <div className="flex flex-col items-center justify-center my-10 relative z-10">
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Inner Glowing Effect */}
          <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-full animate-pulse" />
          
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/10 border-t-emerald-500 border-r-emerald-500/50 animate-spin-custom" />
          
          {/* Inner Ring - Counter Rotating */}
          <div className="absolute inset-2 rounded-full border border-dashed border-emerald-600/20 border-b-emerald-600 animate-spin-reverse" />
          
          {/* Center Pulsing Dot */}
          <div className="w-4 h-4 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full shadow-lg shadow-emerald-500/40 animate-ping" />
          <div className="absolute w-3 h-3 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-full shadow-md z-10" />
        </div>
        
        <h3 className="mt-4 text-sm font-black tracking-wider text-[var(--public-text-main)] uppercase animate-pulse">
          Carregando Catálogo
        </h3>
        <p className="text-[10px] text-[var(--public-text-dim)]/80 font-medium mt-1 tracking-wide">
          Buscando produtos e ofertas...
        </p>
      </div>

      {/* Skeleton Frame to prevent layout shifts */}
      <div className="w-full max-w-7xl opacity-40 pointer-events-none mt-4">
        {/* Title & Description Skeleton */}
        <div className="space-y-4 mb-10">
          <div className="h-9 w-60 rounded-2xl shimmer" />
          <div className="space-y-2">
            <div className="h-4 w-full max-w-xl rounded-lg shimmer" />
            <div className="h-4 w-full max-w-md rounded-lg shimmer" />
          </div>
        </div>

        {/* Search Input Skeleton */}
        <div className="mb-12">
          <div className="h-14 w-full max-w-xl rounded-2xl border border-[var(--public-card-border)] shimmer" />
        </div>

        {/* Category Header Skeleton */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2.5 h-8 bg-emerald-500/20 rounded-full animate-pulse" />
          <div className="h-8 w-44 rounded-xl shimmer" />
          <div className="ml-auto h-7 w-20 rounded-xl shimmer" />
        </div>

        {/* Product Cards Grid Skeleton */}
        <div className={`grid ${isEmbed ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"}`}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i} 
              className="public-card rounded-2xl overflow-hidden shadow-sm"
            >
              {/* Product Image Space */}
              <div className="aspect-square w-full shimmer relative">
                <div className="absolute top-4 left-4 h-5 w-14 rounded-lg bg-[var(--public-bg)] opacity-60 animate-pulse" />
              </div>
              
              {/* Product Details Space */}
              <div className="p-5 space-y-4">
                {/* Title Badge */}
                <div className="h-10 w-3/4 rounded-xl shimmer" />
                
                {/* Description lines */}
                <div className="space-y-2">
                  <div className="h-3 w-full rounded shimmer" />
                  <div className="h-3 w-5/6 rounded shimmer" />
                </div>
                
                {/* Footer details: price & CTA */}
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-1">
                    <div className="h-3 w-10 rounded shimmer" />
                    <div className="h-6 w-20 rounded-lg shimmer" />
                  </div>
                  <div className="h-10 w-10 rounded-full shimmer" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
