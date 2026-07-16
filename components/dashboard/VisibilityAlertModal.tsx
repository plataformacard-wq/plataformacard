"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info } from "lucide-react";

export default function VisibilityAlertModal({ 
  isOpen, 
  dontShowAgain, 
  setDontShowAgain, 
  onClose, 
  onConfirm 
}: { 
  isOpen: boolean; 
  dontShowAgain: boolean; 
  setDontShowAgain: (val: boolean) => void; 
  onClose: () => void; 
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md rounded-2xl p-8 shadow-2xl border"
            style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
          >
            <div className="h-16 w-16 bg-amber-50 dark:bg-amber-900/10 rounded-2xl flex items-center justify-center text-amber-500 mb-6 mx-auto border border-amber-100 dark:border-amber-900/20">
              <Info size={32} />
            </div>
            
            <h3 className="text-xl font-black text-center mb-4 uppercase tracking-tight" style={{ color: "var(--dash-text-primary)" }}>Aviso de Visibilidade</h3>
            
            <p className="text-center text-sm leading-relaxed mb-8" style={{ color: "var(--dash-text-secondary)" }}>
              Ao tornar o produto <span className="font-bold text-red-500">indisponível</span> ele não aparecerá no catálogo para seus clientes.
            </p>

            <div className="flex flex-col gap-4">
              <label 
                className="flex items-center gap-3 cursor-pointer p-4 rounded-2xl border group transition-all"
                style={{ background: "var(--dash-surface-secondary)", borderColor: "var(--dash-border)" }}
              >
                <input 
                  type="checkbox" 
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="h-5 w-5 rounded-lg border-zinc-300 text-emerald-600 focus:ring-emerald-500 bg-transparent"
                />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--dash-text-secondary)" }}>Não mostrar novamente</span>
              </label>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-4 rounded-2xl bg-zinc-100 text-zinc-500 text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 px-6 py-4 rounded-2xl bg-zinc-900 text-white text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-black/10"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
