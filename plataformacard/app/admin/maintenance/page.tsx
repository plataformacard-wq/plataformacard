"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  ShieldAlert, 
  Bell, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle,
  Server,
  Activity,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MaintenancePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [configs, setConfigs] = useState({
    system_notice_text: "",
    system_notice_active: "false",
    maintenance_mode: "false",
    system_notice_id: "0"
  });

  useEffect(() => {
    async function loadConfigs() {
      const { data } = await supabase.from("platform_config").select("*");
      if (data) {
        const configMap: any = {};
        data.forEach(c => configMap[c.key] = c.value);
        setConfigs(prev => ({
          ...prev,
          ...configMap
        }));
      }
      setLoading(false);
    }
    loadConfigs();
  }, [supabase]);

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    const updates = Object.entries(configs).map(([key, value]) => ({
      key,
      value: String(value)
    }));

    const { error } = await supabase
      .from("platform_config")
      .upsert(updates, { onConflict: "key" });

    if (error) {
      setMessage({ text: "Erro ao salvar: " + error.message, type: "error" });
    } else {
      setMessage({ text: "Configurações globais atualizadas!", type: "success" });
      setTimeout(() => setMessage(null), 3000);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-black" style={{ color: "var(--dash-text-primary)" }}>Centro de Manutenção</h1>
        <p className="text-sm mt-2" style={{ color: "var(--dash-text-secondary)" }}>Controle global de alertas e integridade do sistema.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Card: Status do Sistema */}
        <div className="rounded-[32px] border p-8 space-y-6" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
               <Server size={20} />
             </div>
             <h2 className="text-lg font-bold" style={{ color: "var(--dash-text-primary)" }}>Integridade Global</h2>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--dash-bg)] border border-[var(--dash-border)]">
                <div className="flex items-center gap-3">
                   <Activity size={16} className="text-emerald-500" />
                   <span className="text-sm font-bold">Status da API</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Online</span>
             </div>

             <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--dash-bg)] border border-[var(--dash-border)]">
                <div className="flex items-center gap-3">
                   <ShieldAlert size={16} className={configs.maintenance_mode === "true" ? "text-red-500" : "text-zinc-500"} />
                   <span className="text-sm font-bold">Modo Manutenção</span>
                </div>
                <button 
                  onClick={() => setConfigs({ ...configs, maintenance_mode: configs.maintenance_mode === "true" ? "false" : "true" })}
                  className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${
                    configs.maintenance_mode === "true" 
                    ? "bg-red-500 text-white" 
                    : "bg-zinc-500/10 text-zinc-500 hover:bg-red-500/10 hover:text-red-500"
                  }`}
                >
                  {configs.maintenance_mode === "true" ? "Desativar" : "Ativar"}
                </button>
             </div>
          </div>
          
          {configs.maintenance_mode === "true" && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
               <AlertTriangle className="text-red-500 shrink-0" size={18} />
               <p className="text-xs text-red-500 font-medium leading-relaxed">
                 O modo manutenção impedirá o acesso de todos os usuários (exceto superadmins) ao painel administrativo.
               </p>
            </div>
          )}
        </div>

        {/* Card: Avisos do Sistema */}
        <div className="rounded-[32px] border p-8 space-y-6" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
               <Bell size={20} />
             </div>
             <h2 className="text-lg font-bold" style={{ color: "var(--dash-text-primary)" }}>Avisos Globais</h2>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
                <p className="text-xs font-bold" style={{ color: "var(--dash-text-secondary)" }}>Ativar barra de aviso</p>
                <button 
                  onClick={() => setConfigs({ ...configs, system_notice_active: configs.system_notice_active === "true" ? "false" : "true" })}
                  className={`w-12 h-6 rounded-full relative transition-all ${configs.system_notice_active === "true" ? "bg-emerald-500" : "bg-zinc-500/20"}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${configs.system_notice_active === "true" ? "left-7" : "left-1"}`} />
                </button>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: "var(--dash-text-muted)" }}>Mensagem do Alerta</label>
                <div className="relative">
                   <MessageSquare className="absolute left-4 top-4 text-[var(--dash-text-muted)]" size={18} />
                   <textarea 
                     value={configs.system_notice_text}
                     onChange={(e) => setConfigs({ ...configs, system_notice_text: e.target.value })}
                     placeholder="Ex: Teremos uma manutenção programada hoje às 22h..."
                     rows={4}
                     className="w-full pl-12 pr-4 py-4 rounded-lg border outline-none text-sm transition-all focus:ring-2 focus:ring-primary/20 resize-none"
                     style={{ background: "var(--dash-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                   />
                </div>
             </div>

             <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                <p className="text-[10px] font-medium text-blue-500 flex items-center gap-2">
                   <Bell size={12} />
                   Este aviso aparecerá no topo do painel para todos os clientes ativos.
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* Footer Fixo de Ação */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t" style={{ borderColor: "var(--dash-border)" }}>
         <AnimatePresence>
           {message && (
             <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 20 }}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold ${
                 message.type === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
               }`}
             >
               {message.type === "success" ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
               {message.text}
             </motion.div>
           )}
         </AnimatePresence>

         <button 
           onClick={handleSave}
           disabled={saving}
           className="px-10 py-4 rounded-lg bg-primary text-white font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
         >
           {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> SALVAR CONFIGURAÇÕES</>}
         </button>
      </div>
    </div>
  );
}
