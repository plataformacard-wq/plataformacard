"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Package,
  Eye,
  LayoutGrid,
  MousePointerClick,
  MessageCircle,
  TrendingUp,
  BarChart3,
  PieChart,
  ArrowUpRight,
  Plus,
  X,
  GripVertical,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Maximize2,
} from "lucide-react";
import ProductActiveDetailModal from "./ProductActiveDetailModal";
import CardVisitsDetailModal from "./CardVisitsDetailModal";
import MetricGenericDetailModal from "./MetricGenericDetailModal";
import {
  AreaSparkline,
  BarSparkline,
  DonutSparkline,
  SparklinePoint,
  DonutSegment,
} from "./DashboardKpiSparklines";

export interface MetricDefinition {
  id: string;
  label: string;
  icon: React.ElementType;
  sparklineType: "area-blue" | "bar-purple" | "donut" | "area-emerald";
  color: "blue" | "emerald" | "violet" | "amber";
  bgClass: string;
  textClass: string;
  allowedChartTypes?: ("area" | "bar" | "donut")[];
  getValue: (data: any) => string | number;
  getTrend: (data: any) => string;
  getHistory?: (data: any) => SparklinePoint[];
  getSegments?: (data: any) => DonutSegment[];
}

const ALL_METRICS: Record<string, MetricDefinition> = {
  produtos_ativos: {
    id: "produtos_ativos",
    label: "Produtos Ativos",
    icon: Package,
    sparklineType: "donut",
    color: "blue",
    bgClass: "bg-blue-500/10",
    textClass: "text-blue-500",
    allowedChartTypes: ["bar", "donut"],
    getValue: (data) => data.productCount ?? "0",
    getTrend: () => "+12%",
    getSegments: (data) => {
      if (data?.categoryDistribution && Array.isArray(data.categoryDistribution) && data.categoryDistribution.length > 0) {
        return data.categoryDistribution;
      }
      const count = typeof data.productCount === "number" ? data.productCount : parseInt(data.productCount || "0", 10) || 0;
      const c1 = Math.max(1, Math.round(count * 0.65));
      const c2 = Math.max(0, count - c1);
      return [
        { label: "Scooters", value: c1, color: "#3b82f6" },
        { label: "Bikes Elétricas", value: c2, color: "#10b981" },
      ].filter((s) => s.value > 0);
    },
    getHistory: (data) => {
      if (data?.categoryDistribution && Array.isArray(data.categoryDistribution) && data.categoryDistribution.length > 0) {
        return data.categoryDistribution.map((c: any) => ({ label: c.label, value: c.value }));
      }
      const count = typeof data.productCount === "number" ? data.productCount : parseInt(data.productCount || "0", 10) || 0;
      const c1 = Math.max(1, Math.round(count * 0.65));
      const c2 = Math.max(0, count - c1);
      return [
        { label: "Scooters", value: c1 },
        { label: "Bikes Elétricas", value: c2 },
      ].filter((s) => s.value > 0);
    },
  },
  visitas_cartao: {
    id: "visitas_cartao",
    label: "Visitas no Cartão",
    icon: Eye,
    sparklineType: "area-blue",
    color: "blue",
    bgClass: "bg-blue-500/10",
    textClass: "text-blue-500",
    getValue: (data) => data.profileViews ?? "0",
    getTrend: () => "+5.4%",
    getHistory: (data) => {
      const views = typeof data.profileViews === "number" ? data.profileViews : parseInt(data.profileViews || "0", 10) || 0;
      return [
        { label: "Seg", value: Math.max(2, Math.round(views * 0.12)) },
        { label: "Ter", value: Math.max(5, Math.round(views * 0.18)) },
        { label: "Qua", value: Math.max(8, Math.round(views * 0.15)) },
        { label: "Qui", value: Math.max(12, Math.round(views * 0.22)) },
        { label: "Sex", value: Math.max(15, Math.round(views * 0.19)) },
        { label: "Sáb", value: Math.max(8, Math.round(views * 0.08)) },
        { label: "Hoje", value: Math.max(4, Math.round(views * 0.06)) },
      ];
    },
  },
  visitas_catalogo: {
    id: "visitas_catalogo",
    label: "Visitas no Catálogo",
    icon: LayoutGrid,
    sparklineType: "bar-purple",
    color: "violet",
    bgClass: "bg-purple-500/10",
    textClass: "text-purple-500",
    getValue: (data) => {
      if (typeof data.catalogViews === "number") return data.catalogViews.toLocaleString();
      const views = typeof data.profileViews === "number" ? data.profileViews : parseInt(data.profileViews || "0", 10) || 0;
      return Math.round(views * 1.4).toLocaleString();
    },
    getTrend: () => "+8.7%",
    getHistory: (data) => {
      const views = typeof data.catalogViews === "number" ? data.catalogViews : (typeof data.profileViews === "number" ? data.profileViews : parseInt(data.profileViews || "0", 10) || 0);
      return [
        { label: "Seg", value: Math.max(4, Math.round(views * 0.18)) },
        { label: "Ter", value: Math.max(7, Math.round(views * 0.24)) },
        { label: "Qua", value: Math.max(10, Math.round(views * 0.20)) },
        { label: "Qui", value: Math.max(14, Math.round(views * 0.28)) },
        { label: "Sex", value: Math.max(18, Math.round(views * 0.25)) },
        { label: "Sáb", value: Math.max(9, Math.round(views * 0.12)) },
        { label: "Hoje", value: Math.max(5, Math.round(views * 0.10)) },
      ];
    },
  },
  cliques_links: {
    id: "cliques_links",
    label: "Cliques em Links",
    icon: MousePointerClick,
    sparklineType: "donut",
    color: "amber",
    bgClass: "bg-violet-500/10",
    textClass: "text-violet-500",
    getValue: (data) => {
      if (typeof data.productClicks === "number") return data.productClicks.toLocaleString();
      const views = typeof data.profileViews === "number" ? data.profileViews : parseInt(data.profileViews || "0", 10) || 0;
      return (views > 0 ? Math.round(views * 0.185) : 2850).toLocaleString();
    },
    getTrend: () => "+8.2%",
    getSegments: () => [
      { label: "WhatsApp", value: 45, color: "#10b981" },
      { label: "Instagram", value: 25, color: "#ec4899" },
      { label: "Cartão NFC", value: 18, color: "#3b82f6" },
      { label: "Direct/Outros", value: 12, color: "#8b5cf6" },
    ],
  },
  conversas_iniciadas: {
    id: "conversas_iniciadas",
    label: "Conversas Iniciadas",
    icon: MessageCircle,
    sparklineType: "area-emerald",
    color: "emerald",
    bgClass: "bg-emerald-500/10",
    textClass: "text-emerald-500",
    getValue: (data) => {
      if (typeof data.conversationsStarted === "number") return data.conversationsStarted.toLocaleString();
      const views = typeof data.profileViews === "number" ? data.profileViews : parseInt(data.profileViews || "0", 10) || 0;
      return (views > 0 ? Math.round(views * 0.082) : 340).toLocaleString();
    },
    getTrend: () => "+5.3%",
    getHistory: (data) => {
      const convs = typeof data.conversationsStarted === "number" ? data.conversationsStarted : 62;
      return [
        { label: "Seg", value: Math.max(0, Math.round(convs * 0.70)) },
        { label: "Ter", value: Math.max(0, Math.round(convs * 0.75)) },
        { label: "Qua", value: Math.max(0, Math.round(convs * 0.82)) },
        { label: "Qui", value: Math.max(0, Math.round(convs * 0.88)) },
        { label: "Sex", value: Math.max(0, Math.round(convs * 0.92)) },
        { label: "Sáb", value: Math.max(0, Math.round(convs * 0.95)) },
        { label: "Hoje", value: convs },
      ];
    },
  },
  conversao_est: {
    id: "conversao_est",
    label: "Conversão Est.",
    icon: TrendingUp,
    sparklineType: "area-emerald",
    color: "amber",
    bgClass: "bg-amber-500/10",
    textClass: "text-amber-500",
    getValue: (data) => data.conversionRate || "12.5%",
    getTrend: () => "+1.2%",
    getHistory: () => [
      { label: "Seg", value: 8.5 },
      { label: "Ter", value: 9.2 },
      { label: "Qua", value: 11.0 },
      { label: "Qui", value: 10.4 },
      { label: "Sex", value: 12.1 },
      { label: "Sáb", value: 11.8 },
      { label: "Hoje", value: 12.5 },
    ],
  },
};

