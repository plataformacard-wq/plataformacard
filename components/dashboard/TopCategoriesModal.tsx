"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, BarChart2 } from "lucide-react";

interface TopCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: { name: string; total: number; outOfStock: number; percentage: number }[];
}

export default function TopCategoriesModal({ isOpen, onClose, categories }: TopCategoriesModalProps) {
  // sort by total desc
  const sorted = [...categories].sort((a, b) => b.total - a.total);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div key="categories-modal" className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative flex flex-col w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-[27px] bg-[var(--dash-surface)] shadow-2xl border border-[var(--dash-border)]">
            <div className="flex items-center justify-between border-b border-[var(--dash-border)] p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                  <BarChart2 size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--dash-text-primary)]">Distribuição por Categoria</h2>
                  <p className="text-sm text-[var(--dash-text-secondary)]">Volumetria completa de produtos</p>
                </div>
              </div>
              <button onClick={onClose} className="rounded-full p-2 text-[var(--dash-text-muted)] hover:bg-[var(--dash-bg)] hover:text-[var(--dash-text-primary)] transition">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
               {sorted.length > 0 ? (
                 <div className="space-y-3">
                   {sorted.map((cat, idx) => (
                     <div key={idx} className="flex flex-col p-4 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)]">
                       <div className="flex items-center justify-between mb-2">
                         <span className="text-sm font-bold text-[var(--dash-text-primary)]">{cat.name}</span>
                         <span className="text-xs font-medium text-[var(--dash-text-muted)]">{cat.percentage.toFixed(1)}% do catálogo</span>
                       </div>
                       <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-[var(--dash-border)] mb-3">
                         <div className="bg-purple-500 transition-all rounded-full" style={{ width: `${cat.percentage}%` }} />
                       </div>
                       <div className="flex items-center gap-4">
                         <div className="flex items-center gap-1.5">
                           <span className="text-sm font-bold text-[var(--dash-text-primary)]">{cat.total}</span>
                           <span className="text-xs text-[var(--dash-text-secondary)]">produtos</span>
                         </div>
                         {cat.outOfStock > 0 && (
                           <div className="flex items-center gap-1.5">
                             <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                             <span className="text-xs font-bold text-red-500">{cat.outOfStock} esgotados</span>
                           </div>
                         )}
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center py-10 text-[var(--dash-text-muted)]">
                   <BarChart2 size={48} className="mb-4 opacity-20" />
                   <p>Nenhuma categoria encontrada.</p>
                 </div>
               )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
