"use client";

import React from "react";
import { Layers, Edit2 as EditIcon, Trash2 as TrashIcon } from "lucide-react";

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

type CategoryCardProps = {
  cat: Category;
  productCount: number;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
};

export default function CategoryCard({ cat, productCount, onEdit, onDelete }: CategoryCardProps) {
  return (
    <div
      className="group flex flex-col justify-between p-5 rounded-2xl border transition-all hover:shadow-lg hover:border-primary/30"
      style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="h-8 w-8 rounded-lg bg-zinc-50 dark:bg-zinc-900 border flex items-center justify-center text-xs font-mono text-[var(--dash-text-muted)]">
          <Layers size={14} />
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <button
              onClick={() => onEdit(cat)}
              className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-primary"
            >
              <EditIcon size={14} />
            </button>
            <button
              onClick={() => onDelete(cat.id)}
              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500"
            >
              <TrashIcon size={14} />
            </button>
        </div>
      </div>
      <div>
        <p className="text-sm font-bold truncate" style={{ color: "var(--dash-text-primary)" }}>{cat.name}</p>
        <p className="text-[10px] font-bold uppercase text-[var(--dash-text-muted)]">
           {productCount} itens
        </p>
      </div>
    </div>
  );
}
