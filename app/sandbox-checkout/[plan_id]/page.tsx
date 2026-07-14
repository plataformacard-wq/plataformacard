import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { processMockPayment } from "@/lib/dashboard/mockPaymentActions";
import { ShieldCheck, CreditCard, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: {
    plan_id: string;
  };
  searchParams: {
    org_id: string;
  };
}

export default async function SandboxCheckoutPage({ params, searchParams }: PageProps) {
  const { plan_id } = params;
  const { org_id } = searchParams;

  if (!plan_id || !org_id) {
    redirect("/dashboard/assinatura?error=Dados de checkout inválidos");
  }

  const supabase = await createClient();
  
  // Buscar os detalhes do plano
  const { data: plan } = await supabase
    .from("plans")
    .select("*")
    .eq("id", plan_id)
    .single();

  if (!plan) {
    redirect("/dashboard/assinatura?error=Plano não encontrado");
  }

  // Buscar os detalhes da organização para mostrar no resumo
  const { data: org } = await supabase
    .from("organizations")
    .select("name, id")
    .eq("id", org_id)
    .single();

  if (!org) {
    redirect("/dashboard/assinatura?error=Organização não encontrada");
  }

  return (
    <div className="min-h-screen bg-[var(--dash-bg)] flex flex-col items-center justify-center p-4 py-12 font-sans">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl shadow-xl overflow-hidden">
        
        {/* Lado Esquerdo - Resumo do Pedido */}
        <div className="p-10 bg-[var(--dash-hover-bg)] flex flex-col justify-between border-b md:border-b-0 md:border-r border-[var(--dash-border)]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-xs font-black uppercase tracking-widest mb-6">
              <Sparkles size={14} /> Sandbox Mode
            </div>
            
            <h2 className="text-2xl font-black text-[var(--dash-text-primary)] mb-2">Resumo da Assinatura</h2>
            <p className="text-[var(--dash-text-muted)] text-sm font-medium mb-8">
              Você está atualizando a organização <strong className="text-[var(--dash-text-primary)]">{org.name}</strong>
            </p>

            <div className="space-y-6">
              <div className="flex justify-between items-center pb-6 border-b border-[var(--dash-border)]">
                <div>
                  <h3 className="text-lg font-bold text-primary uppercase">{plan.name}</h3>
                  <p className="text-xs text-[var(--dash-text-muted)] mt-1">Cobrança mensal</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-[var(--dash-text-primary)]">
                    R$ {(plan.price_monthly / 100).toFixed(2).replace(".", ",")}
                  </span>
                  <span className="text-sm text-[var(--dash-text-muted)]">/mês</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm font-medium text-[var(--dash-text-primary)]">
                  <CheckCircle2 className="text-emerald-500" size={18} />
                  <span>Limite de Produtos: {plan.max_products === 0 ? "Ilimitado" : plan.max_products}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-[var(--dash-text-primary)]">
                  <CheckCircle2 className="text-emerald-500" size={18} />
                  <span>Limite de Vendedores: {plan.max_users === 0 ? "Ilimitado" : plan.max_users}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-[var(--dash-text-primary)]">
                  <CheckCircle2 className="text-emerald-500" size={18} />
                  <span>Suporte Dedicado</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex items-center gap-2 text-xs text-[var(--dash-text-muted)]">
            <Lock size={14} />
            <span>Ambiente de simulação seguro. Nenhuma cobrança real será efetuada.</span>
          </div>
        </div>

        {/* Lado Direito - Pagamento Fake */}
        <div className="p-10 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[var(--dash-text-primary)] mb-1">Pagamento (Simulação)</h2>
            <p className="text-[var(--dash-text-muted)] text-sm">Insira qualquer dado para processar a ativação do plano instantaneamente.</p>
          </div>

          <form action={processMockPayment} className="space-y-5">
            <input type="hidden" name="plan_id" value={plan_id} />
            <input type="hidden" name="org_id" value={org_id} />

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)]">Nome no Cartão</label>
              <input 
                type="text" 
                defaultValue="Usuario Teste" 
                className="w-full bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-lg px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)]">Número do Cartão</label>
              <div className="relative">
                <input 
                  type="text" 
                  defaultValue="0000 0000 0000 0000" 
                  className="w-full bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-lg pl-11 pr-4 py-3 text-sm font-medium font-mono focus:outline-none focus:border-primary transition-colors"
                  required
                />
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dash-text-muted)]" size={18} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)]">Validade</label>
                <input 
                  type="text" 
                  defaultValue="12/28" 
                  className="w-full bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-lg px-4 py-3 text-sm font-medium font-mono focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)]">CVC</label>
                <input 
                  type="text" 
                  defaultValue="123" 
                  className="w-full bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-lg px-4 py-3 text-sm font-medium font-mono focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
              >
                <ShieldCheck size={20} />
                Confirmar Assinatura
              </button>
              
              <Link 
                href="/dashboard/assinatura" 
                className="w-full flex items-center justify-center py-3 text-sm font-semibold text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)] transition-colors"
              >
                Cancelar e voltar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
