"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ImageIcon,
  Smartphone,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2
} from "lucide-react";
import ImageUploadModal from "@/components/dashboard/ImageUploadModal";

export default function ConfiguracoesBannersTab(props: any) {
  const {
    localBanners,
    setLocalBanners,
    bannerSpeed,
    setBannerSpeed,
    bannerInitialIndex,
    setBannerInitialIndex,
    showBanners,
    setShowBanners,
    saving,
    saved,
    handleSave
  } = props;

  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBannerIndex, setEditingBannerIndex] = useState<number | null>(null);
  const [tempBanner, setTempBanner] = useState<any>({});
  const [uploadMode, setUploadMode] = useState<"desktop" | "mobile" | null>(null);

  const handleAddBanner = () => {
    setTempBanner({ active: true, type: 'image' });
    setEditingBannerIndex(null);
    setIsBannerModalOpen(true);
  };

  const handleEditBanner = (index: number) => {
    setTempBanner({ ...localBanners[index] });
    setEditingBannerIndex(index);
    setIsBannerModalOpen(true);
  };

  const handleRemoveBanner = (index: number) => {
    if (confirm("Tem certeza que deseja remover este banner?")) {
      const updated = [...localBanners];
      updated.splice(index, 1);
      setLocalBanners(updated);
    }
  };

  const handleMoveBanner = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const updated = [...localBanners];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      setLocalBanners(updated);
    } else if (direction === 'down' && index < localBanners.length - 1) {
      const updated = [...localBanners];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      setLocalBanners(updated);
    }
  };

  const handleSaveBannerModal = () => {
    if (!tempBanner.image_desktop_url || !tempBanner.image_mobile_url) {
      alert("As imagens para Desktop e Mobile são obrigatórias para este banner.");
      return;
    }
    const updated = [...localBanners];
    if (editingBannerIndex !== null) {
      updated[editingBannerIndex] = tempBanner;
    } else {
      updated.push(tempBanner);
    }
    setLocalBanners(updated);
    setIsBannerModalOpen(false);
  };

  return (
    <>
          <motion.div
            key="banners"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid gap-8"
          >
            <section className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
              <div className="flex items-center justify-between border-b border-[var(--dash-border)] pb-8">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <ImageIcon size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">Gerenciar Banners</h3>
                    <p className="text-sm text-[var(--dash-text-muted)] font-medium">Imagens de destaque que aparecem no topo do seu catálogo.</p>
                  </div>
                </div>
                <button
                  onClick={handleAddBanner}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  <Plus size={16} /> Adicionar Banner
                </button>
              </div>

              {/* Toggle Exibir Banners */}
              <div className="flex items-center justify-between p-6 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl">
                <div className="space-y-1 pr-6">
                  <label className="text-sm font-black text-[var(--dash-text-primary)] tracking-tight">Exibir Banners no Catálogo Público</label>
                  <p className="text-[11px] font-medium text-[var(--dash-text-muted)] leading-relaxed">
                    Ative ou desative a exibição do carrossel de banners (banners customizados ou produtos em destaque) no topo da vitrine pública.
                  </p>
                </div>
                <button
                  onClick={() => setShowBanners(!showBanners)}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${showBanners ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-300 ease-in-out ${showBanners ? 'translate-x-2' : '-translate-x-2'}`} />
                </button>
              </div>

              {/* Configurações do Carrossel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)] flex items-center gap-2">
                    Tempo de Transição (Segundos)
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="30"
                    value={bannerSpeed}
                    onChange={(e) => setBannerSpeed(parseInt(e.target.value) || 5)}
                    className="w-full p-4 bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)] flex items-center gap-2">
                    Banner Inicial
                  </label>
                  <select
                    value={bannerInitialIndex}
                    onChange={(e) => setBannerInitialIndex(parseInt(e.target.value))}
                    className="w-full p-4 bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-sm"
                  >
                    <option value="-1">Aleatório (Sorteio)</option>
                    {localBanners.map((_: any, i: number) => (
                      <option key={i} value={i}>Banner {i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lista de Banners */}
              <div className="space-y-4">
                {localBanners.length === 0 ? (
                  <div className="text-center p-12 border-2 border-dashed border-[var(--dash-border)] rounded-xl">
                    <ImageIcon size={48} className="mx-auto text-[var(--dash-text-muted)] opacity-50 mb-4" />
                    <p className="text-[var(--dash-text-muted)] font-medium">Nenhum banner configurado.</p>
                  </div>
                ) : (
                  localBanners.map((banner: any, index: number) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-xl hover:border-primary/50 transition-colors">
                      <div className="flex flex-col gap-1">
                        <button disabled={index === 0} onClick={() => handleMoveBanner(index, 'up')} className="p-1 text-[var(--dash-text-muted)] hover:text-white disabled:opacity-20"><ArrowUp size={16} /></button>
                        <button disabled={index === localBanners.length - 1} onClick={() => handleMoveBanner(index, 'down')} className="p-1 text-[var(--dash-text-muted)] hover:text-white disabled:opacity-20"><ArrowDown size={16} /></button>
                      </div>
                      
                      <div className="h-16 w-32 bg-zinc-900 rounded-lg overflow-hidden shrink-0 border border-[var(--dash-border)] flex items-center justify-center">
                        {banner.image_desktop_url ? (
                          <img src={banner.image_desktop_url} alt="Desktop Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--dash-text-muted)]">Sem Img</div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 px-4">
                        <h4 className="font-bold text-sm truncate">
                          {banner.title || "Banner sem título"}
                        </h4>
                        <p className="text-xs text-[var(--dash-text-muted)] truncate">
                          {banner.description || "Nenhuma descrição"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                           <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${banner.active !== false ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                             {banner.active !== false ? 'ATIVO' : 'INATIVO'}
                           </span>
                           {(!banner.image_desktop_url || !banner.image_mobile_url) ? (
                             <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                               INCOMPLETO
                             </span>
                           ) : null}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            const updated = [...localBanners];
                            updated[index].active = updated[index].active === false ? true : false;
                            setLocalBanners(updated);
                          }} 
                          className="p-3 bg-[var(--dash-hover-bg)] hover:bg-emerald-500/20 hover:text-emerald-500 rounded-xl transition-colors"
                          title={banner.active !== false ? "Ocultar Banner" : "Visualizar Banner"}
                        >
                          {banner.active !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button onClick={() => handleEditBanner(index)} className="p-3 bg-[var(--dash-hover-bg)] hover:bg-primary/20 hover:text-primary rounded-xl transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleRemoveBanner(index)} className="p-3 bg-[var(--dash-hover-bg)] hover:bg-red-500/20 hover:text-red-500 rounded-xl transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Salvar Botão */}
              <div className="flex justify-end pt-4 border-t border-[var(--dash-border)]">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`
                    flex items-center gap-3 px-12 py-4 rounded-2xl font-black text-lg transition-all shadow-xl
                    ${saved ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-primary text-white shadow-primary/20 hover:scale-105 active:scale-95'}
                    disabled:opacity-50
                  `}
                >
                  {saving ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : saved ? (
                    <CheckCircle2 size={24} />
                  ) : (
                    <Save size={24} />
                  )}
                  {saving ? "Salvando..." : saved ? "Salvo com sucesso!" : "Salvar Alterações"}
                </button>
              </div>
            </section>
          </motion.div>

      {/* Modal de Banner */}
      <AnimatePresence>
        {isBannerModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsBannerModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <h2 className="text-2xl font-black tracking-tight mb-8 text-[var(--dash-text-primary)]">
                {editingBannerIndex !== null ? "Editar Banner" : "Novo Banner"}
              </h2>

              <div className="space-y-8">
                    {/* Uploaders de Imagem */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)]">
                          Imagem Desktop (Obrigatório)
                        </label>
                        <div 
                          onClick={() => setUploadMode("desktop")}
                          className={`relative aspect-[4/1] md:aspect-auto md:h-32 rounded-2xl overflow-hidden border-2 border-dashed cursor-pointer transition-all ${tempBanner.image_desktop_url ? 'border-primary/50' : 'border-[var(--dash-border)] hover:border-primary'}`}
                        >
                          {tempBanner.image_desktop_url ? (
                            <img src={tempBanner.image_desktop_url} alt="Desktop" className="w-full h-full object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[var(--dash-text-muted)]">
                              <ImageIcon size={24} />
                              <span className="text-[10px] font-bold">1200x300</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)]">
                          Imagem Mobile (Obrigatório)
                        </label>
                        <div 
                          onClick={() => setUploadMode("mobile")}
                          className={`relative aspect-[5/2] md:aspect-auto md:h-32 rounded-2xl overflow-hidden border-2 border-dashed cursor-pointer transition-all ${tempBanner.image_mobile_url ? 'border-primary/50' : 'border-[var(--dash-border)] hover:border-primary'}`}
                        >
                          {tempBanner.image_mobile_url ? (
                            <img src={tempBanner.image_mobile_url} alt="Mobile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[var(--dash-text-muted)]">
                              <Smartphone size={24} />
                              <span className="text-[10px] font-bold">800x320</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)]">Título (Opcional)</label>
                        <input
                          type="text"
                          value={tempBanner.title || ""}
                          onChange={(e) => setTempBanner({ ...tempBanner, title: e.target.value })}
                          className="w-full p-4 bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-xl focus:border-primary outline-none text-sm font-medium transition-colors text-[var(--dash-text-primary)] placeholder:text-[var(--dash-text-muted)]"
                          placeholder="Ex: Oferta de Inverno"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)]">Descrição (Opcional)</label>
                        <input
                          type="text"
                          value={tempBanner.description || ""}
                          onChange={(e) => setTempBanner({ ...tempBanner, description: e.target.value })}
                          className="w-full p-4 bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-xl focus:border-primary outline-none text-sm font-medium transition-colors text-[var(--dash-text-primary)] placeholder:text-[var(--dash-text-muted)]"
                          placeholder="Até 50% OFF em toda a loja..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)]">Texto do Botão (Opcional)</label>
                        <input
                          type="text"
                          value={tempBanner.button_text || ""}
                          onChange={(e) => setTempBanner({ ...tempBanner, button_text: e.target.value })}
                          className="w-full p-4 bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-xl focus:border-primary outline-none text-sm font-medium transition-colors text-[var(--dash-text-primary)] placeholder:text-[var(--dash-text-muted)]"
                          placeholder="Comprar Agora"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)]">Link do Botão (URL ou Produto)</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={tempBanner.button_link || ""}
                            onChange={(e) => setTempBanner({ ...tempBanner, button_link: e.target.value })}
                            className="w-full p-4 bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-xl focus:border-primary outline-none text-sm font-medium transition-colors text-[var(--dash-text-primary)] placeholder:text-[var(--dash-text-muted)]"
                            placeholder="https://... ou ID do Produto"
                          />
                        </div>
                      </div>
                    </div>

                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={tempBanner.active !== false} onChange={(e) => setTempBanner({ ...tempBanner, active: e.target.checked })} className="sr-only peer" />
                    <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    <span className="ml-3 text-sm font-medium text-[var(--dash-text-primary)]">Banner Ativo</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-10">
                <button
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveBannerModal}
                  className="px-8 py-3 rounded-xl bg-primary text-white text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Salvar Banner
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modais de Upload */}
      {uploadMode && (
        <ImageUploadModal
          isOpen={true}
          onClose={() => setUploadMode(null)}
          onUploadSuccess={(url) => {
            if (uploadMode === "desktop") setTempBanner({ ...tempBanner, image_desktop_url: url });
            if (uploadMode === "mobile") setTempBanner({ ...tempBanner, image_mobile_url: url });
            setUploadMode(null);
          }}
          aspectRatio={uploadMode === "desktop" ? 4 / 1 : 2.5 / 1}
          bucket="products"
          folder="banners"
          title={`Upload Imagem ${uploadMode === 'desktop' ? 'Desktop' : 'Mobile'}`}
        />
      )}
    </>
  );
}
