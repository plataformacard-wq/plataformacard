"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function createSeller(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const slug = formData.get("slug") as string;
  const password = formData.get("password") as string;

  if (!fullName || !email || !slug || !password) {
    return { error: "Todos os campos são obrigatórios." };
  }

  const supabaseServer = await createClient();
  const { data: { user } } = await supabaseServer.auth.getUser();

  if (!user) {
    return { error: "Usuário não autenticado." };
  }

  const { data: profileManager } = await supabaseServer
    .from("profiles")
    .select("organization_id")
    .eq("user_id", user.id)
    .single();

  if (!profileManager?.organization_id) {
    return { error: "Organização não encontrada." };
  }

  const adminAuthClient = createAdminClient();

  // Verifica se o slug já existe para não quebrar a trigger/constraint
  const { data: existingSlug } = await adminAuthClient
    .from("profiles")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existingSlug) {
    return { error: "Este slug (link) já está em uso." };
  }

  const { data: newAuthUser, error: createUserError } = await adminAuthClient.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
  });

  if (createUserError) {
    console.error("Erro ao criar usuário auth:", createUserError);
    return { error: createUserError.message };
  }

  if (!newAuthUser.user) {
    return { error: "Falha ao criar a conta de usuário." };
  }

  // Atualiza o perfil criado via trigger
  const { error: profileError } = await adminAuthClient
    .from("profiles")
    .update({
      full_name: fullName,
      slug: slug,
      organization_id: profileManager.organization_id,
    })
    .eq("user_id", newAuthUser.user.id);

  if (profileError) {
    console.error("Erro ao atualizar perfil do vendedor:", profileError);
    return { error: "Vendedor criado, mas erro ao salvar perfil." };
  }

  return { success: true };
}

export async function deleteSeller(userId: string) {
  const supabaseServer = await createClient();
  const { data: { user } } = await supabaseServer.auth.getUser();

  if (!user) {
    return { error: "Usuário não autenticado." };
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
