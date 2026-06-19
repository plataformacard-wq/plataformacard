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

  revalidatePath("/main/catalogos");
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

  revalidatePath("/main/catalogos");
}

export async function createCatalog(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) throw new Error("Nome é obrigatório");

  const supabase = await createClient();

  const { error } = await supabase
    .from("catalogs")
    .insert({
      name,
      description,
      catalog_type: "platform"
    });

  if (error) {
    console.error("createCatalog error:", error);
    throw new Error(`Erro ao criar catálogo: ${error.message}`);
  }

  revalidatePath("/main/catalogos");
}