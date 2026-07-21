"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import { 
  CheckCircle2, 
  ShieldCheck, 
  ArrowLeft, 
  CreditCard, 
  QrCode, 
  Zap, 
  Lock, 
  Sparkles,
  HelpCircle
} from "lucide-react";
import { PLANS, PlanSlug } from "@/lib/plans/feature-matrix";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function CheckoutClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const planParam = (searchParams?.get("plan") || "pro").toLowerCase() as PlanSlug;
  const initialCycle = searchParams?.get("cycle") === "monthly" ? "monthly" : "annual";

  const [cycle, setCycle] = useState<"annual" | "monthly">(initialCycle);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");

  // Dados do formulário
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [document, setDocument] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const activePlan = PLANS[planParam] || PLANS.pro;
  const isAnnual = cycle === "annual";

  // Preço Mensal vs Anual
  const activeMonthlyPrice = isAnnual ? activePlan.annualPrice : activePlan.monthlyPrice;
  const totalValue = isAnnual ? activeMonthlyPrice * 12 : activeMonthlyPrice;
  const monthlyAnchor = activePlan.monthlyAnchor;
  const hasDiscount = isAnnual && monthlyAnchor > activeMonthlyPrice;
  const annualSavings = (monthlyAnchor - activeMonthlyPrice) * 12;

  // URLs do Checkout da Kiwify (ou homologação / iframe)
  // Substituir pelas URLs dos produtos cadastrados na Kiwify se necessário
  const handleProceedPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName.trim() || !email.trim() || !document.trim()) {
      setErrorMsg("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);

    // Em produção com a Kiwify: Redirecionar para a URL do Checkout Kiwify com parâmetros de identificação do lojista
    // Exemplo: https://pay.kiwify.com.br/ABCDEF?email=...&name=...
    const kiwifyBaseUrl = process.env.NEXT_PUBLIC_KIWIFY_CHECKOUT_URL || "https://pay.kiwify.com.br";
    
    // Simulação ou redirecionamento seguro
    const params = new URLSearchParams({
      name: fullName,
      email: email,
      doc: document,
      phone: whatsapp,
      plan: activePlan.slug,
      cycle: cycle
    });

    setTimeout(() => {
      // Se tivermos a URL da Kiwify configurada, vai direto para lá; senão redireciona para cadastro com plano
      if (process.env.NEXT_PUBLIC_KIWIFY_CHECKOUT_URL) {
        window.location.href = `${kiwifyBaseUrl}?${params.toString()}`;
      } else {
        router.push(`/cadastro?plan=${activePlan.slug}&cycle=${cycle}&email=${encodeURIComponent(email)}`);
      }
    }, 1000);
  };

  return (
    <main className="relative min-h-screen bg-[#0A0A0A] text-white overflow-hidden py-10 px-4 flex flex-col justify-between">
      {/* Background Grid Pattern & Radial Glow */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 70%)'
        }}
      />
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 20% 20%, rgba(44, 203, 104, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.06) 0%, transparent 50%)'
        }}
      />

      <div className="max-w-6xl mx-auto w-full z-10">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
          <Link href="/#planos" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Voltar para os Planos
          </Link>

          <div className="flex items-center gap-3">
            <img src="/logo_fundo_escuro_ps.png" alt="PlataformaShop Logo" className="h-7 object-contain" />
            <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-full">
              Checkout Seguro Kiwify
            </span>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Coluna Esquerda: Resumo do Pedido & Garantia */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Card do Resumo do Plano */}
            <div className="rounded-3xl border border-white/10 bg-[#141414]/90 p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-1">
                    Plano Selecionado
                  </span>
                  <h1 className={`text-3xl font-extrabold text-white ${plusJakarta.className}`}>
                    {activePlan.name}
                  </h1>
                </div>

                {activePlan.badgeText && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#2CCB68] text-black">
                    {activePlan.badgeText}
                  </span>
                )}
              </div>

              {/* Alternador de Ciclo (Mensal / Anual) */}
              <div className="my-6 bg-[#0A0A0A] p-1.5 rounded-2xl border border-white/10 flex items-center gap-1 relative">
                <button
                  type="button"
                  onClick={() => setCycle("monthly")}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    !isAnnual ? "bg-[#2CCB68] text-black shadow-md" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Mensal
                </button>
                <button
                  type="button"
                  onClick={() => setCycle("annual")}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isAnnual ? "bg-[#2CCB68] text-black shadow-md" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Anual <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-black/30 text-white">Economize</span>
                </button>
              </div>

              {/* Preços e Cálculos da Âncora */}
              <div className="py-4 border-y border-white/10 my-4 space-y-2">
                {isAnnual && (
                  <div className="flex items-center justify-between text-xs text-zinc-500 font-bold">
                    <span>Preço Normal Padrão:</span>
                    <span className="line-through">R$ {monthlyAnchor.toFixed(2).replace(".", ",")}/mês</span>
                  </div>
                )}

                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold text-zinc-400">Valor Efetivo:</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-emerald-400">
                      R$ {activeMonthlyPrice.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">/mês</span>
                  </div>
                </div>

                {isAnnual && annualSavings > 0 && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-between">
                    <span>Economia Anual Acumulada:</span>
                    <span>R$ {annualSavings.toFixed(2).replace(".", ",")} OFF</span>
                  </div>
                )}
              </div>

              {/* Total Final a Cobrar */}
              <div className="flex items-center justify-between py-2">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-400">
                  Total {isAnnual ? "Anual (12 Meses)" : "Mensal"}:
                </span>
                <span className="text-xl font-extrabold text-white">
                  R$ {totalValue.toFixed(2).replace(".", ",")}
                </span>
              </div>

              {/* Benefícios Incluídos */}
              <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">
                  Recursos do Plano:
                </span>
                <div className="space-y-2.5 text-xs text-zinc-300 font-medium">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-[#2CCB68] shrink-0" />
                    <span>Catálogo Digital e Card de Negociação</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-[#2CCB68] shrink-0" />
                    <span>Taxa 0% sobre todas as vendas</span>
                  </div>
                  {activePlan.allowedFeatures.includes("ai_seo") && (
                    <div className="flex items-center gap-2.5 text-emerald-400 font-bold">
                      <Sparkles size={16} className="shrink-0" />
                      <span>Assistente de IA para Produtos e SEO</span>
                    </div>
                  )}
                  {activePlan.allowedFeatures.includes("bling_sync") && (
                    <div className="flex items-center gap-2.5 text-emerald-400 font-bold">
                      <CheckCircle2 size={16} className="shrink-0" />
                      <span>Estoque Automático via Bling V3</span>
                    </div>
                  )}
                  {activePlan.allowedFeatures.includes("custom_domain") && (
                    <div className="flex items-center gap-2.5 text-emerald-400 font-bold">
                      <CheckCircle2 size={16} className="shrink-0" />
                      <span>Domínio Próprio SSL e Embed no Site</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Selo de Garantia Incondicional de Reembolso de 7 Dias */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 flex items-start gap-4 shadow-lg">
              <div className="p-3 rounded-xl bg-emerald-500 text-black font-black shrink-0">
                <ShieldCheck size={28} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Garantia Incondicional de 7 Dias</h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Teste a plataforma sem riscos. Se você não estiver 100% satisfeito por qualquer motivo nos primeiros 7 dias, devolvemos todo o seu dinheiro imediatamente.
                </p>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Dados do Assinante e Checkout Kiwify */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-white/10 bg-[#141414]/90 p-8 shadow-2xl backdrop-blur-md space-y-6">
              
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Dados da sua Conta</h2>
                <p className="text-xs text-zinc-400">Preencha as informações para ativar o seu acesso ao painel.</p>
              </div>

              <form onSubmit={handleProceedPayment} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1.5 uppercase tracking-wider">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome ou razão social"
                    className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-white/10 text-sm text-white outline-none focus:border-[#2CCB68] transition-colors placeholder:text-zinc-600"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 block mb-1.5 uppercase tracking-wider">
                      E-mail de Acesso *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="voce@empresa.com"
                      className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-white/10 text-sm text-white outline-none focus:border-[#2CCB68] transition-colors placeholder:text-zinc-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-400 block mb-1.5 uppercase tracking-wider">
                      CPF ou CNPJ *
                    </label>
                    <input
                      type="text"
                      required
                      value={document}
                      onChange={(e) => setDocument(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-white/10 text-sm text-white outline-none focus:border-[#2CCB68] transition-colors placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1.5 uppercase tracking-wider">
                    WhatsApp de Contato
                  </label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(00) 90000-0000"
                    className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-white/10 text-sm text-white outline-none focus:border-[#2CCB68] transition-colors placeholder:text-zinc-600"
                  />
                </div>

                {/* Seleção do Método de Pagamento */}
                <div className="pt-4 border-t border-white/10">
                  <label className="text-xs font-semibold text-zinc-400 block mb-3 uppercase tracking-wider">
                    Forma de Pagamento Preferencial
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("pix")}
                      className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                        paymentMethod === "pix"
                          ? "bg-[#2CCB68]/10 border-[#2CCB68] text-white"
                          : "bg-[#0A0A0A] border-white/10 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <QrCode size={20} className={paymentMethod === "pix" ? "text-[#2CCB68]" : ""} />
                      <div className="text-left">
                        <span className="text-xs font-bold block">Pix Instantâneo</span>
                        <span className="text-[10px] text-zinc-500">Liberação imediata</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                        paymentMethod === "card"
                          ? "bg-[#2CCB68]/10 border-[#2CCB68] text-white"
                          : "bg-[#0A0A0A] border-white/10 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <CreditCard size={20} className={paymentMethod === "card" ? "text-[#2CCB68]" : ""} />
                      <div className="text-left">
                        <span className="text-xs font-bold block">Cartão de Crédito</span>
                        <span className="text-[10px] text-zinc-500">Até 12x no cartão</span>
                      </div>
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold text-center">
                    {errorMsg}
                  </div>
                )}

                {/* Botão de Conclusão Kiwify */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-[#2CCB68] to-[#06B6D4] text-black font-extrabold text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(44,203,104,0.3)] hover:shadow-[0_0_30px_rgba(44,203,104,0.5)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                    loading ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  <Zap size={18} fill="currentColor" />
                  {loading ? "Processando..." : `Concluir Assinatura — R$ ${totalValue.toFixed(2).replace(".", ",")}`}
                </button>
              </form>

              {/* Informações de Segurança */}
              <div className="pt-4 flex items-center justify-between text-[11px] text-zinc-500 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <Lock size={12} className="text-[#2CCB68]" />
                  <span>Ambiente Criptografado de Alta Segurança</span>
                </div>
                <span>Processado por Kiwify</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer Nav */}
      <footer className="mt-12 text-center text-xs text-zinc-600 font-medium">
        <span>© {new Date().getFullYear()} PlataformaShop — Todos os direitos reservados.</span>
      </footer>
    </main>
  );
}
