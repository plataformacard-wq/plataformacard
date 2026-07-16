"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Plus, Store, Users, Link as LinkIcon, Settings2, Trash2, Shield, Info, Edit3, ShieldOff, ShieldCheck } from "lucide-react";
import { getFranchiseCatalogs, getFranchisees, togglePriceOverrides } from "./actions";
import Link from "next/link";

interface Catalog {
  id: string;
  name: string;
  description: string;
  created_at: string;
  deleted_at: string | null;
}

interface Franchisee {
  id: string;
  name: string;
  slug: string;
  whatsapp: string;
  business_model: string;
  linked_at: string;
  owner_name: string;
  owner_email: string;
  avatar_url: string;
}

export default function FranquiasManagerClient({ organizationId, orgSlug }: { organizationId: string, orgSlug: string }) {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [franchisees, setFranchisees] = useState<Record<string, Franchisee[]>>({});
  const [loading, setLoading] = useState(true);
  


  const [activeCatalogId, setActiveCatalogId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const cats = await getFranchiseCatalogs();
      setCatalogs(cats);
      
      const franksMap: Record<string, Franchisee[]> = {};
      for (const cat of cats) {
        const franks = await getFranchisees(cat.id);
        franksMap[cat.id] = franks;
      }
      setFranchisees(franksMap);
      
      if (cats.length > 0 && !activeCatalogId) {
        setActiveCatalogId(cats[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }


  function getInviteLink(catalogId: string) {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/cadastro?ref=${organizationId}&catalog=${catalogId}`;
    }
    return "";
  }

  function copyToClipboard(text: string, catalogId: string) {
    navigator.clipboard.writeText(text);
    setCopiedLink(catalogId);
    setTimeout(() => setCopiedLink(null), 2000);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {catalogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--dash-border)] bg-[var(--dash-surface)] p-12 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 mb-6">
            <Store size={32} />
          </div>
          <h2 className="text-xl font-black mb-2" style={{ color: "var(--dash-text-primary)" }}>Nenhum catálogo matriz encontrado</h2>
          <p className="text-sm max-w-md" style={{ color: "var(--dash-text-secondary)" }}>
            Você ainda não possui um catálogo matriz liberado. Acesse o Gerenciador de Catálogos para criar um.
          </p>
          <Link 
            href="/dashboard/catalogo/gerenciador"
            className="mt-6 flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            Ir para Gerenciador de Catálogos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Catalogs Sidebar */}
          <div className="col-span-1 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--dash-text-secondary)" }}>
              Seus Catálogos Matriz
            </h3>
            {catalogs.map(catalog => (
              <button
                key={catalog.id}
                onClick={() => setActiveCatalogId(catalog.id)}
                className={`w-full flex flex-col items-start rounded-lg border p-4 text-left transition-all ${
                  activeCatalogId === catalog.id 
                    ? "border-emerald-500/50 bg-emerald-500/5 ring-1 ring-emerald-500/50" 
                    : "border-[var(--dash-border)] bg-[var(--dash-surface)] hover:border-emerald-500/30 hover:bg-emerald-500/5"
                }`}
              >
                <div className="flex w-full items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Store size={16} className={activeCatalogId === catalog.id ? "text-emerald-500" : "text-[var(--dash-text-muted)]"} />
                    <span className="font-bold text-sm" style={{ color: "var(--dash-text-primary)" }}>{catalog.name}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--dash-surface-secondary)] text-[var(--dash-text-muted)] font-medium">
                    {franchisees[catalog.id]?.length || 0} franqueados
                  </span>
                </div>
                <p className="text-xs line-clamp-2 mt-1" style={{ color: "var(--dash-text-secondary)" }}>
                  {catalog.description || "Sem descrição."}
                </p>
              </button>
            ))}
          </div>

          {/* Catalog Details */}
          <div className="col-span-1 lg:col-span-2">
            {activeCatalogId && (
              <motion.div 
                key={activeCatalogId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] shadow-sm overflow-hidden"
              >
                {(() => {
                  const activeCat = catalogs.find(c => c.id === activeCatalogId);
                  const activeFranks = franchisees[activeCatalogId] || [];
                  const link = getInviteLink(activeCatalogId);

                  return activeCat && (
                    <>
                      <div className="p-6 md:p-8 border-b border-[var(--dash-border)]">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                          <div>
                            <h2 className="text-2xl font-black" style={{ color: "var(--dash-text-primary)" }}>{activeCat.name}</h2>
                            <p className="text-sm mt-2 max-w-xl" style={{ color: "var(--dash-text-secondary)" }}>{activeCat.description}</p>
                          </div>
                          
                          <div className="shrink-0 flex items-center justify-center h-16 w-16 rounded-lg bg-emerald-500/10 text-emerald-500">
                            <Store size={28} />
                          </div>
                        </div>

                        {/* Invite Link Section */}
                        <div className="mt-8 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <LinkIcon size={16} className="text-emerald-600" />
                            <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400">Link de Convite para Franqueados</h4>
                          </div>
                          <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mb-4">
                            Compartilhe este link com seus futuros franqueados. Ao se cadastrarem por ele, a loja deles será criada automaticamente vinculada a este catálogo.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 truncate rounded-lg border border-emerald-500/30 bg-[var(--dash-surface)] px-4 py-3 text-sm font-mono text-[var(--dash-text-primary)]">
                              {link}
                            </div>
                            <button
                              onClick={() => copyToClipboard(link, activeCat.id)}
                              className="shrink-0 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                            >
                              {copiedLink === activeCat.id ? <><Check size={16}/> Copiado!</> : <><Copy size={16}/> Copiar Link</>}
                            </button>
                          </div>
                        </div>

                      </div>

                      {/* Franchisees List */}
                      <div className="p-6 md:p-8 bg-[var(--dash-surface-secondary)]">
                        <div className="flex items-center gap-2 mb-6">
                          <Users size={18} className="text-[var(--dash-text-secondary)]" />
                          <h3 className="text-lg font-bold" style={{ color: "var(--dash-text-primary)" }}>Franqueados Ativos</h3>
                          <span className="ml-2 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-500">
                            {activeFranks.length}
                          </span>
                        </div>

                        {activeFranks.length === 0 ? (
                          <div className="rounded-lg border border-dashed border-[var(--dash-border)] p-8 text-center bg-[var(--dash-surface)]">
                            <Users size={32} className="mx-auto mb-3 text-[var(--dash-text-muted)]" />
                            <p className="text-sm font-bold" style={{ color: "var(--dash-text-primary)" }}>Nenhum franqueado ainda</p>
                            <p className="text-xs mt-1" style={{ color: "var(--dash-text-secondary)" }}>
                              Envie o link de convite acima para adicionar sua primeira franquia.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {activeFranks.map(frank => (
                              <div key={frank.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 transition hover:border-emerald-500/30">
                                <div className="flex items-center gap-4">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-emerald-500/10 text-emerald-600 font-bold">
                                    {frank.avatar_url ? <img src={frank.avatar_url} className="h-full w-full object-cover" /> : frank.name?.charAt(0)}
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold" style={{ color: "var(--dash-text-primary)" }}>{frank.name}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[10px] text-[var(--dash-text-muted)]">@{frank.slug}</span>
                                      <span className="text-[10px] text-[var(--dash-text-muted)]">•</span>
                                      <span className="text-[10px] text-[var(--dash-text-muted)]">{frank.owner_name}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 self-start sm:self-auto">
                                  <a 
                                    href={`/${frank.slug}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="rounded-md bg-[var(--dash-surface-secondary)] p-2 text-[var(--dash-text-secondary)] transition hover:bg-emerald-500/10 hover:text-emerald-500"
                                    title="Ver vitrine"
                                  >
                                    <ExternalLink size={16} />
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

const Check = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

const ExternalLink = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
);
