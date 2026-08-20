/**
 * Smart Search Match Utility (PlataformaShop)
 * Permite busca inteligente por nome, SKU, categoria e status semântico (esgotado, baixo, em estoque, promoção).
 */

export function smartSearchMatch(
  item: {
    name?: string;
    sku?: string | null;
    category?: string | null;
    category_name?: string | null;
    categoria?: string | null;
    categories?: { name?: string } | null;
    stock_quantity?: number | null;
    is_in_stock?: boolean | null;
    price?: number | null;
    compare_at_price?: number | null;
    promotional_price?: number | null;
    price_promotional?: number | null;
  },
  query: string,
  lowStockThreshold: number = 5
): boolean {
  if (!query || query.trim() === "") return true;

  // Remove caracteres especiais como colchetes [esgotado] -> esgotado
  const cleanedQuery = query.replace(/[\[\]]/g, "").trim().toLowerCase();
  if (!cleanedQuery) return true;

  const normalizedQuery = cleanedQuery.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 1. Busca Direta por Nome ou SKU
  const itemName = (item.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const itemSku = (item.sku || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  if (itemName.includes(normalizedQuery) || itemSku.includes(normalizedQuery)) {
    return true;
  }

  // 2. Busca Direta por Categoria
  const categoriesProp: any = item.categories;
  const categoriesName = Array.isArray(categoriesProp) ? categoriesProp[0]?.name : categoriesProp?.name;
  const categoryName = (
    item.category ||
    item.category_name ||
    item.categoria ||
    categoriesName ||
    ""
  ).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (categoryName && categoryName.includes(normalizedQuery)) {
    return true;
  }

  // 3. Status Semântico: Esgotado / Sem Estoque / Zerado
  const qty = item.stock_quantity ?? 0;
  const isOutOfStock = !item.is_in_stock || qty <= 0;
  const outOfStockTerms = [
    "esgotado", "esgotados", "esgotada", "esgotadas",
    "sem estoque", "semestoque", "zerado", "zerados", "zerada", "zeradas",
    "indisponivel", "indisponiveis", "acabou", "out of stock", "0"
  ];
  if (outOfStockTerms.some((term) => normalizedQuery === term || normalizedQuery.includes(term) || term.includes(normalizedQuery))) {
    return isOutOfStock;
  }

  // 4. Status Semântico: Estoque Baixo / Reposição
  const isLowStock = qty > 0 && qty <= lowStockThreshold;
  const lowStockTerms = ["baixo", "baixos", "estoque baixo", "reposicao", "alerta", "pouco", "critico"];
  if (lowStockTerms.some((term) => normalizedQuery === term || normalizedQuery.includes(term) || term.includes(normalizedQuery))) {
    return isLowStock;
  }

  // 5. Status Semântico: Em Estoque / Disponível / Ativo
  const isAvailable = (item.is_in_stock ?? true) && qty > 0;
  const availableTerms = ["em estoque", "emestoque", "disponivel", "disponiveis", "ativo", "ativos", "pronta entrega", "ok"];
  if (availableTerms.some((term) => normalizedQuery === term || normalizedQuery.includes(term) || term.includes(normalizedQuery))) {
    return isAvailable;
  }

  // 6. Status Semântico: Promoção / Oferta / Desconto
  const promoPrice = item.compare_at_price || item.promotional_price || item.price_promotional || 0;
  const isPromo = promoPrice > 0;
  const promoTerms = ["promocao", "promocoes", "oferta", "ofertas", "desconto", "descontos", "promo", "liquidação"];
  if (promoTerms.some((term) => normalizedQuery === term || normalizedQuery.includes(term) || term.includes(normalizedQuery))) {
    return isPromo;
  }

  return false;
}

export type AnalyticsQueryType = "out_of_stock" | "low_stock" | "categories" | "global_stock" | null;

export function detectAnalyticsQuery(query: string): AnalyticsQueryType {
  if (!query || query.trim() === "") return null;
  const cleanedQuery = query.replace(/[\[\]]/g, "").trim().toLowerCase();
  if (!cleanedQuery) return null;
  const normalizedQuery = cleanedQuery.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const outOfStockTerms = [
    "esgotado", "esgotados", "esgotada", "esgotadas",
    "sem estoque", "semestoque", "zerado", "zerados", "zerada", "zeradas",
    "indisponivel", "indisponiveis", "acabou", "out of stock"
  ];
  if (outOfStockTerms.some((term) => normalizedQuery === term || normalizedQuery.includes(term) || term.includes(normalizedQuery))) {
    return "out_of_stock";
  }

  const lowStockTerms = ["baixo", "baixos", "estoque baixo", "reposicao", "alerta", "pouco", "critico"];
  if (lowStockTerms.some((term) => normalizedQuery === term || normalizedQuery.includes(term) || term.includes(normalizedQuery))) {
    return "low_stock";
  }

  const categoryTerms = ["categoria", "categorias", "setor", "setores", "grupo", "grupos", "departamento"];
  if (categoryTerms.some((term) => normalizedQuery === term || normalizedQuery.includes(term) || term.includes(normalizedQuery))) {
    return "categories";
  }

  const globalStockTerms = ["total", "totais", "estoque total", "geral", "visão geral", "visao geral", "inventario", "inventário"];
  if (globalStockTerms.some((term) => normalizedQuery === term || normalizedQuery.includes(term) || term.includes(normalizedQuery))) {
    return "global_stock";
  }

  return null;
}
