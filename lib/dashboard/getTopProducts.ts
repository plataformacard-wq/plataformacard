import { createClient } from "@/lib/supabase/server";

type TopProduct = {
  productId: string;
  productName: string;
  clicks: number;
};

type TopProductRow = {
  product_id: string | null;
  product_name: string | null;
  clicks: number | string | null;
};

export async function getTopProducts(
  profileId: string,
  limit = 5,
  organizationId?: string | null
): Promise<TopProduct[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    organizationId ? "get_organization_top_products" : "get_top_products",
    organizationId 
      ? { p_org_id: organizationId, p_limit: limit }
      : { p_profile_id: profileId, p_limit: limit }
  );

  if (error) {
    throw new Error(
      [
        "Erro ao executar RPC get_top_products:",
        `message=${error.message ?? "sem message"}`,
        `details=${error.details ?? "sem details"}`,
        `hint=${error.hint ?? "sem hint"}`,
        `code=${error.code ?? "sem code"}`,
      ].join(" | ")
    );
  }

  const rows = (data ?? []) as TopProductRow[];

  return rows.map((row) => ({
    productId: row.product_id ?? "",
    productName: row.product_name ?? "Produto sem nome",
    clicks: Number(row.clicks ?? 0),
  }));
}