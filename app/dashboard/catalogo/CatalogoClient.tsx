"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import nextDynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import 'react-quill-new/dist/quill.snow.css';

// Carregamento dinâmico do Quill para evitar erros de SSR
const ReactQuill = nextDynamic(() => import("react-quill-new"), { 
  ssr: false,
  loading: () => <div className="h-[120px] w-full rounded-2xl border border-zinc-200 bg-zinc-50 animate-pulse" />
});

import { motion, AnimatePresence, Reorder } from "framer-motion";
import { 
  AlertCircle, 
  Upload as UploadIcon, 
  Upload,
  X as XIcon, 
  Crop, 
  Edit2 as EditIcon, 
  Trash2 as TrashIcon,
  Search,
  Plus,
  Copy,
  ExternalLink,
  ChevronDown,
  Layers,
  Package,
  Tag,
  FileText,
  Settings,
  Eye,
  Camera,
  CheckCircle2,
  GripVertical,
  DollarSign,
  Bold,
  Italic
} from "lucide-react";
import ImageEditorModal from "@/components/dashboard/ImageEditorModal";

type Category = {
  id: string;
  name: string;
  description: string | null;
  sort_order: number | null;
};

type Catalog = {
  id: string;
  name: string;
  description: string | null;
};

type Spec = { chave: string; valor: string };

const PRICE_INPUT_REGEX = /^[0-9.,]*$/;

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  specs: Spec[] | null;
  price: number | null;
  sku: string | null;
  has_wholesale: boolean | null;
  wholesale_price: number | null;
  wholesale_min_quantity: number | null;
  price_display_mode: string | null; // retail | wholesale | both
  image_url: string | null;
  image_urls: string[] | null;
  created_at: string;
  categories:
    | {
        id: string;
        name: string;
      }
    | {
        id: string;
        name: string;
      }[]
    | null;
};

function getProductCategoryId(product: ProductRow): string {
  const c = product.categories;
  if (Array.isArray(c)) return c[0]?.id ?? "";
  return c?.id ?? "";
}

function formatPriceForInput(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "";
  const s = value.toFixed(2);
  return s.replace(".", ",");
}

function sanitizePriceTyping(raw: string): string {
  return raw.replace(/[^0-9.,]/g, "");
}

function parsePrice(value: string): number | null {
  if (!value.trim()) return null;
  // Remove pontos (milhar) e troca vírgula por ponto (decimal)
  const clean = value.replace(/\./g, "").replace(",", ".");
  const num = Number(clean);
  return isNaN(num) ? null : num;
}

function sanitizeStorageFilename(name: string): string {
  const base = name.replace(/^.*[/\\]/, "").replace(/[^\w.-]/g, "_");
  return base.slice(0, 180) || `image-${Date.now()}`;
}

