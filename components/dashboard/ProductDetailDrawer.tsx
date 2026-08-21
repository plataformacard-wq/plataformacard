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
  Tag,
  Sparkles
} from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { createClient } from "@/lib/supabase/client";
import { ProductStatusModal } from "@/components/dashboard/ProductStatusModal";

import DrawerImageGallery from "./product-drawer/DrawerImageGallery";
import DrawerDisplaySettings from "./product-drawer/DrawerDisplaySettings";
import DrawerBasicInfo from "./product-drawer/DrawerBasicInfo";
import DrawerDescription from "./product-drawer/DrawerDescription";
import DrawerTechnicalSpecs from "./product-drawer/DrawerTechnicalSpecs";

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
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-extrabold transition-all shadow-sm active:scale-95"
            >
              <Sparkles size={14} /> Status 360°
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-[var(--dash-hover-bg)] rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8 pb-32">
          <DrawerImageGallery
            product={product}
            handleImageUpload={handleImageUpload}
            removeGalleryImage={removeGalleryImage}
            uploading={uploading}
          />

          <DrawerDisplaySettings
            product={product}
            updateData={updateData}
            rowIndex={rowIndex}
            effectiveShowSpecs={effectiveShowSpecs}
            effectiveShowColors={effectiveShowColors}
            colors={colors}
            setColors={setColors}
            editingColorIdx={editingColorIdx}
            setEditingColorIdx={setEditingColorIdx}
            colorPickerValue={colorPickerValue}
            setColorPickerValue={setColorPickerValue}
            isPickerOpen={isPickerOpen}
            setIsPickerOpen={setIsPickerOpen}
            addColor={addColor}
          />

          <DrawerBasicInfo
            product={product}
            updateData={updateData}
            rowIndex={rowIndex}
            categories={categories}
          />

          <DrawerDescription
            product={product}
            updateData={updateData}
            rowIndex={rowIndex}
          />

          <DrawerTechnicalSpecs
            product={product}
            updateData={updateData}
            rowIndex={rowIndex}
            effectiveShowSpecs={effectiveShowSpecs}
            effectiveSpecsTitle={effectiveSpecsTitle}
            specs={specs}
            addSpec={addSpec}
            updateSpec={updateSpec}
            removeSpec={removeSpec}
          />

          {/* Rodapé da Gaveta */}
          <div className="sticky bottom-0 left-0 right-0 p-6 bg-[var(--dash-surface)] border-t border-[var(--dash-border)] flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 p-3 font-bold border border-[var(--dash-border)] rounded-lg hover:bg-[var(--dash-hover-bg)] transition-colors"
            >
              Concluir Edição
            </button>
          </div>
        </div>
      </motion.div>

      <ProductStatusModal
        product={product}
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
      />

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
