"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  X, 
  PlusCircle, 
  ExternalLink, 
  Image as ImageIcon, 
  Loader2 
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export interface ProductRow {
  id: string;
  name: string;
  price: number | null;
  category_id: string | null;
  sku: string | null;
  description: string | null;
  image_url: string | null;
  image_urls: string[] | null;
  specs: any;
  [key: string]: any;
}

interface Category {
  id: string;
  name: string;
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
                <div className="relative aspect-square rounded-2xl border-2 border-dashed border-[var(--dash-border)] overflow-hidden flex items-center justify-center bg-[var(--dash-hover-bg)] group">
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
                      <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group">
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
                  <label className="aspect-square rounded-2xl border-2 border-dashed border-[var(--dash-border)] flex items-center justify-center cursor-pointer hover:bg-[var(--dash-hover-bg)] transition-colors">
                    <PlusCircle size={20} className="text-[var(--dash-text-muted)]" />
                    <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, true)} disabled={uploading} />
                  </label>
                </div>
              </div>
            </div>
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
                  className="w-full p-3 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-2xl focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoria</label>
                  <select 
                    value={product.category_id || ""}
                    onChange={(e) => updateData(rowIndex, "category_id", e.target.value)}
                    className="w-full p-3 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-2xl focus:ring-2 focus:ring-primary outline-none"
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
                    className="w-full p-3 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-2xl focus:ring-2 focus:ring-primary outline-none"
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
              className="w-full p-3 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-2xl focus:ring-2 focus:ring-primary outline-none resize-none"
            />
          </section>

          {/* Sessão: Especificações Técnicas */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold uppercase tracking-wider text-primary">Especificações Técnicas</h4>
              <button 
                onClick={addSpec}
                className="text-xs font-bold text-primary hover:underline"
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

          {/* Rodapé da Gaveta */}
          <div className="sticky bottom-0 left-0 right-0 p-6 bg-[var(--dash-surface)] border-t border-[var(--dash-border)] flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 p-3 font-bold border border-[var(--dash-border)] rounded-2xl hover:bg-[var(--dash-hover-bg)] transition-colors"
            >
              Concluir Edição
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
