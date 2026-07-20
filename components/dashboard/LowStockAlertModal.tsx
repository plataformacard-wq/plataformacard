"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Check } from "lucide-react";
import { Product } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface LowStockAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onStockUpdated: (productId: string, newStock: number) => void;
}

export default function LowStockAlertModal({ isOpen, onClose, products, onStockUpdated }: LowStockAlertModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setEditValue(p.stock_quantity?.toString() || "0");
  };

  const handleSave = async (p: Product) => {
    const val = parseInt(editValue, 10);
    if (isNaN(val) || val < 0) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.from("products").update({ stock_quantity: val, is_in_stock: val > 0 }).eq("id", p.id);
      if (error) throw error;
      onStockUpdated(p.id, val);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar estoque.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div key="alert-modal" className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative flex flex-col w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-[27px] bg-[var(--dash-surface)] dark:bg-zinc-900 shadow-2xl border border-red-500/20">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 p-6 bg-red-500/5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-800 dark:text-red-400">Alerta de Estoque Crítico</h2>
                  <p className="text-sm text-red-600/80 dark:text-red-400/80">Produtos com baixo nível de estoque</p>
                </div>
              </div>
              <button onClick={onClose} className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[var(--dash-surface)] dark:bg-zinc-900">
               {products.length > 0 ? (
                 <div className="space-y-2">
                   {products.map(p => (
                     <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                       <div className="flex flex-col flex-1 pr-4">
                         <span className="text-sm font-medium text-zinc-900 dark:text-white truncate" title={p.name}>{p.name}</span>
                         {p.sku && <span className="text-xs text-zinc-500">SKU: {p.sku}</span>}
                       </div>
                       
                       <div className="flex items-center gap-3">
                         {editingId === p.id ? (
                           <div className="flex items-center gap-2">
                             <input type="number" min="0" value={editValue} onChange={e => setEditValue(e.target.value)} className="w-20 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-[var(--dash-surface)] dark:bg-zinc-900 px-2 py-1.5 text-sm text-[var(--dash-text-primary)] outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" autoFocus />
                             <button onClick={() => handleSave(p)} disabled={isSaving} className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50">
                               {isSaving ? <span className="animate-spin text-xs">...</span> : <Check size={16} />}
                             </button>
                             <button onClick={() => setEditingId(null)} disabled={isSaving} className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition">
                               <X size={16} />
                             </button>
                           </div>
                         ) : (
                           <>
                             <span className="text-sm font-bold text-red-600 dark:text-red-400 w-12 text-right">{p.stock_quantity ?? 0} un</span>
                             <button onClick={() => handleEdit(p)} className="text-xs font-medium bg-[var(--dash-surface)] dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm px-3 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 transition ml-2">
                               Ajustar
                             </button>
                           </>
                         )}
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center py-10 text-zinc-500">
                   <AlertTriangle size={48} className="mb-4 opacity-20" />
                   <p>Nenhum produto em alerta.</p>
                 </div>
               )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
