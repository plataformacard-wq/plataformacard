"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Package,
  Eye,
  MessageSquare,
  Tag,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Loader2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export interface ProductStatusData {
  id: string;
  name: string;
  sku?: string | null;
  image_url?: string | null;
  stock_quantity?: number | null;
  is_in_stock?: boolean | null;
  price?: number | null;
  compare_at_price?: number | null;
  promotional_price?: number | null;
  categories?: { name?: string } | null;
  category_name?: string | null;
  hasBlingConnection?: boolean;
}

interface ProductStatusModalProps {
  product: ProductStatusData | null;
  isOpen: boolean;
  onClose: () => void;
  hasBlingConnection?: boolean;
}

export function ProductStatusModal({
  product,
  isOpen,
  onClose,
  hasBlingConnection = false,
}: ProductStatusModalProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [productViews, setProductViews] = useState<number>(0);
  const [whatsappLeads, setWhatsappLeads] = useState<number>(0);

  useEffect(() => {
    if (!product?.id || !isOpen) return;

    async function fetchProductAnalytics() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("analytics_events")
          .select("event_type")
          .eq("product_id", product!.id);

        if (!error && data) {
          let views = 0;
          let whatsapp = 0;
          data.forEach((evt) => {
            if (
              evt.event_type === "whatsapp_click" ||
              evt.event_type === "conversations_started"
            ) {
              whatsapp++;
            } else {
              views++;
            }
          });
          setProductViews(views);
          setWhatsappLeads(whatsapp);
        } else {
          setProductViews(0);
          setWhatsappLeads(0);
        }
      } catch (err) {
        console.error("Erro ao carregar métricas do produto:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProductAnalytics();
  }, [product?.id, isOpen]);

  if (!isOpen || !product) return null;

  const qty = product.stock_quantity ?? 0;
  const isInStock = (product.is_in_stock ?? true) && qty > 0;
  const isLowStock = isInStock && qty <= 5;
  const isOutOfStock = !product.is_in_stock || qty <= 0;

  const priceFormatted =
    product.price != null
      ? new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(product.price)
      : "R$ 0,00";

  const promoPriceVal = product.compare_at_price || product.promotional_price;
  const promoPriceFormatted =
    promoPriceVal != null && promoPriceVal > 0
      ? new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(promoPriceVal)
      : null;

  const categoriesProp: any = product.categories;
  const categoryName =
    (Array.isArray(categoriesProp) ? categoriesProp[0]?.name : categoriesProp?.name) ||
    product.category_name ||
    "Sem categoria";

  const handleNavigateToStock = () => {
    onClose();
    router.push(`/dashboard/estoque?search=${encodeURIComponent(product.name)}`);
  };

  const handleNavigateToCatalog = () => {
    onClose();
    router.push(`/dashboard/catalogo?search=${encodeURIComponent(product.name)}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-[27px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 md:p-8 shadow-2xl space-y-6"
        >
          {/* Header do Modal */}
          <div className="flex items-start justify-between border-b border-[var(--dash-border)] pb-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-bg)] flex items-center justify-center shadow-inner">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package size={28} className="text-[var(--dash-text-muted)] opacity-50" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    <Sparkles size={11} /> Raio-X Status 360°
                  </span>
                  {hasBlingConnection && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <ShieldCheck size={11} /> Bling Sync
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-extrabold text-[var(--dash-text-primary)] truncate">
                  {product.name}
                </h2>
                <p className="text-xs font-mono text-[var(--dash-text-muted)] mt-0.5">
                  SKU: {product.sku || "N/A"} • {categoryName}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-2 text-[var(--dash-text-muted)] hover:bg-[var(--dash-hover-bg)] hover:text-[var(--dash-text-primary)] transition-all shrink-0"
            >
              <X size={20} />
            </button>
          </div>

          {/* Grid de 4 Cards de Métricas (KPIs 360°) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: Estoque Físico */}
            <div className="p-4 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-bg)]/60 flex flex-col justify-between space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--dash-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <Package size={14} className="text-blue-500" /> Estoque Físico
                </span>
                {isOutOfStock ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-500/10 text-red-500 border border-red-500/20">
                    Esgotado
                  </span>
                ) : isLowStock ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    Baixo
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Disponível
                  </span>
                )}
              </div>

              <div>
                <div className="text-2xl font-black text-[var(--dash-text-primary)]">
                  {qty.toLocaleString()} <span className="text-xs font-medium opacity-60">unidades</span>
                </div>
                <p className="text-[11px] text-[var(--dash-text-muted)] mt-1">
                  {hasBlingConnection
                    ? "Sincronizado automaticamente via Bling ERP"
                    : "Gestão manual local ativa no sistema"}
                </p>
              </div>
            </div>

            {/* Card 2: Visualizações & Cliques */}
            <div className="p-4 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-bg)]/60 flex flex-col justify-between space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--dash-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <Eye size={14} className="text-indigo-500" /> Cliques / Acessos
                </span>
                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                  Últimos 30d
                </span>
              </div>

              <div>
                <div className="text-2xl font-black text-[var(--dash-text-primary)] flex items-center gap-2">
                  {loading ? (
                    <Loader2 size={20} className="animate-spin text-indigo-500" />
                  ) : (
                    productViews.toLocaleString()
                  )}
                  <span className="text-xs font-medium opacity-60">visualizações</span>
                </div>
                <p className="text-[11px] text-[var(--dash-text-muted)] mt-1">
                  Interações de clientes no catálogo online
                </p>
              </div>
            </div>

            {/* Card 3: Leads de WhatsApp */}
            <div className="p-4 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-bg)]/60 flex flex-col justify-between space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--dash-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-emerald-500" /> Conversas / Leads
                </span>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  WhatsApp
                </span>
              </div>

              <div>
                <div className="text-2xl font-black text-[var(--dash-text-primary)] flex items-center gap-2">
                  {loading ? (
                    <Loader2 size={20} className="animate-spin text-emerald-500" />
                  ) : (
                    whatsappLeads.toLocaleString()
                  )}
                  <span className="text-xs font-medium opacity-60">iniciadas</span>
                </div>
                <p className="text-[11px] text-[var(--dash-text-muted)] mt-1">
                  Clientes que acionaram orçamentos no WhatsApp
                </p>
              </div>
            </div>

            {/* Card 4: Ficha Comercial / Preço */}
            <div className="p-4 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-bg)]/60 flex flex-col justify-between space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--dash-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <Tag size={14} className="text-amber-500" /> Valor de Tabela
                </span>
                {promoPriceFormatted && (
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    Promoção Ativa
                  </span>
                )}
              </div>

              <div>
                <div className="text-2xl font-black text-[var(--dash-text-primary)] flex items-baseline gap-2">
                  {promoPriceFormatted ? (
                    <>
                      <span className="text-emerald-500">{promoPriceFormatted}</span>
                      <span className="text-xs text-[var(--dash-text-muted)] line-through">
                        {priceFormatted}
                      </span>
                    </>
                  ) : (
                    <span>{priceFormatted}</span>
                  )}
                </div>
                <p className="text-[11px] text-[var(--dash-text-muted)] mt-1">
                  Preço de tabela configurado para este modelo
                </p>
              </div>
            </div>
          </div>

          {/* Botões de Ação Rápidas no Rodapé */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-[var(--dash-border)]/50">
            <button
              onClick={handleNavigateToStock}
              className="w-full flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-extrabold text-white hover:bg-primary/90 transition-all shadow-md active:scale-95"
            >
              Ver na Tabela de Estoque
              <ArrowRight size={15} />
            </button>
            <button
              onClick={handleNavigateToCatalog}
              className="w-full flex-1 flex items-center justify-center gap-2 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-hover-bg)] px-4 py-3 text-xs font-extrabold text-[var(--dash-text-primary)] hover:bg-[var(--dash-border)] transition-all active:scale-95"
            >
              Editar no Catálogo
              <ExternalLink size={15} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
