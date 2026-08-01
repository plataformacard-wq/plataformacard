import Link from "next/link";
import { ArrowRight, Box, Circle, Command, Diamond, Globe, Hexagon, Triangle } from "lucide-react";

// Substitua pelos nomes das 3 empresas parceiras reais
const COMPANIES = [
  { name: "Empresa Parceira 1", icon: Command, color: "text-zinc-200" },
  { name: "Empresa Parceira 2", icon: Globe, color: "text-zinc-200" },
  { name: "Empresa Parceira 3", icon: Hexagon, color: "text-zinc-200" },
];

export function CompanyLogos({ partners }: { partners?: any[] }) {
  const finalPartners = (partners && partners.length > 0) ? partners : COMPANIES;
  
  // Regra de Negócio: Só inicia o carrossel animado quando tivermos 6 ou mais parceiros.
  const isAnimatable = finalPartners.length >= 6;
  
  // Se for animável, quadruplica para o loop infinito. Se não, exibe apenas a lista original.
  const displayItems = isAnimatable 
    ? [...finalPartners, ...finalPartners, ...finalPartners, ...finalPartners] 
    : finalPartners;

  return (
    <section className="border-y border-white/5 bg-[#050505] overflow-hidden relative z-20">
      <style>{`
        @keyframes marquee-horizontal-custom {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      
      {/* Top Banner Link */}
      <div className="border-b border-white/5 py-3 text-center">
        <Link href="#como-funciona" className="text-xs md:text-sm text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-2 group">
          Novo no B2B digital? <span className="text-[#2CCB68] group-hover:underline flex items-center gap-1">Leia o guia completo da PlataformaShop <ArrowRight size={14} /></span>
        </Link>
      </div>

      <div className="py-12">
        <div className="text-center mb-8 px-4">
          <h2 className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase">
            FAÇA COMO AS EMPRESAS QUE ABANDONARAM OS PDFS E ACELERAM VENDAS COM CATÁLOGO DIGITAL
          </h2>
        </div>

        {/* Marquee Container */}
        <div className="relative flex max-w-full overflow-hidden group">
          
          {/* Faders laterais para sumir suavemente com as logos */}
          <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
          
          <div 
            className={`flex items-center gap-16 md:gap-32 px-8 ${
              isAnimatable 
                ? "w-max hover:[animation-play-state:paused]" 
                : "w-full justify-center flex-wrap"
            }`}
            style={isAnimatable ? { animation: 'marquee-horizontal-custom 40s linear infinite' } : {}}
          >
            {displayItems.map((company, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-3 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-default"
              >
                {company.image_url ? (
                  <img src={company.image_url} alt={company.name} className="h-8 max-w-[120px] object-contain filter invert" />
                ) : (
                  company.icon && <company.icon size={28} className={company.color} />
                )}
                <span className="text-xl font-extrabold text-white tracking-tight">
                  {company.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
