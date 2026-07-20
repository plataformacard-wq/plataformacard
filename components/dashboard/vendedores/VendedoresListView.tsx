"use client";

import { useEffect, useState } from "react";
import {
  UserPlus,
  Search,
  ExternalLink,
  ShieldCheck,
  Clock,
  Shuffle,
} from "lucide-react";
import { motion } from "framer-motion";
import { getPublicUrl } from "@/lib/utils/url";

type Seller = {
  id: string;
  full_name: string | null;
  email: string | null;
  whatsapp: string | null;
  avatar_url: string | null;
  bio: string | null;
  slug: string | null;
  job_title: string | null;
  can_customize_hours: boolean | null;
  is_available: boolean | null;
  custom_business_hours: any;
  role: string;
  dash_access_catalog: boolean | null;
  dash_access_analytics: boolean | null;
  dash_access_company: boolean | null;
  status: string | null;
  redirect_leads: boolean | null;
  hide_prices: boolean | null;
  recess_ends_at: string | null;
  whatsapp_template: string | null;
  accepts_messages_when_closed: boolean | null;
  public_banner_url: string | null;
};

function RecessCountdown({ endsAt }: { endsAt: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function updateTimer() {
      const remainingMs = new Date(endsAt).getTime() - Date.now();
      if (remainingMs <= 0) {
        setTimeLeft("Recesso concluído");
        return;
      }
      const totalMinutes = Math.floor(remainingMs / (1000 * 60));
      const totalHours = Math.floor(totalMinutes / 60);
      const days = Math.floor(totalHours / 24);
      const hours = totalHours % 24;
      const minutes = totalMinutes % 60;
      const parts: string[] = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0 || days > 0) parts.push(`${hours}h`);
      parts.push(`${minutes}m`);
      setTimeLeft(`Volta em ${parts.join(" ")}`);
    }
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [endsAt]);

  if (!timeLeft) return null;
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-bold uppercase tracking-wider border border-purple-200 dark:border-purple-800/30 shadow-sm animate-pulse">
      <Clock size={12} />
      {timeLeft}
    </span>
  );
}

interface VendedoresListViewProps {
  vendedores: Seller[];
  sellerLimit: number;
  sellerCount: number;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  handleOpenForm: (seller?: Seller, initialRole?: string) => void;
  handleToggleStatus: (seller: Seller) => void;
  customDomain: string | null;
  loading: boolean;
}

