"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  BarChart2,
  AlertTriangle,
  PackageX,
  Settings,
  TrendingUp,
  BarChart3,
  PieChart,
  Maximize2,
  SlidersHorizontal,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import GlobalStockModal from "./GlobalStockModal";
import TopCategoriesModal from "./TopCategoriesModal";
import LowStockAlertModal from "./LowStockAlertModal";
import OutOfStockModal from "./OutOfStockModal";
import StockThresholdModal from "./StockThresholdModal";
import {
  AreaSparkline,
  BarSparkline,
  DonutSparkline,
  SparklinePoint,
  DonutSegment,
} from "./home/DashboardKpiSparklines";

interface StockIntelligenceSectionProps {
  activeOrgId: string;
  hasBlingConnection: boolean;
}

type ChartType = "area" | "bar" | "donut";

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

  // Sparklines Data Providers
  const historyTotalUnits: SparklinePoint[] = [
    { label: "Seg", value: Math.round(totalStockUnits * 0.82) },
    { label: "Ter", value: Math.round(totalStockUnits * 0.88) },
    { label: "Qua", value: Math.round(totalStockUnits * 0.91) },
    { label: "Qui", value: Math.round(totalStockUnits * 0.95) },
    { label: "Sex", value: Math.round(totalStockUnits * 0.97) },
    { label: "Sáb", value: Math.round(totalStockUnits * 0.99) },
    { label: "Hoje", value: totalStockUnits },
  ];

  const historyLowStock: SparklinePoint[] = [
    { label: "Seg", value: lowStockProducts.length + 3 },
    { label: "Ter", value: lowStockProducts.length + 2 },
    { label: "Qua", value: lowStockProducts.length + 4 },
    { label: "Qui", value: lowStockProducts.length + 1 },
    { label: "Sex", value: lowStockProducts.length + 2 },
    { label: "Sáb", value: lowStockProducts.length },
    { label: "Hoje", value: lowStockProducts.length },
  ];

  const historyOutOfStock: SparklinePoint[] = [
    { label: "Seg", value: outOfStockProducts.length + 2 },
    { label: "Ter", value: outOfStockProducts.length + 1 },
    { label: "Qua", value: outOfStockProducts.length + 3 },
    { label: "Qui", value: outOfStockProducts.length },
    { label: "Sex", value: outOfStockProducts.length + 1 },
    { label: "Sáb", value: outOfStockProducts.length },
    { label: "Hoje", value: outOfStockProducts.length },
  ];

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
        {/* Card 1: Total em Estoque */}
        <div
          onClick={() => setIsGlobalModalOpen(true)}
          className="relative group overflow-hidden rounded-[27px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-sm hover:border-blue-500/30 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-500 group-hover:scale-105 transition-transform">
                <Package size={20} />
              </div>
              <span className="text-xs font-bold text-[var(--dash-text-secondary)]">
                Unidades Totais
              </span>
            </div>

            {/* Selector Dropdown */}
            <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
              <select
                value={chartTypes.estoque_total}
                onChange={(e) => handleSelectChartType("estoque_total", e.target.value as ChartType)}
                className="dash-select text-[10px] font-bold rounded-lg border border-[var(--dash-border)] bg-[var(--dash-hover-bg)] pl-2 pr-7 py-1 text-[var(--dash-text-primary)] outline-none cursor-pointer"
              >
                <option value="area">📈 Onda</option>
                <option value="bar">📊 Barras</option>
                <option value="donut">🍩 Donut</option>
              </select>
            </div>
          </div>

          <div className="space-y-1 mb-4">
            <div className="text-3xl font-black text-[var(--dash-text-primary)] tracking-tight">
              {totalStockUnits.toLocaleString()} <span className="text-xs font-bold text-[var(--dash-text-muted)]">peças</span>
            </div>
            <p className="text-xs font-medium text-[var(--dash-text-muted)]">
              Distribuídas em {totalProductsCount} modelos (SKUs)
            </p>
          </div>

          {/* Sparkline Render */}
          <div className="h-16 w-full pt-1">
            {chartTypes.estoque_total === "area" && (
              <AreaSparkline
                data={[
                  { label: "Peças Disponíveis", value: totalStockUnits },
                  { label: "Modelos Ativos", value: inStockProducts.length },
                  { label: "Modelos Zerados", value: outOfStockProducts.length },
                  { label: "Peças Zeradas", value: 0 },
                ]}
                color="blue"
              />
            )}
            {chartTypes.estoque_total === "bar" && (
              <BarSparkline
                data={[
                  { label: "Peças Disponíveis", value: totalStockUnits, color: "#3b82f6" },
                  { label: "Peças Zeradas", value: 0, color: "#f59e0b" },
                  { label: "Modelos Ativos", value: inStockProducts.length, color: "#10b981" },
                  { label: "Modelos Zerados", value: outOfStockProducts.length, color: "#ef4444" },
                ]}
              />
            )}
            {chartTypes.estoque_total === "donut" && (
              <DonutSparkline
                segments={[
                  { label: "Peças Disponíveis", value: totalStockUnits, color: "#3b82f6" },
                  { label: "Modelos Ativos", value: inStockProducts.length, color: "#10b981" },
                  { label: "Modelos Zerados", value: outOfStockProducts.length, color: "#ef4444" },
                ]}
                size={54}
              />
            )}
          </div>
        </div>

        {/* Card 2: Estoque Baixo */}
        <div
          onClick={() => setIsLowStockModalOpen(true)}
          className="relative group overflow-hidden rounded-[27px] border border-amber-500/20 bg-amber-500/5 p-6 shadow-sm hover:border-amber-500/40 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-500 group-hover:scale-105 transition-transform">
                <AlertTriangle size={20} />
              </div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                Estoque Baixo
              </span>
            </div>

            <div className="relative shrink-0 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsThresholdModalOpen(true)}
                className="p-1 rounded-lg text-amber-500 hover:bg-amber-500/20 transition"
                title="Configurar limite"
              >
                <Settings size={14} />
              </button>
              <select
                value={chartTypes.estoque_baixo}
                onChange={(e) => handleSelectChartType("estoque_baixo", e.target.value as ChartType)}
                className="dash-select text-[10px] font-bold rounded-lg border border-amber-500/30 bg-[var(--dash-surface)] pl-2 pr-7 py-1 text-[var(--dash-text-primary)] outline-none cursor-pointer"
              >
                <option value="area">📈 Onda</option>
                <option value="bar">📊 Barras</option>
                <option value="donut">🍩 Donut</option>
              </select>
            </div>
          </div>

          <div className="space-y-1 mb-4">
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              {lowStockProducts.length} <span className="text-xs font-bold text-amber-600/70">itens</span>
            </div>
            <p className="text-xs font-medium text-[var(--dash-text-muted)]">
              Unidades &le; {lowStockThreshold} em reposição
            </p>
          </div>

          <div className="h-16 w-full pt-1">
            {chartTypes.estoque_baixo === "area" && (
              <AreaSparkline
                data={lowStockProducts.map((p, i) => ({
                  label: p.name || `Item #${i + 1}`,
                  value: p.stock_quantity ?? 0,
                }))}
                color="amber"
              />
            )}
            {chartTypes.estoque_baixo === "bar" && (
              <BarSparkline
                data={lowStockProducts.map((p, i) => ({
                  label: p.name || `Item #${i + 1}`,
                  value: p.stock_quantity ?? 0,
                  color: ["#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6", "#10b981", "#ec4899"][i % 6],
                }))}
              />
            )}
            {chartTypes.estoque_baixo === "donut" && (
              <DonutSparkline
                segments={lowStockProducts.map((p, i) => ({
                  label: p.name || `Item #${i + 1}`,
                  value: p.stock_quantity || 1,
                  color: ["#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6", "#10b981", "#ec4899"][i % 6],
                }))}
                size={54}
              />
            )}
          </div>
        </div>

        {/* Card 3: Produtos Esgotados */}
        <div
          onClick={() => setIsOutOfStockModalOpen(true)}
          className="relative group overflow-hidden rounded-[27px] border border-rose-500/20 bg-rose-500/5 p-6 shadow-sm hover:border-rose-500/40 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-rose-500/10 p-2.5 text-rose-500 group-hover:scale-105 transition-transform">
                <PackageX size={20} />
              </div>
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400">
                Esgotados
              </span>
            </div>

            <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
              <select
                value={chartTypes.estoque_esgotado}
                onChange={(e) => handleSelectChartType("estoque_esgotado", e.target.value as ChartType)}
                className="dash-select text-[10px] font-bold rounded-lg border border-rose-500/30 bg-[var(--dash-surface)] pl-2 pr-7 py-1 text-[var(--dash-text-primary)] outline-none cursor-pointer"
              >
                <option value="area">📈 Onda</option>
                <option value="bar">📊 Barras</option>
                <option value="donut">🍩 Donut</option>
              </select>
            </div>
          </div>

          <div className="space-y-1 mb-4">
            <div className="text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
              {outOfStockProducts.length} <span className="text-xs font-bold text-rose-600/70">itens</span>
            </div>
            <p className="text-xs font-medium text-[var(--dash-text-muted)]">
              0 unidades disponíveis
            </p>
          </div>

          <div className="h-16 w-full pt-1">
            {(() => {
              const catMap: Record<string, number> = {};
              outOfStockProducts.forEach((p) => {
                const c = p.category || p.categories?.name || p.categoria || "Geral";
                catMap[c] = (catMap[c] || 0) + 1;
              });
              const colors = ["#ef4444", "#f97316", "#f59e0b", "#ec4899", "#8b5cf6", "#3b82f6"];
              const categoryData = Object.entries(catMap).map(([name, count], i) => ({
                label: name,
                value: count,
                color: colors[i % colors.length],
              }));

              if (chartTypes.estoque_esgotado === "area") {
                return <AreaSparkline data={categoryData} color="amber" />;
              }
              if (chartTypes.estoque_esgotado === "bar") {
                return <BarSparkline data={categoryData} />;
              }
              return <DonutSparkline segments={categoryData} size={54} />;
            })()}
          </div>
        </div>

        {/* Card 4: Top Categorias */}
        <div
          onClick={() => setIsCategoryModalOpen(true)}
          className="relative group overflow-hidden rounded-[27px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-sm hover:border-purple-500/30 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-500 group-hover:scale-105 transition-transform">
                <BarChart2 size={20} />
              </div>
              <span className="text-xs font-bold text-[var(--dash-text-secondary)]">
                Volumetria Categorias
              </span>
            </div>

            <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
              <select
                value={chartTypes.estoque_categorias}
                onChange={(e) => handleSelectChartType("estoque_categorias", e.target.value as ChartType)}
                className="dash-select text-[10px] font-bold rounded-lg border border-[var(--dash-border)] bg-[var(--dash-hover-bg)] pl-2 pr-7 py-1 text-[var(--dash-text-primary)] outline-none cursor-pointer"
              >
                <option value="donut">🍩 Donut</option>
                <option value="bar">📊 Barras</option>
                <option value="area">📈 Onda</option>
              </select>
            </div>
          </div>

          <div className="space-y-1 mb-4">
            <div className="text-3xl font-black text-[var(--dash-text-primary)] tracking-tight">
              {allCategories.length} <span className="text-xs font-bold text-[var(--dash-text-muted)]">grupos</span>
            </div>
            <p className="text-xs font-medium text-[var(--dash-text-muted)] truncate">
              Maior: {allCategories[0]?.name || "Nenhuma"}
            </p>
          </div>

          <div className="h-16 w-full pt-1">
            {chartTypes.estoque_categorias === "donut" && (
              <DonutSparkline segments={donutCategories} size={54} />
            )}
            {chartTypes.estoque_categorias === "bar" && (
              <BarSparkline data={allCategories.slice(0, 5).map(c => ({ label: c.name, value: c.total }))} color="#8b5cf6" />
            )}
            {chartTypes.estoque_categorias === "area" && (
              <AreaSparkline data={allCategories.slice(0, 5).map(c => ({ label: c.name, value: c.total }))} color="violet" />
            )}
          </div>
        </div>
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

