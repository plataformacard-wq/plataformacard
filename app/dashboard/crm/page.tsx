import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CrmClient from "./CrmClient";

export default async function CrmPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  // 1. Obter perfil e organização ativa (considerando Shadow Mode)
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, organization_id, role")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return (
      <div className="p-8 text-center text-[var(--dash-text-muted)]">
        Perfil não encontrado.
      </div>
    );
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const shadowOrgId = cookieStore.get("shadow_org_id")?.value;

  const isSuperAdmin = profile.role === "main_admin";
  const activeOrgId = (isSuperAdmin && shadowOrgId) ? shadowOrgId : profile.organization_id;

  if (!activeOrgId) {
    return (
      <div className="p-8 text-center text-[var(--dash-text-muted)]">
        Organização não encontrada ou sem acesso.
      </div>
    );
  }

  // 2. Montar consulta de leads
  let query = supabase
    .from("leads_tracking")
    .select("*")
    .eq("organization_id", activeOrgId);

  // Se o usuário for vendedor, filtrar apenas por seus próprios leads
  if (profile.role === "seller") {
    query = query.eq("profile_id", profile.id);
  }

  const { data: leads } = await query.order("created_at", { ascending: false });

  // 3. Buscar os produtos ativos para a baixa de estoque
  const { data: products } = await supabase
    .from("products")
    .select("id, name, sku, stock_quantity")
    .eq("organization_id", activeOrgId)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  // 4. Buscar o plano da organização
  const { data: org } = await supabase
    .from("organizations")
    .select("plan_id")
    .eq("id", activeOrgId)
    .maybeSingle();

  return (
    <CrmClient
      initialLeads={leads || []}
      products={products || []}
      planSlug={org?.plan_id}
    />
  );
}
