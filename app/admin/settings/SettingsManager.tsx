"use client";

import { useState } from "react";
import { 
  ShieldCheck, 
  Key, 
  Lock, 
  Bell, 
  Globe,
  Save,
  CheckCircle2,
  AlertTriangle,
  Send,
  Zap
} from "lucide-react";
import { updateSystemConfig } from "@/lib/admin-actions";

interface SettingsManagerProps {
  configs: Record<string, string>;
}

export default function SettingsManager({ configs }: SettingsManagerProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  // States
  const [inviteCode, setInviteCode] = useState(configs.beta_invite_code || "MAJ2024");
  const [maintenanceMode, setMaintenanceMode] = useState(configs.maintenance_mode === "true");
  const [noticeText, setNoticeText] = useState(configs.system_notice_text || "");
  const [noticeActive, setNoticeActive] = useState(configs.system_notice_active === "true");

  async function handleSave(key: string, value: string) {
    setLoading(key);
    setMessage("");
    const result = await updateSystemConfig(key, value);
    if (result.success) {
      setMessage("Configuração atualizada!");
      setTimeout(() => setMessage(""), 3000);
    }
    setLoading(null);
  }

  const templates = [
    { label: "Manutenção Rotina", text: "Estamos realizando uma manutenção de rotina para melhorar sua experiência. Voltamos em breve!" },
    { label: "Atualização Crítica", text: "Atualização de segurança importante em andamento. O sistema pode apresentar instabilidade temporária." },
    { label: "Instabilidade WhatsApp", text: "Identificamos uma instabilidade global no WhatsApp. A função de clique pode ser afetada." }
  ];

  return (
    <div className="max-w-4xl space-y-8 pb-20">
      {/* Seção 1: Segurança */}
      <div className="rounded-3xl border bg-[var(--dash-surface)] border-[var(--dash-border)] overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-[var(--dash-border)] bg-primary/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="text-primary" size={24} />
            <h3 className="font-bold text-lg" style={{ color: "var(--dash-text-primary)" }}>Segurança e Acesso</h3>
          </div>
        </div>
        <div className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--dash-text-muted)" }}>Código de Convite Beta</label>
            <div className="flex gap-4">
              <input 
                type="text" value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-3 rounded-2xl border outline-none bg-[var(--dash-bg)]" style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
              />
              <button 
                onClick={() => handleSave("beta_invite_code", inviteCode)}
                disabled={loading === "beta_invite_code"}
                className="px-6 py-3 bg-black text-white rounded-2xl font-bold text-sm"
              >
                {loading === "beta_invite_code" ? "..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Seção 2: Manutenção */}
      <div className="rounded-3xl border bg-[var(--dash-surface)] border-[var(--dash-border)] overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-[var(--dash-border)] bg-amber-500/5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-amber-500" size={24} />
            <h3 className="font-bold text-lg" style={{ color: "var(--dash-text-primary)" }}>Modo de Manutenção</h3>
          </div>
        </div>
        <div className="p-8">
          <div className="flex items-center justify-between p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20">
            <div>
              <p className="font-bold text-amber-600">Ativar Bloqueio Total</p>
              <p className="text-xs text-amber-700/70">Apenas Super Admins poderão acessar o sistema.</p>
            </div>
            <button 
              onClick={() => {
                const newVal = !maintenanceMode;
                setMaintenanceMode(newVal);
                handleSave("maintenance_mode", String(newVal));
              }}
              className={`w-14 h-8 rounded-full transition-all relative ${maintenanceMode ? 'bg-amber-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${maintenanceMode ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Seção 3: Alerta Global */}
      <div className="rounded-3xl border bg-[var(--dash-surface)] border-[var(--dash-border)] overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-[var(--dash-border)] bg-blue-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="text-blue-500" size={24} />
              <h3 className="font-bold text-lg" style={{ color: "var(--dash-text-primary)" }}>Alertas e Notificações Globais</h3>
            </div>
            <button 
              onClick={() => {
                const newVal = !noticeActive;
                setNoticeActive(newVal);
                handleSave("system_notice_active", String(newVal));
              }}
              className={`w-12 h-6 rounded-full transition-all relative ${noticeActive ? 'bg-blue-500' : 'bg-zinc-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${noticeActive ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
        <div className="p-8 space-y-6">
          <div className="flex flex-wrap gap-2">
            {templates.map(t => (
              <button 
                key={t.label} 
                onClick={() => setNoticeText(t.text)}
                className="px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider hover:bg-blue-50 transition-colors"
                style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-secondary)" }}
              >
                <Zap size={10} className="inline mr-1" /> {t.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <textarea 
              value={noticeText}
              onChange={e => setNoticeText(e.target.value)}
              placeholder="Sua mensagem para todos os usuários..."
              className="w-full p-5 rounded-3xl border outline-none bg-[var(--dash-bg)] min-h-[120px] text-sm"
              style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
            />
            <button 
              onClick={() => handleSave("system_notice_text", noticeText)}
              className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
            >
              <Send size={18} />
              Publicar Notificação Global
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className="fixed bottom-10 right-10 flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl shadow-2xl animate-bounce z-50">
          <CheckCircle2 size={20} />
          <span className="text-sm font-bold">{message}</span>
        </div>
      )}
    </div>
  );
}
