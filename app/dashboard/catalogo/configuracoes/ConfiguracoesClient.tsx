"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Layout,
  Activity,
  Code,
  Image as ImageIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ConfiguracoesBannersTab from "@/components/dashboard/catalogo/configuracoes/ConfiguracoesBannersTab";
import ConfiguracoesGeralTab from "@/components/dashboard/catalogo/configuracoes/ConfiguracoesGeralTab";
import ConfiguracoesStatusTab from "@/components/dashboard/catalogo/configuracoes/ConfiguracoesStatusTab";
import ConfiguracoesImplementarTab from "@/components/dashboard/catalogo/configuracoes/ConfiguracoesImplementarTab";
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

export default function ConfiguracoesClient({
  catalog: initialCatalog,
  slug,
  products = [],
  categoryCount = 0,
  customDomain = null,
  isInheritingMaster = false,
  granularPermissions,
  role,
}: ConfiguracoesClientProps) {

  const isSeller = role === "seller";
  const catPerms = granularPermissions?.catalog;

  const canViewGeneral = isSeller ? (catPerms?.settings_general ?? true) : true;
  const canViewBehavior = isSeller ? (catPerms?.settings_behavior ?? true) : true;
  const canViewBanners = isSeller ? (catPerms?.settings_banners ?? true) : true;
  const canViewStatus = !isSeller;

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
  const categoryHeight = 150;
  const productHeightDesktop = 550;
  const productHeightMobile = 600;
  const footerHeight = 150;
  const estimatedRowsDesktop = Math.ceil((products?.length || 0) / 3);
  const recommendedHeightDesktop = baseHeaderHeight + bannerHeightDesktop + categoryHeight + (estimatedRowsDesktop * productHeightDesktop) + footerHeight;
  const recommendedHeightMobile = baseHeaderHeight + bannerHeightMobile + categoryHeight + ((products?.length || 0) * productHeightMobile) + footerHeight;

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
        is_active: isActive,
      };

      const orgPayload = catalog.organization_id ? {
        accent_color: catalog.accent_color,
        secondary_color: catalog.secondary_color,
      } : undefined;

      const result = await updateCatalogConfig(catalog.id, payload, catalog.organization_id, orgPayload);

      if (result.error) throw new Error(result.error);

      setCatalog(prev => ({ ...prev, ...payload }));
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
        {activeTab === "geral" && (
          <ConfiguracoesGeralTab
            catalog={catalog}
            setCatalog={setCatalog}
            catalogType={catalogType}
            setCatalogType={setCatalogType}
            whatsappTemplate={whatsappTemplate}
            setWhatsappTemplate={setWhatsappTemplate}
            hidePrices={hidePrices}
            setHidePrices={setHidePrices}
            outOfStockAtEnd={outOfStockAtEnd}
            setOutOfStockAtEnd={setOutOfStockAtEnd}
            isInheritingMaster={isInheritingMaster}
            canViewBehavior={canViewBehavior}
            saving={saving}
            saved={saved}
            handleSave={handleSave}
          />
        )}
        {activeTab === "status" && (
          <ConfiguracoesStatusTab
            isInheritingMaster={isInheritingMaster}
            isActive={isActive}
            setIsActive={setIsActive}
            saving={saving}
            saved={saved}
            handleSave={handleSave}
          />
        )}
        {activeTab === "implementar" && (
          <ConfiguracoesImplementarTab
            embedUrl={embedUrl}
            iframeCode={iframeCode}
            copied={copied}
            copyToClipboard={copyToClipboard}
            products={products}
            recommendedHeightDesktop={recommendedHeightDesktop}
            recommendedHeightMobile={recommendedHeightMobile}
          />
        )}
        {activeTab === "banners" && (
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
        )}
      </AnimatePresence>
    </div>
  );
}
