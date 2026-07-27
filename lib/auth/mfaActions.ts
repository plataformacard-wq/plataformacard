"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import crypto from "crypto";

// Tipo auxiliar para status do MFA
export type MfaStatusResult = {
  isEnabled: boolean;
  factors: Array<{ id: string; factor_type: string; status: string }>;
  currentAal: "aal1" | "aal2" | null;
  hasBackupCodes: boolean;
  isDeviceTrusted: boolean;
};

/**
 * Função para gerar um hash SHA-256 seguro de um código de backup
 */
function hashCode(code: string): string {
  const normalized = code.trim().replace(/-/g, "").toUpperCase();
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Obtém o status do 2FA do usuário atual
 */
export async function getMfaStatus(): Promise<MfaStatusResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      isEnabled: false,
      factors: [],
      currentAal: null,
      hasBackupCodes: false,
      isDeviceTrusted: false,
    };
  }

  // Verifica fatores cadastrados no Supabase Auth
  const { data: factorsData } = await supabase.auth.mfa.listFactors();
  const verifiedFactors = factorsData?.all?.filter((f) => f.status === "verified") || [];
  const isEnabled = verifiedFactors.length > 0;

  // Verifica nível AAL da sessão atual
  const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const currentAal = (aalData?.currentLevel as "aal1" | "aal2") || "aal1";

  // Verifica se o usuário possui códigos de backup
  const { count } = await supabase
    .from("user_mfa_backup_codes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("used_at", null);

  const hasBackupCodes = (count || 0) > 0;

  // Verifica se o dispositivo é confiável (cookie de 30 dias)
  const cookieStore = await cookies();
  const trustedCookie = cookieStore.get(`ps_trusted_${user.id}`);
  const isDeviceTrusted = !!trustedCookie?.value;

  return {
    isEnabled,
    factors: verifiedFactors.map((f) => ({
      id: f.id,
      factor_type: f.factor_type,
      status: f.status,
    })),
    currentAal,
    hasBackupCodes,
    isDeviceTrusted,
  };
}

/**
 * Gera e salva 8 códigos de backup únicos para o usuário
 */
export async function generateAndSaveBackupCodes(): Promise<{ success: boolean; codes?: string[]; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuário não autenticado" };
  }

  // Gerar 8 códigos de 8 caracteres alfanuméricos formatados (ex: A8K2-9M4L)
  const rawCodes: string[] = [];
  const rowsToInsert = [];

  for (let i = 0; i < 8; i++) {
    const part1 = crypto.randomBytes(2).toString("hex").toUpperCase();
    const part2 = crypto.randomBytes(2).toString("hex").toUpperCase();
    const raw = `${part1}-${part2}`;
    rawCodes.push(raw);

    rowsToInsert.push({
      user_id: user.id,
      code_hash: hashCode(raw),
    });
  }

  // Deleta códigos antigos não usados
  await supabase.from("user_mfa_backup_codes").delete().eq("user_id", user.id);

  // Insere os novos códigos
  const { error } = await supabase.from("user_mfa_backup_codes").insert(rowsToInsert);

  if (error) {
    console.error("Erro ao salvar códigos de backup:", error);
    return { success: false, error: "Erro ao registrar os códigos no banco" };
  }

  return { success: true, codes: rawCodes };
}

/**
 * Valida um código de backup e o marca como utilizado
 */
export async function verifyBackupCode(code: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuário não autenticado" };
  }

  const codeHash = hashCode(code);

  const { data: match, error } = await supabase
    .from("user_mfa_backup_codes")
    .select("id")
    .eq("user_id", user.id)
    .eq("code_hash", codeHash)
    .is("used_at", null)
    .maybeSingle();

  if (error || !match) {
    return { success: false, error: "Código de backup inválido ou já utilizado" };
  }

  // Marca como usado
  await supabase
    .from("user_mfa_backup_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("id", match.id);

  // Marca o dispositivo como confiável após usar backup de emergência
  await trustDeviceForUser(user.id);

  return { success: true };
}

/**
 * Envia um código temporário OTP por e-mail (Fallback)
 */
export async function sendEmailMfaCode(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { success: false, error: "Usuário ou e-mail não disponível" };
  }

  // Dispara o OTP via Supabase Auth
  const { error } = await supabase.auth.signInWithOtp({
    email: user.email,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error) {
    console.error("Erro ao enviar OTP por e-mail:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Valida o código OTP recebido por e-mail
 */
export async function verifyEmailMfaCode(otp: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { success: false, error: "Usuário não encontrado" };
  }

  const { error } = await supabase.auth.verifyOtp({
    email: user.email,
    token: otp,
    type: "email",
  });

  if (error) {
    return { success: false, error: "Código de e-mail inválido ou expirado" };
  }

  await trustDeviceForUser(user.id);
  return { success: true };
}

/**
 * Marca o navegador atual como um dispositivo confiável por 30 dias
 */
export async function trustDeviceForUser(userId: string) {
  const cookieStore = await cookies();
  const token = crypto.randomBytes(32).toString("hex");

  cookieStore.set(`ps_trusted_${userId}`, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 dias em segundos
    path: "/",
  });
}

/**
 * Remove a confiança do dispositivo atual
 */
export async function untrustCurrentDevice() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const cookieStore = await cookies();
    cookieStore.delete(`ps_trusted_${user.id}`);
  }
}

/**
 * Desativa o MFA (TOTP) do usuário
 */
export async function disableMfaForUser(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: factorsData } = await supabase.auth.mfa.listFactors();

  if (!factorsData?.all || factorsData.all.length === 0) {
    return { success: true };
  }

  for (const factor of factorsData.all) {
    const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
    if (error) {
      console.error(`Erro ao desativar fator ${factor.id}:`, error);
    }
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from("user_mfa_backup_codes").delete().eq("user_id", user.id);
    await untrustCurrentDevice();
  }

  return { success: true };
}
