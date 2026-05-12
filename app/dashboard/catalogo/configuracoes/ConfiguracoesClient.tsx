"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  Loader2,
  CheckCircle2,
  BookOpen,
  FileText,
  Layout,
  ExternalLink,
  Layers,
  Smartphone,
  Sparkles,
  ChevronRight,
  Info,
  Code,
  Package,
  Settings,
  Zap,
  MessageCircle,
  HelpCircle,
  Globe,
  Palette,
  Copy,
  Check
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Catalog {
  id: string;
  name: string;
  description: string | null;
  organization_id?: string;
  accent_color?: string;
  secondary_color?: string;
  [key: string]: any;
}

interface ConfiguracoesClientProps {
  catalog: Catalog;
  slug: string;
}

export default function ConfiguracoesClient({ catalog: initialCatalog, slug }: ConfiguracoesClientProps) {
  const [catalog, setCatalog] = useState(initialCatalog);
  const [activeTab, setActiveTab] = useState<"geral" | "implementar">("geral");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [whatsappTemplate, setWhatsappTemplate] = useState(initialCatalog.whatsapp_template || "");
  const [catalogType, setCatalogType] = useState<"product" | "service" | "hybrid">(initialCatalog.type || initialCatalog.catalog_type || "product");
  
  // Customization State for Embed
  const [embedWidth, setEmbedWidth] = useState("100%");
  const [embedHeight, setEmbedHeight] = useState("800px");

  const supabase = createClient();

  const embedUrl = `https://anotameucontato.com.br/${slug}/embed`;
  
  const iframeResizerCode = `<script>
  window.addEventListener('message', function(e) {
    if (e.data.type === 'plataformacard-height') {
      var iframes = document.querySelectorAll('iframe');
      for (var i = 0; i < iframes.length; i++) {
        if (iframes[i].src.indexOf('${slug}/embed') !== -1) {
          iframes[i].style.height = e.data.height + 'px';
        }
      }
    }
  });
</script>`;

  const iframeCode = `<!-- PlataformaCard: Catálogo de Produtos -->
${iframeResizerCode}
<iframe 
  src="${embedUrl}" 
  width="${embedWidth}" 
  height="${embedHeight}" 
  frameborder="0" 
  style="border:none; width: 100%; border-radius: 12px; overflow: hidden;"
  allow="clipboard-write"
></iframe>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(iframeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      const { error: catError } = await supabase
        .from("catalogs")
        .update({
          name: catalog.name,
          description: catalog.description,
          whatsapp_template: whatsappTemplate,
          type: catalogType
        })
        .eq("id", catalog.id);

      if (catError) throw catError;

      if (catalog.organization_id) {
        const { error: orgError } = await supabase
          .from("organizations")
          .update({
            accent_color: catalog.accent_color,
            secondary_color: catalog.secondary_color,
          })
          .eq("id", catalog.organization_id);

        if (orgError) throw orgError;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header Premium */}
      <div className="relative overflow-hidden bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[40px] p-10 shadow-sm group/header">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none opacity-50 transition-opacity group-hover/header:opacity-100" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-[var(--dash-text-primary)]">Configurações do Catálogo</h1>
            <p className="text-[var(--dash-text-muted)] font-medium max-w-xl">Gerencie a identidade e a implementação da sua vitrine digital em um só lugar.</p>
          </div>
          
          <div className="flex bg-[var(--dash-hover-bg)] p-1.5 rounded-2xl border border-[var(--dash-border)]">
            <button
              onClick={() => setActiveTab("geral")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === "geral" ? "bg-white text-black shadow-lg" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
            >
              <Layout size={16} />
              Geral
            </button>
            <button
              onClick={() => setActiveTab("implementar")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === "implementar" ? "bg-white text-black shadow-lg" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
            >
              <Code size={16} />
              Implementar
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "geral" ? (
          <motion.div
            key="geral"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid gap-8"
          >
            {/* Informações Básicas */}
            <section className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[40px] p-10 shadow-sm space-y-8">
              <div className="flex items-center gap-4 border-b border-[var(--dash-border)] pb-8">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <BookOpen size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">Informações Básicas</h3>
                  <p className="text-sm text-[var(--dash-text-muted)] font-medium">Como seu catálogo aparece para os clientes.</p>
                </div>
              </div>

              <div className="grid gap-10">
                {/* Tipo de Catálogo */}
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)] flex items-center gap-2">
                    <Zap size={14} className="text-primary" /> Tipo de Catálogo
                  </label>
                  <div className="flex flex-wrap p-1.5 rounded-[24px] bg-[var(--dash-hover-bg)] border border-[var(--dash-border)]">
                    <button
                      onClick={() => setCatalogType("product")}
                      className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all ${catalogType === "product" ? "bg-white text-black shadow-lg" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
                    >
                      <Package size={18} /> Produto
                    </button>
                    <button
                      onClick={() => setCatalogType("service")}
                      className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all ${catalogType === "service" ? "bg-white text-black shadow-lg" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
                    >
                      <Settings size={18} /> Serviço
                    </button>
                    <button
                      onClick={() => setCatalogType("hybrid")}
                      className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all ${catalogType === "hybrid" ? "bg-white text-black shadow-lg" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
                    >
                      <Sparkles size={18} /> Híbrido
                    </button>
                  </div>
                  <p className="text-[11px] text-[var(--dash-text-muted)] font-medium pl-2">
                    {catalogType === 'product' && 'Ideal para lojas de varejo e atacado.'}
                    {catalogType === 'service' && 'Perfeito para consultores, mecânicos e prestadores de serviço.'}
                    {catalogType === 'hybrid' && 'Permite classificar cada item individualmente como produto ou serviço.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-[var(--dash-border)]">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)] flex items-center gap-2">
                      <Globe size={14} className="text-primary" /> Descrição da Vitrine (SEO)
                    </label>
                    <textarea
                      value={catalog.description || ""}
                      onChange={(e) => setCatalog({ ...catalog, description: e.target.value })}
                      rows={6}
                      className="w-full p-6 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-[24px] focus:ring-2 focus:ring-primary outline-none transition-all resize-none leading-relaxed font-medium text-sm"
                      placeholder="Descreva seu negócio para seus clientes e para o Google..."
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)] flex items-center gap-2">
                        <MessageCircle size={14} className="text-primary" /> Modelo de Mensagem (WhatsApp)
                      </label>
                      <div className="group relative">
                        <HelpCircle size={14} className="text-[var(--dash-text-muted)] cursor-help" />
                        <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-zinc-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl leading-relaxed">
                          Use as tags para injetar dados reais do produto na mensagem. Ex: "Olá, quero saber mais sobre o {`{nome}`}"
                        </div>
                      </div>
                    </div>
                    <textarea
                      value={whatsappTemplate}
                      onChange={(e) => setWhatsappTemplate(e.target.value)}
                      rows={6}
                      className="w-full p-6 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-[24px] focus:ring-2 focus:ring-primary outline-none transition-all resize-none leading-relaxed font-medium text-sm"
                      placeholder="Ex: Olá! Vi o item {nome} no valor de {preco} e gostaria de saber mais..."
                    />
                    
                    {/* Tags Rápidas */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {['nome', 'preco', 'sku', 'link', 'tipo'].map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setWhatsappTemplate(prev => prev + `{${tag}}`)}
                          className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all border border-white/10 active:scale-90"
                        >
                          {`{${tag}}`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`
                    flex items-center gap-3 px-12 py-4 rounded-2xl font-black text-lg transition-all shadow-xl
                    ${saved ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-primary text-white shadow-primary/20 hover:scale-105 active:scale-95'}
                    disabled:opacity-50
                  `}
                >
                  {saving ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : saved ? (
                    <CheckCircle2 size={24} />
                  ) : (
                    <Save size={24} />
                  )}
                  {saved ? 'Salvo com Sucesso!' : saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="implementar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Controles de Customização */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[40px] p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Layout size={20} />
                  </div>
                  <h3 className="text-lg font-black tracking-tight">Personalização</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--dash-text-muted)]">
                      Largura (Width)
                    </label>
                    <input 
                      type="text" 
                      value={embedWidth}
                      onChange={(e) => setEmbedWidth(e.target.value)}
                      className="w-full bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all"
                      placeholder="ex: 100%"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--dash-text-muted)]">
                      Altura (Height)
                    </label>
                    <input 
                      type="text" 
                      value={embedHeight}
                      onChange={(e) => setEmbedHeight(e.target.value)}
                      className="w-full bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all"
                      placeholder="ex: 800px"
                    />
                  </div>

                  <div className="pt-4 border-t border-[var(--dash-border)] space-y-4">
                    <div className="flex gap-3 bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10">
                      <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] leading-relaxed text-[var(--dash-text-muted)]">
                        O modo <span className="font-bold text-[var(--dash-text-primary)]">Embed</span> oculta o cabeçalho global para focar nos produtos.
                      </p>
                    </div>
                    <div className="flex gap-3 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10">
                      <Smartphone size={16} className="text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] leading-relaxed text-[var(--dash-text-muted)]">
                        Layout 100% responsivo, adaptando-se a qualquer container do seu site.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <a 
                href={embedUrl} 
                target="_blank" 
                className="group flex items-center justify-between w-full p-6 bg-emerald-500 text-white rounded-[32px] font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
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
              <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[40px] p-8 shadow-sm space-y-6 relative overflow-hidden">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-zinc-500/10 flex items-center justify-center text-[var(--dash-text-primary)]">
                      <Code size={20} />
                    </div>
                    <h3 className="text-lg font-black tracking-tight">Código iFrame</h3>
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      copied ? "bg-emerald-500 text-white" : "bg-black text-white hover:bg-zinc-800"
                    }`}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copiado!" : "Copiar Código"}
                  </button>
                </div>

                <div className="bg-zinc-950 rounded-3xl p-6 font-mono text-xs text-emerald-400 border border-white/5 leading-relaxed overflow-x-auto shadow-inner">
                   <pre className="whitespace-pre-wrap break-all">
                     {iframeCode}
                   </pre>
                </div>
              </div>

              <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[40px] p-8 shadow-sm">
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
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
