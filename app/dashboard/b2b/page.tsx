"use client";

import React, { useState, useEffect } from "react";
import { Users, Clock, FileSpreadsheet, Plus, ShieldCheck, Sparkles, RefreshCw } from "lucide-react";
import { B2bClientsList, B2bClient } from "@/components/dashboard/b2b/B2bClientsList";
import { B2bPendingRequestsList } from "@/components/dashboard/b2b/B2bPendingRequestsList";
import { B2bSheetsConfigCard } from "@/components/dashboard/b2b/B2bSheetsConfigCard";
import { B2bNewClientModal } from "@/components/dashboard/b2b/B2bNewClientModal";

export default function B2bDashboardPage() {
  const [clients, setClients] = useState<B2bClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"clients" | "pending" | "sheets">("clients");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [organizationId, setOrganizationId] = useState<string>("");
  const [slug, setSlug] = useState<string>("majmobilidade");

  const loadClients = async () => {
    setLoading(true);
    try {
      // Tentar recuperar slug ou org atual
      const currentSlug = slug || "majmobilidade";
      const res = await fetch(`/api/b2b/clients?slug=${currentSlug}`);
      const data = await res.json();
      if (data.success && data.clients) {
        setClients(data.clients);
        if (data.clients.length > 0) {
          setOrganizationId(data.clients[0].organization_id);
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

  const approvedCount = clients.filter(c => c.status === "approved").length;
  const pendingCount = clients.filter(c => c.status === "pending_approval").length;

  return (
    <div className="p-6 md:p-8 space-y-6 w-full">
      {/* Cabeçalho do Módulo Zeon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
              Plano Zeon B2B
            </span>
            <span className="text-xs text-[var(--dash-text-muted)]">• Maj Mobilidade</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--dash-text-primary)] mt-1">
            Gestão do Portal B2B & Tabelas de Preço
          </h1>
          <p className="text-sm text-[var(--dash-text-muted)] mt-0.5">
            Gerencie revendedores, atribua tabelas da planilha (Google Sheets) e envie acessos exclusivos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadClients}
            className="p-2.5 rounded-xl border border-[var(--dash-border-subtle)] bg-[var(--dash-surface)] text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)] transition-all"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Lojista (Outbound)</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-[var(--dash-border-subtle)] bg-[var(--dash-surface)] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--dash-text-primary)]">{approvedCount}</div>
            <div className="text-xs text-[var(--dash-text-muted)]">Clientes B2B Aprovados</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--dash-border-subtle)] bg-[var(--dash-surface)] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--dash-text-primary)]">{pendingCount}</div>
            <div className="text-xs text-[var(--dash-text-muted)]">Solicitações Pendentes (Inbound)</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--dash-border-subtle)] bg-[var(--dash-surface)] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[var(--dash-text-primary)]">Google Sheets</div>
            <div className="text-xs text-[var(--dash-text-muted)]">Tabelas X, Y, Z Ativas</div>
          </div>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="flex items-center gap-2 border-b border-[var(--dash-border-subtle)] pb-2">
        <button
          onClick={() => setActiveTab("clients")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === "clients"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Clientes Aprovados ({approvedCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 relative ${
            activeTab === "pending"
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Solicitações Pendentes ({pendingCount})</span>
          {pendingCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("sheets")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === "sheets"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Google Sheets</span>
        </button>
      </div>

      {/* Conteúdo da Aba Ativa */}
      {activeTab === "clients" && (
        <B2bClientsList clients={clients} slug={slug} onUpdateClient={handleUpdateClient} />
      )}

      {activeTab === "pending" && (
        <B2bPendingRequestsList clients={clients} slug={slug} onUpdateClient={handleUpdateClient} />
      )}

      {activeTab === "sheets" && (
        <B2bSheetsConfigCard organizationId={organizationId} />
      )}

      {/* Modal de Novo Cadastro Outbound */}
      <B2bNewClientModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        organizationId={organizationId}
        slug={slug}
        onClientCreated={loadClients}
      />
    </div>
  );
}
