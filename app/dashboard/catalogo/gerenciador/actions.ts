"use server";

import { createAdminClient } from "@/lib/supabase/admin";
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
