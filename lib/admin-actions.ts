"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateInviteCode(newCode: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("platform_config")
    .upsert({ 
      key: "beta_invite_code", 
      value: newCode.trim().toUpperCase(),
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error("Erro ao atualizar código de convite:", error);
    return { error: "Falha ao salvar o novo código." };
  }

  revalidatePath("/admin");
  revalidatePath("/cadastro");
  
  return { success: true };
}

export async function getInviteCode() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("platform_config")
    .select("value")
    .eq("key", "beta_invite_code")
    .single();

  return data?.value || "MAJ2024";
}
