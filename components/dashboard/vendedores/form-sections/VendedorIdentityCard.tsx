import React from "react";
import { Upload, X, Image as ImageIcon, Users } from "lucide-react";

export function VendedorIdentityCard(props: any) {
  const {
    formAvatar,
    setFormAvatar,
    setFormAvatarFile,
    setActiveUploadType,
    setShowImageEditor,
    formPublicBanner,
    setFormPublicBanner,
    setFormPublicBannerFile,
    formName,
    setFormName,
    formJobTitle,
    setFormJobTitle,
    formBio,
    setFormBio,
    isReadOnly = false,
  } = props;

  return (
    <div className="rounded-[27px] border p-6 shadow-sm" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
      <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
        <Users size={18} className="text-primary" /> Identidade do Vendedor
      </h3>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex flex-col items-center gap-3">
          <div 
            className="group relative h-28 w-28 rounded-[27px] border overflow-hidden bg-zinc-50 transition-all hover:border-primary/50 cursor-pointer" 
            style={{ borderColor: "var(--dash-border)" }}
            onClick={() => { setActiveUploadType("avatar"); setShowImageEditor(true); }}
          >
            {formAvatar ? (
              <>
                <img src={formAvatar} className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="text-white" size={24} />
                </div>
              </>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-zinc-300 gap-1">
                <Upload size={32} />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { setActiveUploadType("avatar"); setShowImageEditor(true); }}
              className="text-xs font-bold text-primary hover:underline"
            >
              {formAvatar ? "Alterar Foto" : "Enviar Foto"}
            </button>
            
            {formAvatar && (
              <button 
                onClick={() => {
                  setFormAvatar(null);
                  setFormAvatarFile(null);
                }}
                className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1"
              >
                <X size={12} /> Remover
              </button>
            )}
          </div>
        </div>

        {/* Banner Upload Section */}
        <div className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-[27px] border" style={{ borderColor: "var(--dash-border)", background: "var(--dash-bg)" }}>
          <div 
            className="w-full md:w-48 h-24 rounded-[27px] border-2 border-dashed overflow-hidden relative group cursor-pointer transition-all hover:border-primary/50 shrink-0 flex flex-col items-center justify-center gap-1"
            style={{ borderColor: "var(--dash-border)", background: "var(--dash-input-bg)" }}
            onClick={() => { setActiveUploadType("public_banner"); setShowImageEditor(true); }}
          >
            {formPublicBanner ? (
              <>
                <img src={formPublicBanner} className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="text-white" size={24} />
                </div>
              </>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-[var(--dash-text-muted)] gap-1">
                <ImageIcon size={24} />
                <span className="text-[9px] font-bold uppercase tracking-wider text-center px-2">Banner (Opcional)</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2 flex-1 w-full text-center md:text-left">
            <div>
              <p className="text-xs font-bold" style={{ color: "var(--dash-text-primary)" }}>Banner do Cartão</p>
              <p className="text-[10px] text-[var(--dash-text-muted)]">Recomendado: 1200x400 px</p>
            </div>
            {!isReadOnly && (
              <div className="flex items-center justify-center md:justify-start gap-4 mt-1">
                <button 
                  onClick={() => { setActiveUploadType("public_banner"); setShowImageEditor(true); }}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  {formPublicBanner ? "Alterar Banner" : "Enviar Banner"}
                </button>
                
                {formPublicBanner && (
                  <button 
                    onClick={() => {
                      setFormPublicBanner(null);
                      setFormPublicBannerFile(null);
                    }}
                    className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1"
                  >
                    <X size={12} /> Remover
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">Nome do Membro <span className="text-red-500">*</span></label>
              <input 
                type="text" value={formName} onChange={e => setFormName(e.target.value)}
                disabled={isReadOnly}
                className="w-full px-4 py-2 rounded-lg border outline-none bg-[var(--dash-bg)] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">Nível de Acesso (Cargo)</label>
              <div className="relative">
                <select 
                  value={props.formRole} onChange={e => props.setFormRole && props.setFormRole(e.target.value)}
                  disabled={props.readOnlyRole || isReadOnly}
                  className="dash-select w-full pl-4 py-2 rounded-lg border outline-none bg-[var(--dash-bg)] disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                >
                  <option value="seller">Colaborador</option>
                  <option value="manager">Gerente</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">Função Exibida (Pública)</label>
              <input 
                type="text" value={formJobTitle} onChange={e => setFormJobTitle(e.target.value)}
                placeholder="Ex: Consultor de Vendas"
                disabled={isReadOnly}
                className="w-full px-4 py-2 rounded-lg border outline-none bg-[var(--dash-bg)] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 flex justify-between items-center">
                <span>Bio / Cargo <span className="text-red-500">*</span></span>
                <span className={`text-[10px] ${formBio.length >= 70 ? 'text-amber-500 font-bold' : 'text-zinc-400'}`}>
                  {formBio.length}/80
                </span>
              </label>
              <textarea 
                value={formBio} onChange={e => setFormBio(e.target.value.slice(0, 80))}
                placeholder="um pequeno texto sobre o vendedor"
                maxLength={80}
                rows={2}
                disabled={isReadOnly}
                className="w-full px-4 py-2 rounded-lg border outline-none bg-[var(--dash-bg)] resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
