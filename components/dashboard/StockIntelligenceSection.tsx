"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import GlobalStockModal from "./GlobalStockModal";
import TopCategoriesModal from "./TopCategoriesModal";
import LowStockAlertModal from "./LowStockAlertModal";
import OutOfStockModal from "./OutOfStockModal";
import StockThresholdModal from "./StockThresholdModal";
import StockTotalCard, { ChartType } from "./stock-intelligence/StockTotalCard";
import StockLowCard from "./stock-intelligence/StockLowCard";
import StockOutOfStockCard from "./stock-intelligence/StockOutOfStockCard";
import StockCategoriesCard from "./stock-intelligence/StockCategoriesCard";
import { DonutSegment } from "./home/DashboardKpiSparklines";

interface StockIntelligenceSectionProps {
  activeOrgId: string;
  hasBlingConnection: boolean;
}

export default function StockIntelligenceSection({
  activeOrgId,
  hasBlingConnection,
}: StockIntelligenceSectionProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);

  // Modais
  const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);
  const [isOutOfStockModalOpen, setIsOutOfStockModalOpen] = useState(false);
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);

  // Seletores de Tipo de Gráfico por Cartão
  const [chartTypes, setChartTypes] = useState<Record<string, ChartType>>({
    estoque_total: "donut",
    estoque_baixo: "bar",
    estoque_esgotado: "area",
    estoque_categorias: "donut",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("dash_estoque_chart_types");
        if (saved) {
          setChartTypes((prev) => ({ ...prev, ...JSON.parse(saved) }));
        }
      } catch (err) {
        console.error("Erro ao carregar tipos de gráfico do localStorage", err);
      }
    }
  }, []);

  const handleSelectChartType = (metricId: string, type: ChartType) => {
    const updated = { ...chartTypes, [metricId]: type };
    setChartTypes(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("dash_estoque_chart_types", JSON.stringify(updated));
      } catch (err) {
        console.error("Erro ao salvar tipo de gráfico no localStorage", err);
      }
    }
  };

  useEffect(() => {
    if (!activeOrgId) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrgId]);

  const loadData = async () => {
    setLoading(true);
    const { data: org } = await supabase
      .from("organizations")
      .select("low_stock_threshold")
      .eq("id", activeOrgId)
      .maybeSingle();

    if (org?.low_stock_threshold !== undefined && org?.low_stock_threshold !== null) {
      setLowStockThreshold(org.low_stock_threshold);
    }

    const { data: products } = await supabase
      .from("products")
      .select("id, name, sku, is_in_stock, stock_quantity, categories(name)")
      .eq("organization_id", activeOrgId)
      .is("deleted_at", null);

    if (products) {
      setAllProducts(products);
    }
    setLoading(false);
  };

  const handleStockUpdated = (productId: string, newStock: number) => {
    setAllProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, stock_quantity: newStock, is_in_stock: newStock > 0 }
          : p
      )
    );
  };

  // Computações analíticas de estoque
  const totalProductsCount = allProducts.length;
  const totalStockUnits = allProducts.reduce((sum, p) => sum + (p.stock_quantity || 0), 0);
  const inStockProducts = allProducts.filter(
    (p) => p.is_in_stock || (p.stock_quantity && p.stock_quantity > 0)
  );
  const outOfStockProducts = allProducts.filter(
    (p) => !p.is_in_stock || (p.stock_quantity ?? 0) === 0
  );
  const lowStockProducts = allProducts.filter(
    (p) => p.stock_quantity !== null && p.stock_quantity > 0 && p.stock_quantity <= lowStockThreshold
  );

  // Mapeamento por categoria
  const catMap: Record<string, { total: number; outOfStock: number }> = {};
  allProducts.forEach((p) => {
    const catObj = Array.isArray(p.categories) ? p.categories[0] : p.categories;
    const catName = catObj?.name || "Sem Categoria";
    if (!catMap[catName]) catMap[catName] = { total: 0, outOfStock: 0 };
    catMap[catName].total++;
    if (!p.is_in_stock || (p.stock_quantity ?? 0) === 0) {
      catMap[catName].outOfStock++;
    }
  });

  const allCategories = Object.keys(catMap).map((k) => ({
    name: k,
    total: catMap[k].total,
    outOfStock: catMap[k].outOfStock,
    percentage: totalProductsCount > 0 ? (catMap[k].total / totalProductsCount) * 100 : 0,
  }));

  const donutCategories: DonutSegment[] = allCategories.slice(0, 4).map((c, i) => {
    const colors = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
    return { label: c.name, value: c.total, color: colors[i % colors.length] };
  });

  if (loading) {
    return (
      <div className="mt-10 mb-10 h-32 flex items-center justify-center text-xs font-semibold text-[var(--dash-text-muted)] animate-pulse">
        Carregando analítico de estoque...
      </div>
    );
  }

  return (
    <>
      <div className="mt-10 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black text-[var(--dash-text-primary)]">
            Analítico de Estoque
          </h2>
          <span
            className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
              hasBlingConnection
                ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                : "text-blue-500 bg-blue-500/10 border-blue-500/20"
            }`}
          >
            {hasBlingConnection ? "Sincronizado Bling" : "Estoque Manual Supabase"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StockTotalCard
          totalStockUnits={totalStockUnits}
          totalProductsCount={totalProductsCount}
          inStockProductsCount={inStockProducts.length}
          outOfStockProductsCount={outOfStockProducts.length}
          chartType={chartTypes.estoque_total}
          onSelectChartType={(type) => handleSelectChartType("estoque_total", type)}
          onClick={() => setIsGlobalModalOpen(true)}
        />

        <StockLowCard
          lowStockProducts={lowStockProducts}
          lowStockThreshold={lowStockThreshold}
          chartType={chartTypes.estoque_baixo}
          onSelectChartType={(type) => handleSelectChartType("estoque_baixo", type)}
          onClick={() => setIsLowStockModalOpen(true)}
          onOpenThresholdModal={() => setIsThresholdModalOpen(true)}
        />

        <StockOutOfStockCard
          outOfStockProducts={outOfStockProducts}
          chartType={chartTypes.estoque_esgotado}
          onSelectChartType={(type) => handleSelectChartType("estoque_esgotado", type)}
          onClick={() => setIsOutOfStockModalOpen(true)}
        />

        <StockCategoriesCard
          allCategories={allCategories}
          donutCategories={donutCategories}
          chartType={chartTypes.estoque_categorias}
          onSelectChartType={(type) => handleSelectChartType("estoque_categorias", type)}
          onClick={() => setIsCategoryModalOpen(true)}
        />
      </div>

      {/* Modais Detalhados */}
      <GlobalStockModal
        isOpen={isGlobalModalOpen}
        onClose={() => setIsGlobalModalOpen(false)}
        products={allProducts}
        onStockUpdated={handleStockUpdated}
      />
      <TopCategoriesModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={allCategories}
      />
      <LowStockAlertModal
        isOpen={isLowStockModalOpen}
        onClose={() => setIsLowStockModalOpen(false)}
        products={lowStockProducts}
        threshold={lowStockThreshold}
        onStockUpdated={handleStockUpdated}
      />
      <OutOfStockModal
        isOpen={isOutOfStockModalOpen}
        onClose={() => setIsOutOfStockModalOpen(false)}
        products={outOfStockProducts}
        onStockUpdated={handleStockUpdated}
      />
      <StockThresholdModal
        isOpen={isThresholdModalOpen}
        onClose={() => setIsThresholdModalOpen(false)}
        orgId={activeOrgId}
        currentThreshold={lowStockThreshold}
        onSaved={setLowStockThreshold}
      />
    </>
  );
}
