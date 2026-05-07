import { createClient } from "@/lib/supabase/server";

type AnalyticsSummary = {
  profileViews: number;
  catalogViews: number;
  productClicks: number;
  conversationsStarted: number;
};

type AnalyticsSummaryRow = {
  profile_views: number | string | null;
  catalog_views: number | string | null;
  product_clicks: number | string | null;
  conversations_started: number | string | null;
};

export async function getAnalyticsSummary(
  profileId: string,
  organizationId?: string | null
): Promise<AnalyticsSummary> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    organizationId ? "get_organization_analytics_summary" : "get_profile_analytics_summary",
    organizationId ? { p_org_id: organizationId } : { p_profile_id: profileId }
  );

  if (error) {
    throw new Error(
      [
        "Erro ao executar RPC get_profile_analytics_summary:",
        `message=${error.message ?? "sem message"}`,
        `details=${error.details ?? "sem details"}`,
        `hint=${error.hint ?? "sem hint"}`,
        `code=${error.code ?? "sem code"}`,
      ].join(" | ")
    );
  }

  const row = (Array.isArray(data) ? data[0] : data) as
    | AnalyticsSummaryRow
    | null
    | undefined;

  return {
    profileViews: Number(row?.profile_views ?? 0),
    catalogViews: Number(row?.catalog_views ?? 0),
    productClicks: Number(row?.product_clicks ?? 0),
    conversationsStarted: Number(row?.conversations_started ?? 0),
  };
}