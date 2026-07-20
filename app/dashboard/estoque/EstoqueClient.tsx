"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Package, RefreshCw, Settings, ChevronDown, Check, Layout, Sparkles } from "lucide-react";
import EstoqueManualTab from "@/components/dashboard/estoque/EstoqueManualTab";
import StockIntelligenceSection from "@/components/dashboard/StockIntelligenceSection";
import { syncBlingStock } from "@/app/dashboard/catalogo/actions/bling";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  image_url: string | null;
  stock_quantity: number | null;
  is_in_stock: boolean;
  category_id: string | null;
  categories?: { name: string } | null;
}

interface Category {
  id: string;
  name: string;
}

interface EstoqueClientProps {
  products: Product[];
  categories: Category[];
  orgId: string;
  hasBlingConnection: boolean;
}

export default function EstoqueClient({
  products,
  categories,
  orgId,
  hasBlingConnection: initialHasBlingConnection,
}: EstoqueClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"manual" | "bling">("manual");
  
  // Estados do Bling (copiados e adaptados de CatalogManagerClient)
  const [hasBlingConnection, setHasBlingConnection] = useState(initialHasBlingConnection);
  const [isSyncingBling, setIsSyncingBling] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleSyncBling = async () => {
    setIsSyncingBling(true);
    try {
      const res = await syncBlingStock(orgId);
      if (res.success) {
        alert(
          `Sincronização concluída! Produtos atualizados: ${res.updatedCount}. Não encontrados/esgotados: ${res.notFoundCount}.`
        );
        router.refresh();
      } else {
        alert("Erro: " + res.message);
      }
    } catch (err: any) {
      alert("Erro ao conectar com a sincronização.");
    } finally {
      setIsSyncingBling(false);
    }
  };

  const handleDisconnectBling = async () => {
    if (
      !confirm(
        "Tem certeza que deseja desconectar o Bling? O estoque não será mais sincronizado automaticamente."
      )
    )
      return;

    setIsDisconnecting(true);
    try {
      const res = await fetch("/api/auth/bling/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setHasBlingConnection(false);
        alert("Bling desconectado com sucesso.");
        router.refresh();
      } else {
        alert("Erro ao desconectar: " + (data.error || "Desconhecido"));
      }
    } catch (err) {
      alert("Erro de conexão ao tentar desconectar o Bling.");
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header Premium com Abas */}
      <div className="relative overflow-hidden bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[27px] p-6 md:p-8 shadow-sm group/header">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none opacity-50 transition-opacity group-hover/header:opacity-100" />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-[var(--dash-text-primary)]">
              Controle de Estoque
            </h1>
            <p className="text-[var(--dash-text-muted)] font-medium max-w-xl">
              Gerencie a quantidade disponível dos seus produtos manualmente ou via integração automática.
            </p>
          </div>

          <div className="flex bg-[var(--dash-hover-bg)] p-1.5 rounded-[27px] border border-[var(--dash-border)] overflow-x-auto shrink-0 self-start lg:self-center">
            <button
              onClick={() => setActiveTab("manual")}
              className={`flex shrink-0 items-center gap-2 px-6 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${
                activeTab === "manual"
                  ? "bg-[var(--dash-surface)] text-[var(--dash-text-primary)] shadow-lg"
                  : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"
              }`}
            >
              <Layout size={16} />
              Estoque Manual
            </button>
            <button
              onClick={() => setActiveTab("bling")}
              className={`flex shrink-0 items-center gap-2 px-6 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${
                activeTab === "bling"
                  ? "bg-[var(--dash-surface)] text-[var(--dash-text-primary)] shadow-lg"
                  : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)]"
              }`}
            >
              <Sparkles size={16} />
              Sincronização Bling
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "manual" ? (
          <motion.div
            key="manual"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <EstoqueManualTab products={products} categories={categories} hasBlingConnection={hasBlingConnection} />
          </motion.div>
        ) : (
          <motion.div
            key="bling"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Box de Integração com o Bling */}
            <div
              className="rounded-[27px] p-6 border shadow-sm"
              style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2
                    className="text-base font-semibold flex items-center gap-2"
                    style={{ color: "var(--dash-text-primary)" }}
                  >
                    Integração Bling (Estoque)
                    {hasBlingConnection ? (
                      <span className="inline-flex items-center gap-1.5 rounded bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        Conectado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-600 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                        Não Conectado
                      </span>
                    )}
                  </h2>
                  <p className="text-sm mt-1" style={{ color: "var(--dash-text-secondary)" }}>
                    {hasBlingConnection
                      ? "Seu estoque é atualizado automaticamente em tempo real através da API do Bling."
                      : "Sincronize automaticamente seu estoque de produtos com base no SKU através da API Oficial do Bling (V3)."}
                  </p>
                </div>
                <div className="shrink-0 flex gap-2">
                  {hasBlingConnection ? (
                    <button
                      type="button"
                      onClick={handleDisconnectBling}
                      disabled={isDisconnecting || isSyncingBling}
                      className="rounded-lg px-4 py-2 text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                      {isDisconnecting ? "Desconectando..." : "Desconectar Conta"}
                    </button>
                  ) : (
                    <a
                      href={`/api/auth/bling/login?orgId=${orgId}`}
                      className="inline-block rounded-lg px-6 py-2.5 text-sm font-bold bg-emerald-500 text-white transition-colors hover:bg-emerald-600"
                    >
                      Conectar ao Bling
                    </a>
                  )}
                </div>
              </div>
              {hasBlingConnection && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--dash-border)" }}>
                  <button
                    onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                    className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                  >
                    <Settings size={16} />
                    Configurações Avançadas e Webhooks
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  <AnimatePresence>
                    {isAdvancedOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 flex flex-col gap-4">
                          <div className="p-5 rounded-[27px] border border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/5">
                            <h3 className="text-sm font-bold text-blue-800 dark:text-blue-400 mb-1">
                              Webhooks (Tempo Real)
                            </h3>
                            <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mb-4 leading-relaxed">
                              Para que o estoque seja atualizado automaticamente assim que houver uma
                              movimentação no Bling, cadastre a URL abaixo na aba &ldquo;Webhooks&rdquo; selecionando
                              o evento &ldquo;Estoque&rdquo; (stock).
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <input
                                type="text"
                                readOnly
                                value={`${
                                  typeof window !== "undefined" ? window.location.origin : ""
                                }/api/webhooks/bling?orgId=${orgId}`}
                                className="flex-1 text-xs px-3 py-2.5 rounded-lg border border-blue-500/20 bg-[var(--dash-surface)] dark:bg-black/40 text-blue-900 dark:text-blue-200 outline-none select-all font-mono shadow-sm"
                              />
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    `${window.location.origin}/api/webhooks/bling?orgId=${orgId}`
                                  );
                                  alert("URL do Webhook copiada com sucesso!");
                                }}
                                className="shrink-0 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
                              >
                                Copiar URL
                              </button>
                            </div>
                          </div>

                          <div className="p-5 rounded-[27px] border border-[var(--dash-border)] bg-[var(--dash-bg)]">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                              <div>
                                <h3 className="text-sm font-bold text-[var(--dash-text-primary)]">
                                  Sincronização Manual (Forçada)
                                </h3>
                                <p className="text-xs text-[var(--dash-text-secondary)] mt-1">
                                  Utilize apenas se os webhooks falharem e você precisar forçar a
                                  leitura de todo o estoque do Bling.
                                </p>
                              </div>
                              <button
                                onClick={handleSyncBling}
                                disabled={isSyncingBling}
                                className="shrink-0 flex items-center justify-center gap-2 rounded-lg bg-[var(--dash-surface)] border border-[var(--dash-border)] px-5 py-2.5 text-sm font-semibold text-[var(--dash-text-primary)] transition-colors hover:bg-black/5 dark:hover:bg-[var(--dash-surface)]/5 shadow-sm disabled:opacity-50"
                              >
                                {isSyncingBling ? (
                                  <RefreshCw size={16} className="animate-spin" />
                                ) : (
                                  <RefreshCw size={16} />
                                )}
                                {isSyncingBling ? "Sincronizando..." : "Forçar Sincronização"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Componente Analítico de Estoque */}
            <StockIntelligenceSection
              activeOrgId={orgId}
              hasBlingConnection={hasBlingConnection}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
