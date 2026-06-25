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
  Zap,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Upload,
  Trash2
} from "lucide-react";
import { updateSystemConfig } from "@/lib/admin-actions";
import { uploadStorageFile } from "@/lib/dashboard/sellerActions";

interface SettingsManagerProps {
  configs: Record<string, string>;
}

export default function SettingsManager({ configs }: SettingsManagerProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  // States
  const [inviteCode, setInviteCode] = useState(configs.beta_invite_code || "MAJ2024");
  const [geminiApiKey, setGeminiApiKey] = useState(configs.gemini_api_key || "");
  const [showApiKey, setShowApiKey] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(configs.maintenance_mode === "true");
  const [noticeText, setNoticeText] = useState(configs.system_notice_text || "");
  const [noticeActive, setNoticeActive] = useState(configs.system_notice_active === "true");
  const [fallbackFaviconUrl, setFallbackFaviconUrl] = useState(configs.fallback_favicon_url || "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploadingImage(true);
    setMessage("");

    const fileExt = file.name.split(".").pop();
    const filePath = `system/fallback-favicon-${Date.now()}.${fileExt}`;
    
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("bucket", "avatars");
    uploadFormData.append("path", filePath);

    const result = await uploadStorageFile(uploadFormData);
    if (result.error || !result.publicUrl) {
      setMessage("Erro ao fazer upload da imagem.");
      setIsUploadingImage(false);
      return;
    }

    setFallbackFaviconUrl(result.publicUrl);
    const saveResult = await updateSystemConfig("fallback_favicon_url", result.publicUrl);
    
    if (saveResult.success) {
      setMessage("Favicon de Fallback atualizado com sucesso!");
      setTimeout(() => setMessage(""), 3000);
    }
    setIsUploadingImage(false);
  }

  async function handleRemoveFavicon() {
    setFallbackFaviconUrl("");
    const result = await updateSystemConfig("fallback_favicon_url", "");
    if (result.success) {
      setMessage("Favicon removido.");
      setTimeout(() => setMessage(""), 3000);
    }
  }

  return (
    <div className="max-w-4xl space-y-8 pb-20">
      {/* Mensagem Global */}
      {message && (
        <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 font-medium animate-in fade-in slide-in-from-bottom-4">
          {message}
        </div>
      )}

      {/* Seção: Identidade Global */}
      <div className="rounded-lg border bg-[var(--dash-surface)] border-[var(--dash-border)] overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-[var(--dash-border)] bg-primary/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ImageIcon className="text-primary" size={24} />
            <h3 className="font-bold text-lg" style={{ color: "var(--dash-text-primary)" }}>Identidade Global</h3>
          </div>
        </div>
        <div className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--dash-text-muted)" }}>Favicon Padrão (Fallback)</label>
            <p className="text-sm mb-4" style={{ color: "var(--dash-text-secondary)" }}>Esta imagem será servida como Favicon para todos os catálogos B2C e B2B que ainda não enviaram a sua própria logomarca. Substitui o "P" padrão.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 relative">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/80">Recomendado: 1:1 Quadrado (ex: 256x256 px)</span>
                </div>
                
                <label 
                  className="h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 relative group cursor-pointer transition-all hover:bg-zinc-500/5 overflow-hidden block w-full"
                  style={{ borderColor: "var(--dash-border)", background: "var(--dash-input-bg)" }}
                >
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/x-icon" 
                    className="hidden" 
                    onChange={handleImageUpload} 
                    disabled={isUploadingImage} 
                  />
                  
                  {isUploadingImage ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs" style={{ color: "var(--dash-text-muted)" }}>Enviando...</span>
                    </div>
                  ) : fallbackFaviconUrl ? (
                    <>
                      <img src={fallbackFaviconUrl} className="w-12 h-12 object-contain" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault(); // Evita acionar o label
                          e.stopPropagation();
                          handleRemoveFavicon();
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-lg shadow-sm hover:bg-red-600 transition-colors z-10"
                        title="Remover Favicon"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={24} style={{ color: "var(--dash-text-muted)" }} />
                      <span className="text-sm font-semibold" style={{ color: "var(--dash-text-secondary)" }}>Fazer Upload</span>
                    </>
                  )}
                  
                  <div className="pointer-events-none absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Upload size={20} className="text-white" />
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção: Segurança */}
      <div className="rounded-lg border bg-[var(--dash-surface)] border-[var(--dash-border)] overflow-hidden shadow-sm">
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
                className="flex-1 px-4 py-3 rounded-md border outline-none bg-[var(--dash-bg)]" style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
              />
              <button 
                onClick={() => handleSave("beta_invite_code", inviteCode)}
                disabled={loading === "beta_invite_code"}
                className="px-6 py-3 bg-black text-white rounded-md font-bold text-sm hover:opacity-90 transition-opacity"
              >
                {loading === "beta_invite_code" ? "..." : "Salvar"}
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-[var(--dash-border)]">
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--dash-text-muted)" }}>Chave de API do Gemini (Google AI)</label>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <input 
                  type={showApiKey ? "text" : "password"} 
                  value={geminiApiKey} 
                  onChange={e => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full pl-4 pr-12 py-3 rounded-md border outline-none bg-[var(--dash-bg)] transition-all" 
                  style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-zinc-500/10 rounded-sm transition-colors"
                  style={{ color: "var(--dash-text-secondary)" }}
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button 
                onClick={() => handleSave("gemini_api_key", geminiApiKey)}
                disabled={loading === "gemini_api_key"}
                className="px-6 py-3 bg-black text-white rounded-md font-bold text-sm hover:opacity-90 transition-opacity"
              >
                {loading === "gemini_api_key" ? "..." : "Salvar"}
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 mt-2">Utilizada para geração automática de SEO, descrição de produtos e revisão ortográfica de forma global.</p>
          </div>
        </div>
      </div>

      {/* Seção 2: Manutenção */}
      <div className="rounded-xl border bg-[var(--dash-surface)] border-[var(--dash-border)] overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-[var(--dash-border)] bg-amber-500/5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-amber-500" size={24} />
            <h3 className="font-bold text-lg" style={{ color: "var(--dash-text-primary)" }}>Modo de Manutenção</h3>
          </div>
        </div>
        <div className="p-8">
          <div className="flex items-center justify-between p-6 rounded-xl bg-amber-500/10 border border-amber-500/20">
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
      <div className="rounded-xl border bg-[var(--dash-surface)] border-[var(--dash-border)] overflow-hidden shadow-sm">
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
                className="px-3 py-1.5 rounded-md border text-[10px] font-bold uppercase tracking-wider hover:bg-blue-50 transition-colors"
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
              className="w-full p-5 rounded-xl border outline-none bg-[var(--dash-bg)] min-h-[120px] text-sm"
              style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
            />
            <button 
              onClick={() => handleSave("system_notice_text", noticeText)}
              className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
            >
              <Send size={18} />
              Publicar Notificação Global
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className="fixed bottom-10 right-10 flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-lg shadow-2xl animate-bounce z-50">
          <CheckCircle2 size={20} />
          <span className="text-sm font-bold">{message}</span>
        </div>
      )}
    </div>
  );
}
