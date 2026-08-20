"use client";

import { AlertTriangle, Settings } from "lucide-react";
import {
  AreaSparkline,
  BarSparkline,
  DonutSparkline,
} from "../home/DashboardKpiSparklines";
import type { ChartType } from "./StockTotalCard";

interface StockLowCardProps {
  lowStockProducts: any[];
  lowStockThreshold: number;
  chartType: ChartType;
  onSelectChartType: (type: ChartType) => void;
  onClick: () => void;
  onOpenThresholdModal: () => void;
}

export default function StockLowCard({
  lowStockProducts,
  lowStockThreshold,
  chartType,
  onSelectChartType,
  onClick,
  onOpenThresholdModal,
}: StockLowCardProps) {
  return (
    <div
      onClick={onClick}
      className="relative group overflow-hidden rounded-[27px] border border-amber-500/20 bg-amber-500/5 p-6 shadow-sm hover:border-amber-500/40 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-500 group-hover:scale-105 transition-transform">
            <AlertTriangle size={20} />
          </div>
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
            Estoque Baixo
          </span>
        </div>

        <div className="relative shrink-0 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onOpenThresholdModal}
            className="p-1 rounded-lg text-amber-500 hover:bg-amber-500/20 transition"
            title="Configurar limite"
          >
            <Settings size={14} />
          </button>
          <select
            value={chartType}
            onChange={(e) => onSelectChartType(e.target.value as ChartType)}
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
        {chartType === "area" && (
          <AreaSparkline
            data={lowStockProducts.map((p, i) => ({
              label: p.name || `Item #${i + 1}`,
              value: p.stock_quantity ?? 0,
            }))}
            color="amber"
          />
        )}
        {chartType === "bar" && (
          <BarSparkline
            data={lowStockProducts.map((p, i) => ({
              label: p.name || `Item #${i + 1}`,
              value: p.stock_quantity ?? 0,
              color: ["#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6", "#10b981", "#ec4899"][i % 6],
            }))}
          />
        )}
        {chartType === "donut" && (
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
  );
}
