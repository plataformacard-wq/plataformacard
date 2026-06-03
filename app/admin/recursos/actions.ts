"use server";
 
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySuperAdmin } from "@/lib/utils/auth-validation";
 
export type ResourceMetrics = {
  totalSellers: number;
  totalProducts: number;
  totalLeads: number;
  totalAnalytics: number;
  totalImages: number;
  dbUsagePercent: number;
  bandwidthUsagePercent: number;
  totalAiTokens: number;
  aiTokensPrompt: number;
  aiTokensCompletion: number;
  aiUsagePercent: number;
  lastUpdated: string;
};
 
export async function getSaaSResourceMetrics(): Promise<ResourceMetrics> {
  await verifySuperAdmin();
  const admin = createAdminClient();

  // 1. Contagens Básicas e IA
  const [
    { count: sellersCount },
    { count: productsCount },
    { count: leadsCount },
    { count: analyticsCount },
    { data: aiLogs }
  ] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }).eq("role", "seller"),
    admin.from("products").select("*", { count: "exact", head: true }).is("deleted_at", null),
    admin.from("leads_tracking").select("*", { count: "exact", head: true }),
    admin.from("analytics_events").select("*", { count: "exact", head: true }),
    admin.from("ai_usage_logs").select("prompt_tokens, completion_tokens, total_tokens")
  ]);

  // Cálculo de Tokens
  const aiTokensPrompt = aiLogs?.reduce((acc, log) => acc + (log.prompt_tokens || 0), 0) || 0;
  const aiTokensCompletion = aiLogs?.reduce((acc, log) => acc + (log.completion_tokens || 0), 0) || 0;
  const totalAiTokens = aiTokensPrompt + aiTokensCompletion;

  // Limite de Tokens (Plano Free do Gemini tem limites por minuto/dia, mas aqui simulamos um budget mensal do SaaS)
  // Vamos definir um budget simulado de 1.000.000 tokens para monitoramento
  const aiTokenLimit = 1000000;
  const aiUsagePercent = Math.min(Math.round((totalAiTokens / aiTokenLimit) * 100), 100);

  // 2. Estimativa de Uso de Banco (500MB Free Tier)
  const totalRows = (sellersCount || 0) + (productsCount || 0) + (leadsCount || 0) + (analyticsCount || 0) + (aiLogs?.length || 0);
  const dbLimit = 500000; 
  const dbUsagePercent = Math.min(Math.round((totalRows / dbLimit) * 100), 100);

  // 3. Estimativa de Banda (100GB Free Tier)
  const estimatedBandwidthKB = (analyticsCount || 0) * 2;
  const bandwidthLimitKB = 100 * 1024 * 1024; // 100GB
  const bandwidthUsagePercent = Math.min(Math.round((estimatedBandwidthKB / bandwidthLimitKB) * 100), 100);

  return {
    totalSellers: sellersCount || 0,
    totalProducts: productsCount || 0,
    totalLeads: leadsCount || 0,
    totalAnalytics: analyticsCount || 0,
    totalImages: productsCount || 0,
    dbUsagePercent,
    bandwidthUsagePercent,
    totalAiTokens,
    aiTokensPrompt,
    aiTokensCompletion,
    aiUsagePercent,
    lastUpdated: new Date().toISOString()
  };
}
