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

            {/* Coluna Direita: Mockup Visual do Compartilhamento WhatsApp */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm rounded-2xl bg-zinc-950 border border-white/10 p-5 shadow-2xl relative overflow-hidden">
                {/* Header Mockup Chat */}
                <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#2CCB68] to-[#06B6D4] flex items-center justify-center text-white font-black text-xs">
                    PS
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">Seu Cliente no WhatsApp</h4>
                    <span className="text-[10px] text-emerald-400 font-medium">Online agora</span>
                  </div>
                </div>

                {/* Balão de Conversa Mockup */}
                <div className="mt-4 space-y-3">
                  <div className="bg-[#1f2c34] text-zinc-200 p-3 rounded-2xl rounded-tl-sm text-xs leading-relaxed max-w-[85%]">
                    Boa tarde! Onde vejo o catálogo e os dados de vocês?
                  </div>

                  <div className="ml-auto bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tr-sm text-xs shadow-md max-w-[90%]">
                    <p className="mb-2">Olá! Acesse tudo pelo nosso link direto:</p>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center gap-2 text-[#2CCB68] font-mono font-bold text-[11px] break-all">
                      <Globe size={14} className="shrink-0" />
                      <span>{fullDomainUrl}</span>
                    </div>
                  </div>
                </div>

                {/* Tag de Facilidade */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Smartphone size={12} className="text-emerald-400" /> Abre instantaneamente no celular
                  </span>
                  <span className="text-[#2CCB68] font-bold">100% Responsivo</span>
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
