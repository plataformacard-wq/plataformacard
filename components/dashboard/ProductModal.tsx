"use client";

import React, { useState, useEffect, useCallback } from "react";
import nextDynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import 'react-quill-new/dist/quill.snow.css';
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { 
  X as XIcon, 
  Edit2 as EditIcon, 
  Trash2 as TrashIcon,
  Plus,
  Copy,
  Layers,
  Package,
  Tag,
  FileText,
  Settings,
  Eye,
  Camera,
  Plus as PlusIcon,
  Upload,
  GripVertical,
  Palette,
  DollarSign,
  Sparkles,
  Loader2,
  Check
} from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { enhanceDescriptionWithAI, fixProductOrthography } from "@/lib/ai-actions";
import AiReviewModal from "./AiReviewModal";
import { AiAssistButton } from "@/components/dashboard/AiAssistButton";
import ImageEditorModal from "@/components/dashboard/ImageEditorModal";

// Carregamento dinâmico do Quill
const ReactQuill = nextDynamic(() => import("react-quill-new"), { 
  ssr: false,
  loading: () => <div className="h-[120px] w-full rounded-2xl border border-zinc-200 bg-zinc-50 animate-pulse" />
});

type Spec = { id?: string; chave: string; valor: string };

interface ProductRow {
  id: string;
  organization_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  specs: Spec[] | null;
  price: number | null;
  compare_at_price: number | null;
  sku: string | null;
  has_retail: boolean | null;
  has_wholesale: boolean | null;
  wholesale_price: number | null;
  wholesale_min_quantity: number | null;
  price_display_mode: "retail" | "wholesale" | "both" | null;
  image_url: string | null;
  image_urls: string[] | null;
  is_active: boolean;
  is_in_stock: boolean;
  specs_title?: string | null;
  show_specs?: boolean | null;
  show_colors?: boolean | null;
  colors?: string[] | null;
  highlight_text?: string | null;
  show_highlight?: boolean | null;
}

interface Category {
  id: string;
  name: string;
  description?: string | null;
  sort_order?: number | null;
  specs_title?: string | null;
  show_specs?: boolean | null;
  show_colors?: boolean | null;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingProduct: ProductRow | null;
  categories: Category[];
  orgId: string;
  canCreateProduct: boolean;
}

