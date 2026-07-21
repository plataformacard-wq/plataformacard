"use client";

import React, { useState } from "react";
import { Plus, Trash2, Palette, ChevronDown, ChevronUp } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { motion, AnimatePresence } from "framer-motion";

export interface ColorItem {
  name: string;
  hex: string;
  sku?: string | null;
  stock_quantity?: number | null;
  is_in_stock?: boolean;
}

interface ProductColorStockSectionProps {
  colors: (string | ColorItem)[];
  onChange: (updatedColors: ColorItem[]) => void;
}

export default function ProductColorStockSection({ colors, onChange }: ProductColorStockSectionProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [colorHexDraft, setColorHexDraft] = useState("#10B981");
  const [colorNameDraft, setColorNameDraft] = useState("");
  const [colorSkuDraft, setColorSkuDraft] = useState("");
  const [colorQtyDraft, setColorQtyDraft] = useState<number>(0);

  // Normalização do array de cores recebido
  const normalizedColors: ColorItem[] = colors.map((c, idx) => {
    if (typeof c === "string") {
      return {
        name: `Cor ${idx + 1}`,
        hex: c,
        sku: null,
        stock_quantity: 0,
        is_in_stock: false,
      };
    }
    return {
      name: c.name || `Cor ${idx + 1}`,
      hex: c.hex || "#71717A",
      sku: c.sku || null,
      stock_quantity: typeof c.stock_quantity === "number" ? c.stock_quantity : 0,
      is_in_stock: (c.stock_quantity ?? 0) > 0,
    };
  });

  const handleAddColor = () => {
    const name = colorNameDraft.trim() || `Cor ${normalizedColors.length + 1}`;
    const newColor: ColorItem = {
      name,
      hex: colorHexDraft,
      sku: colorSkuDraft.trim() || null,
      stock_quantity: colorQtyDraft,
      is_in_stock: colorQtyDraft > 0,
    };

    const nextColors = [...normalizedColors, newColor];
    onChange(nextColors);

    setColorNameDraft("");
    setColorSkuDraft("");
    setColorQtyDraft(0);
    setIsPickerOpen(false);
  };

  const handleRemoveColor = (index: number) => {
    const nextColors = normalizedColors.filter((_, i) => i !== index);
    onChange(nextColors);
  };

  const handleUpdateItem = (index: number, field: keyof ColorItem, value: any) => {
    const nextColors = normalizedColors.map((c, i) => {
      if (i === index) {
        const updated = { ...c, [field]: value };
        if (field === "stock_quantity") {
          const qty = typeof value === "number" ? value : 0;
          updated.is_in_stock = qty > 0;
        }
        return updated;
      }
      return c;
    });
    onChange(nextColors);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-[27px] border-2 space-y-6"
      style={{ background: "var(--dash-surface-secondary)", borderColor: "var(--dash-border)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-emerald-500" />
          <h4 className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-primary)]">
            Variações de Cores & Estoque Individual
          </h4>
        </div>
        <span className="text-xs font-bold text-[var(--dash-text-muted)]">
          {normalizedColors.length} cor(es) cadastrada(s)
        </span>
      </div>

      {/* Lista de Cores Cadastradas */}
      {normalizedColors.length > 0 && (
        <div className="space-y-3">
          {normalizedColors.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] gap-3 shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="w-6 h-6 rounded-full border border-black/20 shrink-0 shadow-inner"
                  style={{ backgroundColor: item.hex }}
                />
                <div className="flex flex-col min-w-0">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateItem(idx, "name", e.target.value)}
                    placeholder="Nome da cor"
                    className="text-xs font-bold text-[var(--dash-text-primary)] bg-transparent outline-none focus:border-b border-emerald-500"
                  />
                  <input
                    type="text"
                    value={item.sku || ""}
                    onChange={(e) => handleUpdateItem(idx, "sku", e.target.value)}
                    placeholder="SKU da Cor (opcional)"
                    className="text-[10px] font-mono text-[var(--dash-text-muted)] bg-transparent outline-none uppercase"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <div className="flex items-center gap-1.5 bg-[var(--dash-hover-bg)] px-3 py-1.5 rounded-lg border border-[var(--dash-border)]">
                  <span className="text-[10px] font-bold text-[var(--dash-text-muted)] uppercase">Qtd:</span>
                  <input
                    type="number"
                    min={0}
                    value={item.stock_quantity ?? 0}
                    onChange={(e) => handleUpdateItem(idx, "stock_quantity", parseInt(e.target.value, 10) || 0)}
                    className="w-14 bg-transparent text-center font-bold text-xs text-[var(--dash-text-primary)] outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveColor(idx)}
                  className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Remover cor"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botão e Form de Adicionar Nova Cor */}
      <div>
        {!isPickerOpen ? (
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="w-full py-3 border-2 border-dashed border-[var(--dash-border)] rounded-lg flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] hover:border-emerald-500 hover:text-emerald-500 transition-all"
          >
            <Plus size={16} />
            Adicionar Nova Cor
          </button>
        ) : (
          <div className="p-4 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--dash-text-primary)] uppercase tracking-wider">
                Nova Variação de Cor
              </span>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="text-xs text-[var(--dash-text-muted)] hover:text-white"
              >
                Cancelar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div className="flex flex-col items-center gap-3">
                <HexColorPicker color={colorHexDraft} onChange={setColorHexDraft} />
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--dash-text-secondary)]">
                  <span className="w-4 h-4 rounded-full border border-black/20" style={{ backgroundColor: colorHexDraft }} />
                  <span>{colorHexDraft.toUpperCase()}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-[var(--dash-text-muted)] uppercase tracking-wider block mb-1">
                    Nome da Cor
                  </label>
                  <input
                    type="text"
                    value={colorNameDraft}
                    onChange={(e) => setColorNameDraft(e.target.value)}
                    placeholder="Ex: Azul Petróleo"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-hover-bg)] text-xs text-[var(--dash-text-primary)] outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[var(--dash-text-muted)] uppercase tracking-wider block mb-1">
                    SKU Específico da Cor (Opcional)
                  </label>
                  <input
                    type="text"
                    value={colorSkuDraft}
                    onChange={(e) => setColorSkuDraft(e.target.value)}
                    placeholder="Ex: CAM-001-AZUL"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-hover-bg)] text-xs font-mono text-[var(--dash-text-primary)] outline-none uppercase focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[var(--dash-text-muted)] uppercase tracking-wider block mb-1">
                    Estoque Inicial desta Cor
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={colorQtyDraft}
                    onChange={(e) => setColorQtyDraft(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-hover-bg)] text-xs font-bold text-[var(--dash-text-primary)] outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddColor}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
                >
                  Confirmar e Adicionar Cor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
