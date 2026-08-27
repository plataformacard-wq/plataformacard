"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Users, 
  Clock, 
  FileSpreadsheet, 
  Plus, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  Search,
  ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { B2bClientsList, B2bClient } from "@/components/dashboard/b2b/B2bClientsList";
import { B2bPendingRequestsList } from "@/components/dashboard/b2b/B2bPendingRequestsList";
import { B2bSheetsConfigCard } from "@/components/dashboard/b2b/B2bSheetsConfigCard";
import { B2bNewClientModal } from "@/components/dashboard/b2b/B2bNewClientModal";
import { createClient } from "@/lib/supabase/client";

export default function B2bDashboardPage() {
  const supabase = createClient();
  const [clients, setClients] = useState<B2bClient[]>([]);
  const [customTables, setCustomTables] = useState<{ key: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"clients" | "pending" | "sheets">("clients");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [organizationId, setOrganizationId] = useState<string>("");
  const [orgName, setOrgName] = useState<string>("Maj Mobilidade");
  const [slug, setSlug] = useState<string>("majmobilidade");

  const loadClients = async (targetSlug?: string) => {
    setLoading(true);
    try {
      let activeSlug = targetSlug || slug || "majmobilidade";
      let activeOrgId = organizationId;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("organization_id, role")
          .eq("user_id", user.id)
          .maybeSingle();

        const shadowOrgId = typeof document !== "undefined"
          ? document.cookie
              .split("; ")
              .find((row) => row.startsWith("shadow_org_id="))
              ?.split("=")[1]
          : undefined;

        const isSuperAdmin = profile?.role === "main_admin";
        const currentOrgId = isSuperAdmin && shadowOrgId ? shadowOrgId : profile?.organization_id;

        if (currentOrgId) {
          activeOrgId = currentOrgId;
          setOrganizationId(currentOrgId);
          const { data: org } = await supabase
            .from("organizations")
            .select("slug, name")
            .eq("id", currentOrgId)
            .maybeSingle();

          if (org?.slug) {
            activeSlug = org.slug;
            setSlug(org.slug);
          }
          if (org?.name) {
            setOrgName(org.name);
          }
        }
      }

      const res = await fetch(`/api/b2b/clients?slug=${activeSlug}`);
      const data = await res.json();
      if (data.success) {
        if (data.clients) {
          setClients(data.clients);
          if (data.clients.length > 0 && !activeOrgId) {
            setOrganizationId(data.clients[0].organization_id);
          }
        }
        if (data.customTables && data.customTables.length > 0) {
          setCustomTables(data.customTables);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar dados B2B:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleUpdateClient = async (id: string, updates: Partial<B2bClient>) => {
    try {
      const res = await fetch("/api/b2b/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates })
      });
      const data = await res.json();
      if (data.success) {
        setClients(prev => prev.map(c => c.id === id ? { ...c, ...data.client } : c));
      }
    } catch (err) {
      console.error("Erro ao atualizar cliente B2B:", err);
    }
  };

  const approvedClients = useMemo(() => clients.filter(c => c.status === "approved"), [clients]);
  const pendingClients = useMemo(() => clients.filter(c => c.status === "pending_approval"), [clients]);

  const filteredApprovedClients = useMemo(() => {
    if (!searchQuery.trim()) return approvedClients;
    const q = searchQuery.toLowerCase().trim();
    return approvedClients.filter(c => 
      c.company_name.toLowerCase().includes(q) ||
      (c.trade_name && c.trade_name.toLowerCase().includes(q)) ||
      c.cnpj_cpf.includes(q) ||
      c.phone_whatsapp.includes(q)
    );
  }, [approvedClients, searchQuery]);

  const filteredPendingClients = useMemo(() => {
    if (!searchQuery.trim()) return pendingClients;
    const q = searchQuery.toLowerCase().trim();
    return pendingClients.filter(c => 
      c.company_name.toLowerCase().includes(q) ||
      c.cnpj_cpf.includes(q) ||
      c.phone_whatsapp.includes(q)
    );
  }, [pendingClients, searchQuery]);

  const dynamicTableNames = useMemo(() => {
    if (customTables.length > 0) {
      return customTables.map(t => t.label).join(", ");
    }
    return "Tabelas de Atacado";
  }, [customTables]);

  return (
    <div className="p-6 md:p-8 space-y-6 w-full">
      
      {/* 1. Header do Módulo B2B */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={11} />
              <span>Plano Zeon B2B</span>
            </span>
            <span className="text-xs font-medium text-[var(--dash-text-muted)]">
              • {orgName}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--dash-text-primary)] tracking-tight">
            Portal B2B & Tabelas de Atacado
          </h1>
          <p className="text-xs sm:text-sm text-[var(--dash-text-secondary)] max-w-2xl">
            Gestão de lojistas autorizados, sincronização de preços por SKU e emissão de links de acesso.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => loadClients()}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface)] text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)] hover:border-emerald-500/30 transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-500" : ""}`} />
          </button>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all flex items-center gap-2 shadow-sm hover:shadow-emerald-500/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Lojista (Outbound)</span>
          </button>
        </div>
      </div>

      {/* 2. Grid de Métricas (KPI Cards com rounded-2xl) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Aprovados */}
        <div 
          onClick={() => setActiveTab("clients")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
            activeTab === "clients" 
              ? "border-emerald-500/40 bg-[var(--dash-surface)] shadow-sm ring-1 ring-emerald-500/20" 
              : "border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface)] hover:border-emerald-500/30 hover:shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
              <span>Ativos</span>
              <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[var(--dash-text-primary)] tracking-tight">
              {approvedClients.length}
            </div>
            <div className="text-xs text-[var(--dash-text-muted)] mt-0.5">
              Lojistas Homologados
            </div>
          </div>
        </div>

        {/* Card 2: Solicitações Inbound */}
        <div 
          onClick={() => setActiveTab("pending")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
            activeTab === "pending" 
              ? "border-amber-500/40 bg-[var(--dash-surface)] shadow-sm ring-1 ring-amber-500/20" 
              : "border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface)] hover:border-amber-500/30 hover:shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
            {pendingClients.length > 0 ? (
              <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-amber-500 text-slate-900 uppercase tracking-wider animate-pulse">
                Aguardando
              </span>
            ) : (
              <span className="text-[11px] font-medium text-[var(--dash-text-muted)]">
                Em dia
              </span>
            )}
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[var(--dash-text-primary)] tracking-tight">
              {pendingClients.length}
            </div>
            <div className="text-xs text-[var(--dash-text-muted)] mt-0.5">
              Solicitações Inbound
            </div>
          </div>
        </div>

        {/* Card 3: Google Sheets Sync */}
        <div 
          onClick={() => setActiveTab("sheets")}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
            activeTab === "sheets" 
              ? "border-cyan-500/40 bg-[var(--dash-surface)] shadow-sm ring-1 ring-cyan-500/20" 
              : "border-slate-200/80 dark:border-white/10 bg-[var(--dash-surface)] hover:border-cyan-500/30 hover:shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
              {customTables.length > 0 ? `${customTables.length} Tabelas` : "Sync Ativo"}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-sm font-bold text-[var(--dash-text-primary)] tracking-tight truncate max-w-[200px]" title={dynamicTableNames}>
              {dynamicTableNames}
            </div>
            <div className="text-xs text-[var(--dash-text-muted)] mt-0.5">
              Sincronização por SKU
            </div>
          </div>
        </div>
      </div>

      {/* 3. Barra de Abas e Busca */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        
        {/* Abas com rounded-xl */}
        <div className="p-1 rounded-xl bg-[var(--dash-surface-secondary)] border border-slate-200/80 dark:border-white/10 inline-flex items-center gap-1">
          <button
            onClick={() => setActiveTab("clients")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "clients"
                ? "bg-[var(--dash-surface)] text-[var(--dash-text-primary)] shadow-sm border border-slate-200/80 dark:border-white/10"
                : "text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)]"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-500" />
            <span>Lojistas Homologados</span>
            <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-emerald-500/10 text-emerald-500">
              {approvedClients.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "pending"
                ? "bg-[var(--dash-surface)] text-[var(--dash-text-primary)] shadow-sm border border-slate-200/80 dark:border-white/10"
                : "text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)]"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Solicitações Inbound</span>
            <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-amber-500/10 text-amber-400">
              {pendingClients.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("sheets")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "sheets"
                ? "bg-[var(--dash-surface)] text-[var(--dash-text-primary)] shadow-sm border border-slate-200/80 dark:border-white/10"
                : "text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)]"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
            <span>Google Sheets</span>
          </button>
        </div>

        {/* Input de Busca com rounded-xl */}
        {activeTab !== "sheets" && (
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-[var(--dash-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, CNPJ ou WhatsApp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[var(--dash-surface)] border border-slate-200/80 dark:border-white/10 text-[var(--dash-text-primary)] placeholder-[var(--dash-text-muted)] focus:outline-none focus:border-emerald-500/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"
              >
                Limpar
              </button>
            )}
          </div>
        )}
      </div>

      {/* 4. Conteúdo Renderizado da Aba */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className="space-y-4"
        >
          {activeTab === "clients" && (
            <B2bClientsList 
              clients={filteredApprovedClients} 
              slug={slug} 
              customTables={customTables}
              onUpdateClient={handleUpdateClient} 
            />
          )}

          {activeTab === "pending" && (
            <B2bPendingRequestsList 
              clients={filteredPendingClients} 
              slug={slug} 
              customTables={customTables}
              onUpdateClient={handleUpdateClient} 
            />
          )}

          {activeTab === "sheets" && (
            <B2bSheetsConfigCard 
              organizationId={organizationId} 
              onSyncSuccess={(newCustomTables) => {
                if (newCustomTables && newCustomTables.length > 0) {
                  setCustomTables(newCustomTables);
                }
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Modal de Novo Cadastro Outbound */}
      <B2bNewClientModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        organizationId={organizationId}
        slug={slug}
        customTables={customTables}
        onClientCreated={loadClients}
      />
    </div>
  );
}
