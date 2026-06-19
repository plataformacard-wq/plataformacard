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

  if (catalogIds.length === 0) {
    const res = await getOrCreateCatalog(activeOrgId);
    if (res?.catalog?.id) {
      catalogIds.push(res.catalog.id);
    } else {
      return <div>Nenhum catálogo ativo encontrado.</div>;
    }
  }
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
    .select("accent_color, business_model, slug")
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

  return <ConfiguracoesClient catalog={catalog} slug={finalSlug} products={products || []} categoryCount={categoryIds.length} />;
}
