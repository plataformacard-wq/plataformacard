import { Plus_Jakarta_Sans } from "next/font/google";
import { Plus, PenTool, Share2, Users } from "lucide-react";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export function HowItWorks() {
  const steps = [
    {
      id: 1,
      title: "Crie Seu Catálogo",
      desc: "Cadastre-se no navegador ou no app e monte sua vitrine de produtos de forma fácil — sua loja funciona em todo lugar.",
      icon: Plus,
    },
    {
      id: 2,
      title: "Personalize Seu Perfil",
      desc: "Adicione sua foto, logotipo e links de redes sociais. Empresas podem criar e distribuir catálogos padronizados para franqueados.",
      icon: PenTool,
    },
    {
      id: 3,
      title: "Compartilhe Instantaneamente",
      desc: "Compartilhe via Link, QR code, cartão físico NFC ou integre diretamente na bio do seu Instagram e WhatsApp.",
      icon: Share2,
    },
    {
      id: 4,
      title: "Expanda Suas Vendas",
      desc: "Acompanhe o engajamento do seu catálogo, receba pedidos formatados no WhatsApp e gerencie seus contatos em um só lugar.",
      icon: Users,
    },
  ];

  return (
    <section id="como-funciona" className="py-24 bg-transparent relative overflow-hidden">
      {/* Subtle glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#2CCB68]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2CCB68]/10 border border-[#2CCB68]/20 text-[#2CCB68] text-xs font-bold uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2CCB68]" />
            Processo Simples
          </div>
          <h2 className={`text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight ${plusJakarta.className}`}>
            Como a Plataforma<span className="text-[#2CCB68]">Shop</span> Funciona
          </h2>
        </div>

        {/* Steps Grid with Connecting Line */}
        <div className="relative">
          {/* Connecting Line (Desktop only) */}
          <div className="hidden md:block absolute top-[44px] left-[12%] right-[12%] h-[1px] bg-gradient-to-r from-transparent via-zinc-300 dark:via-white/10 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="relative flex flex-col items-center text-center group cursor-pointer">
                  {/* Icon Box with Outer Glow on Hover */}
                  <div className="relative mb-8 z-10">
                    {/* Outer Glow Effect */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-[#2CCB68] to-[#06B6D4] opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500 rounded-3xl" />
                    
                    <div className="w-20 h-20 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/5 shadow-xl flex items-center justify-center transform group-hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                       {/* Subtle inner glow */}
                       <div className="absolute inset-0 bg-gradient-to-b from-[#2CCB68]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                       <Icon className="w-8 h-8 text-zinc-800 dark:text-white group-hover:text-[#2CCB68] transition-colors duration-300 relative z-10" strokeWidth={1.5} />
                    </div>
                    {/* Step Number Badge */}
                    <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-[#2CCB68] text-[#0a0a0a] text-xs font-bold flex items-center justify-center border-4 border-zinc-100 dark:border-[#050505] shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                      {step.id}
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/5 rounded-2xl p-6 h-full w-full shadow-md dark:shadow-none group-hover:border-[#2CCB68]/30 group-hover:shadow-[0_0_30px_rgba(44,203,104,0.05)] transition-all duration-300">
                    <h3 className={`text-lg font-bold text-zinc-900 dark:text-white group-hover:text-[#2CCB68] transition-colors duration-300 mb-3 ${plusJakarta.className}`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Badge */}
        <div className="mt-20 flex justify-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/5 shadow-xl">
            <div className="w-6 h-6 rounded-full bg-[#2CCB68]/20 flex items-center justify-center text-[#2CCB68]">
              ✓
            </div>
            <span className="text-sm text-zinc-700 dark:text-zinc-300">
              Comece em menos de 2 minutos — <span className="font-bold text-[#2CCB68]">sem complicações</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
