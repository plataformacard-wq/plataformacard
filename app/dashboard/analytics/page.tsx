import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAnalyticsSummary } from "@/lib/dashboard/getAnalyticsSummary";
import { getTopProducts } from "@/lib/dashboard/getTopProducts";
import { getProductConversion } from "@/lib/dashboard/getProductConversion";
import AnalyticsControls from "@/components/dashboard/analytics/AnalyticsControls";
import PrintReportButton from "@/components/dashboard/analytics/PrintReportButton";
import { AlertCircle, Eye, LayoutGrid, MousePointerClick, MessageCircle, Filter, ArrowRight, TrendingUp } from "lucide-react";
import StockIntelligenceSection from "@/components/dashboard/StockIntelligenceSection";

export const dynamic = "force-dynamic";

function pct(n: number, d: number) {
  if (!d || d <= 0) return "0%";
  return `${Math.round((n / d) * 100)}%`;
}

const card = {
  padding: "20px",
  borderRadius: "16px",
  border: "1px solid var(--dash-border)",
  background: "var(--dash-surface)",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
} as React.CSSProperties;

export default async function AnalyticsPage(props: {
  searchParams: Promise<{ period?: string }>;
}) {
  const searchParams = await props.searchParams;
  const period = searchParams.period || "all";
  
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/entrar");
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("id, organization_id, role, dash_access_analytics")
    .eq("user_id", user.id)
    .maybeSingle();

  // Busca perfil ou usa fallback para contas de emergência
  let profile = profileData;
  if (!profile) {
    // Cria um perfil temporário em memória para evitar redirect se for um erro de sync
    profile = { 
      id: user.id, 
      organization_id: user.user_metadata?.organization_id || null,
      role: ""
    } as any;
  }

  if (profile?.role === "seller" && !profile?.dash_access_analytics) {
    redirect("/dashboard/perfil");
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const shadowOrgId = cookieStore.get("shadow_org_id")?.value;

  const isSuperAdmin = profile?.role === "main_admin";
  const activeOrgId = (isSuperAdmin && shadowOrgId) ? shadowOrgId : profile?.organization_id;

  if (profile && isSuperAdmin && shadowOrgId) {
    const { data: simulatedProfile } = await supabase
      .from("profiles")
      .select("id, organization_id")
      .eq("organization_id", shadowOrgId)
      .in("role", ["b2b_admin", "b2c_admin", "admin"])
      .limit(1)
      .maybeSingle();
    
    if (simulatedProfile) {
      profile = {
        ...profile,
        id: simulatedProfile.id,
        organization_id: simulatedProfile.organization_id,
      };
    } else {
      profile = {
        ...profile,
        organization_id: shadowOrgId,
      };
    }
  }

  // Busca dados da organização para o relatório
  let organizationName = "PlataformaShop";
  const orgId = activeOrgId;
  let hasBlingConnection = false;
  
  if (orgId) {
    const { data: org } = await supabase
      .from("organizations")
      .select("name, bling_access_token")
      .eq("id", orgId)
      .maybeSingle();
    if (org?.name) organizationName = org.name;
    if (org?.bling_access_token) hasBlingConnection = true;
  }

  // Lógica de cálculo de datas baseada no período
  let startDate: string | undefined;
  let endDate: string | undefined;

  const now = new Date();
  if (period === "today") {
    const start = new Date(now.setHours(0, 0, 0, 0));
    startDate = start.toISOString();
  } else if (period === "7d") {
    const start = new Date(now.setDate(now.getDate() - 7));
    startDate = start.toISOString();
  } else if (period === "30d") {
    const start = new Date(now.setDate(now.getDate() - 30));
    startDate = start.toISOString();
  } else if (period === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    startDate = start.toISOString();
  } else if (period === "year") {
    const start = new Date(now.getFullYear(), 0, 1);
    startDate = start.toISOString();
  }

  let summary = { profileViews: 0, catalogViews: 0, productClicks: 0, conversationsStarted: 0 };
  let topProducts = [];
  let productConversion: any[] = [];
  let fetchError = null;

  const pId = profile?.id || user.id;
  const pOrgId = profile?.organization_id || null;

  try {

    const [summaryRes, topProductsRes, productConversionRes] = await Promise.all([
      getAnalyticsSummary(pId, pOrgId, startDate, endDate).catch(e => { console.error(e); return null; }),
      getTopProducts(pId, 5, pOrgId, startDate, endDate).catch(e => { console.error(e); return null; }),
      getProductConversion(pId, pOrgId, startDate, endDate).catch(e => { console.error(e); return null; }),
    ]);

    if (summaryRes) summary = summaryRes;
    if (topProductsRes) topProducts = topProductsRes;
    if (productConversionRes) productConversion = productConversionRes;
    
    if (!summaryRes && !topProductsRes) {
      fetchError = "Não foi possível carregar alguns dados de BI. Verifique se as funções RPC estão configuradas no Supabase.";
    }
  } catch (err: any) {
    console.error("Erro geral no fetch de analytics:", err);
    fetchError = err.message;
  }

  const rateProfileToCatalog = pct(summary.catalogViews, summary.profileViews);
  const rateCatalogToProduct = pct(summary.productClicks, summary.catalogViews);
  const rateProductToConversation = pct(
    summary.conversationsStarted,
    summary.productClicks
  );

  return (
    <div style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" } as React.CSSProperties}>
      {/* Cabeçalho do Relatório (Apenas Impressão) */}
      <div className="print-only mb-10 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/icon.png" alt="Logo" className="w-16 h-16 object-contain rounded-xl" />
            <div>
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider">{organizationName}</p>
              <p className="text-xs font-medium text-zinc-400 mt-1">ID: {orgId?.substring(0, 8) || "N/A"}</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-black text-[var(--dash-text-primary)]">Relatório de Desempenho</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-2">
              Documento Oficial • {new Date().toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>
        <div className="h-2 w-full bg-gradient-to-r from-primary to-emerald-400 rounded-full mt-6" />
      </div>

      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--dash-text-primary)" }}>
            Analytics
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--dash-text-secondary)" }}>
            Métricas de visitas, cliques e conversões.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PrintReportButton />
        </div>
      </div>

      {fetchError && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-amber-600">
          <AlertCircle size={20} />
          <p className="text-xs font-medium">{fetchError}</p>
        </div>
      )}

      <Suspense fallback={<div className="h-20 w-full animate-pulse bg-zinc-500/5 rounded-2xl mb-8" />}>
        <AnalyticsControls 
          organizationId={pOrgId || ""} 
          profileId={pId} 
        />
      </Suspense>



      {/* KPIs */}
      <section className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 print:grid-cols-2">
        {[
          { label: "Visitas no cartão", value: summary.profileViews, icon: Eye, text: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20 hover:border-blue-500/40" },
          { label: "Visitas no catálogo", value: summary.catalogViews, icon: LayoutGrid, text: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20 hover:border-purple-500/40" },
          { label: "Cliques em produto", value: summary.productClicks, icon: MousePointerClick, text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20 hover:border-amber-500/40" },
          { label: "Conversas iniciadas", value: summary.conversationsStarted, icon: MessageCircle, text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20 hover:border-emerald-500/40" },
        ].map((kpi) => (
          <div key={kpi.label} className={`rounded-3xl border ${kpi.border} bg-[var(--dash-surface)] p-6 relative overflow-hidden flex flex-col hover:shadow-lg transition-all group`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`rounded-lg ${kpi.bg} ${kpi.text} p-2 group-hover:scale-110 transition-transform`}>
                <kpi.icon size={20} />
              </div>
            </div>
            <p className={`text-sm font-bold ${kpi.text} mb-1 opacity-80`}>
              {kpi.label}
            </p>
            <p className={`text-4xl font-black ${kpi.text}`}>
              {kpi.value}
            </p>
          </div>
        ))}
      </section>

      {/* Funil */}
      <section className="mt-8 rounded-3xl border border-[var(--dash-border)] p-6 md:p-8 shadow-sm bg-[var(--dash-surface)]">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-zinc-500/10 p-2 text-zinc-500">
            <Filter size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: "var(--dash-text-primary)" }}>
              Funil de conversão
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--dash-text-secondary)" }}>
              Entenda como as visitas se transformam em conversas.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Cartão", target: "Catálogo", rate: rateProfileToCatalog, sub: `${summary.catalogViews} de ${summary.profileViews}` },
            { label: "Catálogo", target: "Produto", rate: rateCatalogToProduct, sub: `${summary.productClicks} de ${summary.catalogViews}` },
            { label: "Produto", target: "Conversa", rate: rateProductToConversation, sub: `${summary.conversationsStarted} de ${summary.productClicks}` },
          ].map((f) => (
            <div key={f.label} className="rounded-2xl border border-[var(--dash-border)] p-5 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors bg-[var(--dash-bg)] group">
              <div className="flex items-center gap-2 mb-3 text-sm font-semibold" style={{ color: "var(--dash-text-secondary)" }}>
                <span>{f.label}</span>
                <ArrowRight size={14} className="opacity-50 group-hover:translate-x-1 transition-transform" />
                <span>{f.target}</span>
              </div>
              <div className="flex items-end gap-3">
                <p className="text-3xl font-black" style={{ color: "var(--dash-text-primary)" }}>{f.rate}</p>
                <p className="text-xs pb-1 font-medium" style={{ color: "var(--dash-text-muted)" }}>{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Conversão por produto */}
      <section className="mt-8 rounded-3xl border border-[var(--dash-border)] p-6 md:p-8 shadow-sm bg-[var(--dash-surface)]">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-500">
            <TrendingUp size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: "var(--dash-text-primary)" }}>
              Conversão por produto
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--dash-text-secondary)" }}>
              Taxa de interesse real (cliques no WhatsApp) por produto.
            </p>
          </div>
        </div>

        {productConversion.length === 0 ? (
          <div
            className="rounded-2xl border-2 border-dashed p-8 text-center text-sm font-medium"
            style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-muted)" }}
          >
            Ainda não há dados suficientes para análise de conversão.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[var(--dash-border)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--dash-bg)]">
                <tr className="border-b" style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-secondary)" }}>
                  <th className="py-3 px-4 text-left font-semibold">Produto</th>
                  <th className="py-3 px-4 text-left font-semibold">Cliques</th>
                  <th className="py-3 px-4 text-left font-semibold">WhatsApp</th>
                  <th className="py-3 px-4 text-left font-semibold">Conversão</th>
                </tr>
              </thead>
              <tbody>
                {productConversion.map((item: any) => {
                  const rateNum = item.conversion_rate ? Math.round(item.conversion_rate * 100) : 0;
                  return (
                    <tr
                      key={item.product_id}
                      className="border-b last:border-none hover:bg-[var(--dash-bg)] transition-colors"
                      style={{ borderColor: "var(--dash-border)" }}
                    >
                      <td className="py-3 px-4 font-bold" style={{ color: "var(--dash-text-primary)" }}>
                        {item.product_name ?? item.product_id}
                      </td>
                      <td className="py-3 px-4 font-medium" style={{ color: "var(--dash-text-secondary)" }}>{item.clicks}</td>
                      <td className="py-3 px-4 font-medium" style={{ color: "var(--dash-text-secondary)" }}>{item.whatsapp_clicks}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${rateNum > 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-500/10 text-zinc-500 dark:text-zinc-400'}`}>
                          {rateNum}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Analítico de Estoque (Não incluso na exportação em PDF) */}
      <div className="mt-12 pt-10 border-t-2 border-dashed no-print" style={{ borderColor: "var(--dash-border)" }}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold" style={{ color: "var(--dash-text-primary)" }}>
            Analítico de Estoque
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--dash-text-secondary)" }}>
            Painel independente de gerenciamento de inventário e volumetria.
          </p>
        </div>
        <StockIntelligenceSection activeOrgId={activeOrgId} hasBlingConnection={hasBlingConnection} />
      </div>
    </div>
  );
}