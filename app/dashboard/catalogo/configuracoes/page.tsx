import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ConfiguracoesClient from "./ConfiguracoesClient";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  // Busca a organização e o catálogo vinculado
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, slug, role")
    .eq("id", user.id)
    .single();

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const shadowOrgId = cookieStore.get("shadow_org_id")?.value;

  const isSuperAdmin = profile?.role === "superadmin";
  const activeOrgId = (isSuperAdmin && shadowOrgId) ? shadowOrgId : profile?.organization_id;

  if (!activeOrgId) {
    return <div>Organização não encontrada.</div>;
  }

  const { data: orgCatalog } = await supabase
    .from("organization_catalogs")
    .select("catalog_id")
    .eq("organization_id", activeOrgId)
    .eq("is_enabled", true)
    .maybeSingle();

  if (!orgCatalog?.catalog_id) {
    return <div>Nenhum catálogo ativo encontrado.</div>;
  }

  const { data: catalogData } = await supabase
    .from("catalogs")
    .select("*")
    .eq("id", orgCatalog.catalog_id)
    .single();

  const { data: orgData } = await supabase
    .from("organizations")
    .select("accent_color, business_model, slug")
    .eq("id", activeOrgId)
    .single();

  const catalog = {
    ...catalogData,
    accent_color: orgData?.accent_color,
    business_model: orgData?.business_model,
  };

  const finalSlug = (isSuperAdmin && shadowOrgId) ? (orgData?.slug || "") : (profile?.slug || "");

  return <ConfiguracoesClient catalog={catalog} slug={finalSlug} />;
}
