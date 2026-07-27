import { createClient } from "@/lib/supabase/server";

/**
 * Garante que o usuário está autenticado e possui a role de 'main_admin' ou 'main_admin'.
 * Lança um erro caso não esteja autorizado.
 * Retorna o ID do usuário em caso de sucesso.
 */
export async function verifySuperAdmin(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Não autenticado.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const userRole = profile?.role;
  if (userRole !== "main_admin" && userRole !== "main_admin") {
    throw new Error("Não autorizado. Esta ação requer privilégios de Super Administrador.");
  }

  return user.id;
}

/**
 * Garante que o usuário está autenticado e pertence à organização fornecida,
 * com o papel de admin ('b2b_admin', 'admin') ou seja um Super Admin.
 * Lança um erro caso não esteja autorizado.
 * Retorna o ID do usuário em caso de sucesso.
 */
export async function verifyOrgAdmin(orgId: string): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Não autenticado.");
  }

  let { data: profile } = await supabase
    .from("profiles")
    .select("role, organization_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    const { data: profileByUid } = await supabase
      .from("profiles")
      .select("role, organization_id")
      .eq("user_id", user.id)
      .maybeSingle();
    profile = profileByUid;
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const shadowOrgId = cookieStore.get("shadow_org_id")?.value;

  const isSuperAdmin = profile?.role === "main_admin";
  const userOrgId = (isSuperAdmin && shadowOrgId) ? shadowOrgId : profile?.organization_id;

  const allowedRoles = ["b2b_admin", "admin", "b2c_admin", "seller", "caas_admin", "manager", "authorized", "gestor"];
  const isOrgAdmin = allowedRoles.includes(profile?.role || "") && userOrgId === orgId;

  if (!isSuperAdmin && !isOrgAdmin) {
    throw new Error("Não autorizado. Esta ação requer privilégios administrativos nesta organização.");
  }

  return user.id;
}

/**
 * Garante apenas que o usuário possui uma sessão ativa (está autenticado).
 * Lança um erro caso não esteja logado.
 * Retorna o ID do usuário em caso de sucesso.
 */
export async function verifyAuthenticated(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Não autenticado.");
  }

  return user.id;
}
