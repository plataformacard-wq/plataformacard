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

            {/* Coluna Direita: Mockup de Celular Realista (iPhone com Dynamic Island e WhatsApp) */}
            <div className="lg:col-span-5 flex justify-center items-center py-4">
              
              {/* Chassi Externo do Smartphone com Borda de Titânio/Alumínio */}
              <div className="relative w-[310px] sm:w-[335px] rounded-[50px] p-[10px] bg-gradient-to-b from-[#48484a] via-[#2c2c2e] to-[#1c1c1e] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.8),0_10px_20px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.4)] border border-[#545458]/40 select-none">
                
                {/* Botões Físicos Laterais do Celular */}
                {/* Botão de Silencioso / Ação */}
                <div className="absolute -left-[13px] top-[95px] w-[3px] h-[24px] bg-[#3a3a3c] rounded-l-sm border-l border-white/20" />
                {/* Botões de Volume */}
                <div className="absolute -left-[13px] top-[135px] w-[3px] h-[45px] bg-[#3a3a3c] rounded-l-sm border-l border-white/20" />
                <div className="absolute -left-[13px] top-[190px] w-[3px] h-[45px] bg-[#3a3a3c] rounded-l-sm border-l border-white/20" />
                {/* Botão Power / Lateral Direito */}
                <div className="absolute -right-[13px] top-[150px] w-[3px] h-[65px] bg-[#3a3a3c] rounded-r-sm border-r border-white/20" />

                {/* Tela do Celular (Display OLED com cantos arredondados) */}
                <div className="relative w-full rounded-[42px] overflow-hidden bg-[#efeae2] dark:bg-[#0b141a] border-[3px] border-black shadow-inner flex flex-col">
                  
                  {/* Top Notch / Dynamic Island */}
                  <div className="bg-[#075e54] dark:bg-[#1f2c34] pt-2 px-6 pb-1 flex justify-between items-center text-white relative z-20">
                    <span className="text-[12px] font-semibold tracking-tight text-white/90">12:30</span>
                    
                    {/* Dynamic Island Pílula Física */}
                    <div className="w-[85px] h-[20px] bg-black rounded-full flex items-center justify-end px-2 gap-1.5 shadow-sm">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#1c1c1e] border border-white/10 flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full bg-[#000d26]" />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-white/90">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 20.3a1 1 0 001.35 1.35l2.69-.62C9.93 22.26 11.88 23 14 23c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-1.85 0-3.55-.67-4.9-1.79l-.35-.29-2.02.46.46-2.02-.29-.35C3.67 13.55 3 11.85 3 10c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7z"/></svg>
                      <div className="w-4 h-2.5 border border-white/80 rounded-[2px] p-[1px] flex items-center">
                        <div className="h-full w-2.5 bg-white rounded-[1px]" />
                      </div>
                    </div>
                  </div>

                  {/* Header do WhatsApp (Estilo Exato da Imagem de Referência) */}
                  <div className="bg-[#075e54] dark:bg-[#1f2c34] px-3 py-2 flex items-center justify-between text-white border-b border-black/10">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-white/90 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      
                      {/* Avatar Circular */}
                      <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-black text-xs shadow-sm">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                      </div>

                      <div className="flex flex-col leading-tight">
                        <span className="text-[13px] font-bold text-white tracking-tight">Atendimento & Vendas</span>
                        <span className="text-[10px] text-emerald-200/90 font-medium">online agora</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-white/90">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.44-5.15-3.75-6.59-6.59l1.97-1.57c.28-.27.36-.67.25-1.02A11.36 11.36 0 018.57 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-.99-1.12z"/></svg>
                      <span className="text-sm font-bold leading-none">⋮</span>
                    </div>
                  </div>

                  {/* Fundo do Chat com Doodles Tradicionais do WhatsApp */}
                  <div 
                    className="p-3.5 space-y-3 min-h-[300px] flex flex-col justify-between relative"
                    style={{
                      backgroundColor: "#efeae2",
                      backgroundImage: `radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.04) 1px, transparent 1px)`,
                      backgroundSize: "18px 18px"
                    }}
                  >
                    <div className="space-y-3">
                      {/* Pílula de Data (TODAY / HOJE) */}
                      <div className="flex justify-center">
                        <span className="px-3 py-1 rounded-md bg-[#d1d7db] text-[10px] font-bold text-zinc-700 tracking-wider shadow-sm uppercase">
                          Hoje
                        </span>
                      </div>

                      {/* Balão 1: Cliente Pergunta (Branco com Sombra Leve) */}
                      <div className="flex flex-col items-start max-w-[85%]">
                        <div className="relative bg-white text-zinc-900 px-3.5 py-2 rounded-2xl rounded-tl-none text-[12.5px] leading-snug shadow-[0_1px_2px_rgba(0,0,0,0.15)] border border-black/5">
                          <span className="text-[10.5px] font-bold text-[#075e54] block mb-0.5">Cliente</span>
                          <p>Boa tarde! Como faço para ver todos os produtos e o catálogo atualizado?</p>
                          <div className="flex justify-end mt-1">
                            <span className="text-[9px] text-zinc-400 font-medium">12:31</span>
                          </div>
                        </div>
                      </div>

                      {/* Balão 2: Resposta com o Link AnotaMeuContato (Verde WhatsApp Claro) */}
                      <div className="flex flex-col items-end ml-auto max-w-[92%]">
                        <div className="relative bg-[#dcf8c6] text-zinc-900 p-2.5 rounded-2xl rounded-tr-none text-[12.5px] leading-snug shadow-[0_1px_2px_rgba(0,0,0,0.15)] border border-emerald-600/10">
                          <p className="mb-1.5">
                            Olá! Acesse tudo diretamente pelo nosso endereço oficial na web:
                          </p>
                          
                          {/* Card de Link Pré-formatado */}
                          <div className="rounded-xl overflow-hidden bg-white/85 border border-emerald-500/20 p-2.5 shadow-sm hover:bg-white transition-all">
                            <div className="flex items-center gap-1.5 text-[#075e54] font-bold text-[11px] mb-1">
                              <Globe size={13} className="text-[#25D366]" />
                              <span>Catálogo & Vitrine Digital</span>
                            </div>
                            <p className="text-[11.5px] font-mono font-black text-[#006699] break-all leading-tight">
                              https://{fullDomainUrl}
                            </p>
                            <span className="text-[9px] text-zinc-500 block mt-1">
                              Toque para abrir instantaneamente
                            </span>
                          </div>

                          {/* Horário e Double Check Azul */}
                          <div className="flex justify-end items-center gap-1 mt-1.5 text-[9.5px] text-zinc-500">
                            <span>12:32</span>
                            <svg className="w-3.5 h-3.5 text-[#34B7F1]" viewBox="0 0 16 15" fill="none">
                              <path d="M15.01 3.316l-7.79 7.79-3.23-3.23.71-.71 2.52 2.52 7.08-7.08.71.71zm-4.56 0l-5.66 5.66-1.81-1.81.71-.71 1.1 1.1 4.95-4.95.71.71zm-7.47 4.95l-.71-.71-1.81 1.81 3.23 3.23.71-.71-2.52-2.52 1.1-1.1z" fill="currentColor"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Barra de Digitação Fiel à Imagem de Referência */}
                    <div className="flex items-center gap-1.5 pt-2">
                      <div className="flex-1 bg-white rounded-full px-3 py-1.5 flex items-center justify-between shadow-sm border border-black/5 text-zinc-400">
                        <div className="flex items-center gap-2">
                          <span className="text-base leading-none">😊</span>
                          <span className="text-[11.5px] text-zinc-400">Mensagem</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-zinc-500">
                          <span className="text-sm">📎</span>
                          <span className="text-sm">📷</span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#00a884] text-white flex items-center justify-center shadow-md shrink-0">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                      </div>
                    </div>

                  </div>

                  {/* Barra Home Indicator do iOS */}
                  <div className="bg-[#efeae2] py-1.5 flex justify-center">
                    <div className="w-28 h-1 bg-black/30 rounded-full" />
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
