"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Globe, Sparkles, Check, ArrowRight, Copy, CheckCheck, Smartphone, ShieldCheck, Zap, Video, Phone, MoreVertical, Paperclip, Camera, Mic, Smile, ShoppingBag } from "lucide-react";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export function AnotaMeuContatoSection() {
  const router = useRouter();
  const [slug, setSlug] = useState("sua-empresa");
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    function checkTheme() {
      const isDarkMode = document.documentElement.classList.contains("dark") || document.documentElement.getAttribute("data-theme") === "dark";
      setIsDark(isDarkMode);
    }

    checkTheme();

    window.addEventListener("ps_theme_changed", checkTheme);
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });

    return () => {
      window.removeEventListener("ps_theme_changed", checkTheme);
      observer.disconnect();
    };
  }, []);

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
    <section className="py-20 sm:py-24 bg-transparent relative overflow-hidden">
      {/* Luz ambiente de fundo (Glow esmeralda/ciano) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] md:w-[900px] h-[350px] sm:h-[400px] bg-gradient-to-r from-[#2CCB68]/10 to-[#06B6D4]/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header da Seção */}
        <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2CCB68]/10 border border-[#2CCB68]/20 text-[#2CCB68] text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles size={14} className="text-[#2CCB68]" />
            Exclusividade PlataformaShop
          </div>

          <h2 className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-zinc-900 dark:text-white tracking-tight max-w-4xl leading-[1.15] mb-6 ${plusJakarta.className}`}>
            Na PlataformaShop seu negócio <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2CCB68] to-[#06B6D4]">
              já tem endereço na internet.
            </span>
          </h2>

          {/* Sticker Grande de Destaque com o Domínio (Responsivo e Seguro contra Overflows) */}
          <div className="my-3 inline-flex max-w-full items-center gap-2.5 sm:gap-3 px-4 py-2.5 sm:px-8 sm:py-4 rounded-2xl bg-white dark:bg-[#121212] border-2 border-[#2CCB68]/30 shadow-[0_0_35px_rgba(44,203,104,0.18)] hover:shadow-[0_0_45px_rgba(44,203,104,0.3)] hover:scale-[1.01] transition-all">
            <div className="p-1.5 sm:p-2 rounded-xl bg-[#2CCB68]/15 text-[#2CCB68] shrink-0">
              <Globe className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 animate-pulse" />
            </div>
            <div className="flex flex-wrap items-baseline gap-1 text-base sm:text-xl md:text-2xl lg:text-3xl font-black tracking-tight break-all">
              <span className="text-zinc-900 dark:text-white font-mono">www.anotameucontato.com.br/</span>
              <span className="text-[#2CCB68] font-mono underline decoration-wavy decoration-[#06B6D4]/60 underline-offset-4">{cleanSlug}</span>
            </div>
          </div>

          <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed mt-4">
            Um link direto, elegante e intuitivo que qualquer cliente grava de primeira — pronto para usar desde o primeiro minuto:
          </p>
        </div>

        {/* Card Principal — Simulador Interativo */}
        <div className="relative rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-[#0e0e0e]/80 backdrop-blur-xl p-5 sm:p-8 md:p-12 shadow-2xl overflow-hidden mb-16">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Coluna Esquerda: Simulador e Input Interativo */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-[#2CCB68]/10 text-[#2CCB68] shrink-0">
                  <Globe size={22} />
                </span>
                <div>
                  <h3 className={`text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white ${plusJakarta.className}`}>
                    Digite o nome do seu negócio e veja a mágica:
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500">
                    O link oficial da sua empresa ficará exatamente assim:
                  </p>
                </div>
              </div>

              {/* Caixa de Entrada Interativa com Preview em Tempo Real */}
              <form onSubmit={handleReserve} className="flex flex-col gap-4">
                <div className="flex flex-wrap sm:flex-nowrap items-center p-2.5 sm:p-3 rounded-2xl bg-zinc-100 dark:bg-black/60 border-2 border-[#2CCB68]/40 focus-within:border-[#2CCB68] focus-within:shadow-[0_0_25px_rgba(44,203,104,0.2)] transition-all">
                  <div className="flex items-center pl-2 sm:pl-3 pr-1 text-zinc-500 font-semibold select-none text-xs sm:text-sm md:text-base shrink-0">
                    <span>anotameucontato.com.br/</span>
                  </div>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="sua-empresa"
                    maxLength={32}
                    className="bg-transparent border-none outline-none text-zinc-900 dark:text-white font-bold text-sm sm:text-base md:text-lg w-full placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-0 px-2 sm:px-0 py-1"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    className={`w-full sm:flex-1 flex items-center justify-center gap-2 py-3.5 sm:py-4 px-6 rounded-xl bg-gradient-to-r from-[#2CCB68] to-[#06B6D4] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#2CCB68]/25 hover:shadow-[#2CCB68]/40 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer ${plusJakarta.className}`}
                  >
                    <span>Garantir Este Link Agora</span>
                    <ArrowRight size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 sm:py-4 px-5 rounded-xl border border-zinc-300 dark:border-white/10 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-200 font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer"
                  >
                    {copied ? <CheckCheck size={18} className="text-[#2CCB68]" /> : <Copy size={18} />}
                    <span>{copied ? "Link Copiado!" : "Copiar"}</span>
                  </button>
                </div>
              </form>

              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Check size={14} className="text-[#2CCB68] shrink-0" />
                <span>Disponibilidade imediata incluída em todos os planos PlataformaShop.</span>
              </div>
            </div>

            {/* Coluna Direita: Mockup de Celular Físico Hiper-Realista (iPhone com WhatsApp Adaptativo Claro/Escuro) */}
            <div className="lg:col-span-5 flex justify-center items-center py-2 sm:py-4">
              
              {/* Chassi Externo do Smartphone com Borda de Titânio/Alumínio e Relevo */}
              <div className="relative w-full max-w-[295px] sm:max-w-[325px] rounded-[46px] p-[8px] sm:p-[10px] bg-gradient-to-b from-[#444446] via-[#242426] to-[#161618] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_10px_20px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.35)] border border-[#545458]/50 select-none transition-all duration-300">
                
                {/* Botões Físicos Laterais do Celular (Ajustados para Proporção e Sem Overflow) */}
                {/* Botão de Silencioso / Ação */}
                <div className="absolute -left-[9px] top-[90px] w-[3px] h-[22px] bg-[#3a3a3c] rounded-l-sm border-l border-white/20 shadow-sm" />
                {/* Botões de Volume */}
                <div className="absolute -left-[9px] top-[125px] w-[3px] h-[40px] bg-[#3a3a3c] rounded-l-sm border-l border-white/20 shadow-sm" />
                <div className="absolute -left-[9px] top-[175px] w-[3px] h-[40px] bg-[#3a3a3c] rounded-l-sm border-l border-white/20 shadow-sm" />
                {/* Botão Power / Lateral Direito */}
                <div className="absolute -right-[9px] top-[140px] w-[3px] h-[58px] bg-[#3a3a3c] rounded-r-sm border-r border-white/20 shadow-sm" />

                {/* Tela do Celular (Display OLED com cantos arredondados e Interface Dinâmica WhatsApp) */}
                <div className={`relative w-full rounded-[38px] overflow-hidden border-[2.5px] border-black shadow-inner flex flex-col font-sans transition-colors duration-300 ${isDark ? "bg-[#0b141a]" : "bg-[#efeae2]"}`}>
                  
                  {/* Top Status Bar do iOS com Dynamic Island */}
                  <div className={`pt-2 px-5 pb-1 flex justify-between items-center relative z-20 transition-colors duration-300 ${isDark ? "bg-[#202c33] text-[#e9edef]" : "bg-[#008069] text-white"}`}>
                    <span className="text-[11px] sm:text-[12px] font-semibold tracking-tight">12:30</span>
                    
                    {/* Dynamic Island Pílula Física Centralizada */}
                    <div className="w-[75px] sm:w-[82px] h-[18px] sm:h-[19px] bg-black rounded-full flex items-center justify-end px-2 gap-1.5 shadow-sm">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#1c1c1e] border border-white/10 flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full bg-[#03132e]" />
                      </div>
                    </div>

                    {/* Ícones de Sinal, Wifi e Bateria do iOS */}
                    <div className="flex items-center gap-1.5 opacity-95">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 20.3a1 1 0 001.35 1.35l2.69-.62C9.93 22.26 11.88 23 14 23c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-1.85 0-3.55-.67-4.9-1.79l-.35-.29-2.02.46.46-2.02-.29-.35C3.67 13.55 3 11.85 3 10c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7z"/></svg>
                      <div className="w-3.5 sm:w-4 h-2 sm:h-2.5 border border-current rounded-[2px] p-[1px] flex items-center">
                        <div className="h-full w-2 sm:w-2.5 bg-current rounded-[1px]" />
                      </div>
                    </div>
                  </div>

                  {/* Header Oficial do WhatsApp (Adaptativo Claro/Escuro) */}
                  <div className={`px-2.5 sm:px-3 py-2 flex items-center justify-between shadow-sm border-b transition-colors duration-300 ${isDark ? "bg-[#202c33] text-[#e9edef] border-white/5" : "bg-[#008069] text-white border-black/5"}`}>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <svg className={`w-4 h-4 sm:w-5 sm:h-5 cursor-pointer ${isDark ? "text-[#aebac1]" : "text-white"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M15 19l-7-7 7-7" />
                      </svg>
                      
                      {/* Avatar Circular com Status Online */}
                      <div className="relative">
                        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#128C7E] flex items-center justify-center text-white font-black text-xs shadow-sm ${isDark ? "border border-white/20" : "border border-white/30"}`}>
                          <ShoppingBag size={17} className="text-white" />
                        </div>
                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#25D366] border-2 ${isDark ? "border-[#202c33]" : "border-[#008069]"}`} />
                      </div>

                      <div className="flex flex-col leading-tight max-w-[110px] sm:max-w-[130px]">
                        <span className="text-[12px] sm:text-[13px] font-bold tracking-tight truncate">Atendimento & Vendas</span>
                        <span className={`text-[9.5px] sm:text-[10px] font-medium ${isDark ? "text-[#25D366]" : "text-emerald-100"}`}>online agora</span>
                      </div>
                    </div>

                    {/* Ações do Header do WhatsApp */}
                    <div className={`flex items-center gap-2 sm:gap-2.5 ${isDark ? "text-[#aebac1]" : "text-white/95"}`}>
                      <Video size={16} className="cursor-pointer hover:opacity-80 transition-opacity" />
                      <Phone size={15} className="cursor-pointer hover:opacity-80 transition-opacity" />
                      <MoreVertical size={16} className="cursor-pointer hover:opacity-80 transition-opacity" />
                    </div>
                  </div>

                  {/* Área do Chat com Fundo de Doodles Tradicional do WhatsApp */}
                  <div 
                    className="p-2.5 sm:p-3.5 space-y-3 min-h-[290px] sm:min-h-[310px] flex flex-col justify-between relative transition-colors duration-300"
                    style={{
                      backgroundColor: isDark ? "#0b141a" : "#efeae2",
                      backgroundImage: isDark 
                        ? `radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.04) 1px, transparent 1px)`
                        : `radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.04) 1px, transparent 1px)`,
                      backgroundSize: "16px 16px"
                    }}
                  >
                    <div className="space-y-3">
                      {/* Pílula de Data (HOJE) */}
                      <div className="flex justify-center">
                        <span className={`px-2.5 py-0.5 rounded-md text-[9.5px] font-bold tracking-wider shadow-sm uppercase ${isDark ? "bg-[#182229] text-[#8696a0] border border-white/5" : "bg-[#d1d7db] text-zinc-700"}`}>
                          Hoje
                        </span>
                      </div>

                      {/* Balão 1: Mensagem Recebida do Cliente (Cauda Esquerda) */}
                      <div className="flex flex-col items-start max-w-[88%] relative group">
                        <div className={`relative px-3 py-2 rounded-2xl rounded-tl-sm text-[12px] sm:text-[12.5px] leading-snug shadow-sm border transition-colors duration-300 ${isDark ? "bg-[#202c33] text-[#e9edef] border-white/5" : "bg-white text-zinc-900 border-black/5"}`}>
                          {/* Cauda Angular Esquerda do Balão */}
                          <svg className={`absolute -top-[1px] -left-[7px] w-2 h-3 fill-current transition-colors duration-300 ${isDark ? "text-[#202c33]" : "text-white"}`} viewBox="0 0 8 13">
                            <path d="M8,0 C8,0 0,0 0,0 C0,0 8,13 8,13 L8,0 Z" />
                          </svg>

                          <span className={`text-[10.5px] font-bold block mb-0.5 ${isDark ? "text-[#53bdeb]" : "text-[#075e54]"}`}>Cliente</span>
                          <p className={isDark ? "text-[#e9edef]" : "text-zinc-800"}>Olá! Vocês têm um link com os contatos da loja, chave Pix e catálogo atualizado?</p>
                          <div className="flex justify-end mt-1">
                            <span className={`text-[9px] font-medium ${isDark ? "text-[#8696a0]" : "text-zinc-400"}`}>12:31</span>
                          </div>
                        </div>
                      </div>

                      {/* Balão 2: Resposta Enviada do Lojista (Cauda Direita) */}
                      <div className="flex flex-col items-end ml-auto max-w-[94%] relative">
                        <div className={`relative p-2 sm:p-2.5 rounded-2xl rounded-tr-sm text-[12px] sm:text-[12.5px] leading-snug shadow-sm border transition-colors duration-300 ${isDark ? "bg-[#005c4b] text-[#e9edef] border-emerald-500/10" : "bg-[#dcf8c6] text-zinc-900 border-emerald-600/10"}`}>
                          {/* Cauda Angular Direita do Balão */}
                          <svg className={`absolute -top-[1px] -right-[7px] w-2 h-3 fill-current transition-colors duration-300 ${isDark ? "text-[#005c4b]" : "text-[#dcf8c6]"}`} viewBox="0 0 8 13">
                            <path d="M0,0 C0,0 8,0 8,0 C8,0 0,13 0,13 L0,0 Z" />
                          </svg>

                          <p className={`mb-1.5 ${isDark ? "text-[#e9edef]" : "text-zinc-800"}`}>
                            Olá! Com certeza, anota nosso contato por aqui com tudo em um só lugar:
                          </p>
                          
                          {/* Card de Link Preview do WhatsApp */}
                          <div className={`rounded-xl overflow-hidden p-2 shadow-sm transition-all cursor-pointer ${isDark ? "bg-[#111b21]/95 border border-white/10 hover:bg-[#111b21]" : "bg-white/95 border border-emerald-500/20 hover:bg-white"}`}>
                            <div className={`flex items-center gap-1.5 font-bold text-[10.5px] sm:text-[11px] mb-1 ${isDark ? "text-[#25d366]" : "text-[#008069]"}`}>
                              <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${isDark ? "bg-[#25d366]/15 text-[#25d366]" : "bg-[#008069]/10 text-[#008069]"}`}>
                                <Globe size={11} />
                              </span>
                              <span className="truncate">Canal Oficial & Vitrine Interativa</span>
                            </div>
                            <p className={`text-[11px] sm:text-[11.5px] font-mono font-bold break-all leading-tight ${isDark ? "text-[#53bdeb]" : "text-[#027eb5]"}`}>
                              https://{fullDomainUrl}
                            </p>
                            <span className={`text-[8.5px] sm:text-[9px] block mt-1 ${isDark ? "text-[#8696a0]" : "text-zinc-500"}`}>
                              Toque para salvar na sua agenda
                            </span>
                          </div>

                          {/* Horário e Double Check Azul Oficial do WhatsApp (#53BDEB) */}
                          <div className={`flex justify-end items-center gap-1 mt-1.5 text-[9px] sm:text-[9.5px] ${isDark ? "text-[#8696a0]" : "text-zinc-500"}`}>
                            <span>12:32</span>
                            <svg className="w-3.5 h-3.5 text-[#53bdeb]" viewBox="0 0 16 15" fill="none">
                              <path d="M15.01 3.316l-7.79 7.79-3.23-3.23.71-.71 2.52 2.52 7.08-7.08.71.71zm-4.56 0l-5.66 5.66-1.81-1.81.71-.71 1.1 1.1 4.95-4.95.71.71zm-7.47 4.95l-.71-.71-1.81 1.81 3.23 3.23.71-.71-2.52-2.52 1.1-1.1z" fill="currentColor"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Barra de Digitação Oficial do WhatsApp */}
                    <div className="flex items-center gap-1 sm:gap-1.5 pt-2">
                      <div className={`flex-1 rounded-full px-2.5 sm:px-3 py-1.5 flex items-center justify-between shadow-sm border transition-colors duration-300 ${isDark ? "bg-[#202c33] border-white/5 text-[#8696a0]" : "bg-white border-black/5 text-zinc-400"}`}>
                        <div className="flex items-center gap-1.5">
                          <Smile size={16} className={`shrink-0 ${isDark ? "text-[#8696a0]" : "text-zinc-500"}`} />
                          <span className={`text-[11px] sm:text-[12px] ${isDark ? "text-[#8696a0]" : "text-zinc-400"}`}>Mensagem</span>
                        </div>
                        <div className={`flex items-center gap-2 shrink-0 ${isDark ? "text-[#8696a0]" : "text-zinc-500"}`}>
                          <Paperclip size={15} className="rotate-45" />
                          <Camera size={15} />
                        </div>
                      </div>
                      
                      {/* Botão de Áudio/Microfone Flutuante Verde WhatsApp (#00A884) */}
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#00a884] text-white flex items-center justify-center shadow-md shrink-0 cursor-pointer hover:bg-[#009373] transition-colors">
                        <Mic size={15} className="text-white" />
                      </div>
                    </div>

                  </div>

                  {/* Barra Home Indicator do iOS */}
                  <div className={`py-1 flex justify-center transition-colors duration-300 ${isDark ? "bg-[#0b141a]" : "bg-[#efeae2]"}`}>
                    <div className={`w-24 sm:w-28 h-1 rounded-full ${isDark ? "bg-white/30" : "bg-black/35"}`} />
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 3 Pilares Psicológicos da Venda */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          
          <div className="rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#0a0a0a] p-6 sm:p-7 shadow-md hover:border-[#2CCB68]/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#2CCB68]/10 text-[#2CCB68] flex items-center justify-center mb-5">
              <Zap size={24} />
            </div>
            <h3 className={`text-lg sm:text-xl font-bold text-zinc-900 dark:text-white mb-2 ${plusJakarta.className}`}>
              Fácil de Lembrar e Soletrar
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Diga ao cliente numa ligação ou balcão: <strong className="text-zinc-900 dark:text-white">"Anota meu contato ponto com ponto br barra sua empresa"</strong>. Simples, natural e impossível de esquecer.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#0a0a0a] p-6 sm:p-7 shadow-md hover:border-[#06B6D4]/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center mb-5">
              <ShieldCheck size={24} />
            </div>
            <h3 className={`text-lg sm:text-xl font-bold text-zinc-900 dark:text-white mb-2 ${plusJakarta.className}`}>
              Acesso Direto Sem Obstáculos
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Sem intermediários ou páginas lentas. Seu catálogo já nasce com certificado SSL blindado, carregamento instantâneo e pronto para receber visitas.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#0a0a0a] p-6 sm:p-7 shadow-md hover:border-[#8B5CF6]/30 transition-all sm:col-span-2 md:col-span-1">
            <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center mb-5">
              <Smartphone size={24} />
            </div>
            <h3 className={`text-lg sm:text-xl font-bold text-zinc-900 dark:text-white mb-2 ${plusJakarta.className}`}>
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
