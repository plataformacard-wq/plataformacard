"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag } from "lucide-react";

interface Spec {
  chave: string;
  valor: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  compare_at_price: number | null;
  image_url: string | null;
  image_urls: string[] | null;
  is_in_stock: boolean | null;
  has_retail: boolean | null;
  has_wholesale: boolean | null;
  wholesale_price: number | null;
  wholesale_min_quantity: number | null;
}

interface ProductCardProps {
  product: Product;
  primaryColor: string;
  onClick: () => void;
}

export function ProductCard({ product, primaryColor, onClick }: ProductCardProps) {
  const isOutOfStock = product.is_in_stock === false;
  const imageUrl = product.image_urls?.[0] || product.image_url || "/placeholder-product.png";

  return (
    <motion.div
      whileHover={{ y: -8 }}
      onClick={onClick}
      className="group relative flex flex-col h-full rounded-[2.5rem] p-4 transition-all duration-500 cursor-pointer overflow-hidden"
      style={{ 
        background: "var(--public-card-bg)", 
        border: "1px solid var(--public-card-border)",
        boxShadow: "var(--public-card-shadow)"
      }}
    >
      {/* Product Image */}
      <div className="relative aspect-square mb-6 rounded-[2rem] overflow-hidden bg-slate-50 dark:bg-slate-900/50">
        <img
          src={imageUrl}
          alt={product.name}
          className={`w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isOutOfStock && (
            <span className="bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
              Esgotado
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col px-2 pb-2 space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-black leading-tight line-clamp-2 uppercase tracking-tight" style={{ color: "var(--public-text-main)" }}>
            {product.name.replace(/\s*-\s*EDITADO\s*/gi, "").trim()}
          </h3>
          {product.description && (
            <p className="text-xs line-clamp-2" style={{ color: "var(--public-text-dim)" }}>
              {product.description}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 mt-auto">
          {/* Price Logic */}
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              {product.has_wholesale && product.wholesale_price && (
                <span className="text-[9px] font-black uppercase text-emerald-500 tracking-wider mb-0.5">A partir de (Atacado)</span>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black" style={{ color: primaryColor }}>
                  {(product.wholesale_price || product.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                {product.compare_at_price && (
                  <span className="text-xs line-through opacity-40 font-bold">
                    {product.compare_at_price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                )}
              </div>
            </div>
            
            <motion.div
              whileHover={{ x: 5 }}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300"
            >
              <ArrowRight size={18} />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
