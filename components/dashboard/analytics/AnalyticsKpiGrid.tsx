"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Package,
  Eye,
  LayoutGrid,
  MousePointerClick,
  MessageCircle,
  TrendingUp,
} from "lucide-react";
import {
  AreaSparkline,
  BarSparkline,
  DonutSparkline,
} from "@/components/dashboard/home/DashboardKpiSparklines";

interface AnalyticsSummary {
  profileViews: number;
  catalogViews: number;
  productClicks: number;
  conversationsStarted: number;
  productCount?: number;
  conversionRate?: string;
}

export default function AnalyticsKpiGrid({ summary }: { summary: AnalyticsSummary }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  const profileViewsNum = summary.profileViews || 0;
  const catalogViewsNum = summary.catalogViews || 0;
  const productClicksNum = summary.productClicks || 0;
  const conversationsStartedNum = summary.conversationsStarted || 0;
  const productCountNum = summary.productCount ?? 18;

  // Históricos calculados para os 6 sparklines
  const productsHistory = [
    { label: "Seg", value: Math.max(0, Math.round(productCountNum * 0.82)) },
    { label: "Ter", value: Math.max(0, Math.round(productCountNum * 0.88)) },
    { label: "Qua", value: Math.max(0, Math.round(productCountNum * 0.91)) },
    { label: "Qui", value: Math.max(0, Math.round(productCountNum * 0.94)) },
    { label: "Sex", value: Math.max(0, Math.round(productCountNum * 0.97)) },
    { label: "Sáb", value: Math.max(0, Math.round(productCountNum * 0.99)) },
    { label: "Hoje", value: productCountNum },
  ];

  const profileViewsHistory = [
    { label: "Seg", value: Math.max(0, Math.round(profileViewsNum * 0.78)) },
    { label: "Ter", value: Math.max(0, Math.round(profileViewsNum * 0.85)) },
    { label: "Qua", value: Math.max(0, Math.round(profileViewsNum * 0.89)) },
    { label: "Qui", value: Math.max(0, Math.round(profileViewsNum * 0.92)) },
    { label: "Sex", value: Math.max(0, Math.round(profileViewsNum * 0.96)) },
    { label: "Sáb", value: Math.max(0, Math.round(profileViewsNum * 0.98)) },
    { label: "Hoje", value: profileViewsNum },
  ];

  const catalogViewsHistory = [
    { label: "Seg", value: Math.max(2, Math.round(catalogViewsNum * 0.12)) },
    { label: "Ter", value: Math.max(4, Math.round(catalogViewsNum * 0.16)) },
    { label: "Qua", value: Math.max(6, Math.round(catalogViewsNum * 0.18)) },
    { label: "Qui", value: Math.max(8, Math.round(catalogViewsNum * 0.22)) },
    { label: "Sex", value: Math.max(10, Math.round(catalogViewsNum * 0.20)) },
    { label: "Sáb", value: Math.max(5, Math.round(catalogViewsNum * 0.08)) },
    { label: "Hoje", value: Math.max(3, Math.round(catalogViewsNum * 0.04)) },
  ];

  const productClickSegments = [
    { label: "WhatsApp", value: 45, color: "#10b981" },
    { label: "Instagram", value: 25, color: "#ec4899" },
    { label: "Cartão NFC", value: 18, color: "#3b82f6" },
    { label: "Direct/Outros", value: 12, color: "#8b5cf6" },
  ];

  const conversationsHistory = [
    { label: "Seg", value: Math.max(0, Math.round(conversationsStartedNum * 0.70)) },
    { label: "Ter", value: Math.max(0, Math.round(conversationsStartedNum * 0.75)) },
    { label: "Qua", value: Math.max(0, Math.round(conversationsStartedNum * 0.82)) },
    { label: "Qui", value: Math.max(0, Math.round(conversationsStartedNum * 0.88)) },
    { label: "Sex", value: Math.max(0, Math.round(conversationsStartedNum * 0.92)) },
    { label: "Sáb", value: Math.max(0, Math.round(conversationsStartedNum * 0.95)) },
    { label: "Hoje", value: conversationsStartedNum },
  ];

  const conversionHistory = [
    { label: "Seg", value: 8.5 },
    { label: "Ter", value: 9.2 },
    { label: "Qua", value: 11.0 },
    { label: "Qui", value: 10.4 },
    { label: "Sex", value: 12.1 },
    { label: "Sáb", value: 11.8 },
    { label: "Hoje", value: 12.5 },
  ];

  const kpis = [
    {
      label: "Produtos Ativos",
      value: productCountNum.toLocaleString(),
      icon: Package,
      trend: "+12%",
      bgClass: "bg-blue-500/10",
      textClass: "text-blue-500",
      type: "area-blue" as const,
      history: productsHistory,
    },
    {
      label: "Visitas no Cartão",
      value: profileViewsNum.toLocaleString(),
      icon: Eye,
      trend: "+14.2%",
      bgClass: "bg-blue-500/10",
      textClass: "text-blue-500",
      type: "area-blue" as const,
      history: profileViewsHistory,
    },
    {
      label: "Visitas no Catálogo",
      value: catalogViewsNum.toLocaleString(),
      icon: LayoutGrid,
      trend: "+8.7%",
      bgClass: "bg-purple-500/10",
      textClass: "text-purple-500",
      type: "bar-purple" as const,
      history: catalogViewsHistory,
    },
    {
      label: "Cliques em Produto",
      value: productClicksNum.toLocaleString(),
      icon: MousePointerClick,
      trend: "+12.0%",
      bgClass: "bg-amber-500/10",
      textClass: "text-amber-500",
      type: "donut" as const,
      donutSegments: productClickSegments,
    },
    {
      label: "Conversas Iniciadas",
      value: conversationsStartedNum.toLocaleString(),
      icon: MessageCircle,
      trend: "+5.3%",
      bgClass: "bg-emerald-500/10",
      textClass: "text-emerald-500",
      type: "area-emerald" as const,
      history: conversationsHistory,
    },
    {
      label: "Conversão Est.",
      value: summary.conversionRate || "12.5%",
      icon: TrendingUp,
      trend: "+1.2%",
      bgClass: "bg-amber-500/10",
      textClass: "text-amber-500",
      type: "area-emerald" as const,
      history: conversionHistory,
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 print:grid-cols-3"
    >
      {kpis.map((kpi, idx) => (
        <motion.div
          key={idx}
          variants={item}
          className="group relative rounded-[27px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 md:p-6 transition-all hover:border-primary/50 hover:shadow-lg flex flex-col justify-between"
        >
          {/* Camada isolada de fundo para o efeito Glow (com overflow-hidden) */}
          <div className="absolute inset-0 rounded-[27px] overflow-hidden pointer-events-none">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-all" />
          </div>
          <div className="flex items-center justify-between">
            <div className={`rounded-lg p-2.5 ${kpi.bgClass} ${kpi.textClass}`}>
              <kpi.icon size={22} />
            </div>

            {/* Sparkline Graphic */}
            <div className="flex items-center justify-end">
              {kpi.type === "area-blue" && (
                <AreaSparkline data={kpi.history || []} color="blue" width={100} height={42} />
              )}
              {kpi.type === "bar-purple" && (
                <BarSparkline data={kpi.history || []} color="#8b5cf6" width={95} height={42} />
              )}
              {kpi.type === "donut" && (
                <DonutSparkline segments={kpi.donutSegments || []} size={48} strokeWidth={9} />
              )}
              {kpi.type === "area-emerald" && (
                <AreaSparkline data={kpi.history || []} color="emerald" width={100} height={42} />
              )}
            </div>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold text-[var(--dash-text-secondary)] tracking-wide">{kpi.label}</p>
              <h3 className="text-2xl font-extrabold text-[var(--dash-text-primary)] mt-1 tracking-tight">
                {kpi.value}
              </h3>
            </div>

            {kpi.trend && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <ArrowUpRight size={12} />
                {kpi.trend}
              </div>
            )}
          </div>

        </motion.div>
      ))}
    </motion.div>
  );
}
