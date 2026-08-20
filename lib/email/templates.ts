/**
 * Templates HTML Oficiais e Responsivos para E-mails da PlataformaShop
 */

export function getOtpEmailTemplate(otpCode: string, name?: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de Verificação - PlataformaShop</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="min-height: 100vh; padding: 40px 20px;">
    <tr>
      <td align="center" valign="top">
        <table role="presentation" width="100%" max-width="500" border="0" cellspacing="0" cellpadding="0" style="background-color: #18181b; border: 1px solid #27272a; border-radius: 24px; padding: 40px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          <!-- Header Logo -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <div style="display: inline-block; background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 16px; padding: 12px 24px;">
                <span style="font-size: 20px; font-weight: 800; color: #10b981; letter-spacing: -0.5px;">PlataformaShop</span>
              </div>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td align="center" style="padding-bottom: 12px;">
              <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0;">Código de Segurança</h1>
            </td>
          </tr>

          <!-- Subtitle -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <p style="font-size: 14px; color: #a1a1aa; margin: 0; line-height: 1.5;">
                Olá${name ? `, <strong>${name}</strong>` : ""}! Utilize o código abaixo para autenticar sua ação. Este código é válido por 10 minutos.
              </p>
            </td>
          </tr>

          <!-- OTP Box -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <div style="background-color: #09090b; border: 1px solid #3f3f46; border-radius: 16px; padding: 20px 32px; display: inline-block;">
                <span style="font-size: 36px; font-weight: 900; font-family: monospace; letter-spacing: 8px; color: #10b981;">
                  ${otpCode}
                </span>
              </div>
            </td>
          </tr>

          <!-- Notice -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <p style="font-size: 12px; color: #71717a; margin: 0; line-height: 1.4;">
                ⚠️ Se você não solicitou este código, ignore este e-mail. Nunca compartilhe este número com ninguém.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="border-top: 1px solid #27272a; padding-top: 24px;">
              <p style="font-size: 11px; color: #52525b; margin: 0;">
                © 2026 PlataformaShop. Todos os direitos reservados.<br>
                Segurança e Alta Performance para o seu Negócio.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function getResetPasswordEmailTemplate(resetUrl: string, name?: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperação de Senha - PlataformaShop</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="min-height: 100vh; padding: 40px 20px;">
    <tr>
      <td align="center" valign="top">
        <table role="presentation" width="100%" max-width="500" border="0" cellspacing="0" cellpadding="0" style="background-color: #18181b; border: 1px solid #27272a; border-radius: 24px; padding: 40px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          <!-- Header Logo -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <div style="display: inline-block; background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 16px; padding: 12px 24px;">
                <span style="font-size: 20px; font-weight: 800; color: #10b981; letter-spacing: -0.5px;">PlataformaShop</span>
              </div>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td align="center" style="padding-bottom: 12px;">
              <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0;">Recuperar Acesso</h1>
            </td>
          </tr>

          <!-- Subtitle -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <p style="font-size: 14px; color: #a1a1aa; margin: 0; line-height: 1.5;">
                Recebemos um pedido para redefinir a senha da sua conta${name ? ` (<strong>${name}</strong>)` : ""}. Clique no botão abaixo para cadastrar uma nova senha com segurança.
              </p>
            </td>
          </tr>

          <!-- Action Button -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <a href="${resetUrl}" target="_blank" style="background-color: #10b981; border-radius: 12px; padding: 14px 32px; color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                Redefinir Minha Senha
              </a>
            </td>
          </tr>

          <!-- Notice -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <p style="font-size: 12px; color: #71717a; margin: 0; line-height: 1.4;">
                Se você não fez esta solicitação, fique tranquilo. Sua senha continuará a mesma e nenhuma alteração será feita.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="border-top: 1px solid #27272a; padding-top: 24px;">
              <p style="font-size: 11px; color: #52525b; margin: 0;">
                © 2026 PlataformaShop. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
