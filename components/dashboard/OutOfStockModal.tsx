"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PackageX, Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  AreaSparkline,
  BarSparkline,
  DonutSparkline,
  SparklinePoint,
  DonutSegment,
} from "./home/DashboardKpiSparklines";

interface OutOfStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: any[];
  onStockUpdated: (productId: string, newStock: number) => void;
}

export default function OutOfStockModal({
  isOpen,
  onClose,
  products,
  onStockUpdated,
}: OutOfStockModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [modalChartType, setModalChartType] = useState<"area" | "bar" | "donut">("area");
  const supabase = createClient();

  const categoryColors = [
    "#ef4444", // Vermelho
    "#f97316", // Laranja
    "#f59e0b", // Âmbar
    "#8b5cf6", // Roxo
    "#ec4899", // Rosa
    "#3b82f6", // Azul
    "#14b8a6", // Teal
  ];

  // Agrupamento de Esgotados por Categoria
  const categoryMap: Record<string, number> = {};
  products.forEach((p) => {
    const catName = p.category || p.categories?.name || p.categoria || "Geral";
    categoryMap[catName] = (categoryMap[catName] || 0) + 1;
  });

  const categoryBarsData: SparklinePoint[] = Object.entries(categoryMap).map(
    ([catName, count], idx) => ({
      label: catName,
      value: count,
      color: categoryColors[idx % categoryColors.length],
    })
  );

  const donutSegments: DonutSegment[] = categoryBarsData.map((item) => ({
    label: item.label,
    value: item.value,
    color: item.color || "#ef4444",
  }));

  const handleQuickAdd = async (p: any, addAmount: number) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("products")
        .update({ stock_quantity: addAmount, is_in_stock: true })
        .eq("id", p.id);
      if (error) throw error;
      onStockUpdated(p.id, addAmount);
    } catch (err) {
      console.error(err);
      alert("Erro ao reativar estoque.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (p: any) => {
    const val = parseInt(editValue, 10);
    if (isNaN(val) || val < 0) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("products")
        .update({ stock_quantity: val, is_in_stock: val > 0 })
        .eq("id", p.id);
      if (error) throw error;
      onStockUpdated(p.id, val);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar estoque.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="out-of-stock-modal"
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
            className="relative flex flex-col w-full max-w-5xl max-h-[85vh] overflow-hidden rounded-[27px] bg-[var(--dash-surface)] shadow-2xl border border-rose-500/30"
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-[var(--dash-border)] p-6 bg-rose-500/5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                  <PackageX size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-rose-700 dark:text-rose-400">
                    Produtos Esgotados
                  </h2>
                  <p className="text-xs text-rose-600/80 dark:text-rose-400/80 font-medium">
                    Itens sem unidades disponíveis para venda imediata
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
              {/* Coluna 1: Diagnóstico do Impacto & Gráfico (lg:col-span-5) */}
              <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-[var(--dash-border)] p-6 bg-[var(--dash-bg)]/40 flex flex-col justify-between space-y-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                      Impacto Comercial
                    </span>

                    <select
                      value={modalChartType}
                      onChange={(e) => setModalChartType(e.target.value as "area" | "bar" | "donut")}
                      className="dash-select text-[10px] font-bold rounded-lg border border-rose-500/30 bg-[var(--dash-surface)] pl-2 pr-7 py-1 text-[var(--dash-text-primary)] outline-none cursor-pointer"
                    >
                      <option value="area">📈 Onda</option>
                      <option value="bar">📊 Barras</option>
                      <option value="donut">🍩 Donut</option>
                    </select>
                  </div>

                  {/* Gráfico do Modal */}
                  <div className="bg-[var(--dash-surface)] border border-rose-500/20 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[var(--dash-text-muted)]">Esgotados por Categoria</span>
                      <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md">{categoryBarsData.length} Setores</span>
                    </div>

                    <div className="h-28 w-full flex items-center justify-center pt-2">
                      {modalChartType === "area" && (
                        <AreaSparkline data={categoryBarsData} color="amber" height={80} width={240} />
                      )}
                      {modalChartType === "bar" && (
                        <BarSparkline data={categoryBarsData} height={80} width={240} />
                      )}
                      {modalChartType === "donut" && (
                        <DonutSparkline segments={donutSegments} size={76} />
                      )}
                    </div>

                    {/* Legenda das Categorias Esgotadas */}
                    <div className="max-h-24 overflow-y-auto custom-scrollbar pt-2 border-t border-[var(--dash-border)] space-y-1">
                      {categoryBarsData.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[10px] font-semibold text-[var(--dash-text-secondary)]">
                          <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <span className="font-bold text-rose-500">{item.value} {item.value === 1 ? "item" : "itens"}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[var(--dash-surface)] border border-rose-500/20 rounded-2xl p-5 shadow-sm space-y-2">
                    <span className="text-xs font-semibold text-[var(--dash-text-muted)]">
                      Total Zerado
                    </span>
                    <div className="text-3xl font-black text-rose-500 tracking-tight">
                      {products.length} <span className="text-xs font-bold text-[var(--dash-text-muted)]">produtos esgotados</span>
                    </div>
                    <p className="text-xs text-[var(--dash-text-secondary)] pt-1">
                      Estes itens não podem receber pedidos via carrinho ou WhatsApp até a reposição.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  🚫 <strong>Vendas Bloqueadas:</strong> Produtos zerados perdem relevância de busca interna.
                </div>
              </div>

              {/* Coluna 2: Tabela de Reativação Rápida (lg:col-span-7) */}
              <div className="lg:col-span-7 flex flex-col overflow-hidden bg-[var(--dash-surface)]">
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-3">
                  {products.length > 0 ? (
                    products.map((p) => {
                      const isEditing = editingId === p.id;

                      return (
                        <div
                          key={p.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-rose-500/15 bg-rose-500/5 hover:border-rose-500/30 transition-all gap-3"
                        >
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-xs font-bold text-[var(--dash-text-primary)] truncate" title={p.name}>
                              {p.name}
                            </span>
                            {p.sku && (
                              <span className="text-[10px] font-mono text-[var(--dash-text-muted)] mt-0.5">
                                SKU: {p.sku}
                              </span>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                                0 unidades
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min="1"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-16 rounded-lg border border-rose-500 bg-[var(--dash-surface)] px-2 py-1 text-xs font-bold text-[var(--dash-text-primary)] outline-none"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSave(p)}
                                  disabled={isSaving}
                                  className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition disabled:opacity-50"
                                >
                                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  disabled={isSaving}
                                  className="p-1.5 rounded-lg bg-[var(--dash-hover-bg)] text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)] transition"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleQuickAdd(p, 1)}
                                  className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition"
                                  title="Repor +1 unidade"
                                >
                                  +1
                                </button>
                                <button
                                  onClick={() => handleQuickAdd(p, 5)}
                                  className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition"
                                  title="Repor +5 unidades"
                                >
                                  +5
                                </button>
                                <button
                                  onClick={() => handleQuickAdd(p, 10)}
                                  className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition"
                                  title="Repor +10 unidades"
                                >
                                  +10
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingId(p.id);
                                    setEditValue("1");
                                  }}
                                  className="text-[11px] font-bold px-3 py-1 rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] text-[var(--dash-text-primary)] hover:border-rose-500/50 hover:text-rose-500 transition shadow-sm ml-1"
                                >
                                  Ajustar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-[var(--dash-text-muted)] space-y-2">
                      <PackageX size={40} className="opacity-20 text-emerald-500" />
                      <p className="text-xs font-medium">Nenhum produto esgotado! Excelente gestão de estoque.</p>
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
