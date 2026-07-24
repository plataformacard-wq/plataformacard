import { Plus_Jakarta_Sans } from "next/font/google";
import { Star } from "lucide-react";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

// Mock Data para Depoimentos
const REVIEWS = [
  {
    text: "O app é muito bom, oferece funcionalidade prática com ótimos recursos. É fácil de usar e principalmente fácil de divulgar para os clientes. Recomendo muito.",
    name: "Anderson Cavalcante",
    initials: "AC",
    color: "bg-indigo-500",
  },
  {
    text: "Uma quantidade absurda de praticidade! Enviar o link pelo WhatsApp e o cliente já abrir o catálogo na hora salvou minhas vendas do mês. App perfeito.",
    name: "Gustavo Brandão",
    initials: "GB",
    color: "bg-blue-500",
  },
  {
    text: "Excelente! Me ajuda demais a alcançar mais clientes com apenas um clique. Acabou aquele sofrimento de enviar PDF pesado que ninguém baixava.",
    name: "Solange Cespedes",
    initials: "SC",
    color: "bg-emerald-500",
  },
  {
    text: "Fácil e prático. Melhor plataforma B2B da categoria. A equipe de suporte também é fantástica.",
    name: "Ari Ferraresi",
    initials: "AF",
    color: "bg-purple-500",
  },
  {
    text: "Adorei a plataforma; é muito fácil e útil de usar. Qualquer distribuidor pode centralizar os preços em segundos. Mágico!",
    name: "Rafael B.",
    initials: "RB",
    color: "bg-orange-500",
  },
  {
    text: "Eu amo! Exatamente o que eu procurava, muito útil para minha equipe de vendas de campo.",
    name: "Camila Sánchez",
    initials: "CS",
    color: "bg-rose-500",
  },
  {
    text: "É um ótimo app. Me permite manter todos os orçamentos e produtos da loja organizados de forma extremamente eficiente.",
    name: "Oliver Roth",
    initials: "OR",
    color: "bg-cyan-500",
  },
  {
    text: "Impressionante como algo tão simples mudou o faturamento da minha loja de autopeças. Ninguém quer ver tabela de excel, querem catálogo limpo igual o da PlataformaShop.",
    name: "Michelle Beckdorf",
    initials: "MB",
    color: "bg-violet-500",
  },
];

const ReviewCard = ({ review }: { review: any }) => (
  <div className="public-card backdrop-blur-md rounded-3xl p-6 mb-6 hover:bg-zinc-100 dark:hover:bg-[#1a1a1a]/80 transition-all w-full flex flex-col">
    {review.image_url ? (
      <div className="w-full h-auto rounded-xl overflow-hidden mb-4">
        <img src={review.image_url} alt={`Depoimento de ${review.name}`} className="w-full object-cover" />
      </div>
    ) : (
      <>
        <div className="flex gap-1 mb-4">
          {[...Array(review.stars || 5)].map((_, i) => (
            <Star key={i} size={14} className="fill-amber-500 text-amber-500" />
          ))}
        </div>
        <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed mb-6 font-medium">
          "{review.text}"
        </p>
      </>
    )}
    
    <div className="flex items-center gap-3 mt-auto">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${review.color || 'bg-zinc-800'}`}>
        {review.initials}
      </div>
      <div>
        <div className="text-zinc-900 dark:text-white font-bold text-sm">{review.name}</div>
        <div className="text-zinc-500 dark:text-zinc-400 text-xs flex items-center gap-1 mt-0.5">
          <svg className="w-3 h-3 text-[#2CCB68]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          Cliente Verificado
        </div>
      </div>
    </div>
  </div>
);

export function Testimonials({ testimonials, baseUsers = 1500, baseCatalogs = 3200 }: { testimonials?: any[], baseUsers?: number, baseCatalogs?: number }) {
  const finalTestimonials = (testimonials && testimonials.length > 0) ? testimonials : REVIEWS;

  // Dividir reviews para criar variabilidade nas colunas
  // Precisamos ter pelo menos 4 reviews por coluna para o CSS scroll não bugar (repetimos se necessário)
  const pad = (arr: any[]) => {
    while (arr.length < 4 && arr.length > 0) arr = [...arr, ...arr];
    return arr;
  };
  
  const total = finalTestimonials.length;
  const c1 = finalTestimonials.slice(0, Math.ceil(total/3));
  const c2 = finalTestimonials.slice(Math.ceil(total/3), Math.ceil((total*2)/3));
  const c3 = finalTestimonials.slice(Math.ceil((total*2)/3));

  const col1 = pad([...c1, ...c1]);
  const col2 = pad([...c2, ...c2]);
  const col3 = pad([...c3, ...c3]);

  return (
    <section className="py-24 relative overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Cabeçalho */}
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className={`text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4 ${plusJakarta.className}`}>
            Amado por equipes comerciais
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto mb-10">
            Veja por que centenas de profissionais confiam na PlataformaShop para centralizar seu catálogo e fechar vendas no WhatsApp.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <div className="text-center">
              <div className={`text-3xl font-extrabold text-zinc-900 dark:text-white ${plusJakarta.className}`}>{(baseUsers / 1000).toFixed(0)}K+</div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-widest mt-1">Lojas Virtuais</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-extrabold text-zinc-900 dark:text-white ${plusJakarta.className}`}>{baseCatalogs}+</div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-widest mt-1">Catálogos</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2 justify-center ${plusJakarta.className}`}>
                4.8 <Star className="fill-amber-500 text-amber-500 w-6 h-6" />
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-widest mt-1">Avaliação Média</div>
            </div>
          </div>
        </div>

        {/* Container Animado das Colunas (Faders com CSS Mask) */}
        <div 
          className="relative h-[600px] overflow-hidden group"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)'
          }}
        >
          
          {/* Grid de 3 Colunas Deslizantes */}
          {/* Pausa no hover: quando o mouse passa sobre QUALQUER lugar do grupo, a animação de todas as divs filhas para. */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full hover:[&>div>div]:[animation-play-state:paused]">
            
            {/* Coluna 1 (Sobe) */}
            <div className="overflow-hidden relative h-full hidden lg:block">
              <div className="animate-marquee-up flex flex-col pt-6">
                {col1.map((rev, idx) => <ReviewCard key={idx} review={rev} />)}
              </div>
            </div>

            {/* Coluna 2 (Desce) */}
            <div className="overflow-hidden relative h-full hidden md:block">
              <div className="animate-marquee-down flex flex-col pb-6" style={{ marginTop: '-50%' }}>
                 {/* O marginTop -50% garante que ele comece do lugar certo para descer infinitamente sem mostrar branco */}
                {[...col2].reverse().map((rev, idx) => <ReviewCard key={idx} review={rev} />)}
              </div>
            </div>

            {/* Coluna 3 (Sobe) */}
            <div className="overflow-hidden relative h-full">
              <div className="animate-marquee-up flex flex-col pt-12">
                {col3.map((rev, idx) => <ReviewCard key={idx} review={rev} />)}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
