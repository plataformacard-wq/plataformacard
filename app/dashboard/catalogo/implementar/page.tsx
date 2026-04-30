"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Globe, 
  Copy, 
  Check, 
  ExternalLink, 
  Info,
  Layers,
  Layout,
  Smartphone,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

export default function ImplementarPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState("");
  const [copied, setCopied] = useState(false);
  
  // Customization State
  const [width, setWidth] = useState("100%");
  const [height, setHeight] = useState("800px");

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("slug, organization_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.slug) {
        setSlug(profile.slug);
      }
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  const embedUrl = `https://anotameucontato.com.br/${slug}/embed`;
  
  const iframeCode = `<iframe 
  src="${embedUrl}" 
  width="${width}" 
  height="${height}" 
  frameborder="0" 
  style="border:none; border-radius: 12px; overflow: hidden;"
  allow="clipboard-write"
></iframe>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(iframeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header Unificado com o Dashboard */}
      <div 
        className="relative overflow-hidden rounded-3xl p-8 sm:p-12 border shadow-sm"
        style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
      >
        <div className="absolute top-0 right-0 w-[40%] h-full bg-emerald-500/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest">
            <Sparkles size={14} />
            Implementar Catálogo
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">
            Implementar Catálogo
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--dash-text-secondary)" }}>
            Integre o catálogo da PlataformaCard via iFrame com total controle de design.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Configuration Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div 
            className="rounded-3xl p-6 border shadow-sm"
            style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Layout size={18} />
              </div>
              <h2 className="text-base font-bold" style={{ color: "var(--dash-text-primary)" }}>Personalização</h2>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50" style={{ color: "var(--dash-text-primary)" }}>
                  Largura (Width)
                </label>
                <input 
                  type="text" 
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-full bg-[var(--dash-bg)] border rounded-2xl px-4 py-3 text-sm font-bold transition-all focus:outline-none focus:border-emerald-500"
                  style={{ color: "var(--dash-text-primary)", borderColor: "var(--dash-border)" }}
                  placeholder="ex: 100%"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50" style={{ color: "var(--dash-text-primary)" }}>
                  Altura (Height)
                </label>
                <input 
                  type="text" 
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full bg-[var(--dash-bg)] border rounded-2xl px-4 py-3 text-sm font-bold transition-all focus:outline-none focus:border-emerald-500"
                  style={{ color: "var(--dash-text-primary)", borderColor: "var(--dash-border)" }}
                  placeholder="ex: 800px"
                />
              </div>

              <div className="pt-4 border-t space-y-3" style={{ borderColor: "var(--dash-border)" }}>
                <div className="flex gap-3">
                  <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed" style={{ color: "var(--dash-text-secondary)" }}>
                    O modo <span className="font-bold" style={{ color: "var(--dash-text-primary)" }}>Embed</span> oculta o cabeçalho global.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Smartphone size={14} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed" style={{ color: "var(--dash-text-secondary)" }}>
                    Layout 100% responsivo e adaptável.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <a 
              href={embedUrl} 
              target="_blank" 
              className="group flex items-center justify-between w-full p-5 bg-emerald-500 text-white rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
            >
              <div className="flex items-center gap-2">
                 <ExternalLink size={18} />
                 VISUALIZAR EM TEMPO REAL
              </div>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <p className="text-[10px] text-center opacity-50 font-bold" style={{ color: "var(--dash-text-secondary)" }}>
              * Esta prévia reflete o layout que será exibido dentro do seu site oficial após a implementação.
            </p>
          </div>
        </div>

        {/* Right: Code and Instructions */}
        <div className="lg:col-span-8 space-y-6">
          {/* Snippet Card */}
          <div 
            className="rounded-3xl p-8 border shadow-sm relative overflow-hidden"
            style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-zinc-500/10 flex items-center justify-center" style={{ color: "var(--dash-text-primary)" }}>
                    <Layout size={18} />
                  </div>
                  <h2 className="text-lg font-bold" style={{ color: "var(--dash-text-primary)" }}>Código de Incorporação</h2>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    copied ? "bg-emerald-500 text-white" : "bg-zinc-900 text-white hover:bg-black"
                  }`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copiado!" : "Copiar Código"}
                </button>
              </div>

              <div className="bg-zinc-950 rounded-2xl p-6 font-mono text-xs text-emerald-400 border border-white/5 leading-relaxed overflow-x-auto">
                 <pre className="whitespace-pre-wrap break-all">
                   {iframeCode}
                 </pre>
              </div>
            </div>
          </div>

          {/* Instructions Card */}
          <div 
            className="rounded-3xl p-8 border shadow-sm"
            style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
          >
             <h3 className="text-base font-bold mb-6 flex items-center gap-3" style={{ color: "var(--dash-text-primary)" }}>
               <Layers size={18} className="text-emerald-500" />
               Como implementar no seu site?
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {[
                  { step: "01", title: "Copiar", desc: "Clique em copiar acima para salvar o snippet." },
                  { step: "02", title: "Integrar", desc: "No editor do seu site, adicione um bloco 'HTML'." },
                  { step: "03", title: "Publicar", desc: "Cole o código e publique a página." },
                  { step: "04", title: "Ajustar", desc: "Aumente a 'Altura' se houver rolagem interna." }
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <span className="text-xl font-black opacity-20" style={{ color: "var(--dash-text-primary)" }}>{item.step}</span>
                    <div>
                      <p className="font-bold text-sm mb-1" style={{ color: "var(--dash-text-primary)" }}>{item.title}</p>
                      <p className="text-[11px] leading-relaxed opacity-60" style={{ color: "var(--dash-text-primary)" }}>{item.desc}</p>
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
