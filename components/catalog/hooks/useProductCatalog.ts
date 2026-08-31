import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { getBusinessStatus } from "@/lib/utils/time";
import { formatWhatsAppMessage } from "@/lib/utils/whatsapp-utils";
import { ProductCatalogClientProps, Product } from "../types";
import { sanitizeText, formatPrice } from "../utils";
import { trackLeadAction } from "@/app/actions/leads";
import { smartSearchMatch } from "@/lib/utils/smart-search";
import { useCatalogBanners } from "./useCatalogBanners";
import { useCatalogEmbedResize } from "./useCatalogEmbedResize";

export function useProductCatalog(props: ProductCatalogClientProps) {
  const {
    profileId,
    catalogId,
    slug,
    fullName,
    categories,
    products,
    whatsapp,
    isEmbed,
    businessHours,
    customBusinessHours,
    canCustomizeHours,
    isAvailable,
    recessEndsAt,
    isAcceptingOrders,
    isB2B,
    banners,
    showBanners,
    outOfStockAtEnd,
    organizationId,
    whatsappTemplate,
    sellerStatus,
    nationalHolidays,
  } = props;

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [modalY, setModalY] = useState<number>(0);
  const [expandedDescriptionId, setExpandedDescriptionId] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [priceMode, setPriceMode] = useState<"retail" | "wholesale">("retail");
  const [showWarning, setShowWarning] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("center center");
  const [searchQuery, setSearchQuery] = useState("");
  const hasTrackedCatalogViewRef = useRef(false);
  const [lastViewTimestamp, setLastViewTimestamp] = useState<number | null>(null);

  // Sub-Hooks Desacoplados
  const { localBanners, localShowBanners } = useCatalogBanners({
    catalogId,
    banners,
    showBanners,
  });

  const { hasMounted, isMobile } = useCatalogEmbedResize({ isEmbed });

  const highlightProducts = useMemo(() => {
    return products.filter((p) => p.is_active !== false && p.show_highlight && p.image_url);
  }, [products]);

  const businessStatus = useMemo(() => {
    // 1. Prioridade Master: Override Manual da Empresa (Forçar Aberto / Forçar Fechado)
    if (businessHours?.manual_override === "open") {
      return { isAvailableNow: true, statusMessage: "Aberto agora" };
    }
    if (businessHours?.manual_override === "closed") {
      return { isAvailableNow: false, statusMessage: "Fechado temporariamente" };
    }

    const hasCustomSchedule =
      customBusinessHours &&
      customBusinessHours.schedule &&
      Object.keys(customBusinessHours.schedule).length > 0;

    const activeHours =
      canCustomizeHours && hasCustomSchedule ? customBusinessHours : businessHours;

    const status = getBusinessStatus((activeHours ?? null) as any, nationalHolidays);
    const isRecessActive = recessEndsAt && new Date(recessEndsAt) > new Date();
    const isAvailableNow =
      isRecessActive || isAvailable === false || isAcceptingOrders === false
        ? false
        : status.isOpenNow;

    const statusMessage =
      isRecessActive || isAcceptingOrders === false
        ? "Em Recesso"
        : isAvailable === false
        ? "Indisponível"
        : status.message;
    return { isAvailableNow, statusMessage };
  }, [
    businessHours,
    customBusinessHours,
    canCustomizeHours,
    isAvailable,
    recessEndsAt,
    nationalHolidays,
    isAcceptingOrders,
  ]);

  const whatsappUrl = useMemo(() => {
    if (!whatsapp) return null;
    const clean = whatsapp.replace(/\D/g, "");
    const message = `Olá! Gostaria de mais informações sobre seus produtos.\n\nIdentificador: ${slug}`;
    return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
  }, [whatsapp, slug]);

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

    const category = categories.find((c) => c.id === product.category_id);

    return {
      ...product,
      name: sanitizeText(product.name),
      category_name: category?.name || null,
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
    if (selectedProduct.image_urls && selectedProduct.image_urls.length > 0)
      return selectedProduct.image_urls;
    if (selectedProduct.image_url) return [selectedProduct.image_url];
    return [];
  }, [selectedProduct]);

  const selectedImageUrl =
    selectedProductGallery[selectedImageIndex] ?? selectedProduct?.image_url ?? null;
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

  // TRAVA DE SEGURANÇA - BLOQUEIO DE SCROLL
  useEffect(() => {
    const shouldLock = selectedProductId && (!isEmbed || !isMobile);
    if (shouldLock) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedProductId, isEmbed, isMobile]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash && hash.length > 1) {
        const possibleId = hash.substring(1);
        if (products.some((p) => p.id === possibleId)) {
          setSelectedProductId(possibleId);
        } else if (possibleId.startsWith("categoria-")) {
          setSelectedProductId(null);
          setTimeout(() => {
            const element = document.getElementById(possibleId);
            if (element) {
              element.scrollIntoView({ behavior: "smooth" });
            }
          }, 300);
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
      if (isB2B && selectedProduct.has_wholesale) {
        setPriceMode("wholesale");
      } else if (selectedProduct.has_retail !== false) {
        setPriceMode("retail");
      } else if (selectedProduct.has_wholesale) {
        setPriceMode("wholesale");
      }
    }
  }, [selectedProductId, selectedProduct, isB2B]);

  const productWhatsappUrl = useMemo(() => {
    if (!whatsapp || !selectedProduct) return null;
    const cleanNumber = whatsapp.replace(/\D/g, "");

    const priceText =
      priceMode === "wholesale"
        ? selectedProduct.wholesale_price
          ? formatPrice(selectedProduct.wholesale_price)
          : ""
        : selectedProduct.price
        ? formatPrice(selectedProduct.price)
        : "";

    const message = formatWhatsAppMessage(whatsappTemplate, {
      item_name: selectedProduct.name,
      item_price: priceText || "",
      item_sku: selectedProduct.sku || undefined,
      item_url:
        typeof window !== "undefined"
          ? `${window.location.origin}/${slug}/catalogo#${selectedProduct.id}`
          : "",
      item_type: selectedProduct.type === "service" ? "serviço" : "produto",
      item_category: selectedProduct.category_name || undefined,
      seller_name: fullName || "Vendedor",
    });

    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  }, [whatsapp, selectedProduct, priceMode, slug, whatsappTemplate, fullName]);

  const trackLead = useCallback(
    async (productName?: string) => {
      console.log("📍 trackLead iniciado para:", productName);
      const result = await trackLeadAction({
        organizationId,
        profileId,
        productName: productName || "Interesse Geral (Botão Topo)",
        sellerName: fullName || "Vendedor",
      });
      if (!result.success) console.error("❌ Lead Tracking Error:", result.error);
      else console.log("✅ Lead Tracking Sucesso!");
    },
    [organizationId, profileId, fullName]
  );

  const handleImageZoomMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  };

  const handleOpenProduct = useCallback(
    (product: Product, event?: React.MouseEvent) => {
      if (sellerStatus === "paused" || isAcceptingOrders === false) {
        return; // Bloqueia abertura do modal se o vendedor estiver pausado
      }
      console.log("📦 Abrindo produto:", product.name);
      setSelectedProductId(product.id);
      window.location.hash = product.id;

      if (event) {
        setModalY(event.pageY);
      } else {
        const el = document.getElementById(product.id);
        setModalY(el ? el.offsetTop + el.offsetHeight / 2 : 0);
      }

      // TRAVA DE SEGURANÇA - SCROLL MOBILE IFRAME
      if (isEmbed && isMobile) {
        setTimeout(() => {
          const el = document.getElementById(product.id);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
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
    },
    [sellerStatus, isAcceptingOrders, isEmbed, isMobile, profileId, catalogId, organizationId, slug]
  );

  const isSharingRef = useRef(false);

  const handleShare = useCallback(async (title: string, text: string, url: string) => {
    if (isSharingRef.current) return;

    if (typeof navigator !== "undefined" && navigator.share) {
      isSharingRef.current = true;
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        if (
          (err as Error).name !== "AbortError" &&
          (err as Error).name !== "InvalidStateError"
        ) {
          console.error("Erro ao compartilhar:", err);
        }
      } finally {
        isSharingRef.current = false;
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert("Link copiado!");
      } catch (err) {
        console.error("Erro ao copiar link:", err);
      }
    }
  }, []);

  const filteredCategories = useMemo(() => {
    const categorized = categories
      .map((cat) => {
        const filteredAndMapped = products
          .filter(
            (p) =>
              p.category_id === cat.id &&
              p.is_active !== false &&
              smartSearchMatch(p, searchQuery)
          )
          .map((p) => ({ ...p, name: sanitizeText(p.name) }));

        if (outOfStockAtEnd) {
          filteredAndMapped.sort((a, b) => {
            const aInStock = a.is_in_stock !== false ? 1 : 0;
            const bInStock = b.is_in_stock !== false ? 1 : 0;
            if (aInStock === bInStock) return (a.sort_order || 0) - (b.sort_order || 0);
            return bInStock - aInStock;
          });
        }

        return {
          ...cat,
          products: filteredAndMapped,
        };
      })
      .filter((cat) => cat.products.length > 0);

    const uncategorized = products
      .filter(
        (p) =>
          (!p.category_id || !categories.some((c) => c.id === p.category_id)) &&
          p.is_active !== false &&
          smartSearchMatch(p, searchQuery)
      )
      .map((p) => ({ ...p, name: sanitizeText(p.name) }));

    if (outOfStockAtEnd && uncategorized.length > 0) {
      uncategorized.sort((a, b) => {
        const aInStock = a.is_in_stock !== false ? 1 : 0;
        const bInStock = b.is_in_stock !== false ? 1 : 0;
        if (aInStock === bInStock) return (a.sort_order || 0) - (b.sort_order || 0);
        return bInStock - aInStock;
      });
    }

    if (uncategorized.length > 0) {
      categorized.push({
        id: "uncategorized",
        catalog_id: catalogId || "",
        name: "Outros itens",
        description: "Produtos sem categoria definida",
        products: uncategorized,
      } as any);
    }

    return categorized;
  }, [categories, products, searchQuery, catalogId, outOfStockAtEnd]);

  const handleCloseProduct = useCallback(() => {
    setSelectedProductId(null);
    setExpandedDescriptionId(null);
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }, []);

  return {
    state: {
      selectedProductId,
      modalY,
      expandedDescriptionId,
      hasMounted,
      selectedImageIndex,
      priceMode,
      showWarning,
      isMobile,
      localBanners,
      localShowBanners,
      isZoomed,
      zoomOrigin,
      searchQuery,
      lastViewTimestamp,
    },
    computed: {
      highlightProducts,
      businessStatus,
      whatsappUrl,
      selectedProduct,
      selectedProductGallery,
      selectedImageUrl,
      hasMultipleImages,
      productWhatsappUrl,
      filteredCategories,
    },
    actions: {
      setSelectedProductId,
      setModalY,
      setExpandedDescriptionId,
      setSelectedImageIndex,
      setPriceMode,
      setShowWarning,
      setIsZoomed,
      setZoomOrigin,
      setSearchQuery,
      handleImageZoomMove,
      handleOpenProduct,
      handleCloseProduct,
      handleShare,
      trackLead,
    },
  };
}
