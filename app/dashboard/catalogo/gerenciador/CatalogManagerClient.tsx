"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Globe, Box, Copy, Settings, Check, RefreshCw, Plus } from "lucide-react";
import { setActiveCatalog, createCatalog } from "./actions";
import { syncBlingStock } from "../actions/bling";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

type CatalogInfo = {
  id: string;
  masterCatalogId: string;
  name: string;
  description: string;
  logoUrl?: string;
  type: string;
  isInherited: boolean;
  isOwnedMaster?: boolean;
  isActive: boolean;
  productCount: number;
  createdAt: string;
};

export default function CatalogManagerClient({ 
  catalogs, 
  orgId, 
  profileId,
  isAllService,
  initialHasBlingConnection = false
}: { 
  catalogs: CatalogInfo[], 
  orgId: string, 
  profileId: string,
  isAllService?: boolean,
  initialHasBlingConnection?: boolean
}) {
  const router = useRouter();
  const [localCatalogs, setLocalCatalogs] = useState(catalogs);
  const [isActivating, setIsActivating] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [isPlatform, setIsPlatform] = useState(false);
  const [creating, setCreating] = useState(false);
  const [isSyncingBling, setIsSyncingBling] = useState(false);
  const [hasBlingConnection, setHasBlingConnection] = useState(initialHasBlingConnection);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    setLocalCatalogs(catalogs);
  }, [catalogs]);

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

  const handleCreateCatalog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    setCreating(true);
    try {
      await createCatalog(newCatName, newCatDesc, isPlatform);
      setIsCreateModalOpen(false);
      setNewCatName("");
      setNewCatDesc("");
      setIsPlatform(false);
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleSyncBling = async () => {
    setIsSyncingBling(true);
    try {
      const res = await syncBlingStock(orgId);
      if (res.success) {
        alert(`Sincronização concluída! Produtos atualizados: ${res.updatedCount}. Não encontrados/esgotados: ${res.notFoundCount}.`);
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
    if (!confirm("Tem certeza que deseja desconectar o Bling? O estoque não será mais sincronizado automaticamente.")) return;
    
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
    <div className="flex flex-col gap-6">
      {/* Box de Integração com o Bling */}
      <div className="rounded-[24px] p-6 border shadow-sm mb-2" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
              Integração Bling (Estoque)
              {hasBlingConnection ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600 border border-emerald-200">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  Conectado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-600 border border-red-200">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                  Não Conectado
                </span>
              )}
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--dash-text-secondary)" }}>
              Sincronize automaticamente seu estoque de produtos com base no SKU através da API Oficial do Bling (V3).
            </p>
          </div>
          <div className="shrink-0 flex gap-2">
            {hasBlingConnection ? (
              <>
                <button
                  type="button"
                  onClick={handleDisconnectBling}
                  disabled={isDisconnecting || isSyncingBling}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  {isDisconnecting ? "Desconectando..." : "Desconectar Conta"}
                </button>
                <button
                  onClick={handleSyncBling}
                  disabled={isSyncingBling}
                  className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-600 shadow-sm disabled:opacity-50"
                >
                  {isSyncingBling ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                  {isSyncingBling ? "Sincronizando..." : "Sincronizar Estoque"}
                </button>
              </>
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
          <div className="mt-6 pt-4 border-t" style={{ borderColor: "var(--dash-border)" }}>
            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-800/30">
              <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">Webhooks (Tempo Real)</h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">
                Para que o estoque seja atualizado automaticamente assim que houver uma movimentação no Bling, copie a URL abaixo e cadastre-a na aba "Webhooks" do seu aplicativo no painel do Bling, selecionando o evento "Estoque" (stock).
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/bling?orgId=${orgId}`}
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-blue-200 bg-white dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-300 outline-none select-all font-mono"
                />
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/api/webhooks/bling?orgId=${orgId}`);
                    alert('URL do Webhook copiada com sucesso!');
                  }}
                  className="shrink-0 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-sm"
                >
                  Copiar URL
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90 shadow-sm"
        >
          <Plus size={18} /> Criar Catálogo
        </button>
      </div>
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
              {(!isAllService || catalog.isInherited) && (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold shadow-sm whitespace-nowrap ${
                  catalog.isInherited
                    ? "bg-purple-600 text-white dark:bg-purple-500"
                    : catalog.isOwnedMaster
                    ? "bg-blue-600 text-white dark:bg-blue-500"
                    : "bg-slate-700 text-white dark:bg-slate-300 dark:text-slate-900"
                }`}>
                  {catalog.isInherited ? "Catálogo Franqueado" : catalog.isOwnedMaster ? "Catálogo Matriz" : "Catálogo Próprio"}
                </span>
              )}
              
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
                    {catalog.name} {catalog.isOwnedMaster && <span className="font-normal text-sm opacity-80">(Matriz)</span>}
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
                  <>
                    <Link 
                      href={catalog.isInherited ? "/dashboard/catalogo/bulk" : "/dashboard/catalogo"}
                      className="flex-1 py-3 px-4 bg-[var(--dash-border)] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-[var(--dash-text)] rounded-xl font-semibold text-sm transition-all text-center flex items-center justify-center gap-2"
                    >
                      <Settings size={16} /> 
                      {catalog.isInherited ? "Aceitar Produtos" : "Gerenciar"}
                    </Link>
                    {catalog.isOwnedMaster && (
                      <Link 
                        href="/dashboard/franquias"
                        className="flex-1 py-3 px-4 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl font-semibold text-sm transition-all text-center flex items-center justify-center gap-2"
                      >
                        Liberar p/ Franqueados
                      </Link>
                    )}
                  </>
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

      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl bg-[var(--dash-surface)] border-[var(--dash-border)]"
            >
              <div className="p-6 border-b border-[var(--dash-border)] flex items-center justify-between">
                <h3 className="text-lg font-bold text-[var(--dash-text-primary)]">Novo Catálogo</h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)] transition">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <form onSubmit={handleCreateCatalog} className="p-6 space-y-5">
                <div>
                  <label className="mb-1 block text-sm font-bold uppercase tracking-wider text-[var(--dash-text-secondary)]">
                    Nome do Catálogo
                  </label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Ex: Catálogo Matriz Nordeste"
                    className="w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-bg)] text-[var(--dash-text-primary)] px-4 py-3 text-sm outline-none transition focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold uppercase tracking-wider text-[var(--dash-text-secondary)]">
                    Descrição (Opcional)
                  </label>
                  <textarea
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="Descrição interna para identificar a finalidade deste catálogo."
                    rows={3}
                    className="w-full resize-none rounded-xl border border-[var(--dash-border)] bg-[var(--dash-bg)] text-[var(--dash-text-primary)] px-4 py-3 text-sm outline-none transition focus:border-primary"
                  />
                </div>

                {isAllService && (
                  <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface-secondary)]">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--dash-text-primary)]">Liberar para Franqueados?</h4>
                      <p className="text-[10px] mt-0.5 text-[var(--dash-text-secondary)]">
                        Cria o catálogo como Matriz.
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center shrink-0">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={isPlatform}
                        onChange={(e) => setIsPlatform(e.target.checked)}
                      />
                      <div className="peer h-6 w-11 rounded-full bg-zinc-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-focus:outline-none dark:bg-zinc-700"></div>
                    </label>
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 rounded-xl border border-[var(--dash-border)] text-[var(--dash-text-primary)] py-3 text-sm font-bold transition hover:bg-[var(--dash-hover-bg)]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newCatName}
                    className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-white transition hover:bg-primary/90 disabled:opacity-50"
                  >
                    {creating ? "Criando..." : "Criar Catálogo"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
