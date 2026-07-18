import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { AuthRedirectHandler } from "@/components/auth/AuthRedirectHandler";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { CompanyLogos } from "@/components/CompanyLogos";
import { HowItWorks } from "@/components/HowItWorks";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { Testimonials } from "@/components/Testimonials";
import { Faq } from "@/components/Faq";
import { CtaSection } from "@/components/CtaSection";
import { Footer } from "@/components/Footer";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

const WA_B2B = "https://wa.me/5527999999999?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20uma%20demonstra%C3%A7%C3%A3o%20da%20PlataformaShop%20para%20minha%20empresa.";

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function CheckIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className={`relative min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden ${inter.className}`}>
      
      {/* Padrão de Fundo Global (Fixed Grid + Glow) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 opacity-50" 
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 80%)'
          }}
        />
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 15% 50%, rgba(44, 203, 104, 0.08) 0%, transparent 50%), radial-gradient(circle at 85% 30%, rgba(6, 182, 212, 0.06) 0%, transparent 50%)'
          }}
        />
      </div>

      <div className="relative z-10">
        <AuthRedirectHandler />
        <Header />
        <HeroSection />

        {/* Social Proof Logos */}
        <CompanyLogos />

        {/* Agitation / Dores */}
        <section id="dores" className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Preços Desatualizados",
              body: "Vendedores fechando negócio com tabela antiga porque não baixaram o PDF novo.",
              icon: "⚠️",
            },
            {
              title: "Catálogos Amadores",
              body: "Representantes criando artes ruins que prejudicam a imagem premium da sua marca.",
              icon: "📉",
            },
            {
              title: "Falta de Métricas",
              body: "Você envia o PDF no grupo e não tem ideia de quem abriu ou quais produtos olharam.",
              icon: "👁️‍🗨️",
            },
          ].map((card, i) => (
            <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-8 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <div className="text-4xl mb-4">{card.icon}</div>
              <h3 className={`text-lg font-bold text-zinc-200 mb-3 ${plusJakarta.className}`}>{card.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Como Funciona Timeline */}
      <HowItWorks />

      {/* Por Que Escolher a PlataformaShop */}
      <WhyChooseUs />

      {/* Features B2B */}
      <section id="recursos" className="py-24 bg-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-extrabold text-white mb-4 ${plusJakarta.className}`}>
              A tecnologia que conecta empresas e vendedores
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Elimine a fricção entre a sua diretoria comercial e quem está na ponta vendendo.
            </p>
          </div>

          <div className="grid gap-16">
            {[
              {
                title: "Catálogo Franquias",
                desc: "Crie a estrutura de produtos uma única vez. Quando você atualiza um preço, foto ou descrição, a vitrine de todos os seus vendedores e franqueados é atualizada instantaneamente.",
                green: true,
              },
              {
                title: "Vitrine Individual Blindada",
                desc: "Cada vendedor ganha um link exclusivo contendo a foto dele e botão para o WhatsApp dele, mas os produtos exibidos obedecem às regras da sua empresa.",
                green: false,
              },
              {
                title: "Negociação Direta via WhatsApp",
                desc: "Sem checkouts complexos que espantam clientes B2B. A plataforma exibe o portfólio de forma magnética e gera um pedido organizado direto no WhatsApp do seu vendedor.",
                green: false,
              },
            ].map((feat, idx) => (
              <div key={idx} className={`flex flex-col md:flex-row gap-8 items-center ${idx % 2 !== 0 ? "md:flex-row-reverse" : ""}`}>
                <div className="flex-1">
                  <h3 className={`text-2xl font-bold text-white mb-4 ${plusJakarta.className}`}>{feat.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{feat.desc}</p>
                </div>
                <div className={`flex-1 h-64 w-full rounded-3xl flex items-center justify-center border backdrop-blur-md ${feat.green ? "bg-[#2CCB68]/5 border-[#2CCB68]/20" : "bg-white/5 border-white/5"}`}>
                   <span className={`text-sm font-semibold ${feat.green ? "text-[#2CCB68]" : "text-zinc-500"}`}>Ilustração da Interface</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prova Social / Depoimentos Animados */}
      <Testimonials />

      {/* Pricing */}
      <section id="planos" className="py-24 bg-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-extrabold text-white mb-4 ${plusJakarta.className}`}>
              Planos desenhados para o seu tamanho
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Você não precisa ser uma corporação gigante para usar tecnologia inteligente.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-md">
              <div className="text-xl font-bold text-zinc-300 mb-2">Start (Para Autônomos)</div>
              <div className={`text-5xl font-extrabold text-white mb-2 ${plusJakarta.className}`}>Grátis</div>
              <p className="text-zinc-400 mb-8">Ideal para vendedores independentes e pequenos negócios locais.</p>
              
              <ul className="space-y-4 mb-10">
                {["Até 20 produtos no catálogo", "1 Vitrine Digital Exclusiva", "Botão direto para o seu WhatsApp", "Tema Dark Mode Padrão"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-zinc-300">
                    <div className="text-[#2CCB68]"><CheckIcon size={18} /></div>
                    {item}
                  </li>
                ))}
              </ul>
              
              <Link href="/cadastro" className="block text-center w-full py-4 rounded-xl border border-[#2CCB68] text-[#2CCB68] font-bold hover:bg-[#2CCB68]/10 transition-colors">
                Criar Conta Grátis
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-[#2CCB68]/5 border border-[#2CCB68] rounded-3xl p-10 backdrop-blur-md relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2CCB68] text-[#0A0A0A] text-xs font-bold px-4 py-1 rounded-full uppercase">
                Recomendado para Empresas
              </div>
              <div className="text-xl font-bold text-[#2CCB68] mb-2">Enterprise (CaaS)</div>
              <div className={`text-5xl font-extrabold text-white mb-2 ${plusJakarta.className}`}>Customizado</div>
              <p className="text-zinc-400 mb-8">Para distribuidoras, franquias e equipes comerciais que exigem controle total.</p>
              
              <ul className="space-y-4 mb-10">
                {["Produtos Ilimitados (Master Catalog)", "Dezenas de vendedores sincronizados", "Gestão centralizada de preços", "Prioridade de Suporte Técnico"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-zinc-300">
                    <div className="text-[#2CCB68]"><CheckIcon size={18} /></div>
                    {item}
                  </li>
                ))}
              </ul>
              
              <a href={WA_B2B} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-[#2CCB68] text-[#0A0A0A] font-bold hover:bg-[#23994A] hover:text-white transition-colors">
                <WhatsAppIcon size={20} />
                Falar com Especialista
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <Faq />

      {/* Bloco de CTA (Call to Action) Final */}
      <CtaSection />

      {/* Mapa do Site (Rodapé) */}
      <Footer />
      </div>
    </main>
  );
}
