import { createClient } from "@/lib/supabase/server";
import GlobalBI from "./GlobalBI";

export const dynamic = "force-dynamic";

export default async function GlobalAnalyticsPage() {
  const supabase = await createClient();

  // 1. Business Model Distribution
  const { data: orgs } = await supabase
    .from("organizations")
    .select("business_model");

  const b2bCount = orgs?.filter(o => o.business_model === 'B2B').length || 0;
  const b2cCount = orgs?.filter(o => o.business_model === 'B2C').length || 0;

  // 2. Growth Data (Last 6 Months)
  const { data: profiles } = await supabase
    .from("profiles")
    .select("created_at")
    .neq("role", "main_admin");

  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const growthMap: Record<string, number> = {};
  
  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const label = `${monthNames[d.getMonth()]}/${d.getFullYear().toString().slice(-2)}`;
    growthMap[label] = 0;
  }

  profiles?.forEach(p => {
    const d = new Date(p.created_at);
    const label = `${monthNames[d.getMonth()]}/${d.getFullYear().toString().slice(-2)}`;
    if (growthMap[label] !== undefined) {
      growthMap[label]++;
    }
  });

  const growthData = Object.entries(growthMap).map(([month, count]) => ({ month, count }));

  // 3. Global Funnel (from analytics_events)
  const { data: events } = await supabase
    .from("analytics_events")
    .select("event_type");

  const funnel = {
    views: events?.filter(e => e.event_type === 'view').length || 0,
    catalog: events?.filter(e => e.event_type === 'catalog_view').length || 0,
    leads: events?.filter(e => e.event_type === 'whatsapp_click' || e.event_type === 'product_whatsapp_click').length || 0,
  };

  const stats = {
    totalOrgs: orgs?.length || 0,
    b2bCount,
    b2cCount,
    globalFunnel: funnel,
    growthData
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--dash-text-primary)" }}>
          Centro de Inteligência (BI)
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--dash-text-secondary)" }}>
          Análise macro de performance, crescimento de usuários e conversão global do ecossistema.
        </p>
      </div>

      <GlobalBI stats={stats} />
    </div>
  );
}
