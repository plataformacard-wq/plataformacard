"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  X,
  ExternalLink,
  Layers,
  CheckCircle2,
  SlidersHorizontal,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import {
  DonutSparkline,
  BarSparkline,
  DonutSegment,
  SparklinePoint,
} from "./DashboardKpiSparklines";

interface ProductActiveDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalProducts: number | string;
  categorySegments: DonutSegment[];
  chartType?: "area" | "bar" | "donut";
}

export default function ProductActiveDetailModal({
  isOpen,
  onClose,
  totalProducts,
  categorySegments,
  chartType = "donut",
}: ProductActiveDetailModalProps) {
  if (!isOpen) return null;

  const countNum =
    typeof totalProducts === "number"
      ? totalProducts
      : parseInt(totalProducts || "0", 10) || 0;

  const totalValue = categorySegments.reduce((acc, curr) => acc + curr.value, 0);

  const barHistory: SparklinePoint[] = categorySegments.map((s) => ({
    label: s.label,
    value: s.value,
  }));

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
                <Package size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight text-[var(--dash-text-primary)]">
                  Detalhamento: Produtos Ativos
                </h3>
                <p className="text-xs text-[var(--dash-text-secondary)] mt-0.5">
                  Distribuição de itens por categoria no catálogo da sua loja
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
            {/* Coluna Esquerda: Gráfico Ampliado & Legendas */}
            <div className="md:col-span-6 flex flex-col items-center justify-center rounded-2xl border border-[var(--dash-border)] bg-black/5 dark:bg-white/5 p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-secondary)] mb-4">
                {chartType === "bar"
                  ? "Comparativo de Categorias (Barras)"
                  : "Proporção por Categoria (Donut)"}
              </p>

              {/* Chart Render Respeitando o Card */}
              <div className="relative flex items-center justify-center py-2 w-full">
                {chartType === "bar" ? (
                  <div className="h-36 w-full flex items-center justify-center">
                    <BarSparkline
                      data={barHistory}
                      color="#3b82f6"
                      width={240}
                      height={110}
                    />
                  </div>
                ) : (
                  <div className="relative flex items-center justify-center py-2">
                    <DonutSparkline
                      segments={categorySegments}
                      size={140}
                      strokeWidth={18}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-black text-[var(--dash-text-primary)]">
                        {countNum}
                      </span>
                      <span className="text-[10px] font-bold text-[var(--dash-text-secondary)] uppercase">
                        Itens Ativos
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Legendas Coloridas */}
              <div className="mt-6 w-full space-y-2.5">
                {categorySegments.map((seg, idx) => {
                  const pct = totalValue > 0 ? Math.round((seg.value / totalValue) * 100) : 0;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-3.5 py-2.5 text-xs transition-all hover:border-primary/40"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="h-3 w-3 rounded-full shadow-sm"
                          style={{ backgroundColor: seg.color }}
                        />
                        <span className="font-bold text-[var(--dash-text-primary)]">
                          {seg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-[var(--dash-text-primary)]">
                          {seg.value} itens
                        </span>
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Coluna Direita: Totais, Estatísticas e Atalhos Rápidos */}
            <div className="md:col-span-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {/* Card de Resumo de Status */}
                <div className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4">
                  <div className="flex items-center gap-2 text-emerald-500 mb-1">
                    <CheckCircle2 size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Catálogo Operacional</span>
                  </div>
                  <p className="text-xs text-[var(--dash-text-secondary)] leading-relaxed">
                    Seus <strong className="text-[var(--dash-text-primary)]">{countNum} produtos</strong> estão visíveis para os clientes e prontos para receberem pedidos diretamente via WhatsApp e Catálogo Digital.
                  </p>
                </div>

                {/* Estatísticas resumidas */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3.5">
                    <div className="flex items-center gap-1.5 text-[var(--dash-text-secondary)] mb-1">
                      <Layers size={14} />
                      <span className="text-[11px] font-semibold">Categorias</span>
                    </div>
                    <p className="text-lg font-black text-[var(--dash-text-primary)]">
                      {categorySegments.length}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3.5">
                    <div className="flex items-center gap-1.5 text-[var(--dash-text-secondary)] mb-1">
                      <Package size={14} />
                      <span className="text-[11px] font-semibold">Média / Categ.</span>
                    </div>
                    <p className="text-lg font-black text-[var(--dash-text-primary)]">
                      {categorySegments.length > 0 ? Math.round(countNum / categorySegments.length) : countNum}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões de Ação Rápida */}
              <div className="space-y-2 pt-2">
                <Link
                  href="/dashboard/catalogo/gerenciador"
                  className="flex w-full items-center justify-between rounded-xl bg-primary px-4 py-3 text-xs font-bold text-white shadow-md hover:bg-primary/90 transition-all group"
                  onClick={onClose}
                >
                  <div className="flex items-center gap-2">
                    <Package size={16} />
                    <span>Ir para o Gerenciador de Catálogo</span>
                  </div>
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/dashboard/catalogo/configuracoes"
                  className="flex w-full items-center justify-between rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 py-3 text-xs font-bold text-[var(--dash-text-primary)] hover:border-primary/40 hover:bg-primary/5 transition-all"
                  onClick={onClose}
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal size={16} className="text-primary" />
                    <span>Gerenciar Categorias & Configurações</span>
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
