import { Plus_Jakarta_Sans } from "next/font/google";
import { Rocket, Lock, Zap, CreditCard, ArrowRight } from "lucide-react";
import Link from "next/link";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export function CtaSection() {
  return (
    <section className="relative w-full overflow-hidden py-24 lg:py-32">
      {/* Fundo Vibrante (Adaptação do Azul/Roxo para a paleta Premium Green da PlataformaShop) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d3b1f] via-[#10b981] to-[#042f14] opacity-90" />
      
      {/* Overlay de textura (Opcional, para dar aquele ar de "bloco infinito" premium) */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
        {/* Ícone de Foguete */}
        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-8 shadow-2xl border border-white/20">
          <Rocket className="w-8 h-8 text-white" />
        </div>

        {/* Textos Principais */}
        <h2 className={`text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 ${plusJakarta.className}`}>
          Pronto para digitalizar suas vendas?
        </h2>
        <p className="text-emerald-50 text-lg md:text-xl max-w-2xl mx-auto mb-10 opacity-90">
          Junte-se a milhares de lojistas, distribuidores e representantes que já aposentaram os PDFs pesados e estão vendendo mais rápido pelo WhatsApp.
        </p>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-12">
          <Link 
            href="#planos" 
            className="flex items-center justify-center gap-2 bg-white text-emerald-900 font-bold px-8 py-4 rounded-xl hover:bg-zinc-100 transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
          >
            Escolher meu plano
            <ArrowRight size={18} strokeWidth={3} />
          </Link>
          <Link 
            href="#planos" 
            className="flex items-center justify-center gap-2 bg-black/20 text-white font-bold px-8 py-4 rounded-xl hover:bg-black/40 border border-white/20 transition-all backdrop-blur-md"
          >
            Falar com consultor
          </Link>
        </div>

        {/* Badges de Confiança */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-sm font-medium text-emerald-100">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-amber-300" />
            Seguro e Privado
          </div>
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-amber-[#2CCB68]" />
            Configure em 2 min
          </div>
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-amber-300" />
            Ativação imediata
          </div>
        </div>
      </div>
    </section>
  );
}
