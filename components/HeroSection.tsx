"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

function SingleThemeCarousel({ images, interval, isDarkTheme }: { images: string[]; interval: number; isDarkTheme: boolean }) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (images.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval, isPaused]);

  const activeIndex = index >= images.length ? 0 : index;
  const currentImage = images[activeIndex] || "/hero_mockup.png";

  return (
    <div 
      className={`absolute inset-0 w-full h-full ${isDarkTheme ? "hidden dark:block" : "block dark:hidden"}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={`${currentImage}-${activeIndex}`}
          src={currentImage}
          alt={`PlataformaShop Mockup ${isDarkTheme ? "Escuro" : "Claro"} ${activeIndex + 1}`}
          fetchPriority={activeIndex === 0 ? "high" : "auto"}
          decoding="async"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          onError={(e) => { (e.target as HTMLImageElement).src = "/hero_mockup.png"; }}
        />
      </AnimatePresence>

      {/* Indicadores Visuais (Dots) caso haja 2+ imagens */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center items-center gap-1.5 pointer-events-auto">
          {images.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              onClick={() => setIndex(dotIdx)}
              className={`transition-all duration-300 rounded-full ${
                dotIdx === activeIndex
                  ? "w-6 h-1.5 bg-[#2CCB68] shadow-sm shadow-[#2CCB68]/50"
                  : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Ir para mockup ${dotIdx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function HeroSection({ settings }: { settings?: any }) {
  const headline = settings?.hero_headline || "O Fim dos Catálogos em PDF.<br/><span class='text-[#2CCB68]'>A Ferramenta Definitiva para o seu Time de Vendas.</span>";
  const subtitle = settings?.hero_subtitle || "Cartão de Visitas Digital NFC e um Catálogo Transacional Taxa Zero sempre sincronizado com o seu Bling. A máquina de vendas que as maiores empresas usam.";
  
  const interval = settings?.hero_carousel_interval || 4000;

  // Fallback Inteligente de Imagens para o Tema Escuro
  const darkImages: string[] = Array.isArray(settings?.hero_mockups_dark) && settings.hero_mockups_dark.length > 0
    ? settings.hero_mockups_dark
    : (settings?.hero_mockup_url 
        ? [settings.hero_mockup_url] 
        : (Array.isArray(settings?.hero_mockups_light) && settings.hero_mockups_light.length > 0 
            ? settings.hero_mockups_light 
            : (settings?.hero_mockup_url_light ? [settings.hero_mockup_url_light] : ["/hero_mockup.png"])));

  // Fallback Inteligente de Imagens para o Tema Claro
  const lightImages: string[] = Array.isArray(settings?.hero_mockups_light) && settings.hero_mockups_light.length > 0
    ? settings.hero_mockups_light
    : (settings?.hero_mockup_url_light 
        ? [settings.hero_mockup_url_light] 
        : (Array.isArray(settings?.hero_mockups_dark) && settings.hero_mockups_dark.length > 0 
            ? settings.hero_mockups_dark 
            : (settings?.hero_mockup_url ? [settings.hero_mockup_url] : ["/hero_mockup.png"])));

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        {/* Left Column */}
        <div className="flex flex-col gap-6 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-300 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm w-fit text-xs font-semibold text-zinc-700 dark:text-zinc-300 tracking-wide uppercase shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#2CCB68] animate-pulse" />
            O Híbrido Perfeito (NFC + Catálogo)
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-[1.1]" dangerouslySetInnerHTML={{ __html: headline }}></h1>
          
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-lg leading-relaxed">
            {subtitle}
          </p>
          
          {/* CTAs Principais */}
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/cadastro"
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#2CCB68] to-[#06B6D4] text-white font-bold text-base shadow-lg shadow-[#2CCB68]/25 hover:shadow-[#2CCB68]/40 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer ${plusJakarta.className}`}
            >
              <span>Começar Gratuitamente</span>
              <ArrowRight size={18} />
            </Link>

            <Link
              href="#planos"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-zinc-300 dark:border-white/10 bg-white/80 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-800 dark:text-zinc-200 font-semibold text-base transition-all active:scale-[0.98]"
            >
              Conhecer Planos
            </Link>
          </div>
          
          {/* Trust Badges B2B */}
          <div className="mt-6 flex flex-wrap gap-4 items-center border-t border-white/10 pt-6">
            <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
              <svg className="w-5 h-5 text-[#2CCB68]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Operações +100k/mês
            </div>
            <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
              <svg className="w-5 h-5 text-[#2CCB68]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Integração Oficial Bling ERP
            </div>
            <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
              <svg className="w-5 h-5 text-[#2CCB68]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Gestão CRM Multi-Vendedores
            </div>
          </div>
        </div>

        {/* Right Column (Carrossel Duplo: Dark & Light) */}
        <div className="relative z-10 flex justify-center lg:justify-end p-4 md:p-0">
          <div className="relative w-full max-w-[500px] aspect-square md:aspect-[4/5] rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-white/5 overflow-hidden shadow-[0_20px_50px_rgba(44,203,104,0.1)] transform-gpu hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(44,203,104,0.2)] transition-all duration-700 ease-out group">
             {/* Carrossel Tema Escuro */}
             <SingleThemeCarousel images={darkImages} interval={interval} isDarkTheme={true} />

             {/* Carrossel Tema Claro */}
             <SingleThemeCarousel images={lightImages} interval={interval} isDarkTheme={false} />

             {/* Anel e brilho decorativo */}
             <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 pointer-events-none z-10" />
             <div className="absolute inset-0 bg-gradient-to-tr from-[#2CCB68]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
