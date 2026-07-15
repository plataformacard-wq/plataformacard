import { Globe, Upload, Trash2, Image as ImageIcon } from "lucide-react";

export default function SeoBrandAssets(props: any) {
  const {
    formData,
    setFormData,
    businessModel,
    setActiveUploadType,
    setShowImageEditor
  } = props;

  return (
    <section className="space-y-6 pt-6 border-t" style={{ borderColor: "var(--dash-border)" }}>
      <h2 className="text-base font-semibold" style={{ color: "var(--dash-text-primary)" }}>
        {businessModel === "B2C" ? "02. Identidade e Imagens" : "02. Identidade e Logos"}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Favicon */}
        <div className="space-y-3 relative">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold" style={{ color: "var(--dash-text-secondary)" }}>Favicon (Ícone da Aba)</label>
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/80">Recomendado: 1:1 Quadrado (ex: 256x256 px)</span>
          </div>
          <div className="h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 relative group cursor-pointer transition-all hover:bg-zinc-500/5 overflow-hidden"
                style={{ borderColor: "var(--dash-border)", background: "var(--dash-input-bg)" }}
                onClick={() => { setActiveUploadType("favicon"); setShowImageEditor(true); }}>
            {formData.favicon_url ? (
              <>
                <img src={formData.favicon_url} className="w-12 h-12 object-contain" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormData({ ...formData, favicon_url: "" });
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-lg shadow-sm hover:bg-red-600 transition-colors z-10"
                  title="Remover Favicon"
                >
                  <Trash2 size={14} />
                </button>
              </>
            ) : (
              <Globe size={24} style={{ color: "var(--dash-text-muted)" }} />
            )}
            <div className="pointer-events-none absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Upload size={20} className="text-white" />
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="space-y-3 relative">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold" style={{ color: "var(--dash-text-secondary)" }}>
              {businessModel === "B2C" ? "Foto de Perfil / Logotipo" : "Logotipo Principal"}
            </label>
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/80">Recomendado: 2:1 Retangular (ex: 800x400 px)</span>
          </div>
          <div className="h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 relative group cursor-pointer transition-all hover:bg-zinc-500/5 overflow-hidden"
                style={{ borderColor: "var(--dash-border)", background: "var(--dash-input-bg)" }}
                onClick={() => { setActiveUploadType("logo"); setShowImageEditor(true); }}>
            {formData.logo_url ? (
              <>
                <img src={formData.logo_url} className="max-w-[80%] max-h-[60%] object-contain" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormData({ ...formData, logo_url: "" });
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-lg shadow-sm hover:bg-red-600 transition-colors z-10"
                  title="Remover Logo"
                >
                  <Trash2 size={14} />
                </button>
              </>
            ) : (
              <Upload size={24} style={{ color: "var(--dash-text-muted)" }} />
            )}
            <div className="pointer-events-none absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Upload size={20} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Banner SEO */}
      <div className="space-y-3 relative">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold" style={{ color: "var(--dash-text-secondary)" }}>Banner de Compartilhamento (Redes Sociais)</label>
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/80">Recomendado: 1200x630 px</span>
        </div>
        <div className="h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 relative group cursor-pointer transition-all hover:bg-zinc-500/5 overflow-hidden"
              style={{ borderColor: "var(--dash-border)", background: "var(--dash-input-bg)" }}
              onClick={() => { setActiveUploadType("banner"); setShowImageEditor(true); }}>
          {formData.og_image_url ? (
            <>
              <img src={formData.og_image_url} className="w-full h-full object-contain p-2" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFormData({ ...formData, og_image_url: "" });
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-lg shadow-sm hover:bg-red-600 transition-colors z-10"
                title="Remover Banner"
              >
                <Trash2 size={14} />
              </button>
            </>
          ) : (
            <ImageIcon size={32} style={{ color: "var(--dash-text-muted)" }} />
          )}
          <div className="pointer-events-none absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Upload size={24} className="text-white" />
          </div>
        </div>
      </div>
    
      {/* Banner Publico */}
      <div className="space-y-3 relative mt-6 border-t pt-6" style={{ borderColor: "var(--dash-border)" }}>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold" style={{ color: "var(--dash-text-secondary)" }}>Banner do Cartão Público</label>
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/80">Aparece no topo do perfil público. Recomendado: 1200x400 px</span>
        </div>
        <div className="h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 relative group cursor-pointer transition-all hover:bg-zinc-500/5 overflow-hidden"
              style={{ borderColor: "var(--dash-border)", background: "var(--dash-input-bg)" }}
              onClick={() => { setActiveUploadType("public_banner"); setShowImageEditor(true); }}>
          {formData.public_banner_url ? (
            <>
              <img src={formData.public_banner_url} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFormData({ ...formData, public_banner_url: "" });
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-lg shadow-sm hover:bg-red-600 transition-colors z-10"
                title="Remover Banner Público"
              >
                <Trash2 size={14} />
              </button>
            </>
          ) : (
            <ImageIcon size={32} style={{ color: "var(--dash-text-muted)" }} />
          )}
          <div className="pointer-events-none absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Upload size={24} className="text-white" />
          </div>
        </div>
      </div>

    </section>
  );
}
