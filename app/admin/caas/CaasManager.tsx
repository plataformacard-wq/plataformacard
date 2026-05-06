"use client";

import { useState } from "react";
import { Globe, Building2, Check, ChevronDown, Search, ExternalLink, Plus, Package, HelpCircle, ArrowRightCircle, Target, Users2, BarChart3, Copy, Edit3, Trash2, X, Save } from "lucide-react";
import { assignMasterCatalog, createMasterCatalog, deleteMasterCatalog, duplicateMasterCatalog, updateMasterCatalog } from "./actions";
import CaasAnalytics from "./CaasAnalytics";

interface MasterCatalog {
  id: string;
  name: string;
  description: string | null;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  business_model: string;
  assigned_catalog_id?: string | null;
}

interface CaasManagerProps {
  masterCatalogs: MasterCatalog[];
  organizations: Organization[];
}

export default function CaasManager({ masterCatalogs, organizations }: CaasManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [viewingAnalyticsId, setViewingAnalyticsId] = useState<string | null>(null);
  
  // Estados para Edição
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const filteredOrgs = organizations.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    org.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateMaster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    setLoadingId("creating");
    try {
      await createMasterCatalog(newName, newDesc);
      setIsCreating(false);
      setNewName("");
      setNewDesc("");
    } catch (error) {
      alert("Erro ao criar catálogo.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    setLoadingId(id);
    try {
      await duplicateMasterCatalog(id);
    } catch (error) {
      alert("Erro ao duplicar catálogo.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este catálogo master?")) return;
    setLoadingId(id);
    try {
      await deleteMasterCatalog(id);
      if (viewingAnalyticsId === id) setViewingAnalyticsId(null);
    } catch (error) {
      alert("Erro ao excluir catálogo.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleStartEdit = (cat: MasterCatalog) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDesc(cat.description || "");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setLoadingId(editingId);
    try {
      await updateMasterCatalog(editingId, editName, editDesc);
      setEditingId(null);
    } catch (error) {
      alert("Erro ao atualizar catálogo.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleAssign = async (orgId: string, catalogId: string | null) => {
    setLoadingId(orgId);
    try {
      await assignMasterCatalog(orgId, catalogId);
    } catch (error) {
      console.error(error);
      alert("Erro ao atribuir catálogo.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Guia de Operação CaaS */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-purple-500/5 border border-purple-500/10 p-5 rounded-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-6 w-6 rounded-full bg-purple-500 text-white text-[10px] font-black flex items-center justify-center">01</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">Criar Master</span>
          </div>
          <p className="text-xs font-bold leading-relaxed" style={{ color: "var(--dash-text-secondary)" }}>
            Use o formulário abaixo para criar um catálogo tipo <span className="text-purple-500">Plataforma</span>.
          </p>
        </div>

        <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-6 w-6 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center">02</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Abastecer Itens</span>
          </div>
          <p className="text-xs font-bold leading-relaxed" style={{ color: "var(--dash-text-secondary)" }}>
            Adicione categorias e produtos ao catálogo master (via Shadow Mode ou DB).
          </p>
        </div>

        <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-6 w-6 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center">03</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Vincular Org</span>
          </div>
          <p className="text-xs font-bold leading-relaxed" style={{ color: "var(--dash-text-secondary)" }}>
            No seletor da lista abaixo, escolha qual organização herdará o estoque Master.
          </p>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-6 w-6 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">04</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Rastrear Leads</span>
          </div>
          <p className="text-xs font-bold leading-relaxed" style={{ color: "var(--dash-text-secondary)" }}>
            A vitrine pública será atualizada e os leads do WhatsApp levarão a tag da Org.
          </p>
        </div>
      </div>

      {/* Seção de Criação de Catálogo Master */}
      <div className="bg-[var(--dash-surface)] p-6 rounded-[32px] border border-[var(--dash-border)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Plus size={20} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: "var(--dash-text-primary)" }}>Novo Catálogo Master</h2>
          </div>
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className="text-xs font-black uppercase tracking-widest text-purple-500 hover:opacity-80"
          >
            {isCreating ? "Cancelar" : "Criar Catálogo"}
          </button>
        </div>

        {isCreating && (
          <form onSubmit={handleCreateMaster} className="space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="grid gap-4 md:grid-cols-2">
              <input 
                type="text" 
                placeholder="Nome do Catálogo (Ex: MAJ Mobilidade)"
                className="bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 ring-purple-500/20"
                style={{ color: "var(--dash-text-primary)" }}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
              <input 
                type="text" 
                placeholder="Descrição breve..."
                className="bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 ring-purple-500/20"
                style={{ color: "var(--dash-text-primary)" }}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              disabled={loadingId === "creating"}
              className="w-full bg-purple-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-purple-600 transition-all disabled:opacity-50"
            >
              {loadingId === "creating" ? "Criando..." : "Salvar Catálogo Master"}
            </button>
          </form>
        )}
      </div>

      {/* Seção Principal: BI e Gestão */}
      <div className="flex flex-col gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Coluna 1: Lista de Catálogos Master (Ativos) */}
          <div className="space-y-4">
             <div className="flex items-center gap-3 px-2">
                <Package className="text-purple-500" size={20} />
                <h2 className="text-xl font-bold" style={{ color: "var(--dash-text-primary)" }}>Catálogos Master</h2>
             </div>
             <div className="grid gap-3">
                {masterCatalogs.map(cat => (
                  <div 
                    key={cat.id} 
                    className={`p-4 rounded-2xl border transition-all ${
                      viewingAnalyticsId === cat.id 
                        ? "bg-purple-500/10 border-purple-500 shadow-lg" 
                        : "bg-[var(--dash-surface)] border-[var(--dash-border)] hover:border-purple-500/30"
                    }`}
                  >
                    {editingId === cat.id ? (
                      <form onSubmit={handleUpdate} className="space-y-3">
                        <input 
                          type="text" 
                          className="w-full bg-dash-bg border border-border rounded-lg px-3 py-1.5 text-xs font-bold text-dash-text-primary"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          autoFocus
                        />
                        <input 
                          type="text" 
                          className="w-full bg-dash-bg border border-border rounded-lg px-3 py-1.5 text-[10px] font-bold text-dash-text-secondary"
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                        />
                        <div className="flex gap-2">
                           <button type="submit" className="flex-1 bg-purple-500 text-white text-[10px] font-black py-1.5 rounded-lg flex items-center justify-center gap-1">
                              <Save size={12} /> SALVAR
                           </button>
                           <button type="button" onClick={() => setEditingId(null)} className="px-3 bg-zinc-500/10 text-zinc-500 rounded-lg">
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
                          <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                            <Globe size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-dash-text-primary">{cat.name}</p>
                            {cat.description && <p className="text-[10px] text-dash-text-muted font-medium line-clamp-1">{cat.description}</p>}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleDuplicate(cat.id)}
                            disabled={loadingId === cat.id}
                            className="p-2 text-[var(--dash-text-muted)] hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all disabled:opacity-50"
                            title="Duplicar"
                          >
                            <Copy size={14} />
                          </button>
                          <button 
                            onClick={() => handleStartEdit(cat)}
                            className="p-2 text-[var(--dash-text-muted)] hover:text-purple-500 hover:bg-purple-500/10 rounded-lg transition-all"
                            title="Editar"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(cat.id)}
                            disabled={loadingId === cat.id}
                            className="p-2 text-[var(--dash-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
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
          </div>

          {/* Coluna 2: Analytics do Selecionado */}
          <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] p-6 rounded-[32px] min-h-[350px] flex flex-col">
             {viewingAnalyticsId ? (
               <CaasAnalytics 
                 catalogId={viewingAnalyticsId} 
                 catalogName={masterCatalogs.find(c => c.id === viewingAnalyticsId)?.name || ""} 
               />
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                  <BarChart3 size={48} className="mb-4 text-[var(--dash-text-muted)]" />
                  <p className="font-bold text-[var(--dash-text-muted)]">Selecione um catálogo master<br/>para ver o desempenho de leads.</p>
               </div>
             )}
          </div>
        </div>

        {/* Atribuição de Catálogos (Tabela) */}
        <div className="space-y-6 pt-10 border-t border-[var(--dash-border)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "var(--dash-text-primary)" }}>Distribuição por Empresa</h2>
              <p className="text-xs font-bold" style={{ color: "var(--dash-text-secondary)" }}>Vincule as organizações aos catálogos master para herança de estoque.</p>
            </div>
            
            <div className="flex items-center gap-4 bg-[var(--dash-surface)] px-4 py-2.5 rounded-2xl border border-[var(--dash-border)]">
              <Search className="text-[var(--dash-text-muted)]" size={18} />
              <input 
                type="text" 
                placeholder="Buscar organização..."
                className="bg-transparent border-none outline-none w-48 text-xs font-bold"
                style={{ color: "var(--dash-text-primary)" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4">
            {filteredOrgs.map(org => {
              return (
                <div 
                  key={org.id}
                  className="bg-[var(--dash-surface)] border border-[var(--dash-border)] p-6 rounded-[24px] flex items-center justify-between group hover:border-purple-500/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
                        {org.name}
                        {org.business_model === "CaaS" && (
                          <span className="text-[10px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-full">CaaS</span>
                        )}
                      </h3>
                      <p className="text-xs font-medium" style={{ color: "var(--dash-text-secondary)" }}>
                        /{org.slug}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Seletor de Catálogo Master */}
                    <div className="relative group/select">
                      <select 
                        disabled={loadingId === org.id}
                        className="appearance-none bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-xl px-4 py-2.5 pr-10 text-xs font-bold focus:outline-none focus:ring-2 ring-purple-500/20 disabled:opacity-50 transition-all"
                        style={{ color: "var(--dash-text-primary)" }}
                        value={org.assigned_catalog_id || ""}
                        onChange={(e) => handleAssign(org.id, e.target.value || null)}
                      >
                        <option value="">Nenhum Catálogo Master</option>
                        {masterCatalogs.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            Master: {cat.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--dash-text-muted)]" size={14} />
                    </div>

                    {/* Link para Visualização */}
                    <a 
                      href={`/${org.slug}/catalogo`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-10 w-10 rounded-xl bg-[var(--dash-bg)] border border-[var(--dash-border)] flex items-center justify-center text-[var(--dash-text-secondary)] hover:text-purple-500 hover:border-purple-500/50 transition-all"
                      title="Ver Vitrine"
                    >
                      <ExternalLink size={18} />
                    </a>
                  </div>
                </div>
              );
            })}
            {filteredOrgs.length === 0 && (
              <div className="py-20 text-center opacity-30">
                <Users2 className="mx-auto mb-4" size={48} />
                <p className="font-bold">Nenhuma organização encontrada.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