export default function ProductModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editingProduct, 
  categories, 
  orgId,
  canCreateProduct 
}: ProductModalProps) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [productFormError, setProductFormError] = useState("");
  const [lastDescription, setLastDescription] = useState<string | null>(null);
  const [lastSpecs, setLastSpecs] = useState<any[] | null>(null);
  
  // Form State
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCompareAtPrice, setProductCompareAtPrice] = useState("");
  const [sku, setSku] = useState("");
  const [hasRetail, setHasRetail] = useState(true);
  const [hasWholesale, setHasWholesale] = useState(false);
  const [wholesalePrice, setWholesalePrice] = useState("");
  const [wholesaleMinQuantity, setWholesaleMinQuantity] = useState("");
  const [priceDisplayMode, setPriceDisplayMode] = useState<"retail" | "wholesale" | "both">("both");
  const [modalImages, setModalImages] = useState<{ id: string; url: string; file?: File; isExisting: boolean }[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isInStock, setIsInStock] = useState(true);
  const [showSpecs, setShowSpecs] = useState<boolean | null>(null);
  const [showColors, setShowColors] = useState<boolean | null>(null);
  const [specsTitle, setSpecsTitle] = useState("");
  const [productColors, setProductColors] = useState<string[]>([]);
  const [productHighlightText, setProductHighlightText] = useState("");
  const [showHighlight, setShowHighlight] = useState(false);
  const [lastSavedData, setLastSavedData] = useState<{ description: string; specs: any[] } | null>(null);
  
  // Drafts
  const [specChaveDraft, setSpecChaveDraft] = useState("");
  const [specValorDraft, setSpecValorDraft] = useState("");
  
  // UI Errors
  const [nameError, setNameError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [imageFileError, setImageFileError] = useState("");
  
  // Picker
  const [colorPickerValue, setColorPickerValue] = useState("#000000");
  const [editingColorIdx, setEditingColorIdx] = useState<number | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [aiLoadingType, setAiLoadingType] = useState<'description' | 'fixAll' | null>(null);
  const [reviewData, setReviewData] = useState<any>(null);
  
  // Image Editor State
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const isEditMode = !!editingProduct;

  // Initialize form and load last saved data
  useEffect(() => {
    const saved = localStorage.getItem("last_product_draft");
    if (saved) {
      try { setLastSavedData(JSON.parse(saved)); } catch(e) {}
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        setProductName(editingProduct.name.toUpperCase());
        setProductDescription(editingProduct.description ?? "");
        setSpecs(editingProduct.specs ?? []);
        setSelectedCategoryId(editingProduct.category_id || "");
        
        setProductPrice(formatPriceForInput(editingProduct.price));
        setProductCompareAtPrice(formatPriceForInput(editingProduct.compare_at_price));
        setSku(editingProduct.sku ?? "");
        setHasRetail(editingProduct.has_retail ?? true);
        setHasWholesale(editingProduct.has_wholesale ?? false);
        setWholesalePrice(formatPriceForInput(editingProduct.wholesale_price));
        setWholesaleMinQuantity(editingProduct.wholesale_min_quantity ? String(editingProduct.wholesale_min_quantity) : "");
        setPriceDisplayMode(editingProduct.price_display_mode || "both");
        
        let urls = editingProduct.image_urls;
        if (typeof urls === 'string') {
          try { urls = JSON.parse(urls); } catch(e) { urls = []; }
        }
        if (!Array.isArray(urls)) urls = [];
        const finalUrls = urls.length > 0 ? urls : (editingProduct.image_url ? [editingProduct.image_url] : []);
        
        setModalImages(finalUrls.map(url => ({
          id: `existing-${url}-${Math.random().toString(36).substr(2, 5)}`,
          url,
          isExisting: true
        })));
        
        setIsActive(editingProduct.is_active ?? true);
        setIsInStock(editingProduct.is_in_stock ?? true);
        setShowSpecs(editingProduct.show_specs ?? null);
        setShowColors(editingProduct.show_colors ?? null);
        setSpecsTitle(editingProduct.specs_title || "");
        setProductColors(Array.isArray(editingProduct.colors) ? editingProduct.colors : []);
        setProductHighlightText(editingProduct.highlight_text || "");
        setShowHighlight(editingProduct.show_highlight ?? false);
      } else {
        // Reset
        setProductName("");
        setProductDescription("");
        setSpecs([]);
        setSelectedCategoryId("");
        setProductPrice("");
        setProductCompareAtPrice("");
        setSku("");
        setHasRetail(true);
        setHasWholesale(false);
        setWholesalePrice("");
        setWholesaleMinQuantity("");
        setPriceDisplayMode("both");
        setModalImages([]);
        setIsActive(true);
        setIsInStock(true);
        setShowSpecs(null);
        setShowColors(null);
        setSpecsTitle("");
        setProductColors([]);
        setProductHighlightText("");
        setShowHighlight(false);
      }
      setProductFormError("");
      setNameError("");
      setCategoryError("");
      setPriceError("");
      setImageFileError("");
    }
  }, [isOpen, editingProduct]);

  // Sync category defaults
  const currentCategory = categories.find(c => c.id === selectedCategoryId);
  const effectiveShowSpecs = showSpecs ?? currentCategory?.show_specs ?? true;
  const effectiveShowColors = showColors ?? currentCategory?.show_colors ?? false;
  const effectiveSpecsTitle = specsTitle || currentCategory?.specs_title || "Especificações Técnicas";

  // Functions
  function formatPriceForInput(value: number | null): string {
    if (value === null || Number.isNaN(value)) return "";
    return value.toFixed(2).replace(".", ",");
  }

  function sanitizePriceTyping(raw: string): string {
    return raw.replace(/[^0-9.,]/g, "");
  }

  function parsePrice(value: string): number | null {
    if (!value.trim()) return null;
    const clean = value.replace(/\./g, "").replace(",", ".");
    const num = Number(clean);
    return isNaN(num) ? null : num;
  }

  const addColor = (hex: string) => {
    if (editingColorIdx !== null) {
      const newColors = [...productColors];
      newColors[editingColorIdx] = hex;
      setProductColors(newColors);
      setEditingColorIdx(null);
    } else if (productColors.length < 4) {
      setProductColors([...productColors, hex]);
    }
  };

  const removeColor = (idx: number) => {
    setProductColors(productColors.filter((_, i) => i !== idx));
  };

  const addSpec = () => {
    const chave = specChaveDraft.trim();
    const valor = specValorDraft.trim();
    if (!chave || !valor) return;
    setSpecs([...specs, { id: `new-spec-${Date.now()}`, chave, valor }]);
    setSpecChaveDraft("");
    setSpecValorDraft("");
  };

  const removeSpec = (idx: number) => {
    setSpecs(specs.filter((_, i) => i !== idx));
  };

  const editSpec = (idx: number) => {
    const s = specs[idx];
    setSpecChaveDraft(s.chave);
    setSpecValorDraft(s.valor);
    removeSpec(idx);
  };

  const handleCopyLastProduct = () => {
    if (lastSavedData) {
      setProductDescription(lastSavedData.description);
      setSpecs(lastSavedData.specs);
    }
  };

  // AI Handlers
  const canActivateAiAssist = (data: any) => (data.name?.length || 0) >= 3;

  const handleApplyAiSuggestions = (suggestions: any) => {
    if (suggestions.description) {
      setLastDescription(productDescription);
      setProductDescription(suggestions.description);
    }
    if (suggestions.name) {
      setProductName(suggestions.name);
    }
    if (suggestions.highlight) {
      setProductHighlightText(suggestions.highlight.toUpperCase().substring(0, 35));
    }
    if (suggestions.specs && Array.isArray(suggestions.specs)) {
      setLastSpecs(specs);
      setSpecs(suggestions.specs.map((s: any, i: number) => ({
        id: `ai-spec-${Date.now()}-${i}`,
        chave: s.chave,
        valor: s.valor
      })));
    }
  };

  const handleUndoAi = () => {
    if (lastDescription !== null) {
      setProductDescription(lastDescription);
      setLastDescription(null);
    }
    if (lastSpecs !== null) {
      setSpecs(lastSpecs);
      setLastSpecs(null);
    }
  };

  async function uploadProductImage(productId: string, file: File): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const filename = `${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const path = `${user.id}/${productId}/${filename}`;
    const { error } = await supabase.storage.from("products").upload(path, file);
    if (error) return null;
    const { data } = supabase.storage.from("products").getPublicUrl(path);
    return data.publicUrl;
  }

  const onImageEditorConfirm = (file: File, previewUrl: string) => {
    const newId = `new-${Date.now()}`;
    setModalImages(prev => [...prev, { id: newId, url: previewUrl, file, isExisting: false }].slice(0, 5));
    setShowImageEditor(false);
    setPendingFile(null);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProductFormError("");
    
    if (!isEditMode && !canCreateProduct) {
      setProductFormError("Limite do plano atingido.");
      return;
    }

    if (!productName.trim()) {
      setNameError("Nome obrigatório.");
      return;
    }

    if (!selectedCategoryId) {
      setCategoryError("Categoria obrigatória.");
      return;
    }

    setSaving(true);
    try {
      const parsedPrice = parsePrice(productPrice);
      const payload = {
        organization_id: orgId,
        category_id: selectedCategoryId,
        name: productName.trim(),
        description: productDescription.trim(),
        specs,
        price: parsedPrice ?? 0,
        compare_at_price: parsePrice(productCompareAtPrice),
        sku: sku.trim() || null,
        has_retail: hasRetail,
        has_wholesale: hasWholesale,
        wholesale_price: hasWholesale ? parsePrice(wholesalePrice) : null,
        wholesale_min_quantity: hasWholesale ? (parseInt(wholesaleMinQuantity) || null) : null,
        is_active: isActive,
        is_in_stock: isInStock,
        price_display_mode: priceDisplayMode,
        show_specs: showSpecs,
        show_colors: showColors,
        specs_title: specsTitle.trim() || null,
        colors: productColors,
        highlight_text: showHighlight ? productHighlightText.trim() : null,
        show_highlight: showHighlight,
      };

      let productId = editingProduct?.id;
      
      if (isEditMode && productId) {
        // Update images first
        const finalUrls: string[] = [];
        const safeId: string = productId;
        for (const img of modalImages) {
          if (img.isExisting) finalUrls.push(img.url);
          else if (img.file) {
            const uploaded = await uploadProductImage(safeId, img.file);
            if (uploaded) finalUrls.push(uploaded);
          }
        }
        
        const { error } = await supabase
          .from("products")
          .update({ 
            ...payload, 
            image_url: finalUrls[0] || null, 
            image_urls: finalUrls 
          })
          .eq("id", productId);
          
        if (error) throw error;
      } else {
        // Create
        const { data: inserted, error: insertError } = await supabase
          .from("products")
          .insert({ ...payload, image_urls: [] })
          .select("id")
          .single();
          
        if (insertError) throw insertError;
        productId = inserted.id;
        
        if (!productId) throw new Error("Falha ao obter ID do produto recém-criado.");

        const finalUrls: string[] = [];
        const safeId: string = productId;
        for (const img of modalImages) {
          if (img.file) {
            const uploaded = await uploadProductImage(safeId, img.file);
            if (uploaded) finalUrls.push(uploaded);
          }
        }
        
        if (finalUrls.length > 0) {
          await supabase.from("products").update({ 
            image_url: finalUrls[0], 
            image_urls: finalUrls 
          }).eq("id", productId);
        }
      }

    // Salva para a função "Copiar último"
    const draft = { description: productDescription.trim(), specs };
    localStorage.setItem("last_product_draft", JSON.stringify(draft));
    setLastSavedData(draft);

    onSuccess();
    onClose();
    } catch (err: any) {
      setProductFormError(err.message || "Erro ao salvar produto.");
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-md">
      <div 
        className="w-full max-w-2xl rounded-[32px] border p-0 shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col max-h-[90vh] overflow-hidden"
        style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
      >
        {/* Header */}
        <div className="relative px-10 py-8 border-b" style={{ background: "var(--dash-surface-secondary)", borderColor: "var(--dash-border)" }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black flex items-center gap-3">
                  {isEditMode ? <EditIcon size={28} className="text-emerald-500" /> : <Plus size={28} className="text-emerald-500" />}
                  {isEditMode ? (productName || "Editar Produto") : "Novo Produto"}
                </h2>
                {!isEditMode && lastSavedData && (
                  <button
                    type="button"
                    onClick={handleCopyLastProduct}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-black hover:bg-emerald-500/20 transition-all border border-emerald-500/20 uppercase tracking-wider mr-10"
                  >
                    <Copy size={12} /> Copiar dados do último
                  </button>
                )}
              </div>
              <p className="mt-1 text-sm font-medium" style={{ color: "var(--dash-text-muted)" }}>
                Gerencie os detalhes e a apresentação do seu item.
              </p>
            </div>
            <button onClick={onClose} className="rounded-2xl p-3 transition-colors" style={{ background: "var(--dash-surface)", color: "var(--dash-text-muted)" }}>
              <XIcon size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
          <form id="productForm" onSubmit={handleSubmit} className="space-y-8">
            {productFormError && <p className="text-xs text-red-500 font-bold bg-red-50 p-4 rounded-2xl border border-red-100">{productFormError}</p>}

            {/* Identidade */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: "var(--dash-text-muted)" }}>
                <Package size={16} /> Identidade do Produto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 rounded-2xl border" style={{ background: "var(--dash-surface-secondary)", borderColor: "var(--dash-border)" }}>
                <div className="md:col-span-2">
                  <label className="mb-2 flex items-center gap-2 text-sm font-black text-zinc-700 uppercase tracking-wider">
                    <Tag size={16} className="text-emerald-500" /> Categoria
                  </label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="w-full rounded-2xl border px-5 py-4 text-sm font-medium outline-none transition-all focus:border-emerald-500/50"
                    style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                  >
                    <option value="" style={{ background: "var(--dash-input-bg)" }}>Selecione uma categoria</option>
                    {categories.map((c) => <option key={c.id} value={c.id} style={{ background: "var(--dash-input-bg)" }}>{c.name}</option>)}
                  </select>
                  {categoryError && <p className="mt-1.5 text-xs text-red-500">{categoryError}</p>}
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-wider" style={{ color: "var(--dash-text-muted)" }}>Nome</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value.toUpperCase())}
                    className="w-full rounded-2xl border px-5 py-4 text-sm font-bold outline-none transition-all focus:border-emerald-500/50"
                    style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                  />
                  {nameError && <p className="mt-1.5 text-xs text-red-500">{nameError}</p>}
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-wider" style={{ color: "var(--dash-text-muted)" }}>SKU</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full rounded-2xl border px-5 py-4 text-sm font-bold outline-none transition-all focus:border-emerald-500/50"
                    style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-black uppercase tracking-wider flex items-center gap-2" style={{ color: "var(--dash-text-muted)" }}>
                      <Tag size={16} className="text-emerald-500" /> Destaque do Produto
                    </label>
                    {/* Slider Switch */}
                    <div 
                      onClick={() => setShowHighlight(!showHighlight)}
                      className={`flex items-center gap-3 cursor-pointer group`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--dash-text-muted)] group-hover:text-emerald-500 transition-colors">Ativar Destaque</span>
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${showHighlight ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                        <motion.div 
                          animate={{ x: showHighlight ? 22 : 4 }}
                          className="absolute top-1 w-3 h-3 bg-white rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={productHighlightText}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      if (val.length <= 35) setProductHighlightText(val);
                    }}
                    placeholder="Ex: PRODUTO EXCLUSIVO, SEM CNH..."
                    disabled={!showHighlight}
                    className={`w-full rounded-2xl border px-6 py-5 text-sm font-black outline-none transition-all focus:border-emerald-500/50 ${!showHighlight ? 'opacity-30 grayscale pointer-events-none' : 'border-emerald-500/30 bg-emerald-500/[0.02]'}`}
                    style={{ background: showHighlight ? "rgba(16, 185, 129, 0.02)" : "var(--dash-input-bg)", borderColor: showHighlight ? "rgba(16, 185, 129, 0.3)" : "var(--dash-border)", color: "var(--dash-text-primary)" }}
                  />
                  {showHighlight && (
                    <div className="mt-1.5 flex justify-end">
                      <span className={`text-[9px] font-black tracking-widest uppercase ${productHighlightText.length >= 30 ? 'text-amber-500' : 'text-zinc-500'}`}>
                        {productHighlightText.length} / 35 CARACTERES
                      </span>
                    </div>
                  )}
                  <p className="mt-2 text-[10px] font-bold" style={{ color: "var(--dash-text-muted)" }}>
                    Este texto aparecerá com alta visibilidade no catálogo público para destacar um diferencial.
                  </p>
                </div>
                
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setIsActive(!isActive)} 
                    className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all cursor-pointer ${isActive ? 'border-emerald-500 bg-emerald-500/[0.05]' : ''}`}
                    style={{ 
                      borderColor: isActive ? "rgba(16, 185, 129, 0.3)" : "var(--dash-border)",
                      background: isActive ? "rgba(16, 185, 129, 0.05)" : "var(--dash-surface-secondary)"
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                        <Eye size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider" style={{ color: isActive ? "var(--dash-text-primary)" : "var(--dash-text-muted)" }}>Visível</p>
                      </div>
                    </div>
                    {/* Slider Switch */}
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${isActive ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                      <motion.div 
                        animate={{ x: isActive ? 22 : 4 }}
                        className="absolute top-1 w-3 h-3 bg-white rounded-full"
                      />
                    </div>
                  </div>

                  <div 
                    onClick={() => setIsInStock(!isInStock)} 
                    className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all cursor-pointer ${isInStock ? 'border-emerald-500 bg-emerald-500/[0.05]' : ''}`}
                    style={{ 
                      borderColor: isInStock ? "rgba(16, 185, 129, 0.3)" : "var(--dash-border)",
                      background: isInStock ? "rgba(16, 185, 129, 0.05)" : "var(--dash-surface-secondary)"
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isInStock ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider" style={{ color: isInStock ? "var(--dash-text-primary)" : "var(--dash-text-muted)" }}>Estoque</p>
                      </div>
                    </div>
                    {/* Slider Switch */}
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${isInStock ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                      <motion.div 
                        animate={{ x: isInStock ? 22 : 4 }}
                        className="absolute top-1 w-3 h-3 bg-white rounded-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-black uppercase tracking-wider">Descrição</label>
                  </div>
                  <ReactQuill theme="snow" value={productDescription} onChange={setProductDescription} className="quill-premium" />
                </div>
              </div>
            </div>

            {/* PREÇOS */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: "var(--dash-text-muted)" }}>
                <DollarSign size={16} /> Estrutura de Preços
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* VAREJO */}
                <div 
                  className={`relative p-8 rounded-[40px] border-2 transition-all duration-500 ${
                    hasRetail 
                      ? 'border-emerald-500 bg-emerald-500/[0.05] shadow-[0_20px_40px_rgba(16,185,129,0.12)]' 
                      : 'opacity-20 grayscale'
                  }`}
                  style={{ 
                    background: hasRetail ? "rgba(16, 185, 129, 0.05)" : "var(--dash-surface-secondary)",
                    borderColor: hasRetail ? "#10b981" : "var(--dash-border)"
                  }}
                >
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl ${hasRetail ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-zinc-800 text-zinc-500'}`}>
                        <Tag size={20} />
                      </div>
                      <span className="text-sm font-black uppercase tracking-tighter" style={{ color: hasRetail ? "var(--dash-text-primary)" : "var(--dash-text-muted)" }}>Varejo</span>
                    </div>
                    
                    {/* Slider Switch */}
                    <button 
                      type="button"
                      onClick={() => setHasRetail(!hasRetail)}
                      className={`w-14 h-7 rounded-full relative transition-colors duration-300 ${hasRetail ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                    >
                      <motion.div 
                        animate={{ x: hasRetail ? 28 : 4 }}
                        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <label className="text-[10px] font-black uppercase tracking-widest ml-2 mb-1 block" style={{ color: "var(--dash-text-muted)" }}>Preço de Venda</label>
                      <span className="absolute left-5 top-[38px] text-xs font-black opacity-40">R$</span>
                      <input 
                        type="text" 
                        value={productPrice} 
                        onChange={(e) => setProductPrice(sanitizePriceTyping(e.target.value))} 
                        placeholder="0,00" 
                        className="w-full rounded-3xl border-2 pl-12 pr-6 py-5 text-2xl font-black outline-none focus:border-emerald-500 transition-all shadow-inner"
                        style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                      />
                    </div>

                    <div className="relative opacity-80">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 mb-1 block" style={{ color: "var(--dash-text-muted)" }}>Preço de Ancoragem (De:)</label>
                      <span className="absolute left-5 top-[38px] text-xs font-black opacity-40">R$</span>
                      <input 
                        type="text" 
                        value={productCompareAtPrice} 
                        onChange={(e) => setProductCompareAtPrice(sanitizePriceTyping(e.target.value))} 
                        placeholder="0,00" 
                        className="w-full rounded-2xl border-2 border-dashed pl-12 pr-6 py-3 text-sm font-bold line-through outline-none focus:border-zinc-400 transition-all"
                        style={{ background: "var(--dash-surface-secondary)", borderColor: "var(--dash-border)", color: "var(--dash-text-muted)" }}
                      />
                    </div>
                  </div>
                </div>

                {/* ATACADO */}
                <div 
                  className={`relative p-8 rounded-[40px] border-2 transition-all duration-500 ${
                    hasWholesale 
                      ? 'border-emerald-500 bg-emerald-500/[0.05] shadow-[0_20px_40px_rgba(16,185,129,0.12)]' 
                      : 'opacity-20 grayscale'
                  }`}
                  style={{ 
                    background: hasWholesale ? "rgba(16, 185, 129, 0.05)" : "var(--dash-surface-secondary)",
                    borderColor: hasWholesale ? "#10b981" : "var(--dash-border)"
                  }}
                >
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl ${hasWholesale ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-zinc-800 text-zinc-500'}`}>
                        <DollarSign size={20} />
                      </div>
                      <span className="text-sm font-black uppercase tracking-tighter" style={{ color: hasWholesale ? "var(--dash-text-primary)" : "var(--dash-text-muted)" }}>Atacado</span>
                    </div>
                    
                    {/* Slider Switch */}
                    <button 
                      type="button"
                      onClick={() => setHasWholesale(!hasWholesale)}
                      className={`w-14 h-7 rounded-full relative transition-colors duration-300 ${hasWholesale ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                    >
                      <motion.div 
                        animate={{ x: hasWholesale ? 28 : 4 }}
                        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <label className="text-[10px] font-black uppercase tracking-widest ml-2 mb-1 block" style={{ color: "var(--dash-text-muted)" }}>Preço de Atacado</label>
                      <span className="absolute left-5 top-[38px] text-xs font-black opacity-40">R$</span>
                      <input 
                        type="text" 
                        value={wholesalePrice} 
                        onChange={(e) => setWholesalePrice(sanitizePriceTyping(e.target.value))} 
                        placeholder="0,00" 
                        className="w-full rounded-3xl border-2 pl-12 pr-6 py-5 text-2xl font-black outline-none focus:border-emerald-500 transition-all shadow-inner"
                        style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                      />
                    </div>

                    <div className="relative">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2 mb-1 block" style={{ color: "var(--dash-text-muted)" }}>Quantidade Mínima</label>
                      <input 
                        type="number" 
                        value={wholesaleMinQuantity} 
                        onChange={(e) => setWholesaleMinQuantity(e.target.value)} 
                        placeholder="Ex: 10" 
                        className="w-full rounded-2xl border-2 pl-6 pr-16 py-3 text-sm font-bold outline-none focus:border-emerald-500/50 transition-all"
                        style={{ background: "var(--dash-surface-secondary)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                      />
                      <span className="absolute right-4 top-[38px] text-[10px] font-black uppercase tracking-widest pointer-events-none" style={{ color: "var(--dash-text-muted)" }}>UNID.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Especificações e Cores */}
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  type="button" 
                  onClick={() => setShowSpecs(!effectiveShowSpecs)} 
                  className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${effectiveShowSpecs ? 'border-emerald-500/30 bg-emerald-500/[0.05]' : ''}`}
                  style={{ 
                    borderColor: effectiveShowSpecs ? "rgba(16, 185, 129, 0.3)" : "var(--dash-border)",
                    background: effectiveShowSpecs ? "rgba(16, 185, 129, 0.05)" : "var(--dash-surface-secondary)"
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${effectiveShowSpecs ? 'bg-emerald-500 text-white' : 'text-zinc-500'}`} style={{ background: effectiveShowSpecs ? "" : "var(--dash-border)" }}>
                      <FileText size={18} />
                    </div>
                    <span className="text-sm font-black uppercase tracking-tight" style={{ color: effectiveShowSpecs ? "var(--dash-text-primary)" : "var(--dash-text-muted)" }}>Especificações</span>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${effectiveShowSpecs ? 'bg-emerald-500' : 'bg-zinc-600'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${effectiveShowSpecs ? 'right-1' : 'left-1'}`} />
                  </div>
                </button>

                <button 
                  type="button" 
                  onClick={() => setShowColors(!effectiveShowColors)} 
                  className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${effectiveShowColors ? 'border-emerald-500/30 bg-emerald-500/[0.05]' : ''}`}
                  style={{ 
                    borderColor: effectiveShowColors ? "rgba(16, 185, 129, 0.3)" : "var(--dash-border)",
                    background: effectiveShowColors ? "rgba(16, 185, 129, 0.05)" : "var(--dash-surface-secondary)"
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${effectiveShowColors ? 'bg-emerald-500 text-white' : 'text-zinc-500'}`} style={{ background: effectiveShowColors ? "" : "var(--dash-border)" }}>
                      <Palette size={18} />
                    </div>
                    <span className="text-sm font-black uppercase tracking-tight" style={{ color: effectiveShowColors ? "var(--dash-text-primary)" : "var(--dash-text-muted)" }}>Cores</span>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${effectiveShowColors ? 'bg-emerald-500' : 'bg-zinc-600'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${effectiveShowColors ? 'right-1' : 'left-1'}`} />
                  </div>
                </button>
              </div>

              {effectiveShowColors && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 rounded-[32px] border-2 space-y-6"
                  style={{ background: "var(--dash-surface-secondary)", borderColor: "var(--dash-border)" }}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--dash-text-muted)" }}>Paleta de Cores</h4>
                    <span className="text-[10px] font-bold" style={{ color: "var(--dash-text-muted)" }}>{productColors.length}/4 cores</span>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {productColors.map((c, i) => (
                      <div key={i} className="group relative">
                        <div className="h-14 w-14 rounded-2xl border-4 shadow-xl cursor-pointer transition-transform hover:scale-110" style={{ backgroundColor: c, borderColor: "var(--dash-surface)" }} onClick={() => removeColor(i)} />
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <XIcon size={10} />
                        </div>
                      </div>
                    ))}
                    {productColors.length < 4 && (
                      <button 
                        type="button" 
                        onClick={() => setIsPickerOpen(!isPickerOpen)} 
                        className="h-14 w-14 rounded-2xl border-2 border-dashed flex items-center justify-center text-zinc-400 hover:border-emerald-500 hover:text-emerald-500 transition-all"
                        style={{ borderColor: "var(--dash-border)" }}
                      >
                        <Plus size={24} />
                      </button>
                    )}
                  </div>
                  <AnimatePresence>
                    {isPickerOpen && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-col items-center gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800"
                      >
                        <HexColorPicker color={colorPickerValue} onChange={setColorPickerValue} />
                        <button 
                          type="button"
                          onClick={() => { addColor(colorPickerValue); setIsPickerOpen(false); }}
                          className="px-6 py-2 bg-zinc-900 text-white rounded-xl text-xs font-black uppercase tracking-widest"
                        >
                          Confirmar Cor
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {effectiveShowSpecs && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="relative">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-2 mb-1 block" style={{ color: "var(--dash-text-muted)" }}>Nome da Sessão de Especificações</label>
                    <input 
                      type="text" 
                      value={specsTitle} 
                      onChange={e => setSpecsTitle(e.target.value)} 
                      placeholder="Ex: ESPECIFICAÇÕES TÉCNICAS" 
                      className="w-full rounded-2xl border-2 px-5 py-3 text-xs font-black uppercase tracking-widest outline-none focus:border-emerald-500/50 transition-all" 
                      style={{ background: "var(--dash-surface-secondary)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                    />
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <input 
                        type="text" 
                        value={specChaveDraft} 
                        onChange={e => setSpecChaveDraft(e.target.value)} 
                        placeholder="Nome (ex: Peso)" 
                        className="w-full rounded-2xl border-2 px-5 py-4 text-sm font-bold outline-none focus:border-emerald-500/50 transition-all" 
                        style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                      />
                    </div>
                    <div className="flex-1 relative">
                      <input 
                        type="text" 
                        value={specValorDraft} 
                        onChange={e => setSpecValorDraft(e.target.value)} 
                        placeholder="Valor (ex: 500g)" 
                        className="w-full rounded-2xl border-2 px-5 py-4 text-sm font-bold outline-none focus:border-emerald-500/50 transition-all" 
                        style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={addSpec} 
                      className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      <Plus size={24} />
                    </button>
                  </div>
                  
                  <Reorder.Group 
                    axis="y" 
                    values={specs} 
                    onReorder={setSpecs}
                    className="grid grid-cols-1 gap-3"
                  >
                    <AnimatePresence>
                      {specs.map((s, i) => (
                        <Reorder.Item 
                          key={s.id || `${s.chave}-${i}`}
                          value={s}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="group flex items-center justify-between p-4 rounded-2xl border-2 hover:border-emerald-500/30 transition-all shadow-sm cursor-grab active:cursor-grabbing"
                          style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)" }}
                        >
                          <div className="flex-1 flex items-center gap-3">
                            <div className="text-zinc-300 group-hover:text-emerald-500 transition-colors">
                              <GripVertical size={16} />
                            </div>
                            <div className="flex-1 flex items-center justify-between pr-4">
                              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{s.chave}</span>
                              <span className="text-sm font-bold" style={{ color: "var(--dash-text-primary)" }}>{s.valor}</span>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button" onClick={() => editSpec(i)} className="p-2 text-zinc-400 hover:text-emerald-500"><EditIcon size={14}/></button>
                            <button type="button" onClick={() => removeSpec(i)} className="p-2 text-zinc-400 hover:text-red-500"><TrashIcon size={14}/></button>
                          </div>
                        </Reorder.Item>
                      ))}
                    </AnimatePresence>
                  </Reorder.Group>
                </motion.div>
              )}
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Galeria (Até 5 fotos)</h3>
                <span className="text-[10px] font-bold text-zinc-500">Arraste para reordenar • A primeira é a principal</span>
              </div>
              
              <Reorder.Group 
                axis="x" 
                values={modalImages} 
                onReorder={setModalImages}
                className="flex flex-wrap gap-4"
              >
                <AnimatePresence>
                  {modalImages.map((img, i) => (
                    <Reorder.Item 
                      key={img.id} 
                      value={img}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative h-24 w-24 rounded-2xl overflow-hidden border-2 cursor-grab active:cursor-grabbing group shadow-sm hover:shadow-md transition-all"
                      style={{ 
                        borderColor: i === 0 ? "var(--dash-primary)" : "var(--dash-border)",
                        background: "var(--dash-surface-secondary)"
                      }}
                    >
                      <img src={img.url} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <GripVertical size={20} className="text-white" />
                      </div>
                      {i === 0 && (
                        <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-lg">
                          Principal
                        </div>
                      )}
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalImages(modalImages.filter(item => item.id !== img.id));
                        }} 
                        className="absolute top-1 right-1 bg-red-500/90 hover:bg-red-500 text-white p-1 rounded-lg backdrop-blur-sm transition-colors z-10"
                      >
                        <XIcon size={12}/>
                      </button>
                    </Reorder.Item>
                  ))}
                </AnimatePresence>

                {modalImages.length < 5 && (
                  <button 
                    type="button"
                    onClick={() => setShowImageEditor(true)}
                    className="h-24 w-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5 group"
                    style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)" }}
                  >
                    <Upload size={20} className="text-zinc-500 group-hover:text-emerald-500 transition-colors" />
                    <span className="text-[10px] font-black uppercase text-zinc-500 group-hover:text-emerald-500">Adicionar</span>
                  </button>
                )}
              </Reorder.Group>
            </div>

            {/* SESSÃO: FILTRO DE QUALIDADE IA */}
            <div className="pt-10 border-t space-y-6" style={{ borderColor: "var(--dash-border)" }}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-[var(--dash-text-primary)]">Filtro de Qualidade IA</h3>
                  <p className="text-[10px] font-bold text-[var(--dash-text-muted)] uppercase tracking-widest">Toque final profissional para o seu cadastro</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Melhorar Descrição */}
                <button
                  type="button"
                  onClick={async () => {
                    if (!productName) return alert("Dê um nome ao produto primeiro.");
                    setAiLoadingType('description');
                    try {
                      const result = await enhanceDescriptionWithAI({
                        name: productName,
                        currentDescription: productDescription,
                        specs
                      });
                      if (result.success && result.data) {
                        setReviewData({
                          type: 'description',
                          title: 'Melhoria de Descrição',
                          explanation: result.data.explanation,
                          original: productDescription,
                          proposed: result.data.proposed
                        });
                      }
                    } finally {
                      setAiLoadingType(null);
                    }
                  }}
                  disabled={!!aiLoadingType}
                  className="flex items-center justify-between p-6 rounded-3xl border-2 border-dashed border-emerald-500/20 bg-emerald-500/[0.02] hover:bg-emerald-500/[0.05] hover:border-emerald-500/40 transition-all group disabled:opacity-50"
                >
                  <div className="text-left">
                    <p className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-1">Melhorar Legenda</p>
                    <p className="text-[10px] font-bold text-[var(--dash-text-muted)]">IA cria um texto de alta conversão</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {aiLoadingType === 'description' ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  </div>
                </button>

                {/* Corretor com IA */}
                <button
                  type="button"
                  onClick={async () => {
                    setAiLoadingType('fixAll');
                    try {
                      const result = await fixProductOrthography({
                        name: productName,
                        highlight: productHighlightText,
                        description: productDescription
                      });
                      if (result.success && result.data) {
                        setReviewData({
                          type: 'fixAll',
                          title: 'Corretor com IA',
                          explanation: result.data.explanation,
                          changes: [
                            { id: 'name', field: 'Nome', from: productName, to: result.data.name },
                            { id: 'highlight', field: 'Destaque', from: productHighlightText, to: result.data.highlight },
                            { id: 'description', field: 'Descrição', from: productDescription, to: result.data.description }
                          ],
                          payload: result.data
                        });
                      }
                    } finally {
                      setAiLoadingType(null);
                    }
                  }}
                  disabled={!!aiLoadingType}
                  className="flex items-center justify-between p-6 rounded-3xl border-2 border-dashed border-blue-500/20 bg-blue-500/[0.02] hover:bg-blue-500/[0.05] hover:border-blue-500/40 transition-all group disabled:opacity-50"
                >
                  <div className="text-left">
                    <p className="text-xs font-black uppercase tracking-widest text-blue-500 mb-1">Corretor Profissional</p>
                    <p className="text-[10px] font-bold text-[var(--dash-text-muted)]">Corrige erros de todos os campos</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {aiLoadingType === 'fixAll' ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                  </div>
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="px-10 py-8 border-t flex justify-end gap-4" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
          <button 
            type="button"
            onClick={onClose} 
            className="px-6 py-3 font-bold uppercase tracking-widest transition-colors"
            style={{ color: "var(--dash-text-muted)" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--dash-text-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--dash-text-muted)"}
          >
            Cancelar
          </button>
          <button 
            form="productForm"
            type="submit" 
            disabled={saving}
            className="px-10 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? "Salvando..." : isEditMode ? "Atualizar" : "Criar Produto"}
          </button>
        </div>
      </div>

      <ImageEditorModal
        isOpen={showImageEditor}
        onClose={() => {
          setShowImageEditor(false);
          setPendingFile(null);
        }}
        onConfirm={onImageEditorConfirm}
        initialFile={pendingFile}
        minWidth={400}
        minHeight={400}
      />

      <AiReviewModal
        isOpen={!!reviewData}
        onClose={() => setReviewData(null)}
        onConfirm={(acceptedFields) => {
          if (reviewData.type === 'description') {
            if (acceptedFields['single']) {
              setLastDescription(productDescription);
              setProductDescription(reviewData.proposed);
            }
          } else if (reviewData.type === 'fixAll') {
            if (acceptedFields['name']) setProductName(reviewData.payload.name);
            if (acceptedFields['highlight']) setProductHighlightText(reviewData.payload.highlight);
            if (acceptedFields['description']) {
              setLastDescription(productDescription);
              setProductDescription(reviewData.payload.description);
            }
          }
          setReviewData(null);
        }}
        title={reviewData?.title || ""}
        explanation={reviewData?.explanation || ""}
        original={reviewData?.original}
        proposed={reviewData?.proposed}
        changes={reviewData?.changes}
      />

      <style jsx global>{`
        .quill-premium .ql-container { 
          min-height: 200px; 
          border-radius: 0 0 1rem 1rem; 
          background: var(--dash-input-bg);
          border-color: var(--dash-border) !important;
          color: var(--dash-text-primary);
        }
        .quill-premium .ql-toolbar { 
          border-radius: 1rem 1rem 0 0; 
          background: var(--dash-surface-secondary);
          border-color: var(--dash-border) !important;
        }
        .quill-premium .ql-stroke { stroke: var(--dash-text-secondary); }
        .quill-premium .ql-fill { fill: var(--dash-text-secondary); }
        .quill-premium .ql-picker { color: var(--dash-text-secondary); }
        .quill-premium .ql-editor.ql-blank::before { color: var(--dash-text-muted); }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--dash-border); border-radius: 10px; }
        
        /* Dark Theme Fixes */
        [data-theme="dark"] .quill-premium .ql-editor { color: #ffffff; }
        [data-theme="dark"] .quill-premium .ql-snow .ql-stroke { stroke: #ffffff; }
      `}</style>
    </div>
  );
}
