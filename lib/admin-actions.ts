"use server";
 
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { verifySuperAdmin } from "@/lib/utils/auth-validation";
 
export async function updateSystemConfig(key: string, value: string) {
  await verifySuperAdmin();
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
 
  revalidatePath("/main");
  revalidatePath("/dashboard");
  revalidatePath("/cadastro");
  
  return { success: true };
}
 
export async function updateInviteCode(newCode: string) {
  await verifySuperAdmin();
  return updateSystemConfig("beta_invite_code", newCode.trim().toUpperCase());
}
 
export async function getInviteCode() {
  await verifySuperAdmin();
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("platform_config")
    .select("value")
    .eq("key", "beta_invite_code")
    .maybeSingle();
 
  return data?.value || "MAJ2024";
}
 
export async function getFullPlatformConfig() {
  await verifySuperAdmin();
  const supabase = createAdminClient();
  const { data } = await supabase.from("platform_config").select("key, value");
  
  const config: Record<string, string> = {};
  data?.forEach(row => {
    config[row.key] = row.value;
  });
  
  return config;
}

export async function updateGlobalBranding(branding: {
  global_primary_color_light?: string;
  global_primary_color_dark?: string;
  global_sidebar_color_light?: string;
  global_sidebar_color_dark?: string;
  global_logo_url?: string;
  global_icon_url?: string;
}) {
  await verifySuperAdmin();
  const supabase = createAdminClient();

  const updates = [];
  for (const [key, value] of Object.entries(branding)) {
    if (value !== undefined) {
      updates.push({
        key,
        value,
        updated_at: new Date().toISOString()
      });
    }
  }

  if (updates.length > 0) {
    const { error } = await supabase
      .from("platform_config")
      .upsert(updates);

    if (error) {
      console.error("Error updating global branding:", error);
      return { success: false, error: error.message };
    }
  }

  revalidatePath("/"); // Revalidate the whole app to pick up changes
  return { success: true };
}
 
export async function updateOrganizationPlan(orgId: string, planId: string) {
  await verifySuperAdmin();
  const supabase = createAdminClient();
 
  const { error } = await supabase
    .from("organizations")
    .update({ plan_id: planId })
    .eq("id", orgId);
 
  if (error) {
    console.error("Erro ao atualizar plano da org:", error);
    return { error: "Falha ao atualizar o plano." };
  }
 
  revalidatePath("/main/clientes");
  return { success: true };
}
 
export async function updateOrganizationModel(orgId: string, model: 'B2B' | 'B2C' | 'CaaS' | 'ALL_SERVICE') {
  await verifySuperAdmin();
  const supabase = createAdminClient();
  
  try {
    const { error } = await supabase
      .from('organizations')
      .update({ business_model: model })
      .eq('id', orgId);
 
    if (error) throw error;
 
    // Também atualizamos o role de todos os admins dessa org para manter sincronia
    const newRole = model === 'B2B' ? 'b2b_admin' : model === 'CaaS' ? 'caas_admin' : 'b2c_admin';
    await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('organization_id', orgId)
      .in('role', ['b2b_admin', 'b2c_admin', 'caas_admin', 'admin']);
 
    // revalidatePath("/main"); // Removido para evitar race condition no modal
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao atualizar modelo de negócio:", error);
    return { success: false, error: error.message };
  }
}

