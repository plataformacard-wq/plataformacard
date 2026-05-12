"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

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

  const allowedRoles = ["b2b_admin", "superadmin", "admin"];
  if (!allowedRoles.includes(profileManager.role)) {
    return { error: "Permissão negada." };
  }

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
    const virtualEmail = `vendedor_${slug}_${profileManager.organization_id.split("-")[0]}@interno.plataforma.card`;
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
      organization_id: profileManager.organization_id,
      role: "seller",
      dash_access_catalog: dashAccessCatalog,
      dash_access_analytics: dashAccessAnalytics,
      dash_access_company: dashAccessCompany,
      whatsapp_template: whatsappTemplate
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
    const adminAuthClient = createAdminClient();
    const { error } = await adminAuthClient
      .from("profiles")
      .update({ is_available: isAvailable })
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
    .select("organization_id")
    .eq("user_id", adminUser.id)
    .single();

  // Debug Sellers removed for production

  if (!profileManager?.organization_id) return { sellers: [] };

  const { data: sellers } = await adminAuthClient
    .from("profiles")
    .select("*")
    .eq("organization_id", profileManager.organization_id)
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
      managerOrg: profileManager.organization_id,
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

  const allowedRoles = ["b2b_admin", "superadmin", "admin"];
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

  const allowedRoles = ["b2b_admin", "superadmin", "admin"];
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

  const allowedRoles = ["b2b_admin", "superadmin", "admin"];
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
