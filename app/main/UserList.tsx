"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface UserListProps {
  profiles: any[];
}

export default function UserList({ profiles: initialProfiles }: UserListProps) {
  const supabase = createClient();
  const [profiles, setProfiles] = useState(initialProfiles);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function toggleBusinessModel(profileId: string, orgId: string, currentModel: string) {
    if (!orgId) return;
    
    setLoadingId(profileId);
    const newModel = currentModel === "B2C" ? "B2B" : "B2C";
    
    try {
      // 1. Atualizar organização
      const { error: orgError } = await supabase
        .from("organizations")
        .update({ business_model: newModel })
        .eq("id", orgId);

      if (orgError) throw orgError;

      // 2. Atualizar role do perfil para garantir sincronia
      const newRole = newModel === "B2C" ? "b2c_admin" : "b2b_admin";
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", profileId);

      if (profileError) throw profileError;

      // Atualiza o estado local
      setProfiles(prev => prev.map(p => {
        if (p.id === profileId) {
          return {
            ...p,
            role: newRole,
            organizations: {
              ...p.organizations,
              business_model: newModel
            }
          };
        }
        return p;
      }));
      
      console.log(`Sucesso: ${profileId} movido para ${newModel} (${newRole})`);
      
      // Forçar recarregamento para garantir que tudo (incluindo permissões de cache) seja atualizado
      window.location.reload();
    } catch (err: any) {
      console.error("Erro detalhado ao atualizar:", err);
      alert(`Erro ao atualizar: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setLoadingId(null);
    }
  }

  async function authorizeOnboarding(profileId: string) {
    setLoadingId(profileId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: "authorized" })
        .eq("id", profileId);

      if (error) throw error;

      setProfiles(prev => prev.map(p => {
        if (p.id === profileId) {
          return { ...p, role: "authorized" };
        }
        return p;
      }));
    } catch (err: any) {
      alert(`Erro ao autorizar: ${err.message}`);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-xs uppercase" style={{ background: "var(--dash-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-muted)" }}>
          <tr>
            <th className="px-6 py-3 font-medium">Nome / Empresa</th>
            <th className="px-6 py-3 font-medium">Slug</th>
            <th className="px-6 py-3 font-medium">Modelo (B2B/B2C)</th>
            <th className="px-6 py-3 font-medium">Cargo Atual</th>
            <th className="px-6 py-3 font-medium">Data</th>
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: "var(--dash-border)" }}>
          {profiles?.map((p) => {
            const org = p.organizations;
            const currentModel = org?.business_model || "B2B";
            
            return (
              <tr key={p.id} className="hover:bg-[var(--dash-hover-bg)] transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium" style={{ color: "var(--dash-text-primary)" }}>{p.full_name || "Sem Nome"}</p>
                  <p className="text-[10px] uppercase font-bold tracking-tighter" style={{ color: "var(--dash-text-muted)" }}>
                    {org?.name || "Empresa Individual"}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <a href={`/${p.slug}`} target="_blank" className="text-blue-500 hover:underline">
                    /{p.slug}
                  </a>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleBusinessModel(p.id, p.organization_id, currentModel)}
                    disabled={loadingId === p.id || !p.organization_id}
                    className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                      currentModel === "B2B" 
                        ? "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" 
                        : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                    } disabled:opacity-50`}
                  >
                    {loadingId === p.id ? "Salvando..." : currentModel}
                    <span className="text-[8px] opacity-50 font-normal">(Clique p/ mudar)</span>
                  </button>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    p.role === 'main_admin' ? 'bg-red-500/10 text-red-500' :
                    p.role === 'b2b_admin' ? 'bg-blue-500/10 text-blue-500' :
                    p.role === 'b2c_admin' ? 'bg-emerald-500/10 text-emerald-500' :
                    p.role === 'authorized' ? 'bg-violet-500/10 text-violet-500' :
                    'bg-zinc-500/10 text-[var(--dash-text-secondary)]'
                  }`}>
                    {p.role || "pending"}
                  </span>
                  
                  {!p.organization_id && p.role !== "authorized" && (
                    <button
                      onClick={() => authorizeOnboarding(p.id)}
                      disabled={loadingId === p.id}
                      className="ml-3 inline-flex items-center rounded-md bg-violet-600 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm transition-all hover:bg-violet-500 active:scale-95 disabled:opacity-50"
                    >
                      {loadingId === p.id ? "..." : "Liberar Onboarding"}
                    </button>
                  )}
                </td>
                <td className="px-6 py-4" style={{ color: "var(--dash-text-secondary)" }}>
                  {new Date(p.created_at).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {(!profiles || profiles.length === 0) && (
        <p className="p-6 text-center text-sm" style={{ color: "var(--dash-text-muted)" }}>Nenhum usuário encontrado.</p>
      )}
    </div>
  );
}
