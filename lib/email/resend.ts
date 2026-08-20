"use server";

import { getOtpEmailTemplate, getResetPasswordEmailTemplate } from "./templates";

type SendEmailPayload = {
  to: string;
  subject: string;
  html: string;
  from?: string;
};

/**
 * Envia um e-mail transacional via Resend API (com fallback de segurança)
 */
export async function sendEmail({ to, subject, html, from }: SendEmailPayload): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const sender = from || process.env.RESEND_FROM_EMAIL || "PlataformaShop <atendimento@plataformashop.com.br>";

  if (!apiKey) {
    console.warn("📌 [RESEND SMTP WARNING]: RESEND_API_KEY não configurada no .env. Simulando disparo em log.");
    console.log(`[SIMULAÇÃO DE EMAIL] Para: ${to} | Assunto: ${subject}`);
    return { success: true, id: "simulated_id" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: sender,
        to: [to],
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro no envio do e-mail via Resend:", data);
      return { success: false, error: data.message || "Erro de envio no Resend" };
    }

    return { success: true, id: data.id };
  } catch (err: any) {
    console.error("Exceção ao disparar e-mail via Resend:", err);
    return { success: false, error: err.message || "Erro na conexão com Resend" };
  }
}

/**
 * Dispara e-mail de código de verificação OTP
 */
export async function sendOtpEmail(to: string, otpCode: string, name?: string) {
  const html = getOtpEmailTemplate(otpCode, name);
  return await sendEmail({
    to,
    subject: `${otpCode} é o seu código de segurança PlataformaShop`,
    html,
  });
}

/**
 * Dispara e-mail de recuperação de senha
 */
export async function sendResetPasswordEmail(to: string, resetUrl: string, name?: string) {
  const html = getResetPasswordEmailTemplate(resetUrl, name);
  return await sendEmail({
    to,
    subject: "Instruções para Redefinição de Senha - PlataformaShop",
    html,
  });
}
