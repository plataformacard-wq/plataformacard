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

export const metadata: Metadata = {
  title: "PlataformaShop | Gestão de Catálogos e Cartões Digitais",
  description: "A solução definitiva para gestão de catálogos B2B, cartões digitais pessoais e vitrines CaaS.",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('dash-theme');
                  if (saved === 'light') {
                    document.documentElement.removeAttribute('data-theme');
                  } else {
                    document.documentElement.setAttribute('data-theme', 'dark');
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
