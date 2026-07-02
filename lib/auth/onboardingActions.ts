"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function completeOnboarding(payload: {
  fullName: string;
  slug: string;
  whatsapp: string;
  bio: string;
  avatarUrl: string;
  businessModel: "B2B" | "B2C" | "CaaS";
  masterCatalogId?: string;
}) {
  const { fullName, slug, whatsapp, bio, avatarUrl, businessModel, masterCatalogId } = payload;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada. Entre novamente." };
  }

  const trimmedName = fullName.trim();
  const trimmedSlug = slug.trim();
  const trimmedWhatsapp = whatsapp.trim();
  const trimmedBio = bio.trim();

  // Vamos utilizar o cliente Admin (Service Role) para evitar erros de RLS
  const adminClient = createAdminClient();

  try {
    // 1. Validar se o usuário já não possui uma organização
    const { data: existingProfile } = await adminClient
      .from("profiles")
      .select("organization_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingProfile?.organization_id) {
      return { error: "O onboarding já foi concluído para esta conta." };
    }

    // 2. Verificar duplicidade de slug na organização e no perfil
    const { data: existingOrg } = await adminClient
      .from("organizations")
      .select("id")
      .eq("slug", trimmedSlug)
      .maybeSingle();
      
    if (existingOrg) {
      return { error: "Este slug (link) já está em uso. Escolha outro." };
    }

    const { data: existingProfileSlug } = await adminClient
      .from("profiles")
      .select("id")
      .eq("slug", trimmedSlug)
      .maybeSingle();

    if (existingProfileSlug && existingProfileSlug.id !== user.id) {
      return { error: "Este slug (link) já está em uso por outro perfil." };
    }

    // 3. Criar Organização
    const orgName = businessModel === "B2B" ? `Empresa de ${trimmedName}` : trimmedName;
    
    const { data: newOrg, error: orgError } = await adminClient
      .from("organizations")
      .insert({
        name: orgName,
        slug: trimmedSlug,
        business_model: businessModel,
        plan_id: "32c7b8a2-2bf7-43dd-b1a6-5706566fbfd0" // Starter
      })
      .select("id")
      .single();

    if (orgError || !newOrg) {
      console.error("Erro ao criar organization:", orgError);
      return { error: "Erro ao estruturar a organização." };
    }

    const orgId = newOrg.id;

    // 4. Atualizar Perfil
    const roleMap: Record<string, string> = {
      B2B: "b2b_admin",
      B2C: "b2c_admin",
      CaaS: "caas_admin",
    };

    const { error: profileError } = await adminClient
      .from("profiles")
      .update({
        full_name: trimmedName || null,
        slug: trimmedSlug,
        whatsapp: trimmedWhatsapp,
        bio: trimmedBio || null,
        avatar_url: avatarUrl || null,
        organization_id: orgId,
        role: roleMap[businessModel] || "admin",
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString()
      })
      .eq("user_id", user.id);

    if (profileError) {
      console.error("Erro ao atualizar profile:", profileError);
      return { error: "Erro ao salvar os dados do perfil." };
    }

    // 5. Criar Catálogo Primário
    const catalogTypeMap: Record<string, string> = {
      B2B: "catalog",
      B2C: "catalog", // B2C and B2B usually share the same primary type unless CaaS
      CaaS: "CaaS"
    };

    const { data: newCatalog, error: catError } = await adminClient
      .from("catalogs")
      .insert({
        name: businessModel === "CaaS" ? "Vitrine Digital" : "Meu Catálogo",
        description: "Catálogo principal de produtos",
        owner_id: user.id,
        catalog_type: catalogTypeMap[businessModel] || "catalog"
      })
      .select("id")
      .single();

    if (catError || !newCatalog) {
      console.error("Erro ao criar catálogo:", catError);
      return { error: "Erro ao gerar o catálogo base." };
    }

    const catId = newCatalog.id;

    // 6. Vincular Catálogo à Organização
    const { error: orgCatError } = await adminClient
      .from("organization_catalogs")
      .insert({
        organization_id: orgId,
        catalog_id: catId,
        is_enabled: true
      })
      .select("id")
      .single();

    if (orgCatError) {
      console.error("Erro ao vincular organização/catálogo:", orgCatError);
      return { error: "Erro ao configurar acessos do catálogo." };
    }

    // Se houver um masterCatalogId (Convite de Franquia ALL_SERVICE), vincula o catálogo mestre
    if (masterCatalogId) {
      const { error: franchiseCatError } = await adminClient
        .from("organization_catalogs")
        .insert({
          organization_id: orgId,
          catalog_id: masterCatalogId,
          is_enabled: true
        });

      if (franchiseCatError) {
        console.error("Erro ao vincular catálogo de franquia:", franchiseCatError);
        // Não é bloqueante, mas devemos logar.
      }
    }

    // Para profile_catalogs precisamos do organization_catalog_id
    // Buscando o ID recém inserido
    const { data: orgCat } = await adminClient
      .from("organization_catalogs")
      .select("id")
      .eq("organization_id", orgId)
      .eq("catalog_id", catId)
      .single();

    // 7. Vincular Catálogo ao Perfil do Vendedor (Para as páginas de /p/[slug])
    if (orgCat?.id) {
      const { error: profCatError } = await adminClient
        .from("profile_catalogs")
        .insert({
          profile_id: user.id,
          organization_catalog_id: orgCat.id,
          is_selected: true
        });

      if (profCatError) {
        console.error("Erro ao vincular perfil/catálogo:", profCatError);
        // Não retornar erro bloqueante se isso falhar, pois o fluxo base funcionou.
        // Mas a auditoria pede justamente para garantir isso!
        return { error: "Falha final ao vincular seu catálogo." };
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error("Exception no onboarding:", err);
    return { error: "Erro inesperado ao finalizar o cadastro." };
  }
}
