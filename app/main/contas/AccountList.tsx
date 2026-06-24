"use client";

import { useState } from "react";
import { Search, ShieldAlert, Ban, Trash2, RotateCcw, AlertTriangle, Edit2, Check, X } from "lucide-react";
import { suspendOrganization, deactivateOrganization, reactivateOrganization, softDeleteOrganization, hardDeleteOrganization, updateOrganizationInternalName } from "@/lib/admin-actions";

interface AccountListProps {
  organizations: any[];
}

export default function AccountList({ organizations }: AccountListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState("");

  // Mapeamento visual e texto do status
  const getStatusInfo = (org: any) => {
    // Legacy support case (se a DB ainda não atualizou a coluna completamente)
    const isLegacySuspended = !org.status && org.deleted_at;
    const isTrash = !!org.deleted_at;

    if (isTrash) {
      return { label: "LIXEIRA", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" };
    }
    if (org.status === 'suspended' || isLegacySuspended) {
      return { label: "SUSPENSA", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" };
    }
    if (org.status === 'deactivated') {
      return { label: "DESATIVADA", color: "text-zinc-500", bg: "bg-zinc-500/10", border: "border-zinc-500/20" };
    }
    return { label: "ATIVA", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
  };

  const filteredOrgs = organizations.filter(org => {
    const searchMatch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        org.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!searchMatch) return false;

    const isTrash = !!org.deleted_at;
    const isSuspended = org.status === 'suspended' || (!org.status && isTrash);
    const isDeactivated = org.status === 'deactivated';
    const isActive = org.status === 'active' || (!org.status && !isTrash);

    if (filterStatus === "active") return isActive && !isTrash;
    if (filterStatus === "suspended") return isSuspended && !isTrash;
    if (filterStatus === "deactivated") return isDeactivated && !isTrash;
    if (filterStatus === "trash") return isTrash;

    return true; // all
  });

  const handleAction = async (actionFn: any, orgId: string, confirmMessage: string) => {
    if (!confirm(confirmMessage)) return;
    
    setLoadingAction(orgId);
    try {
      const result = await actionFn(orgId);
      if (result.success) {
        window.location.reload();
      } else {
        alert("Erro na operação: " + result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Erro crítico.");
    } finally {
      setLoadingAction(null);
    }
  };

  const startRename = (org: any) => {
    setEditingOrgId(org.id);
    setEditNameValue(org.internal_name || "");
  };

  const handleSaveRename = async (orgId: string) => {
    setLoadingAction(orgId);
    try {
      const result = await updateOrganizationInternalName(orgId, editNameValue.trim() === '' ? null : editNameValue.trim());
      if (result.success) {
        window.location.reload();
      } else {
        alert("Erro ao renomear: " + result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Erro crítico.");
    } finally {
      setLoadingAction(null);
      setEditingOrgId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-text-muted)]" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome ou slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-lg outline-none focus:border-primary/50 text-sm"
            style={{ color: "var(--dash-text-primary)" }}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "Todas" },
            { id: "active", label: "Ativas" },
            { id: "suspended", label: "Suspensas" },
            { id: "deactivated", label: "Desativadas" },
            { id: "trash", label: "Lixeira" }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filterStatus === f.id
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-[var(--dash-bg)] text-[var(--dash-text-muted)] border border-[var(--dash-border)] hover:border-primary/50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Contas */}
      <div className="overflow-x-auto rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--dash-bg)] text-[10px] uppercase font-black tracking-widest text-[var(--dash-text-muted)]">
            <tr>
              <th className="px-6 py-4">Empresa / Slug</th>
              <th className="px-6 py-4">Adesão</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--dash-border)]">
            {filteredOrgs.map((org) => {
              const statusInfo = getStatusInfo(org);
              const isLoading = loadingAction === org.id;

              return (
                <tr key={org.id} className="hover:bg-primary/5 transition-colors group">
                  <td className="px-6 py-4">
                    {editingOrgId === org.id ? (
                      <div className="flex items-center gap-2 mb-2">
                        <input 
                          type="text"
                          value={editNameValue}
                          onChange={(e) => setEditNameValue(e.target.value)}
                          className="w-full bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-md px-2 py-1 text-sm font-bold outline-none focus:border-primary text-[var(--dash-text-primary)]"
                          placeholder="Nome interno..."
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(org.id)}
                        />
                        <button 
                          onClick={() => handleSaveRename(org.id)}
                          className="bg-emerald-500/10 text-emerald-500 p-1.5 rounded-md hover:bg-emerald-500 hover:text-white transition-colors flex-shrink-0"
                          disabled={isLoading}
                        >
                          <Check size={14} />
                        </button>
                        <button 
                          onClick={() => setEditingOrgId(null)}
                          className="bg-red-500/10 text-red-500 p-1.5 rounded-md hover:bg-red-500 hover:text-white transition-colors flex-shrink-0"
                          disabled={isLoading}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="font-bold text-[var(--dash-text-primary)] text-base">{org.internal_name || org.name}</p>
                        {org.internal_name && (
                          <p className="text-xs font-medium text-[var(--dash-text-muted)] mb-1">
                            Original: {org.name}
                          </p>
                        )}
                      </>
                    )}
                    <p className="text-[10px] font-black uppercase text-[var(--dash-text-muted)]">/{org.slug}</p>
                  </td>
                  <td className="px-6 py-4 text-[var(--dash-text-muted)] text-xs font-medium">
                    {new Date(org.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    {isLoading ? (
                      <span className="text-[10px] text-[var(--dash-text-muted)] italic mr-4">Processando...</span>
                    ) : (
                      <div className="flex justify-end gap-2">
                        {/* AÇÕES DE RESTAURAÇÃO / LIXEIRA */}
                        {org.deleted_at ? (
                          <>
                            <button 
                              title="Restaurar da Lixeira"
                              onClick={() => handleAction(reactivateOrganization, org.id, "Deseja restaurar esta conta da lixeira para o status Ativa?")}
                              className="p-2 text-[var(--dash-text-muted)] hover:text-emerald-500 bg-[var(--dash-bg)] rounded-lg hover:border-emerald-500/50 border border-transparent transition-all"
                            >
                              <RotateCcw size={16} />
                            </button>
                            <button 
                              title="Excluir Permanentemente"
                              onClick={() => handleAction(hardDeleteOrganization, org.id, "ATENÇÃO! Esta ação apagará permanentemente a conta do banco de dados e não pode ser desfeita. Confirmar?")}
                              className="p-2 text-red-500 bg-red-500/10 rounded-lg hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                            >
                              <AlertTriangle size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            {/* AÇÕES NORMAIS */}
                            <button 
                              title="Renomear Internamente (Alias)"
                              onClick={() => startRename(org)}
                              className="p-2 text-[var(--dash-text-muted)] hover:text-primary bg-[var(--dash-bg)] rounded-lg hover:border-primary/50 border border-transparent transition-all mr-2"
                            >
                              <Edit2 size={16} />
                            </button>

                            {org.status !== 'active' && org.status && (
                              <button 
                                title="Reativar Conta"
                                onClick={() => handleAction(reactivateOrganization, org.id, "Deseja reativar esta conta?")}
                                className="p-2 text-[var(--dash-text-muted)] hover:text-emerald-500 bg-[var(--dash-bg)] rounded-lg hover:border-emerald-500/50 border border-transparent transition-all"
                              >
                                <RotateCcw size={16} />
                              </button>
                            )}

                            {org.status !== 'suspended' && (
                              <button 
                                title="Suspender (Inadimplência)"
                                onClick={() => handleAction(suspendOrganization, org.id, "Deseja suspender a conta por inadimplência?")}
                                className="p-2 text-[var(--dash-text-muted)] hover:text-amber-500 bg-[var(--dash-bg)] rounded-lg hover:border-amber-500/50 border border-transparent transition-all"
                              >
                                <ShieldAlert size={16} />
                              </button>
                            )}

                            {org.status !== 'deactivated' && (
                              <button 
                                title="Desativar (Churn/Cancelamento)"
                                onClick={() => handleAction(deactivateOrganization, org.id, "Deseja desativar a conta por cancelamento voluntário?")}
                                className="p-2 text-[var(--dash-text-muted)] hover:text-zinc-500 bg-[var(--dash-bg)] rounded-lg hover:border-zinc-500/50 border border-transparent transition-all"
                              >
                                <Ban size={16} />
                              </button>
                            )}

                            <button 
                              title="Mover para Lixeira"
                              onClick={() => handleAction(softDeleteOrganization, org.id, "Deseja mover a conta para a lixeira? Ela entrará na carência de 24 meses para exclusão definitiva.")}
                              className="p-2 text-[var(--dash-text-muted)] hover:text-red-500 bg-[var(--dash-bg)] rounded-lg hover:border-red-500/50 border border-transparent transition-all ml-2"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            
            {filteredOrgs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-[var(--dash-text-muted)] text-sm italic">
                  Nenhuma conta encontrada com esses filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
