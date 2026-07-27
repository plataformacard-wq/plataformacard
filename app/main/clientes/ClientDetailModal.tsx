"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Building2, 
  Users, 
  Package, 
  Globe, 
  Calendar, 
  ShieldAlert, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Mail,
  RefreshCw,
  AlertTriangle,
  Edit2,
  Check
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { updateOrganizationPlan, updateOrganizationModel, getOrganizationStats, startShadowAccess, updateOrganizationInternalName } from "@/lib/admin-actions";
import { detectDowngradeConflicts, getPlanName, PLAN_LIMITS } from "@/lib/plans";

interface ClientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: any;
}

export default function ClientDetailModal({ isOpen, onClose, organization }: ClientDetailModalProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    userCount: 0,
    productCount: 0,
    categoryCount: 0,
    adminEmails: [] as string[],
    sellers: [] as any[],
    productsList: [] as any[]
  });
  const [currentPlan, setCurrentPlan] = useState(organization?.plan_id || '');
  const [businessModel, setBusinessModel] = useState(organization?.business_model || 'B2B');
  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [updatingModel, setUpdatingModel] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(organization?.internal_name || '');
  const [savingName, setSavingName] = useState(false);

  const [showSellers, setShowSellers] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  // Estado para o painel de confirmação de downgrade
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
  const [downgradeConflicts, setDowngradeConflicts] = useState<{resource: string; label: string; current: number; limit: number}[]>([]);

  // Sincronizar estado quando a organização mudar (abertura do modal)
  useEffect(() => {
    if (organization) {
      setCurrentPlan(organization.plan_id || '');
      setBusinessModel(organization.business_model || 'B2B');
    }
  }, [organization]);

  useEffect(() => {
    if (isOpen && organization?.id) {
      async function fetchDetails() {
        setLoading(true);
        try {
          // 1. Busca estatísticas via Server Action (Bypass RLS para Admin)
          const result = await getOrganizationStats(organization.id);

          // 2. Busca lista de vendedores para o drawer
          const { data: profiles } = await supabase
            .from("profiles")
            .select("full_name, role, slug")
            .eq("organization_id", organization.id);

          // 3. Busca lista de produtos (limitada para preview)
          const { data: products } = await supabase
            .from("products")
            .select("name, price, created_at")
            .eq("organization_id", organization.id)
            .is("deleted_at", null)
            .order("created_at", { ascending: false })
            .limit(10);

          if (result.success) {
            setStats({
              userCount: result.stats.sellers,
              productCount: result.stats.products,
              categoryCount: result.stats.categories,
              adminEmails: [],
              sellers: profiles?.filter(p => p.role === 'seller') || [],
              productsList: products || []
            });
          }
        } catch (err) {
          console.error("Erro ao buscar detalhes do cliente:", err);
        }
        setLoading(false);
      }
      fetchDetails();
    }
  }, [isOpen, organization?.id, supabase]);

  const handlePlanChange = async (newPlanId: string) => {
    if (!newPlanId || newPlanId === currentPlan) return;

    // Verifica se o downgrade causa conflitos de recursos
    const conflicts = detectDowngradeConflicts(newPlanId, {
      products: stats.productCount,
      sellers: stats.userCount,
    });

    if (conflicts.length > 0) {
      // Pausa a troca e exibe o painel de confirmação
      setPendingPlanId(newPlanId);
      setDowngradeConflicts(conflicts);
      return;
    }

    // Sem conflitos: aplica diretamente
    await applyPlanChange(newPlanId);
  };

  const applyPlanChange = async (planId: string) => {
    setUpdatingPlan(true);
    const result = await updateOrganizationPlan(organization.id, planId);
    if (result.success) {
      setCurrentPlan(planId);
    } else {
      alert("Erro ao atualizar plano: " + result.error);
    }
    setPendingPlanId(null);
    setDowngradeConflicts([]);
    setUpdatingPlan(false);
  };

  const cancelDowngrade = () => {
    setPendingPlanId(null);
    setDowngradeConflicts([]);
  };


  const handleModelToggle = async (newModel: 'B2B' | 'B2C' | 'CaaS' | 'ALL_SERVICE') => {
    if (newModel === businessModel || updatingModel) return;
    
    setUpdatingModel(true);
    try {
      const result = await updateOrganizationModel(organization.id, newModel);
      if (result.success) {
        setBusinessModel(newModel);
      } else {
        alert("Erro ao atualizar modelo: " + result.error);
      }
    } catch (err) {
      console.error("Erro na transição de modelo:", err);
    } finally {
      setUpdatingModel(false);
    }
  };

  const handleSaveInternalName = async () => {
    setSavingName(true);
    try {
      const result = await updateOrganizationInternalName(organization.id, newName.trim() === '' ? null : newName.trim());
      if (result.success) {
        window.location.reload();
      } else {
        alert("Erro ao salvar nome interno: " + result.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSavingName(false);
      setIsEditingName(false);
    }
  };



  // Lógica de Contrato
  const adherenceDate = organization?.created_at ? new Date(organization.created_at) : new Date();
  const expirationDate = new Date(adherenceDate);
  expirationDate.setFullYear(adherenceDate.getFullYear() + 1); // 12 meses padrão

  const now = new Date();
  const diffTime = expirationDate.getTime() - now.getTime();
  const monthsRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44)));

  const [showContract, setShowContract] = useState(false);

  if (!isOpen || !organization) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-[40px] shadow-2xl border border-[var(--dash-border)]"
          style={{ background: "var(--dash-surface)" }}
        >
          {/* Header Color Bar */}
          <div className={`h-3 w-full ${businessModel === 'B2B' ? 'bg-blue-500' : businessModel === 'CaaS' ? 'bg-purple-500' : 'bg-emerald-500'}`} />
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-[var(--dash-hover-bg)] transition-colors text-[var(--dash-text-muted)]"
          >
            <X size={20} />
          </button>

          <div className="p-8 sm:p-12 max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Top Info */}
            <div className="flex items-center gap-6 mb-10">
              <div className={`h-20 w-20 rounded-xl flex items-center justify-center text-white shadow-xl ${businessModel === 'B2B' ? 'bg-blue-600' : businessModel === 'CaaS' ? 'bg-purple-600' : 'bg-emerald-600'}`}>
                <Building2 size={40} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-md px-3 py-1 text-xl font-black outline-none focus:border-primary text-[var(--dash-text-primary)]"
                        placeholder="Nome interno (Alias)..."
                        autoFocus
                      />
                      <button 
                        onClick={handleSaveInternalName}
                        disabled={savingName}
                        className="bg-emerald-500/10 text-emerald-500 p-1.5 rounded-md hover:bg-emerald-500 hover:text-white transition-colors"
                      >
                        {savingName ? <RefreshCw size={18} className="animate-spin" /> : <Check size={18} />}
                      </button>
                      <button 
                        onClick={() => { setIsEditingName(false); setNewName(organization.internal_name || ''); }}
                        disabled={savingName}
                        className="bg-red-500/10 text-red-500 p-1.5 rounded-md hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-black" style={{ color: "var(--dash-text-primary)" }}>
                        {organization.internal_name || organization.name}
                      </h2>
                      <button 
                        onClick={() => setIsEditingName(true)}
                        className="text-[var(--dash-text-muted)] hover:text-primary transition-colors p-1"
                        title="Editar Nome Interno"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                {organization.internal_name && (
                  <h3 className="text-sm font-medium text-[var(--dash-text-muted)] mb-1">
                    Original: {organization.name}
                  </h3>
                )}
                <div className="flex flex-wrap items-center gap-4 mt-2">
                    <span className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)]">/{organization.slug}</span>
                    {organization.status === 'suspended' && (
                      <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest border border-amber-500/20">
                        CONTA SUSPENSA
                      </span>
                    )}
                    {organization.status === 'deactivated' && (
                      <span className="bg-zinc-500/10 text-zinc-500 px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest border border-zinc-500/20">
                        DESATIVADA
                      </span>
                    )}
                    {organization.deleted_at && (
                      <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest border border-red-500/20">
                        LIXEIRA
                      </span>
                    )}
                    
                    {/* AÇÕES DE COMANDO UNIFICADAS NO MODAL */}
                    <div className="flex flex-wrap items-center gap-4 py-2">
                       {/* Seletor B2B/B2C */}
                       <div className="flex p-1 bg-[var(--dash-bg)] rounded-lg border border-[var(--dash-border)] relative">
                        {updatingModel && (
                          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] rounded-lg z-10 flex items-center justify-center">
                            <RefreshCw size={10} className="animate-spin text-white" />
                          </div>
                        )}
                        <button 
                          onClick={() => handleModelToggle('B2B')}
                          className={`px-4 py-1.5 rounded-md text-[10px] font-black transition-all ${
                            businessModel === 'B2B' 
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                              : 'text-[var(--dash-text-muted)] hover:text-blue-500'
                          }`}
                        >
                          B2B
                        </button>
                        <button 
                          onClick={() => handleModelToggle('B2C')}
                          className={`px-4 py-1.5 rounded-md text-[10px] font-black transition-all ${
                            businessModel === 'B2C' 
                              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                              : 'text-[var(--dash-text-muted)] hover:text-emerald-500'
                          }`}
                        >
                          B2C
                        </button>
                        <button 
                          onClick={() => handleModelToggle('CaaS')}
                          className={`px-4 py-1.5 rounded-md text-[10px] font-black transition-all ${
                            businessModel === 'CaaS' 
                              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
                              : 'text-[var(--dash-text-muted)] hover:text-purple-500'
                          }`}
                        >
                          CaaS
                        </button>
                        <button 
                          onClick={() => handleModelToggle('ALL_SERVICE')}
                          className={`px-4 py-1.5 rounded-md text-[10px] font-black transition-all ${
                            businessModel === 'ALL_SERVICE' 
                              ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20' 
                              : 'text-[var(--dash-text-muted)] hover:text-zinc-600'
                          }`}
                        >
                          ALL SERVICE
                        </button>
                      </div>

                      {/* Seletor de Plano */}
                      <div className="relative group/plan">
                        <select 
                          value={currentPlan || ''}
                          disabled={updatingPlan}
                          onChange={(e) => handlePlanChange(e.target.value)}
                          className="appearance-none text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20 outline-none cursor-pointer hover:bg-amber-500/20 transition-all disabled:opacity-50"
                        >
                          <option value="">SELECIONE UM PLANO</option>
                          <option value="32c7b8a2-2bf7-43dd-b1a6-5706566fbfd0">PLANO: START</option>
                          <option value="6f3dfe4e-905c-486e-923f-2cfb6e5d3e62">PLANO: BASIC</option>
                          <option value="d35c09c2-51a0-4f38-b5d9-dcc3526e7d26">PLANO: ENTERPRISE</option>
                        </select>
                        {updatingPlan && (
                          <div className="absolute -right-5 top-1/2 -translate-y-1/2">
                            <RefreshCw size={10} className="animate-spin text-amber-600" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* PAINEL DE CONFIRMAÇÃO DE DOWNGRADE */}
                    {downgradeConflicts.length > 0 && pendingPlanId && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full mt-3 p-4 rounded-lg border border-amber-500/30 bg-amber-500/10"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-black text-amber-600 mb-1">
                              Conflito de Recursos — Downgrade para {getPlanName(pendingPlanId)}
                            </p>
                            <p className="text-[10px] text-amber-600/70 leading-relaxed">
                              O cliente possui mais recursos do que o novo plano permite. Os dados existentes <strong>não serão removidos</strong>, mas novos cadastros ficarão bloqueados.
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {downgradeConflicts.map((c) => (
                            <div key={c.resource} className="flex items-center gap-1.5 text-[10px] font-bold bg-red-500/10 border border-red-500/20 text-red-500 px-2.5 py-1 rounded-md">
                              <span>{c.label}:</span>
                              <span>{c.current} ativos</span>
                              <span className="opacity-50">/</span>
                              <span>limite {c.limit}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={cancelDowngrade}
                            className="flex-1 py-2 rounded-lg border border-[var(--dash-border)] text-[10px] font-black uppercase text-[var(--dash-text-secondary)] hover:bg-[var(--dash-hover-bg)] transition-all"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => pendingPlanId && applyPlanChange(pendingPlanId)}
                            disabled={updatingPlan}
                            className="flex-1 py-2 rounded-lg bg-amber-500 text-white text-[10px] font-black uppercase hover:bg-amber-600 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                          >
                            {updatingPlan ? <RefreshCw size={10} className="animate-spin" /> : null}
                            Confirmar Downgrade
                          </button>
                        </div>
                      </motion.div>
                    )}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              {/* 01 - Vendedores */}
              <div className="p-4 rounded-xl bg-[var(--dash-bg)] border border-[var(--dash-border)]">
                <Users className="text-blue-500 mb-2" size={18} />
                <p className="text-xl font-black" style={{ color: "var(--dash-text-primary)" }}>
                  {loading ? "..." : stats.userCount}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--dash-text-muted)]">Vendedores</p>
              </div>

              {/* 02 - Categorias */}
              <div className="p-4 rounded-xl bg-[var(--dash-bg)] border border-[var(--dash-border)]">
                <TrendingUp className="text-purple-500 mb-2" size={18} />
                <p className="text-xl font-black" style={{ color: "var(--dash-text-primary)" }}>
                  {loading ? "..." : stats.categoryCount}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--dash-text-muted)]">Categorias</p>
              </div>

              {/* 03 - Produtos */}
              <div className="p-4 rounded-xl bg-[var(--dash-bg)] border border-[var(--dash-border)]">
                <Package className="text-primary mb-2" size={18} />
                <p className="text-xl font-black" style={{ color: "var(--dash-text-primary)" }}>
                  {loading ? "..." : stats.productCount}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--dash-text-muted)]">Produtos</p>
              </div>

              {/* 04 - Saúde */}
              <div className="p-4 rounded-xl bg-[var(--dash-bg)] border border-[var(--dash-border)]">
                <ShieldAlert className="text-emerald-500 mb-2" size={18} />
                <p className="text-xl font-black text-emerald-500">Alta</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--dash-text-muted)]">Saúde</p>
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-4 mb-10">
               {/* URL / CARTÕES - VISÃO HÍBRIDA B2B/B2C */}
               <div className="flex flex-col rounded-lg border border-[var(--dash-border)] overflow-hidden">
                  <div 
                    onClick={() => businessModel === 'B2B' && setShowSellers(!showSellers)}
                    className={`flex items-center justify-between p-4 bg-[var(--dash-surface)] transition-all ${businessModel === 'B2B' ? 'cursor-pointer hover:bg-primary/5' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-[var(--dash-bg)] flex items-center justify-center text-[var(--dash-text-muted)]">
                        {businessModel === 'B2B' ? <Users size={16} /> : <Globe size={16} />}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-[var(--dash-text-muted)]">
                          {businessModel === 'B2B' ? 'Cartões da Equipe (Catálogos)' : 'URL do Catálogo Público'}
                        </p>
                        <p className="text-sm font-bold" style={{ color: "var(--dash-text-primary)" }}>
                          {businessModel === 'B2B' 
                            ? `${stats.sellers.length} vendedores ativos` 
                            : `www.anotameucontato.com.br/${organization.slug}`
                          }
                        </p>
                      </div>
                    </div>
                    {businessModel === 'B2B' ? (
                      <ChevronRight size={16} className={`text-[var(--dash-text-muted)] transition-transform ${showSellers ? 'rotate-90' : ''}`} />
                    ) : (
                      <a href={`/${organization.slug}`} target="_blank" className="text-[var(--dash-text-muted)] hover:text-primary transition-colors">
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>

                  {businessModel === 'B2B' && showSellers && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="bg-[var(--dash-bg)] border-t border-[var(--dash-border)]"
                    >
                      <div className="p-2 space-y-1">
                        {stats.sellers.length > 0 ? stats.sellers.map((seller, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 rounded-lg hover:bg-[var(--dash-surface)] transition-all border border-transparent hover:border-[var(--dash-border)] group">
                            <div className="min-w-0">
                              <p className="text-sm font-black mb-0.5" style={{ color: "var(--dash-text-primary)" }}>{seller.full_name}</p>
                              <p className="text-xs font-bold text-[var(--dash-text-muted)] truncate lowercase tracking-tight">
                                www.anotameucontato.com.br/{seller.slug}
                              </p>
                            </div>
                            <a 
                              href={`/${seller.slug}`} 
                              target="_blank" 
                              className="p-2.5 rounded-lg bg-[var(--dash-surface)] border border-[var(--dash-border)] text-[var(--dash-text-muted)] group-hover:text-primary transition-all shadow-sm group-hover:scale-110 active:scale-95"
                            >
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        )) : (
                          <div className="p-8 text-center">
                            <p className="text-xs text-[var(--dash-text-muted)] italic">Nenhum vendedor cadastrado ainda.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
               </div>

               {/* LISTA DE PRODUTOS */}
               <div className="flex flex-col rounded-lg border border-[var(--dash-border)] overflow-hidden">
                  <div 
                    onClick={() => setShowProducts(!showProducts)}
                    className="flex items-center justify-between p-4 bg-[var(--dash-surface)] cursor-pointer hover:bg-primary/5 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-[var(--dash-bg)] flex items-center justify-center text-[var(--dash-text-muted)]">
                        <Package size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-[var(--dash-text-muted)]">Produtos Cadastrados</p>
                        <p className="text-sm font-bold" style={{ color: "var(--dash-text-primary)" }}>
                          {stats.productCount} itens no inventário
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={16} className={`text-[var(--dash-text-muted)] transition-transform ${showProducts ? 'rotate-90' : ''}`} />
                  </div>

                  {showProducts && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="bg-[var(--dash-bg)] border-t border-[var(--dash-border)]"
                    >
                      <div className="p-2 space-y-1">
                        {stats.productsList.length > 0 ? stats.productsList.map((product, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 rounded-lg hover:bg-[var(--dash-surface)] transition-all border border-transparent hover:border-[var(--dash-border)] group">
                            <div className="min-w-0">
                              <p className="text-sm font-black mb-0.5" style={{ color: "var(--dash-text-primary)" }}>{product.name}</p>
                              <p className="text-[10px] font-bold text-[var(--dash-text-muted)]">
                                {product.price ? `R$ ${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Preço sob consulta'}
                              </p>
                            </div>
                            <div className="text-[9px] font-bold text-[var(--dash-text-muted)] bg-[var(--dash-surface)] px-2 py-1 rounded-md border border-[var(--dash-border)]">
                              {new Date(product.created_at).toLocaleDateString("pt-BR")}
                            </div>
                          </div>
                        )) : (
                          <div className="p-8 text-center">
                            <p className="text-xs text-[var(--dash-text-muted)] italic">Nenhum produto encontrado.</p>
                          </div>
                        )}
                        {stats.productCount > 10 && (
                          <div className="p-3 text-center">
                            <p className="text-[10px] text-[var(--dash-text-muted)]">Mostrando os últimos 10 produtos...</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
               </div>

               {/* CONTRATO */}
               <div 
                  onClick={() => setShowContract(!showContract)}
                  className="flex flex-col p-4 rounded-lg border border-[var(--dash-border)] group cursor-pointer hover:bg-primary/5 transition-all"
               >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-[var(--dash-bg)] flex items-center justify-center text-[var(--dash-text-muted)]">
                        <Calendar size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-[var(--dash-text-muted)]">Data de Adesão / Vigência</p>
                        <p className="text-sm font-bold" style={{ color: "var(--dash-text-primary)" }}>
                          {adherenceDate.toLocaleDateString("pt-BR", { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={16} className={`text-[var(--dash-text-muted)] transition-transform ${showContract ? 'rotate-90' : ''}`} />
                  </div>

                  {showContract && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="mt-4 pt-4 border-t border-[var(--dash-border)] grid grid-cols-2 gap-4"
                    >
                      <div>
                        <p className="text-[9px] font-bold uppercase text-[var(--dash-text-muted)]">Expiração do Contrato</p>
                        <p className="text-sm font-bold text-amber-500">
                          {expirationDate.toLocaleDateString("pt-BR", { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase text-[var(--dash-text-muted)]">Tempo Restante</p>
                        <p className="text-sm font-bold" style={{ color: "var(--dash-text-primary)" }}>
                          {monthsRemaining} meses operacionais
                        </p>
                      </div>
                    </motion.div>
                  )}
               </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={async () => {
                    const res = await startShadowAccess(organization.id);
                    if (res.success) {
                      window.location.href = "/dashboard";
                    }
                  }}
                  className="flex-1 py-4 rounded-lg bg-primary text-white font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <Globe size={18} />
                  ACESSAR DASHBOARD (SIMULAR)
                </button>

              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
