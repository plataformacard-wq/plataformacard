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
  Check,
  Plus,
  GripVertical,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Eye,
  EyeOff
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ImageUploadModal from "@/components/dashboard/ImageUploadModal";

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
  products?: { id: string; name: string; image_url?: string }[];
  categoryCount?: number;
}

export default function ConfiguracoesClient({ catalog: initialCatalog, slug, products = [], categoryCount = 0 }: ConfiguracoesClientProps) {
  const [catalog, setCatalog] = useState(initialCatalog);
  const [activeTab, setActiveTab] = useState<"geral" | "implementar" | "banners">("geral");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [whatsappTemplate, setWhatsappTemplate] = useState<string>(initialCatalog.whatsapp_template || "");
  const [catalogType, setCatalogType] = useState<"product" | "service" | "hybrid">(initialCatalog.type || initialCatalog.catalog_type || "product");
  const [hidePrices, setHidePrices] = useState<boolean>(initialCatalog.hide_prices || false);
  
  const [localBanners, setLocalBanners] = useState<any[]>(initialCatalog.banners || []);
  const [bannerSpeed, setBannerSpeed] = useState<number>(initialCatalog.banner_speed_seconds || 5);
  const [bannerInitialIndex, setBannerInitialIndex] = useState<number>(initialCatalog.banner_initial_index || 0);
  const [showBanners, setShowBanners] = useState<boolean>(initialCatalog.show_banners !== false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBannerIndex, setEditingBannerIndex] = useState<number | null>(null);
  const [tempBanner, setTempBanner] = useState<any>({});
  const [uploadMode, setUploadMode] = useState<"desktop" | "mobile" | null>(null);
  
  const [embedWidth, setEmbedWidth] = useState("100%");
  const [embedHeight, setEmbedHeight] = useState("800px");

  // Cálculo Dinâmico de Altura
  const estimatedRowsDesktop = Math.ceil((products?.length || 0) / 3);
  const estimatedCategories = categoryCount || 1;
  const recommendedHeightDesktop = 1150 + (estimatedCategories * 100) + (estimatedRowsDesktop * 500);
  const recommendedHeightMobile = 1150 + (estimatedCategories * 100) + ((products?.length || 0) * 500);

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
    // Validação estrita dos banners
    const hasInvalidBanners = localBanners.some(b => 
      !b.image_desktop_url || !b.image_mobile_url
    );
    if (hasInvalidBanners) {
      alert("Todos os banners precisam ter imagem Desktop e Mobile cadastradas. Edite ou remova os banners incompletos.");
      setActiveTab("banners");
      return;
    }

    setSaving(true);
    setSaved(false);

    try {
      const { updateCatalogConfig } = await import("@/lib/dashboard/sellerActions");
      
      const payload = {
        name: catalog.name,
        description: catalog.description,
        whatsapp_template: whatsappTemplate,
        type: catalogType,
        hide_prices: hidePrices,
        banners: localBanners,
        banner_speed_seconds: bannerSpeed,
        banner_initial_index: bannerInitialIndex,
        show_banners: showBanners
      };

      const orgPayload = catalog.organization_id ? {
        accent_color: catalog.accent_color,
        secondary_color: catalog.secondary_color,
      } : undefined;

      const result = await updateCatalogConfig(catalog.id, payload, catalog.organization_id, orgPayload);

      if (result.error) {
        throw new Error(result.error);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddBanner = () => {
    setTempBanner({ active: true, type: 'image' });
    setEditingBannerIndex(null);
    setIsBannerModalOpen(true);
  };

  const handleEditBanner = (index: number) => {
    setTempBanner({ ...localBanners[index] });
    setEditingBannerIndex(index);
    setIsBannerModalOpen(true);
  };

  const handleRemoveBanner = (index: number) => {
    if (confirm("Tem certeza que deseja remover este banner?")) {
      const updated = [...localBanners];
      updated.splice(index, 1);
      setLocalBanners(updated);
    }
  };

  const handleMoveBanner = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const updated = [...localBanners];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      setLocalBanners(updated);
    } else if (direction === 'down' && index < localBanners.length - 1) {
      const updated = [...localBanners];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      setLocalBanners(updated);
    }
  };

  const handleSaveBannerModal = () => {
    if (!tempBanner.image_desktop_url || !tempBanner.image_mobile_url) {
      alert("As imagens para Desktop e Mobile são obrigatórias para este banner.");
      return;
    }
    const updated = [...localBanners];
    if (editingBannerIndex !== null) {
      updated[editingBannerIndex] = tempBanner;
    } else {
      updated.push(tempBanner);
    }
    setLocalBanners(updated);
    setIsBannerModalOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header Premium */}
      <div className="relative overflow-hidden bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-10 shadow-sm group/header">
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
            <button
              onClick={() => setActiveTab("banners")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === "banners" ? "bg-white text-black shadow-lg" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
            >
              <ImageIcon size={16} />
              Banners
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
            <section className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-10 shadow-sm space-y-8">
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
                  <div className="flex flex-wrap p-1.5 rounded-xl bg-[var(--dash-hover-bg)] border border-[var(--dash-border)]">
                    <button
                      onClick={() => setCatalogType("product")}
                      className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${catalogType === "product" ? "bg-white text-black shadow-lg" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
                    >
                      <Package size={18} /> Produto
                    </button>
                    <button
                      onClick={() => setCatalogType("service")}
                      className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${catalogType === "service" ? "bg-white text-black shadow-lg" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
                    >
                      <Settings size={18} /> Serviço
                    </button>
                    <button
                      onClick={() => setCatalogType("hybrid")}
                      className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${catalogType === "hybrid" ? "bg-white text-black shadow-lg" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
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
                      className="w-full p-6 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all resize-none leading-relaxed font-medium text-sm"
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
                      className="w-full p-6 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all resize-none leading-relaxed font-medium text-sm"
                      placeholder="Ex: Olá! Vi o item {nome} no valor de {preco} e gostaria de saber mais..."
                    />
                    
                    {/* Tags Rápidas */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {['nome', 'preco', 'sku', 'link', 'tipo'].map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setWhatsappTemplate((prev: string) => prev + `{${tag}}`)}
                          className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all border border-white/10 active:scale-90"
                        >
                          {`{${tag}}`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Seção Ocultação de Preços */}
                <div className="pt-4 border-t border-[var(--dash-border)]">
                  <div className="flex items-center justify-between p-6 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl">
                    <div className="space-y-1 pr-6">
                      <label className="text-sm font-black text-[var(--dash-text-primary)] tracking-tight">Ocultar Preços (Negociação via WhatsApp)</label>
                      <p className="text-[11px] font-medium text-[var(--dash-text-muted)] leading-relaxed">
                        Esconde todos os valores financeiros da vitrine. Os clientes verão apenas o botão do WhatsApp. Ideal para vendas complexas ou vitrines B2B/CaaS.
                      </p>
                    </div>
                    <button
                      onClick={() => setHidePrices(!hidePrices)}
                      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${hidePrices ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-300 ease-in-out ${hidePrices ? 'translate-x-2' : '-translate-x-2'}`} />
                    </button>
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
        ) : activeTab === "implementar" ? (
          <motion.div
            key="implementar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Controles de Customização */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-8 shadow-sm space-y-6">
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
                      className="w-full bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all"
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
                      className="w-full bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500 transition-all"
                      placeholder="ex: 800px"
                    />
                    <div className="pt-2 flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Sparkles size={12} className="text-emerald-500" />
                        <span>Tamanho ideal baseado no seu catálogo atual:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          type="button" 
                          onClick={() => setEmbedHeight(`${recommendedHeightDesktop}px`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--dash-surface)] text-[var(--dash-text-primary)] font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/50 border border-[var(--dash-border)] transition-all active:scale-95"
                          title="Para exibições em computadores e notebooks"
                        >
                          <Layout size={12} /> Desktop: {recommendedHeightDesktop}px
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setEmbedHeight(`${recommendedHeightMobile}px`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--dash-surface)] text-[var(--dash-text-primary)] font-bold text-[10px] uppercase tracking-widest hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/50 border border-[var(--dash-border)] transition-all active:scale-95"
                          title="Para exibições exclusivas em celulares"
                        >
                          <Smartphone size={12} /> Mobile: {recommendedHeightMobile}px
                        </button>
                      </div>
                    </div>
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
                className="group flex items-center justify-between w-full p-6 bg-emerald-500 text-white rounded-xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
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
              <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-8 shadow-sm space-y-6 relative overflow-hidden">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-zinc-500/10 flex items-center justify-center text-[var(--dash-text-primary)]">
                      <Code size={20} />
                    </div>
                    <h3 className="text-lg font-black tracking-tight">Código iFrame</h3>
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      copied ? "bg-emerald-500 text-white" : "bg-black text-white hover:bg-zinc-800"
                    }`}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copiado!" : "Copiar Código"}
                  </button>
                </div>

                <div className="bg-zinc-950 rounded-2xl p-6 font-mono text-xs text-emerald-400 border border-white/5 leading-relaxed overflow-x-auto shadow-inner">
                   <pre className="whitespace-pre-wrap break-all">
                     {iframeCode}
                   </pre>
                </div>
              </div>

              <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-8 shadow-sm">
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
                   <div className="mt-4 p-5 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-2xl">
                     <p className="text-xs text-[var(--dash-text-primary)] font-medium leading-relaxed">
                       Se o seu construtor de sites (ex: Wix, WordPress) não suportar auto-ajuste de altura (Resizer), 
                       e o catálogo estiver sendo cortado no celular, defina a configuração de rolagem (<code className="bg-zinc-800/10 px-1 py-0.5 rounded">overflow</code>) 
                       do Container / Box do seu site hospedeiro para <strong className="text-emerald-500">"Scroll"</strong> ou <strong className="text-emerald-500">"Auto"</strong>. 
                       Isso criará uma barra de rolagem exclusiva para o catálogo na tela do cliente.
                     </p>
                   </div>
                 </details>
              </div>
            </div>
          </motion.div>
        ) : activeTab === "banners" ? (
          <motion.div
            key="banners"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid gap-8"
          >
            <section className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-10 shadow-sm space-y-8">
              <div className="flex items-center justify-between border-b border-[var(--dash-border)] pb-8">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <ImageIcon size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">Gerenciar Banners</h3>
                    <p className="text-sm text-[var(--dash-text-muted)] font-medium">Imagens de destaque que aparecem no topo do seu catálogo.</p>
                  </div>
                </div>
                <button
                  onClick={handleAddBanner}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  <Plus size={16} /> Adicionar Banner
                </button>
              </div>

              {/* Toggle Exibir Banners */}
              <div className="flex items-center justify-between p-6 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl">
                <div className="space-y-1 pr-6">
                  <label className="text-sm font-black text-[var(--dash-text-primary)] tracking-tight">Exibir Banners no Catálogo Público</label>
                  <p className="text-[11px] font-medium text-[var(--dash-text-muted)] leading-relaxed">
                    Ative ou desative a exibição do carrossel de banners (banners customizados ou produtos em destaque) no topo da vitrine pública.
                  </p>
                </div>
                <button
                  onClick={() => setShowBanners(!showBanners)}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${showBanners ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-300 ease-in-out ${showBanners ? 'translate-x-2' : '-translate-x-2'}`} />
                </button>
              </div>

              {/* Configurações do Carrossel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)] flex items-center gap-2">
                    Tempo de Transição (Segundos)
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="30"
                    value={bannerSpeed}
                    onChange={(e) => setBannerSpeed(parseInt(e.target.value) || 5)}
                    className="w-full p-4 bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)] flex items-center gap-2">
                    Banner Inicial
                  </label>
                  <select
                    value={bannerInitialIndex}
                    onChange={(e) => setBannerInitialIndex(parseInt(e.target.value))}
                    className="w-full p-4 bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm"
                  >
                    <option value="-1">Aleatório (Sorteio)</option>
                    {localBanners.map((_, i) => (
                      <option key={i} value={i}>Banner {i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lista de Banners */}
              <div className="space-y-4">
                {localBanners.length === 0 ? (
                  <div className="text-center p-12 border-2 border-dashed border-[var(--dash-border)] rounded-xl">
                    <ImageIcon size={48} className="mx-auto text-[var(--dash-text-muted)] opacity-50 mb-4" />
                    <p className="text-[var(--dash-text-muted)] font-medium">Nenhum banner configurado.</p>
                  </div>
                ) : (
                  localBanners.map((banner, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-xl hover:border-primary/50 transition-colors">
                      <div className="flex flex-col gap-1">
                        <button disabled={index === 0} onClick={() => handleMoveBanner(index, 'up')} className="p-1 text-[var(--dash-text-muted)] hover:text-white disabled:opacity-20"><ArrowUp size={16} /></button>
                        <button disabled={index === localBanners.length - 1} onClick={() => handleMoveBanner(index, 'down')} className="p-1 text-[var(--dash-text-muted)] hover:text-white disabled:opacity-20"><ArrowDown size={16} /></button>
                      </div>
                      
                      <div className="h-16 w-32 bg-zinc-900 rounded-lg overflow-hidden shrink-0 border border-[var(--dash-border)] flex items-center justify-center">
                        {banner.image_desktop_url ? (
                          <img src={banner.image_desktop_url} alt="Desktop Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--dash-text-muted)]">Sem Img</div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 px-4">
                        <h4 className="font-bold text-sm truncate">
                          {banner.title || "Banner sem título"}
                        </h4>
                        <p className="text-xs text-[var(--dash-text-muted)] truncate">
                          {banner.description || "Nenhuma descrição"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                           <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${banner.active !== false ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                             {banner.active !== false ? 'ATIVO' : 'INATIVO'}
                           </span>
                           {(!banner.image_desktop_url || !banner.image_mobile_url) ? (
                             <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                               INCOMPLETO
                             </span>
                           ) : null}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            const updated = [...localBanners];
                            updated[index].active = updated[index].active === false ? true : false;
                            setLocalBanners(updated);
                          }} 
                          className="p-3 bg-[var(--dash-hover-bg)] hover:bg-emerald-500/20 hover:text-emerald-500 rounded-xl transition-colors"
                          title={banner.active !== false ? "Ocultar Banner" : "Visualizar Banner"}
                        >
                          {banner.active !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button onClick={() => handleEditBanner(index)} className="p-3 bg-[var(--dash-hover-bg)] hover:bg-primary/20 hover:text-primary rounded-xl transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleRemoveBanner(index)} className="p-3 bg-[var(--dash-hover-bg)] hover:bg-red-500/20 hover:text-red-500 rounded-xl transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Salvar Botão */}
              <div className="flex justify-end pt-4 border-t border-[var(--dash-border)]">
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
                  {saving ? "Salvando..." : saved ? "Salvo com sucesso!" : "Salvar Alterações"}
                </button>
              </div>
            </section>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Modal de Banner */}
      <AnimatePresence>
        {isBannerModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsBannerModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <h2 className="text-2xl font-black tracking-tight mb-8 text-[var(--dash-text-primary)]">
                {editingBannerIndex !== null ? "Editar Banner" : "Novo Banner"}
              </h2>

              <div className="space-y-8">
                    {/* Uploaders de Imagem */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)]">
                          Imagem Desktop (Obrigatório)
                        </label>
                        <div 
                          onClick={() => setUploadMode("desktop")}
                          className={`relative aspect-[4/1] md:aspect-auto md:h-32 rounded-2xl overflow-hidden border-2 border-dashed cursor-pointer transition-all ${tempBanner.image_desktop_url ? 'border-primary/50' : 'border-[var(--dash-border)] hover:border-primary'}`}
                        >
                          {tempBanner.image_desktop_url ? (
                            <img src={tempBanner.image_desktop_url} alt="Desktop" className="w-full h-full object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[var(--dash-text-muted)]">
                              <ImageIcon size={24} />
                              <span className="text-[10px] font-bold">1200x300</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)]">
                          Imagem Mobile (Obrigatório)
                        </label>
                        <div 
                          onClick={() => setUploadMode("mobile")}
                          className={`relative aspect-[5/2] md:aspect-auto md:h-32 rounded-2xl overflow-hidden border-2 border-dashed cursor-pointer transition-all ${tempBanner.image_mobile_url ? 'border-primary/50' : 'border-[var(--dash-border)] hover:border-primary'}`}
                        >
                          {tempBanner.image_mobile_url ? (
                            <img src={tempBanner.image_mobile_url} alt="Mobile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[var(--dash-text-muted)]">
                              <Smartphone size={24} />
                              <span className="text-[10px] font-bold">800x320</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)]">Título (Opcional)</label>
                        <input
                          type="text"
                          value={tempBanner.title || ""}
                          onChange={(e) => setTempBanner({ ...tempBanner, title: e.target.value })}
                          className="w-full p-4 bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-xl focus:border-primary outline-none text-sm font-medium transition-colors text-[var(--dash-text-primary)] placeholder:text-[var(--dash-text-muted)]"
                          placeholder="Ex: Oferta de Inverno"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)]">Descrição (Opcional)</label>
                        <input
                          type="text"
                          value={tempBanner.description || ""}
                          onChange={(e) => setTempBanner({ ...tempBanner, description: e.target.value })}
                          className="w-full p-4 bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-xl focus:border-primary outline-none text-sm font-medium transition-colors text-[var(--dash-text-primary)] placeholder:text-[var(--dash-text-muted)]"
                          placeholder="Até 50% OFF em toda a loja..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)]">Texto do Botão (Opcional)</label>
                        <input
                          type="text"
                          value={tempBanner.button_text || ""}
                          onChange={(e) => setTempBanner({ ...tempBanner, button_text: e.target.value })}
                          className="w-full p-4 bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-xl focus:border-primary outline-none text-sm font-medium transition-colors text-[var(--dash-text-primary)] placeholder:text-[var(--dash-text-muted)]"
                          placeholder="Comprar Agora"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)]">Link do Botão (URL ou Produto)</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={tempBanner.button_link || ""}
                            onChange={(e) => setTempBanner({ ...tempBanner, button_link: e.target.value })}
                            className="w-full p-4 bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-xl focus:border-primary outline-none text-sm font-medium transition-colors text-[var(--dash-text-primary)] placeholder:text-[var(--dash-text-muted)]"
                            placeholder="https://... ou ID do Produto"
                          />
                        </div>
                      </div>
                    </div>

                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={tempBanner.active !== false} onChange={(e) => setTempBanner({ ...tempBanner, active: e.target.checked })} className="sr-only peer" />
                    <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    <span className="ml-3 text-sm font-medium text-[var(--dash-text-primary)]">Banner Ativo</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-10">
                <button
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveBannerModal}
                  className="px-8 py-3 rounded-xl bg-primary text-white text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Salvar Banner
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modais de Upload */}
      {uploadMode && (
        <ImageUploadModal
          isOpen={true}
          onClose={() => setUploadMode(null)}
          onUploadSuccess={(url) => {
            if (uploadMode === "desktop") setTempBanner({ ...tempBanner, image_desktop_url: url });
            if (uploadMode === "mobile") setTempBanner({ ...tempBanner, image_mobile_url: url });
            setUploadMode(null);
          }}
          aspectRatio={uploadMode === "desktop" ? 4 / 1 : 2.5 / 1}
          bucket="products"
          folder="banners"
          title={`Upload Imagem ${uploadMode === 'desktop' ? 'Desktop' : 'Mobile'}`}
        />
      )}
    </div>
  );
}
