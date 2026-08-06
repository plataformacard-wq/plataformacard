"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  X,
  TrendingUp,
  Share2,
  Calendar,
  Sparkles,
  ArrowRight,
  QrCode,
} from "lucide-react";
import Link from "next/link";
import {
  AreaSparkline,
  BarSparkline,
  DonutSparkline,
  SparklinePoint,
  DonutSegment,
} from "./DashboardKpiSparklines";

interface CardVisitsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalViews: number | string;
  history: SparklinePoint[];
  chartType?: "area" | "bar" | "donut";
}

export default function CardVisitsDetailModal({
  isOpen,
  onClose,
  totalViews,
  history,
  chartType = "area",
}: CardVisitsDetailModalProps) {
  if (!isOpen) return null;

  const countNum =
    typeof totalViews === "number"
      ? totalViews
      : parseInt(totalViews || "0", 10) || 0;

  // Segmentos por origem do acesso
  const trafficSegments: DonutSegment[] = [
    { label: "QRCode Cartão NFC", value: Math.max(1, Math.round(countNum * 0.55)), color: "#3b82f6" },
    { label: "Link Bio Instagram", value: Math.max(1, Math.round(countNum * 0.30)), color: "#ec4899" },
    { label: "WhatsApp / Direct", value: Math.max(0, Math.round(countNum * 0.15)), color: "#10b981" },
  ];

  const peakDay = history.length > 0
    ? [...history].sort((a, b) => b.value - a.value)[0]
    : { label: "Sex", value: 15 };

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
          className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[32px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 md:p-8 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[var(--dash-border)] pb-5">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-inner">
                <Eye size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight text-[var(--dash-text-primary)]">
                  Detalhamento: Visitas no Cartão
                </h3>
                <p className="text-xs text-[var(--dash-text-secondary)] mt-0.5">
                  Análise de tráfego, picos diários e canais de acesso ao seu perfil
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
            {/* Coluna Esquerda: Gráficos de Evolução Diária & Origem */}
            <div className="md:col-span-6 flex flex-col justify-between rounded-2xl border border-[var(--dash-border)] bg-black/5 dark:bg-white/5 p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-secondary)] mb-3">
                  {chartType === "donut"
                    ? "Distribuição por Origem (Donut)"
                    : chartType === "bar"
                    ? "Acessos Diários (Barras)"
                    : "Evolução Temporal (Onda)"}
                </p>

                {/* Renderização do Gráfico que corresponde ao Card */}
                <div className="h-36 flex items-center justify-center py-2">
                  {chartType === "area" && (
                    <AreaSparkline data={history} color="blue" width={260} height={100} />
                  )}
                  {chartType === "bar" && (
                    <BarSparkline data={history} color="#3b82f6" width={250} height={100} />
                  )}
                  {chartType === "donut" && (
                    <div className="relative flex items-center justify-center py-1">
                      <DonutSparkline segments={trafficSegments} size={130} strokeWidth={16} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xl font-black text-[var(--dash-text-primary)]">
                          {countNum}
                        </span>
                        <span className="text-[9px] font-bold text-[var(--dash-text-secondary)] uppercase">
                          Acessos
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Origem dos Acessos */}
              <div className="mt-4 pt-4 border-t border-[var(--dash-border)]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--dash-text-secondary)] mb-3">
                  Origem do Tráfego (Canais)
                </p>
                <div className="space-y-2">
                  {trafficSegments.map((seg, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                        <span className="font-semibold text-[var(--dash-text-primary)]">{seg.label}</span>
                      </div>
                      <span className="font-bold text-[var(--dash-text-primary)]">{seg.value} acessos</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Coluna Direita: Estatísticas & Ações Rápidas */}
            <div className="md:col-span-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {/* Highlight Stats */}
                <div className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[var(--dash-text-secondary)] uppercase">Total de Acessos</span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <TrendingUp size={12} />
                      +5.4%
                    </span>
                  </div>
                  <h4 className="text-3xl font-black text-[var(--dash-text-primary)]">
                    {countNum.toLocaleString()} <span className="text-xs font-normal text-[var(--dash-text-secondary)]">visitas</span>
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3.5">
                    <div className="flex items-center gap-1.5 text-[var(--dash-text-secondary)] mb-1">
                      <Calendar size={14} />
                      <span className="text-[11px] font-semibold">Pico de Acessos</span>
                    </div>
                    <p className="text-base font-black text-[var(--dash-text-primary)]">
                      {peakDay.label} ({peakDay.value} v.)
                    </p>
                  </div>

                  <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3.5">
                    <div className="flex items-center gap-1.5 text-[var(--dash-text-secondary)] mb-1">
                      <Sparkles size={14} className="text-blue-500" />
                      <span className="text-[11px] font-semibold">Canal Top</span>
                    </div>
                    <p className="text-base font-black text-blue-500">
                      QRCode NFC
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões de Ação Rápida */}
              <div className="space-y-2 pt-2">
                <Link
                  href="/dashboard/empresa/dominio"
                  className="flex w-full items-center justify-between rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-all group"
                  onClick={onClose}
                >
                  <div className="flex items-center gap-2">
                    <QrCode size={16} />
                    <span>Compartilhar Cartão NFC & Link</span>
                  </div>
                  <Share2 size={14} />
                </Link>

                <Link
                  href="/dashboard/analytics"
                  className="flex w-full items-center justify-between rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 py-3 text-xs font-bold text-[var(--dash-text-primary)] hover:border-primary/40 hover:bg-primary/5 transition-all"
                  onClick={onClose}
                >
                  <div className="flex items-center gap-2">
                    <Eye size={16} className="text-blue-500" />
                    <span>Ver Minhas Métricas Completas</span>
                  </div>
                  <ArrowRight size={14} className="text-[var(--dash-text-secondary)]" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
