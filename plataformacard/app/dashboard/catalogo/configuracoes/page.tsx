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
    .select("organization_id, slug")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) {
    return <div>Organização não encontrada.</div>;
  }

  const { data: orgCatalogs } = await supabase
    .from("organization_catalogs")
    .select("catalog_id")
    .eq("organization_id", profile.organization_id)
    .eq("is_enabled", true);

  if (!orgCatalogs || orgCatalogs.length === 0) {
    return <div>Nenhum catálogo ativo encontrado.</div>;
  }

  const catalogIds = orgCatalogs.map((c) => c.catalog_id);
  const { data: catalogsData } = await supabase
    .from("catalogs")
    .select("*")
    .in("id", catalogIds);

  const ownCatalog = catalogsData?.find((c) => c.catalog_type !== "CaaS" && c.catalog_type !== "platform");
  const catalogData = ownCatalog || catalogsData?.[0];

  if (!catalogData) {
    return <div>Nenhum catálogo ativo encontrado.</div>;
  }

  const { data: orgData } = await supabase
    .from("organizations")
    .select("accent_color, business_model")
    .eq("id", profile.organization_id)
    .single();

  const catalog = {
    ...catalogData,
    accent_color: orgData?.accent_color,
    business_model: orgData?.business_model,
  };

  return <ConfiguracoesClient catalog={catalog} slug={profile?.slug || ""} />;
}
