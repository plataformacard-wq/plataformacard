"use client";

import { Package } from "lucide-react";
import {
  AreaSparkline,
  BarSparkline,
  DonutSparkline,
} from "../home/DashboardKpiSparklines";

export type ChartType = "area" | "bar" | "donut";

interface StockTotalCardProps {
  totalStockUnits: number;
  totalProductsCount: number;
  inStockProductsCount: number;
  outOfStockProductsCount: number;
  chartType: ChartType;
  onSelectChartType: (type: ChartType) => void;
  onClick: () => void;
}

export default function StockTotalCard({
  totalStockUnits,
  totalProductsCount,
  inStockProductsCount,
  outOfStockProductsCount,
  chartType,
  onSelectChartType,
  onClick,
}: StockTotalCardProps) {
  return (
    <div
      onClick={onClick}
      className="relative group overflow-hidden rounded-[27px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-sm hover:border-blue-500/30 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-blue-500/10 p-2.5 text-blue-500 group-hover:scale-105 transition-transform">
            <Package size={20} />
          </div>
          <span className="text-xs font-bold text-[var(--dash-text-secondary)]">
            Unidades Totais
          </span>
        </div>

        {/* Selector Dropdown */}
        <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
          <select
            value={chartType}
            onChange={(e) => onSelectChartType(e.target.value as ChartType)}
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
        {chartType === "area" && (
          <AreaSparkline
            data={[
              { label: "Peças Disponíveis", value: totalStockUnits },
              { label: "Modelos Ativos", value: inStockProductsCount },
              { label: "Modelos Zerados", value: outOfStockProductsCount },
              { label: "Peças Zeradas", value: 0 },
            ]}
            color="blue"
          />
        )}
        {chartType === "bar" && (
          <BarSparkline
            data={[
              { label: "Peças Disponíveis", value: totalStockUnits, color: "#3b82f6" },
              { label: "Peças Zeradas", value: 0, color: "#f59e0b" },
              { label: "Modelos Ativos", value: inStockProductsCount, color: "#10b981" },
              { label: "Modelos Zerados", value: outOfStockProductsCount, color: "#ef4444" },
            ]}
          />
        )}
        {chartType === "donut" && (
          <DonutSparkline
            segments={[
              { label: "Peças Disponíveis", value: totalStockUnits, color: "#3b82f6" },
              { label: "Modelos Ativos", value: inStockProductsCount, color: "#10b981" },
              { label: "Modelos Zerados", value: outOfStockProductsCount, color: "#ef4444" },
            ]}
            size={54}
          />
        )}
      </div>
    </div>
  );
}
