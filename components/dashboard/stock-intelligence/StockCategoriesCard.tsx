"use client";

import { BarChart2 } from "lucide-react";
import {
  AreaSparkline,
  BarSparkline,
  DonutSparkline,
  DonutSegment,
} from "../home/DashboardKpiSparklines";
import type { ChartType } from "./StockTotalCard";

interface StockCategoriesCardProps {
  allCategories: Array<{ name: string; total: number; outOfStock: number; percentage: number }>;
  donutCategories: DonutSegment[];
  chartType: ChartType;
  onSelectChartType: (type: ChartType) => void;
  onClick: () => void;
}

export default function StockCategoriesCard({
  allCategories,
  donutCategories,
  chartType,
  onSelectChartType,
  onClick,
}: StockCategoriesCardProps) {
  return (
    <div
      onClick={onClick}
      className="relative group overflow-hidden rounded-[27px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-sm hover:border-purple-500/30 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-purple-500/10 p-2.5 text-purple-500 group-hover:scale-105 transition-transform">
            <BarChart2 size={20} />
          </div>
          <span className="text-xs font-bold text-[var(--dash-text-secondary)]">
            Volumetria Categorias
          </span>
        </div>

        <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
          <select
            value={chartType}
            onChange={(e) => onSelectChartType(e.target.value as ChartType)}
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
        {chartType === "donut" && (
          <DonutSparkline segments={donutCategories} size={54} />
        )}
        {chartType === "bar" && (
          <BarSparkline data={allCategories.slice(0, 5).map(c => ({ label: c.name, value: c.total }))} color="#8b5cf6" />
        )}
        {chartType === "area" && (
          <AreaSparkline data={allCategories.slice(0, 5).map(c => ({ label: c.name, value: c.total }))} color="violet" />
        )}
      </div>
    </div>
  );
}
