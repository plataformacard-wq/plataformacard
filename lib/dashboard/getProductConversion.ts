import { createClient } from "@/lib/supabase/server";

export async function getProductConversion(
  profileId: string,
  organizationId?: string | null
) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    organizationId ? "get_organization_product_conversion" : "get_product_conversion",
    organizationId ? { input_org_id: organizationId } : { input_profile_id: profileId }
  );

  if (error) {
    console.error("Erro ao buscar conversão:", error);
    return [];
  }

  if (!data || data.length === 0) return [];

  // Busca nomes dos produtos para substituir os UUIDs na tabela de analytics
  const productIds = (data as Array<{ product_id: string }>)
    .map((row) => row.product_id)
    .filter(Boolean);

  const { data: productsData } = await supabase
    .from("products")
    .select("id, name")
    .in("id", productIds);

  const productNameMap = new Map(
    (productsData ?? []).map((p: { id: string; name: string }) => [p.id, p.name])
  );

  return (data as Array<{ product_id: string } & Record<string, unknown>>).map((row) => ({
    ...row,
    product_name: productNameMap.get(row.product_id) ?? "Produto desconhecido",
  }));
}