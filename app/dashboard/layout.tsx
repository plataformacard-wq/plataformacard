import { Metadata } from "next";
import { PanelLayout } from "@/components/dashboard/PanelLayout";
import BlockedSubscriptionScreen from "@/components/auth/BlockedSubscriptionScreen";
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

  const isSuperAdmin = profile?.role === "main_admin";
  const activeOrgId = (isSuperAdmin && shadowOrgId) ? shadowOrgId : profile?.organization_id;

  if (activeOrgId) {
    const { data: org } = await supabase
      .from("organizations")
      .select("name, favicon_url")
      .eq("id", activeOrgId)
      .maybeSingle();

    if (org?.favicon_url) {
      const iconUrl = `${org.favicon_url}${org.favicon_url.includes('?') ? '&' : '?'}t=${Date.now()}`;
      const iconType = org.favicon_url.toLowerCase().endsWith('.jpg') || org.favicon_url.toLowerCase().endsWith('.jpeg') ? 'image/jpeg' : org.favicon_url.toLowerCase().endsWith('.png') ? 'image/png' : 'image/x-icon';
      return {
        title: `Dashboard | ${org.name}`,
        icons: {
          icon: [
            { url: iconUrl, sizes: "any", type: iconType }
          ],
          shortcut: [
            { url: iconUrl, type: iconType }
          ],
          apple: [
            { url: iconUrl, type: iconType }
          ],
        },
      };
    }
  }

  return { title: "PlataformaShop | Dashboard" };
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
    .select("role, subscription_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profile?.role === "main_admin") {
    // Se for Super Admin, só permite acesso ao /dashboard em Shadow Mode (simulação de cliente)
    const cookieStore = await cookies();
    const shadowOrgId = cookieStore.get("shadow_org_id")?.value;

    if (!shadowOrgId) {
      // Sem cookie de simulação → redireciona para o QG do Admin
      redirect("/main");
    }
  } else {
    // Para lojistas normais (B2B ou B2C), verificar o status da assinatura
    if (profile?.subscription_status && profile.subscription_status !== "active" && profile.subscription_status !== "trialing") {
      return <BlockedSubscriptionScreen status={profile.subscription_status} />;
    }
  }

  return <PanelLayout>{children}</PanelLayout>;
}