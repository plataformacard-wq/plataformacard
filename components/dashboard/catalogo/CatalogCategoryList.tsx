"use client";

import React from "react";
import { Layers, Plus, Eye, Edit2 as EditIcon, Trash2 as TrashIcon } from "lucide-react";

type Category = {
  id: string;
  catalog_id?: string | null;
  name: string;
  description?: string | null;
  sort_order?: number | null;
  specs_title?: string | null;
  show_specs?: boolean | null;
  show_colors?: boolean | null;
  colors?: string[] | null;
};

type ProductRow = any; // simplified for extraction

type CatalogCategoryListProps = {
  hiddenInheritedProducts: ProductRow[];
  handleMakeAllVisible: () => void;
  makingAllVisible: boolean;
  setEditingCategory: (cat: Category | null) => void;
  setShowCategoryModal: (show: boolean) => void;
  loadingCategories: boolean;
  categories: Category[];
  catalogId: string | null;
  products: ProductRow[];
  getProductCategoryId: (p: ProductRow) => string;
  handleDeleteCategory: (id: string) => void;
};

export default function CatalogCategoryList({
  hiddenInheritedProducts,
  handleMakeAllVisible,
  makingAllVisible,
  setEditingCategory,
  setShowCategoryModal,
  loadingCategories,
  categories,
  catalogId,
  products,
  getProductCategoryId,
  handleDeleteCategory
}: CatalogCategoryListProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Layers size={24} />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: "var(--dash-text-primary)" }}>Categorias</h2>
        </div>
        <div className="flex items-center gap-3">
          {hiddenInheritedProducts.length > 0 && (
            <button
              onClick={handleMakeAllVisible}
              disabled={makingAllVisible}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 bg-blue-500 text-white text-sm font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/10 disabled:opacity-50"
            >
              {makingAllVisible ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              ) : (
                <Eye size={18} />
              )}
              {makingAllVisible ? "Processando..." : `Herdar Todos (${hiddenInheritedProducts.length})`}
            </button>
          )}
          <button
            onClick={() => {
              setEditingCategory(null);
              setShowCategoryModal(true);
            }}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/10"
          >
            <Plus size={18} /> Nova Categoria
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingCategories ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-[27px] bg-zinc-100 dark:bg-zinc-800" />
          ))
        ) : categories.filter(c => c.catalog_id === catalogId).length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-[27px] border border-dashed" style={{ borderColor: "var(--dash-border)" }}>
            <p className="text-sm italic" style={{ color: "var(--dash-text-secondary)" }}>Nenhuma categoria cadastrada.</p>
          </div>
        ) : (
          categories.filter(c => c.catalog_id === catalogId).map((cat, idx) => (
            <div
              key={cat.id}
              className="group flex flex-col justify-between p-5 rounded-[27px] border transition-all hover:shadow-lg hover:border-primary/30"
              style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="h-8 w-8 rounded-lg bg-zinc-50 dark:bg-zinc-900 border flex items-center justify-center text-xs font-mono text-[var(--dash-text-muted)]">
                  <Layers size={14} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setShowCategoryModal(true);
                      }}
                      className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-primary"
                    >
                      <EditIcon size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500"
                    >
                      <TrashIcon size={14} />
                    </button>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold truncate" style={{ color: "var(--dash-text-primary)" }}>{cat.name}</p>
                <p className="text-[10px] font-bold uppercase text-[var(--dash-text-muted)]">
                   {products.filter((p: any) => getProductCategoryId(p) === cat.id).length} itens
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