export default function VendedoresListView({
  vendedores,
  sellerLimit,
  sellerCount,
  searchQuery,
  setSearchQuery,
  handleOpenForm,
  handleToggleStatus,
  customDomain,
  loading,
}: VendedoresListViewProps) {
  return (
    <motion.div
      key="list"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--dash-text-primary)" }}>Colaboradores</h1>
          <p className="text-sm mt-1" style={{ color: "var(--dash-text-secondary)" }}>
            Gerencie a ficha completa e as permissões da sua equipe.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {sellerLimit > 0 && (
            <div className="text-right">
              <span className={`text-xs font-black ${sellerCount >= sellerLimit ? 'text-red-500' : 'text-emerald-500'}`}>
                {sellerCount} / {sellerLimit} colaboradores
              </span>
              <div className="mt-1 h-1.5 w-40 rounded-full bg-[var(--dash-border)] overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${sellerCount >= sellerLimit ? 'bg-red-500' : 'bg-emerald-500'}`}
                  animate={{ width: `${Math.min((sellerCount / sellerLimit) * 100, 100)}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </div>
          )}
          <button
            onClick={() => handleOpenForm()}
            disabled={sellerLimit > 0 && sellerCount >= sellerLimit}
            className="flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold shadow-lg shadow-black/5 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            style={{ background: "var(--dash-text-primary)", color: "var(--dash-bg)" }}
          >
            <UserPlus size={18} />
            Novo Colaborador
          </button>
          <button
            onClick={() => handleOpenForm(undefined, "manager")}
            className="flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
            style={{ background: "var(--dash-primary-light)", color: "var(--dash-primary)" }}
          >
            <ShieldCheck size={18} />
            Novo Gerente
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dash-text-muted)]" size={18} />
        <input
          type="text"
          placeholder="Buscar por nome ou telefone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-[27px] border outline-none"
          style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
        />
      </div>

      <div className="space-y-4">
        {vendedores
          .filter(v => v.role === 'seller' || v.role === 'manager')
          .filter(v => {
            const query = searchQuery.toLowerCase();
            return (
              v.full_name?.toLowerCase().includes(query) ||
              v.whatsapp?.includes(query.replace(/\D/g, ""))
            );
          })
          .map(v => (
            <div
              key={v.id}
              onClick={() => handleOpenForm(v)}
              className="group relative flex flex-col md:flex-row items-center gap-6 p-5 rounded-[27px] border transition-all hover:shadow-xl hover:border-primary/30 cursor-pointer"
              style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
            >
              {/* Foto e Info Principal */}
              <div className="flex items-center gap-4 w-full md:w-auto md:min-w-[280px] md:max-w-[300px]">
                <div className="relative flex-shrink-0">
                  {v.avatar_url ? (
                    <img src={v.avatar_url} className="h-20 w-20 rounded-[27px] object-cover border-2 border-white shadow-md" alt={v.full_name || "avatar"} />
                  ) : (
                    <div className="h-20 w-20 rounded-[27px] bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                      {v.full_name?.charAt(0) || "V"}
                    </div>
                  )}
                  <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white shadow-sm ${v.is_available ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-lg truncate" style={{ color: "var(--dash-text-primary)" }}>{v.full_name || "Sem nome"}</h4>
                    {v.role === 'manager' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        Gerente
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--dash-text-muted)] truncate mb-1 pr-2" title={v.bio || ""}>
                    {v.bio || "Consultor de Vendas"}
                  </p>
                  <span className="inline-block px-2 py-0.5 rounded-lg bg-primary/5 text-[10px] font-bold text-primary truncate max-w-full">
                    {getPublicUrl(v.slug || "", customDomain, false, false)}
                  </span>
                  {v.recess_ends_at && new Date(v.recess_ends_at) > new Date() && (
                    <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                      <RecessCountdown endsAt={v.recess_ends_at} />
                      {v.redirect_leads && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900 dark:bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-wider border border-transparent shadow-sm">
                          <Shuffle size={12} className="text-purple-400" />
                          Redirecionamento ativo
                        </span>
                      )}
                    </div>
                  )}
                  {v.redirect_leads && !v.is_available && !(v.recess_ends_at && new Date(v.recess_ends_at) > new Date()) && (
                    <div className="mt-2.5 flex items-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900 dark:bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-wider border border-transparent shadow-sm">
                        <Shuffle size={12} className="text-purple-400" />
                        Redirecionamento de clientes ativo
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dados Analíticos */}
              <div className="flex-1 grid grid-cols-3 gap-2 px-6 border-x border-dashed hidden lg:grid" style={{ borderColor: "var(--dash-border)" }}>
                <div className="text-center">
                  <p className="text-[9px] font-bold uppercase tracking-tight text-[var(--dash-text-muted)] mb-1 whitespace-nowrap">Cliques no Link</p>
                  <p className="text-xl font-black" style={{ color: "var(--dash-text-primary)" }}>0</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-bold uppercase tracking-tight text-[var(--dash-text-muted)] mb-1 whitespace-nowrap">Contatos Realizados</p>
                  <p className="text-xl font-black" style={{ color: "var(--dash-text-primary)" }}>0</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-bold uppercase tracking-tight text-[var(--dash-text-muted)] mb-1 whitespace-nowrap">Conversão</p>
                  <p className="text-xl font-black text-emerald-500">0%</p>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="flex flex-row md:flex-col items-center gap-3 min-w-[140px]">
                <div className="flex items-center gap-3 mr-4 md:mr-0">
                  <span className={`text-[10px] font-bold uppercase tracking-tighter ${
                    v.status === 'terminated' ? 'text-red-500' :
                    (v.recess_ends_at && new Date(v.recess_ends_at) > new Date()) ? 'text-purple-500 font-extrabold' :
                    v.is_available ? 'text-emerald-500' : 'text-slate-400'
                  }`}>
                    {v.status === 'terminated' ? 'Desligado' :
                     (v.recess_ends_at && new Date(v.recess_ends_at) > new Date()) ? 'Em Recesso' :
                     v.is_available ? 'Disponível' : 'Indisponível'}
                  </span>
                  {v.status !== 'terminated' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleStatus(v); }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${v.is_available ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-[var(--dash-surface)] transition-transform ${v.is_available ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <a
                    href={getPublicUrl(v.slug || "", customDomain, false, true)}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    className="group flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 text-primary text-xs font-bold border border-primary/20 hover:bg-primary hover:text-white hover:border-primary hover:shadow-[0_0_14px_rgba(var(--primary-rgb),0.35)] active:scale-95 transition-all duration-200"
                  >
                    <ExternalLink size={14} className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /> Cartão Virtual
                  </a>
                  <button
                    onClick={() => handleOpenForm(v)}
                    className="px-4 py-2.5 rounded-lg bg-[var(--dash-surface-secondary)] text-[var(--dash-text-primary)] text-xs font-bold border border-[var(--dash-border)] hover:bg-[var(--dash-hover-bg)] hover:border-primary/30 active:scale-95 transition-all duration-200"
                  >
                    Editar Ficha
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </motion.div>
  );
}
