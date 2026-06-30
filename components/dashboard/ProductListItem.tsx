"use client";

import React from "react";
import { Reorder } from "framer-motion";
import Link from "next/link";
import { GripVertical, Package, Eye, Copy, Edit2 as EditIcon, Trash2 as TrashIcon } from "lucide-react";

export type Spec = { id?: string; chave: string; valor: string };

export type ProductRow = {
  id: string;
  organization_id: string;
  whatsapp_template: string | null;
  category_id: string | null;
  name: string;
  description: string | null;
  specs: Spec[] | null;
  price: number | null;
  compare_at_price: number | null;
  sku: string | null;
  has_retail: boolean | null;
  has_wholesale: boolean | null;
  wholesale_price: number | null;
  wholesale_min_quantity: number | null;
  price_display_mode: "retail" | "wholesale" | "both" | null;
  image_url: string | null;
  image_urls: string[] | null;
  is_active: boolean;
  is_in_stock: boolean;
  specs_title?: string | null;
  show_specs?: boolean | null;
  show_colors?: boolean | null;
  colors?: string[] | null;
  highlight_text?: string | null;
  show_highlight?: boolean | null;
  type?: "product" | "service";
  is_caas?: boolean;
  is_new_from_master?: boolean;
  original_master_price?: number | null;
  caas_owner_name?: string;
  override_id?: string;
  original_category_id?: string | null;
  created_at: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any;
};

type ProductListItemProps = {
  product: ProductRow;
  getProductImage: (p: ProductRow) => string;
  formatPrice: (val: number | null) => string;
  toggleProductStatus: (p: ProductRow, field: 'is_active' | 'is_in_stock') => void;
  handleOpenEdit: (p: ProductRow) => void;
  handleDuplicateProduct: (p: ProductRow) => void;
  handleDelete: (p: ProductRow) => void;
  userSlug: string | null;
  adminCatalogId: string | null;
  catalogId: string | null;
  allowCaasDetachment: boolean;
};

