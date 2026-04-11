import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAnalyticsSummary } from "@/lib/dashboard/getAnalyticsSummary";
import { getTopProducts } from "@/lib/dashboard/getTopProducts";
import { getProductConversion } from "@/lib/dashboard/getProductConversion";

export const dynamic = "force-dynamic";

function pct(n: number, d: number) {
  if (!d || d <= 0) return "0%";
  return `${Math.round((n / d) * 100)}%`;
}

export default async function AnalyticsPage() {
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
  .select("id")
  .eq("user_id", user.id)
  .maybeSingle();

  if (profileError || !profile) {
    redirect("/entrar");
  }

  const [summary, topProducts, productConversion] = await Promise.all([
  getAnalyticsSummary(profile.id),
  getTopProducts(profile.id, 5),
  getProductConversion(profile.id),
]) as [any, any, any[]];

  const rateProfileToCatalog = pct(summary.catalogViews, summary.profileViews);
  const rateCatalogToProduct = pct(summary.productClicks, summary.catalogViews);
  const rateProductToConversation = pct(
    summary.conversationsStarted,
    summary.productClicks
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Analytics</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Métricas de visitas, cliques e conversões.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">
            Visitas no cartão
          </p>
          <p className="mt-3 text-3xl font-bold text-neutral-900">
            {summary.profileViews}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">
            Visitas no catálogo
          </p>
          <p className="mt-3 text-3xl font-bold text-neutral-900">
            {summary.catalogViews}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">
            Cliques em produto
          </p>
          <p className="mt-3 text-3xl font-bold text-neutral-900">
            {summary.productClicks}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">
            Conversas iniciadas
          </p>
          <p className="mt-3 text-3xl font-bold text-neutral-900">
            {summary.conversationsStarted}
          </p>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            Funil de conversão
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Entenda como as visitas se transformam em conversas.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 p-4">
            <p className="text-sm text-neutral-500">Cartão → Catálogo</p>
            <p className="mt-2 text-2xl font-bold text-neutral-900">
              {rateProfileToCatalog}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {summary.catalogViews} de {summary.profileViews}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 p-4">
            <p className="text-sm text-neutral-500">Catálogo → Produto</p>
            <p className="mt-2 text-2xl font-bold text-neutral-900">
              {rateCatalogToProduct}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {summary.productClicks} de {summary.catalogViews}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 p-4">
            <p className="text-sm text-neutral-500">Produto → Conversa</p>
            <p className="mt-2 text-2xl font-bold text-neutral-900">
              {rateProductToConversation}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {summary.conversationsStarted} de {summary.productClicks}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
  <div className="mb-4">
    <h2 className="text-lg font-semibold text-neutral-900">
      Conversão por produto
    </h2>
    <p className="mt-1 text-sm text-neutral-600">
      Taxa de conversão de interesse (WhatsApp) por produto.
    </p>
  </div>

  {productConversion.length === 0 ? (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-500">
      Ainda não há dados suficientes para análise de conversão.
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-neutral-500">
            <th className="py-2">Produto</th>
            <th className="py-2">Cliques</th>
            <th className="py-2">WhatsApp</th>
            <th className="py-2">Conversão</th>
          </tr>
        </thead>
        <tbody>
          {productConversion.map((item) => (
            <tr
              key={item.product_id}
              className="border-b last:border-none"
            >
              <td className="py-2 font-medium">
                {item.product_id}
              </td>
              <td className="py-2">{item.clicks}</td>
              <td className="py-2">{item.whatsapp_clicks}</td>
              <td className="py-2 font-semibold">
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