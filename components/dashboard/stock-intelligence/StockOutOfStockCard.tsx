"use client";

import { PackageX } from "lucide-react";
import {
  AreaSparkline,
  BarSparkline,
  DonutSparkline,
} from "../home/DashboardKpiSparklines";
import type { ChartType } from "./StockTotalCard";

interface StockOutOfStockCardProps {
  outOfStockProducts: any[];
  chartType: ChartType;
  onSelectChartType: (type: ChartType) => void;
  onClick: () => void;
}

export default function StockOutOfStockCard({
  outOfStockProducts,
  chartType,
  onSelectChartType,
  onClick,
}: StockOutOfStockCardProps) {
  return (
    <div
      onClick={onClick}
      className="relative group overflow-hidden rounded-[27px] border border-rose-500/20 bg-rose-500/5 p-6 shadow-sm hover:border-rose-500/40 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-rose-500/10 p-2.5 text-rose-500 group-hover:scale-105 transition-transform">
            <PackageX size={20} />
          </div>
          <span className="text-xs font-bold text-rose-700 dark:text-rose-400">
            Esgotados
          </span>
        </div>

        <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
          <select
            value={chartType}
            onChange={(e) => onSelectChartType(e.target.value as ChartType)}
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

          if (chartType === "area") {
            return <AreaSparkline data={categoryData} color="amber" />;
          }
          if (chartType === "bar") {
            return <BarSparkline data={categoryData} />;
          }
          return <DonutSparkline segments={categoryData} size={54} />;
        })()}
      </div>
    </div>
  );
}
