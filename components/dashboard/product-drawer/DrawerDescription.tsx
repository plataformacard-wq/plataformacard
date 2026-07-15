import React from "react";
import { ExternalLink } from "lucide-react";
import { ProductRow } from "../ProductDetailDrawer";

interface DrawerDescriptionProps {
  product: ProductRow;
  updateData: (index: number, id: string, value: any) => void;
  rowIndex: number;
}

export default function DrawerDescription({
  product,
  updateData,
  rowIndex,
}: DrawerDescriptionProps) {
  return (
    <section className="space-y-4">
      <h4 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
        <ExternalLink size={16} /> Descrição Detalhada
      </h4>
      <textarea 
        value={product.description || ""}
        onChange={(e) => updateData(rowIndex, "description", e.target.value)}
        rows={5}
        placeholder="Descreva as características principais do produto..."
        className="w-full p-3 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none"
      />
    </section>
  );
}
