"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

export default function NoCategoryModal({ 
  isOpen, 
  onClose, 
  onCreateCategory 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onCreateCategory: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl"
            style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
          >
            <div className="p-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                <AlertCircle size={32} />
              </div>
              <h3 className="mb-2 text-xl font-bold" style={{ color: "var(--dash-text-primary)" }}>
                Categoria Necessária
              </h3>
              <p className="mb-8 text-sm leading-relaxed" style={{ color: "var(--dash-text-secondary)" }}>
                Para cadastrar um produto, você precisa ter pelo menos uma categoria criada. As categorias ajudam a organizar seu catálogo para seus clientes.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onCreateCategory();
                  }}
                  className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                >
                  Criar Minha Primeira Categoria
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2 text-sm font-medium hover:underline"
                  style={{ color: "var(--dash-text-muted)" }}
                >
                  Talvez mais tarde
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
