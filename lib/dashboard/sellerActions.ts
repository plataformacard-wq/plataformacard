"use server";
 
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { verifyOrgAdmin } from "@/lib/utils/auth-validation";

export async function uploadStorageFile(formData: FormData) {
  const file = formData.get("file") as File;
  const bucket = formData.get("bucket") as string;
  const path = formData.get("path") as string;

  if (!file || !bucket || !path) {
    return { error: "Parâmetros inválidos para upload." };
  }

  const supabaseServer = await createClient();
  const { data: { user } } = await supabaseServer.auth.getUser();

  if (!user) {
    return { error: "Não autenticado" };
  }

  const adminClient = createAdminClient();
  
  const { error } = await adminClient.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) {
    return { error: error.message };
  }

  const { data: { publicUrl } } = adminClient.storage
    .from(bucket)
    .getPublicUrl(path);

  return { success: true, publicUrl };
}

export async function updateCatalogConfig(catalogId: string, payload: any, orgId?: string, orgPayload?: any) {
  const supabaseServer = await createClient();
  const { data: { user } } = await supabaseServer.auth.getUser();

  if (!user) {
    return { error: "Não autenticado" };
  }

  const adminClient = createAdminClient();
  
  const { error: catError } = await adminClient
    .from("catalogs")
    .update(payload)
    .eq("id", catalogId);

  if (catError) {
    return { error: catError.message };
  }

  if (orgId && orgPayload) {
    const { error: orgError } = await adminClient
      .from("organizations")
      .update(orgPayload)
      .eq("id", orgId);
      
    if (orgError) {
      return { error: orgError.message };
    }
    
    // Se o admin for CaaS, replicar as configurações de visualização para o catálogo platform!
    const { data: org } = await adminClient.from("organizations").select("business_model").eq("id", orgId).single();
    if (org?.business_model === "CaaS") {
      await adminClient.from("catalogs").update({
        out_of_stock_at_end: payload.out_of_stock_at_end,
        hide_prices: payload.hide_prices,
        banner_speed_seconds: payload.banner_speed_seconds,
        banner_initial_index: payload.banner_initial_index,
        show_banners: payload.show_banners
      }).eq("organization_id", orgId).eq("catalog_type", "platform");
    }
  }

  return { success: true };
}

