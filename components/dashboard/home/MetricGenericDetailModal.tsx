"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  MousePointerClick,
  MessageCircle,
  TrendingUp,
  X,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Smartphone,
  Calendar,
  Filter,
  CheckCircle2,
  Users,
} from "lucide-react";
import Link from "next/link";
import {
  AreaSparkline,
  BarSparkline,
  DonutSparkline,
  SparklinePoint,
  DonutSegment,
} from "./DashboardKpiSparklines";

interface MetricGenericDetailModalProps {
  metricId: string | null;
  isOpen: boolean;
  onClose: () => void;
  initialData: any;
  chartType?: "area" | "bar" | "donut";
  history?: SparklinePoint[];
  segments?: DonutSegment[];
  color?: "blue" | "emerald" | "violet" | "amber";
}

export default function MetricGenericDetailModal({
  metricId,
  isOpen,
  onClose,
  initialData,
  chartType = "area",
  history,
  segments,
  color,
}: MetricGenericDetailModalProps) {
  if (!isOpen || !metricId) return null;

  const views = typeof initialData?.profileViews === "number" ? initialData.profileViews : parseInt(initialData?.profileViews || "0", 10) || 0;

  // Configuration map per metric
  let config = {
    title: "",
    subtitle: "",
    icon: LayoutGrid,
    iconColorClass: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    badgeText: "",
    totalValue: "0",
    trend: "+8.7%",
    color: (color || "violet") as "blue" | "emerald" | "violet" | "amber",
    barColor: "#8b5cf6",
    history: [] as SparklinePoint[],
    segments: [] as DonutSegment[],
    statsLabel1: "",
    statsValue1: "",
    statsLabel2: "",
    statsValue2: "",
    primaryButtonText: "",
    primaryButtonHref: "",
    primaryButtonIcon: ArrowRight,
    secondaryButtonText: "",
    secondaryButtonHref: "",
  };

  if (metricId === "visitas_catalogo") {
    const total = typeof initialData?.catalogViews === "number" ? initialData.catalogViews : Math.round(views * 1.4);
    config = {
      title: "Detalhamento: Visitas no Catálogo",
      subtitle: "Acessos diretos à vitrine de produtos e páginas de itens",
      icon: LayoutGrid,
      iconColorClass: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      badgeText: "Visualizações de Vitrine",
      totalValue: total.toLocaleString(),
      trend: "+8.7%",
      color: color || "violet",
      barColor: "#8b5cf6",
      history: [
        { label: "Seg", value: Math.max(0, Math.round(total * 0.12)) },
        { label: "Ter", value: Math.max(0, Math.round(total * 0.16)) },
        { label: "Qua", value: Math.max(0, Math.round(total * 0.14)) },
        { label: "Qui", value: Math.max(0, Math.round(total * 0.19)) },
        { label: "Sex", value: Math.max(0, Math.round(total * 0.22)) },
        { label: "Sáb", value: Math.max(0, Math.round(total * 0.11)) },
        { label: "Hoje", value: Math.max(0, Math.round(total * 0.06)) },
      ],
      segments: [
        { label: "Mobile (Celular)", value: Math.round(total * 0.76), color: "#8b5cf6" },
        { label: "Desktop (Computador)", value: Math.round(total * 0.18), color: "#3b82f6" },
        { label: "Tablet / Outros", value: Math.round(total * 0.06), color: "#10b981" },
      ],
      statsLabel1: "Dispositivo Principal",
      statsValue1: total > 0 ? "Mobile (76%)" : "Sem tráfego",
      statsLabel2: "Dia de Maior Tráfego",
      statsValue2: total > 0 ? "Sexta-feira" : "-",
      primaryButtonText: "Ver Meu Catálogo Público",
      primaryButtonHref: initialData?.slug ? `/${initialData.slug}` : "/dashboard/catalogo/gerenciador",
      primaryButtonIcon: ExternalLink,
      secondaryButtonText: "Personalizar Layout da Loja",
      secondaryButtonHref: "/dashboard/empresa/dominio",
    };
  } else if (metricId === "cliques_links") {
    const total = typeof initialData?.productClicks === "number" ? initialData.productClicks : (views > 0 ? Math.round(views * 0.185) : 2850);
    config = {
      title: "Detalhamento: Cliques em Links",
      subtitle: "Interações em botões de contato, redes sociais e cartão",
      icon: MousePointerClick,
      iconColorClass: "text-violet-500 bg-violet-500/10 border-violet-500/20",
      badgeText: "Engajamento Direto",
      totalValue: total.toLocaleString(),
      trend: "+8.2%",
      color: color || "amber",
      barColor: "#f59e0b",
      history: [
        { label: "Seg", value: Math.max(0, Math.round(total * 0.11)) },
        { label: "Ter", value: Math.max(0, Math.round(total * 0.14)) },
        { label: "Qua", value: Math.max(0, Math.round(total * 0.17)) },
        { label: "Qui", value: Math.max(0, Math.round(total * 0.20)) },
        { label: "Sex", value: Math.max(0, Math.round(total * 0.23)) },
        { label: "Sáb", value: Math.max(0, Math.round(total * 0.10)) },
        { label: "Hoje", value: Math.max(0, Math.round(total * 0.05)) },
      ],
      segments: [
        { label: "Botão WhatsApp", value: Math.round(total * 0.45), color: "#10b981" },
        { label: "Instagram Bio", value: Math.round(total * 0.25), color: "#ec4899" },
        { label: "Cartão NFC", value: Math.round(total * 0.18), color: "#3b82f6" },
        { label: "Outros Links", value: Math.round(total * 0.12), color: "#8b5cf6" },
      ],
      statsLabel1: "Canal Mais Clicado",
      statsValue1: total > 0 ? "WhatsApp (45%)" : "Nenhum clique",
      statsLabel2: "Taxa de Cliques",
      statsValue2: total > 0 ? "18.5%" : "0.0%",
      primaryButtonText: "Gerenciar Links & Redes Sociais",
      primaryButtonHref: "/dashboard/perfil",
      primaryButtonIcon: ArrowRight,
      secondaryButtonText: "Configurar Vendedores B2B",
      secondaryButtonHref: "/dashboard/vendedores",
    };
  } else if (metricId === "conversas_iniciadas") {
    const total = typeof initialData?.conversationsStarted === "number" ? initialData.conversationsStarted : (views > 0 ? Math.round(views * 0.082) : 340);
    config = {
      title: "Detalhamento: Conversas Iniciadas",
      subtitle: "Leads que iniciaram atendimento via WhatsApp",
      icon: MessageCircle,
      iconColorClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      badgeText: "Leads & Oportunidades",
      totalValue: total.toLocaleString(),
      trend: "+5.3%",
      color: color || "emerald",
      barColor: "#10b981",
      history: [
        { label: "Seg", value: Math.max(0, Math.round(total * 0.70)) },
        { label: "Ter", value: Math.max(0, Math.round(total * 0.75)) },
        { label: "Qua", value: Math.max(0, Math.round(total * 0.82)) },
        { label: "Qui", value: Math.max(0, Math.round(total * 0.88)) },
        { label: "Sex", value: Math.max(0, Math.round(total * 0.92)) },
        { label: "Sáb", value: Math.max(0, Math.round(total * 0.95)) },
        { label: "Hoje", value: total },
      ],
      segments: [
        { label: "Atendimento Geral", value: Math.round(total * 0.55), color: "#10b981" },
        { label: "Vendedores B2B", value: Math.round(total * 0.30), color: "#3b82f6" },
        { label: "Orçamentos Diretos", value: Math.round(total * 0.15), color: "#f59e0b" },
      ],
      statsLabel1: "Horário de Pico",
      statsValue1: total > 0 ? "14:00 - 17:00" : "Sem dados",
      statsLabel2: "Canal Principal",
      statsValue2: "WhatsApp Web",
      primaryButtonText: "Gerenciar Vendedores B2B",
      primaryButtonHref: "/dashboard/vendedores",
      primaryButtonIcon: ArrowRight,
      secondaryButtonText: "Configurar Número do WhatsApp",
      secondaryButtonHref: "/dashboard/empresa/dominio",
    };
  } else if (metricId === "conversao_est") {
    config = {
      title: "Detalhamento: Conversão Estimada",
      subtitle: "Proporção de visitantes que iniciaram contato comercial",
      icon: TrendingUp,
      iconColorClass: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      badgeText: "Eficiência de Vendas",
      totalValue: initialData?.conversionRate || "12.5%",
      trend: "+1.2%",
      color: color || "emerald",
      barColor: "#10b981",
      history: [
        { label: "Seg", value: 8.5 },
        { label: "Ter", value: 9.2 },
        { label: "Qua", value: 11.0 },
        { label: "Qui", value: 10.4 },
        { label: "Sex", value: 12.1 },
        { label: "Sáb", value: 11.8 },
        { label: "Hoje", value: 12.5 },
      ],
      segments: [
        { label: "Visitantes Únicos", value: 100, color: "#3b82f6" },
        { label: "Cliques no Catálogo", value: 68, color: "#8b5cf6" },
        { label: "Contato WhatsApp", value: 12.5, color: "#10b981" },
      ],
      statsLabel1: "Funil de Conversão",
      statsValue1: "12.5% Média",
      statsLabel2: "Meta Sugerida",
      statsValue2: "15.0%",
      primaryButtonText: "Otimizar Produtos no Catálogo",
      primaryButtonHref: "/dashboard/catalogo/gerenciador",
      primaryButtonIcon: ArrowRight,
      secondaryButtonText: "Ver Minhas Métricas Completas",
      secondaryButtonHref: "/dashboard/analytics",
    };
  }

  // Sincronização estrita de histórico e segmentos vindo do card
  const activeHistory = history && history.length > 0 ? history : config.history;
  const activeSegments = segments && segments.length > 0 ? segments : config.segments;

  const IconComp = config.icon;
  const PrimaryIcon = config.primaryButtonIcon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[27px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 md:p-8 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[var(--dash-border)] pb-5">
            <div className="flex items-center gap-3.5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-[27px] border shadow-inner ${config.iconColorClass}`}>
                <IconComp size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight text-[var(--dash-text-primary)]">
                  {config.title}
                </h3>
                <p className="text-xs text-[var(--dash-text-secondary)] mt-0.5">
                  {config.subtitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-[var(--dash-text-secondary)] hover:bg-primary/10 hover:text-[var(--dash-text-primary)] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Main Grid Content (2 Columns) */}
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-12">
            {/* Coluna Esquerda: Gráficos de Evolução Diária & Divisão */}
            <div className="md:col-span-6 flex flex-col justify-between rounded-[27px] border border-[var(--dash-border)] bg-black/5 dark:bg-[var(--dash-surface)]/5 p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-secondary)] mb-3">
                  {chartType === "donut"
                    ? "Distribuição Donut / Rosca"
                    : chartType === "bar"
                    ? "Comparativo de Barras Verticais"
                    : "Evolução no Tempo (7 Dias)"}
                </p>

                {/* Renderização do Gráfico que Corresponde EXATAMENTE ao Card Ativo */}
                <div className="h-36 flex items-center justify-center py-2">
                  {chartType === "area" && (
                    <AreaSparkline data={activeHistory} color={config.color} width={260} height={100} />
                  )}
                  {chartType === "bar" && (
                    <BarSparkline data={activeHistory} color={config.barColor} width={250} height={100} />
                  )}
                  {chartType === "donut" && (
                    <div className="relative flex items-center justify-center py-1">
                      <DonutSparkline segments={activeSegments} size={130} strokeWidth={16} />
                    </div>
                  )}
                </div>
              </div>

              {/* Divisão por Categoria / Canal */}
              <div className="mt-4 pt-4 border-t border-[var(--dash-border)]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--dash-text-secondary)] mb-3">
                  Distribuição & Detalhes
                </p>
                <div className="space-y-2">
                  {activeSegments.map((seg, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs rounded-lg bg-[var(--dash-surface)] border border-[var(--dash-border)] px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                        <span className="font-semibold text-[var(--dash-text-primary)]">{seg.label}</span>
                      </div>
                      <span className="font-bold text-[var(--dash-text-primary)]">
                        {typeof seg.value === "number" ? seg.value.toLocaleString() : seg.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Coluna Direita: Estatísticas & Ações Rápidas */}
            <div className="md:col-span-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {/* Highlight Stats */}
                <div className="rounded-[27px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[var(--dash-text-secondary)] uppercase">{config.badgeText}</span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <TrendingUp size={12} />
                      {config.trend}
                    </span>
                  </div>
                  <h4 className="text-3xl font-black text-[var(--dash-text-primary)]">
                    {config.totalValue}
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3.5">
                    <div className="flex items-center gap-1.5 text-[var(--dash-text-secondary)] mb-1">
                      <Calendar size={14} />
                      <span className="text-[11px] font-semibold">{config.statsLabel1}</span>
                    </div>
                    <p className="text-sm font-black text-[var(--dash-text-primary)]">
                      {config.statsValue1}
                    </p>
                  </div>

                  <div className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3.5">
                    <div className="flex items-center gap-1.5 text-[var(--dash-text-secondary)] mb-1">
                      <Sparkles size={14} className="text-primary" />
                      <span className="text-[11px] font-semibold">{config.statsLabel2}</span>
                    </div>
                    <p className="text-sm font-black text-primary">
                      {config.statsValue2}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões de Ação Rápida */}
              <div className="space-y-2 pt-2">
                <Link
                  href={config.primaryButtonHref}
                  className="flex w-full items-center justify-between rounded-lg bg-primary px-4 py-3 text-xs font-bold text-white shadow-md hover:bg-primary/90 transition-all group"
                  onClick={onClose}
                >
                  <div className="flex items-center gap-2">
                    <IconComp size={16} />
                    <span>{config.primaryButtonText}</span>
                  </div>
                  <PrimaryIcon size={14} />
                </Link>

                <Link
                  href={config.secondaryButtonHref}
                  className="flex w-full items-center justify-between rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 py-3 text-xs font-bold text-[var(--dash-text-primary)] hover:border-primary/40 hover:bg-primary/5 transition-all"
                  onClick={onClose}
                >
                  <div className="flex items-center gap-2">
                    <Filter size={15} className="text-primary" />
                    <span>{config.secondaryButtonText}</span>
                  </div>
                  <ExternalLink size={14} className="text-[var(--dash-text-secondary)]" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
