"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

const supabase = createClient();
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  MessageCircle, 
  ArrowRight,
  Info,
  Maximize2,
  Package,
  Tag,
  Layers,
  Check,
  Clock,
  Share2,
  Copy
} from "lucide-react";
import PublicThemeToggle from "@/components/PublicThemeToggle";
import { getBusinessStatus } from "@/lib/utils/time";
import { formatWhatsAppMessage } from "@/lib/utils/whatsapp-utils";

type Category = {
  id: string;
  name: string;
  description: string | null;
  sort_order: number | null;
  specs_title?: string | null;
  show_specs?: boolean | null;
  show_colors?: boolean | null;
  colors?: string[] | null;
};

type Spec = {
  chave: string;
  valor: string;
};

type Product = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  specs: Spec[] | null;
  price: number | null;
  compare_at_price?: number | null;
  sku: string | null;
  has_retail?: boolean | null;
  has_wholesale?: boolean | null;
  wholesale_price?: number | null;
  wholesale_min_quantity?: number | null;
  image_url: string | null;
  image_urls?: string[] | null;
  sort_order: number | null;
  is_active?: boolean | null;
  is_in_stock?: boolean | null;
  specs_title?: string | null;
  show_specs?: boolean | null;
  show_colors?: boolean | null;
  colors?: string[] | null;
  highlight_text?: string | null;
  show_highlight?: boolean | null;
  type?: "product" | "service" | null;
  created_at: string;
  updated_at: string;
};

type ProductCatalogClientProps = {
  profileId: string;
  catalogId: string | null;
  slug: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  catalogName?: string | null;
  catalogDescription?: string | null;
  categories: Category[];
  products: Product[];
  whatsapp: string | null;
  logoUrl?: string | null;
  isPureCatalog?: boolean;
  isEmbed?: boolean;
  accentColor?: string | null;
  secondaryColor?: string | null;
  bio?: string | null;
  isAvailable?: boolean | null;
  businessHours?: Record<string, any>;
  customBusinessHours?: Record<string, any>;
  canCustomizeHours?: boolean | null;
  organizationId?: string | null;
  whatsappTemplate?: string | null;
  sellerStatus?: string | null;
  recessEndsAt?: string | null;
  hideCta?: boolean;
};

const sanitizeText = (text: string | null | undefined) => {
  if (!text) return "";
  return text
    .replace(/\s*-\s*EDITADO\s*$/gi, "")
    .replace(/\u00ad/g, "") // Soft hyphen
    .replace(/&shy;/g, "")  // Soft hyphen (HTML)
    .replace(/\u00a0/g, " ") // NBSP
    .replace(/&nbsp;/g, " ") // NBSP (HTML)
    .replace(/\s+/g, " ")    // Double spaces
    .replace(/ENPLACAMENTO/gi, "EMPLACAMENTO") // Consertar typo comum
    .replace(/E[NM]PLACA\s+MENTO/gi, "EMPLACAMENTO") // Consertar "EMPLACA MENTO" separado
    .trim();
};


const formatPrice = (price: number | null | undefined) => {
  if (price === null || price === undefined) return null;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
};

