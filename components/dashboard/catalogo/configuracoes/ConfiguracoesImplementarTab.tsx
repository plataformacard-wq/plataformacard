"use client";

import {
  Layout,
  ExternalLink,
  Layers,
  Smartphone,
  ChevronRight,
  Code,
  Info,
  Copy,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";

interface ConfiguracoesImplementarTabProps {
  embedUrl: string;
  iframeCode: string;
  copied: boolean;
  copyToClipboard: () => void;
  products: { id: string; name: string; image_url?: string }[];
  recommendedHeightDesktop: number;
  recommendedHeightMobile: number;
}

export default function ConfiguracoesImplementarTab({
  embedUrl,
  iframeCode,
  copied,
  copyToClipboard,
  products,
  recommendedHeightDesktop,
  recommendedHeightMobile,
}: ConfiguracoesImplementarTabProps) {
  return (
    <motion.div
      key="implementar"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8"
    >
      {/* Controles de Customização */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[27px] p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Layout size={20} />
            </div>
            <h3 className="text-lg font-black tracking-tight">Personalização</h3>
          </div>

          <div className="space-y-6">
            <div className="pt-4 border-t border-[var(--dash-border)] space-y-4">
              {/* Alerta Destacado do Container */}
              <div className="bg-amber-500/10 border-2 border-amber-500/50 rounded-[27px] p-6 shadow-lg shadow-amber-500/5">
                <h4 className="flex items-center gap-2 text-sm font-black text-amber-500 mb-4 uppercase tracking-widest">
                  <Layout size={18} /> Guia de Container (Site Hospedeiro)
                </h4>
                <p className="text-xs font-medium text-[var(--dash-text-muted)] mb-5 leading-relaxed">
                  Para o catálogo funcionar perfeitamente sem barras de rolagem duplas, crie um &ldquo;Container&rdquo; ou &ldquo;Caixa&rdquo; no seu construtor de sites (ex: Elementor, Wix) com as seguintes <strong>Alturas Mínimas (Min-Height)</strong>:
                </p>
                <div className="flex flex-col gap-4">
                  <div className="flex-1 bg-black/40 border border-[var(--dash-border)] rounded-lg p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--dash-text-muted)] mb-1 flex items-center gap-1.5">
                      <Layout size={12} /> Desktop / Computador
                    </p>
                    <p className="text-2xl font-black text-[var(--dash-text-primary)]">
                      {recommendedHeightDesktop}px
                    </p>
                  </div>
                  <div className="flex-1 bg-black/40 border border-blue-500/30 rounded-lg p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1 flex items-center gap-1.5">
                      <Smartphone size={12} /> Mobile / Celular
                    </p>
                    <p className="text-2xl font-black text-blue-400 drop-shadow-sm">
                      {recommendedHeightMobile}px
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-amber-500/70 font-medium mt-4">
                  *Estes valores são calculados em tempo real somando seus {products?.length || 0} produtos ativos, barra de categorias, cabeçalho e banners.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 mt-6">
                <div className="flex gap-3 bg-[var(--dash-surface)] p-4 rounded-lg border border-[var(--dash-border)]">
                  <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed text-[var(--dash-text-muted)] font-medium">
                    O modo Embed oculta o cabeçalho global automaticamente.
                  </p>
                </div>
                <div className="flex gap-3 bg-[var(--dash-surface)] p-4 rounded-lg border border-[var(--dash-border)]">
                  <Code size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed text-[var(--dash-text-muted)] font-medium">
                    Nosso script iFrameResizer tenta ajustar a altura automaticamente, mas o Fallback de CSS é essencial.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <a
          href={embedUrl}
          target="_blank"
          className="group flex items-center justify-between w-full p-6 bg-emerald-500 text-white rounded-lg font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
        >
          <div className="flex items-center gap-3">
            <ExternalLink size={20} />
            VISUALIZAR PREVIEW
          </div>
          <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>

      {/* Código e Instruções */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[27px] p-8 shadow-sm space-y-6 relative overflow-hidden">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-zinc-500/10 flex items-center justify-center text-[var(--dash-text-primary)]">
                <Code size={20} />
              </div>
              <h3 className="text-lg font-black tracking-tight">Código iFrame</h3>
            </div>
            <button
              onClick={copyToClipboard}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                copied ? "bg-emerald-500 text-white" : "bg-black text-white hover:bg-zinc-800"
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copiado!" : "Copiar Código"}
            </button>
          </div>

          <div className="bg-zinc-950 rounded-[27px] p-6 font-mono text-xs text-emerald-400 border border-white/5 leading-relaxed overflow-x-auto shadow-inner">
            <pre className="whitespace-pre-wrap break-all">
              {iframeCode}
            </pre>
          </div>
        </div>

        <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[27px] p-8 shadow-sm">
          <h3 className="text-lg font-black tracking-tight mb-8 flex items-center gap-3">
            <Layers size={20} className="text-emerald-500" />
            Guia de Implementação
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            {[
              { step: "01", title: "Copiar", desc: "Clique no botão acima para copiar o código gerado." },
              { step: "02", title: "Integrar", desc: "No editor do seu site, cole o código em um bloco 'HTML' ou 'Embed'." },
              { step: "03", title: "Publicar", desc: "Publique a página para visualizar o catálogo em seu domínio." },
              { step: "04", title: "Ajustar", desc: "Caso apareça uma barra de rolagem interna, aumente a 'Altura'." }
            ].map((item) => (
              <div key={item.step} className="flex gap-4 group">
                <span className="text-3xl font-black text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors">{item.step}</span>
                <div>
                  <p className="font-black text-sm mb-1 tracking-tight text-[var(--dash-text-primary)]">{item.title}</p>
                  <p className="text-[11px] leading-relaxed text-[var(--dash-text-muted)] font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <details className="mt-8 group cursor-pointer">
            <summary className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-emerald-500 transition-colors list-none select-none">
              <ChevronRight size={14} className="group-open:rotate-90 transition-transform" />
              Dicas Avançadas para Mobile / Wix
            </summary>
            <div className="mt-4 p-5 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-[27px]">
              <p className="text-xs text-[var(--dash-text-primary)] font-medium leading-relaxed">
                Se o seu construtor de sites (ex: Wix, WordPress) não suportar auto-ajuste de altura (Resizer),
                e o catálogo estiver sendo cortado no celular, defina a configuração de rolagem (<code className="bg-zinc-800/10 px-1 py-0.5 rounded">overflow</code>)
                do Container / Box do seu site hospedeiro para <strong className="text-emerald-500">&ldquo;Scroll&rdquo;</strong> ou <strong className="text-emerald-500">&ldquo;Auto&rdquo;</strong>.
                Isso criará uma barra de rolagem exclusiva para o catálogo na tela do cliente.
              </p>
            </div>
          </details>
        </div>
      </div>
    </motion.div>
  );
}
