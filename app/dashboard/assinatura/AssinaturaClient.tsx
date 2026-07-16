"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getOrganizationStats, getOrganizationById } from "@/lib/admin-actions";
import { getPlanName } from "@/lib/plans";
import { motion } from "framer-motion";
import { 
  CreditCard, 
  Check, 
  ArrowUpRight, 
  ShieldCheck, 
  Sparkles, 
  Package, 
  Users, 
  AlertTriangle,
  HelpCircle,
  Loader2
} from "lucide-react";

interface Plan {
  id: string;
  name: string;
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
    // Redireciona para o Mock de Pagamentos (Ambiente de Sandbox)
    return `/sandbox-checkout/${planId}?org_id=${orgId}`;
  };

  const formatPrice = (priceCents: number) => {
    return `R$ ${(priceCents / 100).toFixed(2).replace(".", ",")}`;
  };

  // Find active plan details
  const currentPlan = plans.find(p => p.id === currentPlanId);

  return (
    <div className="w-full space-y-10 pb-20">
      {/* Header Premium */}
      <div className="relative overflow-hidden bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-xl p-10 shadow-sm group/header">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none opacity-50 transition-opacity" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-[var(--dash-text-primary)]">Assinatura & Planos</h1>
            <p className="text-[var(--dash-text-muted)] font-medium max-w-xl">
              Gerencie seus limites de uso, faturamento e faça upgrade de plano para expandir sua vitrine digital.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl px-6 py-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <CreditCard size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--dash-text-muted)]">Plano Atual</p>
              <h3 className="text-lg font-black text-primary uppercase tracking-tight">{getPlanName(currentPlanId)}</h3>
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
        <section className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-xl p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="text-primary animate-pulse" size={24} />
            <h3 className="text-xl font-bold tracking-tight">Utilização do Plano</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Produtos */}
            <div className="space-y-3 p-6 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="text-primary" size={18} />
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
              <div className="space-y-3 p-6 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="text-primary" size={18} />
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

      {/* Grid de Planos */}
      <div>
        <h2 className="text-2xl font-black tracking-tight text-[var(--dash-text-primary)] text-center mb-10">
          Escolha o Plano Ideal para seu Negócio
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlanId;
            const isFree = plan.price_monthly === 0 || plan.name.toLowerCase() === 'free' || plan.name.toLowerCase() === 'start';

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -6 }}
                className={`relative rounded-xl border bg-[var(--dash-surface)] p-8 shadow-md flex flex-col min-h-[500px] overflow-hidden transition-all ${
                  isCurrent 
                    ? "border-primary shadow-lg ring-1 ring-primary" 
                    : "border-[var(--dash-border)] hover:border-zinc-700"
                }`}
              >
                {/* Destaque do Plano Ativo */}
                {isCurrent && (
                  <div className="absolute top-4 right-4 bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                    Plano Ativo
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-xl font-black uppercase tracking-wider">{plan.name}</h3>
                  <div className="flex items-baseline text-[var(--dash-text-primary)]">
                    <span className="text-4xl font-extrabold tracking-tight">
                      {formatPrice(plan.price_monthly)}
                    </span>
                    <span className="ml-1 text-xs text-[var(--dash-text-muted)] font-semibold">/mês</span>
                  </div>
                </div>

                {/* Benefícios e Recursos */}
                <ul className="mt-8 space-y-4 flex-1">
                  <li className="flex items-start gap-3 text-sm">
                    <Check className="text-primary shrink-0 mt-0.5" size={16} />
                    <span>
                      Até <strong className="text-white">{plan.max_products > 0 ? plan.max_products : "Ilimitados"}</strong> produtos
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <Check className="text-primary shrink-0 mt-0.5" size={16} />
                    <span>
                      Até <strong className="text-white">{plan.max_images_per_product}</strong> fotos por produto
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <Check className="text-primary shrink-0 mt-0.5" size={16} />
                    <span>
                      Até <strong className="text-white">{plan.max_users > 0 ? plan.max_users : "Ilimitados"}</strong> vendedores (B2B)
                    </span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <Check className="text-primary shrink-0 mt-0.5" size={16} />
                    <span>Suporte WhatsApp prioritário</span>
                  </li>
                </ul>

                {/* Botão de Ação */}
                <div className="mt-8 pt-6 border-t border-[var(--dash-border)]">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full bg-[var(--dash-hover-bg)] text-[var(--dash-text-muted)] border border-[var(--dash-border)] rounded-xl py-4 text-xs font-black uppercase tracking-widest cursor-not-allowed"
                    >
                      Plano Ativo
                    </button>
                  ) : isFree ? (
                    <button
                      disabled
                      className="w-full bg-[var(--dash-hover-bg)] text-[var(--dash-text-muted)] border border-[var(--dash-border)] rounded-xl py-4 text-xs font-black uppercase tracking-widest cursor-not-allowed"
                    >
                      Disponível via Suporte
                    </button>
                  ) : (
                    <a
                      href={getCheckoutUrl(plan.id)}
                      className="flex items-center justify-center gap-2 w-full bg-primary text-white rounded-xl py-4 text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-98 transition-all shadow-lg shadow-primary/20 group"
                    >
                      Assinar Plano
                      <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Rodapé Informativo */}
      <div className="rounded-xl border border-dashed border-[var(--dash-border)] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-3">
          <HelpCircle className="text-[var(--dash-text-muted)] shrink-0 mt-1" size={20} />
          <div>
            <h4 className="font-bold text-sm text-[var(--dash-text-primary)]">Faturamento e Cancelamento</h4>
            <p className="text-xs text-[var(--dash-text-muted)] mt-1 max-w-xl">
              Nossas assinaturas são gerenciadas de forma segura. Você pode cancelar a renovação da sua assinatura a qualquer momento diretamente no seu painel de controle do gateway ou entrando em contato com o suporte.
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
