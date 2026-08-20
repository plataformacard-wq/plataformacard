/**
 * Script de Auditoria de Infraestrutura de Identidade (SMTP Resend & Vercel Custom Domains)
 */

require('dotenv').config({ path: '.env.local' });

console.log("==========================================================");
console.log("🔍 AUDITORIA DE INFRAESTRUTURA DE IDENTIDADE & DOMÍNIOS");
console.log("==========================================================");

const resendKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM_EMAIL;
const vercelToken = process.env.VERCEL_TOKEN;
const vercelProjectId = process.env.VERCEL_PROJECT_ID;

console.log("\n📧 1. AUDITORIA DE E-MAIL SMTP (RESEND & SUPABASE):");
if (resendKey) {
  console.log("  [OK] RESEND_API_KEY encontrada:", resendKey.substring(0, 7) + "...");
} else {
  console.log("  [PENDENTE] RESEND_API_KEY ausente no .env.local");
}

if (resendFrom) {
  console.log("  [OK] RESEND_FROM_EMAIL configurado:", resendFrom);
} else {
  console.log("  [AVISO] RESEND_FROM_EMAIL não definido (usando padrão: atendimento@plataformashop.com.br)");
}

console.log("\n🌐 2. AUDITORIA DE DOMÍNIOS & INTEGRAÇÃO VERCEL:");
if (vercelToken) {
  console.log("  [OK] VERCEL_TOKEN encontrado:", vercelToken.substring(0, 5) + "...");
} else {
  console.log("  [PENDENTE] VERCEL_TOKEN ausente no .env.local (necessário para registrar custom_domains automaticamente via API)");
}

if (vercelProjectId) {
  console.log("  [OK] VERCEL_PROJECT_ID encontrado:", vercelProjectId);
} else {
  console.log("  [PENDENTE] VERCEL_PROJECT_ID ausente no .env.local");
}

console.log("\n==========================================================");
console.log("📋 PARÂMETROS SMTP PARA CONFIGURAR NO PAINEL SUPABASE:");
console.log("   Painel Supabase -> Authentication -> Email Settings -> Enable Custom SMTP");
console.log("----------------------------------------------------------");
console.log("   Sender Email:  atendimento@plataformashop.com.br");
console.log("   Sender Name:   PlataformaShop");
console.log("   Host:          smtp.resend.com");
console.log("   Port:          587");
console.log("   Username:      resend");
console.log("   Password:      [Sua RESEND_API_KEY]");
console.log("==========================================================");
