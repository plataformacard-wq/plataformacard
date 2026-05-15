"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function activateCatalog(formData: FormData) {
  const organizationId = formData.get("organizationId") as string;
  const catalogId = formData.get("catalogId") as string;

  const supabase = await createClient();

  const { error } = await supabase
    .from("organization_catalogs")
    .insert({
      organization_id: organizationId,
      catalog_id: catalogId,
    });

  if (error) {
    console.error("activateCatalog error:", error);
    throw new Error(`Erro ao ativar catálogo: ${error.message}`);
  }

  revalidatePath("/admin/catalogos");
}

export async function deactivateCatalog(formData: FormData) {
  const organizationId = formData.get("organizationId") as string;
  const catalogId = formData.get("catalogId") as string;

  const supabase = await createClient();

  const { error } = await supabase
    .from("organization_catalogs")
    .delete()
    .match({
      organization_id: organizationId,
      catalog_id: catalogId,
    });

  if (error) {
    throw new Error("Erro ao desativar catálogo");
  }

  revalidatePath("/admin/catalogos");
}