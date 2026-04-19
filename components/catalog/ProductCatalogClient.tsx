"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics";

type Category = {
  id: string;
  name: string;
  sort_order: number | null;
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
  sku: string | null;
  has_wholesale: boolean | null;
  wholesale_price: number | null;
  wholesale_min_quantity: number | null;
  image_url: string | null;
  image_urls?: string[] | null;
  sort_order: number | null;
};

type ProductCatalogClientProps = {
  profileId: string;
  catalogId: string | null;
  slug: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  categories: Category[];
  products: Product[];
  whatsapp: string | null;
};

function formatPrice(price: number | null) {
  if (price === null) return null;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
}

export default function ProductCatalogClient({
  profileId,
  catalogId,
  slug,
  fullName,
  avatarUrl,
  categories,
  products,
  whatsapp,
}: ProductCatalogClientProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("center center");
  const [imageKey, setImageKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const hasTrackedCatalogViewRef = useRef(false);

  const selectedProduct = useMemo(() => {
    return products.find((product) => product.id === selectedProductId) ?? null;
  }, [products, selectedProductId]);

  const selectedProductGallery = useMemo(() => {
    if (!selectedProduct) return [];

    if (selectedProduct.image_urls && selectedProduct.image_urls.length > 0) {
      return selectedProduct.image_urls;
    }

    if (selectedProduct.image_url) {
      return [selectedProduct.image_url];
    }

    return [];
  }, [selectedProduct]);

  const selectedImageUrl =
    selectedProductGallery[selectedImageIndex] ?? selectedProduct?.image_url ?? null;

  const hasMultipleImages = selectedProductGallery.length > 1;

  useEffect(() => {
    if (hasTrackedCatalogViewRef.current) {
      return;
    }

    hasTrackedCatalogViewRef.current = true;

    void trackAnalyticsEvent({
      profileId,
      catalogId,
      eventType: "catalog_view",
      pageType: "catalog",
      metadata: {
        slug,
        path: `/p/${slug}/catalogo`,
      },
    });
  }, [profileId, catalogId, slug]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedProductId(null);
      }
    }

    if (selectedProductId) {
      window.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [selectedProductId]);

  useEffect(() => {
    setSelectedImageIndex(0);
    setIsZoomed(false);
    setZoomOrigin("center center");
    setImageKey((prev) => prev + 1);
  }, [selectedProductId]);

  useEffect(() => {
    setIsZoomed(false);
    setZoomOrigin("center center");
    setImageKey((prev) => prev + 1);
  }, [selectedImageIndex]);

  const whatsappUrl =
    whatsapp && selectedProduct
      ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
          `Olá! Tenho interesse no produto ${selectedProduct.name}${selectedProduct.sku ? ` (Ref: ${selectedProduct.sku})` : ""}.`
        )}`
      : null;

  function handleImageZoomMove(
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setZoomOrigin(`${x}% ${y}%`);
  }

  function goToPreviousImage() {
    if (!hasMultipleImages) return;

    setSelectedImageIndex((currentIndex) => {
      if (currentIndex === 0) {
        return selectedProductGallery.length - 1;
      }

      return currentIndex - 1;
    });
  }

  function goToNextImage() {
    if (!hasMultipleImages) return;

    setSelectedImageIndex((currentIndex) => {
      if (currentIndex === selectedProductGallery.length - 1) {
        return 0;
      }

      return currentIndex + 1;
    });
  }

  function handleOpenProduct(product: Product) {
    setSelectedProductId(product.id);

    void trackAnalyticsEvent({
      profileId,
      catalogId,
      productId: product.id,
      eventType: "product_click",
      pageType: "product",
      metadata: {
        slug,
        path: `/p/${slug}/catalogo`,
        productName: product.name,
      },
    });
  }

  function handleWhatsAppProductClick() {
    if (!selectedProduct) return;

    void trackAnalyticsEvent({
      profileId,
      catalogId,
      productId: selectedProduct.id,
      eventType: "whatsapp_product_click",
      pageType: "product",
      metadata: {
        slug,
        path: `/p/${slug}/catalogo`,
        productName: selectedProduct.name,
      },
    });
  }

  const initials = fullName
    ? fullName.trim().split(/\s+/).filter(Boolean).map((p) => p[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          background: "radial-gradient(ellipse 90% 55% at 50% -5%, rgba(37,211,102,0.08) 0%, #0a0a0a 65%)",
          padding: "0 0 60px",
        }}
      >
        {/* Header de volta */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 30,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            background: "rgba(10,10,10,0.85)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <a
            href={`/p/${slug}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "rgba(255,255,255,0.55)",
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
              transition: "color 0.15s",
            }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Voltar
          </a>

          <div style={{ flex: 1 }} />

          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName ?? ""}
              style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)" }}
            />
          ) : (
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#222", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {initials}
            </div>
          )}

          {fullName && (
            <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.65)" }}>
              {fullName}
            </span>
          )}
        </header>

        {/* Título e Busca */}
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 20px 8px" }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", margin: 0 }}>
            Catálogo
          </h1>
          <p style={{ marginTop: 6, fontSize: 14, color: "rgba(255,255,255,0.35)" }}>
            {products.length} produto{products.length !== 1 ? "s" : ""} disponíve{products.length !== 1 ? "is" : "l"}
          </p>

          <div style={{ marginTop: 24, position: "relative" }}>
            <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16,
                padding: "14px 16px 14px 44px",
                color: "#fff",
                fontSize: 15,
                outline: "none",
                transition: "all 0.2s ease",
                boxSizing: "border-box"
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(37,211,102,0.4)";
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              }}
            />
          </div>
        </div>

        {/* Categorias e produtos */}
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "16px 20px 0" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {categories.map((category) => {
              const categoryProducts = products.filter((p) => 
                p.category_id === category.id &&
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
              );

              if (searchQuery && categoryProducts.length === 0) {
                return null;
              }

              return (
                <section key={category.id}>
                  {/* Título da categoria */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 3, height: 20, borderRadius: 2, background: "linear-gradient(180deg, #25D366, #128C7E)" }} />
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.85)", letterSpacing: "0.01em", margin: 0 }}>
                      {category.name}
                    </h2>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontWeight: 500 }}>
                      {categoryProducts.length}
                    </span>
                  </div>

                  {categoryProducts.length > 0 ? (
                    <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
                      {categoryProducts.map((product) => {
                        const gallery = product.image_urls && product.image_urls.length > 0
                          ? product.image_urls
                          : product.image_url
                            ? [product.image_url]
                            : [];
                        const cover = gallery[0] ?? null;

                        return (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => handleOpenProduct(product)}
                            style={{
                              textAlign: "left",
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              borderRadius: 20,
                              overflow: "hidden",
                              cursor: "pointer",
                              transition: "all 0.25s ease",
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
                              (e.currentTarget as HTMLElement).style.borderColor = "rgba(37,211,102,0.25)";
                              (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                              (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(0,0,0,0.4)";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                              (e.currentTarget as HTMLElement).style.boxShadow = "none";
                            }}
                          >
                            {/* Imagem */}
                            <div style={{ aspectRatio: "4/3", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                              {cover ? (
                                <img src={cover} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                              ) : (
                                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>Sem imagem</span>
                              )}
                            </div>

                            {/* Info */}
                            <div style={{ padding: "14px 16px 16px" }}>
                              <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", lineHeight: 1.35, letterSpacing: "-0.01em", margin: 0 }}>
                                {product.name}
                              </p>
                              {product.description && (
                                <p style={{ marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.38)", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                                  {product.description}
                                </p>
                              )}
                              <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <p style={{ fontSize: 16, fontWeight: 700, color: "#25D366", margin: 0 }}>
                                  {formatPrice(product.price) ?? <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>Sob consulta</span>}
                                </p>
                                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em" }}>
                                  VER →
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>Nenhum produto nesta categoria.</p>
                  )}
                </section>
              );
            })}
            
            {searchQuery && products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <p style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: "0 0 8px" }}>
                  Nenhum produto encontrado
                </p>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: 0 }}>
                  Tente buscar com outras palavras.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer style={{ marginTop: 56, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#25D366", opacity: 0.4, display: "block" }} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", letterSpacing: "0.05em" }}>
            anotameucontato.com.br
          </span>
        </footer>
      </div>

      {/* Modal produto */}
      {selectedProduct ? (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", animation: "fadeIn 180ms ease-out" }}
          onClick={() => setSelectedProductId(null)}
        >
          <div
            style={{ position: "relative", width: "100%", maxWidth: 860, maxHeight: "90vh", overflowY: "auto", borderRadius: 24, background: "#111", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 40px 80px rgba(0,0,0,0.8)", animation: "modalIn 220ms ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedProductId(null)}
              style={{ position: "absolute", right: 14, top: 14, zIndex: 10, width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              aria-label="Fechar"
            >
              ×
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }} className="modal-grid">
              {/* Galeria */}
              <div style={{ background: "#ffffff", padding: 20, borderRadius: "24px 0 0 24px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div
                  style={{ borderRadius: 16, overflow: "hidden", background: "#ffffff", position: "relative", aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center" }}
                  onMouseMove={handleImageZoomMove}
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={() => { setIsZoomed(false); setZoomOrigin("center center"); }}
                >
                  {selectedImageUrl ? (
                    <img
                      key={imageKey}
                      src={selectedImageUrl}
                      alt={selectedProduct.name}
                      style={{ width: "100%", height: "100%", objectFit: "contain", transform: isZoomed ? "scale(1.8)" : "scale(1)", transformOrigin: zoomOrigin, cursor: isZoomed ? "zoom-out" : "zoom-in", transition: "transform 0.3s ease", animation: "fadeIn 220ms ease-out" }}
                    />
                  ) : (
                    <span style={{ fontSize: 13, color: "rgba(0,0,0,0.3)" }}>Sem imagem</span>
                  )}

                  {hasMultipleImages && !isZoomed && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); goToPreviousImage(); }}
                        style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(10,10,10,0.5)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(10,10,10,0.8)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(10,10,10,0.5)")}
                        aria-label="Anterior"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); goToNextImage(); }}
                        style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(10,10,10,0.5)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(10,10,10,0.8)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(10,10,10,0.5)")}
                        aria-label="Próxima"
                      >
                        →
                      </button>
                    </>
                  )}
                </div>

                {selectedProductGallery.length > 1 && (
                  <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                    {selectedProductGallery.map((url, i) => (
                      <button
                        key={`${url}-${i}`}
                        type="button"
                        onClick={() => setSelectedImageIndex(i)}
                        style={{ aspectRatio: "1", borderRadius: 10, overflow: "hidden", border: i === selectedImageIndex ? "2px solid #25D366" : "2px solid rgba(0,0,0,0.1)", cursor: "pointer", background: "#ffffff" }}
                        aria-label={`Imagem ${i + 1}`}
                      >
                        <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: "28px 24px" }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", margin: 0 }}>Produto</p>
                <h3 style={{ marginTop: 8, fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                  {selectedProduct.name}
                </h3>
                {selectedProduct.sku && (
                  <p style={{ marginTop: 4, fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
                    Ref: {selectedProduct.sku}
                  </p>
                )}

                <div style={{ marginTop: 20 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", margin: 0 }}>Preço</p>
                  
                  {selectedProduct.has_wholesale ? (
                    <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                      <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", margin: 0 }}>
                        Varejo: <span style={{ fontWeight: 600 }}>{formatPrice(selectedProduct.price) ?? "Sob consulta"}</span>
                      </p>
                      <p style={{ fontSize: 24, fontWeight: 700, color: "#25D366", margin: 0 }}>
                        Atacado: {formatPrice(selectedProduct.wholesale_price) ?? "Sob consulta"}
                        {selectedProduct.wholesale_min_quantity && (
                          <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.5)", marginLeft: 8 }}>
                            a partir de {selectedProduct.wholesale_min_quantity} unid.
                          </span>
                        )}
                      </p>
                    </div>
                  ) : (
                    <p style={{ marginTop: 6, fontSize: 26, fontWeight: 700, color: "#25D366", margin: "6px 0 0" }}>
                      {formatPrice(selectedProduct.price) ?? <span style={{ fontSize: 16, color: "rgba(255,255,255,0.3)" }}>Sob consulta</span>}
                    </p>
                  )}
                </div>

                {selectedProduct.description && (
                  <div style={{ marginTop: 20 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", margin: 0 }}>Descrição</p>
                    <p style={{ marginTop: 8, fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
                      {selectedProduct.description}
                    </p>
                  </div>
                )}

                {selectedProduct.specs && selectedProduct.specs.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", margin: "0 0 10px" }}>Especificações</p>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                      {selectedProduct.specs.map((spec, i) => (
                        <li key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", fontSize: 13 }}>
                          <span style={{ color: "rgba(255,255,255,0.4)" }}>{spec.chave}</span>
                          <span style={{ fontWeight: 600, color: "#fff" }}>{spec.valor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={handleWhatsAppProductClick}
                    style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "14px 20px", borderRadius: 14, background: "#25D366", color: "#000", fontSize: 14, fontWeight: 700, textDecoration: "none", letterSpacing: "-0.01em", boxSizing: "border-box" }}
                  >
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.117 1.52 5.845L.057 23.857a.5.5 0 0 0 .61.61l6.012-1.463A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.854 0-3.6-.5-5.1-1.376l-.365-.217-3.785.921.94-3.785-.237-.38A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                    </svg>
                    Falar sobre este produto
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalIn { from { opacity: 0; transform: translateY(8px) scale(0.985) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @media (max-width: 640px) { .modal-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}