function revokePreviewIfBlob(url: string | null) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export default function CatalogoPage() {
  const [canCreateProduct, setCanCreateProduct] = useState<boolean | null>(null);
  const [productLimit, setProductLimit] = useState<number>(0);
  const [productUsageCount, setProductUsageCount] = useState<number>(0);
  const [loadingLimit, setLoadingLimit] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [catalogDescription, setCatalogDescription] = useState("");
  const [savingCatalog, setSavingCatalog] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [catalogId, setCatalogId] = useState<string | null>(null);
  const [isEmailConfirmed, setIsEmailConfirmed] = useState(true); // Definindo como true por padrão para não bloquear o gestor
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);
  const [categoryManageError, setCategoryManageError] = useState("");

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const [dragProductIndex, setDragProductIndex] = useState<number | null>(null);
  const [dragOverProductIndex, setDragOverProductIndex] = useState<number | null>(null);

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [specChaveDraft, setSpecChaveDraft] = useState("");
  const [specValorDraft, setSpecValorDraft] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [sku, setSku] = useState("");
  const [hasWholesale, setHasWholesale] = useState(false);
  const [wholesalePrice, setWholesalePrice] = useState("");
  const [wholesaleMinQuantity, setWholesaleMinQuantity] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  // Estado unificado para reordenação
  const [modalImages, setModalImages] = useState<{ id: string; url: string; file?: File; isExisting: boolean }[]>([]);

  const [nameError, setNameError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [imageFileError, setImageFileError] = useState("");
  const [specDraftError, setSpecDraftError] = useState("");
  const [productFormError, setProductFormError] = useState("");
  const [createProductError, setCreateProductError] = useState("");
  const [productListError, setProductListError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [showNoCategoryModal, setShowNoCategoryModal] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [priceDisplayMode, setPriceDisplayMode] = useState<"retail" | "wholesale" | "both">("both");
  const [lastSavedProduct, setLastSavedProduct] = useState<{ description: string; specs: Spec[] } | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const stripHtml = (html: string) => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  useEffect(() => {
    async function initialize() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        const oid = await fetchOrganizationId();
        
        if (oid) {
          setOrgId(oid);
          const cid = await fetchCatalog(oid);
          
          if (cid) {
            setCatalogId(cid);
            await Promise.all([refreshLimit(), fetchCategories(cid), fetchProducts(oid)]);
          }
        }
      } catch (err) {
        console.error("Erro na inicialização:", err);
      } finally {
        setLoadingLimit(false);
        setLoadingCategories(false);
        setLoadingProducts(false);
      }
    }

    initialize();
  }, []);

  async function fetchOrganizationId(): Promise<string | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // 1. Tenta buscar o perfil pelo ID principal (que deve ser igual ao do usuário)
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, id, organizations(plan_id, plans(*))")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.organizations) {
      const orgs = profile.organizations as any;
      const org = Array.isArray(orgs) ? orgs[0] : orgs;
      const plan = Array.isArray(org?.plans) ? org.plans[0] : org?.plans;
      
      if (plan) {
        setProductLimit(plan.max_products || 20);
      }
    }

    return (profile?.organization_id as string) ?? null;
  }

  async function fetchCatalog(orgId: string): Promise<string | null> {
    const supabase = createClient();
    
    // 1. Tenta pegar o catálogo vinculado
    const { data: orgCatalog } = await supabase
      .from("organization_catalogs")
      .select("catalog_id")
      .eq("organization_id", orgId)
      .maybeSingle();

    let catId = orgCatalog?.catalog_id;

    // 2. Se não existe, vamos criar um catálogo padrão agora mesmo
    if (!catId) {
      console.log("Criando catálogo automático para a organização...");
      
      // Criar o catálogo
      const { data: newCatalog, error: catError } = await supabase
        .from("catalogs")
        .insert({
          name: "Meu Catálogo",
          description: "Catálogo principal de produtos",
          owner_id: orgId // Campo obrigatório identificado
        })
        .select()
        .single();

      if (catError || !newCatalog) {
        console.error("Erro ao criar catálogo:", catError);
        return null;
      }

      // Vincular à organização
      const { error: linkError } = await supabase
        .from("organization_catalogs")
        .insert({
          organization_id: orgId,
          catalog_id: newCatalog.id,
          is_enabled: true
        });

      if (linkError) {
        console.error("Erro ao vincular catálogo:", linkError);
        return null;
      }

      catId = newCatalog.id;
    }

    if (catId) {
      const { data: catalogData } = await supabase
        .from("catalogs")
        .select("id, name, description")
        .eq("id", catId)
        .single();
      
      if (catalogData) {
        setCatalog(catalogData);
        setCatalogDescription(catalogData.description ?? "");
      }
    }

    return catId ?? null;
  }

  async function refreshLimit() {
    const supabase = createClient();
    const { data } = await supabase.rpc("can_create_product");
    setCanCreateProduct(data);
    setLoadingLimit(false);
  }

  async function fetchCategories(catalogId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, description, sort_order")
      .eq("catalog_id", catalogId)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Erro ao buscar categorias:", error);
    } else if (data) {
      setCategories(data as Category[]);
    }

    setLoadingCategories(false);
  }

  async function fetchProducts(orgId: string) {
    const supabase = createClient();
    setLoadingProducts(true);

    const { data, error } = await supabase
      .from("products")
      .select(
        `
      id,
      name,
      description,
      specs,
      price,
      sku,
      has_wholesale,
      wholesale_price,
      wholesale_min_quantity,
      image_url,
      image_urls,
      created_at,
      categories (
        id,
        name
      )
    `
      )
      .eq("organization_id", orgId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (data) {
      const prodList = (data ?? []) as unknown as ProductRow[];
      setProducts(prodList);
      setProductUsageCount(prodList.length);
    }

    setLoadingProducts(false);
  }

  async function handleSaveCatalogDescription() {
    if (!catalogId || !catalog) return;
    setSavingCatalog(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("catalogs")
      .update({ description: catalogDescription })
      .eq("id", catalogId);
    
    if (error) {
      console.error("Erro ao salvar descrição do catálogo:", error);
      alert("Erro ao salvar descrição.");
    } else {
      setCatalog({ ...catalog, description: catalogDescription });
    }
    setSavingCatalog(false);
  }

  async function handleSaveCategory(e: React.FormEvent) {
    e.preventDefault();
    
    if (!catalogId) {
      console.warn("Tentativa de salvar categoria sem catalogId.");
      setCategoryManageError("Erro: Nenhum catálogo encontrado para esta organização.");
      return;
    }
    
    const trimmedName = categoryName.trim();
    if (!trimmedName) {
      setCategoryManageError("O nome da categoria é obrigatório.");
      return;
    }

    console.log("Iniciando salvamento de categoria...", { catalogId, categoryName: trimmedName });

    setSavingCategory(true);
    setCategoryManageError("");
    const supabase = createClient();

    if (editingCategory) {
      const { error } = await supabase
        .from("categories")
        .update({
          name: trimmedName,
          description: categoryDescription.trim(),
        })
        .eq("id", editingCategory.id);

      if (error) {
        console.error("Erro ao atualizar categoria:", error);
        setCategoryManageError(`Erro ao atualizar categoria: ${error.message}`);
        setSavingCategory(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("categories")
        .insert({
          catalog_id: catalogId,
          name: trimmedName,
          description: categoryDescription.trim(),
          sort_order: categories.length,
        });

      if (error) {
        console.error("Erro ao criar categoria:", error);
        setCategoryManageError(`Erro ao criar categoria: ${error.message}`);
        setSavingCategory(false);
        return;
      }
    }

    setCategoryName("");
    setCategoryDescription("");
    setEditingCategory(null);
    setShowCategoryModal(false);
    setSavingCategory(false);
    await fetchCategories(catalogId);
  }

  async function handleDeleteCategory(id: string) {
    const hasProducts = products.some(p => getProductCategoryId(p) === id);
    if (hasProducts) {
      alert("Esta categoria possui produtos vinculados. Remova ou altere os produtos antes de excluir a categoria.");
      return;
    }

    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

    const supabase = createClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      alert("Erro ao excluir categoria.");
    } else {
      if (catalogId) await fetchCategories(catalogId);
    }
  }

  async function handleCategoryDrop(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || !catalogId) return;
    const reordered = [...categories];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setCategories(reordered);

    const supabase = createClient();
    await Promise.all(
      reordered.map((cat, i) =>
        supabase.from("categories").update({ sort_order: i }).eq("id", cat.id)
      )
    );
  }

  async function handleDelete(productId: string) {
    const supabase = createClient();
    const confirmDelete = confirm("Tem certeza que deseja excluir este produto?");

    if (!confirmDelete) return;
    const { error } = await supabase
      .from("products")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", productId);

    if (error) {
      console.error("Erro ao excluir:", error);
      setProductListError("Erro ao excluir produto.");
      return;
    }

    setProductListError("");
    if (orgId) await fetchProducts(orgId);
  }

  async function handleProductDrop(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    const reordered = [...products];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setProducts(reordered);
    setDragProductIndex(null);
    setDragOverProductIndex(null);

    setSavingOrder(true);
    const supabase = createClient();
    await Promise.all(
      reordered.map((p, i) =>
        supabase.from("products").update({ sort_order: i }).eq("id", p.id)
      )
    );
    setSavingOrder(false);
  }

  function handleOpenCreateProduct() {

    if (categories.length === 0) {
      setShowNoCategoryModal(true);
      return;
    }

    if (!canCreateProduct) {
      setCreateProductError(
        "Você atingiu o limite do seu plano. Faça upgrade para continuar."
      );
      return;
    }

    setCreateProductError("");
    setEditingProduct(null);
    setSelectedCategoryId("");
    setProductName("");
    setProductDescription("");
    setSpecs([]);
    setDragIndex(null);
    setDragOverIndex(null);
    setSpecChaveDraft("");
    setSpecValorDraft("");
    setProductPrice("");
    setSku("");
    setHasWholesale(false);
    setWholesalePrice("");
    setWholesaleMinQuantity("");
    setPriceDisplayMode("both");
    setNameError("");
    setCategoryError("");
    setPriceError("");
    setImageFileError("");
    setSpecDraftError("");
    setProductFormError("");
    setExistingImageUrls([]);
    setImagePreviewUrls([]);
    setModalImages([]);
    setShowModal(true);
  }

  function handleCopyLastProduct() {
    if (lastSavedProduct) {
      setProductDescription(lastSavedProduct.description);
      setSpecs(lastSavedProduct.specs);
    }
  }

  function handleOpenEdit(product: ProductRow) {
    setCreateProductError("");
    setEditingProduct(product);
    setSelectedCategoryId(getProductCategoryId(product));
    setProductName(product.name.toUpperCase());
    setProductDescription(product.description ?? "");
    setSpecs(product.specs ?? []);
    setDragIndex(null);
    setDragOverIndex(null);
    setSpecChaveDraft("");
    setSpecValorDraft("");
    setProductPrice(formatPriceForInput(product.price));
    setSku(product.sku ?? "");
    setHasWholesale(product.has_wholesale ?? false);
    setWholesalePrice(formatPriceForInput(product.wholesale_price));
    setWholesaleMinQuantity(product.wholesale_min_quantity ? String(product.wholesale_min_quantity) : "");
    setPriceDisplayMode((product.price_display_mode as any) || "both");
    const urls = product.image_urls && product.image_urls.length > 0
      ? product.image_urls
      : product.image_url ? [product.image_url] : [];
    setExistingImageUrls(urls);
    setImagePreviewUrls(urls);
    setModalImages(urls.map(url => ({
      id: `existing-${url}-${Math.random().toString(36).substr(2, 5)}`,
      url,
      isExisting: true
    })));
    setNameError("");
    setCategoryError("");
    setPriceError("");
    setImageFileError("");
    setSpecDraftError("");
    setProductFormError("");
    setShowModal(true);
  }

  function handleDuplicateProduct(product: ProductRow) {
    if (!canCreateProduct) {
      setProductListError("Você atingiu o limite do seu plano. Faça upgrade para continuar.");
      return;
    }
    setCreateProductError("");
    setEditingProduct(null);
    setSelectedCategoryId(getProductCategoryId(product));
    setProductName(`${product.name.toUpperCase()} (CÓPIA)`);
    setProductDescription(product.description ?? "");
    setSpecs(product.specs ?? []);
    setDragIndex(null);
    setDragOverIndex(null);
    setSpecChaveDraft("");
    setSpecValorDraft("");
    setProductPrice(formatPriceForInput(product.price));
    setSku("");
    setHasWholesale(product.has_wholesale ?? false);
    setWholesalePrice(formatPriceForInput(product.wholesale_price));
    setWholesaleMinQuantity(product.wholesale_min_quantity ? String(product.wholesale_min_quantity) : "");
    
    setImageFiles([]);
    imagePreviewUrls.forEach(revokePreviewIfBlob);
    setImagePreviewUrls([]);
    setExistingImageUrls([]);
    setModalImages([]);

    setNameError("");
    setCategoryError("");
    setPriceError("");
    setImageFileError("");
    setSpecDraftError("");
    setProductFormError("");
    setShowModal(true);
  }

  function handleCloseModal() {
    setShowModal(false);
    setEditingProduct(null);
    setSelectedCategoryId("");
    setProductName("");
    setProductDescription("");
    setSpecs([]);
    setDragIndex(null);
    setDragOverIndex(null);
    setSpecChaveDraft("");
    setSpecValorDraft("");
    setProductPrice("");
    setSku("");
    setHasWholesale(false);
    setWholesalePrice("");
    setWholesaleMinQuantity("");
    setImageFiles([]);
    imagePreviewUrls.forEach(revokePreviewIfBlob);
    setImagePreviewUrls([]);
    setExistingImageUrls([]);
    setSaving(false);
    setNameError("");
    setCategoryError("");
    setPriceError("");
    setImageFileError("");
    setSpecDraftError("");
    setProductFormError("");
  }

  function handleImageChange(files: File[]) {
    const currentTotal = modalImages.length;
    if (currentTotal + files.length > 5) {
      setImageFileError("O limite é de 5 imagens por produto.");
      return;
    }

    const newItems = files.map((file, i) => ({
      id: `new-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
      url: URL.createObjectURL(file),
      file,
      isExisting: false
    }));

    setModalImages(prev => [...prev, ...newItems]);
    setImageFileError("");
  }

  const onImageEditorConfirm = (file: File, previewUrl: string) => {
    const newItem = {
      id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      url: previewUrl,
      file,
      isExisting: false
    };
    setModalImages(prev => [...prev, newItem]);
    setPendingFile(null);
    setShowImageEditor(false);
    setImageFileError("");
  };

  function handleRemoveImage(index: number) {
    if (index < existingImageUrls.length) {
      setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
      setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    } else {
      const fileIndex = index - existingImageUrls.length;
      setImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
      
      setImagePreviewUrls(prev => {
        const urlToRemove = prev[index];
        revokePreviewIfBlob(urlToRemove);
        return prev.filter((_, i) => i !== index);
      });
    }
  }

  function addSpec() {
    const chave = specChaveDraft.trim();
    const valor = specValorDraft.trim();
    if (!chave || !valor) {
      setSpecDraftError("Preencha característica e valor.");
      return;
    }
    setSpecDraftError("");
    setSpecs((prev) => [...prev, { chave, valor }]);
    setSpecChaveDraft("");
    setSpecValorDraft("");
  }

  function validateProductForm(): boolean {
    let valid = true;

    const trimmedName = productName.trim();
    if (!trimmedName) {
      setNameError("O nome é obrigatório.");
      valid = false;
    } else if (trimmedName.length < 3) {
      setNameError("O nome deve ter no mínimo 3 caracteres.");
      valid = false;
    } else {
      setNameError("");
    }

    if (!selectedCategoryId) {
      setCategoryError("Selecione uma categoria.");
      valid = false;
    } else {
      setCategoryError("");
    }

    const priceTrim = productPrice.trim();
    if (priceTrim) {
      const parsed = parsePrice(priceTrim);
      if (parsed === null) {
        setPriceError("Preço inválido. Ex: 199,90");
        valid = false;
      } else {
        setPriceError("");
      }
    } else {
      setPriceError("");
    }

    return valid;
  }

  function removeSpec(index: number) {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSpecDragEnd() {
    setDragIndex(null);
    setDragOverIndex(null);
  }

  async function uploadProductImage(
    organizationId: string,
    productId: string,
    file: File
  ): Promise<string | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const filename = `${Date.now()}-${sanitizeStorageFilename(file.name)}`;
    const path = `${user.id}/${productId}/${filename}`;
    const { error } = await supabase.storage
      .from("products")
      .upload(path, file);

    if (error) {
      console.error("Erro no upload da imagem:", error);
      return null;
    }

    const { data } = supabase.storage.from("products").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmitProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setProductFormError("");

    if (!editingProduct && !canCreateProduct) {
      setProductFormError(
        "Você atingiu o limite do seu plano. Faça upgrade para continuar."
      );
      return;
    }

    if (!validateProductForm()) {
      return;
    }

    setSaving(true);

    const parsedPrice = parsePrice(productPrice);
    const parsedWholesalePrice = parsePrice(wholesalePrice);
    const parsedMinQty = wholesaleMinQuantity.trim() === "" ? null : parseInt(wholesaleMinQuantity, 10);

    if (productPrice.trim() !== "" && parsedPrice === null) {
      setPriceError("Preço inválido. Ex: 199,90");
      setSaving(false);
      return;
    }

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setProductFormError("Usuário não autenticado.");
      setSaving(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Erro ao buscar perfil:", profileError);
      setProductFormError("Erro ao identificar a organização do usuário.");
      setSaving(false);
      return;
    }

    if (!profile?.organization_id) {
      setProductFormError("Usuário sem organização.");
      setSaving(false);
      return;
    }

    const orgId = profile.organization_id;
    const basePayload = {
      category_id: selectedCategoryId,
      name: productName.trim(),
      description: productDescription.trim(),
      specs,
      price: parsedPrice,
      sku: sku.trim() || null,
      has_wholesale: hasWholesale,
      wholesale_price: hasWholesale ? parsedWholesalePrice : null,
      wholesale_min_quantity: hasWholesale ? parsedMinQty : null,
    };

    if (editingProduct) {
      const finalUrls: string[] = [];

      for (const img of modalImages) {
        if (img.isExisting) {
          finalUrls.push(img.url);
        } else if (img.file) {
          const uploaded = await uploadProductImage(orgId, editingProduct.id, img.file);
          if (!uploaded) {
            setProductFormError("Erro ao enviar algumas imagens. Tente novamente.");
            setSaving(false);
            return;
          }
          finalUrls.push(uploaded);
        }
      }

      const { error } = await supabase
        .from("products")
        .update({
          ...basePayload,
          image_url: finalUrls.length > 0 ? finalUrls[0] : null,
          image_urls: finalUrls,
        })
        .eq("id", editingProduct.id);

      if (error) {
        console.error("Erro ao atualizar produto:", error);
        setProductFormError("Erro ao salvar produto.");
        setSaving(false);
        return;
      }

      handleCloseModal();
      await refreshLimit();
      if (orgId) await fetchProducts(orgId);
      return;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("products")
      .insert({
        ...basePayload,
        image_url: null,
        image_urls: [],
        is_extra: false,
        sort_order: 0,
        organization_id: orgId,
      })
      .select("id")
      .single();

    if (insertError || !inserted?.id) {
      console.error("Erro ao salvar produto:", insertError);
      setProductFormError("Erro ao salvar produto.");
      setSaving(false);
      return;
    }

    // 3. Upload das fotos a partir do estado unificado
    const finalUrls: string[] = [];
    for (const img of modalImages) {
      if (img.file) {
        const uploaded = await uploadProductImage(orgId, inserted.id, img.file);
        if (uploaded) finalUrls.push(uploaded);
      }
    }

    if (finalUrls.length > 0) {
      const { error: updateImgError } = await supabase
        .from("products")
        .update({ 
          image_url: finalUrls[0],
          image_urls: finalUrls 
        })
        .eq("id", inserted.id);

      if (updateImgError) {
        console.error("Erro ao associar imagem:", updateImgError);
        setProductFormError("Produto criado, mas não foi possível salvar a URL da imagem.");
        setSaving(false);
        handleCloseModal();
        await refreshLimit();
        if (orgId) await fetchProducts(orgId);
        return;
      }
    }

    // Salva para a função "Copiar último"
    setLastSavedProduct({
      description: productDescription.trim(),
      specs: specs
    });

    handleCloseModal();
    await refreshLimit();
    if (orgId) await fetchProducts(orgId);
  }

  function formatPrice(value: number | null) {
    if (value === null) return "Sem preço";
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  const isEditMode = editingProduct !== null;

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-10 pb-20">
      {/* Header com Título e Limite */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight" style={{ color: "var(--dash-text-primary)" }}>
            Catálogo
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--dash-text-secondary)" }}>
            Gerencie seus produtos, categorias e a vitrine digital da sua marca.
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-[32px] border p-6 min-w-[300px] shadow-sm" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[var(--dash-text-muted)]">
            <span>Limite de Produtos</span>
            <span className={productUsageCount >= productLimit ? "text-red-500" : "text-emerald-500"}>
              {productUsageCount} / {productLimit}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((productUsageCount / productLimit) * 100, 100)}%` }}
              className={`h-full rounded-full transition-all duration-1000 ${
                productUsageCount >= productLimit ? "bg-red-500" : "bg-emerald-500"
              }`}
            />
          </div>
          <p className="text-[10px] font-bold text-center" style={{ color: "var(--dash-text-muted)" }}>
            {Math.round((productUsageCount / productLimit) * 100)}% da sua capacidade utilizada
          </p>
        </div>
      </div>

      {!loadingProducts && !loadingCategories && !catalogId ? (
        <div className="mt-8 flex flex-col items-center justify-center text-center p-16 border-2 border-dashed rounded-[40px]" style={{ borderColor: "var(--dash-border)", background: "var(--dash-surface)" }}>
          <div className="bg-amber-100 dark:bg-amber-900/30 p-5 rounded-full mb-6">
            <AlertCircle className="text-amber-600 dark:text-amber-400" size={48} />
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: "var(--dash-text-primary)" }}>Inicializando Catálogo</h2>
          <p className="max-w-md text-base mb-8 leading-relaxed" style={{ color: "var(--dash-text-secondary)" }}>
            Estamos preparando sua área de produtos. Se esta mensagem persistir, por favor recarregue a página.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-10 py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Recarregar Catálogo
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Categorias Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Layers size={24} />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: "var(--dash-text-primary)" }}>Categorias</h2>
              </div>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryName("");
                  setCategoryDescription("");
                  setShowCategoryModal(true);
                }}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 bg-zinc-900 text-white text-sm font-bold hover:bg-black transition-all shadow-lg shadow-black/5"
              >
                <Plus size={18} /> Nova Categoria
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {loadingCategories ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-24 animate-pulse rounded-3xl bg-zinc-100 dark:bg-zinc-800" />
                ))
              ) : categories.length === 0 ? (
                <div className="col-span-full p-12 text-center rounded-[32px] border border-dashed" style={{ borderColor: "var(--dash-border)" }}>
                  <p className="text-sm italic" style={{ color: "var(--dash-text-secondary)" }}>Nenhuma categoria cadastrada.</p>
                </div>
              ) : (
                categories.map((cat, idx) => (
                  <div
                    key={cat.id}
                    className="group flex flex-col justify-between p-5 rounded-[32px] border transition-all hover:shadow-lg hover:border-primary/30"
                    style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="h-8 w-8 rounded-lg bg-zinc-50 dark:bg-zinc-900 border flex items-center justify-center text-xs font-mono text-[var(--dash-text-muted)]">
                        {idx + 1}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setCategoryName(cat.name);
                              setCategoryDescription(cat.description ?? "");
                              setShowCategoryModal(true);
                            }}
                            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-primary"
                          >
                            <EditIcon size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500"
                          >
                            <TrashIcon size={14} />
                          </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold truncate" style={{ color: "var(--dash-text-primary)" }}>{cat.name}</p>
                      <p className="text-[10px] font-bold uppercase text-[var(--dash-text-muted)]">
                         {products.filter(p => getProductCategoryId(p) === cat.id).length} itens
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Produtos Section */}
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Package size={24} />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: "var(--dash-text-primary)" }}>Produtos</h2>
              </div>
              
              <div className="flex items-center gap-3 flex-1 max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                    style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                  />
                </div>
                <button
                  onClick={handleOpenCreateProduct}
                  className="hidden md:flex items-center gap-2 rounded-xl px-6 py-3 bg-primary text-white text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                >
                  <Plus size={20} /> Novo Produto
                </button>
              </div>
            </div>

            {productListError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-500 text-sm font-medium">
                {productListError}
              </div>
            )}

            <div className="space-y-4">
              {loadingProducts ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-32 animate-pulse rounded-[32px] bg-zinc-100 dark:bg-zinc-800" />
                ))
              ) : filteredProducts.length === 0 ? (
                <div className="p-20 text-center rounded-[40px] border border-dashed" style={{ borderColor: "var(--dash-border)" }}>
                  <Package className="mx-auto h-16 w-16 text-zinc-200 mb-4" />
                  <p className="text-zinc-500 font-medium">
                    {searchQuery ? "Nenhum produto corresponde à sua busca." : "Nenhum produto cadastrado."}
                  </p>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group relative flex flex-col lg:flex-row items-center gap-6 p-6 rounded-[32px] border transition-all hover:shadow-2xl hover:shadow-black/5 hover:border-primary/30"
                    style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
                  >
                    {/* Imagem */}
                    <div className="relative flex-shrink-0">
                      {product.image_urls?.[0] || product.image_url ? (
                        <img 
                          src={product.image_urls?.[0] || product.image_url || ""} 
                          className="h-24 w-24 rounded-[24px] object-cover border-2 border-white shadow-lg bg-zinc-50" 
                        />
                      ) : (
                        <div className="h-24 w-24 rounded-[24px] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                          <Package size={32} />
                        </div>
                      )}
                    </div>

                    {/* Informações */}
                    <div className="flex-1 min-w-0 text-center lg:text-left">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-2 mb-2">
                        <h4 className="font-bold text-xl truncate" style={{ color: "var(--dash-text-primary)" }}>
                          {product.name}
                        </h4>
                        {product.sku && (
                          <span className="inline-block px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-500">
                            REF: {product.sku}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--dash-text-muted)] uppercase font-bold tracking-tighter mb-3">
                        {Array.isArray(product.categories)
                            ? (product.categories[0]?.name ?? "Sem categoria")
                            : (product.categories?.name ?? "Sem categoria")}
                      </p>
                      <p className="text-sm line-clamp-1" style={{ color: "var(--dash-text-secondary)" }}>
                        {stripHtml(product.description || "Nenhuma descrição informada.")}
                      </p>
                    </div>

                    {/* Preço e Atacado */}
                    <div className="flex flex-col items-center lg:items-end px-8 border-x border-dashed hidden xl:flex" style={{ borderColor: "var(--dash-border)" }}>
                        <p className="text-2xl font-black" style={{ color: "var(--dash-text-primary)" }}>
                          {formatPrice(product.price)}
                        </p>
                        {product.has_wholesale && (
                          <span className="mt-1 px-2 py-0.5 rounded bg-emerald-50 text-[9px] font-black text-emerald-600 uppercase tracking-tighter">
                            Atacado Ativo
                          </span>
                        )}
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col gap-2 w-full lg:w-auto min-w-[180px]">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleDuplicateProduct(product)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-xs font-bold hover:bg-zinc-100 transition-all border border-zinc-100 dark:border-zinc-800"
                        >
                          <Copy size={14} /> Duplicar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(product)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-black transition-all"
                        >
                          <EditIcon size={14} /> Editar
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-100 text-red-500 text-xs font-bold hover:bg-red-50 transition-all"
                      >
                        <TrashIcon size={14} /> Excluir
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-[40px] border-none p-0 shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col max-h-[90vh] overflow-hidden bg-white text-zinc-900">
            {/* Header com Design Premium */}
            <div className="relative px-10 py-8 border-b border-zinc-100 bg-zinc-50/50">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-black flex items-center gap-3 text-zinc-900">
                    {isEditMode ? <EditIcon size={28} className="text-emerald-500" /> : <Plus size={28} className="text-emerald-500" />}
                    {isEditMode ? "Editar Produto" : "Novo Produto"}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-zinc-500">
                    Gerencie os detalhes e a apresentação do seu item.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-2xl p-3 hover:bg-zinc-200 transition-colors bg-zinc-100 text-zinc-500"
                >
                  <XIcon size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
              <form id="productForm" onSubmit={handleSubmitProduct} className="space-y-8">
                {productFormError ? (
                  <p className="text-xs text-red-500 font-bold bg-red-50 p-4 rounded-2xl border border-red-100 animate-pulse">{productFormError}</p>
                ) : null}

                {/* Seção 1: Identidade */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-zinc-400">
                      <Package size={16} /> Identidade do Produto
                    </h3>
                    {!isEditMode && lastSavedProduct && (
                      <button
                        type="button"
                        onClick={handleCopyLastProduct}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-black hover:bg-emerald-100 transition-all border border-emerald-100 uppercase tracking-wider"
                      >
                        <Copy size={12} /> Copiar dados do último cadastro
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 rounded-[32px] border border-zinc-100 bg-zinc-50/30">
                    <div className="md:col-span-2">
                      <label className="mb-2 flex items-center gap-2 text-sm font-black text-zinc-700 uppercase tracking-wider">
                        <Tag size={16} className="text-emerald-500" /> Categoria
                      </label>
                      <select
                        value={selectedCategoryId}
                        onChange={(e) => {
                          setSelectedCategoryId(e.target.value);
                          setCategoryError("");
                        }}
                        className="w-full rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm font-medium outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 shadow-sm"
                        style={{ color: "var(--dash-text-primary)" }}
                      >
                        <option value="">
                          {loadingCategories ? "Carregando..." : "Selecione uma categoria"}
                        </option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {categoryError && <p className="mt-1.5 text-xs text-red-500 font-medium">{categoryError}</p>}
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-black text-zinc-700 uppercase tracking-wider">
                        <EditIcon size={16} className="text-emerald-500" /> Nome do produto
                      </label>
                      <input
                        type="text"
                        value={productName}
                        onChange={(e) => {
                          setProductName(e.target.value.toUpperCase());
                          setNameError("");
                        }}
                        placeholder="Ex: SCOOTER ELÉTRICA MAJ X1"
                        className="w-full rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm font-normal outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 shadow-sm"
                        style={{ color: "var(--dash-text-primary)" }}
                      />
                      {nameError && <p className="mt-1.5 text-xs text-red-500 font-bold">{nameError}</p>}
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-black text-zinc-700 uppercase tracking-wider">
                        <Layers size={16} className="text-emerald-500" /> SKU (Código/Ref)
                      </label>
                      <input
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="Ex: REF-123"
                        className="w-full rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm font-normal outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 shadow-sm"
                        style={{ color: "var(--dash-text-primary)" }}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="mb-2 flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm font-black text-zinc-700 uppercase tracking-wider">
                          <FileText size={16} className="text-emerald-500" /> Descrição Completa
                        </label>
                      </div>
                      <div className="rich-text-editor-container">
                        <ReactQuill
                          theme="snow"
                          value={productDescription}
                          onChange={setProductDescription}
                          placeholder="Descreva as principais qualidades do produto..."
                          modules={{
                            toolbar: [
                              ['bold', 'italic'],
                              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                              ['clean']
                            ],
                          }}
                          className="quill-premium"
                        />
                      </div>
                      
                      <style jsx global>{`
                        .quill-premium .ql-toolbar {
                          border-top-left-radius: 1rem;
                          border-top-right-radius: 1rem;
                          border: 1px solid #e4e4e7 !important;
                          background: #f9fafb;
                        }
                        .quill-premium .ql-container {
                          border-bottom-left-radius: 1rem;
                          border-bottom-right-radius: 1rem;
                          border: 1px solid #e4e4e7 !important;
                          min-height: 120px;
                          font-family: inherit;
                          font-size: 0.875rem;
                        }
                        .quill-premium .ql-editor {
                          min-height: 120px;
                        }
                        .quill-premium .ql-editor.ql-blank::before {
                          font-style: normal;
                          color: #a1a1aa;
                        }
                        .ql-bold {
                          font-weight: 900 !important;
                        }
                        .ql-snow.ql-toolbar button.ql-bold {
                          font-weight: 900 !important;
                        }
                        .ql-snow.ql-toolbar button.ql-bold svg path,
                        .ql-snow.ql-toolbar button.ql-bold svg rect {
                          stroke-width: 3px;
                        }
                      `}</style>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-zinc-400">
                    <Settings size={16} /> Especificações Técnicas
                  </h3>
                  
                  <div className="p-6 rounded-[32px] border border-zinc-100 bg-zinc-50/30 space-y-4">
                    {specs.length > 0 && (
                      <Reorder.Group axis="y" values={specs} onReorder={setSpecs} className="space-y-1.5">
                        {specs.map((s, index) => (
                          <Reorder.Item
                            key={`${s.chave}-${index}`}
                            value={s}
                            className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-white px-4 py-1.5 text-sm shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
                            style={{ color: "var(--dash-text-primary)" }}
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <GripVertical size={14} className="text-zinc-300" />
                              <div className="flex items-center gap-2">
                                <span className="text-emerald-600 font-black uppercase text-[9px] tracking-widest">{s.chave}:</span>
                                <span className="font-normal text-zinc-600">{s.valor}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSpec(index)}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all"
                            >
                              <TrashIcon size={16} />
                            </button>
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    )}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end bg-white p-6 rounded-3xl border border-dashed border-zinc-300">
                      <div className="flex-1">
                        <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Característica</label>
                        <input
                          type="text"
                          value={specChaveDraft}
                          onChange={(e) => setSpecChaveDraft(e.target.value)}
                          placeholder="Ex: Peso"
                          className="w-full rounded-2xl border border-zinc-100 bg-zinc-50/50 px-4 py-3 text-sm font-normal outline-none focus:border-emerald-500 focus:bg-white transition-all"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Valor</label>
                        <input
                          type="text"
                          value={specValorDraft}
                          onChange={(e) => setSpecValorDraft(e.target.value)}
                          placeholder="Ex: 500g"
                          className="w-full rounded-2xl border border-zinc-100 bg-zinc-50/50 px-4 py-3 text-sm font-normal outline-none focus:border-emerald-500 focus:bg-white transition-all"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addSpec}
                        className="px-6 py-3 bg-zinc-900 text-white rounded-2xl text-xs font-black hover:bg-black transition-all shadow-lg active:scale-95"
                      >
                        ADICIONAR
                      </button>
                    </div>
                  </div>
                </div>

                {/* Seção 3: Preços e Exibição */}
                <div className="space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2" style={{ color: "var(--dash-text-muted)" }}>
                    <Eye size={16} /> Configuração de Preços e Exibição
                  </h3>

                  <div className="p-6 rounded-3xl border bg-emerald-50/30 dark:bg-emerald-900/5 space-y-6" style={{ borderColor: "var(--dash-border)" }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                          <Tag size={16} /> Preço de Varejo
                        </label>
                        <input
                          type="text"
                          value={productPrice}
                          onChange={(e) => setProductPrice(sanitizePriceTyping(e.target.value))}
                          placeholder="Ex: 6.990,00"
                          className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 border-emerald-200 dark:border-emerald-800/50 font-normal"
                          style={{ background: "var(--dash-input-bg)", color: "var(--dash-text-primary)" }}
                        />
                        {priceError && <p className="mt-1.5 text-xs text-red-500 font-bold">{priceError}</p>}
                      </div>

                      <div className="flex flex-col justify-end pb-1">
                        <label className="flex items-center gap-3 cursor-pointer group bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-dashed transition-all hover:border-emerald-500/50" style={{ borderColor: "var(--dash-border)" }}>
                          <input
                            type="checkbox"
                            checked={hasWholesale}
                            onChange={(e) => setHasWholesale(e.target.checked)}
                            className="h-5 w-5 rounded-lg border-zinc-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Habilitar Preço de Atacado</span>
                        </label>
                      </div>
                    </div>

                    {hasWholesale && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                        <div>
                          <label className="mb-2 block text-xs font-black uppercase tracking-widest text-emerald-600">Preço Atacado</label>
                          <input
                            type="text"
                            value={wholesalePrice}
                            onChange={(e) => setWholesalePrice(sanitizePriceTyping(e.target.value))}
                            placeholder="Ex: 150,00"
                            className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none border-emerald-200 dark:border-emerald-800/50 font-normal"
                            style={{ background: "var(--dash-input-bg)", color: "var(--dash-text-primary)" }}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-black uppercase tracking-widest text-emerald-600">Qtd. Mínima</label>
                          <input
                            type="number"
                            min="1"
                            value={wholesaleMinQuantity}
                            onChange={(e) => setWholesaleMinQuantity(e.target.value)}
                            placeholder="Ex: 10"
                            className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none border-emerald-200 dark:border-emerald-800/50 font-normal"
                            style={{ background: "var(--dash-input-bg)", color: "var(--dash-text-primary)" }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-dashed" style={{ borderColor: "var(--dash-border)" }}>
                      <label className="mb-4 block text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)]">O que exibir no catálogo?</label>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { id: "retail", label: "Só Varejo", icon: <Tag size={14} /> },
                          { id: "wholesale", label: "Só Atacado", icon: <Layers size={14} /> },
                          { id: "both", label: "Ambos os Preços", icon: <Eye size={14} /> },
                        ].map((mode) => (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => setPriceDisplayMode(mode.id as any)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all border-2 ${
                              priceDisplayMode === mode.id
                                ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105"
                                : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-primary/30"
                            }`}
                          >
                            {mode.icon} {mode.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seção 4: Fotos */}
                <div className="space-y-6 pb-6">
                  <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-zinc-400">
                    <Camera size={16} /> Galeria de Fotos
                  </h3>
                  
                  <div className="p-8 rounded-[32px] border border-zinc-100 bg-zinc-50/30 space-y-6">
                    <div
                      className="group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 bg-white px-6 py-10 text-center transition-all hover:border-emerald-500/50 hover:bg-emerald-50 shadow-sm cursor-pointer"
                      onClick={() => setShowImageEditor(true)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const files = Array.from(e.dataTransfer.files);
                        if (files.length === 1) {
                          setPendingFile(files[0]);
                          setShowImageEditor(true);
                        } else if (files.length > 0) {
                          handleImageChange(files);
                        }
                      }}
                    >
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-emerald-500 transition-all group-hover:bg-emerald-500 group-hover:text-white">
                        <Upload size={28} />
                      </div>
                      <p className="text-lg font-black text-zinc-800">Adicionar fotos do produto</p>
                      <p className="mt-1 text-sm font-medium text-zinc-400 italic">Arraste aqui ou clique para selecionar</p>
                      <div className="mt-4 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl text-[10px] text-amber-700 font-bold uppercase tracking-tight">
                        💡 Dica: O sistema converte fundos transparentes em branco automaticamente.
                      </div>
                    </div>

                    {(modalImages.length > 0) && (
                      <div className="space-y-4">
                         <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                           <GripVertical size={12} /> Arraste para definir a ordem das fotos
                         </p>
                         
                         <Reorder.Group 
                           axis="x" 
                           values={modalImages} 
                           onReorder={setModalImages} 
                           className="flex flex-wrap gap-4"
                         >
                            {modalImages.map((img) => (
                              <Reorder.Item
                                key={img.id}
                                value={img}
                                drag
                                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                className={`relative h-20 w-20 rounded-2xl border-2 shadow-lg overflow-hidden group cursor-grab active:cursor-grabbing z-10 ${
                                  img.isExisting ? 'border-white' : 'border-emerald-200'
                                }`}
                              >
                                <img src={img.url} className="h-full w-full object-cover pointer-events-none" />
                                <button
                                  type="button"
                                  onClick={() => setModalImages(prev => prev.filter(item => item.id !== img.id))}
                                  className="absolute top-1 right-1 h-5 w-5 rounded-lg bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-20"
                                >
                                  <XIcon size={12} />
                                </button>
                                {!img.isExisting && (
                                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-emerald-500 text-white text-[7px] font-black rounded uppercase">Novo</div>
                                )}
                              </Reorder.Item>
                            ))}
                         </Reorder.Group>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Footer Fixo Premium */}
            <div className="px-10 py-8 border-t border-zinc-100 bg-zinc-50/50 flex justify-end gap-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-8 py-4 text-sm font-black text-zinc-400 hover:text-zinc-800 transition-colors uppercase tracking-widest"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="productForm"
                disabled={saving}
                className="px-10 py-4 bg-emerald-500 text-white rounded-2xl text-sm font-black shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Produto"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-xl"
            style={{ background: "var(--dash-surface)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ color: "var(--dash-text-primary)" }}>
                {editingCategory ? "Editar Categoria" : "Nova Categoria"}
              </h2>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-2xl"
                style={{ color: "var(--dash-text-muted)" }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              {categoryManageError && (
                <p className="text-xs text-red-500">{categoryManageError}</p>
              )}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--dash-text-primary)" }}>
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Ex: Camisetas"
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: "var(--dash-input-border)", background: "var(--dash-input-bg)", color: "var(--dash-text-primary)" }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--dash-text-primary)" }}>
                  Descrição (Opcional)
                </label>
                <textarea
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  placeholder="Ex: Coleção de camisetas 100% algodão com estampas exclusivas."
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none min-h-[80px]"
                  style={{ borderColor: "var(--dash-input-border)", background: "var(--dash-input-bg)", color: "var(--dash-text-primary)" }}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="rounded-xl border px-4 py-2 text-sm font-medium"
                  style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-secondary)" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {savingCategory ? "Salvando..." : "Salvar Categoria"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal: Nenhuma Categoria Encontrada */}
      <AnimatePresence>
        {showNoCategoryModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl"
              style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
            >
              <div className="p-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                  <AlertCircle size={32} />
                </div>
                <h3 className="mb-2 text-xl font-bold" style={{ color: "var(--dash-text-primary)" }}>
                  Categoria Necessária
                </h3>
                <p className="mb-8 text-sm leading-relaxed" style={{ color: "var(--dash-text-secondary)" }}>
                  Para cadastrar um produto, você precisa ter pelo menos uma categoria criada. As categorias ajudam a organizar seu catálogo para seus clientes.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setShowNoCategoryModal(false);
                      setShowCategoryModal(true);
                    }}
                    className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                  >
                    Criar Minha Primeira Categoria
                  </button>
                  <button
                    onClick={() => setShowNoCategoryModal(false)}
                    className="w-full py-2 text-sm font-medium hover:underline"
                    style={{ color: "var(--dash-text-muted)" }}
                  >
                    Talvez mais tarde
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      <ImageEditorModal
        isOpen={showImageEditor}
        onClose={() => {
          setShowImageEditor(false);
          setPendingFile(null);
        }}
        onConfirm={onImageEditorConfirm}
        initialFile={pendingFile}
      />
    </div>
  );
}
