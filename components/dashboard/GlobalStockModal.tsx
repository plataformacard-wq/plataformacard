"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Search, Package, Check, Loader2, ArrowUpRight, Filter } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  AreaSparkline,
  BarSparkline,
  DonutSparkline,
  SparklinePoint,
  DonutSegment,
} from "./home/DashboardKpiSparklines";
import { smartSearchMatch } from "@/lib/utils/smart-search";

interface GlobalStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: any[];
  onStockUpdated?: (productId: string, newStock: number) => void;
}

export default function GlobalStockModal({
  isOpen,
  onClose,
  products,
  onStockUpdated,
}: GlobalStockModalProps) {
  const [filterOption, setFilterOption] = useState<"all" | "low_stock" | "out_of_stock" | "highest" | "lowest">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [modalChartType, setModalChartType] = useState<"area" | "bar" | "donut">("area");
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const totalProducts = products.length;
  const totalStockQuantity = products.reduce((acc, p) => acc + (p.stock_quantity || 0), 0);
  
  const inStockProductsList = products.filter((p) => p.is_in_stock || (p.stock_quantity && p.stock_quantity > 0));
  const outOfStockProductsList = products.filter((p) => !p.is_in_stock || (p.stock_quantity ?? 0) === 0);
  
  const inStockProductsCount = inStockProductsList.length;
  const outOfStockProductsCount = outOfStockProductsList.length;
  
  const inStockUnitsTotal = inStockProductsList.reduce((acc, p) => acc + (p.stock_quantity || 0), 0);
  const outOfStockUnitsTotal = outOfStockProductsList.reduce((acc, p) => acc + (p.stock_quantity || 0), 0);

  const stockHealthPercentage = totalProducts > 0 ? Math.round((inStockProductsCount / totalProducts) * 100) : 0;

  const statusBarsData: SparklinePoint[] = [
    { label: "Peças Disponíveis", value: inStockUnitsTotal, color: "#3b82f6" },
    { label: "Peças Zeradas", value: outOfStockUnitsTotal, color: "#f59e0b" },
    { label: "Modelos Ativos", value: inStockProductsCount, color: "#10b981" },
    { label: "Modelos Zerados", value: outOfStockProductsCount, color: "#ef4444" },
  ];

  const donutSegments: DonutSegment[] = [
    { label: "Peças Disponíveis", value: inStockUnitsTotal, color: "#3b82f6" },
    { label: "Peças Zeradas", value: outOfStockUnitsTotal, color: "#f59e0b" },
    { label: "Modelos Ativos", value: inStockProductsCount, color: "#10b981" },
    { label: "Modelos Zerados", value: outOfStockProductsCount, color: "#ef4444" },
  ].filter((s) => s.value > 0);

  let filtered = products.filter((p) => smartSearchMatch(p, searchTerm));

  if (filterOption === "low_stock") {
    filtered = filtered.filter((p) => (p.stock_quantity ?? 0) < 5 && (p.stock_quantity ?? 0) > 0);
  } else if (filterOption === "out_of_stock") {
    filtered = filtered.filter((p) => !p.is_in_stock || p.stock_quantity === 0 || p.stock_quantity === null);
  } else if (filterOption === "highest") {
    filtered = [...filtered].sort((a, b) => (b.stock_quantity ?? 0) - (a.stock_quantity ?? 0));
  } else if (filterOption === "lowest") {
    filtered = [...filtered].sort((a, b) => (a.stock_quantity ?? 0) - (b.stock_quantity ?? 0));
  }

  const handleStartEdit = (p: any) => {
    setEditingId(p.id);
    setEditValue((p.stock_quantity ?? 0).toString());
  };

  const handleSaveStock = async (productId: string) => {
    const val = parseInt(editValue, 10);
    if (isNaN(val) || val < 0) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("products")
        .update({ stock_quantity: val, is_in_stock: val > 0 })
        .eq("id", productId);

      if (error) throw error;

      if (onStockUpdated) {
        onStockUpdated(productId, val);
      }
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar o estoque.");
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative flex flex-col w-full max-w-5xl max-h-[85vh] overflow-hidden rounded-[27px] bg-[var(--dash-surface)] shadow-2xl border border-[var(--dash-border)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--dash-border)] p-6 bg-[var(--dash-surface)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Package size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--dash-text-primary)]">
                Detalhamento do Estoque Global
              </h2>
              <p className="text-xs text-[var(--dash-text-muted)] font-medium">
                Visão analítica de inventário e gestão inline de quantidades
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
          {/* Coluna 1: Métricas & Gráfico (lg:col-span-5) */}
          <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-[var(--dash-border)] p-6 bg-[var(--dash-bg)]/40 flex flex-col justify-between space-y-5 overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  Resumo do Inventário
                </span>

                <select
                  value={modalChartType}
                  onChange={(e) => setModalChartType(e.target.value as "area" | "bar" | "donut")}
                  className="dash-select text-[10px] font-bold rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] pl-2 pr-7 py-1 text-[var(--dash-text-primary)] outline-none cursor-pointer"
                >
                  <option value="area">📈 Onda</option>
                  <option value="bar">📊 Barras</option>
                  <option value="donut">🍩 Donut</option>
                </select>
              </div>

              {/* Gráfico do Modal */}
              <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--dash-text-muted)]">Comparativo dos 4 Indicadores</span>
                  <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md">4 Parâmetros</span>
                </div>

                <div className="h-28 w-full flex items-center justify-center pt-1">
                  {modalChartType === "area" && (
                    <AreaSparkline data={statusBarsData} color="blue" height={80} width={240} />
                  )}
                  {modalChartType === "bar" && (
                    <BarSparkline data={statusBarsData} height={80} width={240} />
                  )}
                  {modalChartType === "donut" && (
                    <DonutSparkline segments={donutSegments} size={76} />
                  )}
                </div>

                {/* Legenda das 4 Cores */}
                <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-[var(--dash-border)] text-[10px] font-semibold text-[var(--dash-text-secondary)]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] shrink-0" />
                    <span className="truncate">Peças Disp. ({inStockUnitsTotal})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shrink-0" />
                    <span className="truncate">Peças Zeradas ({outOfStockUnitsTotal})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] shrink-0" />
                    <span className="truncate">Modelos Ativos ({inStockProductsCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shrink-0" />
                    <span className="truncate">Modelos Zerados ({outOfStockProductsCount})</span>
                  </div>
                </div>
              </div>
              
              {/* Métrica 1: Peças Físicas */}
              <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--dash-text-primary)]">Volumetria de Peças Físicas</span>
                  <span className="text-xs font-black text-blue-500">{totalStockQuantity.toLocaleString()} peças</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Peças Disponíveis</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{inStockUnitsTotal.toLocaleString()} <span className="text-[10px]">un</span></span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400">Peças Zeradas</span>
                    <span className="text-base font-black text-red-600 dark:text-red-400">{outOfStockUnitsTotal.toLocaleString()} <span className="text-[10px]">un</span></span>
                  </div>
                </div>
              </div>

              {/* Métrica 2: Modelos do Catálogo (SKUs) */}
              <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-4 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--dash-text-primary)]">Catálogo de Modelos (SKUs)</span>
                  <span className="text-xs font-extrabold text-emerald-500">{stockHealthPercentage}% ativos</span>
                </div>
                <div className="h-2 w-full bg-[var(--dash-border)] rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full transition-all"
                    style={{ width: `${stockHealthPercentage}%` }}
                  />
                  <div
                    className="bg-red-500 h-full transition-all"
                    style={{ width: `${100 - stockHealthPercentage}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-0.5">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Modelos Ativos</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{inStockProductsCount} <span className="text-[10px]">SKUs</span></span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400">Modelos Zerados</span>
                    <span className="text-base font-black text-red-600 dark:text-red-400">{outOfStockProductsCount} <span className="text-[10px]">SKUs</span></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400 font-medium">
              💡 <strong>Dica de Gestão:</strong> Altere a quantidade de qualquer produto na lista ao lado para atualizar instantaneamente o total de peças e o status do modelo.
            </div>
          </div>

          {/* Coluna 2: Tabela Filtrável & Edição Rápida (lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col overflow-hidden bg-[var(--dash-surface)]">
            {/* Filtro e Busca */}
            <div className="p-5 border-b border-[var(--dash-border)] bg-[var(--dash-surface)] space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--dash-text-muted)]" size={16} />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-bg)] pl-10 pr-4 py-2.5 text-xs text-[var(--dash-text-primary)] font-medium outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div className="w-full sm:w-48 shrink-0">
                  <select
                    value={filterOption}
                    onChange={(e) => setFilterOption(e.target.value as any)}
                    className="dash-select w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-bg)] pl-3 py-2.5 text-xs text-[var(--dash-text-primary)] font-bold outline-none focus:border-blue-500 transition"
                  >
                    <option value="default">Todos os Produtos</option>
                    <option value="highest">Maior Estoque</option>
                    <option value="lowest">Menor Estoque</option>
                    <option value="low_stock">Estoque Baixo {"(< 5)"}</option>
                    <option value="out_of_stock">Somente Esgotados</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Lista com Edição Inline */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-2.5">
              {filtered.length > 0 ? (
                filtered.map((p) => {
                  const isOutOfStock = !p.is_in_stock || (p.stock_quantity ?? 0) === 0;
                  const isEditing = editingId === p.id;

                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-bg)]/60 hover:bg-[var(--dash-hover-bg)] transition-colors"
                    >
                      <div className="flex flex-col flex-1 pr-3 min-w-0">
                        <span className="text-xs font-bold text-[var(--dash-text-primary)] truncate" title={p.name}>
                          {p.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          {p.sku && (
                            <span className="text-[10px] font-mono text-[var(--dash-text-muted)] bg-[var(--dash-surface)] px-1.5 py-0.5 rounded border border-[var(--dash-border)]">
                              SKU: {p.sku}
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isOutOfStock
                                ? "text-red-500 bg-red-500/10 border border-red-500/20"
                                : "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20"
                            }`}
                          >
                            {isOutOfStock ? "Esgotado" : "Disponível"}
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
                              className="w-16 rounded-lg border border-blue-500 bg-[var(--dash-surface)] px-2 py-1 text-xs font-bold text-[var(--dash-text-primary)] outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveStock(p.id)}
                              disabled={isSaving}
                              className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                              title="Salvar"
                            >
                              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              disabled={isSaving}
                              className="p-1.5 rounded-lg bg-[var(--dash-hover-bg)] text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)] transition"
                              title="Cancelar"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-[var(--dash-text-primary)]">
                              {p.stock_quantity ?? 0} un
                            </span>
                            <button
                              onClick={() => handleStartEdit(p)}
                              className="text-[11px] font-bold px-3 py-1 rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] text-[var(--dash-text-primary)] hover:border-blue-500/50 hover:text-blue-500 transition shadow-sm"
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
                  <Package size={40} className="opacity-20" />
                  <p className="text-xs font-medium">Nenhum produto encontrado com os filtros atuais.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

