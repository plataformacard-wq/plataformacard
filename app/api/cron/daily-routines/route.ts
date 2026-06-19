import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN_LIMITS, PLAN_IDS } from "@/lib/plans";
import { getOrganizationStats } from "@/lib/admin-actions";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Token secreto para proteger a rota cron contra chamadas externas não autorizadas
// Em produção, deve-se usar variável de ambiente (ex: CRON_SECRET)
const CRON_SECRET = process.env.CRON_SECRET || "maj-secret-cron-key";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const authHeader = request.headers.get("authorization");
  
  // Validação simples de segurança (Bearer Token)
  if (authHeader !== `Bearer ${CRON_SECRET}` && url.searchParams.get("key") !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const logs: string[] = [];

  try {
    logs.push("--- INICIANDO ROTINA CRON DIÁRIA ---");

    // 1. Busca todas as organizações ativas
    const { data: orgs, error: orgError } = await supabase
      .from("organizations")
      .select("id, name, slug, plan_id, created_at, auto_upsell_enabled");

    if (orgError) throw orgError;

    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    for (const org of orgs || []) {
      if (!org.plan_id || !PLAN_LIMITS[org.plan_id]) continue;

      const plan = PLAN_LIMITS[org.plan_id];
      const orgDate = new Date(org.created_at);
      const orgAnniversaryDay = orgDate.getDate();

      // ============== A. GERADOR DE FATURAS (BILLING ENGINE) ==============
      // Verifica se hoje é o dia de "aniversário" da assinatura
      // Para simplificar, estamos simulando um ciclo MENSAL
      if (currentDay === orgAnniversaryDay) {
        // Verifica se já gerou fatura para este mês para evitar duplicação
        const dueDate = new Date(currentYear, currentMonth, currentDay + 5); // Vencimento em 5 dias
        const description = `Fatura Mensal - Plano ${plan.name} (${currentMonth + 1}/${currentYear})`;

        const { data: existingInvoice } = await supabase
          .from("invoices")
          .select("id")
          .eq("organization_id", org.id)
          .eq("description", description)
          .maybeSingle();

        if (!existingInvoice) {
          const { error: invoiceError } = await supabase.from("invoices").insert({
            organization_id: org.id,
            amount: plan.price,
            description: description,
            status: "PENDING",
            due_date: dueDate.toISOString().split("T")[0]
          });

          if (!invoiceError) {
            logs.push(`Fatura Gerada: ${org.name} - R$ ${plan.price}`);
          } else {
            logs.push(`ERRO Fatura: ${org.name} - ${invoiceError.message}`);
          }
        }
      }

      // ============== B. GATILHO DE UPSELL (UPSELL EVALUATOR) ==============
      if (org.auto_upsell_enabled) {
        // Busca uso de recursos
        const statsResult = await getOrganizationStats(org.id);
        if (statsResult.success) {
          const { products, sellers } = statsResult.stats;
          let usagePercentage = 0;

          // Se for Enterprise (0 limits), nunca fará upsell
          if (plan.max_products > 0 && plan.max_users > 0) {
            const productsUsage = products / plan.max_products;
            const sellersUsage = sellers / plan.max_users;
            usagePercentage = Math.max(productsUsage, sellersUsage) * 100;
          } else if (plan.max_products > 0) {
            usagePercentage = (products / plan.max_products) * 100;
          } else if (plan.max_users > 0) {
            usagePercentage = (sellers / plan.max_users) * 100;
          }

          // Se uso for maior que 80%, dispara alerta
          if (usagePercentage >= 80) {
            // AQUI OCORRERIA A INTEGRAÇÃO COM A API DO RESEND/SENDGRID
            // await sendUpsellEmail(org.email, org.name, usagePercentage);
            logs.push(`[UPSELL DISPARADO]: ${org.name} bateu ${usagePercentage.toFixed(1)}% de uso.`);
            
            // Para não spamar todo dia, idealmente gravaríamos uma flag "last_upsell_email_sent_at" 
            // no banco de dados, mas para este bootstrap estamos apenas no log.
          }
        }
      }
    }

    logs.push("--- ROTINA CONCLUÍDA ---");

    return NextResponse.json({ success: true, logs });

  } catch (error: any) {
    console.error("Erro no Cron:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
