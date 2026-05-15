import Link from "next/link";
import { Montserrat } from "next/font/google";

const montserratBlackItalic = Montserrat({
  weight: ["900"],
  style: ["italic"],
  subsets: ["latin"],
});

const WA = "https://wa.me/5527999999999";

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#080808",
        padding: "2px",
        boxSizing: "border-box",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 768px) {
              .landing-beneficios-grid { grid-template-columns: 1fr !important; }
              .landing-para-quem-grid { grid-template-columns: 1fr !important; }
            }
          `,
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {/* Nav */}
        <header
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 32px",
            background: "#0f0f0f",
            borderRadius: 20,
          }}
        >
          <span style={{ color: "#fff", fontSize: 13 }}>
            anotameucontato.com.br
          </span>
          <a
            href={WA}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "#fff",
              color: "#000",
              fontSize: 14,
              fontWeight: 600,
              padding: "10px 18px",
              borderRadius: 999,
              textDecoration: "none",
            }}
          >
            Falar com a gente
          </a>
        </header>

        {/* Hero */}
        <section
          style={{
            textAlign: "center",
            padding: "80px 48px",
            background: "#0f0f0f",
            borderRadius: 20,
          }}
        >
          <div
            style={{
              display: "inline-block",
              textTransform: "uppercase",
              fontSize: 12,
              letterSpacing: "0.06em",
              color: "#ffffff99",
              marginBottom: 20,
            }}
          >
            Novo jeito de vender
          </div>
          <h1
            className={montserratBlackItalic.className}
            style={{
              fontSize: 54,
              lineHeight: 1.1,
              color: "#fff",
              margin: "0 0 20px",
              maxWidth: 720,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Seu cartão de contato{" "}
            <span style={{ color: "#25D366" }}>profissional</span>
          </h1>
          <p
            style={{
              fontSize: 17,
              color: "#ffffff66",
              maxWidth: 520,
              margin: "0 auto 36px",
              lineHeight: 1.5,
            }}
          >
            Mostre quem você é, o que vende e feche mais pelo WhatsApp — tudo
            num link só.
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
              href={WA}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "#25D366",
                color: "#fff",
                fontSize: 15,
                fontWeight: 600,
                padding: "14px 24px",
                borderRadius: 999,
                textDecoration: "none",
              }}
            >
              <WhatsAppIcon size={22} />
              Falar com a gente
            </a>
            <Link
              href="/p/vendedor-teste"
              style={{
                color: "#fff",
                fontSize: 15,
                textDecoration: "none",
                opacity: 0.9,
              }}
            >
              Ver um exemplo →
            </Link>
          </div>
        </section>

        {/* Benefícios */}
        <section
          className="landing-beneficios-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "2px",
            background: "#080808",
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          {[
            {
              title: "Tudo no mesmo lugar",
              body: "Link, foto, produtos e WhatsApp — seu cliente entende rápido.",
              badge: null as string | null,
              icon: (
                <path
                  fill="currentColor"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                />
              ),
            },
            {
              title: "Foco no WhatsApp",
              body: "Um toque e o cliente já fala com você — sem fricção.",
              badge: null,
              icon: (
                <path
                  fill="currentColor"
                  d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"
                />
              ),
            },
            {
              title: "Sua vitrine exclusiva",
              body: "Destaque ofertas e diferenciais com visual limpo e moderno.",
              badge: "Exclusivo",
              icon: (
                <path
                  fill="currentColor"
                  d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                />
              ),
            },
          ].map((card, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                background: "#0f0f0f",
                borderRadius: 16,
                padding: 28,
              }}
            >
              {card.badge ? (
                <span
                  style={{
                    position: "absolute",
                    top: 20,
                    right: 20,
                    background: "#25D366",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    padding: "4px 10px",
                    borderRadius: 6,
                  }}
                >
                  {card.badge}
                </span>
              ) : null}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: "#1a1a1a",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 18,
                }}
              >
                <svg width={36} height={36} viewBox="0 0 24 24">
                  {card.icon}
                </svg>
              </div>
              <h3
                style={{
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 600,
                  margin: "0 0 10px",
                }}
              >
                {card.title}
              </h3>
              <p style={{ color: "#ffffff55", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                {card.body}
              </p>
            </div>
          ))}
        </section>

        {/* Para quem é */}
        <section
          style={{
            padding: 48,
            background: "#0f0f0f",
            borderRadius: 20,
          }}
        >
          <p
            style={{
              textTransform: "uppercase",
              fontSize: 12,
              letterSpacing: "0.08em",
              color: "#ffffff33",
              margin: "0 0 28px",
            }}
          >
            Para quem é
          </p>
          <div
            className="landing-para-quem-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 32,
            }}
          >
            {[
              {
                title: "Vendedores e representantes",
                body: "Catálogo e contato sempre à mão, no celular do cliente.",
                border: "2px solid #ffffff11",
              },
              {
                title: "Pequenos negócios",
                body: "Presença digital profissional sem site complexo.",
                border: "2px solid #ffffff11",
              },
              {
                title: "Quem vive de indicação",
                body: "Um link que resume quem você é e como contratar.",
                border: "2px solid rgba(37, 211, 102, 0.44)",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  borderLeft: item.border,
                  paddingLeft: 20,
                }}
              >
                <h4
                  style={{
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    margin: "0 0 8px",
                  }}
                >
                  {item.title}
                </h4>
                <p style={{ color: "#ffffff44", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section
          style={{
            textAlign: "center",
            padding: 48,
            background: "#0f0f0f",
            borderRadius: 20,
          }}
        >
          <h2
            className={montserratBlackItalic.className}
            style={{
              fontSize: 36,
              color: "#fff",
              margin: "0 0 12px",
              lineHeight: 1.15,
            }}
          >
            Pronto para anotar mais contatos?
          </h2>
          <p
            style={{
              color: "#ffffff55",
              fontSize: 16,
              margin: "0 auto 28px",
              maxWidth: 440,
            }}
          >
            Fale com a gente no WhatsApp e descubra como colocar sua página no
            ar.
          </p>
          <a
            href={WA}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "#25D366",
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              padding: "14px 28px",
              borderRadius: 999,
              textDecoration: "none",
              marginBottom: 32,
            }}
          >
            <WhatsAppIcon size={22} />
            Falar com a gente
          </a>
          <p style={{ color: "#ffffff22", fontSize: 12, margin: 0 }}>
            anotameucontato.com.br
          </p>
        </section>
      </div>
    </main>
  );
}
