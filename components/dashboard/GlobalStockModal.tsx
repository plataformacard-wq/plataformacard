"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Search, Package } from "lucide-react";

interface GlobalStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: any[];
}

export default function GlobalStockModal({ isOpen, onClose, products }: GlobalStockModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState("default");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  let filtered = products.filter(p => p?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || (p?.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())));

  if (filterOption === "low_stock") {
    filtered = filtered.filter(p => (p.stock_quantity ?? 0) < 5 && p.stock_quantity !== null && p.stock_quantity > 0);
  }

  if (filterOption === "highest") {
    filtered = filtered.sort((a, b) => (b.stock_quantity ?? 0) - (a.stock_quantity ?? 0));
  } else if (filterOption === "lowest") {
    filtered = filtered.sort((a, b) => (a.stock_quantity ?? 0) - (b.stock_quantity ?? 0));
  }

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative flex flex-col w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl bg-[var(--dash-surface)] shadow-2xl border border-[var(--dash-border)]">
            <div className="flex items-center justify-between border-b border-[var(--dash-border)] p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                  <Package size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--dash-text-primary)]">Estoque Global</h2>
                  <p className="text-sm text-[var(--dash-text-secondary)]">Listagem completa de produtos</p>
                </div>
              </div>
              <button onClick={onClose} className="rounded-full p-2 text-[var(--dash-text-muted)] hover:bg-[var(--dash-bg)] hover:text-[var(--dash-text-primary)] transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 border-b border-[var(--dash-border)]">
               <div className="flex items-center gap-3">
                 <div className="relative flex-1">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-text-muted)]" size={18} />
                   <input type="text" placeholder="Buscar produto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-bg)] pl-10 pr-4 py-2.5 text-sm text-[var(--dash-text-primary)] outline-none focus:border-primary transition" />
                 </div>
                 <div className="w-48 shrink-0 relative">
                   <select 
                     value={filterOption} 
                     onChange={(e) => setFilterOption(e.target.value)}
                     onBlur={() => setFilterOption("default")}
                     className="dash-select w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-bg)] pl-3 py-2.5 text-sm text-[var(--dash-text-primary)] font-medium outline-none focus:border-primary transition"
                   >
                     <option value="default">Filtros</option>
                     <option value="highest">Maior Estoque</option>
                     <option value="lowest">Menor Estoque</option>
                     <option value="low_stock">Estoque Baixo {"(< 5)"}</option>
                   </select>
                 </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
               {filtered.length > 0 ? (
                 <div className="space-y-2">
                   {filtered.map(p => {
                     const isOutOfStock = p.is_in_stock === false || (p.is_in_stock === null && p.stock_quantity === 0);
                     return (
                       <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-bg)]">
                         <div className="flex flex-col">
                           <span className="text-sm font-medium text-[var(--dash-text-primary)]">{p.name}</span>
                           {p.sku && <span className="text-xs text-[var(--dash-text-muted)]">SKU: {p.sku}</span>}
                         </div>
                         <div className="flex items-center gap-4">
                           <div className="flex flex-col items-end">
                             <span className="text-sm font-bold text-[var(--dash-text-primary)]">{p.stock_quantity ?? '-'} un</span>
                             {isOutOfStock ? (
                               <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">Esgotado</span>
                             ) : (
                               <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Em estoque</span>
                             )}
                           </div>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center py-10 text-[var(--dash-text-muted)]">
                   <Package size={48} className="mb-4 opacity-20" />
                   <p>Nenhum produto encontrado.</p>
                 </div>
               )}
            </div>
          </div>
    </div>,
    document.body
  );
}
