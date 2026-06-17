import { Metadata } from "next";
import { PanelLayout } from "@/components/dashboard/PanelLayout";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return {};

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  const cookieStore = await cookies();
  const shadowOrgId = cookieStore.get("shadow_org_id")?.value;

  const isSuperAdmin = profile?.role === "superadmin";
  const activeOrgId = (isSuperAdmin && shadowOrgId) ? shadowOrgId : profile?.organization_id;

  if (activeOrgId) {
    const { data: org } = await supabase
      .from("organizations")
      .select("name, favicon_url")
      .eq("id", activeOrgId)
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

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user;
  } catch (e) {
    redirect("/entrar");
  }

  if (!user) {
    redirect("/entrar");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profile?.role === "superadmin") {
    // Se for Super Admin, só permite acesso ao /dashboard em Shadow Mode (simulação de cliente)
    const cookieStore = await cookies();
    const shadowOrgId = cookieStore.get("shadow_org_id")?.value;

    if (!shadowOrgId) {
      // Sem cookie de simulação → redireciona para o QG do Admin
      redirect("/admin");
    }
  }

  return <PanelLayout>{children}</PanelLayout>;
}