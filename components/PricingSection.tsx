"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckIcon, ChevronDown, ChevronUp, Table } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus_Jakarta_Sans } from "next/font/google";

import { PLANS, PlanSlug } from "@/lib/plans/feature-matrix";
import { PricingCard } from "@/components/landing-page/PricingCard";
import { PlanComparisonTable } from "@/components/landing-page/PlanComparisonTable";

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"]
});

function WhatsAppIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.8 5.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.015-1.04 2.476 1.064 2.872 1.213 3.071c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.575-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.81 11.81 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.48-8.413z" />
    </svg>
  );
}

export function PricingSection({ plans }: { plans: any[] }) {
  const [isAnnual, setIsAnnual] = useState(true);
  const [isTableOpen, setIsTableOpen] = useState(false);

  // Lista padrão de 4 planos para renderizar perfeitamente em 1 linha no desktop
  const defaultPlanKeys: PlanSlug[] = ["starter", "pro", "sales_team", "all_service"];
  
  const displayPlans = plans && plans.length > 0 ? plans : defaultPlanKeys.map(key => {
    const p = PLANS[key];
    return {
      id: p.slug,
      name: p.name,
      slug: p.slug,
      badge_text: p.badgeText,
      theme: p.slug === "pro" ? "green" : "dark",
      subtitle: p.slug === "starter" 
        ? "Para autônomos que estão começando." 
        : p.slug === "pro" 
        ? "Para lojistas que buscam automação." 
        : p.slug === "sales_team"
        ? "Para equipes e médias empresas."
        : "Para marcas, redes de franquias e catálogos matriz",
      features: p.slug === "starter" 
        ? ["Catálogo online sempre atualizado", "Taxa 0% em qualquer venda", "Status da conversa (CRM)", "Atualização de estoque a cada venda"] 
        : p.slug === "pro"
        ? ["Tudo do Starter", "Assistente de IA para Produtos e SEO", "Estoque Automatizado via Bling V3", "Domínio Próprio e Catálogo no seu Site"]
        : p.slug === "sales_team"
        ? ["Tudo do PRO", "Até 5.000 Produtos", "Até 10 Vendedores/Usuários", "Gestão Multi-Vendedor B2B", "Suporte Prioritário VIP"]
        : ["Tudo do PRO e Premium", "Painel de Gestão de Franquias", "Criação de Catálogos Matriz", "Produtos e Usuários Ilimitados", "Vendas no Varejo, Atacado e Franquias", "Gerente de Contas & Suporte VIP"],
      button_text: p.slug === "pro" ? "Assinar PRO" : "Assinar",
      button_url: `/checkout?plan=${p.slug}`
    };
  });

  return (
    <section id="planos" className="py-24 bg-transparent overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className={`text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white mb-4 ${plusJakarta.className}`}>
            Planos desenhados para o seu tamanho
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto mb-8">
            Você não precisa ser uma corporação gigante para usar tecnologia inteligente.
          </p>

          {/* Toggle Switch */}
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="inline-flex items-center bg-zinc-200/80 dark:bg-[#1c1c1e] border border-zinc-300 dark:border-white/10 rounded-full p-1 relative shadow-inner">
              <div 
                className={`absolute top-1 bottom-1 w-1/2 bg-[#2CCB68] rounded-full transition-transform duration-300 ease-in-out ${isAnnual ? 'translate-x-[96%]' : 'translate-x-1'}`}
              ></div>
              <button
                onClick={() => setIsAnnual(false)}
                className={`relative z-10 px-8 py-3 text-sm font-bold rounded-full transition-colors ${!isAnnual ? 'text-[#0A0A0A]' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
              >
                Mensal
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`relative z-10 px-8 py-3 text-sm font-bold rounded-full transition-colors ${isAnnual ? 'text-[#0A0A0A]' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
              >
                Anual
              </button>
            </div>
          </div>
        </div>

        {/* 📊 GRID EM 1 LINHA NO DESKTOP (4 COLUNAS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6 items-stretch max-w-[1550px] mx-auto">
          {displayPlans.map((plan: any) => (
            <PricingCard key={plan.id || plan.slug} plan={plan} isAnnual={isAnnual} />
          ))}
        </div>

        {/* 🔻 SANFONA EXPANSÍVEL: TABELA COMPARATIVA DE RECURSOS */}
        <div className="mt-12 text-center flex flex-col items-center max-w-[1550px] mx-auto">
          <button
            type="button"
            onClick={() => setIsTableOpen(!isTableOpen)}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white dark:bg-white/5 border border-zinc-300 dark:border-white/10 hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-zinc-900 dark:text-white font-bold text-sm sm:text-base transition-all shadow-md dark:shadow-lg active:scale-95 group"
          >
            <Table className="w-5 h-5 text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>
              {isTableOpen
                ? "Ocultar matriz comparativa de recursos"
                : "Comparar todas as funcionalidades e limites em detalhes"}
            </span>
            {isTableOpen ? (
              <ChevronUp className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            )}
          </button>

          <AnimatePresence>
            {isTableOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="w-full"
              >
                <PlanComparisonTable isAnnual={isAnnual} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
