import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { AuthRedirectHandler } from "@/components/auth/AuthRedirectHandler";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { CompanyLogos } from "@/components/CompanyLogos";
import { HowItWorks } from "@/components/HowItWorks";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { Testimonials } from "@/components/Testimonials";
import { PricingSection } from "@/components/PricingSection";
import { Faq } from "@/components/Faq";
import { CtaSection } from "@/components/CtaSection";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 60; // ISR cache de 60 segundos

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

export default async function HomePage() {
  const supabase = createAdminClient();

  const [
    { data: settings },
    { data: testimonials },
    { data: partners },
    { data: faqs },
    { data: plans }
  ] = await Promise.all([
    supabase.from("landing_page_settings").select("*").eq("is_singleton", true).single(),
    supabase.from("landing_page_testimonials").select("*").eq("is_active", true),
    supabase.from("landing_page_partners").select("*").eq("is_active", true),
    supabase.from("landing_page_faqs").select("*").eq("is_active", true).order("display_order"),
    supabase.from("landing_page_plans").select("*").eq("is_active", true).order("display_order")
  ]);

  const fallbackSettings = {
    hero_headline: "O fim do caos em PDFs.",
    hero_subtitle: "Retome o controle das suas vendas com o catálogo digital perfeito.",
    base_users: 1500,
    base_catalogs: 3200
  };

  const finalSettings = settings || fallbackSettings;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://plataforma.shop";

  // 🤖 GEO & SEO: Schema JSON-LD Ontológico para Motores de Busca e IAs (ChatGPT, Perplexity, Claude, Gemini)
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PlataformaShop",
    "url": siteUrl,
    "logo": `${siteUrl}/logo_fundo_escuro_ps.png`,
    "description": "Plataforma SaaS para gestão de catálogos B2B transacionais, cartões NFC e força de vendas integrada ao Bling ERP.",
    "contactPoint": {
      "@type": "ContactPoint",
      "email": finalSettings.support_email || "suporte@plataformashop.com.br",
      "telephone": finalSettings.support_phone || "+55-27-99999-9999",
      "contactType": "customer service",
      "availableLanguage": ["Portuguese"]
    },
    "sameAs": [
      finalSettings.social_instagram,
      finalSettings.social_facebook,
      finalSettings.social_linkedin,
      finalSettings.social_youtube,
      finalSettings.social_tiktok,
      finalSettings.social_x
    ].filter(Boolean)
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "PlataformaShop",
    "operatingSystem": "Web, iOS, Android",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "BRL",
      "lowPrice": "59.90",
      "highPrice": "299.90",
      "offerCount": plans?.length || 3
    },
    "description": "Software SaaS para catálogo digital transacional B2B, cartões de visita NFC e integração em tempo real com Bling ERP. Taxa zero por venda.",
    "featureList": [
      "Taxa zero nas vendas",
      "Sincronização em tempo real com Bling ERP v3",
      "Cartão de visitas NFC físico e digital",
      "Incorporação em site via iFrame",
      "Gestão de força de vendas e múltiplos vendedores",
      "Checkout nativo e Pix direto na conta"
    ]
  };

  const faqSchema = faqs && faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq: any) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  return (
    <main className={`relative min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] text-zinc-900 dark:text-white transition-colors duration-300 overflow-x-hidden ${inter.className}`}>
      {/* 🤖 Script Injetado de Dados Estruturados JSON-LD para IAs e Motores de Busca */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Padrão de Fundo Global (Fixed Grid + Glow) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-70 bg-grid-pattern" />
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 15% 50%, rgba(44, 203, 104, 0.08) 0%, transparent 50%), radial-gradient(circle at 85% 30%, rgba(6, 182, 212, 0.06) 0%, transparent 50%)'
          }}
        />
      </div>

      <div className="relative z-10">
        <AuthRedirectHandler />
        <Header settings={finalSettings} />
        <HeroSection settings={finalSettings} />

        {/* Social Proof Logos */}
        <CompanyLogos partners={partners || []} />

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
            <div key={i} className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/5 rounded-2xl p-8 backdrop-blur-sm shadow-md dark:shadow-none hover:border-zinc-300 dark:hover:bg-white/10 transition-all">
              <div className="text-4xl mb-4">{card.icon}</div>
              <h3 className={`text-lg font-bold text-zinc-900 dark:text-zinc-200 mb-3 ${plusJakarta.className}`}>{card.title}</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{card.body}</p>
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
            <h2 className={`text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white mb-4 ${plusJakarta.className}`}>
              A tecnologia que conecta empresas e vendedores
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
              Elimine a fricção entre a sua diretoria comercial e quem está na ponta vendendo.
            </p>
          </div>

          <div className="grid gap-16">
            {[
              {
                title: "Taxa Zero nas Vendas",
                desc: "Abandone as plataformas de Link na Bio que cobram até 10% de pedágio. Receba pagamentos via Pix direto na sua conta, sem intermediários.",
                green: true,
              },
              {
                title: "Estoque Sincronizado (Bling V3)",
                desc: "Chega de PDF desatualizado. Integre a plataforma ao seu Bling e seu catálogo sempre mostrará o preço e o estoque reais em tempo real.",
                green: false,
              },
              {
                title: "Físico e Digital: O Híbrido Perfeito",
                desc: "Seu vendedor aborda o cliente fisicamente com o Cartão NFC premium, que abre instantaneamente o catálogo online no celular do cliente.",
                green: false,
              },
              {
                title: "Incorpore no seu Site (iFrame)",
                desc: "Com apenas 1 linha de código, você embeda o seu catálogo completo dentro do seu site institucional. Rápido, profissional e conversivo.",
                green: false,
              },
            ].map((feat, idx) => (
              <div key={idx} className={`flex flex-col md:flex-row gap-8 items-center ${idx % 2 !== 0 ? "md:flex-row-reverse" : ""}`}>
                <div className="flex-1">
                  <h3 className={`text-2xl font-bold text-zinc-900 dark:text-white mb-4 ${plusJakarta.className}`}>{feat.title}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{feat.desc}</p>
                </div>
                <div className={`flex-1 h-64 w-full rounded-3xl flex items-center justify-center border backdrop-blur-md ${feat.green ? "bg-[#2CCB68]/5 border-[#2CCB68]/20" : "bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/5 shadow-sm"}`}>
                   <span className={`text-sm font-semibold ${feat.green ? "text-[#2CCB68]" : "text-zinc-500"}`}>Ilustração da Interface</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prova Social / Depoimentos Animados */}
      <Testimonials testimonials={testimonials || []} baseUsers={finalSettings.base_users} baseCatalogs={finalSettings.base_catalogs} />

      {/* Pricing - Agora é um Client Component Interativo */}
      <PricingSection plans={plans || []} />

      {/* FAQ */}
      <Faq faqs={faqs || []} />

      {/* Bloco de CTA (Call to Action) Final */}
      <CtaSection />

      {/* Mapa do Site (Rodapé) */}
      <Footer settings={finalSettings} />
      </div>
    </main>
  );
}
