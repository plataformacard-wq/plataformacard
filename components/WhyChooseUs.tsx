import { Plus_Jakarta_Sans } from "next/font/google";
import { Leaf, RefreshCcw, MessageSquare, ShieldCheck, Sparkles } from "lucide-react";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export function WhyChooseUs() {
  const stats = [
    { value: "10k+", label: "Catálogos Criados", gradient: "from-[#2CCB68] to-[#06B6D4]" },
    { value: "99.9%", label: "Disponibilidade", gradient: "from-[#06B6D4] to-[#3B82F6]" },
    { value: "500+", label: "Empresas Ativas", gradient: "from-[#8B5CF6] to-[#D946EF]" },
    { value: "R$ 50M+", label: "Transacionados", gradient: "from-[#F59E0B] to-[#EF4444]" },
  ];

  const features = [
    {
      title: "Eco-Friendly",
      desc: "Substitua centenas de catálogos e cartões de papel por uma solução digital sustentável. Economize árvores e reduza desperdício em cada conexão.",
      icon: Leaf,
      color: "bg-[#2CCB68]",
      shadow: "shadow-[#2CCB68]/20",
    },
    {
      title: "Sempre Atual",
      desc: "Atualize preços ou fotos uma única vez e todos passam a ter automaticamente seus dados mais recentes. Sem PDFs desatualizados, sem oportunidades perdidas.",
      icon: RefreshCcw,
      color: "bg-[#06B6D4]",
      shadow: "shadow-[#06B6D4]/20",
    },
    {
      title: "Negociação via WhatsApp",
      desc: "Sincronize contatos e receba pedidos pré-formatados diretamente no seu WhatsApp. Nunca mais perca um lead ou insira dados manualmente no sistema.",
      icon: MessageSquare,
      color: "bg-[#8B5CF6]",
      shadow: "shadow-[#8B5CF6]/20",
    },
    {
      title: "Pronto para Empresas",
      desc: "Segurança de alto nível, gestão de equipes comerciais e controle centralizado (Master Catalog). Confiado por dezenas de distribuidoras e indústrias.",
      icon: ShieldCheck,
      color: "bg-[#F97316]",
      shadow: "shadow-[#F97316]/20",
    },
  ];

  return (
    <section className="py-24 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2CCB68]/10 border border-[#2CCB68]/20 text-[#2CCB68] text-xs font-bold uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2CCB68]" />
            Por Que PlataformaShop
          </div>
          <h2 className={`text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4 ${plusJakarta.className}`}>
            Por Que Escolher a Plataforma<span className="text-[#2CCB68]">Shop?</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Tudo o que você precisa para revolucionar suas vendas B2B e o seu networking profissional.
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-20">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#0a0a0a] border border-white/5 shadow-xl min-w-[160px] md:min-w-[200px] hover:border-white/10 transition-colors group cursor-default">
              <span className={`text-3xl md:text-4xl font-extrabold mb-1 bg-clip-text text-transparent bg-gradient-to-r ${stat.gradient} group-hover:scale-105 transition-transform duration-300 ${plusJakarta.className}`}>
                {stat.value}
              </span>
              <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Features 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="group relative bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-all duration-300 overflow-hidden cursor-default">
                {/* Hover Glow Effect */}
                <div className={`absolute top-0 right-0 w-64 h-64 opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-3xl pointer-events-none rounded-full ${feat.color}`} />
                
                {/* Corner Decorative Icon (faint) */}
                <div className="absolute top-6 right-6 text-zinc-800 group-hover:text-zinc-700 transition-colors duration-300">
                  <Sparkles size={24} strokeWidth={1} />
                </div>

                <div className="relative z-10 flex flex-col h-full">
                  {/* Colorful Icon Box */}
                  <div className={`w-14 h-14 rounded-2xl ${feat.color} flex items-center justify-center mb-6 shadow-lg ${feat.shadow} group-hover:-translate-y-1 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  
                  {/* Text Content */}
                  <h3 className={`text-2xl font-bold text-white mb-4 ${plusJakarta.className}`}>
                    {feat.title}
                  </h3>
                  <p className="text-zinc-400 leading-relaxed text-sm">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
