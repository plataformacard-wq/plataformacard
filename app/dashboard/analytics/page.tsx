import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAnalyticsSummary } from "@/lib/dashboard/getAnalyticsSummary";
import { getTopProducts } from "@/lib/dashboard/getTopProducts";
import { getProductConversion } from "@/lib/dashboard/getProductConversion";
import AnalyticsControls from "@/components/dashboard/analytics/AnalyticsControls";
import PrintReportButton from "@/components/dashboard/analytics/PrintReportButton";

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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, organization_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    redirect("/entrar");
  }

  // Busca dados da organização para o relatório
  const { data: organization } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", profile.organization_id)
    .single();

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

  const [summary, topProducts, productConversion] = (await Promise.all([
    getAnalyticsSummary(profile.id, profile.organization_id, startDate, endDate),
    getTopProducts(profile.id, 5, profile.organization_id, startDate, endDate),
    getProductConversion(profile.id, profile.organization_id, startDate, endDate),
  ])) as [any, any, any[]];

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
            <p className="text-sm font-bold text-zinc-500 mt-1">{organization?.name || "PlataformaCard"}</p>
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
        <PrintReportButton />
      </div>

      <AnalyticsControls 
        organizationId={profile.organization_id} 
        profileId={profile.id} 
      />

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
                {productConversion.map((item) => (
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