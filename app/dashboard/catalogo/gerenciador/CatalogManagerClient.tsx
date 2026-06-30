"use client";

import { useState } from "react";
import { CheckCircle2, Globe, Box, Copy, Settings, Check, RefreshCw } from "lucide-react";
import { setActiveCatalog } from "./actions";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type CatalogInfo = {
  id: string;
  masterCatalogId: string;
  name: string;
  description: string;
  logoUrl?: string;
  type: string;
  isInherited: boolean;
  isActive: boolean;
  productCount: number;
  createdAt: string;
};

export default function CatalogManagerClient({ 
  catalogs, 
  orgId, 
  profileId 
}: { 
  catalogs: CatalogInfo[], 
  orgId: string, 
  profileId: string 
}) {
  const [localCatalogs, setLocalCatalogs] = useState(catalogs);
  const [isActivating, setIsActivating] = useState<string | null>(null);

  const handleActivate = async (orgCatalogId: string) => {
    setIsActivating(orgCatalogId);
    try {
      const res = await setActiveCatalog(orgId, profileId, orgCatalogId);
      if (res.success) {
        setLocalCatalogs(prev => 
          prev.map(c => ({
            ...c,
            isActive: c.id === orgCatalogId
          }))
        );
        alert("Catálogo ativado com sucesso!");
      } else {
        alert("Erro ao ativar catálogo: " + res.error);
      }
    } catch (err: any) {
      alert("Erro ao conectar com o servidor.");
    } finally {
      setIsActivating(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {localCatalogs.map((catalog) => (
          <motion.div
            key={catalog.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative rounded-3xl border-2 transition-all duration-300 overflow-hidden flex flex-col ${
              catalog.isActive 
                ? "border-primary bg-[var(--dash-bg)] shadow-[0_8px_30px_rgb(0,0,0,0.12)]" 
                : "border-[var(--dash-border)] bg-[var(--dash-hover-bg)] opacity-80 hover:opacity-100"
            }`}
          >
            {/* Tag Herdado / Próprio */}
            <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1.5">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold shadow-sm whitespace-nowrap ${
                catalog.isInherited
                  ? "bg-purple-600 text-white dark:bg-purple-500"
                  : "bg-slate-700 text-white dark:bg-slate-300 dark:text-slate-900"
              }`}>
                {catalog.isInherited ? "Catálogo Franqueado" : "Catálogo Próprio"}
              </span>
              
              {catalog.isActive && (
                <span className="flex items-center gap-1 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  <CheckCircle2 size={14} /> Ativo Agora
                </span>
              )}
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                {catalog.logoUrl ? (
                  <img src={catalog.logoUrl} alt={catalog.name} className="w-16 h-16 rounded-xl object-contain bg-white shadow-sm" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary">
                    <Globe size={28} />
                  </div>
                )}
                <div className="flex-1 min-w-0 pr-28 sm:pr-32">
                  <h3 className="font-bold text-lg text-[var(--dash-text)] line-clamp-2 leading-tight">
                    {catalog.name}
                  </h3>
                  <p className="text-sm text-[var(--dash-text-secondary)] mt-1 truncate">
                    {catalog.type === 'CaaS' ? 'Master Catalog' : catalog.type}
                  </p>
                </div>
              </div>

              {catalog.description && (
                <p className="text-sm text-[var(--dash-text-secondary)] mb-6 line-clamp-3 flex-1">
                  {catalog.description}
                </p>
              )}
              
              {!catalog.description && <div className="flex-1" />}

              <div className="flex items-center gap-6 py-4 border-y border-[var(--dash-border)] mb-6 mt-auto">
                <div className="flex flex-col">
                  <span className="text-xs text-[var(--dash-text-muted)] font-medium uppercase tracking-wider">Produtos</span>
                  <span className="font-bold text-[var(--dash-text)] flex items-center gap-1.5 mt-1">
                    <Box size={16} className="text-primary" />
                    {catalog.productCount} {catalog.productCount === 1 ? 'item' : 'itens'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-auto">
                {catalog.isActive ? (
                  <Link 
                    href={catalog.isInherited ? "/dashboard/catalogo/bulk" : "/dashboard/catalogo"}
                    className="flex-1 py-3 px-4 bg-[var(--dash-border)] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-[var(--dash-text)] rounded-xl font-semibold text-sm transition-all text-center flex items-center justify-center gap-2"
                  >
                    <Settings size={16} /> 
                    {catalog.isInherited ? "Aceitar Produtos" : "Gerenciar"}
                  </Link>
                ) : (
                  <button
                    onClick={() => handleActivate(catalog.id)}
                    disabled={isActivating === catalog.id}
                    className="flex-1 py-3 px-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/25 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isActivating === catalog.id ? (
                      <RefreshCw size={18} className="animate-spin" />
                    ) : (
                      "Ativar este Catálogo"
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