export async function createSeller(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const slug = formData.get("slug") as string;
  const bio = formData.get("bio") as string;
  const whatsapp = formData.get("whatsapp") as string;
  const avatarUrl = formData.get("avatarUrl") as string;
  const dashAccessCatalog = formData.get("dashAccessCatalog") === "true";
  const dashAccessAnalytics = formData.get("dashAccessAnalytics") === "true";
  const dashAccessCompany = formData.get("dashAccessCompany") === "true";
  const whatsappTemplate = formData.get("whatsappTemplate") as string;
  const redirectLeads = formData.get("redirectLeads") === "true";
  const hidePrices = formData.get("hidePrices") === "true";

  if (!fullName || !slug) {
    return { error: "Nome e slug são obrigatórios." };
  }

  const supabaseServer = await createClient();
  const { data: { user: adminUser } } = await supabaseServer.auth.getUser();

  if (!adminUser) {
    return { error: "Usuário não autenticado." };
  }

  const { data: profileManager } = await supabaseServer
    .from("profiles")
    .select("organization_id, role")
    .eq("user_id", adminUser.id)
    .single();

  if (!profileManager?.organization_id) {
    return { error: "Organização não encontrada." };
  }

  const allowedRoles = ["b2b_admin", "main_admin", "admin"];
  if (!allowedRoles.includes(profileManager.role)) {
    return { error: "Permissão negada." };
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const shadowOrgId = cookieStore.get("shadow_org_id")?.value;

  const activeOrgId = (profileManager.role === "main_admin" && shadowOrgId)
    ? shadowOrgId
    : profileManager.organization_id;

  const adminAuthClient = createAdminClient();

  // Verifica se o slug já existe
  const { data: existingSlug } = await adminAuthClient
    .from("profiles")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existingSlug) {
    return { error: "Este slug (link) já está em uso." };
  }

  // Início da gravação de vendedor

  try {
    // ESTRATÉGIA: Criar uma conta técnica invisível para satisfazer o banco de dados
    const virtualEmail = `vendedor_${slug}_${activeOrgId.split("-")[0]}@interno.plataforma.card`;
    const randomPassword = crypto.randomUUID();

    const { data: authData, error: authError } = await adminAuthClient.auth.admin.createUser({
      email: virtualEmail,
      password: randomPassword,
      email_confirm: true,
    });

    let targetUserId = "";

    if (authError) {
      if (authError.message.includes("already been registered")) {
        const { data: users } = await adminAuthClient.auth.admin.listUsers();
        const existing = users.users.find(u => u.email === virtualEmail);
        if (!existing) return { error: "Erro crítico: Usuário existe mas não foi encontrado." };
        targetUserId = existing.id;
      } else {
        return { error: `Erro Auth: ${authError.message}` };
      }
    } else {
      targetUserId = authData.user.id;
    }

    console.log("🔑 User ID para Perfil:", targetUserId);

    const profilePayload = {
      id: targetUserId,
      user_id: targetUserId,
      full_name: fullName,
      slug: slug,
      bio: bio,
      whatsapp: whatsapp,
      avatar_url: avatarUrl,
      organization_id: activeOrgId,
      role: "seller",
      dash_access_catalog: dashAccessCatalog,
      dash_access_analytics: dashAccessAnalytics,
      dash_access_company: dashAccessCompany,
      whatsapp_template: whatsappTemplate,
      redirect_leads: redirectLeads,
      hide_prices: hidePrices
    };

    const { error: insertError } = await adminAuthClient
      .from("profiles")
      .insert(profilePayload);

    if (insertError) {
      if (insertError.code === '23505') {
        // Se já existe (trigger criou), forçamos a atualização dos dados
        const { error: updateError } = await adminAuthClient
          .from("profiles")
          .update(profilePayload)
          .eq("id", targetUserId);
        
        if (updateError) return { error: `Erro na atualização: ${updateError.message}` };
      } else {
        return { error: `Erro no banco: ${insertError.message}` };
      }
    }

    return { success: true, id: targetUserId };

  } catch (e: any) {
    console.error("🔥 CRASH NA ACTION:", e);
    return { error: `Erro Interno: ${e.message}` };
  }
}

