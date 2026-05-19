import VendedoresClient from "./VendedoresClient";
import { createClient } from "@/lib/supabase/server";
import { PLAN_LIMITS } from "@/lib/plans";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Vendedores | PlataformaCard",
  description: "Gerencie sua equipe de vendedores e permissões.",
};

export default async function VendedoresPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let sellerLimit = 0;
  let sellerCount = 0;

  if (user) {
    // Busca o perfil e o plano da organização
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile?.organization_id) {
      const { data: org } = await supabase
        .from("organizations")
        .select("plan_id")
        .eq("id", profile.organization_id)
        .maybeSingle();

      // Limite de vendedores do plano
      const planLimits = org?.plan_id ? PLAN_LIMITS[org.plan_id] : null;
      sellerLimit = planLimits?.max_users ?? 0;

      // Contagem atual de vendedores
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", profile.organization_id)
        .eq("role", "seller");

      sellerCount = count ?? 0;
    }
  }

  return (
    <VendedoresClient
      initialSellerLimit={sellerLimit}
      initialSellerCount={sellerCount}
    />
  );
}
