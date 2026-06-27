"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { addDomainToVercel, removeDomainFromVercel, checkDomainStatus, VercelDomainResponse } from "@/lib/vercel/domains";
import { revalidatePath } from "next/cache";

export async function getProfileDomain() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Usuário não autenticado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile?.id) throw new Error("Perfil não encontrado");

  // Busca o domínio na tabela custom_domains do B2C
  const { data: customDomain } = await supabase
    .from("custom_domains")
    .select("domain")
    .eq("profile_id", profile.id)
    .neq("status", "disabled")
    .single();

  return customDomain?.domain || null;
}

export async function checkVercelDomainStatus(domain: string): Promise<VercelDomainResponse | null> {
  try {
    return await checkDomainStatus(domain);
  } catch (error) {
    console.error("Erro ao checar status do domínio", error);
    return null;
  }
}

export async function addProfileCustomDomain(domain: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Usuário não autenticado");

  let cleanDomain = domain.toLowerCase().trim();
  cleanDomain = cleanDomain.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/$/, "");

  const blacklistedDomains = [
    "anotameucontato.com.br",
    "plataformashop.com.br",
    "vercel.app"
  ];

  if (blacklistedDomains.some(b => cleanDomain === b || cleanDomain.endsWith(`.${b}`))) {
    return { error: "Este domínio é reservado pelo sistema e não pode ser utilizado." };
  }

  if (!cleanDomain || cleanDomain.length < 5 || !cleanDomain.includes(".")) {
    return { error: "Domínio inválido. Use um formato como seudominio.com.br" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile?.id) return { error: "Perfil não encontrado" };

  try {
    // 1. Tentar adicionar na Vercel
    await addDomainToVercel(cleanDomain);

    const adminSupabase = createAdminClient();

    // 2. Desativar domínios anteriores do perfil (para garantir a constraint one_active_per_profile)
    await adminSupabase
      .from("custom_domains")
      .update({ status: "disabled" })
      .eq("profile_id", profile.id);

    // 3. Salvar o novo domínio no Supabase
    const { data: newCustomDomain, error: dbError } = await adminSupabase
      .from("custom_domains")
      .insert({
        profile_id: profile.id,
        domain: cleanDomain,
        status: "pending"
      })
      .select()
      .single();

    if (dbError || !newCustomDomain) {
      await removeDomainFromVercel(cleanDomain);
      return { error: "Erro ao salvar domínio no banco de dados. " + (dbError?.message || "Erro desconhecido") };
    }

    revalidatePath("/dashboard/perfil/dominio");
    return { success: true, domain: cleanDomain };
  } catch (err: any) {
    return { error: err.message || "Ocorreu um erro ao vincular o domínio." };
  }
}

export async function removeProfileCustomDomain(domain: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Usuário não autenticado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile?.id) return { error: "Perfil não encontrado" };

  try {
    // 1. Remover da Vercel
    await removeDomainFromVercel(domain);

    const adminSupabase = createAdminClient();

    // 2. Remover ou desativar do Supabase
    const { error: dbError } = await adminSupabase
      .from("custom_domains")
      .update({ status: "disabled" })
      .eq("profile_id", profile.id)
      .eq("domain", domain);

    if (dbError) throw new Error(dbError.message);

    revalidatePath("/dashboard/perfil/dominio");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Ocorreu um erro ao desvincular o domínio." };
  }
}
