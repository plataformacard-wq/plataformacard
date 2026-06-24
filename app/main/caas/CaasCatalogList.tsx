"use client";

import { Package, Globe, Copy, Edit3, Trash2, X, Save, Settings, BarChart3, ChevronDown, RotateCcw, AlertTriangle } from "lucide-react";
import { FormEvent } from "react";

interface MasterCatalog {
  id: string;
  name: string;
  description: string | null;
  type?: "product" | "service" | "hybrid" | null;
  whatsapp_template?: string | null;
  hide_cta?: boolean | null;
  deleted_at?: string | null;
}

interface CaasCatalogListProps {
  masterCatalogs: MasterCatalog[];
  deletedCatalogs: MasterCatalog[];
  viewingAnalyticsId: string | null;
  setViewingAnalyticsId: (id: string | null) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  editName: string;
  setEditName: (name: string) => void;
  editDesc: string;
  setEditDesc: (desc: string) => void;
  handleUpdate: (e: FormEvent) => Promise<void>;
  router: any;
  handleOpenConfig: (cat: MasterCatalog) => void;
  handleDuplicate: (id: string) => Promise<void>;
  loadingId: string | null;
  handleStartEdit: (cat: MasterCatalog) => void;
  handleDelete: (id: string) => Promise<void>;
  isTrashOpen: boolean;
  setIsTrashOpen: (isOpen: boolean) => void;
  handleRestore: (id: string) => Promise<void>;
  handlePermanentDelete: (id: string) => Promise<void>;
}

export default function CaasCatalogList({
  masterCatalogs,
  deletedCatalogs,
  viewingAnalyticsId,
  setViewingAnalyticsId,
  editingId,
  setEditingId,
  editName,
  setEditName,
  editDesc,
  setEditDesc,
  handleUpdate,
  router,
  handleOpenConfig,
  handleDuplicate,
  loadingId,
  handleStartEdit,
  handleDelete,
  isTrashOpen,
  setIsTrashOpen,
  handleRestore,
  handlePermanentDelete
}: CaasCatalogListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-2">
        <Package className="text-purple-500" size={20} />
        <h2 className="text-xl font-bold" style={{ color: "var(--dash-text-primary)" }}>Catálogos Master</h2>
      </div>
      <div className="grid gap-3">
        {masterCatalogs.map(cat => (
          <div 
            key={cat.id} 
            className={`p-4 rounded-lg border transition-all ${
              viewingAnalyticsId === cat.id 
                ? "bg-purple-500/10 border-purple-500 shadow-lg" 
                : "bg-[var(--dash-surface)] border-[var(--dash-border)] hover:border-purple-500/30"
            }`}
          >
            {editingId === cat.id ? (
              <form onSubmit={handleUpdate} className="space-y-3">
                <input 
                  type="text" 
                  className="w-full bg-dash-bg border border-border rounded-md px-3 py-1.5 text-xs font-bold text-dash-text-primary"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                />
                <input 
                  type="text" 
                  className="w-full bg-dash-bg border border-border rounded-md px-3 py-1.5 text-[10px] font-bold text-dash-text-secondary"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                />
                <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-purple-500 text-white text-[10px] font-black py-1.5 rounded-md flex items-center justify-center gap-1">
                      <Save size={12} /> SALVAR
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className="px-3 bg-zinc-500/10 text-zinc-500 rounded-md">
                      <X size={12} />
                    </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => setViewingAnalyticsId(viewingAnalyticsId === cat.id ? null : cat.id)}
                >
                  <div className="h-8 w-8 rounded-md bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <Globe size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-dash-text-primary">{cat.name}</p>
                      {cat.hide_cta && (
                        <span className="text-[8px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded-sm uppercase">Vitrine Pura</span>
                      )}
                    </div>
                    {cat.description && <p className="text-[10px] text-dash-text-muted font-medium line-clamp-1">{cat.description}</p>}
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => router.push(`/main/caas/editor?catalogId=${cat.id}`)}
                    className="p-2 text-[var(--dash-text-muted)] hover:text-emerald-500 hover:bg-emerald-500/10 rounded-md transition-all"
                    title="Gerenciar Produtos do Catálogo"
                  >
                    <Package size={14} />
                  </button>
                  <button 
                    onClick={() => handleOpenConfig(cat)}
                    className="p-2 text-[var(--dash-text-muted)] hover:text-purple-500 hover:bg-purple-500/10 rounded-md transition-all"
                    title="Configurações Avançadas (B2B/CaaS)"
                  >
                    <Settings size={14} />
                  </button>
                  <button 
                    onClick={() => handleDuplicate(cat.id)}
                    disabled={loadingId === cat.id}
                    className="p-2 text-[var(--dash-text-muted)] hover:text-blue-500 hover:bg-blue-500/10 rounded-md transition-all disabled:opacity-50"
                    title="Duplicar"
                  >
                    <Copy size={14} />
                  </button>
                  <button 
                    onClick={() => handleStartEdit(cat)}
                    className="p-2 text-[var(--dash-text-muted)] hover:text-purple-500 hover:bg-purple-500/10 rounded-md transition-all"
                    title="Editar Nome"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(cat.id)}
                    disabled={loadingId === cat.id}
                    className="p-2 text-[var(--dash-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all disabled:opacity-50"
                    title="Excluir"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="w-[1px] h-4 bg-[var(--dash-border)] mx-1" />
                  <BarChart3 size={16} className={viewingAnalyticsId === cat.id ? "text-purple-500" : "text-[var(--dash-text-muted)]"} />
                </div>
              </div>
            )}
          </div>
        ))}
        {masterCatalogs.length === 0 && (
          <p className="text-xs px-2" style={{ color: "var(--dash-text-muted)" }}>Nenhum catálogo master criado ainda.</p>
        )}
      </div>

      {/* Lixeira (Recycle Bin) */}
      <div className="pt-4 border-t border-[var(--dash-border)]">
        <button
          type="button"
          onClick={() => setIsTrashOpen(!isTrashOpen)}
          className="flex items-center justify-between w-full px-2 py-2 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-red-500 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Trash2 size={14} className={deletedCatalogs.length > 0 ? "text-red-500" : "text-zinc-500"} />
            <span>Lixeira ({deletedCatalogs.length})</span>
          </div>
          <ChevronDown 
            size={14} 
            className={`transform transition-transform duration-200 ${isTrashOpen ? "rotate-180" : ""}`} 
          />
        </button>

        {isTrashOpen && (
          <div className="mt-3 grid gap-3 animate-in fade-in slide-in-from-top-2">
            {deletedCatalogs.map(cat => (
              <div 
                key={cat.id} 
                className="p-4 rounded-lg border bg-red-500/5 border-red-500/10 hover:border-red-500/20 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-8 w-8 rounded-md bg-red-500/10 flex items-center justify-center text-red-500">
                    <Globe size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-dash-text-primary">{cat.name}</p>
                    {cat.deleted_at && (
                      <p className="text-[9px] text-zinc-500 font-medium">
                        Deletado em: {new Date(cat.deleted_at).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleRestore(cat.id)}
                    disabled={loadingId === cat.id}
                    className="p-2 text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-md transition-all disabled:opacity-50"
                    title="Restaurar Catálogo"
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button 
                    onClick={() => handlePermanentDelete(cat.id)}
                    disabled={loadingId === cat.id}
                    className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all disabled:opacity-50"
                    title="Excluir Definitivamente"
                  >
                    <AlertTriangle size={14} />
                  </button>
                </div>
              </div>
            ))}
            {deletedCatalogs.length === 0 && (
              <p className="text-xs px-2 text-zinc-500 italic">A lixeira está vazia.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