export default function ProductListItem({
  product,
  getProductImage,
  formatPrice,
  toggleProductStatus,
  handleOpenEdit,
  handleDuplicateProduct,
  handleDelete,
  userSlug,
  adminCatalogId,
  catalogId,
  allowCaasDetachment
}: ProductListItemProps) {
  return (
    <Reorder.Item
      value={product}
      onClick={() => handleOpenEdit(product)}
      className="group relative flex items-center gap-4 p-4 rounded-[24px] border transition-all hover:shadow-xl hover:border-emerald-500/30 cursor-pointer"
      style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
    >
      {/* Handle de Arraste (Sempre visível para facilitar descoberta) */}
      <div className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 text-zinc-400 hover:text-emerald-500 transition-colors">
        <GripVertical size={20} />
      </div>

      {/* Imagem compacta */}
      <div className="relative flex-shrink-0">
        {product.is_in_stock === false && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 rounded-2xl">
            <span className="bg-rose-600 !text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter shadow-lg">Esgotado</span>
          </div>
        )}
        {getProductImage(product) ? (
          <img 
            src={getProductImage(product)} 
            alt={product.name}
            className={`h-16 w-16 rounded-2xl object-cover border border-zinc-100 shadow-sm bg-zinc-50 transition-opacity ${(product.is_in_stock === false || product.is_active === false) ? 'opacity-50' : 'opacity-100'}`} 
          />
        ) : (
          <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-zinc-400 ${(product.is_in_stock === false || product.is_active === false) ? 'opacity-50' : 'opacity-100'}`} style={{ background: "var(--dash-surface-secondary)" }}>
            <Package size={24} />
          </div>
        )}
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {/* Linha Superior: Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-x-4">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold text-base truncate" style={{ color: "var(--dash-text-primary)" }}>
              {product.name}
            </h4>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(product as any).is_new_from_master && (
              <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-[9px] font-black uppercase tracking-widest border border-yellow-500/20">
                NOVO NO MASTER
              </span>
            )}
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
              {Array.isArray(product.categories)
                  ? (product.categories[0]?.name ?? "Sem categoria")
                  : (product.categories?.name ?? "Sem categoria")}
            </span>
            {product.sku && (
              <span className="px-1.5 py-0.5 rounded-md bg-zinc-800 text-[9px] font-bold text-white uppercase tracking-wider">
                {product.sku}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {product.is_in_stock !== false && product.has_retail !== false && product.price !== null && (
              <div className="flex flex-col items-end">
                {(product.has_wholesale || product.compare_at_price) && (
                  <span className="text-[8px] font-black uppercase text-zinc-400 leading-none mb-0.5">Varejo</span>
                )}
                {product.compare_at_price && (
                  <span className="text-[9px] font-bold text-zinc-400 line-through leading-none mb-1">
                    {formatPrice(product.compare_at_price)}
                  </span>
                )}
                <p className="text-lg font-black" style={{ color: "var(--dash-text-primary)" }}>
                  {formatPrice(product.price)}
                </p>
              </div>
            )}
            {product.is_in_stock !== false && product.has_retail !== false && product.price !== null && product.has_wholesale && product.wholesale_price !== null && (
              <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 self-end mb-1" />
            )}
            {product.is_in_stock !== false && product.has_wholesale && product.wholesale_price !== null && (
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-black uppercase text-emerald-600 leading-none mb-0.5">Atacado</span>
                <p className="text-lg font-black text-emerald-600">
                  {formatPrice(product.wholesale_price)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Linha Inferior: Controles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-dashed" style={{ borderColor: "var(--dash-border)" }} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-4">
            {/* Switches Compactos */}
            <div className="flex items-center gap-4">
              <div 
                onClick={(e) => { e.stopPropagation(); toggleProductStatus(product, 'is_active'); }}
                className="flex items-center gap-2 cursor-pointer group/sw"
              >
                <span className="text-[9px] font-bold uppercase text-[var(--dash-text-muted)]">
                  {product.type === 'service' ? 'Disponível' : 'Visível'}
                </span>
                <div className={`w-8 h-4 rounded-full relative transition-all duration-300 ${product.is_active !== false ? 'bg-emerald-500' : 'bg-zinc-200'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 ${product.is_active !== false ? 'left-4.5' : 'left-0.5'}`} />
                </div>
              </div>

              <div 
                onClick={(e) => { e.stopPropagation(); toggleProductStatus(product, 'is_in_stock'); }}
                className="flex items-center gap-2 cursor-pointer group/sw"
              >
                <span className="text-[9px] font-bold uppercase text-[var(--dash-text-muted)]">Estoque</span>
                <div className={`w-8 h-4 rounded-full relative transition-all duration-300 ${product.is_in_stock !== false ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 ${product.is_in_stock !== false ? 'left-4.5' : 'left-0.5'}`} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {userSlug ? (
              <Link
                href={adminCatalogId ? `/${userSlug}/catalogo?preview_catalog=${adminCatalogId}#${product.id}` : `/${userSlug}/catalogo#${product.id}`}
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-sm active:scale-95"
                title="Ver no Catálogo Público"
              >
                <Eye size={14} />
              </Link>
            ) : (
              <button
                type="button"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  alert("Slug ainda não carregado. Tente novamente em um segundo.");
                }}
                className="p-2 rounded-lg bg-zinc-800 text-zinc-500 cursor-wait"
              >
                <Eye size={14} />
              </button>
            )}

            {(!product.is_caas || allowCaasDetachment) && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleDuplicateProduct(product); }}
                className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-sm active:scale-95"
                title="Duplicar"
              >
                <Copy size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleOpenEdit(product); }}
              className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-sm active:scale-95"
              title="Editar"
            >
              <EditIcon size={14} />
            </button>
            {(!product.is_caas || allowCaasDetachment) && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleDelete(product); }}
                className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-red-500 transition-all shadow-sm active:scale-95"
                title="Excluir"
              >
                <TrashIcon size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </Reorder.Item>
  );
}