export async function updateSeller(sellerId: string, profileData: any) {
  try {
    const supabaseServer = await createClient();
    const { data: { user: adminUser } } = await supabaseServer.auth.getUser();
    if (!adminUser) return { error: "Não autenticado" };
 
    const adminAuthClient = createAdminClient();
 
    // 1. Busca perfil do vendedor para identificar sua organização
    const { data: sellerProfile, error: profileErr } = await adminAuthClient
      .from("profiles")
      .select("organization_id, role")
      .eq("id", sellerId)
      .maybeSingle();
 
    if (profileErr || !sellerProfile) {
      return { error: "Vendedor não encontrado." };
    }
 
    // 2. Valida se o usuário tem privilégios na organização do vendedor
    await verifyOrgAdmin(sellerProfile.organization_id);
 
    // 3. Sanitização: Apenas Super Admin pode alterar a organização ou promover para main_admin
    const { data: callerProfile } = await adminAuthClient
      .from("profiles")
      .select("role")
      .eq("id", adminUser.id)
      .maybeSingle();
 
    const isSuperAdmin = callerProfile?.role === "main_admin" || callerProfile?.role === "main_admin";
    if (!isSuperAdmin) {
      delete profileData.organization_id;
      if (profileData.role && (profileData.role === "main_admin" || profileData.role === "main_admin")) {
        delete profileData.role;
      }
    }
    
    const { error } = await adminAuthClient
      .from("profiles")
      .update(profileData)
      .eq("id", sellerId);
 
    if (error) return { error: error.message };
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}
 
export async function toggleSellerStatus(sellerId: string, isAvailable: boolean) {
  try {
    const supabaseServer = await createClient();
    const { data: { user: adminUser } } = await supabaseServer.auth.getUser();
    if (!adminUser) return { error: "Não autenticado" };
 
    const adminAuthClient = createAdminClient();
 
    // 1. Busca perfil do vendedor
    const { data: sellerProfile, error: profileErr } = await adminAuthClient
      .from("profiles")
      .select("organization_id")
      .eq("id", sellerId)
      .maybeSingle();
 
    if (profileErr || !sellerProfile) {
      return { error: "Vendedor não encontrado." };
    }
 
    // 2. Se não for o próprio vendedor, exige permissão de admin na organização dele
    if (adminUser.id !== sellerId) {
      await verifyOrgAdmin(sellerProfile.organization_id);
    }
 
    const { error } = await adminAuthClient
      .from("profiles")
      .update({ 
        is_available: isAvailable,
        status: isAvailable ? 'active' : 'paused'
      })
      .eq("id", sellerId);
 
    if (error) return { error: error.message };
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function getSellers() {
  const supabaseServer = await createClient();
  const { data: { user: adminUser } } = await supabaseServer.auth.getUser();

  if (!adminUser) return { error: "Não autenticado" };

  const adminAuthClient = createAdminClient();

  const { data: profileManager } = await adminAuthClient
    .from("profiles")
    .select("organization_id, role")
    .eq("user_id", adminUser.id)
    .single();

  // Debug Sellers removed for production

  if (!profileManager?.organization_id) return { sellers: [] };

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const shadowOrgId = cookieStore.get("shadow_org_id")?.value;

  const activeOrgId = (profileManager.role === "main_admin" && shadowOrgId)
    ? shadowOrgId
    : profileManager.organization_id;

  const { data: sellers } = await adminAuthClient
    .from("profiles")
    .select("*")
    .eq("organization_id", activeOrgId)
    .order("full_name");

  // DIAGNÓSTICO: Buscar os 3 últimos criados no sistema GERAL
  const { data: globalLast } = await adminAuthClient
    .from("profiles")
    .select("full_name, organization_id, slug")
    .order("created_at", { ascending: false })
    .limit(3);

  return { 
    sellers: sellers || [], 
    debug: { 
      managerOrg: activeOrgId,
      globalRecent: globalLast 
    } 
  };
}

export async function deleteSeller(userId: string) {
  const supabaseServer = await createClient();
  const { data: { user } } = await supabaseServer.auth.getUser();

  if (!user) {
    return { error: "Usuário não autenticado." };
  }

  const { data: profileManager } = await supabaseServer
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  const allowedRoles = ["b2b_admin", "main_admin", "admin"];
  if (!allowedRoles.includes(profileManager?.role)) {
    return { error: "Permissão negada." };
  }

  if (user.id === userId) {
    return { error: "Você não pode excluir sua própria conta." };
  }

  const adminAuthClient = createAdminClient();
  const { error } = await adminAuthClient.auth.admin.deleteUser(userId);

  if (error) {
    console.error("Erro ao excluir usuário:", error);
    return { error: error.message };
  }

  return { success: true };
}

export async function terminateSeller(sellerId: string) {
  const supabaseServer = await createClient();
  const { data: { user: adminUser } } = await supabaseServer.auth.getUser();

  if (!adminUser) return { error: "Não autenticado" };

  const adminAuthClient = createAdminClient();

  const { data: profileManager } = await adminAuthClient
    .from("profiles")
    .select("role")
    .eq("user_id", adminUser.id)
    .single();

  const allowedRoles = ["b2b_admin", "main_admin", "admin"];
  if (!allowedRoles.includes(profileManager?.role)) {
    return { error: "Permissão negada." };
  }

  // Remove PII data but keep the slug and organization to route to the Bridge Page
  const { error } = await adminAuthClient
    .from("profiles")
    .update({ 
      status: 'terminated',
      is_available: false,
      full_name: 'Consultor Desligado',
      avatar_url: null,
      whatsapp: null,
      bio: null
    })
    .eq("id", sellerId);

  if (error) return { error: error.message };
  return { success: true };
}


export async function updateSellerPassword(userId: string, newPassword: string) {
  const supabaseServer = await createClient();
  const { data: { user } } = await supabaseServer.auth.getUser();

  if (!user) {
    return { error: "Usuário não autenticado." };
  }

  const { data: profileManager } = await supabaseServer
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  const allowedRoles = ["b2b_admin", "main_admin", "admin"];
  if (!allowedRoles.includes(profileManager?.role)) {
    return { error: "Permissão negada." };
  }

  if (!newPassword || newPassword.length < 6) {
    return { error: "A nova senha deve ter pelo menos 6 caracteres." };
  }

  const adminAuthClient = createAdminClient();
  const { error } = await adminAuthClient.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) {
    console.error("Erro ao atualizar senha:", error);
    return { error: error.message };
  }

  return { success: true };
}

export async function updateSellerPermissions(userId: string, canCustomizeHours: boolean) {
  const supabaseServer = await createClient();
  const { data: { user } } = await supabaseServer.auth.getUser();

  if (!user) {
    return { error: "Usuário não autenticado." };
  }

  const { data: profileManager } = await supabaseServer
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  const allowedRoles = ["b2b_admin", "main_admin", "admin"];
  if (!allowedRoles.includes(profileManager?.role)) {
    return { error: "Permissão negada." };
  }

  const adminAuthClient = createAdminClient();
  const { error } = await adminAuthClient
    .from("profiles")
    .update({ can_customize_hours: canCustomizeHours })
    .eq("user_id", userId);

  if (error) {
    console.error("Erro ao atualizar permissões:", error);
    return { error: "Erro ao atualizar permissões do vendedor." };
  }

  return { success: true };
}

export async function getOrCreateCatalog(orgId: string) {
  let userId: string;
  try {
    userId = await verifyOrgAdmin(orgId);
  } catch (err: any) {
    return { error: err.message || "Não autorizado." };
  }
 
  const adminClient = createAdminClient();
 
  // 1. Tenta pegar todos os catálogos vinculados à organização
  const { data: linkedCatalogs, error: orgCatalogError } = await adminClient
    .from("organization_catalogs")
    .select(`
      id,
      catalog_id,
      catalogs(id, catalog_type, owner_id)
    `)
    .eq("organization_id", orgId);
 
  if (orgCatalogError) {
    console.error("getOrCreateCatalog fetch linked error:", orgCatalogError);
  }
 
  // Busca qual catálogo o usuário selecionou ativamente (em profile_catalogs)
  const { data: profileCat } = await adminClient
    .from("profile_catalogs")
    .select("organization_catalog_id")
    .eq("profile_id", userId)
    .eq("is_selected", true)
    .maybeSingle();

  let ownCatalogLink;

  if (profileCat) {
    ownCatalogLink = linkedCatalogs?.find(link => link.id === profileCat.organization_catalog_id);
  }

  // Se não tem um catálogo ativo ou não encontrou, procura um que o usuário seja o dono.
  if (!ownCatalogLink) {
    ownCatalogLink = linkedCatalogs?.find(link => {
      const cat = link.catalogs ? (Array.isArray(link.catalogs) ? link.catalogs[0] : link.catalogs) : null;
      return cat && cat.owner_id === userId;
    });
  }

  // Fallback: se ainda assim não encontrou (ex: franqueado), busca o não-CaaS
  if (!ownCatalogLink) {
    ownCatalogLink = linkedCatalogs?.find(link => {
      const cat = link.catalogs ? (Array.isArray(link.catalogs) ? link.catalogs[0] : link.catalogs) : null;
      return cat && cat.catalog_type !== 'CaaS' && cat.catalog_type !== 'platform';
    });
  }
 
  let catId = ownCatalogLink?.catalog_id;
 
  // 2. Se não existe, cria um catálogo padrão
  if (!catId) {
    console.log("Criando catálogo automático via Server Action...");
 
    // Criar o catálogo
    const { data: newCatalog, error: catError } = await adminClient
      .from("catalogs")
      .insert({
        name: "Meu Catálogo",
        description: "Catálogo principal de produtos",
        owner_id: userId
      })
      .select()
      .single();

    if (catError || !newCatalog) {
      console.error("Erro ao criar catálogo no admin:", catError);
      return { error: `Erro ao criar catálogo: ${catError?.message || "Catálogo não criado"}` };
    }

    // Vincular à organização
    const { data: orgCatLink, error: linkError } = await adminClient
      .from("organization_catalogs")
      .insert({
        organization_id: orgId,
        catalog_id: newCatalog.id,
        is_enabled: true
      })
      .select("id")
      .single();

    if (linkError || !orgCatLink) {
      console.error("Erro ao vincular catálogo no admin:", linkError);
      return { error: `Erro ao vincular catálogo: ${linkError?.message || "Erro desconhecido"}` };
    }

    // Criar profile_catalogs fallback
    await adminClient.from("profile_catalogs").insert({
      profile_id: userId,
      organization_catalog_id: orgCatLink.id,
      is_selected: true
    });

    catId = newCatalog.id;
  }

  // 3. Busca e retorna o catálogo completo
  const { data: catalogData, error: catalogFetchError } = await adminClient
    .from("catalogs")
    .select("id, name, description, catalog_type, type, whatsapp_template")
    .eq("id", catId)
    .single();

  if (catalogFetchError || !catalogData) {
    console.error("Erro ao buscar catálogo completo:", catalogFetchError);
    return { error: `Erro ao buscar catálogo: ${catalogFetchError?.message || "Não encontrado"}` };
  }

  // Fallback extra: se o catálogo já existia, mas o profile_catalogs não (por conta do bug antigo), 
  // tentamos garantir que ele exista silenciosamente
  if (ownCatalogLink?.catalog_id) {
    const { data: profCat } = await adminClient
      .from("profile_catalogs")
      .select("id")
      .eq("profile_id", userId)
      .limit(1)
      .maybeSingle();
      
    if (!profCat) {
      // Pega o organization_catalog id
      const { data: orgCat } = await adminClient
        .from("organization_catalogs")
        .select("id")
        .eq("organization_id", orgId)
        .eq("catalog_id", catId)
        .limit(1)
        .maybeSingle();
        
      if (orgCat) {
        await adminClient.from("profile_catalogs").insert({
          profile_id: userId,
          organization_catalog_id: orgCat.id,
          is_selected: true
        });
      }
    }
  }

  return { success: true, catalog: catalogData };
}

export async function updateOrganizationSEO(orgId: string, payload: {
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  favicon_url: string;
  logo_url: string;
  og_image_url: string;
  centralize_leads?: boolean;
  whatsapp?: string;
}) {
  try {
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user) {
      return { error: "Não autenticado" };
    }

    const { data: profile } = await supabaseServer
      .from("profiles")
      .select("organization_id, role")
      .eq("user_id", user.id)
      .single();

    const isSuperAdmin = profile?.role === "main_admin" || profile?.role === "main_admin";
    if (profile?.organization_id !== orgId && !isSuperAdmin) {
      return { error: "Sem permissão para atualizar esta organização." };
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from("organizations")
      .update(payload)
      .eq("id", orgId);

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}


export async function uploadAvatarAction(sellerId: string, formData: FormData) {
  try {
    const supabaseServer = await createClient();
    const { data: { user: adminUser } } = await supabaseServer.auth.getUser();
    if (!adminUser) return { error: "Não autenticado" };

    const file = formData.get("file") as File;
    if (!file) return { error: "Arquivo não enviado" };

    const adminAuthClient = createAdminClient();
    const fileExt = file.name.split(".").pop();
    const filePath = `${sellerId}/avatar-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await adminAuthClient.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      return { error: uploadError.message };
    }

    const { data: urlData } = adminAuthClient.storage.from("avatars").getPublicUrl(filePath);
    return { url: urlData.publicUrl };
  } catch (e: any) {
    return { error: e.message };
  }
}
