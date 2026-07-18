import Image from 'next/image';

export function HeroSection({ settings }: { settings?: any }) {
  const headline = settings?.hero_headline || "O fim do caos em PDFs.";
  const subtitle = settings?.hero_subtitle || "O único cartão físico NFC premium do mercado com um catálogo completo integrado. Venda sem taxas através do WhatsApp.";
  const mockupUrl = settings?.hero_mockup_url || "/hero_mockup.png";

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-transparent">

      
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        {/* Left Column */}
        <div className="flex flex-col gap-6 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm w-fit text-xs font-semibold text-zinc-300 tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-[#2CCB68] animate-pulse" />
            O Híbrido Perfeito (NFC + Catálogo)
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]" dangerouslySetInnerHTML={{ __html: headline }}></h1>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-lg leading-relaxed">
            {subtitle}
          </p>
          
          {/* Link Simulator */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 p-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md max-w-xl shadow-2xl focus-within:border-[#2CCB68] transition-colors">
            <div className="flex items-center px-4 flex-1 w-full sm:w-auto">
              <span className="text-zinc-500 font-medium">plataforma.shop/</span>
              <input 
                type="text" 
                placeholder="suamarca" 
                className="bg-transparent border-none outline-none text-white font-medium w-full ml-1 placeholder:text-zinc-600 focus:ring-0"
              />
            </div>
            <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#2CCB68] to-[#06B6D4] text-white font-semibold shadow-lg shadow-[#2CCB68]/20 hover:shadow-[#2CCB68]/40 hover:-translate-y-0.5 transition-all">
              Reservar Link
            </button>
          </div>
          <p className="text-xs text-zinc-500 mt-2 ml-2">Crie sua conta grátis em 1 minuto. Sem cartão de crédito.</p>
        </div>

        {/* Right Column (Mockup) */}
        <div className="relative z-10 flex justify-center lg:justify-end p-4 md:p-0">
          <div className="relative w-full max-w-[500px] aspect-square md:aspect-[4/5] rounded-3xl border border-white/10 bg-white/5 overflow-hidden shadow-[0_20px_50px_rgba(44,203,104,0.1)] transform-gpu hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(44,203,104,0.2)] transition-all duration-700 ease-out group">
             {mockupUrl === "/hero_mockup.png" ? (
               <Image 
                  src={mockupUrl} 
                  alt="PlataformaShop Mockup" 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  priority
               />
             ) : (
               <img 
                  src={mockupUrl} 
                  alt="PlataformaShop Mockup" 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
               />
             )}
             {/* Elegant inner ring / glow */}
             <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 pointer-events-none" />
             <div className="absolute inset-0 bg-gradient-to-tr from-[#2CCB68]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
