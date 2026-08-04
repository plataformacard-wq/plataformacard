"use client";

import React from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { formatPrice } from "../utils";

interface CartFloatingBarProps {
  totalItems: number;
  totalPrice: number;
  onOpenCart: () => void;
  accentColor?: string | null;
}

export function CartFloatingBar({
  totalItems,
  totalPrice,
  onOpenCart,
  accentColor,
}: CartFloatingBarProps) {
  if (totalItems === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto"
      >
        <button
          onClick={onOpenCart}
          className="w-full flex items-center justify-between p-4 rounded-[27px] text-white shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          style={{
            backgroundColor: accentColor || "var(--primary, #10b981)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="relative bg-white/20 p-2.5 rounded-full flex items-center justify-center">
              <ShoppingBag size={20} className="text-white" />
              <span className="absolute -top-1 -right-1 bg-white text-zinc-900 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                {totalItems}
              </span>
            </div>
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-white/80">
                Ver Comanda ({totalItems} {totalItems === 1 ? "item" : "itens"})
              </p>
              <p className="text-lg font-black text-white leading-none">
                {formatPrice(totalPrice)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 font-bold text-xs bg-white/20 px-3 py-1.5 rounded-full">
            <span>Avançar</span>
            <ChevronRight size={16} />
          </div>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
