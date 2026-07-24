"use client";

import React from "react";
import { Check, X, Sparkles } from "lucide-react";
import { PLANS } from "@/lib/plans/feature-matrix";

interface PlanComparisonTableProps {
  isAnnual: boolean;
}

export function PlanComparisonTable({ isAnnual }: PlanComparisonTableProps) {
  const planKeys = ["starter", "pro", "sales_team", "all_service"] as const;
  const planList = planKeys.map((key) => PLANS[key]);

  // Categorias da Tabela
  const categories = [
    {
      title: "💳 Investimento & Precificação",
      rows: [
        {
          label: "Valor do Plano",
          getValue: (p: typeof PLANS.starter) => {
            const price = isAnnual ? p.annualPrice : p.monthlyPrice;
            return `R$ ${price.toFixed(2).replace(".", ",")}/mês`;
          },
          highlight: true,
        },
        {
          label: "Economia Anual",
          getValue: (p: typeof PLANS.starter) => {
            if (!isAnnual || p.annualDiscountValue <= 0) return "—";
            return `R$ ${(p.annualDiscountValue * 12).toFixed(2).replace(".", ",")} OFF`;
          },
          badge: true,
        },
        {
          label: "Taxa sobre Vendas",
          getValue: () => "0% (Isento)",
          badge: false,
        },
      ],
    },
    {
      title: "📦 Capacidade & Limites",
      rows: [
        {
          label: "Limite de Produtos",
          getValue: (p: typeof PLANS.starter) =>
            p.maxProducts >= 9999 ? "Ilimitado" : `${p.maxProducts.toLocaleString("pt-BR")} produtos`,
        },
        {
          label: "Limite de Usuários / Vendedores",
          getValue: (p: typeof PLANS.starter) =>
            p.maxUsers >= 99 ? "Ilimitado" : `${p.maxUsers} ${p.maxUsers === 1 ? "usuário" : "usuários"}`,
        },
      ],
    },
    {
      title: "⚡ Automação & Funcionalidades",
      rows: [
        {
          label: "Vitrine Digital & Checkout WhatsApp",
          checkMap: { starter: true, pro: true, sales_team: true, all_service: true },
        },
        {
          label: "Subdomínio Exclusivo PlataformaShop",
          checkMap: { starter: true, pro: true, sales_team: true, all_service: true },
        },
        {
          label: "Domínio Próprio SSL (sualoja.com.br)",
          customTextMap: {
            starter: false,
            pro: "✓ 1 Domínio",
            sales_team: "✓ 1 Domínio",
            all_service: "✓ Multi-Domínio",
          },
        },
        {
          label: "Assistente de IA para SEO (Gemini)",
          checkMap: { starter: false, pro: true, sales_team: true, all_service: true },
        },
        {
          label: "Sincronização de Estoque Bling ERP (V3)",
          checkMap: { starter: false, pro: true, sales_team: true, all_service: true },
        },
        {
          label: "Inteligência de Esgotados & Reordenamento",
          checkMap: { starter: false, pro: true, sales_team: true, all_service: true },
        },
        {
          label: "Multi-Vendedor & CRM Kanban B2B",
          customTextMap: {
            starter: false,
            pro: false,
            sales_team: "✓ Até 10 Vendedores",
            all_service: "✓ Ilimitado",
          },
        },
        {
          label: "Catálogo Mestre CaaS & Gestão de Franquias",
          customTextMap: {
            starter: false,
            pro: false,
            sales_team: false,
            all_service: "✓ (/dashboard/franquias)",
          },
        },
        {
          label: "Ajuste de Preços em Massa (Bulk Pricing)",
          checkMap: { starter: false, pro: false, sales_team: true, all_service: true },
        },
      ],
    },
    {
      title: "🎧 Suporte & Atendimento",
      rows: [
        {
          label: "Suporte Humano (Seg a Sex)",
          customTextMap: {
            starter: "✓ E-mail / Ticket",
            pro: "✓ E-mail / Ticket",
            sales_team: "✓ E-mail / Ticket",
            all_service: "✓ E-mail / Ticket",
          },
        },
        {
          label: "Atendimento Direto via WhatsApp",
          customTextMap: {
            starter: false,
            pro: "✓ Prioritário",
            sales_team: "✓ Fila VIP",
            all_service: "✓ Direto com Especialista",
          },
        },
        {
          label: "Onboarding & Auxílio na Configuração",
          customTextMap: {
            starter: "Central de Ajuda",
            pro: "Central de Ajuda",
            sales_team: "✓ Suporte no Setup",
            all_service: "✓ Onboarding VIP Guiado",
          },
        },
      ],
    },
  ];

  return (
    <div className="w-full bg-white dark:bg-[#0d0d0f] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-8 shadow-xl dark:shadow-2xl overflow-hidden text-zinc-900 dark:text-white mt-8 transition-colors">
      {/* Título da Tabela */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            Matriz Comparativa de Recursos
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            Compare todas as funcionalidades e limites detalhados de cada plano no ciclo{" "}
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{isAnnual ? "Anual" : "Mensal"}</span>.
          </p>
        </div>
      </div>

      {/* Tabela Responsiva */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          {/* Cabeçalho das Colunas */}
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-white/5">
              <th className="py-4 px-4 text-xs uppercase tracking-wider font-extrabold text-zinc-500 dark:text-zinc-400 w-1/3">
                Recurso / Funcionalidade
              </th>
              {planList.map((p) => (
                <th
                  key={p.slug}
                  className={`py-4 px-3 text-center text-xs sm:text-sm font-extrabold uppercase tracking-wider ${
                    p.slug === "pro" ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" : "text-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>{p.name}</span>
                    {p.badgeText && (
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-black ${
                          p.slug === "pro"
                            ? "bg-emerald-500 text-black"
                            : p.slug === "all_service"
                            ? "bg-purple-600 text-white dark:bg-purple-500"
                            : "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200"
                        }`}
                      >
                        {p.badgeText}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Corpo da Tabela */}
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
            {categories.map((cat, catIdx) => (
              <React.Fragment key={catIdx}>
                {/* Linha de Categoria */}
                <tr className="bg-zinc-100/80 dark:bg-zinc-900/80">
                  <td
                    colSpan={5}
                    className="py-3 px-4 text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 border-t border-b border-zinc-200 dark:border-zinc-800"
                  >
                    {cat.title}
                  </td>
                </tr>

                {/* Linhas de Recursos */}
                {cat.rows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3.5 px-4 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {row.label}
                    </td>

                    {planKeys.map((key) => {
                      const planDef = PLANS[key];
                      let content: React.ReactNode = null;

                      if ("getValue" in row && row.getValue) {
                        const val = row.getValue(planDef);
                        const isHighlight = Boolean((row as any).highlight);
                        const isBadge = Boolean((row as any).badge);
                        content = (
                          <span
                            className={`font-bold ${
                              isHighlight ? "text-white text-sm" : isBadge ? "text-emerald-400 text-xs" : "text-zinc-300 text-xs"
                            }`}
                          >
                            {val}
                          </span>
                        );
                      } else if ("checkMap" in row && row.checkMap) {
                        const isChecked = row.checkMap[key];
                        content = isChecked ? (
                          <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400">
                            <Check className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500/10 text-red-400/60">
                            <X className="w-4 h-4" />
                          </div>
                        );
                      } else if ("customTextMap" in row && row.customTextMap) {
                        const customVal = row.customTextMap[key];
                        if (customVal === true) {
                          content = (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400">
                              <Check className="w-4 h-4" />
                            </div>
                          );
                        } else if (customVal === false) {
                          content = (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500/10 text-red-400/60">
                              <X className="w-4 h-4" />
                            </div>
                          );
                        } else {
                          content = (
                            <span className="text-xs font-bold text-zinc-300">
                              {customVal}
                            </span>
                          );
                        }
                      }

                      return (
                        <td
                          key={key}
                          className={`py-3.5 px-3 text-center ${
                            key === "pro" ? "bg-emerald-500/[0.03]" : ""
                          }`}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
