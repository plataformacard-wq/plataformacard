"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface DashboardStockSummaryProps {
  activeOrgId: string;
}

export default function DashboardStockSummary({ activeOrgId }: DashboardStockSummaryProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalStock: 0,
    inStock: 0,
    outOfStock: 0,
    lowStock: 0,
  });

  useEffect(() => {
    if (!activeOrgId) return;

    async function loadStockMetrics() {
      setLoading(true);
      try {
        // Buscar threshold da organização
        const { data: org } = await supabase
          .from("organizations")
          .select("low_stock_threshold")
          .eq("id", activeOrgId)
          .maybeSingle();

        const threshold = org?.low_stock_threshold ?? 5;

        // Buscar produtos ativos
        const { data: products } = await supabase
          .from("products")
          .select("is_in_stock, stock_quantity")
          .eq("organization_id", activeOrgId)
          .is("deleted_at", null);

        if (products) {
          const totalStock = products.reduce((sum, p) => sum + (p.stock_quantity || 0), 0);
          const inStock = products.filter((p) => p.is_in_stock).length;
          const outOfStock = products.filter(
            (p) => p.is_in_stock === false || (p.is_in_stock === null && p.stock_quantity === 0)
          ).length;
          const lowStock = products.filter(
            (p) => p.stock_quantity !== null && p.stock_quantity <= threshold
          ).length;

          setMetrics({ totalStock, inStock, outOfStock, lowStock });
        }
      } catch (err) {
        console.error("Erro ao carregar métricas de estoque no home:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStockMetrics();
  }, [activeOrgId, supabase]);

  if (loading) {
    return (
      <div className="h-32 flex items-center justify-center text-sm text-[var(--dash-text-muted)] bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[27px]">
        Carregando resumo do estoque...
      </div>
    );
  }

  return (
    <div className="rounded-[27px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Package size={20} />
          </div>
          <h3 className="font-bold text-[var(--dash-text-primary)]">Resumo do Estoque</h3>
        </div>

        <Link
          href="/dashboard/estoque"
          className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:underline"
        >
          Gerenciar Estoque
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Metrica 1 */}
        <div className="p-4 bg-[var(--dash-hover-bg)]/40 border border-[var(--dash-border)] rounded-2xl flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--dash-text-muted)]">
              Em Estoque
            </p>
            <p className="text-lg font-black text-[var(--dash-text-primary)] mt-0.5">
              {metrics.inStock} produtos
            </p>
          </div>
        </div>

        {/* Metrica 2 */}
        <div className="p-4 bg-[var(--dash-hover-bg)]/40 border border-[var(--dash-border)] rounded-2xl flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
            <AlertTriangle size={16} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--dash-text-muted)]">
              Esgotados
            </p>
            <p className="text-lg font-black text-[var(--dash-text-primary)] mt-0.5">
              {metrics.outOfStock} produtos
            </p>
          </div>
        </div>

        {/* Metrica 3 */}
        <div className="p-4 bg-[var(--dash-hover-bg)]/40 border border-[var(--dash-border)] rounded-2xl flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
            <AlertTriangle size={16} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--dash-text-muted)]">
              Baixo Estoque
            </p>
            <p className="text-lg font-black text-[var(--dash-text-primary)] mt-0.5">
              {metrics.lowStock} alertas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
