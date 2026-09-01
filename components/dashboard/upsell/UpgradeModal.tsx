"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Crown, Zap, X, CheckCircle2, ShieldCheck } from "lucide-react";
import { FeatureKey } from "@/lib/plans/feature-matrix";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: FeatureKey | null;
  targetPlan?: "pro" | "sales_team";
}

const FEATURE_DETAILS: Record<
  FeatureKey,
  { title: string; desc: string; targetPlan: "pro" | "sales_team"; benefits: string[] }
> = {
  ai_seo: {
    title: "Assistente de IA para Produtos e SEO",
    desc: "Gere títulos chamativos, descrições vendedoras e destaques otimizados para buscadores com 1 clique.",
    targetPlan: "pro",
    benefits: [
      "Geração ilimitada de títulos e descrições com IA",
      "Otimização automatizada de SEO para Google",
      "Sugestões de destaques de produtos para maior conversão",
    ],
  },
  bling_sync: {
    title: "Sincronização Automática de Estoque com o Bling V3",
    desc: "Conecte sua conta Bling e mantenha seu estoque e catálogo sincronizados em tempo real sem trabalho manual.",
    targetPlan: "pro",
    benefits: [
      "Atualização em tempo real de saldos de estoque via Webhook",
      "Suporte completo a variações de cores e tamanhos",
      "Prevenção de vendas sem estoque físico",
    ],
  },
  custom_domain: {
    title: "Domínio Próprio & Embed no seu Site",
    desc: "Utilize seu próprio endereço (ex: catalogo.sualoja.com.br) e incorpore seu catálogo digital em qualquer site.",
    targetPlan: "pro",
    benefits: [
      "Endereço personalizado com SSL gratuito",
      "Embbed de alta performance para o seu site atual",
      "Fortalecimento e autoridade da sua marca no Google",
    ],
  },
  sales_team: {
    title: "CRM Multi-Vendedores & Gestão de Equipe",
    desc: "Distribua leads automaticamente para a sua equipe de vendas e acompanhe o desempenho de cada atendente.",
    targetPlan: "sales_team",
    benefits: [
      "Painel dedicado para gerenciamento da equipe",
      "Roteamento de leads de WhatsApp entre vendedores",
      "Relatórios de conversão individuais",
    ],
  },
  caas_master: {
    title: "Gestão CaaS (Catálogo Master para Franquias)",
    desc: "Gerencie múltiplos catálogos filiais a partir de um único painel centralizado.",
    targetPlan: "sales_team",
    benefits: [
      "Catálogo mestre replicável para filiais",
      "Controle de alterações globais e regionais",
      "Gestão corporativa multi-unidades",
    ],
  },
  bulk_pricing: {
    title: "Ajuste de Preços & Promoções em Massa",
    desc: "Reajuste preços, aplique descontos percentuais ou edite produtos em lote de forma rápida e segura.",
    targetPlan: "sales_team",
    benefits: [
      "Edição de preços por categoria ou catálogo inteiro com 1 clique",
      "Sincronização direta com planilha Google Sheets",
      "Histórico de alterações em lote e reversão simplificada",
    ],
  },
  b2b_portal: {
    title: "Portal B2B & Vendas no Atacado",
    desc: "Crie tabelas de preços exclusivas por cliente via Google Sheets, links protegidos por WhatsApp OTP e pedidos rápidos em lote.",
    targetPlan: "sales_team",
    benefits: [
      "Tabelas de preços personalizadas sincronizadas via Google Sheets",
      "Links de acesso exclusivos com token e WhatsApp OTP (6 dígitos)",
      "Validação automática de CNPJ na Receita Federal (BrasilAPI)",
      "Sistema de ancoragem dinâmica de margens e cálculo de economia",
      "Pedido rápido em lote (Fast Order) com comprovante instantâneo no WhatsApp",
    ],
  },
};

export default function UpgradeModal({ isOpen, onClose, feature, targetPlan }: UpgradeModalProps) {
  if (!isOpen) return null;

  const detail = feature
    ? FEATURE_DETAILS[feature]
    : {
        title: "Desbloqueie o Poder Total do seu Catálogo",
        desc: "Faça o upgrade do seu plano para liberar automações avançadas, IA e sincronizações.",
        targetPlan: targetPlan || "pro",
        benefits: [
          "Automações e IA para otimização de produtos",
          "Sincronização de estoque em tempo real",
          "Domínio próprio e personalização avançada",
        ],
      };

  const planName = detail.targetPlan === "sales_team" ? "Sales Team" : "PRO";
  const planSlug = detail.targetPlan === "sales_team" ? "sales_team" : "pro";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg overflow-hidden rounded-[27px] border border-emerald-500/30 bg-[#121214] p-8 text-white shadow-2xl"
        >
          {/* Ambient Radial Glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl" />

          {/* Botão de Fechar */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white rounded-full bg-[var(--dash-surface)]/5 transition-colors"
          >
            <X size={18} />
          </button>

          {/* Cabeçalho */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-4 inline-flex items-center justify-center h-14 w-14 rounded-[27px] bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 text-emerald-400 shadow-lg">
              <Crown size={28} />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest mb-3">
              <Sparkles size={12} /> Exclusivo do Plano {planName}
            </div>

            <h3 className="text-2xl font-bold text-white tracking-tight">
              {detail.title}
            </h3>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              {detail.desc}
            </p>
          </div>

          {/* Lista de Benefícios */}
          <div className="mb-8 space-y-3 rounded-[27px] bg-[var(--dash-surface)]/5 border border-white/10 p-5">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">
              O que você ganha no Plano {planName}:
            </span>
            {detail.benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs font-medium text-zinc-200">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Selo de Garantia e Ações */}
          <div className="flex flex-col gap-3">
            <Link
              href={`/checkout?plan=${planSlug}&cycle=annual`}
              onClick={onClose}
              className="w-full py-4 rounded-lg bg-gradient-to-r from-[#2CCB68] to-[#06B6D4] text-[var(--dash-text-primary)] font-extrabold text-sm uppercase tracking-wider text-center shadow-[0_0_25px_rgba(44,203,104,0.3)] hover:shadow-[0_0_35px_rgba(44,203,104,0.5)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Zap size={18} fill="currentColor" />
              Fazer Upgrade para o Plano {planName}
            </Link>

            <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-zinc-500">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Garantia Incondicional de Reembolso de 7 Dias</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
