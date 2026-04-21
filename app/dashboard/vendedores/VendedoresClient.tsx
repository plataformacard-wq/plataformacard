"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Users, 
  UserPlus, 
  Settings2, 
  Trash2, 
  Mail, 
  Phone, 
  Clock, 
  ShieldCheck,
  Search,
  MoreVertical,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Seller = {
  id: string;
  full_name: string | null;
  email: string | null;
  whatsapp: string | null;
  can_customize_hours: boolean | null;
  is_available: boolean | null;
  role: string;
};

export default function VendedoresClient() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [vendedores, setVendedores] = useState<Seller[]>([]);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modais
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  
  // Form Novo Vendedor
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newWhatsapp, setNewWhatsapp] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Pega a organização do Gestor
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (profile?.organization_id) {
      setOrgId(profile.organization_id);
      
      // 2. Busca os vendedores desta organização
      const { data: sellers } = await supabase
        .from("profiles")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .eq("role", "seller")
        .order("full_name");

      if (sellers) {
        setVendedores(sellers as Seller[]);
      }
    }
    setLoading(false);
  }

  async function handleAddSeller() {
    if (!orgId || !newEmail || !newName) return;
    setSaving(true);
    
    // Nota: Em um sistema real, aqui dispararíamos um convite por e-mail 
    // ou criaríamos o usuário via Admin Auth. 
    // Por enquanto, vamos simular a inserção no profiles (precisa de trigger ou RPC para criar o Auth).
    // Para simplificar esta demonstração, vamos focar na UI de gestão.
    
    alert("Funcionalidade de criação de usuário Auth requer Edge Function ou permissões de Admin. Vamos focar na gestão de perfis existentes.");
    
    setSaving(false);
    setShowAddModal(false);
  }

  async function togglePermission(sellerId: string, currentVal: boolean) {
    const { error } = await supabase
      .from("profiles")
      .update({ can_customize_hours: !currentVal })
      .eq("id", sellerId);

    if (!error) {
      setVendedores(prev => 
        prev.map(v => v.id === sellerId ? { ...v, can_customize_hours: !currentVal } : v)
      );
    }
  }

  async function handleDeleteSeller(sellerId: string) {
    if (!confirm("Tem certeza que deseja remover este vendedor da organização?")) return;
    
    const { error } = await supabase
      .from("profiles")
      .update({ organization_id: null, role: 'user' }) // Desvincula o vendedor
      .eq("id", sellerId);

    if (!error) {
      setVendedores(prev => prev.filter(v => v.id !== sellerId));
    }
  }

  const filteredVendedores = vendedores.filter(v => 
    v.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--dash-text-primary)" }}>Gestão de Vendedores</h1>
          <p className="text-sm mt-1" style={{ color: "var(--dash-text-secondary)" }}>
            Adicione e gerencie as permissões da sua equipe de vendas.
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-lg shadow-black/5 hover:scale-[1.02] active:scale-[0.98] transition-all"
          style={{ background: "var(--dash-text-primary)", color: "var(--dash-bg)" }}
        >
          <UserPlus size={18} />
          Novo Vendedor
        </button>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dash-text-muted)]" size={18} />
        <input 
          type="text"
          placeholder="Buscar vendedor por nome ou e-mail..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl border outline-none transition-all focus:ring-2 focus:ring-primary/20"
          style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
        />
      </div>

      {/* Lista de Vendedores */}
      <div className="rounded-3xl border shadow-sm overflow-hidden" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p style={{ color: "var(--dash-text-secondary)" }}>Carregando equipe...</p>
          </div>
        ) : filteredVendedores.length === 0 ? (
          <div className="p-12 text-center">
            <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-full w-fit mx-auto mb-4">
              <Users size={32} className="text-zinc-400" />
            </div>
            <p className="font-medium" style={{ color: "var(--dash-text-primary)" }}>Nenhum vendedor encontrado</p>
            <p className="text-sm mt-1" style={{ color: "var(--dash-text-secondary)" }}>Comece adicionando seu primeiro vendedor acima.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--dash-border)" }}>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)]">Vendedor</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)]">Contato</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)]">Permissões</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)]">Status</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ divideColor: "var(--dash-border)" }}>
                {filteredVendedores.map((vendedor) => (
                  <tr key={vendedor.id} className="hover:bg-black/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {vendedor.full_name?.charAt(0) || "V"}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[var(--dash-text-primary)]">{vendedor.full_name || "Sem nome"}</p>
                          <p className="text-xs text-[var(--dash-text-muted)]">{vendedor.role === 'seller' ? 'Vendedor' : vendedor.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-[var(--dash-text-secondary)]">
                          <Mail size={12} /> {vendedor.email || "Sem e-mail"}
                        </div>
                        {vendedor.whatsapp && (
                          <div className="flex items-center gap-2 text-xs text-[var(--dash-text-secondary)]">
                            <Phone size={12} /> {vendedor.whatsapp}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => togglePermission(vendedor.id, vendedor.can_customize_hours || false)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          vendedor.can_customize_hours 
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                        }`}
                      >
                        <Clock size={14} />
                        {vendedor.can_customize_hours ? "Pode alterar horário" : "Horário bloqueado"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        vendedor.is_available 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${vendedor.is_available ? "bg-green-500" : "bg-red-500"}`} />
                        {vendedor.is_available ? "Online" : "Offline"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleDeleteSeller(vendedor.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
                          title="Remover Vendedor"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Adicionar (Simplificado) */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl p-6 shadow-2xl"
              style={{ background: "var(--dash-surface)" }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold" style={{ color: "var(--dash-text-primary)" }}>Novo Vendedor</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-black/5 rounded-full text-[var(--dash-text-muted)]">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">Nome Completo</label>
                  <input 
                    type="text" 
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-primary/20"
                    style={{ background: "var(--dash-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">E-mail de Acesso</label>
                  <input 
                    type="email" 
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-primary/20"
                    style={{ background: "var(--dash-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">WhatsApp (Opcional)</label>
                  <input 
                    type="tel" 
                    value={newWhatsapp}
                    onChange={e => setNewWhatsapp(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-primary/20"
                    style={{ background: "var(--dash-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 text-sm font-bold rounded-xl border transition-colors hover:bg-gray-50"
                    style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-secondary)" }}
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleAddSeller}
                    disabled={saving}
                    className="flex-1 py-3 text-sm font-bold rounded-xl text-white shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                    style={{ background: "var(--dash-text-primary)" }}
                  >
                    {saving ? "Criando..." : "Criar Vendedor"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