export async function suspendOrganization(orgId: string) {
  await verifySuperAdmin();
  const supabase = createAdminClient();
  
  await supabase.from('profiles').update({ status: 'suspended' }).eq('organization_id', orgId);
  const { error } = await supabase.from('organizations').update({ status: 'suspended' }).eq('id', orgId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deactivateOrganization(orgId: string) {
  await verifySuperAdmin();
  const supabase = createAdminClient();
  
  await supabase.from('profiles').update({ status: 'deactivated' }).eq('organization_id', orgId);
  const { error } = await supabase.from('organizations').update({ status: 'deactivated' }).eq('id', orgId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function reactivateOrganization(orgId: string) {
  await verifySuperAdmin();
  const supabase = createAdminClient();
  
  await supabase.from('profiles').update({ status: 'active' }).eq('organization_id', orgId);
  const { error } = await supabase.from('organizations').update({ status: 'active', deleted_at: null }).eq('id', orgId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function softDeleteOrganization(orgId: string) {
  await verifySuperAdmin();
  const supabase = createAdminClient();
  
  await supabase.from('profiles').update({ status: 'terminated' }).eq('organization_id', orgId);
  const { error } = await supabase.from('organizations').update({ deleted_at: new Date().toISOString() }).eq('id', orgId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function hardDeleteOrganization(orgId: string) {
  await verifySuperAdmin();
  const supabase = createAdminClient();
  
  const { error } = await supabase.from('organizations').delete().eq('id', orgId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getOrganizationStats(orgId: string) {
  const supabase = createAdminClient();

  // 1. Busca Catálogos Ativos (via org)
  const { data: orgCatalogs } = await supabase
    .from("organization_catalogs")
    .select("catalog_id")
    .eq("organization_id", orgId)
    .eq("is_enabled", true);

  const orgCatalogIds = orgCatalogs?.map((c) => c.catalog_id) || [];

  // 1.5. Busca Catálogos Vinculados aos Perfis da Org (ex: herança B2C)
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id")
    .eq("organization_id", orgId);
    
  let profileCatalogIds: string[] = [];
  if (profiles && profiles.length > 0) {
    const pIds = profiles.map(p => p.id);
    const { data: profileCatalogs } = await supabase
      .from("profile_catalogs")
      .select("organization_catalog_id")
      .in("profile_id", pIds)
      .eq("is_selected", true);
      
    if (profileCatalogs && profileCatalogs.length > 0) {
      const ocIds = profileCatalogs.map(pc => pc.organization_catalog_id);
      const { data: orgCats } = await supabase
        .from("organization_catalogs")
        .select("catalog_id")
        .in("id", ocIds);
        
      if (orgCats) {
        profileCatalogIds = orgCats.map(c => c.catalog_id);
      }
    }
  }

  const catalogIds = Array.from(new Set([...orgCatalogIds, ...profileCatalogIds]));

  // 2. Contagem de Vendedores
  const { count: sellers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .eq("role", "seller");

  // 3. Contagem de Categorias
  let categoryCount = 0;
  let catIds: string[] = [];
  if (catalogIds.length > 0) {
    const { data: categories } = await supabase
      .from("categories")
      .select("id")
      .in("catalog_id", catalogIds);

    if (categories) {
      categoryCount = categories.length;
      catIds = categories.map((c) => c.id);
    }
  }

  // 4. Contagem de Produtos (Busca Híbrida)
  // Conta produtos próprios da organização
  const { count: directProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .is("deleted_at", null);

  let productCount = directProducts || 0;

  // Soma produtos de catálogos herdados (onde organization_id é diferente)
  if (catIds.length > 0) {
    const { count: indirectProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .in("category_id", catIds)
      .neq("organization_id", orgId)
      .is("deleted_at", null);

    productCount += (indirectProducts || 0);
  }

  return {
    success: true,
    stats: {
      products: productCount,
      sellers: sellers || 0,
      categories: categoryCount
    }
  };
}
export async function getMyProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const admin = createAdminClient();
  let { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // Fallback: Se não achou pelo ID, tenta pelo e-mail (para casos de erro no trigger de cadastro)
  if (!profile && user.email) {
    console.log("Perfil não encontrado por ID, tentando por e-mail:", user.email);
    const { data: profileByEmail } = await admin
      .from("profiles")
      .select("*")
      .eq("email", user.email)
      .maybeSingle();
    
    if (profileByEmail) {
      profile = profileByEmail;
      // Aproveita e atualiza o user_id no banco para corrigir o erro permanentemente
      await admin
        .from("profiles")
        .update({ user_id: user.id })
        .eq("id", profileByEmail.id);
    } else {
      // ÚLTIMA INSTÂNCIA: Criar TUDO (Empresa + Perfil) se nada existir
      console.log("Criando conta completa de emergência para:", user.email);
      
      // 1. Cria a Organização
      const orgSlug = user.email?.split('@')[0] + "-" + Math.floor(Math.random() * 1000);
      const { data: newOrg, error: orgError } = await admin
        .from("organizations")
        .insert({
          name: "Minha Plataforma",
          slug: orgSlug,
          business_model: 'B2C',
          plan_id: '32c7b8a2-2bf7-43dd-b1a6-5706566fbfd0' // Plano Inicial
        })
        .select("*")
        .single();

      if (!orgError && newOrg) {
        // 2. Cria o Perfil vinculado à nova Organização
        const { data: newProfile, error: profError } = await admin
          .from("profiles")
          .insert({
            user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
            role: 'b2c_admin',
            slug: orgSlug,
            organization_id: newOrg.id
          })
          .select("*")
          .single();
        
        if (!profError) profile = newProfile;
      }
    }
  }
    
  return profile;
}

export async function getOrganizationById(orgId: string) {
  const admin = createAdminClient();
  const { data: org } = await admin
    .from("organizations")
    .select("*")
    .eq("id", orgId)
    .maybeSingle();
    
  return org;
}

export async function getOrganizationProductCount(orgId: string) {
  const admin = createAdminClient();
  const { count } = await admin
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .is("deleted_at", null);
    
  return count || 0;
}

export async function getOrganizationSellerCount(orgId: string) {
  const admin = createAdminClient();
  const { count } = await admin
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .eq("role", "seller");
    
  return count || 0;
}

export async function getOrganizationSellers(orgId: string, limit: number = 5) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id, full_name, slug, avatar_url")
    .eq("organization_id", orgId)
    .eq("role", "seller")
    .limit(limit);
    
  return data || [];
}

export async function startShadowAccess(orgId: string) {
  await verifySuperAdmin();
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  
  // Apenas Super Admins podem usar shadow access
  cookieStore.set("shadow_org_id", orgId, { 
    path: "/", 
    maxAge: 3600, // 1 hora de simulação
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production'
  });
 
  return { success: true };
}

export async function stopShadowAccess() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  cookieStore.delete("shadow_org_id");
  return { success: true };
}

export async function updateOrganizationInternalName(orgId: string, internalName: string | null) {
  await verifySuperAdmin();
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from('organizations')
    .update({ internal_name: internalName || null })
    .eq('id', orgId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
