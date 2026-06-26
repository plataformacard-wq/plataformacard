"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  PlusCircle, 
  ExternalLink, 
  Image as  ImageIcon, 
  Loader2,
  Eye,
  EyeOff,
  Settings,
  Plus as PlusIcon,
  List,
  Palette,
  Tag
} from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { createClient } from "@/lib/supabase/client";

export interface ProductRow {
  id: string;
  name: string;
  price: number | null;
  category_id: string | null;
  sku: string | null;
  description: string | null;
  image_url: string | null;
  image_urls: string[] | string | null;
  specs: any;
  highlight_text?: string | null;
  show_highlight?: boolean | null;
  [key: string]: any;
}

interface Category {
  id: string;
  name: string;
  specs_title?: string | null;
  show_specs?: boolean | null;
  show_colors?: boolean | null;
  colors?: string[] | null;
}

interface ProductDetailDrawerProps {
  product: ProductRow;
  onClose: () => void;
  updateData: (index: number, id: string, value: any) => void;
  rowIndex: number;
  categories: Category[];
}

export default function ProductDetailDrawer({ 
  product, 
  onClose, 
  updateData, 
  rowIndex,
  categories 
}: ProductDetailDrawerProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [specs, setSpecs] = useState<any[]>(
    Array.isArray(product.specs) ? product.specs : []
  );
  const [colors, setColors] = useState<string[]>(
    Array.isArray(product.colors) ? product.colors : []
  );
  const [colorPickerValue, setColorPickerValue] = useState("#000000");
  const [editingColorIdx, setEditingColorIdx] = useState<number | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Adiciona uma nova especificação técnica (chave/valor)
  const addSpec = () => {
    const newSpecs = [...specs, { label: "", value: "" }];
    setSpecs(newSpecs);
    updateData(rowIndex, "specs", newSpecs);
  };

  // Atualiza um campo de especificação
  const updateSpec = (idx: number, field: string, val: string) => {
    const newSpecs = [...specs];
    newSpecs[idx] = { ...newSpecs[idx], [field]: val };
    setSpecs(newSpecs);
    updateData(rowIndex, "specs", newSpecs);
  };

  // Remove uma especificação
  const removeSpec = (idx: number) => {
    const newSpecs = specs.filter((_, i) => i !== idx);
    setSpecs(newSpecs);
    updateData(rowIndex, "specs", newSpecs);
  };

  // Gerencia cores (max 4)
  const addColor = (hex: string) => {
    if (editingColorIdx !== null) {
      const newColors = [...colors];
      newColors[editingColorIdx] = hex;
      setColors(newColors);
      updateData(rowIndex, "colors", newColors);
      setEditingColorIdx(null);
      return;
    }
    if (colors.length >= 4) return;
    const newColors = [...colors, hex];
    setColors(newColors);
    updateData(rowIndex, "colors", newColors);
  };

  const removeColor = (idx: number) => {
    const newColors = colors.filter((_, i) => i !== idx);
    setColors(newColors);
    updateData(rowIndex, "colors", newColors);
  };

  const currentCategory = categories.find(c => c.id === product.category_id);
  
  // Valores efetivos (considerando herança)
  const effectiveShowSpecs = product.show_specs ?? currentCategory?.show_specs ?? true;
  const effectiveShowColors = product.show_colors ?? currentCategory?.show_colors ?? false;
  const effectiveSpecsTitle = product.specs_title || currentCategory?.specs_title || "Especificações Técnicas";

  // Gerencia o upload de imagens para o Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${product.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      if (isGallery) {
        let currentGallery = product.image_urls;
        if (typeof currentGallery === 'string') {
          try { currentGallery = JSON.parse(currentGallery); } catch(e) { currentGallery = []; }
        }
        if (!Array.isArray(currentGallery)) currentGallery = [];
        
        updateData(rowIndex, "image_urls", [...currentGallery, publicUrl]);
      } else {
        updateData(rowIndex, "image_url", publicUrl);
      }
    } catch (error: any) {
      alert("Erro ao subir imagem: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Remove uma imagem da galeria (apenas do array, não deleta do storage para evitar perda acidental)
  const removeGalleryImage = (url: string) => {
    let currentGallery = product.image_urls;
    if (typeof currentGallery === 'string') {
      try { currentGallery = JSON.parse(currentGallery); } catch(e) { currentGallery = []; }
    }
    if (!Array.isArray(currentGallery)) currentGallery = [];
    
    updateData(rowIndex, "image_urls", currentGallery.filter(img => img !== url));
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end pointer-events-none">
      {/* Backdrop com efeito de desfoque */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
      />
      
      {/* Container da Gaveta Lateral */}
      <motion.div 
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative w-full max-w-xl bg-[var(--dash-surface)] h-full shadow-2xl pointer-events-auto overflow-y-auto border-l border-[var(--dash-border)]"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-[var(--dash-surface)] border-b border-[var(--dash-border)]">
          <div>
            <h3 className="text-xl font-bold text-[var(--dash-text-primary)]">Detalhes do Produto</h3>
            <p className="text-sm text-[var(--dash-text-muted)]">ID: {product.id.slice(0,8)}...</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[var(--dash-hover-bg)] rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8 pb-32">
          {/* Sessão: Gerenciamento de Imagens */}
          <section className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <ImageIcon size={16} /> Galeria de Imagens
            </h4>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Imagem Principal */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Imagem Principal</label>
                <div className="relative aspect-square rounded-xl border-2 border-dashed border-[var(--dash-border)] overflow-hidden flex items-center justify-center bg-[var(--dash-hover-bg)] group">
                  {product.image_url ? (
                    <>
                      <img src={product.image_url} alt="Principal" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer p-2 bg-white rounded-full text-black hover:scale-110 transition-transform">
                          <PlusCircle size={20} />
                          <input type="file" className="hidden" onChange={(e) => handleImageUpload(e)} disabled={uploading} />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="flex flex-col items-center gap-2 cursor-pointer p-4 text-center">
                      <ImageIcon size={32} className="text-[var(--dash-text-muted)]" />
                      <span className="text-xs text-[var(--dash-text-muted)]">Subir Capa</span>
                      <input type="file" className="hidden" onChange={(e) => handleImageUpload(e)} disabled={uploading} />
                    </label>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <Loader2 className="animate-spin text-primary" />
                    </div>
                  )}
                </div>
              </div>

              {/* Galeria Extra */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Fotos Extras ({Array.isArray(product.image_urls) ? product.image_urls.length : (typeof product.image_urls === 'string' && product.image_urls.startsWith('[') ? JSON.parse(product.image_urls).length : 0)})</label>
                <div className="grid grid-cols-2 gap-2">
                  {(() => {
                    let urls = product.image_urls;
                    if (typeof urls === 'string') {
                      try { urls = JSON.parse(urls); } catch(e) { urls = []; }
                    }
                    if (!Array.isArray(urls)) urls = [];
                    return urls.map((url: string, idx: number) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                        <img src={url} alt="Extra" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => removeGalleryImage(url)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ));
                  })()}
                  <label className="aspect-square rounded-xl border-2 border-dashed border-[var(--dash-border)] flex items-center justify-center cursor-pointer hover:bg-[var(--dash-hover-bg)] transition-colors">
                    <PlusCircle size={20} className="text-[var(--dash-text-muted)]" />
                    <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, true)} disabled={uploading} />
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Sessão: Configurações de Exibição */}
          <section className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Settings size={16} /> Configurações de Exibição
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl">
                <div className="flex items-center gap-2">
                  <List size={18} className="text-[var(--dash-text-muted)]" />
                  <span className="text-sm font-medium">Especificações</span>
                </div>
                <button 
                  onClick={() => updateData(rowIndex, "show_specs", !effectiveShowSpecs)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${effectiveShowSpecs ? 'bg-primary' : 'bg-zinc-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${effectiveShowSpecs ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl">
                <div className="flex items-center gap-2">
                  <Palette size={18} className="text-[var(--dash-text-muted)]" />
                  <span className="text-sm font-medium">Cores do Produto</span>
                </div>
                <button 
                  onClick={() => updateData(rowIndex, "show_colors", !effectiveShowColors)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${effectiveShowColors ? 'bg-primary' : 'bg-zinc-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${effectiveShowColors ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="md:col-span-2 flex flex-col gap-4 p-5 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag size={18} className="text-emerald-500" />
                    <span className="text-sm font-black uppercase tracking-tight">Destaque do Produto</span>
                  </div>
                  <button 
                    onClick={() => updateData(rowIndex, "show_highlight", !product.show_highlight)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${product.show_highlight ? 'bg-emerald-500' : 'bg-zinc-600'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${product.show_highlight ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                {product.show_highlight && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                    <input 
                      value={product.highlight_text || ""}
                      onChange={(e) => updateData(rowIndex, "highlight_text", e.target.value)}
                      placeholder="Ex: Produto Exclusivo, Sem CNH..."
                      className="w-full p-3 bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </motion.div>
                )}
              </div>
            </div>

            {effectiveShowColors && (
              <div className="p-6 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-zinc-400">
                    <Palette size={14} /> Adicione suas cores
                  </label>
                  <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
                    {colors.length}/4 CORES
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 items-end">
                  {colors.map((color, idx) => (
                    <div key={idx} className="relative group">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingColorIdx(idx);
                          setColorPickerValue(color);
                          setIsPickerOpen(true);
                        }}
                        className={`h-14 w-14 rounded-xl border-4 shadow-xl transition-all hover:scale-105 active:scale-95 ${editingColorIdx === idx ? 'border-primary ring-4 ring-primary/20' : 'border-white'}`}
                        style={{ backgroundColor: color }}
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const newColors = colors.filter((_, i) => i !== idx);
                          setColors(newColors);
                          updateData(rowIndex, "colors", newColors);
                          if (editingColorIdx === idx) {
                            setEditingColorIdx(null);
                            setIsPickerOpen(false);
                          }
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-600 z-10"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={() => {
                        if (colors.length < 4) {
                          setEditingColorIdx(null);
                          setColorPickerValue("#000000");
                          setIsPickerOpen(!isPickerOpen);
                        }
                      }}
                      className="h-14 w-14 rounded-xl border-4 border-white shadow-xl overflow-hidden hover:scale-105 active:scale-95 transition-all relative"
                      style={{ background: "linear-gradient(to bottom, #ff0000 0%, #ff00ff 17%, #0000ff 33%, #00ffff 50%, #00ff00 67%, #ffff00 83%, #ff0000 100%)" }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5 hover:bg-transparent transition-colors">
                        <PlusIcon size={18} className="text-white drop-shadow-md" />
                      </div>
                    </button>

                    <AnimatePresence>
                      {isPickerOpen && (
                        <>
                          <div className="fixed inset-0 z-[60]" onClick={() => setIsPickerOpen(false)} />
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 bottom-full mb-4 z-[70] p-6 rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.5)] border min-w-[280px]"
                            style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
                          >
                            <div className="space-y-5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--dash-text-muted)" }}>
                                  {editingColorIdx !== null ? "Ajustar Cor" : "Nova Escolha"}
                                </span>
                                <button onClick={() => setIsPickerOpen(false)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full transition-colors">
                                  <X size={14} style={{ color: "var(--dash-text-muted)" }} />
                                </button>
                              </div>

                              <div className="premium-picker-wrapper">
                                <HexColorPicker color={colorPickerValue} onChange={setColorPickerValue} />
                              </div>

                              <div className="space-y-2">
                                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: "var(--dash-text-muted)" }}>Sugestões</p>
                                <div className="flex flex-wrap gap-2">
                                  {['#FF0000', '#0000FF', '#FFFF00', '#000000', '#FFFFFF', '#008000', '#808080', '#FFA500'].map(preset => (
                                    <button
                                      key={preset}
                                      type="button"
                                      onClick={() => {
                                        setColorPickerValue(preset);
                                      }}
                                      className="h-7 w-7 rounded-lg border shadow-sm hover:scale-110 transition-transform active:scale-90"
                                      style={{ backgroundColor: preset, borderColor: "var(--dash-border)" }}
                                      title={preset}
                                    />
                                  ))}
                                </div>
                              </div>

                              <div className="flex items-center gap-4 p-4 rounded-xl border" style={{ background: "var(--dash-surface-secondary)", borderColor: "var(--dash-border)" }}>
                                <div className="h-10 w-10 rounded-xl border shadow-inner shrink-0" style={{ backgroundColor: colorPickerValue, borderColor: "var(--dash-border)" }} />
                                <div className="flex-1">
                                  <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: "var(--dash-text-muted)" }}>[Cor Personalizada]</p>
                                  <p className="text-xs font-mono font-bold" style={{ color: "var(--dash-text-primary)" }}>{colorPickerValue.toUpperCase()}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsPickerOpen(false);
                                    setEditingColorIdx(null);
                                  }}
                                  className="px-4 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border"
                                  style={{ background: "var(--dash-surface-secondary)", color: "var(--dash-text-muted)", borderColor: "var(--dash-border)" }}
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    addColor(colorPickerValue);
                                    setIsPickerOpen(false);
                                  }}
                                  className="px-4 py-3.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95 border-none"
                                >
                                  {editingColorIdx !== null ? "Atualizar" : "Confirmar"}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Sessão: Informações Básicas */}
          <section className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <PlusCircle size={16} /> Informações Básicas
            </h4>
            
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Produto</label>
                <input 
                  value={product.name}
                  onChange={(e) => updateData(rowIndex, "name", e.target.value)}
                  className="w-full p-3 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoria</label>
                  <select 
                    value={product.category_id || ""}
                    onChange={(e) => updateData(rowIndex, "category_id", e.target.value)}
                    className="dash-select w-full pl-3 py-3 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">SKU</label>
                  <input 
                    value={product.sku || ""}
                    onChange={(e) => updateData(rowIndex, "sku", e.target.value)}
                    className="w-full p-3 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Sessão: Descrição Completa */}
          <section className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <ExternalLink size={16} /> Descrição Detalhada
            </h4>
            <textarea 
              value={product.description || ""}
              onChange={(e) => updateData(rowIndex, "description", e.target.value)}
              rows={5}
              placeholder="Descreva as características principais do produto..."
              className="w-full p-3 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none"
            />
          </section>

          {/* Sessão: Especificações Técnicas */}
          {effectiveShowSpecs && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <input 
                    value={product.specs_title || ""}
                    onChange={(e) => updateData(rowIndex, "specs_title", e.target.value)}
                    placeholder={effectiveSpecsTitle}
                    className="text-sm font-bold uppercase tracking-wider text-primary bg-transparent border-none focus:ring-0 w-full p-0 placeholder:opacity-50"
                  />
                </div>
                <button 
                  onClick={addSpec}
                  className="text-xs font-bold text-primary hover:underline flex-shrink-0"
                >
                  + Adicionar Campo
                </button>
              </div>
              
              <div className="space-y-3">
                {specs.map((spec, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input 
                      placeholder="Título (ex: Material)"
                      value={spec.label}
                      onChange={(e) => updateSpec(idx, "label", e.target.value)}
                      className="flex-1 p-2 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl text-sm"
                    />
                    <input 
                      placeholder="Valor (ex: Alumínio)"
                      value={spec.value}
                      onChange={(e) => updateSpec(idx, "value", e.target.value)}
                      className="flex-1 p-2 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl text-sm"
                    />
                    <button 
                      onClick={() => removeSpec(idx)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {specs.length === 0 && (
                  <p className="text-xs text-[var(--dash-text-muted)] italic">Nenhuma especificação técnica adicionada.</p>
                )}
              </div>
            </section>
          )}

          {/* Rodapé da Gaveta */}
          <div className="sticky bottom-0 left-0 right-0 p-6 bg-[var(--dash-surface)] border-t border-[var(--dash-border)] flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 p-3 font-bold border border-[var(--dash-border)] rounded-xl hover:bg-[var(--dash-hover-bg)] transition-colors"
            >
              Concluir Edição
            </button>
          </div>
        </div>
      </motion.div>

      <style jsx global>{`
        .premium-picker-wrapper .react-colorful {
          width: 100% !important;
          height: 180px !important;
          border-radius: 24px !important;
        }
        .premium-picker-wrapper .react-colorful__saturation {
          border-radius: 20px 20px 6px 6px !important;
        }
        .premium-picker-wrapper .react-colorful__hue {
          height: 16px !important;
          border-radius: 10px !important;
          margin-top: 14px !important;
        }
        .premium-picker-wrapper .react-colorful__pointer {
          width: 22px !important;
          height: 22px !important;
          border: 3px solid white !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important;
        }
      `}</style>
    </div>
  );
}
