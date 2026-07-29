"use client";

import Image from 'next/image';

export function HeroSection({ settings }: { settings?: any }) {
  const headline = settings?.hero_headline || "O Fim dos Catálogos em PDF.<br/><span class='text-[#2CCB68]'>A Ferramenta Definitiva para o seu Time de Vendas.</span>";
  const subtitle = settings?.hero_subtitle || "Cartão de Visitas Digital NFC e um Catálogo Transacional Taxa Zero sempre sincronizado com o seu Bling. A máquina de vendas que as maiores empresas usam.";
  const mockupUrlDark = settings?.hero_mockup_url || settings?.hero_mockup_url_light || "/hero_mockup.png";
  const mockupUrlLight = settings?.hero_mockup_url_light || settings?.hero_mockup_url || "/hero_mockup.png";

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
          
          {/* Link Simulator */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 p-2 rounded-2xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 backdrop-blur-md max-w-xl shadow-lg dark:shadow-2xl focus-within:border-[#2CCB68] transition-colors">
            <div className="flex items-center px-4 flex-1 w-full sm:w-auto">
              <span className="text-zinc-500 font-medium">plataforma.shop/</span>
              <input 
                type="text" 
                placeholder="suamarca" 
                className="bg-transparent border-none outline-none text-zinc-900 dark:text-white font-medium w-full ml-1 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-0"
              />
            </div>
            <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#2CCB68] to-[#06B6D4] text-white font-semibold shadow-lg shadow-[#2CCB68]/20 hover:shadow-[#2CCB68]/40 hover:-translate-y-0.5 transition-all">
              Reservar Link
            </button>
          </div>
          <p className="text-xs text-zinc-500 mt-2 ml-2">Crie sua conta grátis em 1 minuto. Sem cartão de crédito.</p>
          
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

        {/* Right Column (Mockup Duplo: Dark & Light) */}
        <div className="relative z-10 flex justify-center lg:justify-end p-4 md:p-0">
          <div className="relative w-full max-w-[500px] aspect-square md:aspect-[4/5] rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-white/5 overflow-hidden shadow-[0_20px_50px_rgba(44,203,104,0.1)] transform-gpu hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(44,203,104,0.2)] transition-all duration-700 ease-out group">
             {/* Mockup Tema Escuro (Exibido no Dark Mode) */}
             <img 
                src={mockupUrlDark} 
                alt="PlataformaShop Mockup Tema Escuro" 
                className="hidden dark:block absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                onError={(e) => { (e.target as HTMLImageElement).src = "/hero_mockup.png"; }}
             />

             {/* Mockup Tema Claro (Exibido no Light Mode) */}
             <img 
                src={mockupUrlLight} 
                alt="PlataformaShop Mockup Tema Claro" 
                className="block dark:hidden absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                onError={(e) => { (e.target as HTMLImageElement).src = "/hero_mockup.png"; }}
             />
             {/* Elegant inner ring / glow */}
             <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 pointer-events-none" />
             <div className="absolute inset-0 bg-gradient-to-tr from-[#2CCB68]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
