"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Globe, Sparkles, Check, ArrowRight, Copy, CheckCheck, Smartphone, ShieldCheck, Zap } from "lucide-react";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export function AnotaMeuContatoSection() {
  const router = useRouter();
  const [slug, setSlug] = useState("sua-empresa");
  const [copied, setCopied] = useState(false);

  const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "") || "sua-empresa";
  const fullDomainUrl = `anotameucontato.com.br/${cleanSlug}`;

  function handleCopy() {
    navigator.clipboard.writeText(`https://${fullDomainUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function handleReserve(e: React.FormEvent) {
    e.preventDefault();
    if (cleanSlug && cleanSlug !== "sua-empresa") {
      localStorage.setItem("reserved_slug", cleanSlug);
      router.push(`/cadastro?slug=${encodeURIComponent(cleanSlug)}`);
    } else {
      router.push("/cadastro");
    }
  }

  return (
    <section className="py-24 bg-transparent relative overflow-hidden">
      {/* Luz ambiente de fundo (Glow esmeralda/ciano) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[900px] h-[400px] bg-gradient-to-r from-[#2CCB68]/10 to-[#06B6D4]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header da Seção */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2CCB68]/10 border border-[#2CCB68]/20 text-[#2CCB68] text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles size={14} className="text-[#2CCB68]" />
            Exclusividade PlataformaShop
          </div>

          <h2 className={`text-3xl md:text-5xl lg:text-6xl font-extrabold text-zinc-900 dark:text-white tracking-tight max-w-4xl leading-[1.15] mb-6 ${plusJakarta.className}`}>
            Na PlataformaShop seu negócio <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2CCB68] to-[#06B6D4]">
              já tem endereço na internet.
            </span>
          </h2>

          {/* Sticker Grande de Destaque com o Domínio */}
          <div className="my-3 inline-flex items-center gap-3 px-6 py-3 md:px-8 md:py-4 rounded-2xl bg-white dark:bg-[#121212] border-2 border-[#2CCB68]/30 shadow-[0_0_35px_rgba(44,203,104,0.18)] hover:shadow-[0_0_45px_rgba(44,203,104,0.3)] hover:scale-[1.02] transition-all">
            <div className="p-2 rounded-xl bg-[#2CCB68]/15 text-[#2CCB68]">
              <Globe className="w-5 h-5 md:w-7 md:h-7 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-1 text-lg sm:text-2xl md:text-3xl font-black tracking-tight">
              <span className="text-zinc-900 dark:text-white font-mono">www.anotameucontato.com.br/</span>
              <span className="text-[#2CCB68] font-mono underline decoration-wavy decoration-[#06B6D4]/60 underline-offset-4">sua-empresa</span>
            </div>
          </div>

          <p className="text-zinc-600 dark:text-zinc-400 text-lg md:text-xl max-w-2xl leading-relaxed mt-4">
            Um link direto, elegante e intuitivo que qualquer cliente grava de primeira — pronto para usar desde o primeiro minuto:
          </p>
        </div>

        {/* Card Principal — Simulador Interativo */}
        <div className="relative rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-[#0e0e0e]/80 backdrop-blur-xl p-8 md:p-12 shadow-2xl overflow-hidden mb-16">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            
            {/* Coluna Esquerda: Simulador e Input Interativo */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-[#2CCB68]/10 text-[#2CCB68]">
                  <Globe size={22} />
                </span>
                <div>
                  <h3 className={`text-xl md:text-2xl font-bold text-zinc-900 dark:text-white ${plusJakarta.className}`}>
                    Digite o nome do seu negócio e veja a mágica:
                  </h3>
                  <p className="text-xs md:text-sm text-zinc-500">
                    O link oficial da sua empresa ficará exatamente assim:
                  </p>
                </div>
              </div>

              {/* Caixa de Entrada Interativa com Preview em Tempo Real */}
              <form onSubmit={handleReserve} className="flex flex-col gap-4">
                <div className="flex items-center p-3 rounded-2xl bg-zinc-100 dark:bg-black/60 border-2 border-[#2CCB68]/40 focus-within:border-[#2CCB68] focus-within:shadow-[0_0_25px_rgba(44,203,104,0.2)] transition-all">
                  <div className="flex items-center pl-3 pr-1 text-zinc-500 font-semibold select-none text-sm md:text-base shrink-0">
                    <span>anotameucontato.com.br/</span>
                  </div>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="sua-empresa"
                    maxLength={35}
                    className="bg-transparent border-none outline-none text-zinc-900 dark:text-white font-bold text-base md:text-lg w-full placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-0"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    className={`w-full sm:flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-gradient-to-r from-[#2CCB68] to-[#06B6D4] text-white font-bold text-base shadow-lg shadow-[#2CCB68]/25 hover:shadow-[#2CCB68]/40 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer ${plusJakarta.className}`}
                  >
                    <span>Garantir Este Link Agora</span>
                    <ArrowRight size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 py-4 px-5 rounded-xl border border-zinc-300 dark:border-white/10 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-200 font-semibold text-sm transition-all active:scale-[0.98]"
                  >
                    {copied ? <CheckCheck size={18} className="text-[#2CCB68]" /> : <Copy size={18} />}
                    <span>{copied ? "Link Copiado!" : "Copiar"}</span>
                  </button>
                </div>
              </form>

              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Check size={14} className="text-[#2CCB68]" />
                <span>Disponibilidade imediata incluída em todos os planos PlataformaShop.</span>
              </div>
            </div>

            {/* Coluna Direita: Mockup Hiper-Realista do WhatsApp */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-[340px] sm:max-w-[360px] rounded-[32px] bg-[#0b141a] border-4 border-[#222e35] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden relative font-sans">
                
                {/* Barra de Status do Celular */}
                <div className="bg-[#202c33] px-5 pt-2.5 pb-1 flex justify-between items-center text-[11px] text-zinc-300 font-semibold border-b border-black/20 select-none">
                  <span>14:30</span>
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <span className="text-[10px]">4G</span>
                    <div className="w-4 h-2.5 border border-zinc-300 rounded-[2px] p-[1px] flex items-center">
                      <div className="h-full w-3 bg-[#25d366] rounded-[1px]" />
                    </div>
                  </div>
                </div>

                {/* Topo do WhatsApp Oficial */}
                <div className="bg-[#202c33] px-3 py-2.5 flex items-center justify-between text-white border-b border-[#222e35]">
                  <div className="flex items-center gap-2">
                    {/* Botão Voltar */}
                    <svg className="w-5 h-5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>

                    {/* Avatar do Contato */}
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#128C7E] to-[#25D366] flex items-center justify-center text-white font-black text-xs shadow-inner">
                        PS
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#25D366] border-2 border-[#202c33] rounded-full" />
                    </div>

                    {/* Nome do Contato */}
                    <div className="flex flex-col leading-tight">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-zinc-100">Cliente Interessado</span>
                        <svg className="w-3 h-3 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      </div>
                      <span className="text-[10px] text-[#25D366] font-medium">online</span>
                    </div>
                  </div>

                  {/* Ícones de Ação (Chamada, Câmera, Menu) */}
                  <div className="flex items-center gap-3 text-zinc-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.44-5.15-3.75-6.59-6.59l1.97-1.57c.28-.27.36-.67.25-1.02A11.36 11.36 0 018.57 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-.99-1.12z"/></svg>
                    <span className="text-xs font-bold">⋮</span>
                  </div>
                </div>

                {/* Corpo do Chat com Textura de Fundo do WhatsApp */}
                <div 
                  className="p-3.5 space-y-3 min-h-[260px] relative"
                  style={{
                    backgroundColor: "#0b141a",
                    backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
                    backgroundSize: "20px 20px"
                  }}
                >
                  {/* Badge de Data Centralizada */}
                  <div className="flex justify-center mb-2">
                    <span className="px-3 py-1 rounded-lg bg-[#182229] text-[10px] text-zinc-400 font-medium shadow-sm">
                      HOJE
                    </span>
                  </div>

                  {/* Mensagem Recebida (Cliente) */}
                  <div className="flex flex-col items-start">
                    <div className="relative bg-[#202c33] text-zinc-200 px-3.5 py-2 rounded-2xl rounded-tl-none text-xs leading-relaxed max-w-[85%] shadow-md border-l-2 border-emerald-500/40">
                      <p className="text-[12.5px] leading-snug">Boa tarde! Onde vejo o catálogo completo e os dados de vocês?</p>
                      <div className="flex justify-end items-center gap-1 mt-1 text-[9px] text-zinc-400">
                        <span>14:31</span>
                      </div>
                    </div>
                  </div>

                  {/* Mensagem Enviada com Link (Empresa) */}
                  <div className="flex flex-col items-end">
                    <div className="relative bg-[#005c4b] text-white p-2.5 rounded-2xl rounded-tr-none text-xs shadow-lg max-w-[92%] border-r-2 border-[#25D366]">
                      <p className="text-[12.5px] mb-2 font-normal leading-snug">
                        Olá! Acesse tudo agora pelo nosso link direto:
                      </p>

                      {/* Card de Preview Rico do Link (Estilo WhatsApp) */}
                      <div className="rounded-xl overflow-hidden bg-[#025143] border border-white/10 shadow-inner">
                        <div className="bg-[#014136] px-3 py-2 flex items-center gap-2 border-b border-white/5">
                          <div className="w-5 h-5 rounded-md bg-[#25D366]/20 text-[#25D366] flex items-center justify-center shrink-0">
                            <Globe size={13} />
                          </div>
                          <span className="text-[11px] font-bold text-white truncate">
                            Catálogo & Contato Oficial
                          </span>
                        </div>
                        <div className="p-2.5">
                          <p className="text-[11px] text-emerald-100/90 font-mono font-bold leading-tight break-all">
                            https://{fullDomainUrl}
                          </p>
                          <span className="text-[9.5px] text-emerald-300/70 block mt-1">
                            Abre instantaneamente no navegador
                          </span>
                        </div>
                      </div>

                      {/* Horário e Check Azul Duplo */}
                      <div className="flex justify-end items-center gap-1 mt-1 text-[9.5px] text-emerald-200/80 font-medium">
                        <span>14:32</span>
                        {/* Double Blue Check */}
                        <svg className="w-3.5 h-3.5 text-[#53bdeb]" viewBox="0 0 16 15" fill="none">
                          <path d="M15.01 3.316l-7.79 7.79-3.23-3.23.71-.71 2.52 2.52 7.08-7.08.71.71zm-4.56 0l-5.66 5.66-1.81-1.81.71-.71 1.1 1.1 4.95-4.95.71.71zm-7.47 4.95l-.71-.71-1.81 1.81 3.23 3.23.71-.71-2.52-2.52 1.1-1.1z" fill="currentColor"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Barra Inferior de Envio do WhatsApp */}
                <div className="bg-[#202c33] px-3 py-2 flex items-center gap-2 border-t border-[#222e35]">
                  <div className="flex-1 bg-[#2a3942] rounded-full px-3.5 py-1.5 text-[11px] text-zinc-400 flex items-center justify-between">
                    <span>Mensagem</span>
                    <span className="text-zinc-500">📎</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#00a884] text-white flex items-center justify-center shadow-md">
                    <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* 3 Pilares Psicológicos da Venda */}
        <div className="grid md:grid-cols-3 gap-8">
          
          <div className="rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#0a0a0a] p-7 shadow-md hover:border-[#2CCB68]/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#2CCB68]/10 text-[#2CCB68] flex items-center justify-center mb-5">
              <Zap size={24} />
            </div>
            <h3 className={`text-xl font-bold text-zinc-900 dark:text-white mb-2 ${plusJakarta.className}`}>
              Fácil de Lembrar e Soletrar
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Diga ao cliente numa ligação ou balcão: <strong className="text-zinc-900 dark:text-white">"Anota meu contato ponto com ponto br barra sua empresa"</strong>. Simples, natural e impossível de esquecer.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#0a0a0a] p-7 shadow-md hover:border-[#06B6D4]/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center mb-5">
              <ShieldCheck size={24} />
            </div>
            <h3 className={`text-xl font-bold text-zinc-900 dark:text-white mb-2 ${plusJakarta.className}`}>
              Acesso Direto Sem Obstáculos
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Sem intermediários ou páginas lentas. Seu catálogo já nasce com certificado SSL blindado, carregamento instantâneo e pronto para receber visitas.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#0a0a0a] p-7 shadow-md hover:border-[#8B5CF6]/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center mb-5">
              <Smartphone size={24} />
            </div>
            <h3 className={`text-xl font-bold text-zinc-900 dark:text-white mb-2 ${plusJakarta.className}`}>
              Perfeito para Cartão NFC & Bio
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Grave no chip do seu Cartão Físico NFC ou adicione na biografia do Instagram. O cliente aproxima o smartphone ou clica no link e o seu catálogo abre imediatamente.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
