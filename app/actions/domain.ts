"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { addDomainToVercel, removeDomainFromVercel, checkDomainStatus, VercelDomainResponse } from "@/lib/vercel/domains";
import { revalidatePath } from "next/cache";

export async function getOrganizationDomain() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Usuário não autenticado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("user_id", user.id)
    .single();

  if (!profile?.organization_id) throw new Error("Organização não encontrada");

  const { data: org } = await supabase
    .from("organizations")
    .select("custom_domain")
    .eq("id", profile.organization_id)
    .single();

  return org?.custom_domain || null;
}

export async function checkVercelDomainStatus(domain: string): Promise<VercelDomainResponse | null> {
  try {
    return await checkDomainStatus(domain);
  } catch (error) {
    console.error("Erro ao checar status do domínio", error);
    return null;
  }
}

export async function addCustomDomain(domain: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Usuário não autenticado");

  // Format domain (remove http, www, trailing slashes)
  let cleanDomain = domain.toLowerCase().trim();
  cleanDomain = cleanDomain.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/$/, "");

  // Blacklist de domínios sensíveis do sistema
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
    .select("organization_id")
    .eq("user_id", user.id)
    .single();

  if (!profile?.organization_id) return { error: "Organização não encontrada" };

  try {
    // 1. Tentar adicionar na Vercel
    await addDomainToVercel(cleanDomain);

    // Usar Admin Client para evitar falhas silenciosas de RLS
    const adminSupabase = createAdminClient();

    // 2. Salvar no Supabase
    const { data: updatedOrg, error: dbError } = await adminSupabase
      .from("organizations")
      .update({ custom_domain: cleanDomain })
      .eq("id", profile.organization_id)
      .select()
      .single();

    if (dbError || !updatedOrg) {
      // Rollback na Vercel se falhar no DB
      await removeDomainFromVercel(cleanDomain);
      return { error: "Erro ao salvar domínio no banco de dados. " + (dbError?.message || "Erro desconhecido") };
    }

    revalidatePath("/dashboard/empresa/dominio");
    return { success: true, domain: cleanDomain };
  } catch (err: any) {
    return { error: err.message || "Ocorreu um erro ao vincular o domínio." };
  }
}

export async function removeCustomDomain(domain: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Usuário não autenticado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("user_id", user.id)
    .single();

  if (!profile?.organization_id) return { error: "Organização não encontrada" };

  try {
    // 1. Remover da Vercel
    await removeDomainFromVercel(domain);

    const adminSupabase = createAdminClient();

    // 2. Remover do Supabase
    const { error: dbError } = await adminSupabase
      .from("organizations")
      .update({ custom_domain: null })
      .eq("id", profile.organization_id);

    if (dbError) throw new Error(dbError.message);

    revalidatePath("/dashboard/empresa/dominio");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Ocorreu um erro ao desvincular o domínio." };
  }
}
