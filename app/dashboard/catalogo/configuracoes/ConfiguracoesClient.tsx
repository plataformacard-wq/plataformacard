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
  EyeOff,
  Activity
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ConfiguracoesBannersTab from "@/components/dashboard/catalogo/configuracoes/ConfiguracoesBannersTab";
import { getPublicUrl } from "@/lib/utils/url";

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
  customDomain?: string | null;
  isInheritingMaster?: boolean;
  granularPermissions?: any;
  role?: string;
}

export default function ConfiguracoesClient({ catalog: initialCatalog, slug, products = [], categoryCount = 0, customDomain = null, isInheritingMaster = false, granularPermissions, role }: ConfiguracoesClientProps) {
  
  const isSeller = role === "seller";
  const catPerms = granularPermissions?.catalog;
  
  const canViewGeneral = isSeller ? (catPerms?.settings_general ?? true) : true;
  const canViewBehavior = isSeller ? (catPerms?.settings_behavior ?? true) : true;
  const canViewBanners = isSeller ? (catPerms?.settings_banners ?? true) : true;
  const canViewStatus = !isSeller; // Vendedores não têm acesso a essa aba

  // Determinar a primeira aba disponível
  const initialTab = canViewGeneral ? "geral" 
                   : canViewStatus ? "status" 
                   : canViewBanners ? "banners" 
                   : "geral";

  const [catalog, setCatalog] = useState(initialCatalog);
  const [activeTab, setActiveTab] = useState<"geral" | "status" | "implementar" | "banners">(initialTab as any);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [whatsappTemplate, setWhatsappTemplate] = useState<string>(initialCatalog.whatsapp_template || "");
  const [catalogType, setCatalogType] = useState<"product" | "service" | "hybrid">(initialCatalog.type || initialCatalog.catalog_type || "product");
  const [hidePrices, setHidePrices] = useState<boolean>(initialCatalog.hide_prices || false);
  const [outOfStockAtEnd, setOutOfStockAtEnd] = useState<boolean>(initialCatalog.out_of_stock_at_end || false);
  const [isActive, setIsActive] = useState<boolean>(initialCatalog.is_active !== false);
  
  const [localBanners, setLocalBanners] = useState<any[]>(initialCatalog.banners || []);
  const [bannerSpeed, setBannerSpeed] = useState<number>(initialCatalog.banner_speed_seconds || 5);
  const [bannerInitialIndex, setBannerInitialIndex] = useState<number>(initialCatalog.banner_initial_index || 0);
  const [showBanners, setShowBanners] = useState<boolean>(initialCatalog.show_banners !== false);

  


  // Cálculo Dinâmico Realista de Altura
  const hasBanners = showBanners;
  const baseHeaderHeight = 250;
  const bannerHeightDesktop = hasBanners ? 500 : 0;
  const bannerHeightMobile = hasBanners ? 400 : 0;
  const categoryHeight = 150; // barra de categorias e margens
  const productHeightDesktop = 550; // altura real de cada card + gap
  const productHeightMobile = 600; // altura real de cada card no mobile + gap
  const footerHeight = 150;

  const estimatedRowsDesktop = Math.ceil((products?.length || 0) / 3);
  
  const recommendedHeightDesktop = baseHeaderHeight + bannerHeightDesktop + categoryHeight + (estimatedRowsDesktop * productHeightDesktop) + footerHeight;
  const recommendedHeightMobile = baseHeaderHeight + bannerHeightMobile + categoryHeight + ((products?.length || 0) * productHeightMobile) + footerHeight;

  const supabase = createClient();

  const embedUrl = `${getPublicUrl(slug, customDomain, true, true)}/embed`;
  
  const iframeResizerCode = `<script>
  window.addEventListener('message', function(e) {
    if (e.data.type === 'plataformashop-height') {
      var iframes = document.querySelectorAll('iframe');
      for (var i = 0; i < iframes.length; i++) {
        if (iframes[i].src.indexOf('${slug}/embed') !== -1) {
          iframes[i].style.height = e.data.height + 'px';
        }
      }
    }
  });
</script>`;

  const iframeCode = `<!-- PlataformaShop: Catálogo de Produtos -->
${iframeResizerCode}
<iframe 
  src="${embedUrl}" 
  width="100%" 
  height="100%" 
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
        out_of_stock_at_end: outOfStockAtEnd,
        banners: localBanners,
        banner_speed_seconds: bannerSpeed,
        banner_initial_index: bannerInitialIndex,
        show_banners: showBanners,
        is_active: isActive
      };

      const orgPayload = catalog.organization_id ? {
        accent_color: catalog.accent_color,
        secondary_color: catalog.secondary_color,
      } : undefined;

      const result = await updateCatalogConfig(catalog.id, payload, catalog.organization_id, orgPayload);

      if (result.error) {
        throw new Error(result.error);
      }

      setCatalog(prev => ({
        ...prev,
        ...payload
      }));

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
    }
  };



  return (
    <div className="space-y-8 pb-20">
      {/* Header Premium */}
      <div className="relative overflow-hidden bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[27px] p-6 md:p-8 shadow-sm group/header">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none opacity-50 transition-opacity group-hover/header:opacity-100" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-[var(--dash-text-primary)]">Configure seu catálogo</h1>
            <p className="text-[var(--dash-text-muted)] font-medium max-w-xl">Gerencie a identidade e a implementação da sua vitrine digital em um só lugar.</p>
          </div>
          
          <div className="flex bg-[var(--dash-hover-bg)] p-1.5 rounded-[27px] border border-[var(--dash-border)] overflow-x-auto">
            {canViewGeneral && (
              <button
                onClick={() => setActiveTab("geral")}
                className={`flex shrink-0 items-center gap-2 px-6 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${activeTab === "geral" ? "bg-[var(--dash-surface)] text-[var(--dash-text-primary)] shadow-lg" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
              >
                <Layout size={16} />
                Geral
              </button>
            )}
            
            {canViewStatus && (
              <>
                <button
                  onClick={() => setActiveTab("status")}
                  className={`flex shrink-0 items-center gap-2 px-6 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${activeTab === "status" ? "bg-[var(--dash-surface)] text-[var(--dash-text-primary)] shadow-lg" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
                >
                  <Activity size={16} />
                  Status
                </button>
                {initialCatalog.business_model === "ALL_SERVICE" && (
                  <button
                    onClick={() => setActiveTab("implementar")}
                    className={`flex shrink-0 items-center gap-2 px-6 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${activeTab === "implementar" ? "bg-[var(--dash-surface)] text-[var(--dash-text-primary)] shadow-lg" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
                  >
                    <Code size={16} />
                    Implementar
                  </button>
                )}
              </>
            )}

            {canViewBanners && (
              <button
                onClick={() => setActiveTab("banners")}
                className={`flex shrink-0 items-center gap-2 px-6 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${activeTab === "banners" ? "bg-[var(--dash-surface)] text-[var(--dash-text-primary)] shadow-lg" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
              >
                <ImageIcon size={16} />
                Banners
              </button>
            )}
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
            <section className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[27px] p-6 md:p-8 shadow-sm space-y-8">
              <div className="flex items-center gap-4 border-b border-[var(--dash-border)] pb-8">
                <div className="h-14 w-14 rounded-[27px] bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <BookOpen size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">Informações Básicas</h3>
                  <p className="text-sm text-[var(--dash-text-muted)] font-medium">Como seu catálogo aparece para os clientes.</p>
                </div>
              </div>

              <div className="grid gap-10">
                {/* Nome do Catálogo */}
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)] flex items-center gap-2">
                    <BookOpen size={14} className="text-primary" /> Nome do Catálogo
                  </label>
                  <input
                    type="text"
                    value={catalog.name || ""}
                    disabled={isInheritingMaster}
                    onChange={(e) => setCatalog({ ...catalog, name: e.target.value })}
                    className={`w-full p-6 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm ${isInheritingMaster ? 'opacity-60 cursor-not-allowed' : ''}`}
                    placeholder="Ex: Minha Loja Virtual"
                  />
                  <p className="text-[11px] text-[var(--dash-text-muted)] font-medium pl-2">
                    Este é o nome público que aparecerá no topo do seu catálogo.
                  </p>
                </div>

                {/* Tipo de Catálogo */}
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)] flex items-center gap-2">
                    <Zap size={14} className="text-primary" /> Tipo de Catálogo
                  </label>
                  <div className={`flex flex-wrap p-1.5 rounded-lg bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] ${isInheritingMaster ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}>
                    <button
                      onClick={() => !isInheritingMaster && setCatalogType("product")}
                      className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${catalogType === "product" ? "bg-[var(--dash-surface)] text-[var(--dash-text-primary)] shadow-lg" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
                    >
                      <Package size={18} /> Produto
                    </button>
                    <button
                      onClick={() => !isInheritingMaster && setCatalogType("service")}
                      className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${catalogType === "service" ? "bg-[var(--dash-surface)] text-[var(--dash-text-primary)] shadow-lg" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
                    >
                      <Settings size={18} /> Serviço
                    </button>
                    <button
                      onClick={() => !isInheritingMaster && setCatalogType("hybrid")}
                      className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${catalogType === "hybrid" ? "bg-[var(--dash-surface)] text-[var(--dash-text-primary)] shadow-lg" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
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
                      disabled={isInheritingMaster}
                      onChange={(e) => setCatalog({ ...catalog, description: e.target.value })}
                      rows={6}
                      className={`w-full p-6 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all resize-none leading-relaxed font-medium text-sm ${isInheritingMaster ? 'opacity-60 cursor-not-allowed' : ''}`}
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
                        <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-zinc-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl leading-relaxed">
                          Use as tags para injetar dados reais do produto na mensagem. Ex: "Olá, quero saber mais sobre o {`{nome}`}"
                        </div>
                      </div>
                    </div>
                    <textarea
                      value={whatsappTemplate}
                      disabled={isInheritingMaster}
                      onChange={(e) => setWhatsappTemplate(e.target.value)}
                      rows={6}
                      className={`w-full p-6 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all resize-none leading-relaxed font-medium text-sm ${isInheritingMaster ? 'opacity-60 cursor-not-allowed' : ''}`}
                      placeholder="Ex: Olá! Vi o item {nome} no valor de {preco} e gostaria de saber mais..."
                    />
                    
                    {/* Tags Rápidas */}
                    <div className={`flex flex-wrap gap-2 pt-2 ${isInheritingMaster ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}>
                      {[
                        {
                          label: catalogType === "service" ? "{nome do serviço}" : catalogType === "hybrid" ? "{nome do item}" : "{nome do produto}",
                          value: "nome"
                        },
                        { label: "{preco}", value: "preco" },
                        { label: "{sku}", value: "sku" },
                        { label: "{categoria}", value: "categoria" },
                      ].map(tag => (
                        <button
                          key={tag.value}
                          type="button"
                          onClick={() => !isInheritingMaster && setWhatsappTemplate((prev: string) => prev + `{${tag.value}}`)}
                          className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all border border-white/10 active:scale-90"
                        >
                          {tag.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Comportamento da Vitrine */}
                <div className={`pt-8 border-t border-[var(--dash-border)] space-y-6 ${!canViewBehavior ? 'opacity-70 pointer-events-none' : ''}`}>
                  <h4 className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)] flex items-center gap-2">
                    <Layout size={14} className="text-primary" /> Comportamento da Vitrine {!canViewBehavior && "(Somente Leitura)"}
                  </h4>
                  <div className="space-y-4">
                    {/* Ocultação de Preços */}
                    <div className="flex items-center justify-between p-6 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-lg">
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
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-[var(--dash-surface)] shadow ring-0 transition duration-300 ease-in-out ${hidePrices ? 'translate-x-2' : '-translate-x-2'}`} />
                      </button>
                    </div>

                    {/* Produtos Esgotados no Fim */}
                    <div className="flex items-center justify-between p-6 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-lg">
                      <div className="space-y-1 pr-6">
                        <label className="text-sm font-black text-[var(--dash-text-primary)] tracking-tight">Produtos Esgotados no Fim</label>
                        <p className="text-[11px] font-medium text-[var(--dash-text-muted)] leading-relaxed">
                          Move automaticamente todos os produtos marcados como esgotados para o final de suas respectivas categorias na vitrine do catálogo.
                        </p>
                      </div>
                      <button
                        onClick={() => setOutOfStockAtEnd(!outOfStockAtEnd)}
                        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${outOfStockAtEnd ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                      >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-[var(--dash-surface)] shadow ring-0 transition duration-300 ease-in-out ${outOfStockAtEnd ? 'translate-x-2' : '-translate-x-2'}`} />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`
                    flex items-center gap-3 px-12 py-4 rounded-[27px] font-black text-lg transition-all shadow-xl
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
        ) : activeTab === "status" ? (
          <motion.div
            key="status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid gap-8"
          >
            <section className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[27px] p-6 md:p-8 shadow-sm space-y-8">
              <div className="flex items-center gap-4 border-b border-[var(--dash-border)] pb-8">
                <div className="h-14 w-14 rounded-[27px] bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <Activity size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">Status do Catálogo</h3>
                  <p className="text-sm text-[var(--dash-text-muted)] font-medium">Controle a disponibilidade e informações de herança do seu catálogo.</p>
                </div>
              </div>

              {isInheritingMaster && (
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 mb-2">
                  <p className="text-sm font-medium flex items-start gap-2">
                    <Info size={18} className="shrink-0 mt-0.5" />
                    Você está operando com um Catálogo Franqueado (Master). As informações básicas do seu catálogo são herdadas automaticamente. Você ainda pode alterar o Comportamento da Vitrine e Banners.
                  </p>
                </div>
              )}

              <div className="grid gap-10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)] flex items-center gap-2">
                      <Zap size={14} className="text-primary" /> Ativar/Desativar Catálogo Próprio
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsActive(!isActive)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isActive ? 'bg-emerald-500' : 'bg-zinc-300'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[var(--dash-surface)] shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  {!isActive && (
                    <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400">
                      <p className="text-sm font-medium flex items-start gap-2">
                        <Info size={18} className="shrink-0 mt-0.5" />
                        Seu catálogo próprio está <strong>desativado</strong>. Os clientes não conseguirão ver seus produtos personalizados. Mantenha desativado caso esteja usando um Catálogo Master (Franquia/Plataforma).
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`
                    flex items-center gap-3 px-12 py-4 rounded-[27px] font-black text-lg transition-all shadow-xl
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
                        Para o catálogo funcionar perfeitamente sem barras de rolagem duplas, crie um "Container" ou "Caixa" no seu construtor de sites (ex: Elementor, Wix) com as seguintes <strong>Alturas Mínimas (Min-Height)</strong>:
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
                       do Container / Box do seu site hospedeiro para <strong className="text-emerald-500">"Scroll"</strong> ou <strong className="text-emerald-500">"Auto"</strong>. 
                       Isso criará uma barra de rolagem exclusiva para o catálogo na tela do cliente.
                     </p>
                   </div>
                 </details>
              </div>
            </div>
          </motion.div>
        ) : activeTab === "banners" ? (
          <ConfiguracoesBannersTab
            key="banners"
            localBanners={localBanners}
            setLocalBanners={setLocalBanners}
            bannerSpeed={bannerSpeed}
            setBannerSpeed={setBannerSpeed}
            bannerInitialIndex={bannerInitialIndex}
            setBannerInitialIndex={setBannerInitialIndex}
            showBanners={showBanners}
            setShowBanners={setShowBanners}
            saving={saving}
            saved={saved}
            handleSave={handleSave}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
