"use client";

import { useEffect, useState } from "react";
import { getSellers, updateSeller, updateSellerPassword } from "@/lib/dashboard/sellerActions";
import { ShieldCheck, KeyRound, AlertCircle, Loader2, Search } from "lucide-react";
import { motion } from "framer-motion";

type SellerAccess = {
  id: string;
  full_name: string | null;
  slug: string | null;
  avatar_url: string | null;
  dash_access_catalog: boolean | null;
  dash_access_analytics: boolean | null;
  dash_access_company: boolean | null;
  role: string;
};

export default function GerenciarAcessosPage() {
  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState<SellerAccess[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [passwordModalSeller, setPasswordModalSeller] = useState<SellerAccess | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const result = await getSellers();
    if (result.sellers) {
      setSellers(result.sellers.filter(s => s.role === 'seller') as SellerAccess[]);
    }
    setLoading(false);
  }

  async function handleToggle(sellerId: string, field: 'dash_access_catalog' | 'dash_access_analytics' | 'dash_access_company', currentValue: boolean) {
    setUpdatingId(sellerId);
    setMessage({ type: "", text: "" });
    
    // Otimista
    setSellers(prev => prev.map(s => s.id === sellerId ? { ...s, [field]: !currentValue } : s));

    const result = await updateSeller(sellerId, { [field]: !currentValue });
    
    if (result.error) {
      // Reverte em caso de erro
      setSellers(prev => prev.map(s => s.id === sellerId ? { ...s, [field]: currentValue } : s));
      setMessage({ type: "error", text: `Erro ao atualizar permissão: ${result.error}` });
    }
    setUpdatingId(null);
  }

  async function handleUpdatePassword() {
    if (!passwordModalSeller || newPassword.length < 6) {
      setMessage({ type: "error", text: "A senha deve ter pelo menos 6 caracteres." });
      return;
    }

    setPasswordUpdating(true);
    const result = await updateSellerPassword(passwordModalSeller.id, newPassword);
    
    if (result.error) {
      setMessage({ type: "error", text: `Erro ao atualizar senha: ${result.error}` });
    } else {
      setMessage({ type: "success", text: "Senha atualizada com sucesso!" });
      setPasswordModalSeller(null);
      setNewPassword("");
    }
    setPasswordUpdating(false);
    
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  }

  const filteredSellers = sellers.filter(s => {
    const query = searchQuery.toLowerCase();
    return s.full_name?.toLowerCase().includes(query) || s.slug?.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--dash-text-primary)" }}>
            Gerenciar Acessos
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--dash-text-secondary)" }}>
            Controle quais menus do dashboard cada vendedor pode acessar e redefina senhas.
          </p>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dash-text-muted)]" size={18} />
        <input 
          type="text"
          placeholder="Buscar vendedor por nome ou slug..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl border outline-none"
          style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
        />
      </div>

      <div className="rounded-[32px] border shadow-sm overflow-hidden" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--dash-bg)] border-b" style={{ borderColor: "var(--dash-border)" }}>
              <tr>
                <th className="px-6 py-4 font-semibold" style={{ color: "var(--dash-text-secondary)" }}>Vendedor</th>
                <th className="px-6 py-4 font-semibold text-center" style={{ color: "var(--dash-text-secondary)" }}>Acesso ao Catálogo</th>
                <th className="px-6 py-4 font-semibold text-center" style={{ color: "var(--dash-text-secondary)" }}>Acesso ao Analytics</th>
                <th className="px-6 py-4 font-semibold text-center" style={{ color: "var(--dash-text-secondary)" }}>Acesso à Empresa</th>
                <th className="px-6 py-4 font-semibold text-right" style={{ color: "var(--dash-text-secondary)" }}>Autenticação</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--dash-border)" }}>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm" style={{ color: "var(--dash-text-muted)" }}>
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 size={24} className="animate-spin text-primary" />
                      Carregando vendedores...
                    </div>
                  </td>
                </tr>
              ) : filteredSellers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm" style={{ color: "var(--dash-text-muted)" }}>
                    Nenhum vendedor encontrado.
                  </td>
                </tr>
              ) : (
                filteredSellers.map(seller => (
                  <tr key={seller.id} className="hover:bg-[var(--dash-hover-bg)] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {seller.avatar_url ? (
                          <img src={seller.avatar_url} alt={seller.full_name || ""} className="w-10 h-10 rounded-xl object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {seller.full_name?.charAt(0) || "V"}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-base" style={{ color: "var(--dash-text-primary)" }}>{seller.full_name}</p>
                          <p className="text-xs" style={{ color: "var(--dash-text-muted)" }}>@{seller.slug}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleToggle(seller.id, 'dash_access_catalog', seller.dash_access_catalog || false)}
                        disabled={updatingId === seller.id}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${seller.dash_access_catalog ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${seller.dash_access_catalog ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleToggle(seller.id, 'dash_access_analytics', seller.dash_access_analytics || false)}
                        disabled={updatingId === seller.id}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${seller.dash_access_analytics ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${seller.dash_access_analytics ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleToggle(seller.id, 'dash_access_company', seller.dash_access_company || false)}
                        disabled={updatingId === seller.id}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${seller.dash_access_company ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${seller.dash_access_company ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setPasswordModalSeller(seller)}
                        className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-bold hover:opacity-80 transition-opacity"
                      >
                        <KeyRound size={14} /> Redefinir Senha
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Redefinir Senha */}
      {passwordModalSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-[32px] p-8 shadow-2xl border"
            style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
          >
            <div className="mb-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-black">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: "var(--dash-text-primary)" }}>Redefinir Senha</h2>
                <p className="text-xs" style={{ color: "var(--dash-text-secondary)" }}>Para {passwordModalSeller.full_name}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: "var(--dash-text-primary)" }}>
                  Nova Senha (Mínimo 6 caracteres)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
                  style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-input-border)", color: "var(--dash-text-primary)" }}
                />
              </div>

              <div className="flex items-center gap-3 mt-8">
                <button
                  onClick={() => { setPasswordModalSeller(null); setNewPassword(""); }}
                  className="flex-1 rounded-xl px-4 py-3 text-sm font-bold border transition-colors hover:bg-[var(--dash-hover-bg)]"
                  style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdatePassword}
                  disabled={passwordUpdating || newPassword.length < 6}
                  className="flex-1 rounded-xl bg-zinc-900 dark:bg-white px-4 py-3 text-sm font-bold text-white dark:text-black transition-colors hover:opacity-90 disabled:opacity-50"
                >
                  {passwordUpdating ? "Salvando..." : "Salvar Senha"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
