"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getOrganizationStats, getOrganizationById } from "@/lib/admin-actions";
import { getPlanName } from "@/lib/plans";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  Check, 
  ArrowUpRight, 
  ShieldCheck, 
  Package, 
  Users, 
  HelpCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Table
} from "lucide-react";

import { PLANS, PlanSlug } from "@/lib/plans/feature-matrix";
import { PricingCard } from "@/components/landing-page/PricingCard";
import { PlanComparisonTable } from "@/components/landing-page/PlanComparisonTable";

interface Plan {
  id: string;
  name: string;
  slug?: string;
  price_monthly: number;
  max_products: number;
  max_users: number;
  max_images_per_product: number;
  checkout_url: string | null;
}

export default function AssinaturaClient() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [businessModel, setBusinessModel] = useState<"B2B" | "B2C">("B2C");
  const [stats, setStats] = useState<{ products: number; sellers: number } | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [isAnnual, setIsAnnual] = useState(true);
  const [isTableOpen, setIsTableOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch user profile and organization
        let { data: profile } = await supabase
          .from("profiles")
          .select("organization_id, id, role")
          .eq("id", user.id)
          .maybeSingle();

        if (!profile) {
          const { data: profileByUid } = await supabase
            .from("profiles")
            .select("organization_id, id, role")
            .eq("user_id", user.id)
            .maybeSingle();
          profile = profileByUid;
        }

        const shadowOrgId = document.cookie
          .split("; ")
          .find((row) => row.startsWith("shadow_org_id="))
          ?.split("=")[1];

        const isSuperAdmin = profile?.role === "main_admin";
        const activeOrgId = (isSuperAdmin && shadowOrgId) ? shadowOrgId : profile?.organization_id;

        if (activeOrgId) {
          setOrgId(activeOrgId);

          // Get organization details
          const org = await getOrganizationById(activeOrgId);
          if (org) {
            setCurrentPlanId(org.plan_id || null);
            setBusinessModel(org.business_model as "B2B" | "B2C" || "B2C");
          }

          // Get stats
          const statsRes = await getOrganizationStats(activeOrgId);
          if (statsRes.success) {
            setStats({
              products: statsRes.stats.products,
              sellers: statsRes.stats.sellers,
            });
          }

          // Fetch plans from database
          const { data: plansData, error: plansErr } = await supabase
            .from("plans")
            .select("*")
            .order("price_monthly", { ascending: true });

          if (plansErr) throw plansErr;
          setPlans(plansData || []);
        }
      } catch (err: any) {
        console.error("Erro ao carregar dados financeiros:", err);
        setErrorMsg("Não foi possível carregar os dados de assinatura.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-[var(--dash-text-muted)]">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-sm font-semibold uppercase tracking-widest">Carregando informações da sua assinatura...</p>
      </div>
    );
  }

  const getCheckoutUrl = (planId: string) => {
    return `/sandbox-checkout/${planId}?org_id=${orgId}`;
  };

  // Encontra o plano ativo da organização com fallback robusto
  const currentPlan = plans.find(p => p.id === currentPlanId || p.slug === currentPlanId) || plans[0] || {
    id: "starter",
    name: "Starter",
    max_products: 1000,
    max_users: 1,
    max_images_per_product: 5,
    price_monthly: 5990,
    checkout_url: null,
  };

  // Mapeamento dos 4 planos em 1 linha
  const defaultPlanKeys: PlanSlug[] = ["starter", "pro", "sales_team", "all_service"];
  
  const displayPlans = defaultPlanKeys.map((key) => {
    const p = PLANS[key];
    const dbPlan = plans.find((dp) => 
      dp.id === currentPlanId || 
      dp.slug === key || 
      dp.name?.toLowerCase().includes(key.replace('_', '')) ||
      (key === 'all_service' && (dp.name?.toLowerCase().includes('all') || dp.name?.toLowerCase().includes('franqueador')))
    );
    const planId = dbPlan?.id || key;

    // Detecta se este card é o plano contratado pela organização
    let isCurrent = false;
    if (currentPlanId) {
      const matchDbPlan = plans.find(p => p.id === currentPlanId || p.slug === currentPlanId);
      if (matchDbPlan) {
        const matchName = (matchDbPlan.name || '').toLowerCase();
        const matchSlug = (matchDbPlan.slug || '').toLowerCase();
        if (key === 'starter' && (matchName.includes('start') || matchSlug.includes('start'))) isCurrent = true;
        else if (key === 'pro' && (matchName.includes('pro') || matchSlug.includes('pro'))) isCurrent = true;
        else if (key === 'sales_team' && (matchName.includes('sales') || matchName.includes('team') || matchSlug.includes('sales'))) isCurrent = true;
        else if (key === 'all_service' && (matchName.includes('all') || matchName.includes('franqueador') || matchSlug.includes('all'))) isCurrent = true;
      } else {
        const curLow = currentPlanId.toLowerCase();
        if (key === 'starter' && curLow.includes('start')) isCurrent = true;
        else if (key === 'pro' && curLow.includes('pro')) isCurrent = true;
        else if (key === 'sales_team' && (curLow.includes('sales') || curLow.includes('team'))) isCurrent = true;
        else if (key === 'all_service' && (curLow.includes('all') || curLow.includes('franqueador'))) isCurrent = true;
      }
    } else {
      // Se não houver plan_id salvo na org, define o Starter como plano ativo inicial
      if (key === 'starter') isCurrent = true;
    }

    return {
      id: planId,
      name: p.name,
      slug: p.slug,
      badge_text: isCurrent ? "✓ PLANO ATIVO" : (p.slug === "pro" ? "Mais Popular" : p.badgeText),
      theme: isCurrent ? "green" : (p.slug === "pro" ? "green" : "dark"),
      subtitle: p.slug === "starter" 
        ? "Para autônomos que estão começando." 
        : p.slug === "pro" 
        ? "Para lojistas que buscam automação." 
        : p.slug === "sales_team"
        ? "Para equipes e médias empresas."
        : "Para marcas, redes de franquias e catálogos matriz",
      features: p.slug === "starter" 
        ? ["Catálogo online sempre atualizado", "Até 1.000 produtos catalogados", "Taxa 0% em qualquer venda", "Status da conversa (CRM)", "Atualização de estoque a cada venda"] 
        : p.slug === "pro"
        ? ["Tudo do Starter", "Até 3.000 produtos catalogados", "Assistente de IA para Produtos e SEO", "Estoque Automatizado via Bling V3", "Domínio Próprio no seu Site"]
        : p.slug === "sales_team"
        ? ["Tudo do PRO", "Até 5.000 produtos catalogados", "Até 10 Vendedores/Usuários B2B", "Gestão Multi-Vendedor com Comissão", "Suporte Prioritário VIP via WhatsApp"]
        : ["Tudo do PRO e Sales Team", "Produtos e Usuários Ilimitados", "Painel de Gestão de Franquias & Matriz", "Vendas no Varejo, Atacado e B2B", "Gerente de Contas Dedicado & Suporte VIP"],
      button_text: isCurrent ? "✓ SEU PLANO ATUAL" : (p.slug === "pro" ? "Assinar PRO" : "Assinar Plano"),
      button_url: isCurrent ? undefined : getCheckoutUrl(planId),
      isCurrent,
    };
  });

  return (
    <div className="w-full space-y-10 pb-20">
      {/* Header Premium */}
      <div className="relative overflow-hidden bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-lg p-10 shadow-sm group/header">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none opacity-50 transition-opacity" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-[var(--dash-text-primary)]">Assinatura & Planos</h1>
            <p className="text-[var(--dash-text-muted)] font-medium max-w-xl">
              Gerencie seus limites de uso, faturamento e faça upgrade de plano para expandir sua vitrine digital.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-lg px-6 py-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner">
              <CreditCard size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--dash-text-muted)]">Plano Atual</p>
              <h3 className="text-lg font-black text-emerald-500 uppercase tracking-tight">{getPlanName(currentPlanId)}</h3>
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-6 py-4 text-sm text-red-300 text-center font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Uso de Recursos */}
      {stats && currentPlan && (
        <section className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-lg p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="text-emerald-500 animate-pulse" size={24} />
            <h3 className="text-xl font-bold tracking-tight">Utilização do Plano</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Produtos */}
            <div className="space-y-3 p-6 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="text-emerald-500" size={18} />
                  <span className="text-sm font-bold">Produtos Cadastrados</span>
                </div>
                <span className="text-xs font-black">
                  {stats.products} / {currentPlan.max_products > 0 ? currentPlan.max_products : "Ilimitado"}
                </span>
              </div>
              <div className="h-2 w-full bg-[var(--dash-bg)] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${currentPlan.max_products > 0 ? Math.min((stats.products / currentPlan.max_products) * 100, 100) : 100}%` 
                  }}
                  className={`h-full rounded-full ${
                    currentPlan.max_products > 0 && stats.products >= currentPlan.max_products 
                      ? "bg-red-500" 
                      : "bg-emerald-500"
                  }`}
                />
              </div>
              <p className="text-[10px] text-[var(--dash-text-muted)] font-medium leading-relaxed">
                {currentPlan.max_products > 0 
                  ? `Você utilizou ${Math.round((stats.products / currentPlan.max_products) * 100)}% do limite de ${currentPlan.max_products} produtos.`
                  : "Seu plano permite o cadastro ilimitado de produtos!"}
              </p>
            </div>

            {/* Vendedores */}
            {businessModel === "B2B" && (
              <div className="space-y-3 p-6 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="text-emerald-500" size={18} />
                    <span className="text-sm font-bold">Vendedores Ativos</span>
                  </div>
                  <span className="text-xs font-black">
                    {stats.sellers} / {currentPlan.max_users > 0 ? currentPlan.max_users : "Ilimitado"}
                  </span>
                </div>
                <div className="h-2 w-full bg-[var(--dash-bg)] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${currentPlan.max_users > 0 ? Math.min((stats.sellers / currentPlan.max_users) * 100, 100) : 100}%` 
                    }}
                    className={`h-full rounded-full ${
                      currentPlan.max_users > 0 && stats.sellers >= currentPlan.max_users 
                        ? "bg-red-500" 
                        : "bg-emerald-500"
                    }`}
                  />
                </div>
                <p className="text-[10px] text-[var(--dash-text-muted)] font-medium leading-relaxed">
                  {currentPlan.max_users > 0 
                    ? `Você utilizou ${Math.round((stats.sellers / currentPlan.max_users) * 100)}% do limite de ${currentPlan.max_users} vendedores.`
                    : "Seu plano permite vendedores ilimitados!"}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Grid de Planos Espelhado da Landing Page */}
      <div className="space-y-10">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--dash-text-primary)]">
            Escolha o Plano Ideal para seu Negócio
          </h2>
          <p className="text-[var(--dash-text-muted)] text-base max-w-xl mx-auto font-medium">
            Cresça sua vitrine digital com inteligência, sem surpresas no faturamento.
          </p>

          {/* Toggle Switch Mensal / Anual Perfeitamente Alinhado */}
          <div className="flex flex-col items-center justify-center gap-3 pt-2">
            <div className="inline-flex items-center bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-full p-1 relative shadow-inner">
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#2CCB68] rounded-full transition-transform duration-300 ease-in-out ${
                  isAnnual ? 'left-1 translate-x-full' : 'left-1 translate-x-0'
                }`}
              />
              <button
                type="button"
                onClick={() => setIsAnnual(false)}
                className={`relative z-10 w-32 py-2.5 text-xs font-black rounded-full transition-colors text-center cursor-pointer ${
                  !isAnnual ? 'text-[#0A0A0A]' : 'text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]'
                }`}
              >
                Mensal
              </button>
              <button
                type="button"
                onClick={() => setIsAnnual(true)}
                className={`relative z-10 w-32 py-2.5 text-xs font-black rounded-full transition-colors text-center cursor-pointer ${
                  isAnnual ? 'text-[#0A0A0A]' : 'text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]'
                }`}
              >
                Anual
              </button>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 shadow-xs">
              <span>🔥 20% OFF no faturamento anual</span>
            </div>
          </div>
        </div>

        {/* 📊 GRID EM 1 LINHA NO DESKTOP (4 COLUNAS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6 items-stretch max-w-[1550px] mx-auto">
          {displayPlans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} isAnnual={isAnnual} isInteractive={true} />
          ))}
        </div>

        {/* 🔻 SANFONA EXPANSÍVEL: TABELA COMPARATIVA DE RECURSOS */}
        <div className="mt-12 text-center flex flex-col items-center max-w-[1550px] mx-auto pt-6">
          <button
            type="button"
            onClick={() => setIsTableOpen(!isTableOpen)}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded bg-[var(--dash-surface)] border border-[var(--dash-border)] hover:border-emerald-500/50 hover:bg-emerald-500/10 text-[var(--dash-text-primary)] font-bold text-sm transition-all shadow-md active:scale-95 group"
          >
            <Table className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
            <span>
              {isTableOpen
                ? "Ocultar matriz comparativa de recursos"
                : "Comparar todas as funcionalidades e limites em detalhes"}
            </span>
            {isTableOpen ? (
              <ChevronUp className="w-5 h-5 text-emerald-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-emerald-500" />
            )}
          </button>

          <AnimatePresence>
            {isTableOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full mt-8 overflow-hidden text-left"
              >
                <PlanComparisonTable isAnnual={isAnnual} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Rodapé Informativo */}
      <div className="rounded-lg border border-dashed border-[var(--dash-border)] p-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-[var(--dash-surface)]">
        <div className="flex items-start gap-3">
          <HelpCircle className="text-[var(--dash-text-muted)] shrink-0 mt-1" size={20} />
          <div>
            <h4 className="font-bold text-sm text-[var(--dash-text-primary)]">Faturamento e Cancelamento</h4>
            <p className="text-xs text-[var(--dash-text-muted)] mt-1 max-w-xl">
              Nossas assinaturas são gerenciadas de forma segura. Você pode alterar seu plano ou cancelar a renovação da sua assinatura a qualquer momento com total transparência.
            </p>
          </div>
        </div>
        <button
          onClick={() => window.open(`https://wa.me/5548999999999?text=Olá,%20gostaria%20de%20tirar%20dúvidas%20sobre%20o%20faturamento%20do%20PlataformaShop%20da%20minha%20org:%20${orgId}`, '_blank')}
          className="px-6 py-3 rounded-lg border border-[var(--dash-border)] hover:bg-[var(--dash-hover-bg)] font-bold text-xs uppercase tracking-widest text-[var(--dash-text-primary)] transition-all shrink-0 active:scale-95"
        >
          Falar com Suporte
        </button>
      </div>
    </div>
  );
}
