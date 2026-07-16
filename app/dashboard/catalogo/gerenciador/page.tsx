import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMyProfile } from "@/lib/admin-actions";
import { redirect } from "next/navigation";
import CatalogManagerClient from "./CatalogManagerClient";

export default async function CatalogManagerPage() {
  const supabase = await createClient();
  const profile = await getMyProfile();

  if (!profile) {
    return <div>Perfil não encontrado.</div>;
  }

  if (profile.role === "seller") {
    const catalogPerms = (profile.granular_permissions as any)?.catalog || {};
    const canManageProducts = catalogPerms.create !== false || catalogPerms.edit !== false || catalogPerms.delete !== false;
    if (!canManageProducts) {
      redirect("/dashboard/perfil");
    }
  }

  const orgId = profile.organization_id;

  const { data: orgData } = await supabase
    .from("organizations")
    .select("business_model, bling_access_token")
    .eq("id", orgId)
    .single();

  const isAllService = orgData?.business_model === "ALL_SERVICE";
  const hasBlingConnection = !!orgData?.bling_access_token;

  // Busca todos os catálogos disponíveis para a organização (Mapeamento)
  const { data: orgCatalogsData } = await supabase
    .from("organization_catalogs")
    .select("*, catalogs(*)")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: true });

  const orgCatalogs = orgCatalogsData || [];

  // Busca o catálogo selecionado individualmente pelo perfil
  const { data: profileCatalogData } = await supabase
    .from("profile_catalogs")
    .select("organization_catalog_id, is_selected")
    .eq("profile_id", profile.id)
    .eq("is_selected", true)
    .maybeSingle();

  const adminSupabase = createAdminClient();

  // Vamos mapear os dados para o Client Component
  const catalogs = await Promise.all(
    orgCatalogs.map(async (oc) => {
      // Buscar categorias desse catálogo
      const { data: cats } = await adminSupabase
        .from("categories")
        .select("id")
        .eq("catalog_id", oc.catalog_id);
      
      const catIds = cats?.map(c => c.id) || [];
      
      let count = 0;
      if (catIds.length > 0) {
        const { data: prods1 } = await adminSupabase
          .from("products")
          .select("id")
          .eq("catalog_id", oc.catalog_id)
          .is("deleted_at", null);
          
        const { data: prods2 } = await adminSupabase
          .from("products")
          .select("id")
          .in("category_id", catIds)
          .is("deleted_at", null);
          
        const allIds = new Set([
          ...(prods1?.map(p => p.id) || []),
          ...(prods2?.map(p => p.id) || [])
        ]);
        count = allIds.size;
      } else {
        const { count: c } = await adminSupabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("catalog_id", oc.catalog_id)
          .is("deleted_at", null);
        count = c || 0;
      }

      let isActive = false;
      // Se tivermos vínculo de perfil, esse dita a regra
      if (profileCatalogData?.organization_catalog_id) {
        isActive = profileCatalogData.organization_catalog_id === oc.id;
      } else {
        // Se não, usamos a flag da organização (mais comum em admin B2B/CaaS onde o admin configura pra org inteira)
        isActive = !!oc.is_enabled;
      }

      const masterCatalog = Array.isArray(oc.catalogs) ? oc.catalogs[0] : oc.catalogs;
      const isOwner = masterCatalog?.organization_id === orgId;
      const isPlatformType = ['CaaS', 'platform'].includes(masterCatalog?.catalog_type);

      return {
        id: oc.id, // ID of the organization_catalogs mapping row
        masterCatalogId: oc.catalog_id,
        name: masterCatalog?.name || "Catálogo",
        description: masterCatalog?.description || "",
        logoUrl: masterCatalog?.logo_url,
        type: masterCatalog?.catalog_type || "Padrão",
        isInherited: !isOwner && isPlatformType,
        isOwnedMaster: isOwner && isPlatformType,
        isActive,
        productCount: count || 0,
        createdAt: oc.created_at,
      };
    })
  );

  const hasOwnedMaster = catalogs.some(c => c.isOwnedMaster);
  const filteredCatalogs = hasOwnedMaster 
    ? catalogs.filter(c => c.type !== 'custom') 
    : catalogs;

  return (
    <div className="p-6 md:p-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--dash-text)] flex items-center gap-3">
          <span className="p-2 bg-[var(--dash-hover-bg)] rounded-xl text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
          </span>
          Gerenciar Catálogo
        </h1>
        <p className="text-[var(--dash-text-secondary)] mt-2">
          Gerencie e ative os catálogos disponíveis para a sua loja. Apenas um catálogo pode estar ativo por vez.
        </p>
      </div>

      <CatalogManagerClient 
        catalogs={filteredCatalogs} 
        orgId={orgId} 
        profileId={profile.id} 
        isAllService={isAllService}
        initialHasBlingConnection={hasBlingConnection}
      />
    </div>
  );
}
