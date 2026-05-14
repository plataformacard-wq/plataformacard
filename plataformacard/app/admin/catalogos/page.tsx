import { createClient } from "@/lib/supabase/server";
import CatalogAnalysis from "./CatalogAnalysis";

export const dynamic = "force-dynamic";

export default async function CatalogAnalysisPage() {
  const supabase = await createClient();

  // 1. Total Products
  const { count: totalProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);

  // 2. Fetch Categories for aggregation
  const { data: allCategories } = await supabase
    .from("categories")
    .select("name");

  // 3. Aggregate Top Categories (by name)
  const categoryCounts: Record<string, number> = {};
  allCategories?.forEach(cat => {
    const name = cat.name.trim();
    categoryCounts[name] = (categoryCounts[name] || 0) + 1;
  });

  const topCategories = Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 4. Recent Products across all catalogs
  const { data: recentProducts } = await supabase
    .from("products")
    .select(`
      id,
      name,
      price,
      image_url,
      created_at,
      organizations (
        name
      )
    `)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(8);

  const stats = {
    totalProducts: totalProducts || 0,
    totalCategories: allCategories?.length || 0,
    topCategories,
    recentProducts: (recentProducts || []) as any[],
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--dash-text-primary)" }}>
          Análise de Catálogos
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--dash-text-secondary)" }}>
          Visão global do inventário de produtos e categorias cadastradas no SaaS.
        </p>
      </div>

      <CatalogAnalysis stats={stats} />
    </div>
  );
}