const DEFAULT_METRIC_IDS = [
  "produtos_ativos",
  "visitas_cartao",
  "cliques_links",
  "conversao_est",
];

const STORAGE_KEY = "plataforma_shop_my_metrics_v2";

type ChartKind = "area" | "bar" | "donut";

interface SortableCardProps {
  metric: MetricDefinition;
  initialData: any;
  isEditing: boolean;
  customChartType?: ChartKind;
  onRemove: (id: string) => void;
  onChangeChartType: (id: string, kind: ChartKind) => void;
  onOpenDetail?: (id: string) => void;
}

function SortableCard({
  metric,
  initialData,
  isEditing,
  customChartType,
  onRemove,
  onChangeChartType,
  onOpenDetail,
}: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: metric.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const val = metric.getValue(initialData);
  const trend = metric.getTrend(initialData);
  const history = metric.getHistory ? metric.getHistory(initialData) : [];
  const segments = metric.getSegments ? metric.getSegments(initialData) : [];

  const allowedKinds = metric.allowedChartTypes || ["area", "bar", "donut"];
  const defaultKind: ChartKind = allowedKinds.includes("area") && metric.sparklineType.startsWith("area")
    ? "area"
    : allowedKinds.includes("bar") && metric.sparklineType.startsWith("bar")
    ? "bar"
    : allowedKinds.includes("donut")
    ? "donut"
    : allowedKinds[0];

  let rawKind = customChartType || defaultKind;
  if (!allowedKinds.includes(rawKind)) {
    rawKind = allowedKinds[0];
  }
  const effectiveKind = rawKind;

  // Prepare robust fallback data between formats
  let activeHistory = history;
  if (activeHistory.length === 0 && segments.length > 0) {
    activeHistory = segments.map((s) => ({ label: s.label, value: s.value }));
  }

  let activeSegments = segments;
  if (activeSegments.length === 0 && history.length > 0) {
    const palette = ["#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4", "#6366f1"];
    activeSegments = history.map((h, i) => ({
      label: h.label,
      value: h.value,
      color: palette[i % palette.length],
    }));
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => {
        if (!isEditing && onOpenDetail) {
          onOpenDetail(metric.id);
        }
      }}
      className={`group relative rounded-[27px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 md:p-6 transition-all ${
        isEditing
          ? "border-dashed border-primary/40 shadow-sm"
          : "hover:border-primary/50 hover:shadow-lg cursor-pointer"
      }`}
    >
      {/* Camada isolada de fundo para o efeito Glow */}
      <div className="absolute inset-0 rounded-[27px] overflow-hidden pointer-events-none">
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-all" />
      </div>

      {/* Botão de Expandir no hover quando não estiver editando */}
      {!isEditing && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenDetail) onOpenDetail(metric.id);
          }}
          className="absolute top-3.5 right-3.5 z-20 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)]/90 backdrop-blur-sm text-[var(--dash-text-secondary)] hover:text-primary hover:border-primary/40 transition-all shadow-sm"
          title="Ver detalhamento completo"
        >
          <Maximize2 size={13} />
        </button>
      )}

      {/* Editing Controls: Chart Selector, Drag Handle & Remove Button */}
      {isEditing && (
        <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-[var(--dash-surface)]/95 backdrop-blur-md p-1 rounded-lg border border-[var(--dash-border)] shadow-md">
          {/* Seletor Dinâmico de Gráfico */}
          <div className="flex items-center gap-0.5 border-r border-[var(--dash-border)] pr-1.5">
            {allowedKinds.includes("area") && (
              <button
                type="button"
                onClick={() => onChangeChartType(metric.id, "area")}
                className={`p-1 rounded-lg transition-colors ${
                  effectiveKind === "area"
                    ? "bg-primary/20 text-primary font-bold"
                    : "text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)] hover:bg-primary/10"
                }`}
                title="Gráfico de Onda / Área"
              >
                <TrendingUp size={14} />
              </button>
            )}
            {allowedKinds.includes("bar") && (
              <button
                type="button"
                onClick={() => onChangeChartType(metric.id, "bar")}
                className={`p-1 rounded-lg transition-colors ${
                  effectiveKind === "bar"
                    ? "bg-primary/20 text-primary font-bold"
                    : "text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)] hover:bg-primary/10"
                }`}
                title="Gráfico de Barras Verticais (Categorias)"
              >
                <BarChart3 size={14} />
              </button>
            )}
            {allowedKinds.includes("donut") && (
              <button
                type="button"
                onClick={() => onChangeChartType(metric.id, "donut")}
                className={`p-1 rounded-lg transition-colors ${
                  effectiveKind === "donut"
                    ? "bg-primary/20 text-primary font-bold"
                    : "text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)] hover:bg-primary/10"
                }`}
                title="Gráfico Donut / Rosca (Categorias)"
              >
                <PieChart size={14} />
              </button>
            )}
          </div>

          {/* Handle de Arrastar & Botão de Remover */}
          <button
            {...attributes}
            {...listeners}
            type="button"
            className="cursor-grab active:cursor-grabbing p-1 text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)] transition-colors"
            title="Arrastar para reordenar"
          >
            <GripVertical size={15} />
          </button>
          <button
            type="button"
            onClick={() => onRemove(metric.id)}
            className="p-1 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors"
            title="Remover métrica"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className={`rounded-lg p-2.5 ${metric.bgClass} ${metric.textClass}`}>
          <metric.icon size={22} />
        </div>

        {/* Dynamic Sparkline Graphic Render */}
        <div className="flex items-center justify-end">
          {effectiveKind === "area" && (
            <AreaSparkline data={activeHistory} color={metric.color} width={110} height={44} />
          )}
          {effectiveKind === "bar" && (
            <BarSparkline
              data={activeHistory}
              color={metric.color === "violet" ? "#8b5cf6" : metric.color === "amber" ? "#f59e0b" : "#10b981"}
              width={105}
              height={44}
            />
          )}
          {effectiveKind === "donut" && (
            <DonutSparkline segments={activeSegments} size={50} strokeWidth={9} />
          )}
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold text-[var(--dash-text-secondary)] tracking-wide">
            {metric.label}
          </p>
          <h3 className="text-2xl font-extrabold text-[var(--dash-text-primary)] mt-1 tracking-tight">
            {val}
          </h3>
        </div>

        {trend && (
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <ArrowUpRight size={12} />
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyMetricsSection({ initialData }: { initialData: any }) {
  const [activeMetricIds, setActiveMetricIds] = useState<string[]>(DEFAULT_METRIC_IDS);
  const [customChartTypes, setCustomChartTypes] = useState<Record<string, ChartKind>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeModalMetricId, setActiveModalMetricId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          if (Array.isArray(parsed.metrics)) {
            setActiveMetricIds(parsed.metrics.filter((id: string) => ALL_METRICS[id]));
          }
          if (parsed.chartTypes && typeof parsed.chartTypes === "object") {
            setCustomChartTypes(parsed.chartTypes);
          }
        }
      } else {
        // Migration fallback for legacy key
        const legacy = localStorage.getItem("plataforma_shop_my_metrics");
        if (legacy) {
          const parsedLegacy = JSON.parse(legacy);
          if (Array.isArray(parsedLegacy)) {
            setActiveMetricIds(parsedLegacy.filter((id) => ALL_METRICS[id]));
          }
        }
      }
    } catch (e) {
      console.error("Erro ao carregar preferências de métricas:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const saveConfig = (newIds: string[], newChartTypes: Record<string, ChartKind>) => {
    setActiveMetricIds(newIds);
    setCustomChartTypes(newChartTypes);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ metrics: newIds, chartTypes: newChartTypes })
      );
    } catch (e) {
      console.error("Erro ao salvar métricas no localStorage:", e);
    }
  };

  const handleAddMetric = (id: string) => {
    if (!activeMetricIds.includes(id)) {
      saveConfig([...activeMetricIds, id], customChartTypes);
    }
    setIsDropdownOpen(false);
  };

  const handleRemoveMetric = (id: string) => {
    const updatedIds = activeMetricIds.filter((mId) => mId !== id);
    const updatedTypes = { ...customChartTypes };
    delete updatedTypes[id];
    saveConfig(updatedIds, updatedTypes);
  };

  const handleChangeChartType = (id: string, kind: ChartKind) => {
    const updatedTypes = { ...customChartTypes, [id]: kind };
    saveConfig(activeMetricIds, updatedTypes);
  };

  const handleRestoreDefaults = () => {
    saveConfig(DEFAULT_METRIC_IDS, {});
    setIsEditing(false);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = activeMetricIds.indexOf(active.id as string);
      const newIndex = activeMetricIds.indexOf(over.id as string);
      saveConfig(arrayMove(activeMetricIds, oldIndex, newIndex), customChartTypes);
    }
  };

  const availableMetrics = Object.values(ALL_METRICS).filter(
    (m) => !activeMetricIds.includes(m.id)
  );

  const getEffectiveChartType = (id: string | null): ChartKind => {
    if (!id || !ALL_METRICS[id]) return "area";
    const metric = ALL_METRICS[id];
    const allowed = metric.allowedChartTypes || ["area", "bar", "donut"];
    const defaultKind: ChartKind = allowed.includes("area") && metric.sparklineType.startsWith("area")
      ? "area"
      : allowed.includes("bar") && metric.sparklineType.startsWith("bar")
      ? "bar"
      : allowed.includes("donut")
      ? "donut"
      : allowed[0];
    let raw = customChartTypes[id] || defaultKind;
    if (!allowed.includes(raw)) raw = allowed[0];
    return raw;
  };

  return (
    <section className="space-y-4">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-bold tracking-tight text-[var(--dash-text-primary)]">
            Minhas Métricas
          </h2>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
            Personalizável
          </span>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-2">
          {/* Dropdown Adicionar Métrica */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={availableMetrics.length === 0}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all border ${
                availableMetrics.length === 0
                  ? "border-[var(--dash-border)] bg-[var(--dash-surface)] opacity-50 cursor-not-allowed text-[var(--dash-text-secondary)]"
                  : "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
              }`}
            >
              <Plus size={15} />
              <span>Adicionar Métrica</span>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 z-40 w-56 rounded-[27px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-2 shadow-xl backdrop-blur-xl"
                >
                  <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--dash-text-secondary)]">
                    Métricas Disponíveis
                  </p>
                  <div className="space-y-1">
                    {availableMetrics.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleAddMetric(m.id)}
                        className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-[var(--dash-text-primary)] hover:bg-primary/10 hover:text-primary transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <m.icon size={16} className={m.textClass} />
                          <span>{m.label}</span>
                        </div>
                        <Plus size={14} className="opacity-60" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Toggle Personalizar / Concluir */}
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all border ${
              isEditing
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                : "border-[var(--dash-border)] bg-[var(--dash-surface)] text-[var(--dash-text-primary)] hover:border-primary/40"
            }`}
          >
            {isEditing ? (
              <>
                <Check size={15} />
                <span>Concluir</span>
              </>
            ) : (
              <>
                <SlidersHorizontal size={15} />
                <span>Personalizar</span>
              </>
            )}
          </button>

          {/* Botão Restaurar Padrão */}
          {isEditing && (
            <button
              type="button"
              onClick={handleRestoreDefaults}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3.5 py-2 text-xs font-bold text-[var(--dash-text-secondary)] hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/10 transition-all"
              title="Restaurar as métricas e gráficos padrão"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">Restaurar Padrão</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid de Cards ou Fallback de Seção Recolhida */}
      {!isHydrated ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-[27px] bg-[var(--dash-surface)] border border-[var(--dash-border)]" />
          ))}
        </div>
      ) : activeMetricIds.length === 0 ? (
        /* Fallback: Seção Recolhida quando vazia */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[27px] border-2 border-dashed border-[var(--dash-border)] bg-[var(--dash-surface)] p-8 text-center"
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[27px] bg-primary/10 text-primary">
            <SlidersHorizontal size={24} />
          </div>
          <h3 className="text-base font-bold text-[var(--dash-text-primary)]">
            A seção Minhas Métricas está recolhida
          </h3>
          <p className="mt-1 text-xs text-[var(--dash-text-secondary)] max-w-md mx-auto">
            Você removeu todos os cartões desta seção. Adicione novas métricas personalizadas da lista do analítico para voltar a visualizar seu resumo.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary/90 transition-all"
            >
              <Plus size={16} />
              <span>Adicionar Métricas</span>
            </button>
            <button
              type="button"
              onClick={handleRestoreDefaults}
              className="flex items-center gap-2 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 py-2.5 text-xs font-bold text-[var(--dash-text-primary)] hover:border-primary/40 transition-all"
            >
              <RotateCcw size={15} />
              <span>Restaurar 4 Métricas Padrão</span>
            </button>
          </div>
        </motion.div>
      ) : (
        /* DndContext & Sortable Grid */
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={activeMetricIds} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {activeMetricIds.map((id) => {
                const metric = ALL_METRICS[id];
                if (!metric) return null;
                return (
                  <SortableCard
                    key={metric.id}
                    metric={metric}
                    initialData={initialData}
                    isEditing={isEditing}
                    customChartType={customChartTypes[metric.id]}
                    onRemove={handleRemoveMetric}
                    onChangeChartType={handleChangeChartType}
                    onOpenDetail={(id) => setActiveModalMetricId(id)}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Modal Detalhado para Produtos Ativos */}
      <ProductActiveDetailModal
        isOpen={activeModalMetricId === "produtos_ativos"}
        onClose={() => setActiveModalMetricId(null)}
        totalProducts={ALL_METRICS.produtos_ativos.getValue(initialData)}
        chartType={getEffectiveChartType(activeModalMetricId)}
        categorySegments={
          ALL_METRICS.produtos_ativos.getSegments
            ? ALL_METRICS.produtos_ativos.getSegments(initialData)
            : []
        }
      />

      {/* Modal Detalhado para Visitas no Cartão */}
      <CardVisitsDetailModal
        isOpen={activeModalMetricId === "visitas_cartao"}
        onClose={() => setActiveModalMetricId(null)}
        totalViews={ALL_METRICS.visitas_cartao.getValue(initialData)}
        chartType={getEffectiveChartType(activeModalMetricId)}
        history={
          ALL_METRICS.visitas_cartao.getHistory
            ? ALL_METRICS.visitas_cartao.getHistory(initialData)
            : []
        }
      />

      {/* Modal Detalhado para Outras Métricas */}
      <MetricGenericDetailModal
        metricId={activeModalMetricId}
        isOpen={
          activeModalMetricId !== null &&
          activeModalMetricId !== "produtos_ativos" &&
          activeModalMetricId !== "visitas_cartao"
        }
        onClose={() => setActiveModalMetricId(null)}
        chartType={getEffectiveChartType(activeModalMetricId)}
        history={
          activeModalMetricId && ALL_METRICS[activeModalMetricId]?.getHistory
            ? ALL_METRICS[activeModalMetricId].getHistory!(initialData)
            : []
        }
        segments={
          activeModalMetricId && ALL_METRICS[activeModalMetricId]?.getSegments
            ? ALL_METRICS[activeModalMetricId].getSegments!(initialData)
            : []
        }
        color={
          activeModalMetricId && ALL_METRICS[activeModalMetricId]
            ? ALL_METRICS[activeModalMetricId].color
            : "blue"
        }
        initialData={initialData}
      />
    </section>
  );
}
