"use client";

import { useState } from "react";
import { ChevronRight, MessageCircle, Share2, Eye } from "lucide-react";
import Link from "next/link";

interface ProductItem {
  id: string;
  name: string;
  price: number | string;
  image_url?: string | null;
  stock_quantity?: number;
  is_active?: boolean;
}

const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    id: "1",
    name: "Fone de Ouvido Noise Cancelling",
    price: 749.00,
    image_url: "/hero_mockup.png",
    stock_quantity: 50,
    is_active: true,
  },
  {
    id: "2",
    name: "Smartwatch Series 7",
    price: 749.00,
    image_url: "/icone_ps.png",
    stock_quantity: 50,
    is_active: true,
  },
  {
    id: "3",
    name: "Tênis Running Air Max",
    price: 749.00,
    image_url: "/logo_fundo_escuro_ps.png",
    stock_quantity: 50,
    is_active: true,
  },
];

export function MobileProductCards({ products = DEFAULT_PRODUCTS }: { products?: ProductItem[] }) {
  const [items, setItems] = useState<ProductItem[]>(products.length > 0 ? products : DEFAULT_PRODUCTS);

  function toggleProductActive(id: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, is_active: !item.is_active } : item
      )
    );
  }

  function handleShareWhatsApp(product: ProductItem) {
    const text = encodeURIComponent(`Confira o produto: ${product.name} por R$ ${product.price}!`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  return (
    <div className="md:hidden space-y-4 mb-20">
      {/* Header Title with Arrow */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
          Catálogo de Produtos
        </h2>
        <Link
          href="/dashboard/catalogo"
          className="text-zinc-400 hover:text-emerald-400 text-xs font-bold flex items-center gap-1 transition-colors"
        >
          <ChevronRight size={18} />
        </Link>
      </div>

      {/* Cards Stack */}
      <div className="space-y-3">
        {items.map((product) => {
          const formattedPrice = typeof product.price === "number"
            ? `R$ ${product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
            : product.price;

          return (
            <div
              key={product.id}
              className="bg-[#121212] border border-white/10 rounded-[27px] p-3.5 shadow-md flex items-center gap-3.5 relative overflow-hidden transition-all hover:border-emerald-500/30"
            >
              {/* Product Thumbnail */}
              <div className="w-20 h-20 rounded-[27px] bg-zinc-900 border border-white/5 overflow-hidden flex items-center justify-center shrink-0 p-1">
                <img
                  src={product.image_url || "/hero_mockup.png"}
                  alt={product.name}
                  className="w-full h-full object-contain drop-shadow"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/logo_fundo_escuro_ps.png";
                  }}
                />
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0 pr-1">
                <h3 className="text-xs font-bold text-white leading-snug truncate">
                  {product.name}
                </h3>
                
                <p className="text-sm font-black text-emerald-400 mt-1">
                  {formattedPrice}
                </p>

                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    product.is_active !== false
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-zinc-800 text-zinc-400"
                  }`}>
                    {product.is_active !== false ? "Disponível" : "Indisponível"}
                  </span>
                  
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {product.stock_quantity ?? 50}+ em estoque
                  </span>
                </div>
              </div>

              {/* Quick Actions (Right Column) */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Toggle Switch */}
                <button
                  type="button"
                  onClick={() => toggleProductActive(product.id)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ${
                    product.is_active !== false ? "bg-emerald-500" : "bg-zinc-700"
                  }`}
                  title="Alternar Visibilidade"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-[var(--dash-surface)] shadow-md transform transition-transform duration-200 ${
                      product.is_active !== false ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>

                {/* WhatsApp Share Button */}
                <button
                  type="button"
                  onClick={() => handleShareWhatsApp(product)}
                  className="w-8 h-8 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 flex items-center justify-center transition-colors shadow-sm"
                  title="Enviar no WhatsApp"
                >
                  <MessageCircle size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
