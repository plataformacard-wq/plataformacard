"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChevronRight } from "lucide-react";
import StockIntelligenceSection from "@/components/dashboard/StockIntelligenceSection";
import DashboardAlerts from "@/components/dashboard/home/DashboardAlerts";
import DashboardKpiGrid from "@/components/dashboard/home/DashboardKpiGrid";
import DashboardQuickActions from "@/components/dashboard/home/DashboardQuickActions";
import DashboardTeamList from "@/components/dashboard/home/DashboardTeamList";

import { Package, Eye, MousePointer2, TrendingUp } from "lucide-react";

export default function DashboardClient({ initialData }: { initialData: any }) {
  const supabase = createClient();
  const [upcomingHoliday, setUpcomingHoliday] = useState(initialData.upcomingHoliday);
  const [processingHolidayDecision, setProcessingHolidayDecision] = useState(false);

  const stats = [
    { label: "Produtos Ativos", value: initialData.productCount ?? "0", icon: Package, trend: "+12%", color: "emerald", bgClass: "bg-emerald-500/10", textClass: "text-emerald-500" },
    { label: "Visualizações", value: initialData.profileViews ?? "0", icon: Eye, trend: "+5.4%", color: "blue", bgClass: "bg-blue-500/10", textClass: "text-blue-500" },
    { label: "Cliques em Links", value: "0", icon: MousePointer2, trend: "0%", color: "violet", bgClass: "bg-violet-500/10", textClass: "text-violet-500" },
    { label: "Conversão Est.", value: "0%", icon: TrendingUp, trend: "0%", color: "amber", bgClass: "bg-amber-500/10", textClass: "text-amber-500" }
  ];

  const quickActions = [
    { title: "Gerenciar Catálogo", desc: initialData.isCaaS ? "Adicione, edite ou remova produtos do seu catálogo." : "Adicione, edite ou remova produtos do seu card digital.", icon: "📦", href: "/dashboard/catalogo", color: "from-emerald-500/10 to-emerald-500/5" },
    ...(initialData.businessModel !== "CaaS" ? [{ title: "Personalizar Perfil", desc: "Altere cores, fotos e informações do seu cartão.", icon: "👤", href: initialData.businessModel === "B2C" ? "/dashboard/perfil#cartao" : "/dashboard/perfil#perfil", color: "from-blue-500/10 to-blue-500/5" }] : []),
    { title: "Ver Analytics", desc: "Entenda o comportamento dos seus clientes.", icon: "📊", href: "/dashboard/analytics", color: "from-violet-500/10 to-violet-500/5" },
    ...(initialData.isB2B ? [{ title: "Vendedores", desc: "Gerencie sua equipe de vendas e acessos.", icon: "👥", href: "/dashboard/vendedores", color: "from-amber-500/10 to-amber-500/5" }] : [])
  ];

  const coreChecklist = [
    { label: initialData.isB2B ? "Link da Empresa" : "Link do Perfil", done: !!initialData.slug, href: "/dashboard/perfil#cartao", icon: "🔗" },
    { label: initialData.isB2B ? "Equipe de Vendas" : "WhatsApp de Vendas", done: initialData.isB2B ? initialData.sellerCount > 0 : initialData.hasValidWhatsapp, href: initialData.isB2B ? "/dashboard/vendedores" : "/dashboard/perfil#cartao", icon: initialData.isB2B ? "👥" : "📱" },
    { label: initialData.hasActiveMasterState ? "Catálogo Ativo (Herdado)" : "Pelo menos 1 Produto", done: initialData.productCount > 0 || initialData.hasActiveMasterState, href: "/dashboard/catalogo", icon: "📦" }
  ];

  const itemsDone = coreChecklist.filter(i => i.done).length;
  const isReady = itemsDone === coreChecklist.length;
  const progressPercent = Math.round((itemsDone / coreChecklist.length) * 100);

  async function handleHolidayDecision(date: string, work: boolean) {
    if (!initialData.profileData) return;
    setProcessingHolidayDecision(true);
    
    try {
      const currentHours = initialData.profileData.custom_business_hours || {};
      const decisions = currentHours.holiday_decisions || [];
      const updatedDecisions = [...decisions.filter((d: any) => d.date !== date), { date, work }];
      
      const { error } = await supabase
        .from("profiles")
        .update({
          custom_business_hours: {
            ...currentHours,
            holiday_decisions: updatedDecisions
          }
        })
        .eq("id", initialData.profileData.id);
        
      if (error) throw error;
      setUpcomingHoliday(null);
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar decisão de feriado.");
    } finally {
      setProcessingHolidayDecision(false);
    }
  }

  return (
    <div className="space-y-10 pb-12">
      <section className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--dash-text-primary)]">
            {initialData.nome ? `Olá, ${initialData.nome} 👋` : "Dashboard"}
          </h1>
          <p className="text-[var(--dash-text-secondary)]">
            {initialData.isB2B ? "Gerencie sua equipe e seu catálogo matriz." : initialData.isCaaS ? "Gerencie seus produtos e vendas do seu catálogo CaaS." : "Aqui está o que está acontecendo com sua plataforma hoje."}
          </p>
        </div>
      </section>

      <DashboardAlerts 
        hasActiveMasterState={initialData.hasActiveMasterState}
        hasOwnedMasterState={initialData.hasOwnedMasterState}
        customAlerts={initialData.customAlerts}
        upcomingHoliday={upcomingHoliday}
        handleHolidayDecision={handleHolidayDecision}
        processingHolidayDecision={processingHolidayDecision}
        showNoWhatsappWarning={initialData.showNoWhatsappWarning}
        isB2B={initialData.isB2B}
        sellerCount={initialData.sellerCount}
        isReady={isReady}
        progressPercent={progressPercent}
        coreChecklist={coreChecklist}
        avatarUrl={initialData.avatarUrl}
        hasSellersWithoutPhoto={initialData.hasSellersWithoutPhoto}
        isCaaS={initialData.isCaaS}
      />

      <DashboardKpiGrid stats={stats} loading={false} />

      <StockIntelligenceSection 
        activeOrgId={initialData.profileData?.organization_id} 
        hasBlingConnection={initialData.hasBlingConnection} 
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <DashboardQuickActions quickActions={quickActions} />

        <div className="flex flex-col gap-6">
          {initialData.isB2B && initialData.sellerCount !== null && (
            <DashboardTeamList sellers={initialData.sellers} sellerCount={initialData.sellerCount} />
          )}

          <div className="rounded-[27px] bg-slate-900 p-8 text-white relative overflow-hidden dark:bg-primary/20 dark:border dark:border-primary/30">
            <div className="relative z-10">
              <span className="inline-block rounded-full bg-primary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">Dica Premium</span>
              <h3 className="mt-4 text-xl font-bold">Aumente suas vendas</h3>
              <p className="mt-2 text-sm text-slate-400">Personalize o link do seu {initialData.isCaaS ? 'catálogo' : 'cartão'} e compartilhe em suas redes sociais para atrair mais clientes.</p>
              <button className="mt-6 flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80">
                Saber mais <ChevronRight size={16} />
              </button>
            </div>
            
            <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-primary opacity-20 blur-3xl" />
            <div className="absolute -top-10 -left-10 h-24 w-24 rounded-full bg-blue-500 opacity-20 blur-2xl" />
          </div>

          <div className="rounded-[27px] border border-dashed border-[var(--dash-border)] p-6">
            <h4 className="text-sm font-bold text-[var(--dash-text-primary)] mb-4">Atualizações Recentes</h4>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-2 w-2 mt-1.5 rounded-full bg-primary" />
                  <div>
                    <p className="text-xs font-bold text-[var(--dash-text-primary)]">Novo layout do Dashboard</p>
                    <p className="text-[10px] text-[var(--dash-text-muted)]">Implementamos uma nova navegação vertical...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
