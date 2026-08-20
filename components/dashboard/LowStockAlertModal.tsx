"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Check, Loader2, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  AreaSparkline,
  BarSparkline,
  DonutSparkline,
  SparklinePoint,
  DonutSegment,
} from "./home/DashboardKpiSparklines";

interface LowStockAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: any[];
  threshold?: number;
  onStockUpdated: (productId: string, newStock: number) => void;
}

export default function LowStockAlertModal({
  isOpen,
  onClose,
  products,
  threshold = 5,
  onStockUpdated,
}: LowStockAlertModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [modalChartType, setModalChartType] = useState<"area" | "bar" | "donut">("bar");
  const supabase = createClient();

  const itemColors = [
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#8b5cf6", // Purple
    "#3b82f6", // Blue
    "#10b981", // Emerald
    "#ec4899", // Pink
    "#f97316", // Orange
    "#06b6d4", // Cyan
  ];

  const itemBarsData: SparklinePoint[] = products.map((p, i) => ({
    label: p.name || `SKU #${i + 1}`,
    value: p.stock_quantity ?? 0,
    color: itemColors[i % itemColors.length],
  }));

  const donutSegments: DonutSegment[] = itemBarsData.map((item) => ({
    label: item.label,
    value: item.value > 0 ? item.value : 1,
    color: item.color || "#f59e0b",
  }));

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setEditValue(p.stock_quantity?.toString() || "0");
  };

  const handleQuickAdd = async (p: any, addAmount: number) => {
    const currentStock = p.stock_quantity ?? 0;
    const newVal = currentStock + addAmount;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("products")
        .update({ stock_quantity: newVal, is_in_stock: true })
        .eq("id", p.id);
      if (error) throw error;
      onStockUpdated(p.id, newVal);
    } catch (err) {
      console.error(err);
      alert("Erro ao adicionar unidades de estoque.");
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
          key="alert-modal"
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
            className="relative flex flex-col w-full max-w-5xl max-h-[85vh] overflow-hidden rounded-[27px] bg-[var(--dash-surface)] shadow-2xl border border-red-500/30"
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-[var(--dash-border)] p-6 bg-red-500/5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-700 dark:text-red-400">
                    Alerta de Reposição Crítica
                  </h2>
                  <p className="text-xs text-red-600/80 dark:text-red-400/80 font-medium">
                    Produtos com unidades menores ou iguais a {threshold} peças
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
              {/* Coluna 1: Diagnóstico de Risco & Gráfico (lg:col-span-5) */}
              <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-[var(--dash-border)] p-6 bg-[var(--dash-bg)]/40 flex flex-col justify-between space-y-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-red-500 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                      Nível de Urgência
                    </span>

                    <select
                      value={modalChartType}
                      onChange={(e) => setModalChartType(e.target.value as "area" | "bar" | "donut")}
                      className="dash-select text-[10px] font-bold rounded-lg border border-amber-500/30 bg-[var(--dash-surface)] pl-2 pr-7 py-1 text-[var(--dash-text-primary)] outline-none cursor-pointer"
                    >
                      <option value="area">📈 Onda</option>
                      <option value="bar">📊 Barras</option>
                      <option value="donut">🍩 Donut</option>
                    </select>
                  </div>

                  {/* Gráfico do Modal */}
                  <div className="bg-[var(--dash-surface)] border border-amber-500/20 rounded-[27px] p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[var(--dash-text-muted)]">Estoque Restante por Produto</span>
                      <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">{products.length} Produtos</span>
                    </div>

                    <div className="h-28 w-full flex items-center justify-center pt-2">
                      {modalChartType === "area" && (
                        <AreaSparkline data={itemBarsData} color="amber" height={80} width={240} />
                      )}
                      {modalChartType === "bar" && (
                        <BarSparkline data={itemBarsData} height={80} width={240} />
                      )}
                      {modalChartType === "donut" && (
                        <DonutSparkline segments={donutSegments} size={76} />
                      )}
                    </div>

                    {/* Legenda dos Produtos */}
                    <div className="max-h-24 overflow-y-auto custom-scrollbar pt-2 border-t border-[var(--dash-border)] space-y-1">
                      {itemBarsData.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[10px] font-semibold text-[var(--dash-text-secondary)]">
                          <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <span className="font-bold text-amber-500">{item.value} un</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[var(--dash-surface)] border border-red-500/20 rounded-[27px] p-5 shadow-sm space-y-2">
                    <span className="text-xs font-semibold text-[var(--dash-text-muted)]">
                      Produtos em Alerta
                    </span>
                    <div className="text-3xl font-black text-red-500 tracking-tight">
                      {products.length} <span className="text-xs font-bold text-[var(--dash-text-muted)]">itens afetados</span>
                    </div>
                    <p className="text-xs text-[var(--dash-text-secondary)] pt-1">
                      Estes itens possuem alto risco de esgotamento nos próximos dias se não houver reposição.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-[27px] bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 font-medium">
                  ⚠️ <strong>Atenção:</strong> Produtos com 0 unidades não são exibidos nos catálogos com filtro de disponibilidade ativo.
                </div>
              </div>

              {/* Coluna 2: Tabela com Ações Rápida de Incremento (lg:col-span-7) */}
              <div className="lg:col-span-7 flex flex-col overflow-hidden bg-[var(--dash-surface)]">
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-3">
                  {products.length > 0 ? (
                    products.map((p) => {
                      const isEditing = editingId === p.id;
                      const stockVal = p.stock_quantity ?? 0;

                      return (
                        <div
                          key={p.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-[27px] border border-red-500/15 bg-red-500/5 hover:border-red-500/30 transition-all gap-3"
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
                              <span className="text-[11px] font-extrabold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                                Restantes: {stockVal} un
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min="0"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-16 rounded-lg border border-red-500 bg-[var(--dash-surface)] px-2 py-1 text-xs font-bold text-[var(--dash-text-primary)] outline-none"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSave(p)}
                                  disabled={isSaving}
                                  className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
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
                                  onClick={() => handleQuickAdd(p, 5)}
                                  className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition"
                                  title="Adicionar +5 unidades"
                                >
                                  +5
                                </button>
                                <button
                                  onClick={() => handleQuickAdd(p, 10)}
                                  className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition"
                                  title="Adicionar +10 unidades"
                                >
                                  +10
                                </button>
                                <button
                                  onClick={() => handleQuickAdd(p, 50)}
                                  className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition"
                                  title="Adicionar +50 unidades"
                                >
                                  +50
                                </button>
                                <button
                                  onClick={() => handleEdit(p)}
                                  className="text-[11px] font-bold px-3 py-1 rounded-lg bg-[var(--dash-surface)] border border-[var(--dash-border)] text-[var(--dash-text-primary)] hover:border-red-500/50 hover:text-red-500 transition shadow-sm ml-1"
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
                      <AlertTriangle size={40} className="opacity-20 text-emerald-500" />
                      <p className="text-xs font-medium">Nenhum produto abaixo do limite de alerta!</p>
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

