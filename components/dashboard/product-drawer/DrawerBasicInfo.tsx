import React from "react";
import { PlusCircle } from "lucide-react";
import { ProductRow } from "../ProductDetailDrawer";

interface Category {
  id: string;
  name: string;
}

interface DrawerBasicInfoProps {
  product: ProductRow;
  updateData: (index: number, id: string, value: any) => void;
  rowIndex: number;
  categories: Category[];
}

export default function DrawerBasicInfo({
  product,
  updateData,
  rowIndex,
  categories,
}: DrawerBasicInfoProps) {
  return (
    <section className="space-y-4">
      <h4 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
        <PlusCircle size={16} /> Informações Básicas
      </h4>
      
      <div className="grid gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nome do Produto</label>
          <input 
            value={product.name}
            onChange={(e) => updateData(rowIndex, "name", e.target.value)}
            className="w-full p-3 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Categoria</label>
            <select 
              value={product.category_id || ""}
              onChange={(e) => updateData(rowIndex, "category_id", e.target.value)}
              className="dash-select w-full pl-3 py-3 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">SKU</label>
            <input 
              value={product.sku || ""}
              onChange={(e) => updateData(rowIndex, "sku", e.target.value)}
              className="w-full p-3 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
