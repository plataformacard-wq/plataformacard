"use client";

import React, { useState } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { X, Plus, Check } from "lucide-react";
import { Product, Spec } from "../types";

interface QuickVariationModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, selectedColor?: string, selectedSpec?: Spec) => void;
  accentColor?: string | null;
}

export function QuickVariationModal({
  product,
  onClose,
  onAddToCart,
  accentColor,
}: QuickVariationModalProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSpec, setSelectedSpec] = useState<Spec | null>(null);

  if (!product) return null;

  const hasColors = product.colors && product.colors.length > 0;
  const hasSpecs = product.specs && product.specs.length > 0;

  const handleConfirm = () => {
    onAddToCart(product, selectedColor || undefined, selectedSpec || undefined);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-sm bg-[var(--public-card-bg)] border border-[var(--public-card-border)] text-[var(--public-text-main)] rounded-[27px] p-6 shadow-2xl space-y-5"
        >
          <div className="flex items-center justify-between border-b border-[var(--public-card-border)] pb-3">
            <div>
              <h3 className="font-black text-lg text-[var(--public-text-main)]">
                Opções do Produto
              </h3>
              <p className="text-xs text-[var(--public-text-dim)] font-bold">
                {product.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[var(--public-bg)] text-[var(--public-text-dim)] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Seleção de Cores */}
          {hasColors && (
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-[var(--public-text-dim)]">
                Selecione a Cor / Opção:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colors!.map((color) => {
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border ${
                        isSelected
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-md"
                          : "bg-[var(--public-bg)] text-[var(--public-text-main)] border-[var(--public-card-border)]"
                      }`}
                      style={
                        isSelected && accentColor
                          ? { backgroundColor: accentColor, borderColor: accentColor }
                          : {}
                      }
                    >
                      {isSelected && <Check size={14} />}
                      <span>{color}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Seleção de Especificações */}
          {hasSpecs && (
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-[var(--public-text-dim)]">
                {product.specs_title || "Especificação"}:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.specs!.map((spec, idx) => {
                  const isSelected =
                    selectedSpec?.chave === spec.chave && selectedSpec?.valor === spec.valor;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedSpec(spec)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border ${
                        isSelected
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-md"
                          : "bg-[var(--public-bg)] text-[var(--public-text-main)] border-[var(--public-card-border)]"
                      }`}
                      style={
                        isSelected && accentColor
                          ? { backgroundColor: accentColor, borderColor: accentColor }
                          : {}
                      }
                    >
                      {isSelected && <Check size={14} />}
                      <span>
                        {spec.chave}: {spec.valor}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleConfirm}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm text-white shadow-lg transition-all active:scale-95 cursor-pointer"
              style={{
                backgroundColor: accentColor || "#10b981",
              }}
            >
              <Plus size={18} />
              <span>Adicionar à Comanda</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
