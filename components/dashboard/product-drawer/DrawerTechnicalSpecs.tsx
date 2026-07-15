import React from "react";
import { X } from "lucide-react";
import { ProductRow } from "../ProductDetailDrawer";

interface DrawerTechnicalSpecsProps {
  product: ProductRow;
  updateData: (index: number, id: string, value: any) => void;
  rowIndex: number;
  effectiveShowSpecs: boolean;
  effectiveSpecsTitle: string;
  specs: any[];
  addSpec: () => void;
  updateSpec: (idx: number, field: string, val: string) => void;
  removeSpec: (idx: number) => void;
}

export default function DrawerTechnicalSpecs({
  product,
  updateData,
  rowIndex,
  effectiveShowSpecs,
  effectiveSpecsTitle,
  specs,
  addSpec,
  updateSpec,
  removeSpec,
}: DrawerTechnicalSpecsProps) {
  if (!effectiveShowSpecs) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-4">
          <input 
            value={product.specs_title || ""}
            onChange={(e) => updateData(rowIndex, "specs_title", e.target.value)}
            placeholder={effectiveSpecsTitle}
            className="text-sm font-bold uppercase tracking-wider text-primary bg-transparent border-none focus:ring-0 w-full p-0 placeholder:opacity-50"
          />
        </div>
        <button 
          onClick={addSpec}
          className="text-xs font-bold text-primary hover:underline flex-shrink-0"
        >
          + Adicionar Campo
        </button>
      </div>
      
      <div className="space-y-3">
        {specs.map((spec, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input 
              placeholder="Título (ex: Material)"
              value={spec.label}
              onChange={(e) => updateSpec(idx, "label", e.target.value)}
              className="flex-1 p-2 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl text-sm"
            />
            <input 
              placeholder="Valor (ex: Alumínio)"
              value={spec.value}
              onChange={(e) => updateSpec(idx, "value", e.target.value)}
              className="flex-1 p-2 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl text-sm"
            />
            <button 
              onClick={() => removeSpec(idx)}
              className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {specs.length === 0 && (
          <p className="text-xs text-[var(--dash-text-muted)] italic">Nenhuma especificação técnica adicionada.</p>
        )}
      </div>
    </section>
  );
}
