import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ConfiguracoesClient from "./ConfiguracoesClient";
import { getOrCreateCatalog } from "@/lib/dashboard/sellerActions";

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

  const isSuperAdmin = profile?.role === "main_admin";
  const activeOrgId = (isSuperAdmin && shadowOrgId) ? shadowOrgId : profile?.organization_id;

  if (!activeOrgId) {
    return <div>Organização não encontrada.</div>;
  }

  const { data: orgCatalogs } = await supabase
    .from("organization_catalogs")
    .select("catalog_id")
    .eq("organization_id", activeOrgId)
    .eq("is_enabled", true);

  let catalogIds = orgCatalogs?.map((c) => c.catalog_id) || [];

  const { data: catalogsData } = await supabase
    .from("catalogs")
    .select("*")
    .in("id", catalogIds.length > 0 ? catalogIds : [ '00000000-0000-0000-0000-000000000000' ]); // Dummy id se vazio para evitar erro

  let ownCatalog = catalogsData?.find((c) => c.catalog_type !== "CaaS" && c.catalog_type !== "platform");
  let hasMasterCatalog = catalogsData?.some((c) => c.catalog_type === "CaaS" || c.catalog_type === "platform");

  // Se a organização não tiver um catálogo PRÓPRIO, cria um.
  // Mesmo que ela tenha um Master vinculado, ela precisa de um próprio para a tela de configurações.
  if (!ownCatalog) {
    const res = await getOrCreateCatalog(activeOrgId);
    if (res?.catalog?.id) {
      ownCatalog = res.catalog;
      if (!catalogIds.includes(res.catalog.id)) {
        catalogIds.push(res.catalog.id);
      }
    } else {
      return <div>Erro ao carregar ou criar o seu catálogo próprio. Detalhes: {JSON.stringify(res)}</div>;
    }
  }

  const catalogData = ownCatalog;

  if (!catalogData) {
    return <div>Nenhum catálogo ativo encontrado.</div>;
  }

  const { data: orgData } = await supabase
    .from("organizations")
    .select("accent_color, business_model, slug, custom_domain")
    .eq("id", activeOrgId)
    .single();

  const catalog = {
    ...catalogData,
    accent_color: orgData?.accent_color,
    business_model: orgData?.business_model,
  };

  const finalSlug = (isSuperAdmin && shadowOrgId) ? (orgData?.slug || "") : (profile?.slug || "");

  // Fetch active products to allow linking them in banners (using assigned catalogs, for CaaS support)
  const { data: categories } = await supabase
    .from("categories")
    .select("id")
    .in("catalog_id", catalogIds);
    
  const categoryIds = categories?.map(c => c.id) || [];
  let products: any[] = [];
  
  if (categoryIds.length > 0) {
    const { data: fetchedProducts } = await supabase
      .from("products")
      .select("id, name, image_url")
      .in("category_id", categoryIds)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("name", { ascending: true });
    products = fetchedProducts || [];
  }

  return <ConfiguracoesClient catalog={catalog} slug={finalSlug} products={products || []} categoryCount={categoryIds.length} customDomain={orgData?.custom_domain || null} isInheritingMaster={!!hasMasterCatalog} />;
}
