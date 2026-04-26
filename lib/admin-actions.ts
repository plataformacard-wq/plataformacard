"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
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

export async function updateOrganizationPlan(orgId: string, planId: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("organizations")
    .update({ plan_id: planId })
    .eq("id", orgId);

  if (error) {
    console.error("Erro ao atualizar plano da org:", error);
    return { error: "Falha ao atualizar o plano." };
  }

  revalidatePath("/admin/clientes");
  return { success: true };
}

export async function updateOrganizationModel(orgId: string, model: 'B2B' | 'B2C') {
  const supabase = createAdminClient();
  
  try {
    const { error } = await supabase
      .from('organizations')
      .update({ business_model: model })
      .eq('id', orgId);

    if (error) throw error;

    // Também atualizamos o role de todos os admins dessa org para manter sincronia
    const newRole = model === 'B2B' ? 'b2b_admin' : 'b2c_admin';
    await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('organization_id', orgId)
      .in('role', ['b2b_admin', 'b2c_admin', 'admin']);

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao atualizar modelo de negócio:", error);
    return { success: false, error: error.message };
  }
}

export async function getOrganizationStats(orgId: string) {
  const supabase = createAdminClient();

  // 1. Busca Catálogo Ativo
  const { data: orgCatalog } = await supabase
    .from("organization_catalogs")
    .select("catalog_id")
    .eq("organization_id", orgId)
    .eq("is_enabled", true)
    .maybeSingle();

  // 2. Contagem de Vendedores
  const { count: sellers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .eq("role", "seller");

  // 3. Contagem de Categorias
  let categoryCount = 0;
  if (orgCatalog?.catalog_id) {
    const { count: catCount } = await supabase
      .from("categories")
      .select("*", { count: "exact", head: true })
      .eq("catalog_id", orgCatalog.catalog_id);
    categoryCount = catCount || 0;
  }

  // 4. Contagem de Produtos (Busca Híbrida)
  // Tenta por organization_id primeiro
  const { count: directProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .is("deleted_at", null);

  let productCount = directProducts || 0;

  // Se não encontrou nada por organization_id, tenta via categorias do catálogo
  if (productCount === 0 && orgCatalog?.catalog_id) {
    const { data: categories } = await supabase
      .from("categories")
      .select("id")
      .eq("catalog_id", orgCatalog.catalog_id);

    if (categories && categories.length > 0) {
      const catIds = categories.map(c => c.id);
      const { count: indirectProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .in("category_id", catIds)
        .is("deleted_at", null);
      
      productCount = indirectProducts || 0;
    }
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
  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
    
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
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  
  // Apenas Super Admins podem usar shadow access
  // Nota: A validação final ocorre no PanelLayout ou via RLS se necessário
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
