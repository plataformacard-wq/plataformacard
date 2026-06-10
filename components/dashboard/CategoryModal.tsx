"use client";

import React, { useState, useEffect } from "react";
import { X, Layers, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  name: string;
  description?: string | null;
  sort_order?: number | null;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingCategory: Category | null;
  catalogId: string | null;
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSuccess,
  editingCategory,
  catalogId,
}: CategoryModalProps) {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);
  const [categoryManageError, setCategoryManageError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (editingCategory) {
        setCategoryName(editingCategory.name);
        setCategoryDescription(editingCategory.description || "");
      } else {
        setCategoryName("");
        setCategoryDescription("");
      }
      setCategoryManageError("");
    }
  }, [isOpen, editingCategory]);

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!catalogId) {
      setCategoryManageError("Erro: Nenhum catálogo encontrado.");
      return;
    }

    const trimmedName = categoryName.trim();
    if (!trimmedName) {
      setCategoryManageError("O nome da categoria é obrigatório.");
      return;
    }

    setSavingCategory(true);
    setCategoryManageError("");
    const supabase = createClient();

    try {
      if (editingCategory) {
        const { error } = await supabase
          .from("categories")
          .update({
            name: trimmedName,
            description: categoryDescription.trim(),
          })
          .eq("id", editingCategory.id);

        if (error) throw error;
      } else {
        // Get current max sort_order
        const { data: currentCategories } = await supabase
          .from("categories")
          .select("sort_order")
          .eq("catalog_id", catalogId);
        
        const nextOrder = (currentCategories?.length || 0);

        const { error } = await supabase.from("categories").insert({
          catalog_id: catalogId,
          name: trimmedName,
          description: categoryDescription.trim(),
          sort_order: nextOrder,
        });

        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Erro ao salvar categoria:", error);
      setCategoryManageError(`Erro: ${error.message || "Ocorreu um erro ao salvar."}`);
    } finally {
      setSavingCategory(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md rounded-xl overflow-hidden shadow-2xl border"
            style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
          >
            <div className="relative px-8 py-6 border-b" style={{ borderColor: "var(--dash-border)", background: "var(--dash-surface-secondary)" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <Layers size={20} />
                  </div>
                  <h2 className="text-xl font-black tracking-tight" style={{ color: "var(--dash-text-primary)" }}>
                    {editingCategory ? "Editar Categoria" : "Nova Categoria"}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  style={{ color: "var(--dash-text-muted)" }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-8">
              <form onSubmit={handleSaveCategory} className="space-y-6">
                {categoryManageError && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center gap-3 text-red-500"
                  >
                    <AlertCircle size={18} />
                    <p className="text-xs font-bold">{categoryManageError}</p>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: "var(--dash-text-muted)" }}>
                    Nome da Categoria
                  </label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Ex: Camisetas, Promoções, Eletrônicos..."
                    className="w-full rounded-2xl border px-5 py-4 text-sm font-bold outline-none transition-all focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5"
                    style={{ 
                      borderColor: "var(--dash-border)", 
                      background: "var(--dash-input-bg)", 
                      color: "var(--dash-text-primary)" 
                    }}
                    required
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: "var(--dash-text-muted)" }}>
                    Descrição (Opcional)
                  </label>
                  <textarea
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    placeholder="Uma breve descrição sobre os itens desta categoria..."
                    className="w-full rounded-2xl border px-5 py-4 text-sm font-bold outline-none transition-all focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 min-h-[120px] resize-none"
                    style={{ 
                      borderColor: "var(--dash-border)", 
                      background: "var(--dash-input-bg)", 
                      color: "var(--dash-text-primary)" 
                    }}
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-xs font-black uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingCategory}
                    className="flex-[2] px-6 py-4 rounded-2xl bg-emerald-500 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {savingCategory ? "Salvando..." : editingCategory ? "Salvar Alterações" : "Criar Categoria"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
