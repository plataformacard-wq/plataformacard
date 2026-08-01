"use client";

import { useState, useEffect } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Leaf, RefreshCcw, MessageSquare, ShieldCheck, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export function WhyChooseUs({ settings }: { settings?: any }) {
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const useRealStats = Boolean(settings?.use_real_stats);
  const carouselInterval = Number(settings?.stats_carousel_interval) || 5000;

  // Grupos Autênticos de Métricas (Modo Lançamento / Ético)
  const ethicalStatGroups = [
    {
      id: "garantias",
      badge: "🔒 Garantias & Infraestrutura",
      badgeClass: "bg-emerald-500/10 text-[#2CCB68] border-emerald-500/20",
      items: [
        { value: "0%", label: "TAXA SOBRE VENDAS", desc: "Sem comissões intermediárias nos pedidos", gradient: "from-[#2CCB68] to-[#06B6D4]" },
        { value: "99.9%", label: "UPTIME NA NUVEM", desc: "Infraestrutura de alta disponibilidade", gradient: "from-[#06B6D4] to-[#3B82F6]" },
        { value: "< 1s", label: "TEMPO DE RESPOSTA", desc: "Carregamento ultrarrápido no 4G", gradient: "from-[#8B5CF6] to-[#D946EF]" },
        { value: "100%", label: "ESTOQUE SINCRONIZADO", desc: "Integração automatizada Bling ERP", gradient: "from-[#F59E0B] to-[#EF4444]" },
      ]
    },
    {
      id: "fim-pdfs",
      badge: "⚡ Fim dos PDFs & Desperdício",
      badgeClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      items: [
        { value: "0", label: "PDFS DESATUALIZADOS", desc: "Seus clientes acessam sempre o preço certo", gradient: "from-[#06B6D4] to-[#3B82F6]" },
        { value: "24/7", label: "VITRINE DISPONÍVEL", desc: "Catálogo aberto a qualquer hora do dia", gradient: "from-[#2CCB68] to-[#06B6D4]" },
        { value: "100%", label: "DIGITAL & NFC", desc: "Substitua dezenas de cartões de papel", gradient: "from-[#8B5CF6] to-[#D946EF]" },
        { value: "0%", label: "COMISSÃO POR PEDIDO", desc: "Margem de lucro cheia na sua conta", gradient: "from-[#F59E0B] to-[#EF4444]" },
      ]
    },
    {
      id: "experiencia",
      badge: "🛒 Experiência de Compra B2B",
      badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      items: [
        { value: "1 Clique", label: "ENVIO DE PEDIDOS", desc: "Sem digitação manual de códigos", gradient: "from-[#8B5CF6] to-[#D946EF]" },
        { value: "99.9%", label: "ESTABILIDADE DA NUVEM", desc: "Segurança de nível enterprise", gradient: "from-[#06B6D4] to-[#3B82F6]" },
        { value: "3x", label: "MAIS RÁPIDO QUE PDF", desc: "Abertura instantânea no navegador", gradient: "from-[#2CCB68] to-[#06B6D4]" },
        { value: "100%", label: "CONTROLADO POR VOCÊ", desc: "Altere fotos e preços em segundos", gradient: "from-[#F59E0B] to-[#EF4444]" },
      ]
    }
  ];

  // Modo Escala (Métricas Reais Agregadas)
  const realStatsGroup = {
    id: "reais",
    badge: "🚀 Métricas Reais da Plataforma",
    badgeClass: "bg-[#2CCB68]/10 text-[#2CCB68] border-[#2CCB68]/20",
    items: [
      { value: `${settings?.base_catalogs || 3200}+`, label: "CATÁLOGOS CRIADOS", desc: "Vitrines ativas em todo o Brasil", gradient: "from-[#2CCB68] to-[#06B6D4]" },
      { value: "99.9%", label: "DISPONIBILIDADE", desc: "SLA de serviço sem interrupções", gradient: "from-[#06B6D4] to-[#3B82F6]" },
      { value: `${settings?.base_users || 1500}+`, label: "EMPRESAS ATIVAS", desc: "Gestores e equipes conectadas", gradient: "from-[#8B5CF6] to-[#D946EF]" },
      { value: "R$ 50M+", label: "VOLUME TRANSACIONADO", desc: "Movimentação processada sem taxas", gradient: "from-[#F59E0B] to-[#EF4444]" },
    ]
  };

  const activeGroup = useRealStats ? realStatsGroup : ethicalStatGroups[activeGroupIndex];

  useEffect(() => {
    if (useRealStats || isPaused) return;

    const timer = setInterval(() => {
      setActiveGroupIndex((prev) => (prev + 1) % ethicalStatGroups.length);
    }, carouselInterval);

    return () => clearInterval(timer);
  }, [useRealStats, isPaused, carouselInterval, ethicalStatGroups.length]);

  const features = [
    {
      title: "Eco-Friendly",
      desc: "Substitua centenas de catálogos e cartões de papel por uma solução digital sustentável. Economize árvores e reduza desperdício em cada conexão.",
      icon: Leaf,
      color: "bg-[#2CCB68]",
      shadow: "shadow-[#2CCB68]/20",
    },
    {
      title: "Sempre Atual",
      desc: "Atualize preços ou fotos uma única vez e todos passam a ter automaticamente seus dados mais recentes. Sem PDFs desatualizados, sem oportunidades perdidas.",
      icon: RefreshCcw,
      color: "bg-[#06B6D4]",
      shadow: "shadow-[#06B6D4]/20",
    },
    {
      title: "Negociação via WhatsApp",
      desc: "Sincronize contatos e receba pedidos pré-formatados diretamente no seu WhatsApp. Nunca mais perca um lead ou insira dados manualmente no sistema.",
      icon: MessageSquare,
      color: "bg-[#8B5CF6]",
      shadow: "shadow-[#8B5CF6]/20",
    },
    {
      title: "Pronto para Empresas",
      desc: "Segurança de alto nível, gestão de equipes comerciais e controle centralizado (Master Catalog). Confiado por dezenas de distribuidoras e indústrias.",
      icon: ShieldCheck,
      color: "bg-[#F97316]",
      shadow: "shadow-[#F97316]/20",
    },
  ];

  return (
    <section className="py-24 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2CCB68]/10 border border-[#2CCB68]/20 text-[#2CCB68] text-xs font-bold uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2CCB68]" />
            Por Que PlataformaShop
          </div>
          <h2 className={`text-3xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-4 ${plusJakarta.className}`}>
            Por Que Escolher a Plataforma<span className="text-[#2CCB68]">Shop?</span>
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
            Tudo o que você precisa para revolucionar suas vendas B2B e o seu networking profissional.
          </p>
        </div>

        {/* 🌟 STATS CAROUSEL CONTAINER */}
        <div 
          className="mb-20 flex flex-col items-center"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Badge Categoria Ativa & Controle por Tabs */}
          {!useRealStats && (
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {ethicalStatGroups.map((grp, idx) => (
                <button
                  key={grp.id}
                  type="button"
                  onClick={() => setActiveGroupIndex(idx)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                    activeGroupIndex === idx
                      ? `${grp.badgeClass} shadow-sm scale-105`
                      : "bg-white/50 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  {grp.badge}
                </button>
              ))}
            </div>
          )}

          {useRealStats && (
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold border mb-6 ${realStatsGroup.badgeClass}`}>
              {realStatsGroup.badge}
            </div>
          )}

          {/* Cards Animação com Framer Motion */}
          <div className="w-full min-h-[140px] flex justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeGroup.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-5xl"
              >
                {activeGroup.items.map((stat, i) => (
                  <div 
                    key={i} 
                    className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/5 shadow-md dark:shadow-xl hover:border-zinc-300 dark:hover:border-white/10 transition-all group cursor-default text-center"
                  >
                    <span className={`text-2xl md:text-3xl font-black mb-1 bg-clip-text text-transparent bg-gradient-to-r ${stat.gradient} group-hover:scale-105 transition-transform duration-300 ${plusJakarta.className}`}>
                      {stat.value}
                    </span>
                    <span className="text-[11px] font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-1">
                      {stat.label}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium leading-tight">
                      {stat.desc}
                    </span>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Features 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="group relative bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/5 rounded-3xl p-8 shadow-md dark:shadow-none hover:border-zinc-300 dark:hover:border-white/10 transition-all duration-300 overflow-hidden cursor-default">
                {/* Hover Glow Effect */}
                <div className={`absolute top-0 right-0 w-64 h-64 opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-3xl pointer-events-none rounded-full ${feat.color}`} />
                
                {/* Corner Decorative Icon (faint) */}
                <div className="absolute top-6 right-6 text-zinc-300 dark:text-zinc-800 group-hover:text-zinc-400 dark:group-hover:text-zinc-700 transition-colors duration-300">
                  <Sparkles size={24} strokeWidth={1} />
                </div>

                <div className="relative z-10 flex flex-col h-full">
                  {/* Colorful Icon Box */}
                  <div className={`w-14 h-14 rounded-2xl ${feat.color} flex items-center justify-center mb-6 shadow-lg ${feat.shadow} group-hover:-translate-y-1 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  
                  {/* Text Content */}
                  <h3 className={`text-2xl font-bold text-zinc-900 dark:text-white mb-4 ${plusJakarta.className}`}>
                    {feat.title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
