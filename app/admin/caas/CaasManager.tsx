"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe, Building2, Check, ChevronDown, Search, ExternalLink, Plus, Package, HelpCircle, Users2, BarChart3, Copy, Edit3, Trash2, X, Save, Settings, MessageSquare, Percent, ToggleLeft, ToggleRight, Loader2, Sparkles, Tag, RotateCcw, AlertTriangle } from "lucide-react";
import { assignMasterCatalog, createMasterCatalog, deleteMasterCatalog, duplicateMasterCatalog, updateMasterCatalog, restoreMasterCatalog, permanentlyDeleteMasterCatalog } from "./actions";
import CaasAnalytics from "./CaasAnalytics";
import { createClient } from "@/lib/supabase/client";
import BulkPromoModal from "@/components/dashboard/BulkPromoModal";

interface MasterCatalog {
  id: string;
  name: string;
  description: string | null;
  type?: "product" | "service" | "hybrid" | null;
  whatsapp_template?: string | null;
  hide_cta?: boolean | null;
  deleted_at?: string | null;
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
  deletedCatalogs: MasterCatalog[];
  organizations: Organization[];
}

export default function CaasManager({ masterCatalogs, deletedCatalogs, organizations }: CaasManagerProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [viewingAnalyticsId, setViewingAnalyticsId] = useState<string | null>(null);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  
  // Estados para Edição rápida (nome/descrição)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // Estados para Modal de Configurações Avançadas (B2B-like)
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configCatalogId, setConfigCatalogId] = useState<string | null>(null);
  const [configTab, setConfigTab] = useState<"geral" | "mensagem" | "reajustes">("geral");
  const [configName, setConfigName] = useState("");
  const [configDesc, setConfigDesc] = useState("");
  const [configType, setConfigType] = useState<"product" | "service" | "hybrid">("product");
  const [configWhatsappTemplate, setConfigWhatsappTemplate] = useState("");
  const [configHideCta, setConfigHideCta] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  // Estados para Reajuste em Massa (BulkPromoModal)
  const [isBulkPromoOpen, setIsBulkPromoOpen] = useState(false);
  const [configCategories, setConfigCategories] = useState<any[]>([]);
  const [configProducts, setConfigProducts] = useState<any[]>([]);
  const [loadingConfigData, setLoadingConfigData] = useState(false);

  const supabaseClient = createClient();

  const filteredOrgs = organizations.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    org.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Carrega categorias e produtos do catálogo master quando a aba de reajustes ou o BulkPromoModal é acionado
  useEffect(() => {
    if (!configCatalogId || !isConfigOpen) return;

    async function loadCatalogData() {
      setLoadingConfigData(true);
      try {
        const { data: cats } = await supabaseClient
          .from("categories")
          .select("id, name")
          .eq("catalog_id", configCatalogId)
          .order("sort_order", { ascending: true });

        setConfigCategories(cats || []);

        if (cats && cats.length > 0) {
          const catIds = cats.map(c => c.id);
          const { data: prods } = await supabaseClient
            .from("products")
            .select("id, name, price, compare_at_price, category_id, sku")
            .in("category_id", catIds)
            .eq("is_active", true)
            .is("deleted_at", null);
          setConfigProducts(prods || []);
        } else {
          setConfigProducts([]);
        }
      } catch (err) {
        console.error("Erro ao carregar dados adicionais do catálogo master:", err);
      } finally {
        setLoadingConfigData(false);
      }
    }

    void loadCatalogData();
  }, [configCatalogId, isConfigOpen]);

  const handleOpenConfig = (cat: MasterCatalog) => {
    setConfigCatalogId(cat.id);
    setConfigName(cat.name);
    setConfigDesc(cat.description || "");
    setConfigType(cat.type || "product");
    setConfigWhatsappTemplate(cat.whatsapp_template || "");
    setConfigHideCta(!!cat.hide_cta);
    setConfigTab("geral");
    setIsConfigOpen(true);
  };

  const handleSaveConfigSettings = async () => {
    if (!configCatalogId) return;
    setSavingConfig(true);
    try {
      await updateMasterCatalog(
        configCatalogId,
        configName,
        configDesc,
        configType,
        configWhatsappTemplate,
        configHideCta
      );
      setIsConfigOpen(false);
    } catch (err: any) {
      alert("Erro ao salvar configurações do catálogo: " + err.message);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleCreateMaster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    setLoadingId("creating");
    try {
      const res = await createMasterCatalog(newName, newDesc);
      setIsCreating(false);
      setNewName("");
      setNewDesc("");
      if (res && res.id) {
        router.push(`/admin/caas/editor?catalogId=${res.id}`);
      }
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

  const handleRestore = async (id: string) => {
    setLoadingId(id);
    try {
      await restoreMasterCatalog(id);
    } catch (error) {
      alert("Erro ao restaurar catálogo.");
    } finally {
      setLoadingId(null);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm("AVISO: Esta ação é permanente e excluirá DEFINITIVAMENTE o catálogo, suas categorias e todos os produtos associados de forma irrecuperável. Deseja continuar?")) return;
    setLoadingId(id);
    try {
      await permanentlyDeleteMasterCatalog(id);
      if (viewingAnalyticsId === id) setViewingAnalyticsId(null);
    } catch (error) {
      alert("Erro ao excluir catálogo permanentemente.");
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
      const original = masterCatalogs.find(c => c.id === editingId);
      await updateMasterCatalog(
        editingId, 
        editName, 
        editDesc, 
        original?.type || "product", 
        original?.whatsapp_template || "", 
        !!original?.hide_cta
      );
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
      const res = await assignMasterCatalog(orgId, catalogId);
      if (res && !res.success) {
        alert(res.error || "Erro ao atribuir catálogo.");
      } else {
        router.refresh();
      }
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
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm text-dash-text-primary">{cat.name}</p>
                              {cat.hide_cta && (
                                <span className="text-[8px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded-md uppercase">Vitrine Pura</span>
                              )}
                            </div>
                            {cat.description && <p className="text-[10px] text-dash-text-muted font-medium line-clamp-1">{cat.description}</p>}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => router.push(`/admin/caas/editor?catalogId=${cat.id}`)}
                            className="p-2 text-[var(--dash-text-muted)] hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                            title="Gerenciar Produtos do Catálogo"
                          >
                            <Package size={14} />
                          </button>
                          <button 
                            onClick={() => handleOpenConfig(cat)}
                            className="p-2 text-[var(--dash-text-muted)] hover:text-purple-500 hover:bg-purple-500/10 rounded-lg transition-all"
                            title="Configurações Avançadas (B2B/CaaS)"
                          >
                            <Settings size={14} />
                          </button>
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
                            title="Editar Nome"
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
                       className="p-4 rounded-2xl border bg-red-500/5 border-red-500/10 hover:border-red-500/20 transition-all flex items-center justify-between"
                     >
                       <div className="flex items-center gap-3 flex-1">
                         <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
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
                           className="p-2 text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all disabled:opacity-50"
                           title="Restaurar Catálogo"
                         >
                           <RotateCcw size={14} />
                         </button>
                         <button 
                           onClick={() => handlePermanentDelete(cat.id)}
                           disabled={loadingId === cat.id}
                           className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
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

      {/* Modal de Configurações Avançadas (Estilo B2B/B2C) */}
      {isConfigOpen && configCatalogId && (
        <div className="fixed inset-0 z-[8000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div 
            className="w-full max-w-4xl overflow-hidden rounded-[40px] border shadow-2xl flex flex-col max-h-[90vh]"
            style={{ 
              background: "var(--dash-surface)", 
              borderColor: "var(--dash-border)",
              color: "var(--dash-text-primary)"
            }}
          >
            {/* Header */}
            <div className="p-8 border-b flex items-center justify-between" style={{ borderColor: "var(--dash-border)" }}>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Settings size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">Configurações do Catálogo Master</h2>
                  <p className="text-xs text-[var(--dash-text-muted)] font-medium">Gerencie a identidade, CTAs e descontos do estoque mestre.</p>
                </div>
              </div>

              {/* Tabs Navigation (Estilo B2B) */}
              <div className="flex bg-[var(--dash-hover-bg)] p-1 rounded-xl border border-[var(--dash-border)]">
                <button
                  onClick={() => setConfigTab("geral")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${configTab === "geral" ? "bg-white text-black shadow-md" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
                >
                  Geral
                </button>
                <button
                  onClick={() => setConfigTab("mensagem")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${configTab === "mensagem" ? "bg-white text-black shadow-md" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
                >
                  Mensagem
                </button>
                <button
                  onClick={() => setConfigTab("reajustes")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${configTab === "reajustes" ? "bg-white text-black shadow-md" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
                >
                  Reajustes
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {configTab === "geral" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--dash-text-muted)]">Nome do Catálogo</label>
                      <input 
                        type="text" 
                        value={configName}
                        onChange={(e) => setConfigName(e.target.value)}
                        className="bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 ring-purple-500/20"
                        style={{ color: "var(--dash-text-primary)" }}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--dash-text-muted)]">Descrição (SEO)</label>
                      <input 
                        type="text" 
                        value={configDesc}
                        onChange={(e) => setConfigDesc(e.target.value)}
                        className="bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 ring-purple-500/20"
                        style={{ color: "var(--dash-text-primary)" }}
                      />
                    </div>
                  </div>

                  {/* Tipo de Catálogo */}
                  <div className="space-y-3 pt-4 border-t border-[var(--dash-border)]">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--dash-text-muted)] flex items-center gap-2">
                      <Sparkles size={12} className="text-purple-500" /> Tipo de Catálogo
                    </label>
                    <div className="flex p-1.5 rounded-[20px] bg-[var(--dash-hover-bg)] border border-[var(--dash-border)]">
                      <button
                        onClick={() => setConfigType("product")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${configType === "product" ? "bg-white text-black shadow-sm" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
                      >
                        <Package size={14} /> Produto
                      </button>
                      <button
                        onClick={() => setConfigType("service")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${configType === "service" ? "bg-white text-black shadow-sm" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
                      >
                        <Settings size={14} /> Serviço
                      </button>
                      <button
                        onClick={() => setConfigType("hybrid")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${configType === "hybrid" ? "bg-white text-black shadow-sm" : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"}`}
                      >
                        <Sparkles size={14} /> Híbrido
                      </button>
                    </div>
                  </div>

                  {/* Toggle Habilitar CTA */}
                  <div className="pt-6 border-t border-[var(--dash-border)] flex items-center justify-between bg-purple-500/5 border border-purple-500/10 p-5 rounded-2xl">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--dash-text-primary)]">Habilitar Botões de WhatsApp (CTA)</h4>
                      <p className="text-xs text-[var(--dash-text-muted)] mt-1 max-w-lg">
                        Se ativado, exibe os botões de pedido direto no WhatsApp. Desative para transformar o catálogo em uma vitrine puramente de consulta visual.
                      </p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setConfigHideCta(!configHideCta)}
                      className={`text-purple-500 hover:scale-105 active:scale-95 transition-all cursor-pointer`}
                    >
                      {configHideCta ? (
                        <ToggleLeft size={44} className="text-zinc-500" />
                      ) : (
                        <ToggleRight size={44} className="text-purple-500" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {configTab === "mensagem" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--dash-text-muted)] flex items-center gap-2">
                      <MessageSquare size={14} className="text-purple-500" /> Modelo de Mensagem (WhatsApp template)
                    </label>
                  </div>
                  <textarea
                    value={configWhatsappTemplate}
                    onChange={(e) => setConfigWhatsappTemplate(e.target.value)}
                    rows={6}
                    className="w-full p-6 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-[24px] focus:ring-2 focus:ring-purple-500/20 outline-none transition-all resize-none leading-relaxed font-medium text-sm"
                    placeholder="Ex: Olá! Vi o item {nome} no valor de {preco} e gostaria de fazer o pedido..."
                  />
                  
                  {/* Tags Rápidas */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {['nome', 'preco', 'sku', 'link', 'tipo'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setConfigWhatsappTemplate(prev => prev + `{${tag}}`)}
                        className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all border border-white/10 active:scale-90"
                      >
                        {`{${tag}}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {configTab === "reajustes" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="bg-purple-500/5 border border-purple-500/10 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-1 text-center md:text-left">
                      <h4 className="text-lg font-bold text-[var(--dash-text-primary)]">Reajustes e Promoções em Massa</h4>
                      <p className="text-xs text-[var(--dash-text-muted)] max-w-md mt-1 leading-relaxed">
                        Defina descontos (promoções de/por) ou acréscimos (markups) aplicados instantaneamente em categorias ou produtos específicos do catálogo master.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsBulkPromoOpen(true)}
                      className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white text-xs font-black uppercase tracking-widest px-6 py-4 rounded-xl shadow-lg transition-all"
                    >
                      <Percent size={14} />
                      Configurar Reajuste
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[var(--dash-bg)] border border-[var(--dash-border)] p-4 rounded-2xl text-center">
                      <span className="text-[10px] font-bold text-[var(--dash-text-muted)] uppercase tracking-wider">Categorias</span>
                      <p className="text-2xl font-black text-purple-500 mt-1">
                        {loadingConfigData ? "..." : configCategories.length}
                      </p>
                    </div>
                    <div className="bg-[var(--dash-bg)] border border-[var(--dash-border)] p-4 rounded-2xl text-center">
                      <span className="text-[10px] font-bold text-[var(--dash-text-muted)] uppercase tracking-wider">Produtos Ativos</span>
                      <p className="text-2xl font-black text-emerald-500 mt-1">
                        {loadingConfigData ? "..." : configProducts.length}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t flex items-center justify-between" style={{ borderColor: "var(--dash-border)" }}>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-[var(--dash-text-secondary)] hover:bg-[var(--dash-hover-bg)] transition-colors"
                disabled={savingConfig}
              >
                Fechar
              </button>
              
              <button
                onClick={handleSaveConfigSettings}
                disabled={savingConfig}
                className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white text-xs font-black uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-lg transition-all"
              >
                {savingConfig ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reajustes em Massa Integrado */}
      {isBulkPromoOpen && configCatalogId && (
        <BulkPromoModal 
          isOpen={isBulkPromoOpen}
          onClose={() => setIsBulkPromoOpen(false)}
          onSuccess={() => {
            // Recarrega contadores do catálogo
            setConfigCatalogId(null);
            setTimeout(() => setConfigCatalogId(configCatalogId), 50);
          }}
          catalogId={configCatalogId}
          orgId="" // orgId não é relevante para a RPC de ajuste em lote direta no catálogo master
          categories={configCategories}
          products={configProducts}
        />
      )}
    </div>
  );
}
