"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Building2, 
  Users, 
  Package, 
  Globe, 
  Calendar, 
  ShieldAlert, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Mail
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface ClientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: any;
}

export default function ClientDetailModal({ isOpen, onClose, organization }: ClientDetailModalProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    userCount: 0,
    productCount: 0,
    adminEmails: [] as string[]
  });

  useEffect(() => {
    if (isOpen && organization?.id) {
      async function fetchDetails() {
        setLoading(true);
        try {
          // 1. Contagem de Produtos
          const { count: pCount } = await supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .eq("organization_id", organization.id)
            .is("deleted_at", null);

          // 2. Usuários/Perfis vinculados
          const { data: profiles } = await supabase
            .from("profiles")
            .select("full_name, role")
            .eq("organization_id", organization.id);

          setStats({
            userCount: profiles?.length || 0,
            productCount: pCount || 0,
            adminEmails: [] // Poderíamos buscar os e-mails da auth se necessário
          });
        } catch (err) {
          console.error("Erro ao buscar detalhes do cliente:", err);
        }
        setLoading(false);
      }
      fetchDetails();
    }
  }, [isOpen, organization?.id, supabase]);

  // Lógica de Contrato
  const adherenceDate = organization?.created_at ? new Date(organization.created_at) : new Date();
  const expirationDate = new Date(adherenceDate);
  expirationDate.setFullYear(adherenceDate.getFullYear() + 1); // 12 meses padrão

  const now = new Date();
  const diffTime = expirationDate.getTime() - now.getTime();
  const monthsRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44)));

  const [showContract, setShowContract] = useState(false);

  if (!isOpen || !organization) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-[40px] shadow-2xl border border-[var(--dash-border)]"
          style={{ background: "var(--dash-surface)" }}
        >
          {/* Header Color Bar */}
          <div className={`h-3 w-full ${organization.business_model === 'B2B' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-[var(--dash-hover-bg)] transition-colors text-[var(--dash-text-muted)]"
          >
            <X size={20} />
          </button>

          <div className="p-8 sm:p-12">
            {/* Top Info */}
            <div className="flex items-center gap-6 mb-10">
              <div className={`h-20 w-20 rounded-3xl flex items-center justify-center text-white shadow-xl ${organization.business_model === 'B2B' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                <Building2 size={40} />
              </div>
              <div>
                <h2 className="text-3xl font-black mb-1" style={{ color: "var(--dash-text-primary)" }}>
                  {organization.name}
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                   <span className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)]">/{organization.slug}</span>
                   
                   <div className="flex items-center gap-2">
                     <div className="h-1 w-1 rounded-full bg-[var(--dash-border)]" />
                     <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${organization.business_model === 'B2B' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      MODELO: {organization.business_model || 'B2B'}
                     </span>
                   </div>

                   <div className="flex items-center gap-2">
                     <div className="h-1 w-1 rounded-full bg-[var(--dash-border)]" />
                     <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      PLANO: {organization.plan_id || 'STANDARD'}
                     </span>
                   </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-10">
              <div className="p-5 rounded-3xl bg-[var(--dash-bg)] border border-[var(--dash-border)]">
                <Package className="text-primary mb-3" size={20} />
                <p className="text-2xl font-black" style={{ color: "var(--dash-text-primary)" }}>
                  {loading ? "..." : stats.productCount}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--dash-text-muted)]">Produtos</p>
              </div>
              <div className="p-5 rounded-3xl bg-[var(--dash-bg)] border border-[var(--dash-border)]">
                <Users className="text-blue-500 mb-3" size={20} />
                <p className="text-2xl font-black" style={{ color: "var(--dash-text-primary)" }}>
                  {loading ? "..." : stats.userCount}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--dash-text-muted)]">Usuários</p>
              </div>
              <div className="p-5 rounded-3xl bg-[var(--dash-bg)] border border-[var(--dash-border)] col-span-2 sm:col-span-1">
                <TrendingUp className="text-emerald-500 mb-3" size={20} />
                <p className="text-2xl font-black text-emerald-500">Alta</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--dash-text-muted)]">Saúde</p>
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-4 mb-10">
               <div 
                  onClick={() => setShowContract(!showContract)}
                  className="flex flex-col p-4 rounded-2xl border border-[var(--dash-border)] group cursor-pointer hover:bg-primary/5 transition-all"
               >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-[var(--dash-bg)] flex items-center justify-center text-[var(--dash-text-muted)]">
                        <Calendar size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-[var(--dash-text-muted)]">Data de Adesão</p>
                        <p className="text-sm font-bold" style={{ color: "var(--dash-text-primary)" }}>
                          {adherenceDate.toLocaleDateString("pt-BR", { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={16} className={`text-[var(--dash-text-muted)] transition-transform ${showContract ? 'rotate-90' : ''}`} />
                  </div>

                  {showContract && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="mt-4 pt-4 border-t border-[var(--dash-border)] grid grid-cols-2 gap-4"
                    >
                      <div>
                        <p className="text-[9px] font-bold uppercase text-[var(--dash-text-muted)]">Expiração do Contrato</p>
                        <p className="text-sm font-bold text-amber-500">
                          {expirationDate.toLocaleDateString("pt-BR", { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase text-[var(--dash-text-muted)]">Tempo Restante</p>
                        <p className="text-sm font-bold" style={{ color: "var(--dash-text-primary)" }}>
                          {monthsRemaining} meses operacionais
                        </p>
                      </div>
                    </motion.div>
                  )}
               </div>

               <div className="flex items-center justify-between p-4 rounded-2xl border border-[var(--dash-border)] group cursor-pointer hover:bg-primary/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[var(--dash-bg)] flex items-center justify-center text-[var(--dash-text-muted)]">
                      <Globe size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-[var(--dash-text-muted)]">URL do Catálogo</p>
                      <p className="text-sm font-bold" style={{ color: "var(--dash-text-primary)" }}>
                        anotameucontato.com.br/{organization.slug}
                      </p>
                    </div>
                  </div>
                  <ExternalLink size={16} className="text-[var(--dash-text-muted)] group-hover:text-primary transition-colors" />
               </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-1 py-4 rounded-2xl bg-[var(--dash-text-primary)] text-[var(--dash-bg)] font-bold text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                  Simular Acesso (Shadow)
                </button>
                <button className="flex-1 py-4 rounded-2xl border border-red-500/20 text-red-500 font-bold text-sm hover:bg-red-500/5 transition-all flex items-center justify-center gap-2">
                  <ShieldAlert size={18} />
                  Suspender Conta
                </button>
              </div>
              <p className="text-[10px] text-center text-[var(--dash-text-muted)] italic">
                * O acesso Shadow permite visualizar o painel exatamente como o cliente o vê, facilitando o suporte técnico sem necessidade de senha.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
