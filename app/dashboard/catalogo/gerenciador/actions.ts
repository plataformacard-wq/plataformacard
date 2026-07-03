"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function setActiveCatalog(
  targetOrgId: string, 
  profileId: string, 
  orgCatalogId: string
) {
  const supabase = createAdminClient();

  // 1. Atualizar organization_catalogs (desativa todos, ativa o selecionado)
  await supabase
    .from("organization_catalogs")
    .update({ is_enabled: false })
    .eq("organization_id", targetOrgId);

  const { error: orgErr } = await supabase
    .from("organization_catalogs")
    .update({ is_enabled: true })
    .eq("id", orgCatalogId)
    .eq("organization_id", targetOrgId);

  if (orgErr) return { success: false, error: orgErr.message };

  // 2. Atualizar profile_catalogs (desativa todos do perfil, ativa o selecionado)
  await supabase
    .from("profile_catalogs")
    .update({ is_selected: false })
    .eq("profile_id", profileId);

  // Verifica se já existe um vínculo em profile_catalogs
  const { data: existingProfileCatalog } = await supabase
    .from("profile_catalogs")
    .select("id")
    .eq("profile_id", profileId)
    .eq("organization_catalog_id", orgCatalogId)
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
        profile_id: profileId,
        organization_catalog_id: orgCatalogId,
        is_selected: true,
      });
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function createCatalog(name: string, description: string, isPlatform: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autorizado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, organization_id, organizations(business_model)")
    .eq("user_id", user.id)
    .single();

  const org = Array.isArray(profile?.organizations) ? profile?.organizations[0] : profile?.organizations;
  
  if (isPlatform && org?.business_model !== "ALL_SERVICE") {
    throw new Error("Apenas contas ALL_SERVICE podem criar catálogos matriz (liberados para franqueados).");
  }

  const adminClient = createAdminClient();

  if (!profile || !profile.organization_id) {
    throw new Error("Perfil ou organização não encontrada.");
  }

  const { data: inserted, error } = await adminClient
    .from("catalogs")
    .insert({
      name,
      description,
      catalog_type: isPlatform ? "platform" : "custom",
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
