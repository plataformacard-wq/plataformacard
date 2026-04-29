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
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) {
    return <div>Organização não encontrada.</div>;
  }

  const { data: orgCatalog } = await supabase
    .from("organization_catalogs")
    .select("catalog_id")
    .eq("organization_id", profile.organization_id)
    .eq("is_enabled", true)
    .maybeSingle();

  if (!orgCatalog?.catalog_id) {
    return <div>Nenhum catálogo ativo encontrado.</div>;
  }

  const { data: catalog } = await supabase
    .from("catalogs")
    .select("*")
    .eq("id", orgCatalog.catalog_id)
    .single();

  return <ConfiguracoesClient catalog={catalog} />;
}
