import Link from "next/link";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { AuthRedirectHandler } from "@/components/auth/AuthRedirectHandler";

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
    <main
      className={inter.className}
      style={{
        minHeight: "100vh",
        background: "#23262D",
        color: "#FFFFFF",
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      <AuthRedirectHandler />
      
      {/* Pattern de Fundo (Conexão) */}
      <div 
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "100vh",
          backgroundImage: "radial-gradient(circle at 50% -20%, rgba(44, 203, 104, 0.15) 0%, rgba(35, 38, 45, 0) 60%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Nav */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "24px 0",
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Logo Simulado */}
            <div style={{ width: 32, height: 32, background: "#2CCB68", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 20 }}>
              P
            </div>
            <span className={plusJakarta.className} style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>
              Plataforma<span style={{ color: "#2CCB68" }}>Card</span>
            </span>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Link
              href="/entrar"
              style={{
                color: "#EBEAED",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                padding: "8px 16px",
              }}
            >
              Fazer Login
            </Link>
            <a
              href={WA_B2B}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "#2CCB68",
                color: "#23262D",
                fontSize: 14,
                fontWeight: 700,
                padding: "10px 20px",
                borderRadius: 999,
                textDecoration: "none",
                display: "none",
              }}
              className="sm:flex"
            >
              Falar com Especialista
            </a>
          </div>
        </header>

        {/* Hero */}
        <section
          style={{
            textAlign: "center",
            padding: "100px 0 80px",
          }}
        >
          <div
            style={{
              display: "inline-block",
              background: "rgba(44, 203, 104, 0.1)",
              border: "1px solid rgba(44, 203, 104, 0.2)",
              color: "#2CCB68",
              padding: "6px 16px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.04em",
              marginBottom: 24,
            }}
          >
            SOLUÇÃO CAAS (CATALOG AS A SERVICE)
          </div>
          <h1
            className={plusJakarta.className}
            style={{
              fontSize: "clamp(40px, 5vw, 64px)",
              lineHeight: 1.1,
              fontWeight: 800,
              color: "#fff",
              margin: "0 auto 24px",
              maxWidth: 800,
              letterSpacing: "-0.02em",
            }}
          >
            O fim do caos em PDFs. Retome o <span style={{ color: "#2CCB68" }}>controle absoluto</span> das suas vendas.
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "#9AA0A6",
              maxWidth: 640,
              margin: "0 auto 40px",
              lineHeight: 1.6,
            }}
          >
            Centralize seus produtos, atualize preços em tempo real para toda a rede de franqueados e vendedores, e receba pedidos organizados direto no WhatsApp.
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <a
              href={WA_B2B}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "#2CCB68",
                color: "#23262D",
                fontSize: 16,
                fontWeight: 700,
                padding: "16px 32px",
                borderRadius: 999,
                textDecoration: "none",
              }}
              className="btn-hover"
            >
              Agendar Demonstração B2B
            </a>
            <Link
              href="#planos"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#fff",
                fontSize: 16,
                fontWeight: 600,
                padding: "15px 32px",
                borderRadius: 999,
                textDecoration: "none",
              }}
            >
              Ver Planos
            </Link>
          </div>
        </section>

        {/* Agitation / Dores */}
        <section style={{ padding: "60px 0" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 24,
            }}
          >
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
              <div
                key={i}
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: 16,
                  padding: 32,
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 16 }}>{card.icon}</div>
                <h3 className={plusJakarta.className} style={{ fontSize: 18, fontWeight: 700, color: "#EBEAED", marginBottom: 12 }}>
                  {card.title}
                </h3>
                <p style={{ color: "#9AA0A6", fontSize: 15, lineHeight: 1.5 }}>{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features B2B */}
        <section style={{ padding: "80px 0" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 className={plusJakarta.className} style={{ fontSize: 36, fontWeight: 800, color: "#fff", marginBottom: 16 }}>
              A tecnologia que conecta empresas e vendedores
            </h2>
            <p style={{ color: "#9AA0A6", fontSize: 18, maxWidth: 600, margin: "0 auto" }}>
              Elimine a fricção entre a sua diretoria comercial e quem está na ponta vendendo.
            </p>
          </div>

          <div style={{ display: "grid", gap: 64 }}>
            {[
              {
                title: "Catálogo Mestre (CaaS)",
                desc: "Crie a estrutura de produtos uma única vez. Quando você atualiza um preço, foto ou descrição, a vitrine de todos os seus vendedores e franqueados é atualizada instantaneamente.",
                green: true,
              },
              {
                title: "Vitrine Individual Blindada",
                desc: "Cada vendedor ganha um link exclusivo (ex: plataforma.com/joao-silva) contendo a foto dele e botão para o WhatsApp dele, mas os produtos exibidos obedecem às regras da sua empresa.",
                green: false,
              },
              {
                title: "Negociação Direta via WhatsApp",
                desc: "Sem checkouts complexos que espantam clientes B2B. A plataforma exibe o portfólio de forma magnética e gera um pedido organizado direto no WhatsApp do seu vendedor.",
                green: false,
              },
            ].map((feat, idx) => (
              <div key={idx} style={{ display: "flex", gap: 32, alignItems: "center", flexDirection: idx % 2 !== 0 ? "row-reverse" : "row", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 400px" }}>
                  <h3 className={plusJakarta.className} style={{ fontSize: 28, fontWeight: 800, color: "#EBEAED", marginBottom: 16 }}>
                    {feat.title}
                  </h3>
                  <p style={{ color: "#9AA0A6", fontSize: 16, lineHeight: 1.6 }}>{feat.desc}</p>
                </div>
                <div style={{ flex: "1 1 400px", height: 240, background: feat.green ? "rgba(44, 203, 104, 0.05)" : "rgba(255, 255, 255, 0.03)", border: feat.green ? "1px solid rgba(44, 203, 104, 0.2)" : "1px solid rgba(255, 255, 255, 0.05)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                   {/* Placeholder para uma imagem do sistema depois */}
                   <span style={{ color: feat.green ? "#2CCB68" : "#9AA0A6", fontSize: 14, fontWeight: 600 }}>Ilustração da Interface</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing / B2C Hook */}
        <section id="planos" style={{ padding: "80px 0 100px" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 className={plusJakarta.className} style={{ fontSize: 36, fontWeight: 800, color: "#fff", marginBottom: 16 }}>
              Planos desenhados para o seu tamanho
            </h2>
            <p style={{ color: "#9AA0A6", fontSize: 18, maxWidth: 600, margin: "0 auto" }}>
              Você não precisa ser uma corporação gigante para usar tecnologia inteligente.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32, alignItems: "center" }}>
            
            {/* Plano Free (B2C) */}
            <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: 24, padding: 40 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#EBEAED", marginBottom: 8 }}>Start (Para Autônomos)</div>
              <div style={{ fontSize: 48, fontWeight: 800, color: "#fff", marginBottom: 8 }} className={plusJakarta.className}>Grátis</div>
              <p style={{ color: "#9AA0A6", fontSize: 15, marginBottom: 32 }}>Ideal para vendedores independentes e pequenos negócios locais.</p>
              
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px", display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  "Até 20 produtos no catálogo",
                  "1 Vitrine Digital Exclusiva",
                  "Botão direto para o seu WhatsApp",
                  "Tema Dark Mode Padrão"
                ].map((item, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, color: "#EBEAED", fontSize: 15 }}>
                    <div style={{ color: "#2CCB68" }}><CheckIcon size={18} /></div>
                    {item}
                  </li>
                ))}
              </ul>
              
              <Link
                href="/cadastro"
                style={{
                  display: "block",
                  textAlign: "center",
                  background: "transparent",
                  border: "1px solid #2CCB68",
                  color: "#2CCB68",
                  fontSize: 16,
                  fontWeight: 700,
                  padding: "16px",
                  borderRadius: 12,
                  textDecoration: "none",
                }}
              >
                Criar Conta Grátis
              </Link>
            </div>

            {/* Plano Corporate (B2B) */}
            <div style={{ background: "rgba(44, 203, 104, 0.03)", border: "2px solid #2CCB68", borderRadius: 24, padding: 48, position: "relative" }}>
              <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#2CCB68", color: "#23262D", fontSize: 12, fontWeight: 800, padding: "6px 16px", borderRadius: 999, textTransform: "uppercase", whiteSpace: "nowrap" }}>
                Recomendado para Empresas
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#2CCB68", marginBottom: 8 }}>Enterprise (CaaS)</div>
              <div style={{ fontSize: 48, fontWeight: 800, color: "#fff", marginBottom: 8 }} className={plusJakarta.className}>Customizado</div>
              <p style={{ color: "#9AA0A6", fontSize: 15, marginBottom: 32 }}>Para distribuidoras, franquias e equipes comerciais que exigem controle total.</p>
              
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px", display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  "Produtos Ilimitados (Master Catalog)",
                  "Dezenas de vendedores sincronizados",
                  "Gestão centralizada de preços",
                  "Prioridade de Suporte Técnico"
                ].map((item, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, color: "#EBEAED", fontSize: 15 }}>
                    <div style={{ color: "#2CCB68" }}><CheckIcon size={18} /></div>
                    {item}
                  </li>
                ))}
              </ul>
              
              <a
                href={WA_B2B}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  background: "#2CCB68",
                  color: "#23262D",
                  fontSize: 16,
                  fontWeight: 700,
                  padding: "16px",
                  borderRadius: 12,
                  textDecoration: "none",
                }}
              >
                <WhatsAppIcon size={20} />
                Falar com Especialista
              </a>
            </div>

          </div>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)", padding: "40px 0", textAlign: "center", color: "#9AA0A6", fontSize: 14 }}>
          <p>© {new Date().getFullYear()} PlataformaShop. Todos os direitos reservados.</p>
        </footer>

      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 768px) {
              .sm\\:flex { display: none !important; }
            }
            .btn-hover { transition: background 0.2s; }
            .btn-hover:hover { background: #23994A !important; }
          `,
        }}
      />
    </main>
  );
}
