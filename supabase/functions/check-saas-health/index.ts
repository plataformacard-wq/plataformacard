// Edge Function: check-saas-health
// Monitora o uso de recursos e envia alertas via Telegram

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const TELEGRAM_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")
const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

const DB_LIMIT_ROWS = 500000 // 500MB aprox.

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // 1. Coletar Métricas
    const [
      { count: sellers },
      { count: products },
      { count: leads },
      { count: analytics }
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "seller"),
      supabase.from("products").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("leads_tracking").select("*", { count: "exact", head: true }),
      supabase.from("analytics_events").select("*", { count: "exact", head: true })
    ])

    const totalRows = (sellers || 0) + (products || 0) + (leads || 0) + (analytics || 0)
    const usagePercent = Math.round((totalRows / DB_LIMIT_ROWS) * 100)

    // 2. Lógica de Alerta
    let severity = ""
    if (usagePercent >= 95) severity = "emergency"
    else if (usagePercent >= 85) severity = "critical"
    else if (usagePercent >= 75) severity = "warning"

    if (severity && TELEGRAM_TOKEN && TELEGRAM_CHAT_ID) {
      // Verificar se já enviamos este alerta hoje
      const { data: lastAlert } = await supabase
        .from("platform_alerts_log")
        .select("last_sent_at")
        .eq("alert_type", "db_usage")
        .eq("severity", severity)
        .single()

      const shouldSend = !lastAlert || 
        (new Date().getTime() - new Date(lastAlert.last_sent_at).getTime() > 1000 * 60 * 60 * 12) // 12h gap

      if (shouldSend) {
        const message = `🤖 *SaaS Watchdog | PlataformaShop*\n\n` +
          `${severity === 'emergency' ? '🚨' : '⚠️'} *Alerta de Infraestrutura*\n` +
          `Uso do Banco de Dados atingiu *${usagePercent}%*.\n\n` +
          `📊 *Métricas:*\n` +
          `- Linhas Totais: ${totalRows.toLocaleString()}\n` +
          `- Vendedores: ${sellers}\n` +
          `- Leads: ${leads}\n\n` +
          `💡 _Sugestão: Verifique o dashboard de Gestão de Recursos._`

        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: "Markdown"
          })
        })

        // Atualizar log
        await supabase
          .from("platform_alerts_log")
          .upsert({ 
            alert_type: "db_usage", 
            severity: severity, 
            percentage: usagePercent,
            last_sent_at: new Date().toISOString() 
          })
      }
    }

    return new Response(JSON.stringify({ success: true, usage: usagePercent }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
