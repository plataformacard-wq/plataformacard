import VendedoresClient from "./VendedoresClient";
import { createClient } from "@/lib/supabase/server";
import { PLAN_LIMITS } from "@/lib/plans";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Colaboradores | PlataformaShop",
  description: "Gerencie sua equipe de colaboradores e permissões.",
};

export default async function VendedoresPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let sellerLimit = 0;
  let sellerCount = 0;
  let customDomain: string | null = null;

  if (user) {
    // Busca o perfil e o plano da organização
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, role")
      .eq("user_id", user.id)
      .maybeSingle();

    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const shadowOrgId = cookieStore.get("shadow_org_id")?.value;

    const isSuperAdmin = profile?.role === "main_admin";
    const activeOrgId = (isSuperAdmin && shadowOrgId) ? shadowOrgId : profile?.organization_id;

    if (activeOrgId) {
      const { data: org } = await supabase
        .from("organizations")
        .select("plan_id, custom_domain")
        .eq("id", activeOrgId)
        .maybeSingle();

      // Limite de vendedores do plano
      const planLimits = org?.plan_id ? PLAN_LIMITS[org.plan_id] : null;
      sellerLimit = planLimits?.max_users ?? 0;
      customDomain = org?.custom_domain ?? null;

      // Contagem atual de vendedores
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", activeOrgId)
        .eq("role", "seller");

      sellerCount = count ?? 0;
    }
  }

  return (
    <VendedoresClient
      initialSellerLimit={sellerLimit}
      initialSellerCount={sellerCount}
      customDomain={customDomain}
    />
  );
}
