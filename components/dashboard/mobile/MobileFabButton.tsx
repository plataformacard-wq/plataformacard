"use client";

import { useState } from "react";
import { Plus, Package, UserPlus, Link as LinkIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function MobileFabButton() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  function handleNavigate(path: string) {
    setIsOpen(false);
    router.push(path);
  }

  function handleCopyLink() {
    setIsOpen(false);
    const catalogUrl = `${window.location.origin}/dashboard/catalogo`;
    navigator.clipboard.writeText(catalogUrl);
    alert("Link do catálogo copiado para a área de transferência!");
  }

  return (
    <div className="md:hidden fixed bottom-16 right-4 z-[95]">
      {/* Action Menu (Sheet) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[94]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-16 right-0 mb-3 w-56 bg-[#121212] border border-white/10 rounded-[27px] p-2.5 shadow-2xl z-[95] space-y-1.5"
            >
              <button
                onClick={() => handleNavigate("/dashboard/catalogo#novo")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition-colors text-left"
              >
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Package size={16} />
                </div>
                <span>Adicionar Produto</span>
              </button>

              <button
                onClick={() => handleNavigate("/dashboard/vendedores")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-200 text-xs font-bold transition-colors text-left"
              >
                <div className="p-1.5 rounded-lg bg-zinc-700 text-zinc-300">
                  <UserPlus size={16} />
                </div>
                <span>Novo Vendedor</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-200 text-xs font-bold transition-colors text-left"
              >
                <div className="p-1.5 rounded-lg bg-zinc-700 text-zinc-300">
                  <LinkIcon size={16} />
                </div>
                <span>Copiar Link da Loja</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Floating FAB Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-[27px] bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center shadow-[0_0_25px_rgba(44,203,104,0.5)] border border-emerald-300/30 active:scale-90 hover:scale-105 transition-all duration-200"
        aria-label="Ação Rápida"
      >
        {isOpen ? (
          <X size={26} className="rotate-90 transition-transform" />
        ) : (
          <Plus size={28} strokeWidth={2.5} />
        )}
      </button>
    </div>
  );
}
