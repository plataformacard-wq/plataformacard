"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface StockThresholdModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  currentThreshold: number;
  onSaved: (newThreshold: number) => void;
}

export default function StockThresholdModal({
  isOpen,
  onClose,
  orgId,
  currentThreshold,
  onSaved
}: StockThresholdModalProps) {
  const [threshold, setThreshold] = useState(currentThreshold.toString());
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  const handleSave = async () => {
    const val = parseInt(threshold, 10);
    if (isNaN(val) || val < 0) {
      alert("Por favor, insira um valor numérico válido maior ou igual a zero.");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("organizations")
        .update({ low_stock_threshold: val })
        .eq("id", orgId);

      if (error) throw error;
      
      onSaved(val);
      onClose();
    } catch (err: any) {
      console.error(err);
      alert("Erro ao salvar a configuração.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
            >
              <X size={20} />
            </button>

            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Alerta de Estoque</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Configure sua margem de segurança</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Avisar quando o estoque for menor ou igual a:
                </label>
                <input
                  type="number"
                  min="0"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                  placeholder="Ex: 5"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-5 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90 disabled:opacity-50 shadow-sm"
                >
                  <Save size={18} />
                  {isSaving ? "Salvando..." : "Salvar Alerta"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
