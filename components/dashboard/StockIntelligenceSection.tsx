"use client";

import { useEffect, useState } from "react";
import { Package, BarChart2, AlertTriangle, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import GlobalStockModal from "./GlobalStockModal";
import TopCategoriesModal from "./TopCategoriesModal";
import LowStockAlertModal from "./LowStockAlertModal";
import StockThresholdModal from "./StockThresholdModal";

interface StockIntelligenceSectionProps {
  activeOrgId: string;
  hasBlingConnection: boolean;
}

export default function StockIntelligenceSection({ activeOrgId, hasBlingConnection }: StockIntelligenceSectionProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);

  const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);

  useEffect(() => {
    if (!activeOrgId) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrgId]);

  const loadData = async () => {
    setLoading(true);
    // Fetch threshold
    const { data: org } = await supabase.from("organizations").select("low_stock_threshold").eq("id", activeOrgId).maybeSingle();
    if (org?.low_stock_threshold !== undefined && org?.low_stock_threshold !== null) {
      setLowStockThreshold(org.low_stock_threshold);
    }

    // Fetch products
    const { data: products } = await supabase
      .from("products")
      .select("id, name, sku, is_in_stock, stock_quantity, categories(name)")
      .eq("organization_id", activeOrgId)
      .is("deleted_at", null);

    if (products) {
      setAllProducts(products);
    }
    setLoading(false);
  };

  const handleStockUpdated = (productId: string, newStock: number) => {
    setAllProducts(prev => prev.map(p => p.id === productId ? { ...p, stock_quantity: newStock, is_in_stock: newStock > 0 } : p));
  };

  if (!hasBlingConnection) return null;

  // Computations
  const total = allProducts.length;
  const totalStockQuantity = allProducts.reduce((sum, p) => sum + (p.stock_quantity || 0), 0);
  const inStock = allProducts.filter(p => p.is_in_stock).length;
  const outOfStock = allProducts.filter(p => p.is_in_stock === false || (p.is_in_stock === null && p.stock_quantity === 0)).length;
  
  const catMap: Record<string, { total: number; outOfStock: number }> = {};
  allProducts.forEach(p => {
    const c = p.categories ? (Array.isArray(p.categories) ? p.categories[0]?.name : p.categories.name) : "Sem Categoria";
    const catName = c || "Sem Categoria";
    if (!catMap[catName]) catMap[catName] = { total: 0, outOfStock: 0 };
    catMap[catName].total++;
    if (p.is_in_stock === false || (p.is_in_stock === null && p.stock_quantity === 0)) {
      catMap[catName].outOfStock++;
    }
  });

  const allCategories = Object.keys(catMap).map(k => ({
    name: k,
    total: catMap[k].total,
    outOfStock: catMap[k].outOfStock,
    percentage: total > 0 ? (catMap[k].total / total) * 100 : 0
  }));

  const topCategories = [...allCategories].sort((a, b) => b.total - a.total).slice(0, 3);
  const lowStockProducts = allProducts.filter(p => p.stock_quantity !== null && p.stock_quantity <= lowStockThreshold);

  if (loading) {
    return <div className="h-40 flex items-center justify-center">Carregando estoque...</div>;
  }

  return (
    <>
      <div className="mt-10 mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--dash-text-primary)]">Inteligência de Estoque</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-10">
        {/* Card 1: Estoque Global */}
        <div 
          onClick={() => setIsGlobalModalOpen(true)}
          className="rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 flex flex-col justify-between cursor-pointer hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all group relative z-50"
        >
           <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
               <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500 group-hover:scale-110 transition-transform">
                 <Package size={20} />
               </div>
               <h3 className="font-bold text-[var(--dash-text-primary)]">Estoque Global</h3>
             </div>
             <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">Sincronizado</span>
           </div>
           
           <div className="flex items-end justify-between mt-4">
             <div className="flex flex-col">
               <div className="flex items-center gap-2">
                 <span className="text-3xl font-bold text-[var(--dash-text-primary)]">{totalStockQuantity}</span>
                 <span className="text-xs font-semibold text-[var(--dash-text-primary)] bg-[var(--dash-bg)] border border-[var(--dash-border)] px-2.5 py-1 rounded-md shadow-sm">produtos em estoque</span>
               </div>
               <h3 className="text-sm font-medium text-[var(--dash-text-secondary)] mt-2">dividido entre <strong className="text-[var(--dash-text-primary)]">{total}</strong> produtos</h3>
             </div>
             <div className="text-right">
               <div className="flex items-center justify-end gap-1.5 mb-1">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
                 <span className="text-xs text-[var(--dash-text-secondary)]">{inStock} em estoque</span>
               </div>
               <div className="flex items-center justify-end gap-1.5">
                 <div className="w-2 h-2 rounded-full bg-red-500" />
                 <span className="text-xs text-[var(--dash-text-secondary)]">{outOfStock} esgotados</span>
               </div>
             </div>
           </div>
           <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-red-500/20">
             <div className="bg-emerald-500 transition-all" style={{ width: `${total > 0 ? (inStock / total) * 100 : 0}%` }} />
             <div className="bg-red-500 transition-all" style={{ width: `${total > 0 ? (outOfStock / total) * 100 : 0}%` }} />
           </div>
        </div>

        {/* Card 2: Top Categorias */}
        <div 
          onClick={() => setIsCategoryModalOpen(true)}
          className="rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 cursor-pointer hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 transition-all group"
        >
          <div className="flex items-center gap-2 mb-4">
             <div className="rounded-lg bg-purple-500/10 p-2 text-purple-500 group-hover:scale-110 transition-transform">
               <BarChart2 size={20} />
             </div>
             <h3 className="font-bold text-[var(--dash-text-primary)]">Top Categorias (Volumetria)</h3>
          </div>
          {topCategories.length > 0 ? (
            <div className="space-y-3 mt-2">
              {topCategories.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--dash-text-secondary)] truncate max-w-[120px]">{cat.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[var(--dash-text-primary)]">{cat.total} itens</span>
                    {cat.outOfStock > 0 && (
                      <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-md">
                        {cat.outOfStock} esg.
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-24 items-center justify-center text-sm text-[var(--dash-text-muted)]">Nenhum dado de categoria</div>
          )}
        </div>

        {/* Card 3: Alerta Crítico */}
        <div 
          onClick={(e) => {
             if ((e.target as HTMLElement).closest('button')) return;
             setIsAlertModalOpen(true);
          }}
          className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 relative overflow-hidden flex flex-col cursor-pointer hover:border-red-500/40 hover:shadow-lg hover:shadow-red-500/10 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
               <div className="rounded-lg bg-red-500/10 p-2 text-red-500 group-hover:scale-110 transition-transform">
                 <AlertTriangle size={20} />
               </div>
               <h3 className="font-bold text-red-800 dark:text-red-400">Alerta de Estoque</h3>
             </div>
             <button onClick={() => setIsThresholdModalOpen(true)} className="text-red-500 hover:text-red-700 hover:rotate-90 transition-all z-10 bg-red-500/10 p-1.5 rounded-lg">
               <Settings size={18} />
             </button>
          </div>
          
          <p className="text-xs text-red-700/80 dark:text-red-400/80 mb-3">
            Produtos com {lowStockThreshold} ou menos unidades em estoque:
          </p>

          {lowStockProducts.length > 0 ? (
            <div className="space-y-2 overflow-y-auto flex-1 max-h-[110px] pr-2 custom-scrollbar">
              {lowStockProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-white/50 dark:bg-black/20 p-2 rounded-lg border border-red-500/10">
                  <span className="text-xs font-medium text-red-900 dark:text-red-300 truncate max-w-[140px]" title={p.name}>{p.name}</span>
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 shrink-0">{p.stock_quantity} un</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-red-600/50 dark:text-red-400/50 mt-4">
              Estoque regularizado.
            </div>
          )}
        </div>
      </div>

      <GlobalStockModal isOpen={isGlobalModalOpen} onClose={() => setIsGlobalModalOpen(false)} products={allProducts} />
      <TopCategoriesModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} categories={allCategories} />
      <LowStockAlertModal isOpen={isAlertModalOpen} onClose={() => setIsAlertModalOpen(false)} products={lowStockProducts} onStockUpdated={handleStockUpdated} />
      <StockThresholdModal isOpen={isThresholdModalOpen} onClose={() => setIsThresholdModalOpen(false)} orgId={activeOrgId} currentThreshold={lowStockThreshold} onSaved={setLowStockThreshold} />
    </>
  );
}
