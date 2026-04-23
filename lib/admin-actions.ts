"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateSystemConfig(key: string, value: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("platform_config")
    .upsert({ 
      key, 
      value,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error(`Erro ao atualizar config [${key}]:`, error);
    return { error: `Falha ao salvar config ${key}.` };
  }

  // Se mudar o aviso, geramos um novo ID de versão para forçar a exibição para todos
  if (key === "system_notice_text") {
    await supabase.from("platform_config").upsert({
      key: "system_notice_id",
      value: Date.now().toString(),
      updated_at: new Date().toISOString()
    });
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/cadastro");
  
  return { success: true };
}

export async function updateInviteCode(newCode: string) {
  return updateSystemConfig("beta_invite_code", newCode.trim().toUpperCase());
}

export async function getInviteCode() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("platform_config")
    .select("value")
    .eq("key", "beta_invite_code")
    .maybeSingle();

  return data?.value || "MAJ2024";
}

export async function getFullPlatformConfig() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("platform_config").select("key, value");
  
  const config: Record<string, string> = {};
  data?.forEach(row => {
    config[row.key] = row.value;
  });
  
  return config;
}
