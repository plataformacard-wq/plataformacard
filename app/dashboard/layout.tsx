import { Metadata } from "next";
import { PanelLayout } from "@/components/dashboard/PanelLayout";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return {};

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profile?.organization_id) {
    const { data: org } = await supabase
      .from("organizations")
      .select("name, favicon_url")
      .eq("id", profile.organization_id)
      .maybeSingle();

    if (org?.favicon_url) {
      const iconUrl = `${org.favicon_url}${org.favicon_url.includes('?') ? '&' : '?'}t=${Date.now()}`;
      return {
        title: `Dashboard | ${org.name}`,
        icons: {
          icon: iconUrl,
          shortcut: iconUrl,
          apple: iconUrl,
        },
      };
    }
  }

  return { title: "PlataformaCard | Dashboard" };
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <PanelLayout>{children}</PanelLayout>;
}