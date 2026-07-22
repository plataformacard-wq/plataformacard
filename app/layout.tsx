import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GoogleAuthProvider from "@/components/auth/GoogleAuthProvider";
import GlobalBrandingProvider from "@/components/providers/GlobalBrandingProvider";
import { createClient } from "@supabase/supabase-js";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://plataforma.shop";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PlataformaShop | Catálogo Digital B2B & Cartão NFC Premium",
    template: "%s | PlataformaShop"
  },
  description: "A plataforma definitiva para criar catálogos digitais transacionais, cartões de visita NFC e força de vendas sincronizada com Bling ERP. Taxa zero por venda.",
  keywords: [
    "catálogo digital",
    "catálogo b2b",
    "cartão nfc",
    "força de vendas",
    "integração bling erp",
    "vitrine digital",
    "vendas whatsapp",
    "plataforma shop"
  ],
  authors: [{ name: "PlataformaShop" }],
  creator: "PlataformaShop",
  publisher: "PlataformaShop",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    title: "PlataformaShop | Catálogo Digital B2B & Cartão NFC Premium",
    description: "Crie vitrines virtuais transacionais para sua empresa e representantes. Sincronização em tempo real com Bling ERP e Taxa Zero.",
    siteName: "PlataformaShop",
    images: [
      {
        url: `${siteUrl}/hero_mockup.png`,
        width: 1200,
        height: 630,
        alt: "PlataformaShop - Catálogo Digital B2B e Cartão NFC"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "PlataformaShop | Catálogo Digital B2B & Cartão NFC Premium",
    description: "Venda mais com o catálogo digital transacional integrado ao Bling ERP. Taxa Zero.",
    images: [`${siteUrl}/hero_mockup.png`]
  },
  alternates: {
    canonical: siteUrl
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let brandingConfig = {
    globalLogoUrl: null as string | null,
    globalIconUrl: null as string | null,
    primaryColorLight: "#10b981",
    primaryColorDark: "#25D366",
    sidebarColorLight: "#0f172a",
    sidebarColorDark: "#0a0a0a",
  };

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: configs } = await supabase.from("platform_config").select("key, value");
    if (configs) {
      const configMap: any = {};
      configs.forEach(c => configMap[c.key] = c.value);
      brandingConfig = {
        globalLogoUrl: configMap.global_logo_url || null,
        globalIconUrl: configMap.global_icon_url || null,
        primaryColorLight: configMap.global_primary_color_light || "#10b981",
        primaryColorDark: configMap.global_primary_color_dark || "#25D366",
        sidebarColorLight: configMap.global_sidebar_color_light || "#0f172a",
        sidebarColorDark: configMap.global_sidebar_color_dark || "#0a0a0a",
      };
    }
  } catch (e) {
    console.warn("Failed to fetch global branding", e);
  }

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('dash-theme');
                  if (saved === 'dark') {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.removeAttribute('data-theme');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --primary: ${brandingConfig.primaryColorLight};
                --dash-sidebar-bg: ${brandingConfig.sidebarColorLight};
              }
              [data-theme="dark"] {
                --primary: ${brandingConfig.primaryColorDark};
                --dash-sidebar-bg: ${brandingConfig.sidebarColorDark};
              }
            `,
          }}
        />
        <GoogleAuthProvider>
          <GlobalBrandingProvider config={brandingConfig}>
            {children}
          </GlobalBrandingProvider>
        </GoogleAuthProvider>
      </body>
    </html>
  );
}
