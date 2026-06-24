"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe, Building2, Check, ChevronDown, Search, ExternalLink, Plus, Package, HelpCircle, Users2, BarChart3, Copy, Edit3, Trash2, X, Save, Settings, MessageSquare, Percent, ToggleLeft, ToggleRight, Loader2, Sparkles, Tag, RotateCcw, AlertTriangle } from "lucide-react";
import { assignMasterCatalog, createMasterCatalog, deleteMasterCatalog, duplicateMasterCatalog, updateMasterCatalog, restoreMasterCatalog, permanentlyDeleteMasterCatalog, toggleCaasDetachmentPermission } from "./actions";
import CaasAnalytics from "./CaasAnalytics";
import { createClient } from "@/lib/supabase/client";
import BulkPromoModal from "@/components/dashboard/BulkPromoModal";
import CaasConfigModal from "./CaasConfigModal";
import CaasCatalogList from "./CaasCatalogList";
import CaasOrgDistribution from "./CaasOrgDistribution";

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
  allow_caas_detachment?: boolean;
  internal_name?: string | null;
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
  const [savingConfig, setSavingConfig] = useState(false);

  // Estados para Reajuste em Massa (BulkPromoModal)
  const [isBulkPromoOpen, setIsBulkPromoOpen] = useState(false);
  const [configCategories, setConfigCategories] = useState<any[]>([]);
  const [configProducts, setConfigProducts] = useState<any[]>([]);
  const [loadingConfigData, setLoadingConfigData] = useState(false);

  const supabaseClient = createClient();

  const filteredOrgs = organizations.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (org.internal_name && org.internal_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
    setIsConfigOpen(true);
  };

  const handleSaveConfigSettings = async (data: { name: string; description: string; type: "product" | "service" | "hybrid"; whatsappTemplate: string; hideCta: boolean; }) => {
    if (!configCatalogId) return;
    setSavingConfig(true);
    try {
      await updateMasterCatalog(
        configCatalogId,
        data.name,
        data.description,
        data.type,
        data.whatsappTemplate,
        data.hideCta
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
        router.push(`/main/caas/editor?catalogId=${res.id}`);
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

  const handleToggleDetachment = async (orgId: string, current: boolean) => {
    setLoadingId(`toggle-${orgId}`);
    try {
      await toggleCaasDetachmentPermission(orgId, !current);
    } catch (error) {
      alert("Erro ao alterar permissão.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Guia de Operação CaaS */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-purple-500/5 border border-purple-500/10 p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-6 w-6 rounded-full bg-purple-500 text-white text-[10px] font-black flex items-center justify-center">01</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">Criar Master</span>
          </div>
          <p className="text-xs font-bold leading-relaxed" style={{ color: "var(--dash-text-secondary)" }}>
            Use o formulário abaixo para criar um catálogo tipo <span className="text-purple-500">Plataforma</span>.
          </p>
        </div>

        <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-6 w-6 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center">02</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Abastecer Itens</span>
          </div>
          <p className="text-xs font-bold leading-relaxed" style={{ color: "var(--dash-text-secondary)" }}>
            Adicione categorias e produtos ao catálogo master (via Shadow Mode ou DB).
          </p>
        </div>

        <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-6 w-6 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center">03</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Vincular Org</span>
          </div>
          <p className="text-xs font-bold leading-relaxed" style={{ color: "var(--dash-text-secondary)" }}>
            No seletor da lista abaixo, escolha qual organização herdará o estoque Master.
          </p>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-xl">
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
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
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
                className="bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 ring-purple-500/20"
                style={{ color: "var(--dash-text-primary)" }}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
              <input 
                type="text" 
                placeholder="Descrição breve..."
                className="bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 ring-purple-500/20"
                style={{ color: "var(--dash-text-primary)" }}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              disabled={loadingId === "creating"}
              className="w-full bg-purple-500 text-white font-black uppercase tracking-widest py-4 rounded-lg hover:bg-purple-600 transition-all disabled:opacity-50"
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
          <CaasCatalogList 
            masterCatalogs={masterCatalogs}
            deletedCatalogs={deletedCatalogs}
            viewingAnalyticsId={viewingAnalyticsId}
            setViewingAnalyticsId={setViewingAnalyticsId}
            editingId={editingId}
            setEditingId={setEditingId}
            editName={editName}
            setEditName={setEditName}
            editDesc={editDesc}
            setEditDesc={setEditDesc}
            handleUpdate={handleUpdate}
            router={router}
            handleOpenConfig={handleOpenConfig}
            handleDuplicate={handleDuplicate}
            loadingId={loadingId}
            handleStartEdit={handleStartEdit}
            handleDelete={handleDelete}
            isTrashOpen={isTrashOpen}
            setIsTrashOpen={setIsTrashOpen}
            handleRestore={handleRestore}
            handlePermanentDelete={handlePermanentDelete}
          />

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
        <CaasOrgDistribution 
          filteredOrgs={filteredOrgs}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          loadingId={loadingId}
          masterCatalogs={masterCatalogs}
          handleAssign={handleAssign}
          handleToggleDetachment={handleToggleDetachment}
        />
      </div>

      {/* Modal de Configurações Avançadas (Estilo B2B/B2C) */}
      <CaasConfigModal
        isOpen={isConfigOpen && !!configCatalogId}
        onClose={() => setIsConfigOpen(false)}
        onSave={handleSaveConfigSettings}
        catalog={masterCatalogs.find(c => c.id === configCatalogId) || null}
        savingConfig={savingConfig}
        loadingConfigData={loadingConfigData}
        configCategoriesCount={configCategories.length}
        configProductsCount={configProducts.length}
        onOpenBulkPromo={() => setIsBulkPromoOpen(true)}
      />

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
