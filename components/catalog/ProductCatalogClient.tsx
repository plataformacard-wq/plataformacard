"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics";

type Category = {
  id: string;
  name: string;
  sort_order: number | null;
};

type Product = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  sort_order: number | null;
};

type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number | null;
};

type ProductCatalogClientProps = {
  profileId: string;
  catalogId: string | null;
  slug: string;
  categories: Category[];
  products: Product[];
  productImages: ProductImage[];
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
  categories,
  products,
  productImages = [],
  whatsapp,
}: ProductCatalogClientProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("center center");
  const [imageKey, setImageKey] = useState(0);
  const hasTrackedCatalogViewRef = useRef(false);

  const selectedProduct = useMemo(() => {
    return products.find((product) => product.id === selectedProductId) ?? null;
  }, [products, selectedProductId]);

  const selectedProductGallery = useMemo(() => {
    if (!selectedProduct) return [];

    const galleryFromTable = productImages
      .filter((image) => image.product_id === selectedProduct.id)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((image) => image.image_url)
      .filter(Boolean)
      .slice(0, 10);

    if (galleryFromTable.length > 0) {
      return galleryFromTable;
    }

    if (selectedProduct.image_url) {
      return [selectedProduct.image_url];
    }

    return [];
  }, [productImages, selectedProduct]);

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
          `Olá! Tenho interesse no produto ${selectedProduct.name}.`
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

  return (
    <>
      <div className="space-y-6">
        {categories.map((category) => {
          const categoryProducts = products.filter(
            (product) => product.category_id === category.id
          );

          return (
            <section
              key={category.id}
              className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold text-neutral-900">
                  {category.name}
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Produtos disponíveis nesta categoria.
                </p>
              </div>

              {categoryProducts.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryProducts.map((product) => {
                    const productGallery = productImages
                      .filter((image) => image.product_id === product.id)
                      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                      .map((image) => image.image_url)
                      .filter(Boolean)
                      .slice(0, 10);

                    const coverImageUrl = productGallery[0] ?? product.image_url ?? null;

                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleOpenProduct(product)}
                        className="group overflow-hidden rounded-[28px] border border-neutral-200/80 bg-white text-left shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-neutral-300 hover:shadow-[0_18px_40px_rgba(0,0,0,0.10)]"
                      >
                        <div className="relative overflow-hidden bg-neutral-100">
                          <div className="absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-black/10 to-transparent" />

                          <div className="aspect-[4/3] w-full overflow-hidden">
                            {coverImageUrl ? (
                              <img
                                src={coverImageUrl}
                                alt={product.name}
                                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
                                Sem imagem
                              </div>
                            )}
                          </div>

                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/10 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
                        </div>

                        <div className="space-y-5 p-5">
                          <div className="space-y-2">
                            <h4 className="line-clamp-2 text-[1.35rem] font-bold leading-7 tracking-[-0.02em] text-neutral-950">
                              {product.name}
                            </h4>

                            {product.description ? (
                              <p className="line-clamp-3 text-sm leading-6 text-neutral-600">
                                {product.description}
                              </p>
                            ) : (
                              <p className="text-sm text-neutral-400">
                                Sem descrição disponível.
                              </p>
                            )}
                          </div>

                          <div className="flex items-end justify-between gap-4">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                                Preço
                              </p>
                              <p className="mt-1 text-3xl font-bold leading-none tracking-[-0.03em] text-neutral-950">
                                {formatPrice(product.price) ?? "Sob consulta"}
                              </p>
                            </div>

                            <div className="inline-flex shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 group-hover:border-neutral-950 group-hover:bg-neutral-900 group-hover:shadow-lg">
                              Ver produto
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-neutral-500">
                  Nenhum produto nesta categoria.
                </p>
              )}
            </section>
          );
        })}
      </div>

      {selectedProduct ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 animate-[fadeIn_180ms_ease-out]"
          onClick={() => setSelectedProductId(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl animate-[modalIn_220ms_ease-out]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedProductId(null)}
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-neutral-700 shadow hover:bg-white"
              aria-label="Fechar popup"
            >
              ×
            </button>

            <div className="grid md:grid-cols-2">
              <div className="bg-neutral-200 p-5 md:p-6">
                <div className="relative">
                  <div
                    className="overflow-hidden rounded-2xl bg-white"
                    onMouseMove={handleImageZoomMove}
                    onMouseEnter={() => setIsZoomed(true)}
                    onMouseLeave={() => {
                      setIsZoomed(false);
                      setZoomOrigin("center center");
                    }}
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                      {selectedImageUrl ? (
                        <img
                          key={imageKey}
                          src={selectedImageUrl}
                          alt={selectedProduct.name}
                          className="h-full w-full animate-[fadeIn_220ms_ease-out] object-cover transition-transform duration-300 ease-out"
                          style={{
                            transform: isZoomed ? "scale(1.8)" : "scale(1)",
                            transformOrigin: zoomOrigin,
                            cursor: isZoomed ? "zoom-out" : "zoom-in",
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
                          Sem imagem
                        </div>
                      )}
                    </div>
                  </div>

                  {hasMultipleImages ? (
                    <>
                      <button
                        type="button"
                        onClick={goToPreviousImage}
                        className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-bold text-neutral-700 shadow-md transition hover:bg-white hover:text-black"
                        aria-label="Imagem anterior"
                      >
                        ←
                      </button>

                      <button
                        type="button"
                        onClick={goToNextImage}
                        className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-bold text-neutral-700 shadow-md transition hover:bg-white hover:text-black"
                        aria-label="Próxima imagem"
                      >
                        →
                      </button>
                    </>
                  ) : null}
                </div>

                {selectedProductGallery.length > 1 ? (
                  <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                    {selectedProductGallery.map((imageUrl, index) => {
                      const isActive = index === selectedImageIndex;

                      return (
                        <button
                          key={`${imageUrl}-${index}`}
                          type="button"
                          onClick={() => setSelectedImageIndex(index)}
                          className={`overflow-hidden rounded-xl border bg-white transition-all duration-300 ${
                            isActive
                              ? "scale-[1.02] border-neutral-900 ring-2 ring-neutral-900/10"
                              : "border-neutral-200 hover:scale-[1.02] hover:border-neutral-400"
                          }`}
                          aria-label={`Selecionar imagem ${index + 1}`}
                        >
                          <div className="aspect-square w-full overflow-hidden bg-neutral-100">
                            <img
                              src={imageUrl}
                              alt={`${selectedProduct.name} - imagem ${index + 1}`}
                              className="h-full w-full object-cover transition-transform duration-300 ease-out hover:scale-[1.04]"
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <div className="p-6 md:p-8">
                <p className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
                  Produto
                </p>

                <h3 className="mt-2 text-2xl font-bold text-neutral-900">
                  {selectedProduct.name}
                </h3>

                <div className="mt-5">
                  <p className="text-sm font-medium uppercase tracking-wide text-neutral-400">
                    Preço
                  </p>
                  <p className="mt-1 text-2xl font-bold text-neutral-900">
                    {formatPrice(selectedProduct.price) ?? "Sob consulta"}
                  </p>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-medium uppercase tracking-wide text-neutral-400">
                    Descrição
                  </p>
                  <div className="mt-2 text-sm leading-6 text-neutral-600">
                    {selectedProduct.description || "Sem descrição disponível."}
                  </div>
                </div>

                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={handleWhatsAppProductClick}
                    className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-green-700 hover:shadow-lg"
                  >
                    Falar sobre este produto no WhatsApp
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
}