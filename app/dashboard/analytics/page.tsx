import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAnalyticsSummary } from "@/lib/dashboard/getAnalyticsSummary";
import { getTopProducts } from "@/lib/dashboard/getTopProducts";
import { getProductConversion } from "@/lib/dashboard/getProductConversion";
import AnalyticsControls from "@/components/dashboard/analytics/AnalyticsControls";
import PrintReportButton from "@/components/dashboard/analytics/PrintReportButton";
import { AlertCircle } from "lucide-react";

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
    .select("id, organization_id")
    .eq("user_id", user.id)
    .maybeSingle();

  // Busca perfil ou usa fallback para contas de emergência
  let profile = profileData;
  if (!profile) {
    // Cria um perfil temporário em memória para evitar redirect se for um erro de sync
    profile = { 
      id: user.id, 
      organization_id: user.user_metadata?.organization_id || null 
    } as any;
  }

  // Busca dados da organização para o relatório
  let organizationName = "PlataformaCard";
  const orgId = profile?.organization_id;
  
  if (orgId) {
    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", orgId)
      .maybeSingle();
    if (org?.name) organizationName = org.name;
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
    <div>
      {/* Cabeçalho do Relatório (Apenas Impressão) */}
      <div className="print-only mb-10 border-b-2 border-emerald-500 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-black">Relatório de Desempenho</h1>
            <p className="text-sm font-bold text-zinc-500 mt-1">{organizationName}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Documento Oficial</p>
            <p className="text-xs font-bold text-zinc-400 mt-1">{new Date().toLocaleDateString("pt-BR")}</p>
          </div>
        </div>
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
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Visitas no cartão", value: summary.profileViews },
          { label: "Visitas no catálogo", value: summary.catalogViews },
          { label: "Cliques em produto", value: summary.productClicks },
          { label: "Conversas iniciadas", value: summary.conversationsStarted },
        ].map((kpi) => (
          <div key={kpi.label} style={card}>
            <p className="text-sm font-medium" style={{ color: "var(--dash-text-secondary)" }}>
              {kpi.label}
            </p>
            <p className="mt-3 text-3xl font-bold" style={{ color: "var(--dash-text-primary)" }}>
              {kpi.value}
            </p>
          </div>
        ))}
      </section>

      {/* Funil */}
      <section className="mt-8 rounded-2xl border p-6 shadow-sm" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
        <div className="mb-4">
          <h2 className="text-lg font-semibold" style={{ color: "var(--dash-text-primary)" }}>
            Funil de conversão
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--dash-text-secondary)" }}>
            Entenda como as visitas se transformam em conversas.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Cartão → Catálogo", rate: rateProfileToCatalog, sub: `${summary.catalogViews} de ${summary.profileViews}` },
            { label: "Catálogo → Produto", rate: rateCatalogToProduct, sub: `${summary.productClicks} de ${summary.catalogViews}` },
            { label: "Produto → Conversa", rate: rateProductToConversation, sub: `${summary.conversationsStarted} de ${summary.productClicks}` },
          ].map((f) => (
            <div key={f.label} className="rounded-xl border p-4" style={{ borderColor: "var(--dash-border)" }}>
              <p className="text-sm" style={{ color: "var(--dash-text-secondary)" }}>{f.label}</p>
              <p className="mt-2 text-2xl font-bold" style={{ color: "var(--dash-text-primary)" }}>{f.rate}</p>
              <p className="mt-1 text-xs" style={{ color: "var(--dash-text-muted)" }}>{f.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Conversão por produto */}
      <section className="mt-8 rounded-2xl border p-6 shadow-sm" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
        <div className="mb-4">
          <h2 className="text-lg font-semibold" style={{ color: "var(--dash-text-primary)" }}>
            Conversão por produto
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--dash-text-secondary)" }}>
            Taxa de conversão de interesse (WhatsApp) por produto.
          </p>
        </div>

        {productConversion.length === 0 ? (
          <div
            className="rounded-xl border border-dashed p-6 text-sm"
            style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-muted)" }}
          >
            Ainda não há dados suficientes para análise de conversão.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-secondary)" }}>
                  <th className="py-2 text-left">Produto</th>
                  <th className="py-2 text-left">Cliques</th>
                  <th className="py-2 text-left">WhatsApp</th>
                  <th className="py-2 text-left">Conversão</th>
                </tr>
              </thead>
              <tbody>
                {productConversion.map((item: any) => (
                  <tr
                    key={item.product_id}
                    className="border-b last:border-none"
                    style={{ borderColor: "var(--dash-border)" }}
                  >
                    <td className="py-2 font-medium" style={{ color: "var(--dash-text-primary)" }}>
                      {item.product_name ?? item.product_id}
                    </td>
                    <td className="py-2" style={{ color: "var(--dash-text-secondary)" }}>{item.clicks}</td>
                    <td className="py-2" style={{ color: "var(--dash-text-secondary)" }}>{item.whatsapp_clicks}</td>
                    <td className="py-2 font-semibold" style={{ color: "var(--dash-text-primary)" }}>
                      {item.conversion_rate
                        ? `${Math.round(item.conversion_rate * 100)}%`
                        : "0%"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}