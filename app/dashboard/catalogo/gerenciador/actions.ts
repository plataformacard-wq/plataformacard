"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { setActiveCatalogSchema, createCatalogSchema } from "@/lib/validations/catalog-schemas";

export async function setActiveCatalog(
  targetOrgId: string, 
  profileId: string, 
  orgCatalogId: string
) {
  const parsed = setActiveCatalogSchema.safeParse({ targetOrgId, profileId, orgCatalogId });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = createAdminClient();

  // 1. Atualizar organization_catalogs (desativa todos, ativa o selecionado)
  await supabase
    .from("organization_catalogs")
    .update({ is_enabled: false })
    .eq("organization_id", parsed.data.targetOrgId);

  const { error: orgErr } = await supabase
    .from("organization_catalogs")
    .update({ is_enabled: true })
    .eq("id", parsed.data.orgCatalogId)
    .eq("organization_id", parsed.data.targetOrgId);

  if (orgErr) return { success: false, error: orgErr.message };

  // 2. Atualizar profile_catalogs (desativa todos do perfil, ativa o selecionado)
  await supabase
    .from("profile_catalogs")
    .update({ is_selected: false })
    .eq("profile_id", parsed.data.profileId);

  // Verifica se já existe um vínculo em profile_catalogs
  const { data: existingProfileCatalog } = await supabase
    .from("profile_catalogs")
    .select("id")
    .eq("profile_id", parsed.data.profileId)
    .eq("organization_catalog_id", parsed.data.orgCatalogId)
    .maybeSingle();

  if (existingProfileCatalog) {
    await supabase
      .from("profile_catalogs")
      .update({ is_selected: true })
      .eq("id", existingProfileCatalog.id);
  } else {
    await supabase
      .from("profile_catalogs")
      .insert({
        profile_id: parsed.data.profileId,
        organization_catalog_id: parsed.data.orgCatalogId,
        is_selected: true,
      });
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function createCatalog(name: string, description: string, isPlatform: boolean) {
  const parsed = createCatalogSchema.safeParse({ name, description, isPlatform });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autorizado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, organization_id, organizations(business_model)")
    .eq("user_id", user.id)
    .single();

  const org = Array.isArray(profile?.organizations) ? profile?.organizations[0] : profile?.organizations;
  
  if (parsed.data.isPlatform && org?.business_model !== "ALL_SERVICE") {
    throw new Error("Apenas contas ALL_SERVICE podem criar catálogos matriz (liberados para franqueados).");
  }

  const adminClient = createAdminClient();

  if (!profile || !profile.organization_id) {
    throw new Error("Perfil ou organização não encontrada.");
  }

  const { data: inserted, error } = await adminClient
    .from("catalogs")
    .insert({
      name: parsed.data.name,
      description: parsed.data.description,
      catalog_type: parsed.data.isPlatform ? "platform" : "custom",
      owner_id: user.id,
      owner_profile_id: user.id,
      organization_id: profile.organization_id
    })
    .select("id")
    .single();

  if (error) {
    console.error("createCatalog error:", error);
    throw new Error(`Erro ao criar catálogo: ${error.message}`);
  }

  // Mapear o catálogo recém-criado para a organização atual
  await adminClient.from("organization_catalogs").insert({
    organization_id: profile.organization_id,
    catalog_id: inserted.id,
    is_enabled: true
  });

  revalidatePath("/dashboard/catalogo/gerenciador");
  return { success: true, id: inserted.id };
}
