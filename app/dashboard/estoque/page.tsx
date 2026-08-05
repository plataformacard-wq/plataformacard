import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import EstoqueClient from "./EstoqueClient";

export default async function EstoquePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  // 1. Obter perfil e organização ativa (considerando simulação de administrador se aplicável)
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const shadowOrgId = cookieStore.get("shadow_org_id")?.value;

  const isSuperAdmin = profile?.role === "main_admin";
  const activeOrgId = (isSuperAdmin && shadowOrgId) ? shadowOrgId : profile?.organization_id;

  if (!activeOrgId) {
    return (
      <div className="p-8 text-center text-[var(--dash-text-muted)]">
        Organização não encontrada ou sem acesso.
      </div>
    );
  }

  // 2. Buscar catálogos vinculados a esta organização
  const { data: orgCatalogs } = await supabase
    .from("organization_catalogs")
    .select("catalog_id")
    .eq("organization_id", activeOrgId);

  const catalogIds = orgCatalogs?.map((c) => c.catalog_id) || [];

  // 3. Buscar categorias vinculadas a esses catálogos
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .in("catalog_id", catalogIds.length > 0 ? catalogIds : ["00000000-0000-0000-0000-000000000000"])
    .order("name", { ascending: true });

  // 4. Buscar todos os produtos ativos desta organização
  const { data: productsData } = await supabase
    .from("products")
    .select("id, name, sku, image_url, stock_quantity, is_in_stock, category_id, categories(name)")
    .eq("organization_id", activeOrgId)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  const products = (productsData || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    image_url: p.image_url,
    stock_quantity: p.stock_quantity,
    is_in_stock: p.is_in_stock,
    category_id: p.category_id,
    categories: Array.isArray(p.categories) 
      ? (p.categories[0] || null) 
      : (p.categories || null)
  }));

  // 5. Verificar conexão com Bling e Plano
  const { data: org } = await supabase
    .from("organizations")
    .select("bling_access_token, plan_id")
    .eq("id", activeOrgId)
    .maybeSingle();

  const hasBlingConnection = !!org?.bling_access_token;

  return (
    <EstoqueClient
      products={products || []}
      categories={categories || []}
      orgId={activeOrgId}
      hasBlingConnection={hasBlingConnection}
      planSlug={org?.plan_id}
    />
  );
}
