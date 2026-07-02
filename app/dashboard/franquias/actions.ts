"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function createFranchiseCatalog(name: string, description: string, allowPriceOverrides: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autorizado");

  // Validate if user is ALL_SERVICE
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, organization_id, organizations(business_model)")
    .eq("user_id", user.id)
    .single();

  const org = Array.isArray(profile?.organizations) ? profile?.organizations[0] : profile?.organizations;
  if (org?.business_model !== "ALL_SERVICE") {
    throw new Error("Apenas contas ALL_SERVICE podem criar catálogos de franquia.");
  }

  const adminClient = createAdminClient();

  if (!profile || !profile.organization_id) {
    return { error: "Perfil ou organização não encontrada." };
  }

  const { data: inserted, error } = await adminClient
    .from("catalogs")
    .insert({
      name,
      description,
      catalog_type: "platform",
      owner_id: user.id,
      owner_profile_id: user.id,
      organization_id: profile.organization_id,
      allow_price_overrides: allowPriceOverrides
    })
    .select("id")
    .single();

  if (error) {
    console.error("createFranchiseCatalog error:", error);
    throw new Error(`Erro ao criar catálogo matriz: ${error.message}`);
  }

  revalidatePath("/dashboard/franquias");
  return { success: true, id: inserted.id };
}

export async function getFranchiseCatalogs() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: catalogs, error } = await supabase
    .from("catalogs")
    .select("id, name, description, allow_price_overrides, created_at, deleted_at")
    .eq("owner_id", user.id)
    .eq("catalog_type", "platform")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getFranchiseCatalogs error:", error);
    return [];
  }

  return catalogs || [];
}

export async function getFranchisees(catalogId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Verify ownership of catalog
  const { data: catalog } = await supabase
    .from("catalogs")
    .select("id")
    .eq("id", catalogId)
    .eq("owner_id", user.id)
    .single();

  if (!catalog) throw new Error("Catálogo não encontrado ou não autorizado.");

  const adminClient = createAdminClient();

  // Find organizations linked to this catalog
  const { data: orgCatalogs, error } = await adminClient
    .from("organization_catalogs")
    .select(`
      organization_id,
      is_enabled,
      created_at,
      organizations (
        id,
        name,
        slug,
        whatsapp,
        business_model,
        profiles (
          full_name,
          email,
          avatar_url
        )
      )
    `)
    .eq("catalog_id", catalogId)
    .eq("is_enabled", true);

  if (error) {
    console.error("getFranchisees error:", error);
    return [];
  }

  return orgCatalogs?.map((oc: any) => {
    const org = Array.isArray(oc.organizations) ? oc.organizations[0] : oc.organizations;
    const owner = org?.profiles && org.profiles.length > 0 ? org.profiles[0] : null;
    return {
      id: org?.id,
      name: org?.name,
      slug: org?.slug,
      whatsapp: org?.whatsapp,
      business_model: org?.business_model,
      linked_at: oc.created_at,
      owner_name: owner?.full_name,
      owner_email: owner?.email,
      avatar_url: owner?.avatar_url
    };
  }) || [];
}

export async function togglePriceOverrides(catalogId: string, allowPriceOverrides: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autorizado");

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("catalogs")
    .update({ allow_price_overrides: allowPriceOverrides })
    .eq("id", catalogId)
    .eq("owner_id", user.id);

  if (error) {
    console.error("togglePriceOverrides error:", error);
    throw new Error("Erro ao atualizar configuração de preços.");
  }

  revalidatePath("/dashboard/franquias");
  return { success: true };
}
