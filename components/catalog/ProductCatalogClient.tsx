"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  MessageCircle, 
  ArrowRight,
  Info,
  Maximize2,
  Package
} from "lucide-react";

// WhatsApp Icon Component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.117 1.52 5.845L.057 23.857a.5.5 0 0 0 .61.61l6.012-1.463A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.854 0-3.6-.5-5.1-1.376l-.365-.217-3.785.921.94-3.785-.237-.38A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
  </svg>
);


type Category = {
  id: string;
  name: string;
  description: string | null;
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
  catalogName?: string | null;
  catalogDescription?: string | null;
  categories: Category[];
  products: Product[];
  whatsapp: string | null;
};

const formatPrice = (price: number | null) => {
  if (price === null) return null;
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
}: ProductCatalogClientProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("center center");
  const [searchQuery, setSearchQuery] = useState("");
  const hasTrackedCatalogViewRef = useRef(false);

  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) ?? null;
  }, [products, selectedProductId]);

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
      eventType: "catalog_view",
      pageType: "catalog",
      metadata: { slug, path: `/p/${slug}/catalogo` },
    });
  }, [profileId, catalogId, slug]);

  useEffect(() => {
    if (selectedProductId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [selectedProductId]);

  useEffect(() => {
    setSelectedImageIndex(0);
    setIsZoomed(false);
  }, [selectedProductId]);

  const whatsappUrl = useMemo(() => {
    if (!whatsapp || !selectedProduct) return null;
    const cleanNumber = whatsapp.replace(/\D/g, "");
    const message = `Olá! Tenho interesse no produto ${selectedProduct.name}${selectedProduct.sku ? ` (Ref: ${selectedProduct.sku})` : ""}.`;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  }, [whatsapp, selectedProduct]);

  const handleImageZoomMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  };

  const handleOpenProduct = (product: Product) => {
    setSelectedProductId(product.id);
    void trackAnalyticsEvent({
      profileId,
      catalogId,
      productId: product.id,
      eventType: "product_click",
      pageType: "product",
      metadata: { slug, path: `/p/${slug}/catalogo`, productName: product.name },
    });
  };

  const filteredCategories = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      products: products.filter(p => 
        p.category_id === cat.id && 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(cat => cat.products.length > 0);
  }, [categories, products, searchQuery]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 pb-20 selection:bg-emerald-500/30">
      {/* Dynamic Background Effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Premium Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 glass-dark border-b border-white/5 px-6 py-4 backdrop-blur-xl"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href={`/p/${slug}`} className="flex items-center gap-2 group text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Voltar</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white leading-none">{fullName}</p>
              <p className="text-[10px] text-emerald-500 font-medium uppercase tracking-widest mt-1">Catálogo Digital</p>
            </div>
            {avatarUrl ? (
              <img src={avatarUrl} alt={fullName ?? ""} className="h-9 w-9 rounded-full object-cover border border-white/10" />
            ) : (
              <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 border border-white/5">
                {fullName?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </motion.header>

      <main className="max-w-5xl mx-auto px-6 pt-12">
        {/* Intro Section */}
        <section className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4"
          >
            {catalogName || "Catálogo"}
          </motion.h1>
          {catalogDescription && (
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 text-lg max-w-2xl leading-relaxed"
            >
              {catalogDescription}
            </motion.p>
          )}
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 relative max-w-xl"
          >
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="O que você está procurando?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white/10 transition-all"
            />
          </motion.div>
        </section>

        {/* Categories & Products */}
        <div className="space-y-16">
          <LayoutGroup>
            {filteredCategories.map((category, idx) => (
              <motion.section 
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="flex items-end gap-4 mb-8">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <span className="w-2 h-8 bg-emerald-500 rounded-full" />
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className="text-slate-500 text-sm mt-2 ml-5">{category.description}</p>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-widest bg-slate-900 px-3 py-1.5 rounded-lg border border-white/5">
                    {category.products.length} itens
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.products.map((product) => (
                    <motion.div
                      layout
                      key={product.id}
                      onClick={() => handleOpenProduct(product)}
                      whileHover={{ y: -8 }}
                      className="group relative bg-white/[0.03] border border-white/5 rounded-3xl overflow-hidden cursor-pointer hover:bg-white/[0.06] hover:border-emerald-500/30 transition-all duration-300"
                    >
                      <div className="aspect-[4/3] relative overflow-hidden bg-slate-900 flex items-center justify-center p-4">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name} 
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <Package size={48} className="text-slate-800" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60" />
                        
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/10">
                            <Maximize2 size={18} className="text-white" />
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{product.name}</h3>
                        {product.description && (
                          <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-auto">
                          <p className="text-xl font-black text-emerald-400">
                            {formatPrice(product.price) || <span className="text-xs text-slate-600 uppercase">Consultar</span>}
                          </p>
                          <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                            <ArrowRight size={18} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            ))}
          </LayoutGroup>

          {filteredCategories.length === 0 && searchQuery && (
            <div className="py-20 text-center">
              <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                <Search size={32} className="text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Nenhum produto encontrado</h3>
              <p className="text-slate-500">Tente buscar por termos diferentes ou confira outras categorias.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-32 pb-20 text-center">
        <div className="flex items-center justify-center gap-3 text-slate-600 text-xs font-bold uppercase tracking-[0.2em]">
          <span className="w-8 h-px bg-slate-800" />
          PlataformaCard
          <span className="w-8 h-px bg-slate-800" />
        </div>
      </footer>

      {/* Premium Product Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProductId(null)}
              className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedProductId(null)}
                className="absolute top-6 right-6 z-10 h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:scale-110 active:scale-95 transition-all"
              >
                <X size={24} />
              </button>

              {/* Gallery Section */}
              <div className="w-full md:w-1/2 bg-white flex flex-col relative">
                <div 
                  className="flex-1 relative overflow-hidden flex items-center justify-center p-8 min-h-[300px] md:min-h-[500px]"
                  onMouseMove={handleImageZoomMove}
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={() => setIsZoomed(false)}
                >
                  {selectedImageUrl ? (
                    <motion.img 
                      key={selectedImageUrl}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      src={selectedImageUrl} 
                      alt={selectedProduct.name}
                      style={{ 
                        transformOrigin: zoomOrigin,
                        transform: isZoomed ? "scale(2)" : "scale(1)"
                      }}
                      className="w-full h-full object-contain transition-transform duration-300 ease-out cursor-zoom-in"
                    />
                  ) : (
                    <Package size={100} className="text-slate-200" />
                  )}

                  {hasMultipleImages && (
                    <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(prev => prev === 0 ? selectedProductGallery.length - 1 : prev - 1); }}
                        className="pointer-events-auto h-12 w-12 rounded-full bg-white/80 border border-black/5 shadow-lg flex items-center justify-center text-slate-900 hover:scale-110 transition-transform"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(prev => prev === selectedProductGallery.length - 1 ? 0 : prev + 1); }}
                        className="pointer-events-auto h-12 w-12 rounded-full bg-white/80 border border-black/5 shadow-lg flex items-center justify-center text-slate-900 hover:scale-110 transition-transform"
                      >
                        <ChevronRight size={24} />
                      </button>
                    </div>
                  )}
                </div>

                {hasMultipleImages && (
                  <div className="p-6 border-t border-slate-100 flex gap-3 overflow-x-auto no-scrollbar justify-center">
                    {selectedProductGallery.map((url, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`h-16 w-16 rounded-xl border-2 flex-shrink-0 transition-all overflow-hidden ${
                          selectedImageIndex === idx ? "border-emerald-500 scale-105" : "border-slate-100 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details Section */}
              <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/20">
                    Disponível
                  </span>
                  {selectedProduct.sku && (
                    <span className="text-slate-500 text-[10px] font-mono tracking-tighter">REF: {selectedProduct.sku}</span>
                  )}
                </div>

                <h2 className="text-3xl font-black text-white leading-tight mb-4">
                  {selectedProduct.name}
                </h2>

                <div className="space-y-6 mb-8">
                  <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                    {selectedProduct.has_wholesale ? (
                      <div className="space-y-4">
                        <div>
                          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Preço Varejo</p>
                          <p className="text-xl font-bold text-slate-300">{formatPrice(selectedProduct.price) || "Consulte"}</p>
                        </div>
                        <div className="h-px bg-white/5" />
                        <div>
                          <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest mb-1">Preço Atacado</p>
                          <p className="text-3xl font-black text-emerald-400">
                            {formatPrice(selectedProduct.wholesale_price) || "Consulte"}
                          </p>
                          {selectedProduct.wholesale_min_quantity && (
                            <p className="text-slate-500 text-xs mt-1 font-medium italic">
                              Mínimo de {selectedProduct.wholesale_min_quantity} unidades
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Preço Único</p>
                        <p className="text-4xl font-black text-emerald-400">
                          {formatPrice(selectedProduct.price) || "Consulte"}
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedProduct.description && (
                    <div>
                      <h4 className="flex items-center gap-2 text-white font-bold text-sm mb-3">
                        <Info size={16} className="text-emerald-500" />
                        Descrição do Produto
                      </h4>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {selectedProduct.description}
                      </p>
                    </div>
                  )}

                  {selectedProduct.specs && selectedProduct.specs.length > 0 && (
                    <div>
                      <h4 className="flex items-center gap-2 text-white font-bold text-sm mb-3">
                        <Package size={16} className="text-emerald-500" />
                        Especificações Técnicas
                      </h4>
                      <div className="grid gap-2">
                        {selectedProduct.specs.map((spec, i) => (
                          <div key={i} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
                            <span className="text-xs text-slate-500 font-medium">{spec.chave}</span>
                            <span className="text-xs text-white font-bold">{spec.valor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {whatsappUrl && (
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-3 w-full bg-emerald-500 text-black font-black text-sm py-5 rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"
                  >
                    <WhatsAppIcon className="w-5 h-5" />
                    FAZER PEDIDO VIA WHATSAPP
                  </motion.a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}