export default function ProductCatalogClient({
  profileId,
  catalogId,
  slug,
  fullName,
  avatarUrl,
  catalogName,
  catalogDescription,
  categories,
  products,
  whatsapp,
  logoUrl,
  isPureCatalog,
  isEmbed,
  accentColor,
  secondaryColor,
  bio,
  isAvailable,
  businessHours,
  customBusinessHours,
  canCustomizeHours,
  organizationId,
  whatsappTemplate,
  sellerStatus,
  recessEndsAt,
  hideCta = false,
}: ProductCatalogClientProps) {
  const primaryColor = accentColor || "var(--public-success)";
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [expandedDescriptionId, setExpandedDescriptionId] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [priceMode, setPriceMode] = useState<"retail" | "wholesale">("retail");
  const [showWarning, setShowWarning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const businessStatus = useMemo(() => {
    const hasCustomSchedule = customBusinessHours && 
                              customBusinessHours.schedule && 
                              Object.keys(customBusinessHours.schedule).length > 0;

    const activeHours = (canCustomizeHours && hasCustomSchedule) 
      ? customBusinessHours 
      : businessHours;

    const status = getBusinessStatus((activeHours ?? null) as any);
    const isRecessActive = recessEndsAt && new Date(recessEndsAt) > new Date();
    const isAvailableNow = (isRecessActive || isAvailable === false) ? false : status.isOpenNow;
    const statusMessage = isRecessActive
      ? "Em Recesso"
      : isAvailable === false
        ? "Indisponível"
        : status.message;
    return { isAvailableNow, statusMessage };
  }, [businessHours, customBusinessHours, canCustomizeHours, isAvailable, recessEndsAt]);

  const whatsappUrl = useMemo(() => {
    if (!whatsapp) return null;
    const clean = whatsapp.replace(/\D/g, "");
    const message = `Olá! Gostaria de mais informações sobre seus produtos.\n\nIdentificador: ${slug}`;
    return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
  }, [whatsapp, slug]);

  useEffect(() => {
    setHasMounted(true);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    
    // Auto-Height for Embed Mode
    if (isEmbed) {
      const sendHeight = () => {
        // Use offsetHeight of documentElement for better accuracy in some browsers
        const height = document.documentElement.offsetHeight || document.body.scrollHeight;
        window.parent.postMessage({ type: 'plataformacard-height', height }, '*');
      };

      // Envia a altura inicial e monitora mudanças de tamanho do corpo
      const observer = new ResizeObserver(() => sendHeight());
      observer.observe(document.body);
      
      // Também monitora o carregamento de imagens (que mudam a altura após o render inicial)
      window.addEventListener('load', sendHeight);
      
      // Envio inicial imediato
      sendHeight();

      return () => {
        window.removeEventListener("resize", handleResize);
        observer.disconnect();
        window.removeEventListener('load', sendHeight);
      };
    }

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isEmbed]);

  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("center center");
  const [searchQuery, setSearchQuery] = useState("");
  const hasTrackedCatalogViewRef = useRef(false);
  const [lastViewTimestamp, setLastViewTimestamp] = useState<number | null>(null);

  useEffect(() => {
    if (!catalogId) return;
    const lastSeen = localStorage.getItem(`last_catalog_view_${catalogId}`);
    if (lastSeen) {
      setLastViewTimestamp(new Date(lastSeen).getTime());
    } else {
      setLastViewTimestamp(0);
    }
    localStorage.setItem(`last_catalog_view_${catalogId}`, new Date().toISOString());
  }, [catalogId]);

  const selectedProduct = useMemo(() => {
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return null;

    const category = categories.find(c => c.id === product.category_id);
    
    return {
      ...product,
      name: sanitizeText(product.name),
      show_specs: product.show_specs ?? category?.show_specs ?? true,
      show_colors: product.show_colors ?? category?.show_colors ?? false,
      specs_title: product.specs_title || category?.specs_title || "Especificações Técnicas",
      colors: product.colors || category?.colors || [],
      highlight_text: sanitizeText(product.highlight_text),
      show_highlight: product.show_highlight,
    };
  }, [products, selectedProductId, categories]);

  const selectedProductGallery = useMemo(() => {
    if (!selectedProduct) return [];
    if (selectedProduct.image_urls && selectedProduct.image_urls.length > 0) return selectedProduct.image_urls;
    if (selectedProduct.image_url) return [selectedProduct.image_url];
    return [];
  }, [selectedProduct]);

  const selectedImageUrl = selectedProductGallery[selectedImageIndex] ?? selectedProduct?.image_url ?? null;
  const hasMultipleImages = selectedProductGallery.length > 1;

  useEffect(() => {
    if (hasTrackedCatalogViewRef.current) return;
    hasTrackedCatalogViewRef.current = true;
    void trackAnalyticsEvent({
      profileId,
      catalogId,
      organizationId: organizationId,
      eventType: "catalog_view",
      pageType: "catalog",
      metadata: { slug, path: `/${slug}/catalogo` },
    });
  }, [profileId, catalogId, slug, organizationId]);

  useEffect(() => {
    const shouldLock = selectedProductId && (!isEmbed || !isMobile);
    if (shouldLock) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [selectedProductId, isEmbed, isMobile]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash && hash.length > 1) {
        const possibleId = hash.substring(1);
        if (products.some(p => p.id === possibleId)) {
          setSelectedProductId(possibleId);
        } else {
          setSelectedProductId(null);
        }
      } else {
        setSelectedProductId(null);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [products]);

  useEffect(() => {
    setSelectedImageIndex(0);
    setIsZoomed(false);
    if (selectedProduct) {
      if (selectedProduct.has_retail !== false) {
        setPriceMode("retail");
      } else if (selectedProduct.has_wholesale) {
        setPriceMode("wholesale");
      }
    }
  }, [selectedProductId, selectedProduct]);

  const productWhatsappUrl = useMemo(() => {
    if (!whatsapp || !selectedProduct) return null;
    const cleanNumber = whatsapp.replace(/\D/g, "");
    
    const itemTerm = selectedProduct.type === 'service' ? 'serviço' : 'produto';
    const modeText = priceMode === "wholesale" ? "Atacado" : "Varejo";
    const priceText = priceMode === "wholesale" 
      ? formatPrice(selectedProduct.wholesale_price) 
      : formatPrice(selectedProduct.price);

    const message = formatWhatsAppMessage(whatsappTemplate, {
      item_name: selectedProduct.name,
      item_price: priceText || "",
      item_sku: selectedProduct.sku || undefined,
      item_url: `${window.location.origin}/${slug}/catalogo#${selectedProduct.id}`,
      item_type: selectedProduct.type === 'service' ? 'serviço' : 'produto',
      seller_name: fullName || "Vendedor",
    });
    
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  }, [whatsapp, selectedProduct, priceMode, slug, whatsappTemplate, fullName]);

  const trackLead = async (productName?: string) => {
    console.log("📍 trackLead iniciado para:", productName);
    try {
      const { error } = await supabase.from("leads_tracking").insert({
        organization_id: organizationId,
        profile_id: profileId,
        product_name: productName || "Interesse Geral (Botão Topo)",
        seller_name: fullName || "Vendedor"
      });
      if (error) console.error("❌ Lead Tracking Error:", error);
      else console.log("✅ Lead Tracking Sucesso!");
    } catch (err) {
      console.error("🔥 Lead Tracking Catch:", err);
    }
  };

  const handleImageZoomMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  };

  const handleOpenProduct = (product: Product) => {
    if (sellerStatus === 'paused') {
      return; // Bloqueia abertura do modal se o vendedor estiver pausado
    }
    console.log("📦 Abrindo produto:", product.name);
    setSelectedProductId(product.id);
    window.location.hash = product.id;
    
    if (isEmbed && isMobile) {
      setTimeout(() => {
        const el = document.getElementById(product.id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    }
    
    void trackAnalyticsEvent({
      profileId,
      catalogId,
      organizationId: organizationId,
      productId: product.id,
      eventType: "product_click",
      pageType: "catalog",
      metadata: { slug, path: `/${slug}/catalogo`, productName: product.name },
    });
  };

  const handleShare = async (title: string, text: string, url: string) => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Erro ao compartilhar:", err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert("Link copiado!");
      } catch (err) {
        console.error("Erro ao copiar link:", err);
      }
    }
  };

  const filteredCategories = useMemo(() => {
    const categorized = categories.map(cat => ({
      ...cat,
      products: products.filter(p => 
        p.category_id === cat.id && 
        p.is_active !== false &&
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).map(p => ({ ...p, name: sanitizeText(p.name) }))
    })).filter(cat => cat.products.length > 0);

    const uncategorized = products.filter(p => 
      (!p.category_id || !categories.some(c => c.id === p.category_id)) && 
      p.is_active !== false &&
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(p => ({ ...p, name: sanitizeText(p.name) }));

    if (uncategorized.length > 0) {
      categorized.push({
        id: "uncategorized",
        catalog_id: catalogId || "",
        name: "Outros itens",
        description: "Produtos sem categoria definida",
        products: uncategorized
      } as any);
    }

    return categorized;
  }, [categories, products, searchQuery, catalogId]);

  const handleCloseProduct = () => {
    setSelectedProductId(null);
    setExpandedDescriptionId(null);
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  };

  return (
    <div 
      className="w-full min-h-screen public-theme-container pb-20 selection:bg-emerald-500/30 !max-w-none !mx-0"
      style={{ 
        "--primary-color": primaryColor,
        width: '100%',
        maxWidth: 'none'
      } as any}
    >
      {/* Background decoration - subtle in light, glowing in dark */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/5 dark:bg-blue-500/10 blur-[100px] rounded-full" />
      </div>

      {!isEmbed && (
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-50 bg-[var(--public-glass-bg)] border-b border-[var(--public-card-border)] px-4 sm:px-6 py-3 sm:py-4 backdrop-blur-xl shadow-sm"
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <Link href={`/${slug}`} className="flex items-center gap-1.5 group text-[var(--public-text-dim)] hover:text-[var(--public-text-main)] transition-colors shrink-0">
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs sm:text-sm font-medium hidden xs:inline">Voltar</span>
            </Link>

            <div className="flex-1 flex items-center justify-center sm:justify-start gap-3 min-w-0">
              {isPureCatalog && logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-7 sm:h-9 w-auto object-contain" />
              ) : (
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div className="absolute inset-[-2px] rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-400 opacity-60" />
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={fullName || "Avatar"} className="h-9 w-9 sm:h-11 sm:w-11 rounded-full object-cover border-2 border-[var(--public-card-bg)] relative z-10" />
                    ) : (
                      <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-[var(--public-card-bg)] flex items-center justify-center text-xs font-bold border-2 border-[var(--public-card-bg)] relative z-10" style={{ color: primaryColor }}>
                        {(fullName || slug || "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--public-card-bg)] z-20 ${businessStatus.isAvailableNow ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  </div>
                  
                  <div className="min-w-0 flex flex-col">
                    <div className="flex items-center gap-2">
                      <p className="text-sm sm:text-base font-bold text-[var(--public-text-main)] leading-none truncate">
                        {fullName || "Vendedor"}
                      </p>
                      <span className="hidden sm:inline-block text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider border border-emerald-500/20">
                        {businessStatus.statusMessage}
                      </span>
                    </div>
                    {bio && (
                      <p className="text-[10px] sm:text-xs text-[var(--public-text-dim)] truncate mt-1 max-w-[200px] sm:max-w-xs font-medium">
                        {bio}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {!hideCta && whatsappUrl && (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    if (!businessStatus.isAvailableNow) {
                      setShowWarning(true);
                      void trackAnalyticsEvent({
                        profileId,
                        catalogId,
                        eventType: "whatsapp_click_closed",
                        pageType: "catalog_header",
                        metadata: { slug }
                      });
                    } else {
                      void trackLead();
                      void trackAnalyticsEvent({
                        profileId,
                        catalogId,
                        organizationId: organizationId,
                        eventType: "whatsapp_click",
                        pageType: "catalog_header",
                        metadata: { slug }
                      });
                      window.open(whatsappUrl, "_blank");
                    }
                  }}
                  className="hidden sm:flex items-center gap-2 bg-[#25D366] hover:opacity-90 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg"
                >
                  <MessageCircle size={14} />
                  WhatsApp
                </button>
              )}
              <PublicThemeToggle className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center bg-[var(--public-bg)] border border-[var(--public-card-border)] hover:bg-[var(--public-card-bg)] transition-colors text-[var(--public-text-main)] shadow-sm" />
              <button 
                onClick={() => handleShare(
                  catalogName || "Catálogo",
                  catalogDescription || "",
                  window.location.href.split('#')[0]
                )}
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center bg-[var(--public-bg)] border border-[var(--public-card-border)] hover:bg-[var(--public-card-bg)] transition-colors text-[var(--public-text-main)] shadow-sm"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </motion.header>
      )}
      
      <main className={`${isEmbed ? 'w-full px-4 sm:px-6 relative' : 'max-w-5xl mx-auto px-4 sm:px-6'} ${isEmbed ? 'pt-4 sm:pt-6' : 'pt-8 sm:pt-12'}`}>
        <section className="mb-12">
          {/* Status Badge for Embed Mode */}
          {isEmbed && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--public-glass-bg)] border border-[var(--public-card-border)] backdrop-blur-md shadow-sm w-fit"
            >
              <div className={`w-2 h-2 rounded-full ${businessStatus.isAvailableNow ? 'bg-emerald-500' : 'bg-slate-400'} ${businessStatus.isAvailableNow ? 'animate-pulse' : ''}`} />
              <span className="text-[10px] font-black text-[var(--public-text-main)] uppercase tracking-wider">
                {businessStatus.statusMessage}
              </span>
            </motion.div>
          )}
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl md:text-4xl font-black tracking-tighter text-[var(--public-text-main)] mb-4"
          >
            {catalogName || "Catálogo"}
          </motion.h1>
          {catalogDescription && (
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-[var(--public-text-dim)] text-lg leading-relaxed ${isEmbed ? 'w-full' : 'max-w-2xl'}`}
            >
              {catalogDescription}
            </motion.p>
          )}
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`mt-6 sm:mt-8 relative ${isEmbed ? 'w-full' : 'max-w-xl'}`}
          >
            <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[var(--public-text-muted)]">
              <Search size={18} className="sm:w-5 sm:h-5" />
            </div>
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--public-card-bg)] border border-[var(--public-card-border)] rounded-2xl py-3 sm:py-4 pl-10 sm:pl-12 pr-4 sm:pr-6 text-sm sm:text-base text-[var(--public-text-main)] placeholder:text-[var(--public-text-dim)] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
            />
          </motion.div>
        </section>

        <div className="space-y-16 relative">
          {sellerStatus === 'paused' && (
            <div className="mb-8 w-full">
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-2xl text-center shadow-sm">
                <span className="font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Indisponível para atendimento imediato
                </span>
                <p className="text-xs mt-1 opacity-80">As informações abaixo são puramente para consulta de vitrine.</p>
              </div>
            </div>
          )}
          <LayoutGroup>
            {filteredCategories.map((category, idx) => (
              <motion.section 
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 mb-6 sm:mb-8">
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tighter text-[var(--public-text-main)] flex items-center gap-3">
                      <span className="w-2.5 h-6 sm:h-8 md:h-10 rounded-full" style={{ backgroundColor: primaryColor }} />
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className="text-[var(--public-text-dim)] text-xs sm:text-sm mt-1 sm:mt-2 ml-5">{category.description}</p>
                    )}
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-[var(--public-text-dim)] uppercase tracking-widest bg-[var(--public-card-bg)] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-2xl border border-[var(--public-card-border)] shadow-sm w-fit">
                    {category.products.length} {category.products.every(p => p.type === 'service') ? 'serviços' : category.products.some(p => p.type === 'service') ? 'itens' : 'produtos'}
                  </span>
                </div>

                <div className={`grid ${isEmbed ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"}`}>
                  {category.products.map((product) => {
                    const isExpanded = isEmbed && isMobile && selectedProductId === product.id;
                    const hasMultipleImages = product.image_urls && product.image_urls.length > 0;
                    const productGallery = product.image_url ? [product.image_url, ...(product.image_urls || [])] : (product.image_urls || []);
                    
                    const wpUrl = (() => {
                      if (!whatsapp) return null;
                      const cleanNumber = whatsapp.replace(/\D/g, "");
                      const priceText = priceMode === "wholesale" 
                        ? formatPrice(product.wholesale_price) 
                        : formatPrice(product.price);
                      const message = formatWhatsAppMessage(whatsappTemplate, {
                        item_name: product.name,
                        item_price: priceText || "",
                        item_sku: product.sku || undefined,
                        item_url: `${window.location.origin}/${slug}/catalogo#${product.id}`,
                        item_type: product.type === 'service' ? 'serviço' : 'produto',
                        seller_name: fullName || "Vendedor",
                      });
                      return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
                    })();

                    return (
                      <motion.div
                        layout
                        key={product.id}
                        id={product.id}
                        onClick={() => {
                          if (!isExpanded) handleOpenProduct(product);
                        }}
                        whileHover={sellerStatus === 'paused' ? {} : { y: -4 }}
                        className={`group relative bg-[var(--public-card-bg)] border ${isExpanded ? 'border-emerald-500 shadow-xl' : 'border-[var(--public-card-border)] shadow-[0_2px_12px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgb(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.3)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)]'} rounded-2xl overflow-hidden transition-all duration-300 ${sellerStatus === 'paused' ? 'cursor-default opacity-90' : (isExpanded ? '' : 'cursor-pointer hover:border-emerald-500/30')}`}
                      >
                        <div className={`aspect-square relative overflow-hidden bg-[var(--public-card-bg)] flex items-center justify-center ${isExpanded ? 'p-4' : 'p-0'}`}>
                          {isExpanded && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleCloseProduct(); }}
                              className="absolute top-4 right-4 z-50 h-10 w-10 rounded-full bg-black/45 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 shadow-md cursor-pointer"
                            >
                              <X size={20} />
                            </button>
                          )}
                          {!product.is_in_stock && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
                              <span className="bg-rose-600 !text-white text-[10px] font-black px-4 py-2 rounded-full shadow-2xl border border-rose-500">
                                ESGOTADO
                              </span>
                            </div>
                          )}
                          {product.image_url ? (
                            <img 
                              src={isExpanded ? (productGallery[selectedImageIndex] || product.image_url) : product.image_url} 
                              alt={product.name} 
                              className={`w-full h-full object-contain transition-transform duration-500 ${isExpanded ? '' : 'group-hover:scale-110'} ${!product.is_in_stock ? 'opacity-40 grayscale-[0.5]' : ''}`}
                            />
                          ) : (
                            <Package size={48} className={`text-[var(--public-text-dim)] ${!product.is_in_stock ? 'opacity-30' : ''}`} />
                          )}

                          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                            {product.type === 'service' && (
                              <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-lg border border-emerald-400/30 uppercase tracking-widest">
                                Serviço
                              </span>
                            )}
                            {lastViewTimestamp !== null && new Date(product.created_at).getTime() > lastViewTimestamp && (
                              <span className="text-black text-[10px] font-black px-3 py-1 rounded-full shadow-lg border" style={{ backgroundColor: primaryColor, borderColor: `${primaryColor}aa` }}>
                                NOVO
                              </span>
                            )}
                            {lastViewTimestamp !== null && new Date(product.updated_at).getTime() > lastViewTimestamp && new Date(product.created_at).getTime() <= lastViewTimestamp && (
                              <span className="bg-blue-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg border border-blue-400">
                                ATUALIZADO
                              </span>
                            )}
                          </div>

                          {!isExpanded && sellerStatus !== 'paused' && (
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/10">
                                <Maximize2 size={18} className="text-white" />
                              </div>
                            </div>
                          )}
                        </div>

                        {isExpanded && hasMultipleImages && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }} 
                            className="px-4 pb-2 -mt-2 overflow-x-auto no-scrollbar"
                          >
                            <div className="flex gap-2 justify-center">
                              {productGallery.map((url, idx) => (
                                <button 
                                  key={idx} 
                                  onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(idx); }}
                                  className={`h-12 w-12 sm:h-16 sm:w-16 rounded-xl border-2 flex-shrink-0 overflow-hidden cursor-pointer ${selectedImageIndex === idx ? 'border-emerald-500 scale-105' : 'border-[var(--public-card-border)] opacity-60'}`}
                                >
                                  <img src={url} alt="" className="w-full h-full object-cover" />
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}

                        <div className="p-4 sm:p-6 flex flex-col h-full relative">
                          <div className="mb-2 sm:mb-4 flex flex-col gap-1.5 sm:gap-2 items-start relative z-10">
                            <h3 className="inline-block text-sm sm:text-base font-black tracking-tight text-[var(--public-text-main)] bg-[var(--public-bg)] border border-[var(--public-card-border)] px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl sm:rounded-2xl shadow-sm break-words-strategy">
                               {product.name}
                            </h3>
                            {product.show_highlight && product.highlight_text && (
                              <div className="bg-emerald-500/10 text-emerald-500 text-[8px] sm:text-[9px] font-black px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1 animate-in fade-in zoom-in duration-300 w-fit break-words-strategy">
                                <Tag size={10} className="sm:w-3 sm:h-3 animate-pulse" />
                                {sanitizeText(product.highlight_text)}
                              </div>
                            )}
                          </div>
                          
                          {product.description && (
                            <div className="relative z-10 mb-3 sm:mb-5">
                              <div 
                                className={`text-[var(--public-text-dim)] text-[10px] sm:text-sm leading-relaxed break-words-strategy [&_*]:!whitespace-normal [&_*]:!max-w-full ${isExpanded && expandedDescriptionId === product.id ? '' : 'line-clamp-2'}`}
                                dangerouslySetInnerHTML={{ __html: sanitizeText(product.description) }}
                              />
                              {isExpanded && product.description.length > 80 && expandedDescriptionId !== product.id && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setExpandedDescriptionId(product.id); }}
                                  className="text-emerald-500 text-xs font-bold mt-2 hover:underline inline-flex items-center gap-1 cursor-pointer"
                                >
                                  Ler mais <ChevronRight size={12} />
                                </button>
                              )}
                            </div>
                          )}

                          {isExpanded && expandedDescriptionId === product.id && product.show_specs !== false && product.specs && product.specs.length > 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 mb-6 relative z-10">
                              <h4 className="flex items-center gap-2 text-[var(--public-text-main)] font-extrabold text-sm mb-3">
                                <Package size={16} className="text-emerald-500" />
                                {product.specs_title || "Especificações Técnicas"}
                              </h4>
                              <div className="grid gap-2">
                                {product.specs.map((spec, i) => (
                                  <div key={i} className="flex items-center justify-between bg-[var(--public-bg)] border border-[var(--public-card-border)] rounded-xl px-3 py-2">
                                    <span className="text-xs text-[var(--public-text-dim)] font-bold">{spec.chave}</span>
                                    <span className="text-sm text-[var(--public-text-main)] font-bold">{spec.valor}</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}

                          <div className="flex flex-col gap-3 mt-auto relative pt-2 z-10 w-full">
                            {/* Preço (se habilitado) */}
                            {(product.is_in_stock !== false && (
                              (product.has_retail !== false && product.price !== null) || 
                              (product.has_retail === false && product.has_wholesale && product.wholesale_price)
                            )) && (
                              <div className="flex flex-col items-start">
                                {product.has_retail !== false && product.price !== null && (
                                  <div className="flex flex-col gap-0.5">
                                    {product.compare_at_price && (
                                      <div className="text-[10px] sm:text-sm font-semibold text-[var(--public-text-dim)] flex items-center gap-1 sm:gap-1.5">
                                        <span className="text-[8px] sm:text-[10px] uppercase tracking-wider text-[var(--public-text-dim)]/70 font-bold">De</span>
                                        <span className="line-through">{formatPrice(product.compare_at_price)}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1 sm:gap-1.5">
                                      {product.compare_at_price && <span className="text-[8px] sm:text-[10px] uppercase text-emerald-500/80 font-black">Por</span>}
                                      <p className="text-base sm:text-xl font-extrabold text-[var(--primary-color)] leading-none">
                                        {formatPrice(product.price)}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                {product.has_retail === false && product.has_wholesale && product.wholesale_price && (
                                  <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-[#25D366] uppercase tracking-widest mb-0.5">A partir de</span>
                                    <p className="text-base sm:text-xl font-extrabold text-[#25D366] leading-none">
                                      {formatPrice(product.wholesale_price)}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Botões do Card em modo colapsado */}
                            {!isExpanded && sellerStatus !== 'paused' && (
                              <div className="flex flex-col gap-2 w-full mt-1">
                                {/* Botão Saiba mais */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenProduct(product);
                                  }}
                                  className="flex items-center justify-center gap-1.5 w-full py-2.5 px-4 bg-transparent border border-[var(--primary-color)] hover:bg-[var(--primary-color)]/5 text-[var(--primary-color)] font-bold rounded-xl transition-all text-xs uppercase tracking-wider cursor-pointer"
                                >
                                  Saiba mais
                                </button>

                                {/* Botão do WhatsApp sempre visível */}
                                {!hideCta && (
                                  product.is_in_stock !== false ? (
                                    businessStatus.isAvailableNow ? (
                                      <a
                                        href={wpUrl || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          console.log("🖱️ Clique WhatsApp Card detectado:", product.name);
                                          void trackLead(product.name);
                                          void trackAnalyticsEvent({
                                            profileId,
                                            catalogId,
                                            organizationId: organizationId,
                                            productId: product.id,
                                            eventType: "whatsapp_click",
                                            pageType: "product_card",
                                            metadata: { slug, productName: product.name, priceMode }
                                          });
                                        }}
                                        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#25D366] hover:opacity-90 text-white font-black rounded-xl shadow-sm transition-all text-xs uppercase tracking-wider"
                                      >
                                        <MessageCircle size={16} />
                                        Pedir no WhatsApp
                                      </a>
                                    ) : (
                                      <div
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          void trackAnalyticsEvent({
                                            profileId,
                                            catalogId,
                                            productId: product.id,
                                            eventType: "whatsapp_click_closed",
                                            pageType: "product_card",
                                            metadata: { slug, productName: product.name, priceMode }
                                          });
                                        }}
                                        className="flex flex-col items-center justify-center gap-0.5 w-full py-2 px-4 bg-[var(--public-bg)] text-[var(--public-text-dim)] rounded-xl border border-[var(--public-card-border)] transition-all cursor-pointer hover:bg-[var(--public-card-border)]/20"
                                      >
                                        <div className="flex items-center justify-center gap-1 font-black text-[9px] uppercase tracking-wider">
                                          <Clock size={12} className="text-slate-400" />
                                          Estabelecimento Fechado
                                        </div>
                                      </div>
                                    )
                                  ) : (
                                    <div className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[var(--public-bg)] text-[var(--public-text-dim)] font-black rounded-xl border border-[var(--public-card-border)] text-xs uppercase tracking-wider cursor-not-allowed opacity-60">
                                      <Package size={16} />
                                      Indisponível
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </div>

                          {isExpanded && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 pt-5 border-t border-[var(--public-card-border)] relative z-20">
                              {!hideCta && (
                                product.is_in_stock !== false ? (
                                  businessStatus.isAvailableNow ? (
                                    <a
                                      href={wpUrl || '#'}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        console.log("🖱️ Clique WhatsApp Produto detectado:", product.name);
                                        void trackLead(product.name);
                                        void trackAnalyticsEvent({
                                          profileId,
                                          catalogId,
                                          organizationId: organizationId,
                                          productId: product.id,
                                          eventType: "whatsapp_click",
                                          pageType: "product_accordion",
                                          metadata: { slug, productName: product.name, priceMode }
                                        });
                                      }}
                                      className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-[#25D366] hover:opacity-90 text-white font-black rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider"
                                    >
                                      <MessageCircle size={18} />
                                      Fazer Pedido via WhatsApp
                                    </a>
                                  ) : (
                                    <div 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        void trackAnalyticsEvent({
                                          profileId,
                                          catalogId,
                                          productId: product.id,
                                          eventType: "whatsapp_click_closed",
                                          pageType: "product_accordion",
                                          metadata: { slug, productName: product.name, priceMode }
                                        });
                                      }}
                                      className="flex flex-col items-center justify-center gap-1 w-full py-3 px-4 bg-[var(--public-bg)] text-[var(--public-text-dim)] rounded-xl border border-[var(--public-card-border)] transition-all cursor-pointer hover:bg-[var(--public-card-border)]/20"
                                    >
                                      <div className="flex items-center gap-1.5 font-black text-[10px] uppercase tracking-wider">
                                        <Clock size={14} />
                                        Estabelecimento Fechado
                                      </div>
                                      <span className="text-[9px] font-medium opacity-70">Clique para registrar interesse mesmo fechado</span>
                                    </div>
                                  )
                                ) : (
                                  <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[var(--public-bg)] text-[var(--public-text-dim)] font-black rounded-xl border border-[var(--public-card-border)] text-xs uppercase tracking-wider cursor-not-allowed opacity-60">
                                    <Package size={16} />
                                    Produto Indisponível
                                  </div>
                                )
                              )}

                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const baseUrl = window.location.href.split('#')[0];
                                  handleShare(
                                    product.name,
                                    product.description?.replace(/<[^>]*>/g, '').substring(0, 100) || "",
                                    `${baseUrl}#${product.id}`
                                  );
                                }}
                                className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-transparent border border-[var(--public-card-border)] text-[var(--public-text-dim)] font-bold rounded-xl hover:bg-[var(--public-bg)] transition-all text-[10px] uppercase tracking-widest cursor-pointer"
                              >
                                <Share2 size={14} />
                                Compartilhar este Produto
                              </button>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>
            ))}
          </LayoutGroup>

          {filteredCategories.length === 0 && searchQuery && (
            <div className="py-20 text-center">
              <div className="bg-[var(--public-card-bg)] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--public-card-border)]">
                <Search size={32} className="text-[var(--public-text-dim)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--public-text-main)] mb-2">Nenhum item encontrado</h3>
              <p className="text-[var(--public-text-dim)]">Tente buscar por termos diferentes (produtos ou serviços) ou confira outras categorias.</p>
            </div>
          )}
        </div>
      </main>

      {!isEmbed && (
        <footer className="mt-32 pb-20 text-center">
          <div className="flex items-center justify-center gap-3 text-[var(--public-text-dim)] text-xs font-bold uppercase tracking-[0.2em]">
            <span className="w-8 h-px bg-[var(--public-card-border)]" />
            PlataformaCard
            <span className="w-8 h-px bg-[var(--public-card-border)]" />
          </div>
        </footer>
      )}

      {hasMounted && createPortal(
        <AnimatePresence>
          {(!isEmbed || !isMobile) && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProductId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-[95%] sm:w-full max-w-2xl bg-[var(--public-card-bg)] border border-[var(--public-card-border)] rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[95vh] public-modal-content z-10"
            >
              {/* Pinned Close Button */}
              <button 
                onClick={() => setSelectedProductId(null)}
                className="absolute top-4 right-4 z-40 h-10 w-10 rounded-full bg-black/45 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 hover:scale-110 active:scale-95 transition-all shadow-md"
              >
                <X size={20} />
              </button>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="w-full bg-[var(--public-card-bg)] flex flex-col relative shrink-0">
                <div 
                  className="relative aspect-[16/10] overflow-hidden flex items-center justify-center p-4"
                  onMouseMove={handleImageZoomMove}
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={() => setIsZoomed(false)}
                >
                  {selectedImageUrl ? (
                    <motion.img 
                      key={selectedImageUrl}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: isZoomed ? 2.5 : 1 }}
                      transition={{ 
                        scale: { duration: 0.2, ease: "easeOut" },
                        opacity: { duration: 0.3 }
                      }}
                      src={selectedImageUrl} 
                      alt={selectedProduct.name}
                      style={{ transformOrigin: zoomOrigin }}
                      className="w-full h-full object-contain cursor-zoom-in"
                    />
                  ) : (
                    <Package size={100} className="text-[var(--public-text-dim)]" />
                  )}

                  {hasMultipleImages && (
                    <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(prev => prev === 0 ? selectedProductGallery.length - 1 : prev - 1); }}
                        className="pointer-events-auto h-10 w-10 rounded-full bg-[var(--public-glass-bg)] border border-[var(--public-card-border)] shadow-lg flex items-center justify-center text-[var(--public-text-main)] hover:scale-110 transition-transform"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(prev => prev === selectedProductGallery.length - 1 ? 0 : prev + 1); }}
                        className="pointer-events-auto h-10 w-10 rounded-full bg-[var(--public-glass-bg)] border border-[var(--public-card-border)] shadow-lg flex items-center justify-center text-[var(--public-text-main)] hover:scale-110 transition-transform"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  )}
                </div>

                {hasMultipleImages && (
                  <div className="p-3 border-t border-[var(--public-card-border)] flex gap-2 overflow-x-auto no-scrollbar justify-center bg-[var(--public-bg)]">
                    {selectedProductGallery.map((url, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`h-14 w-14 rounded-2xl border-2 flex-shrink-0 transition-all overflow-hidden ${
                          selectedImageIndex === idx ? "border-emerald-500 scale-105" : "border-[var(--public-card-border)] opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col min-w-0 relative">
                <div className="sticky top-0 z-20 px-6 sm:px-8 py-5 bg-[var(--public-glass-bg)] backdrop-blur-md border-b border-[var(--public-card-border)]">
                  <div className="flex flex-col gap-4">
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--public-text-main)] leading-tight break-words-strategy">
                      {selectedProduct.name}
                    </h2>
                    
                    {selectedProduct.show_highlight && selectedProduct.highlight_text && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs sm:text-sm font-black uppercase tracking-wider shadow-sm w-fit break-words-strategy"
                      >
                        <Tag size={14} className="animate-pulse" />
                        {selectedProduct.highlight_text}
                      </motion.div>
                    )}
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                          selectedProduct.is_in_stock !== false 
                            ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] border-[var(--primary-color)]/20' 
                            : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                        }`}>
                          {selectedProduct.is_in_stock !== false ? 'Disponível' : 'Esgotado'}
                        </span>
                        {selectedProduct.sku && (
                          <span className="px-2 py-1 rounded-lg bg-[var(--public-bg)] border border-[var(--public-card-border)] text-[10px] font-black text-[var(--public-text-main)] uppercase tracking-widest">
                            REF: {selectedProduct.sku}
                          </span>
                        )}
                      </div>

                      {selectedProduct.show_colors && selectedProduct.colors && selectedProduct.colors.length > 0 && (
                        <div className="flex items-center gap-3 bg-[var(--public-bg)] px-3 py-1.5 rounded-xl border border-[var(--public-card-border)]">
                          <span className="text-[9px] font-black text-[var(--public-text-dim)] uppercase tracking-widest">Cores disponíveis</span>
                          <div className="flex items-center gap-1.5">
                            {selectedProduct.colors.map((color, i) => (
                              <div key={i} className="h-4 w-4 rounded-full border border-white/20 shadow-sm transition-transform hover:scale-125" style={{ backgroundColor: color }} title="Cor disponível" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-6 sm:px-10 py-8 pb-12 min-w-0">
                  {selectedProduct.is_in_stock !== false && (
                    <div className="space-y-6 mb-8">
                      <div className="bg-[var(--public-bg)] border border-[var(--public-card-border)] rounded-2xl p-6">
                        <div className="space-y-6">
                          {selectedProduct.has_retail !== false && (
                            <div 
                              onClick={() => setPriceMode("retail")}
                              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                                priceMode === "retail" ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "bg-[var(--public-card-bg)] border-[var(--public-card-border)] opacity-60 hover:opacity-100"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-[var(--public-text-dim)] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                  <Tag size={12} /> Preço de Varejo
                                </p>
                                {priceMode === "retail" && <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center"><Check size={10} className="text-black" /></div>}
                              </div>
                              <div className="flex flex-col gap-1">
                                {selectedProduct.compare_at_price && (
                                  <div className="flex items-center gap-2 text-sm font-bold text-[var(--public-text-dim)]">
                                    <span className="text-[10px] uppercase opacity-60">De</span>
                                    <span className="line-through">{formatPrice(selectedProduct.compare_at_price)}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  {selectedProduct.compare_at_price && <span className="text-[10px] uppercase text-emerald-500/80 font-black">Por</span>}
                                  <p className="text-2xl font-extrabold text-emerald-400">
                                    {formatPrice(selectedProduct.price) || "Consulte"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {selectedProduct.has_wholesale && (
                            <div 
                              onClick={() => setPriceMode("wholesale")}
                              className={`p-4 sm:p-6 rounded-3xl border-2 transition-all duration-300 ${
                                priceMode === "wholesale" ? "bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/10" : "bg-[var(--public-card-bg)] border-[var(--public-card-border)] opacity-60 hover:opacity-100"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                  <Layers size={12} /> Preço de Atacado
                                </p>
                                {priceMode === "wholesale" && <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center"><Check size={10} className="text-black" /></div>}
                              </div>
                              <p className="text-2xl font-extrabold text-emerald-400">
                                {formatPrice(selectedProduct.wholesale_price) || "Consulte"}
                              </p>
                              {selectedProduct.wholesale_min_quantity && (
                                <div className="mt-2">
                                  <span className="inline-block bg-emerald-500 !text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-lg shadow-emerald-500/20 uppercase tracking-wider">
                                    Mínimo de {selectedProduct.wholesale_min_quantity} unidades
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-8">
                    {selectedProduct.description && (
                      <div>
                        <h4 className="flex items-center gap-2 text-[var(--public-text-main)] font-extrabold text-lg mb-4">
                          <Info size={20} className="text-emerald-500" />
                          Descrição do Produto
                        </h4>
                        {(() => {
                          const cleanHTML = (html: string) => {
                            if (!html) return '';
                            return html.replace(/\u00a0/g, ' ').replace(/\u00ad/g, '').replace(/&nbsp;/g, ' ').replace(/&shy;/g, '');
                          };
                          return (
                            <div className="w-full block overflow-hidden">
                              <div 
                                className="text-sm leading-relaxed ql-description-content"
                                style={{ width: '100%', wordBreak: 'normal', overflowWrap: 'break-word', hyphens: 'none', WebkitHyphens: 'none', whiteSpace: 'pre-wrap', boxSizing: 'border-box' }}
                                dangerouslySetInnerHTML={{ __html: hasMounted ? cleanHTML(selectedProduct.description) : selectedProduct.description }}
                              />
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {selectedProduct.show_specs !== false && selectedProduct.specs && selectedProduct.specs.length > 0 && (
                      <div>
                        <h4 className="flex items-center gap-2 text-[var(--public-text-main)] font-extrabold text-lg mb-4">
                          <Package size={20} className="text-emerald-500" />
                          {selectedProduct.specs_title || "Especificações Técnicas"}
                        </h4>
                        <div className="grid gap-2">
                          {selectedProduct.specs.map((spec, i) => (
                            <div key={i} className="flex items-center justify-between bg-[var(--public-bg)] border border-[var(--public-card-border)] rounded-2xl px-4 py-3">
                              <span className="text-sm text-[var(--public-text-dim)] font-bold">{spec.chave}</span>
                              <span className="text-base text-[var(--public-text-main)] font-bold">{spec.valor}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Close Scrollable Body */}
              </div>

              {productWhatsappUrl && (
                  <div className="relative px-6 sm:px-8 py-5 border-t border-[var(--public-card-border)] z-30 public-footer-sticky shrink-0">
                    <div className="absolute inset-x-0 -top-12 h-12 pointer-events-none public-footer-fade" />
                    <div className="relative">
                      {!hideCta && (
                        selectedProduct.is_in_stock !== false ? (
                          businessStatus.isAvailableNow ? (
                            <motion.a
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              href={productWhatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                console.log("🖱️ Clique WhatsApp Produto detectado:", selectedProduct.name);
                                void trackLead(selectedProduct.name);
                                void trackAnalyticsEvent({
                                  profileId,
                                  catalogId,
                                  organizationId: organizationId,
                                  productId: selectedProduct.id,
                                  eventType: "whatsapp_click",
                                  pageType: "product_modal",
                                  metadata: { slug, productName: selectedProduct.name, priceMode }
                                });
                              }}
                              className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-[#25D366] hover:opacity-90 text-white font-black rounded-2xl shadow-xl transition-all text-sm uppercase tracking-wider"
                              style={{ boxShadow: `0 10px 30px #25D36633` }}
                            >
                              <MessageCircle size={20} />
                              Fazer Pedido via WhatsApp
                            </motion.a>
                          ) : (
                            <div 
                              onClick={() => {
                                console.log("🖱️ Clique WhatsApp (FECHADO) Produto detectado:", selectedProduct.name);
                                void trackAnalyticsEvent({
                                  profileId,
                                  catalogId,
                                  productId: selectedProduct.id,
                                  eventType: "whatsapp_click_closed",
                                  pageType: "product_modal",
                                  metadata: { slug, productName: selectedProduct.name, priceMode }
                                });
                              }}
                              className="flex flex-col items-center justify-center gap-1 w-full py-3 px-6 bg-[var(--public-bg)] text-[var(--public-text-dim)] rounded-2xl border border-[var(--public-card-border)] transition-all cursor-pointer hover:bg-[var(--public-card-border)]/20"
                            >
                              <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider">
                                <Clock size={16} />
                                Estabelecimento Fechado
                              </div>
                              <span className="text-[10px] font-medium opacity-70">Clique para registrar interesse mesmo fechado</span>
                            </div>
                          )
                        ) : (
                          <div className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-[var(--public-bg)] text-[var(--public-text-dim)] font-black rounded-2xl border border-[var(--public-card-border)] transition-all text-sm uppercase tracking-wider cursor-not-allowed opacity-60">
                            <Package size={20} />
                            Produto Indisponível
                          </div>
                        )
                      )}

                      <button 
                        onClick={() => {
                          const baseUrl = window.location.href.split('#')[0];
                          handleShare(
                            selectedProduct.name,
                            selectedProduct.description?.replace(/<[^>]*>/g, '').substring(0, 100) || "",
                            `${baseUrl}#${selectedProduct.id}`
                          );
                        }}
                        className="mt-4 flex items-center justify-center gap-2 w-full py-3 px-6 bg-[var(--public-card-bg)] border border-[var(--public-card-border)] text-[var(--public-text-dim)] font-bold rounded-xl hover:bg-[var(--public-bg)] hover:text-[var(--public-text-main)] transition-all text-xs uppercase tracking-widest"
                      >
                        <Share2 size={16} />
                        Compartilhar este Produto
                      </button>
                    </div>
                  </div>
                )}
            </motion.div>
          </div>
        )}
        </AnimatePresence>,
        document.body
      )}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .ql-description-content { line-height: 1.8; font-size: 0.95rem; color: var(--public-text-dim); width: 100% !important; max-width: 100% !important; }
        .ql-description-content *, .break-words-strategy { 
          word-break: normal !important; 
          overflow-wrap: break-word !important; 
          hyphens: auto !important; 
          -webkit-hyphens: auto !important; 
          max-width: 100% !important; 
          box-sizing: border-box !important; 
        }
        .ql-description-content p { margin-bottom: 1.25rem; }
        .ql-description-content b, .ql-description-content strong { font-weight: 900; color: var(--public-text-main); }
        .public-footer-sticky { background-color: var(--public-card-bg) !important; }
        .public-footer-fade { background-image: linear-gradient(to top, var(--public-card-bg), transparent) !important; }
      `}</style>

      {/* Modal de Aviso Empático */}
      {hasMounted && createPortal(
        <AnimatePresence>
          {showWarning && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90"
              onClick={() => setShowWarning(false)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative border border-[var(--public-card-border)] rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl"
                style={{ backgroundColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#18181b' : '#ffffff' }}
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={() => setShowWarning(false)}
                  className="absolute top-4 right-4 text-[var(--public-text-dim)] hover:text-[var(--public-text-main)] p-2 rounded-full bg-[var(--public-status-bg)] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="w-16 h-16 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[var(--public-text-main)] mb-2">
                  Consultor Indisponível
                </h3>
                <p className="text-sm text-[var(--public-text-dim)] mb-8 leading-relaxed">
                  O consultor está temporariamente ausente ou fora do horário. Sua mensagem será entregue, mas o tempo de resposta pode ser maior que o habitual.
                </p>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setShowWarning(false);
                      void trackLead();
                      void trackAnalyticsEvent({
                        profileId,
                        catalogId,
                        eventType: "whatsapp_click_delayed",
                        pageType: "catalog_header",
                        metadata: { slug }
                      });
                      if (whatsappUrl) window.open(whatsappUrl, "_blank");
                    }}
                    className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#25D366] hover:bg-[#128C7E] transition-colors shadow-lg shadow-green-500/20"
                  >
                    Continuar mesmo assim
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
}
