"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BarChart2, Package, AlertCircle } from "lucide-react";
import {
  AreaSparkline,
  BarSparkline,
  DonutSparkline,
  SparklinePoint,
  DonutSegment,
} from "./home/DashboardKpiSparklines";

interface TopCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: { name: string; total: number; outOfStock: number; percentage: number }[];
}

export default function TopCategoriesModal({
  isOpen,
  onClose,
  categories,
}: TopCategoriesModalProps) {
  const [modalChartType, setModalChartType] = useState<"donut" | "bar" | "area">("donut");
  const sorted = [...categories].sort((a, b) => b.total - a.total);
  const totalItems = sorted.reduce((sum, c) => sum + c.total, 0);
  const totalCategories = sorted.length;
  const categoriesWithOutOfStock = sorted.filter((c) => c.outOfStock > 0).length;

  const categoryColors = [
    "#7c3aed", // Roxo/Violete Intenso
    "#06b6d4", // Ciano/Teal Vibrante
    "#10b981", // Verde Esmeralda
    "#f59e0b", // Âmbar Ouro
    "#ec4899", // Rosa Magenta
    "#3b82f6", // Azul Royal
  ];

  const donutSegments: DonutSegment[] = sorted.slice(0, 6).map((c, i) => ({
    label: c.name,
    value: c.total,
    color: categoryColors[i % categoryColors.length],
  }));

  const barData: SparklinePoint[] = sorted.slice(0, 6).map((c, i) => ({
    label: c.name,
    value: c.total,
    color: categoryColors[i % categoryColors.length],
  }));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="categories-modal"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative flex flex-col w-full max-w-5xl max-h-[85vh] overflow-hidden rounded-[27px] bg-[var(--dash-surface)] shadow-2xl border border-[var(--dash-border)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--dash-border)] p-6 bg-[var(--dash-surface)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <BarChart2 size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--dash-text-primary)]">
                    Volumetria por Categoria
                  </h2>
                  <p className="text-xs text-[var(--dash-text-muted)] font-medium">
                    Distribuição e representatividade de produtos no catálogo
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-[var(--dash-text-muted)] hover:bg-[var(--dash-hover-bg)] hover:text-[var(--dash-text-primary)] transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Layout em 2 Colunas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
              {/* Coluna 1: Métricas de Distribuição & Gráfico (lg:col-span-5) */}
              <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-[var(--dash-border)] p-6 bg-[var(--dash-bg)]/40 flex flex-col justify-between space-y-5 overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                      Visão de Categorias
                    </span>

                    <select
                      value={modalChartType}
                      onChange={(e) => setModalChartType(e.target.value as "donut" | "bar" | "area")}
                      className="dash-select text-[10px] font-bold rounded-lg border border-purple-500/30 bg-[var(--dash-surface)] pl-2 pr-7 py-1 text-[var(--dash-text-primary)] outline-none cursor-pointer"
                    >
                      <option value="donut">🍩 Donut</option>
                      <option value="bar">📊 Barras</option>
                      <option value="area">📈 Onda</option>
                    </select>
                  </div>

                  {/* Gráfico do Modal */}
                  <div className="bg-[var(--dash-surface)] border border-purple-500/20 rounded-[27px] p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[var(--dash-text-muted)]">Proporção por Categoria</span>
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">Top Grupos</span>
                    </div>

                    <div className="h-28 w-full flex items-center justify-center pt-2">
                      {modalChartType === "donut" && (
                        <DonutSparkline segments={donutSegments} size={76} />
                      )}
                      {modalChartType === "bar" && (
                        <BarSparkline data={barData} height={80} width={240} />
                      )}
                      {modalChartType === "area" && (
                        <AreaSparkline data={barData} color="violet" height={80} width={240} />
                      )}
                    </div>

                    {/* Legenda com Alto Contraste */}
                    <div className="max-h-24 overflow-y-auto custom-scrollbar pt-2 border-t border-[var(--dash-border)] space-y-1">
                      {barData.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[10px] font-semibold text-[var(--dash-text-secondary)]">
                          <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: item.color }} />
                            <span className="truncate font-bold text-[var(--dash-text-primary)]">{item.label}</span>
                          </div>
                          <span className="font-extrabold" style={{ color: item.color }}>{item.value} {item.value === 1 ? "prod" : "prods"}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[27px] p-5 shadow-sm space-y-2">
                    <span className="text-xs font-semibold text-[var(--dash-text-muted)]">
                      Total de Categorias Ativas
                    </span>
                    <div className="text-3xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
                      {totalCategories} <span className="text-xs font-bold text-[var(--dash-text-muted)]">grupos</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-[var(--dash-border)] text-xs text-[var(--dash-text-secondary)]">
                      <span>Total de <strong className="text-[var(--dash-text-primary)]">{totalItems}</strong> produtos catalogados</span>
                    </div>
                  </div>

                  <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[27px] p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-[var(--dash-text-primary)]">
                      <span>Risco de Indisponibilidade</span>
                      <span className="text-rose-600 dark:text-rose-400 font-extrabold">{categoriesWithOutOfStock} / {totalCategories} com esgotados</span>
                    </div>
                    <p className="text-xs text-[var(--dash-text-secondary)]">
                      Categorias com itens esgotados podem ter redução na conversão de vendas.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-[27px] bg-purple-500/10 border border-purple-500/20 text-xs text-purple-700 dark:text-purple-300 font-semibold">
                  📊 <strong>Dica Visual:</strong> As cores vibrantes diferenciam a participação de cada categoria no inventário.
                </div>
              </div>

              {/* Coluna 2: Lista com Barras de Progresso de Alto Contraste (lg:col-span-7) */}
              <div className="lg:col-span-7 flex flex-col overflow-hidden bg-[var(--dash-surface)]">
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-3">
                  {sorted.length > 0 ? (
                    sorted.map((cat, idx) => {
                      const color = categoryColors[idx % categoryColors.length];
                      return (
                        <div
                          key={idx}
                          className="flex flex-col p-4 rounded-[27px] border border-[var(--dash-border)] bg-[var(--dash-bg)]/60 hover:bg-[var(--dash-hover-bg)] transition-colors space-y-2.5 shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 max-w-[240px]">
                              <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: color }} />
                              <span className="text-xs font-black text-[var(--dash-text-primary)] truncate">
                                {cat.name}
                              </span>
                            </div>
                            <span
                              className="text-[11px] font-extrabold px-3 py-0.5 rounded-full border shadow-2xs"
                              style={{
                                color: color,
                                backgroundColor: `${color}15`,
                                borderColor: `${color}30`,
                              }}
                            >
                              {cat.percentage.toFixed(1)}% do catálogo
                            </span>
                          </div>

                          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--dash-border)]/60 p-0.5">
                            <div
                              className="h-full transition-all rounded-full"
                              style={{ width: `${cat.percentage}%`, backgroundColor: color }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="font-extrabold text-[var(--dash-text-primary)]">
                              {cat.total} {cat.total === 1 ? "produto" : "produtos"}
                            </span>
                            {cat.outOfStock > 0 ? (
                              <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-500/15 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                                ⚠️ {cat.outOfStock} esgotado(s)
                              </span>
                            ) : (
                              <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                                ✓ 100% Disponível
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-[var(--dash-text-muted)] space-y-2">
                      <BarChart2 size={40} className="opacity-20" />
                      <p className="text-xs font-medium">Nenhuma categoria cadastrada.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

