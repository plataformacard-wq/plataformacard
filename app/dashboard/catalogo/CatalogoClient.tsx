"use client";

export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

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

const PRICE_INPUT_REGEX = /^[0-9]*[.,]?[0-9]*$/;

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

  useEffect(() => {
    async function initialize() {
      const oid = await fetchOrganizationId();
      if (oid) {
        setOrgId(oid);
        const cid = await fetchCatalog(oid);
        if (cid) {
          setCatalogId(cid);
          await Promise.all([refreshLimit(), fetchCategories(cid), fetchProducts(oid)]);
        }
      }
    }

    initialize();
  }, []);

  async function fetchOrganizationId(): Promise<string | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    return profile?.organization_id ?? null;
  }

  async function fetchCatalog(orgId: string): Promise<string | null> {
    const supabase = createClient();
    
    // Tenta pegar o catálogo habilitado
    const { data: orgCatalog } = await supabase
      .from("organization_catalogs")
      .select("catalog_id")
      .eq("organization_id", orgId)
      .eq("is_enabled", true)
      .limit(1)
      .maybeSingle();

    let catId = orgCatalog?.catalog_id;

    if (!catId) {
      // Fallback: pega qualquer um
      const { data: anyOrgCatalog } = await supabase
        .from("organization_catalogs")
        .select("catalog_id")
        .eq("organization_id", orgId)
        .limit(1)
        .maybeSingle();
      catId = anyOrgCatalog?.catalog_id;
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

    if (error) {
      console.error("Erro ao buscar produtos:", error);
    } else if (data) {
      setProducts((data ?? []) as unknown as ProductRow[]);
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
    if (!catalogId) return;
    
    const trimmedName = categoryName.trim();
    if (!trimmedName) {
      setCategoryManageError("O nome da categoria é obrigatório.");
      return;
    }

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
        setCategoryManageError("Erro ao atualizar categoria.");
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
        setCategoryManageError("Erro ao criar categoria.");
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
    setNameError("");
    setCategoryError("");
    setPriceError("");
    setImageFileError("");
    setSpecDraftError("");
    setProductFormError("");
    setImageFiles([]);
    imagePreviewUrls.forEach(revokePreviewIfBlob);
    setImagePreviewUrls([]);
    setExistingImageUrls([]);
    setShowModal(true);
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
    setImageFiles([]);
    imagePreviewUrls.forEach(revokePreviewIfBlob);
    const urls = product.image_urls && product.image_urls.length > 0
      ? product.image_urls
      : product.image_url ? [product.image_url] : [];
    setExistingImageUrls(urls);
    setImagePreviewUrls(urls);
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

  function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";

    if (files.length === 0) return;

    const currentTotal = existingImageUrls.length + imageFiles.length;
    if (currentTotal + files.length > 5) {
      setImageFileError("O limite é de 5 imagens por produto.");
      return;
    }

    const validFiles = files.filter(f => f.size <= MAX_IMAGE_BYTES);
    if (validFiles.length < files.length) {
      setImageFileError("Algumas imagens foram ignoradas por passarem de 2MB.");
    } else {
      setImageFileError("");
    }

    const newPreviewUrls = validFiles.map(f => URL.createObjectURL(f));

    setImageFiles(prev => [...prev, ...validFiles]);
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  }

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
    if (priceTrim && !PRICE_INPUT_REGEX.test(priceTrim)) {
      setPriceError("Use apenas números. Ex: 199,90");
      valid = false;
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
    const filename = sanitizeStorageFilename(file.name);
    const path = `${organizationId}/${productId}/${filename}`;
    const { error } = await supabase.storage
      .from("products")
      .upload(path, file, { upsert: true });

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

    const normalizedPrice = productPrice.replace(",", ".");
    const parsedPrice =
      productPrice.trim() === "" ? null : Number(normalizedPrice);

    const normalizedWholesalePrice = wholesalePrice.replace(",", ".");
    const parsedWholesalePrice =
      wholesalePrice.trim() === "" ? null : Number(normalizedWholesalePrice);
    
    const parsedMinQty = wholesaleMinQuantity.trim() === "" ? null : parseInt(wholesaleMinQuantity, 10);

    if (parsedPrice !== null && Number.isNaN(parsedPrice)) {
      setPriceError("Use apenas números. Ex: 199,90");
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
      .eq("id", user.id)
      .single();

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
      let finalUrls = [...existingImageUrls];

      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const uploaded = await uploadProductImage(orgId, editingProduct.id, file);
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

    if (imageFiles.length > 0) {
      const finalUrls = [];
      for (const file of imageFiles) {
        const uploaded = await uploadProductImage(orgId, inserted.id, file);
        if (!uploaded) {
          setProductFormError("Produto criado, mas houve erro ao enviar algumas imagens.");
          setSaving(false);
          handleCloseModal();
          await refreshLimit();
          if (orgId) await fetchProducts(orgId);
          return;
        }
        finalUrls.push(uploaded);
      }

      const { error: updateImgError } = await supabase
        .from("products")
        .update({ 
          image_url: finalUrls.length > 0 ? finalUrls[0] : null,
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
    <div>
      <h1 className="text-2xl font-bold" style={{ color: "var(--dash-text-primary)" }}>Catálogo</h1>

      <p className="mt-2 text-sm" style={{ color: "var(--dash-text-secondary)" }}>
        Gestão dos produtos e categorias exibidos no catálogo.
      </p>

      {catalog && (
        <div className="mt-6 rounded-2xl border p-5 shadow-sm" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
          <h2 className="text-lg font-semibold" style={{ color: "var(--dash-text-primary)" }}>
            Configuração do Catálogo: {catalog.name}
          </h2>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--dash-text-secondary)" }}>
              Descrição Geral do Catálogo (O que são os produtos?)
            </label>
            <textarea
              value={catalogDescription}
              onChange={(e) => setCatalogDescription(e.target.value)}
              placeholder="Ex: Nossa coleção de inverno traz peças em lã e tecidos térmicos para garantir seu conforto com estilo."
              className="w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--dash-border)] min-h-[80px]"
              style={{
                background: "var(--dash-bg)",
                borderColor: "var(--dash-border)",
                color: "var(--dash-text-primary)",
              }}
            />
            <button
              onClick={handleSaveCatalogDescription}
              disabled={savingCatalog}
              className="mt-3 rounded-xl px-4 py-2 text-sm font-medium"
              style={{ background: "var(--dash-text-primary)", color: "var(--dash-bg)", opacity: savingCatalog ? 0.7 : 1 }}
            >
              {savingCatalog ? "Salvando..." : "Salvar Descrição"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-2xl border p-5 shadow-sm" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: "var(--dash-text-primary)" }}>
            Gerenciar Categorias
          </h2>
          <button
            onClick={() => {
              setEditingCategory(null);
              setCategoryName("");
              setCategoryDescription("");
              setShowCategoryModal(true);
            }}
            className="rounded-xl px-4 py-2 text-sm font-medium border"
            style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
          >
            + Nova Categoria
          </button>
        </div>

        {loadingCategories ? (
          <p className="text-sm" style={{ color: "var(--dash-text-secondary)" }}>Carregando categorias...</p>
        ) : categories.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--dash-text-secondary)" }}>Nenhuma categoria cadastrada.</p>
        ) : (
          <div className="space-y-2">
            {categories.map((cat, idx) => (
              <div
                key={cat.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", String(idx));
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const from = parseInt(e.dataTransfer.getData("text/plain"), 10);
                  handleCategoryDrop(from, idx);
                }}
                className="flex items-center justify-between p-3 rounded-xl border bg-[var(--dash-bg)]"
                style={{ borderColor: "var(--dash-border)" }}
              >
                <div className="flex items-center gap-3">
                  <span className="cursor-move text-[var(--dash-text-muted)]">⠿</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--dash-text-primary)" }}>{cat.name}</p>
                    {cat.description && (
                      <p className="text-xs truncate max-w-[300px]" style={{ color: "var(--dash-text-secondary)" }}>{cat.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingCategory(cat);
                      setCategoryName(cat.name);
                      setCategoryDescription(cat.description ?? "");
                      setShowCategoryModal(true);
                    }}
                    className="p-1.5 hover:bg-[rgba(0,0,0,0.05)] rounded"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1.5 hover:bg-red-50 rounded text-red-500"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border p-5 shadow-sm" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
        <h2 className="text-lg font-semibold" style={{ color: "var(--dash-text-primary)" }}>
          Limite do plano
        </h2>

        {loadingLimit ? (
          <p className="mt-2 text-sm" style={{ color: "var(--dash-text-secondary)" }}>Verificando limite...</p>
        ) : canCreateProduct ? (
          <p className="mt-2 text-sm text-green-600">
            Seu plano permite criar novos produtos.
          </p>
        ) : (
          <p className="mt-2 text-sm text-red-500">
            Você atingiu o limite de produtos do seu plano.
          </p>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={handleOpenCreateProduct}
          className="rounded-xl px-4 py-2 text-sm font-medium"
          style={{ background: "var(--dash-text-primary)", color: "var(--dash-bg)" }}
        >
          Novo produto
        </button>
        {createProductError ? (
          <p className="mt-1 text-xs text-red-500">{createProductError}</p>
        ) : null}
      </div>

      <div className="mt-8 rounded-2xl border p-5 shadow-sm" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold" style={{ color: "var(--dash-text-primary)" }}>
            Produtos cadastrados
          </h2>

          <div className="flex items-center gap-3">
            {savingOrder && (
              <span className="text-xs" style={{ color: "var(--dash-text-muted)" }}>Salvando ordem...</span>
            )}
            <span className="text-sm" style={{ color: "var(--dash-text-secondary)" }}>
              {products.length} produto(s)
            </span>
          </div>
        </div>

        <div className="mt-4">
          <input
            type="text"
            placeholder="Buscar produto por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--dash-border)]"
            style={{
              background: "var(--dash-bg)",
              borderColor: "var(--dash-border)",
              color: "var(--dash-text-primary)",
            }}
          />
        </div>

        {products.length > 1 && !searchQuery && (
          <p className="mt-2 text-xs" style={{ color: "var(--dash-text-muted)" }}>
            ⠿ Arraste os produtos para reordenar a exibição no catálogo.
          </p>
        )}
        {searchQuery && (
          <p className="mt-2 text-xs" style={{ color: "var(--dash-text-muted)" }}>
            A ordenação está desativada durante a busca.
          </p>
        )}

        {productListError ? (
          <p className="mt-4 text-xs text-red-500">{productListError}</p>
        ) : null}

        {loadingProducts ? (
          <p className="mt-4 text-sm" style={{ color: "var(--dash-text-secondary)" }}>Carregando produtos...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="mt-4 text-sm" style={{ color: "var(--dash-text-secondary)" }}>
            {searchQuery ? "Nenhum produto encontrado para essa busca." : "Nenhum produto cadastrado ainda."}
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                draggable={!searchQuery}
                onDragStart={(e) => {
                  if (searchQuery) return;
                  setDragProductIndex(index);
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", String(index));
                }}
                onDragOver={(e) => {
                  if (searchQuery) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  setDragOverProductIndex(index);
                }}
                onDrop={(e) => {
                  if (searchQuery) return;
                  e.preventDefault();
                  const raw = e.dataTransfer.getData("text/plain");
                  const from = raw === "" ? NaN : Number.parseInt(raw, 10);
                  if (!Number.isNaN(from)) void handleProductDrop(from, index);
                }}
                onDragEnd={() => {
                  setDragProductIndex(null);
                  setDragOverProductIndex(null);
                }}
                className={`rounded-2xl border p-4 transition-all ${
                  dragProductIndex === index
                    ? "opacity-40"
                    : dragOverProductIndex === index && dragProductIndex !== index
                    ? "shadow-md"
                    : ""
                }`}
                style={{
                  background: dragOverProductIndex === index && dragProductIndex !== index ? "var(--dash-hover-bg)" : "var(--dash-surface)",
                  borderColor: dragOverProductIndex === index && dragProductIndex !== index ? "var(--dash-text-primary)" : "var(--dash-border)",
                }}
              >
                <div className="flex items-start gap-3">
                  {!searchQuery && (
                    <span
                      className="mt-1 shrink-0 cursor-grab select-none font-mono text-lg leading-none active:cursor-grabbing"
                      style={{ color: "var(--dash-border)" }}
                      aria-hidden
                    >
                      {"\u283F"}
                    </span>
                  )}

                  <div className="flex flex-1 items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold" style={{ color: "var(--dash-text-primary)" }}>
                        {product.name}
                      </h3>

                      {product.sku && (
                        <p className="mt-1 text-xs font-mono" style={{ color: "var(--dash-text-secondary)" }}>
                          Ref: {product.sku}
                        </p>
                      )}

                      <p className="mt-1 text-sm" style={{ color: "var(--dash-text-secondary)" }}>
                        Categoria:{" "}
                        {Array.isArray(product.categories)
                          ? (product.categories[0]?.name ?? "Sem categoria")
                          : (product.categories?.name ?? "Sem categoria")}
                      </p>

                      <p className="mt-2 text-sm" style={{ color: "var(--dash-text-secondary)" }}>
                        {product.description || "Sem descrição"}
                      </p>

                      {product.specs && product.specs.length > 0 && (
                        <p className="mt-2 text-sm" style={{ color: "var(--dash-text-secondary)" }}>
                          {product.specs.map((spec, i) => (
                            <span key={i}>
                              {i > 0 ? " · " : null}
                              <span>{spec.chave}:</span>{" "}
                              <span className="font-semibold">{spec.valor}</span>
                            </span>
                          ))}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 text-right">
                      <p className="text-sm font-medium" style={{ color: "var(--dash-text-primary)" }}>
                        {formatPrice(product.price)}
                      </p>
                      {product.has_wholesale && (
                        <span className="rounded bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                          ATACADO
                        </span>
                      )}

                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleDuplicateProduct(product)}
                          className="rounded-lg border px-3 py-1 text-sm"
                          style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-secondary)" }}
                        >
                          Duplicar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(product)}
                          className="rounded-lg border px-3 py-1 text-sm"
                          style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-secondary)" }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          className="rounded-lg border border-red-200 px-3 py-1 text-sm text-red-500 hover:bg-red-50"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {(product.image_urls?.[0] || product.image_url) && (
                  <div className="mt-3 pl-7">
                    <img
                      src={product.image_urls?.[0] || product.image_url || undefined}
                      alt={product.name}
                      className="h-14 w-14 rounded-lg border object-contain"
                      style={{ borderColor: "var(--dash-border)", background: "var(--dash-hover-bg)" }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl border p-6 shadow-xl" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold" style={{ color: "var(--dash-text-primary)" }}>
                  {isEditMode ? "Editar produto" : "Novo produto"}
                </h2>
                <p className="mt-1 text-sm" style={{ color: "var(--dash-text-secondary)" }}>
                  Preencha os dados básicos do produto.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-lg px-2 py-1 text-sm"
                style={{ color: "var(--dash-text-muted)" }}
              >
                X
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="mt-6 space-y-4">
              {productFormError ? (
                <p className="text-xs text-red-500">{productFormError}</p>
              ) : null}

              <div>
                <label className="mb-1 block text-sm font-medium font-semibold" style={{ color: "var(--dash-text-primary)" }}>
                  Categoria
                </label>

                <select
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value);
                    setCategoryError("");
                  }}
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: "var(--dash-input-border)", background: "var(--dash-input-bg)", color: "var(--dash-text-primary)" }}
                >
                  <option value="">
                    {loadingCategories
                      ? "Carregando categorias..."
                      : "Selecione uma categoria"}
                  </option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {categoryError ? (
                  <p className="mt-1 text-xs text-red-500">{categoryError}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium font-semibold" style={{ color: "var(--dash-text-primary)" }}>
                  Nome do produto
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => {
                    setProductName(e.target.value.toUpperCase());
                    setNameError("");
                  }}
                  placeholder="Ex: Kit Amostras Premium"
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: "var(--dash-input-border)", background: "var(--dash-input-bg)", color: "var(--dash-text-primary)" }}
                />
                {nameError ? (
                  <p className="mt-1 text-xs text-red-500">{nameError}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium font-semibold" style={{ color: "var(--dash-text-primary)" }}>
                  Descrição
                </label>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="Descreva o produto"
                  className="min-h-[100px] w-full rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: "var(--dash-input-border)", background: "var(--dash-input-bg)", color: "var(--dash-text-primary)" }}
                  required
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium" style={{ color: "var(--dash-text-primary)" }}>
                  Especificações técnicas (opcional)
                </p>

                {specs.length > 0 && (
                  <ul className="mb-3 space-y-2">
                    {specs.map((s, index) => (
                      <li
                        key={`${s.chave}-${index}`}
                        draggable
                        onDragStart={(e) => {
                          setDragIndex(index);
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData("text/plain", String(index));
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                          setDragOverIndex(index);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const raw = e.dataTransfer.getData("text/plain");
                          const from =
                            raw === "" ? NaN : Number.parseInt(raw, 10);
                          if (Number.isNaN(from) || from === index) {
                            return;
                          }
                          setSpecs((prev) => {
                            if (from < 0 || from >= prev.length) {
                              return prev;
                            }
                            const next = [...prev];
                            const [moved] = next.splice(from, 1);
                            next.splice(index, 0, moved);
                            return next;
                          });
                          setDragIndex(null);
                          setDragOverIndex(null);
                        }}
                        onDragEnd={handleSpecDragEnd}
                        className={`flex items-center justify-between gap-2 rounded-lg border-2 px-3 py-2 text-sm ${
                          dragIndex === index ? "opacity-50" : ""
                        } ${
                          dragOverIndex === index && dragIndex !== index
                            ? "border-blue-400"
                            : ""
                        }`}
                        style={{
                          background: "var(--dash-hover-bg)",
                          borderColor: dragOverIndex === index && dragIndex !== index ? undefined : "var(--dash-border)",
                          color: "var(--dash-text-primary)",
                        }}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <span
                            className="shrink-0 cursor-grab select-none font-mono text-base leading-none active:cursor-grabbing"
                            style={{ color: "var(--dash-text-muted)" }}
                            aria-hidden
                          >
                            {"\u283F"}
                          </span>
                          <span className="truncate">
                            {s.chave}: {s.valor}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSpec(index)}
                          className="shrink-0 text-xs font-medium text-red-600 hover:text-red-800"
                        >
                          Remover
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="min-w-0 flex-1">
                    <label className="mb-1 block text-xs font-medium font-semibold" style={{ color: "var(--dash-text-secondary)" }}>
                      Característica
                    </label>
                    <input
                      type="text"
                      value={specChaveDraft}
                      onChange={(e) => {
                        setSpecChaveDraft(e.target.value);
                        setSpecDraftError("");
                      }}
                      placeholder="Ex: Peso"
                      className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                      style={{ borderColor: "var(--dash-input-border)", background: "var(--dash-input-bg)", color: "var(--dash-text-primary)" }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <label className="mb-1 block text-xs font-medium font-semibold" style={{ color: "var(--dash-text-secondary)" }}>
                      Valor
                    </label>
                    <input
                      type="text"
                      value={specValorDraft}
                      onChange={(e) => {
                        setSpecValorDraft(e.target.value);
                        setSpecDraftError("");
                      }}
                      placeholder="Ex: 500g"
                      className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                      style={{ borderColor: "var(--dash-input-border)", background: "var(--dash-input-bg)", color: "var(--dash-text-primary)" }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addSpec}
                    className="shrink-0 rounded-xl border px-4 py-2 text-sm font-medium"
                    style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                  >
                    Adicionar
                  </button>
                </div>
                {specDraftError ? (
                  <p className="mt-1 text-xs text-red-500">{specDraftError}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium font-semibold" style={{ color: "var(--dash-text-primary)" }}>
                  SKU (Código/Ref)
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Ex: REF-123"
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: "var(--dash-input-border)", background: "var(--dash-input-bg)", color: "var(--dash-text-primary)" }}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium font-semibold" style={{ color: "var(--dash-text-primary)" }}>
                  Preço
                </label>
                <input
                  type="text"
                  value={productPrice}
                  onChange={(e) => {
                    setProductPrice(sanitizePriceTyping(e.target.value));
                    setPriceError("");
                  }}
                  placeholder="Ex: 199,90"
                  className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: "var(--dash-input-border)", background: "var(--dash-input-bg)", color: "var(--dash-text-primary)" }}
                />
                {priceError ? (
                  <p className="mt-1 text-xs text-red-500">{priceError}</p>
                ) : null}
              </div>

              <div className="rounded-xl border p-4" style={{ borderColor: "var(--dash-border)", background: "var(--dash-hover-bg)" }}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasWholesale}
                    onChange={(e) => setHasWholesale(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm font-medium font-semibold" style={{ color: "var(--dash-text-primary)" }}>
                    Habilitar Preço de Atacado
                  </span>
                </label>

                {hasWholesale && (
                  <div className="mt-4 flex gap-4">
                    <div className="flex-1">
                      <label className="mb-1 block text-xs font-medium font-semibold" style={{ color: "var(--dash-text-secondary)" }}>
                        Preço Atacado
                      </label>
                      <input
                        type="text"
                        value={wholesalePrice}
                        onChange={(e) => setWholesalePrice(sanitizePriceTyping(e.target.value))}
                        placeholder="Ex: 150,00"
                        className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                        style={{ borderColor: "var(--dash-input-border)", background: "var(--dash-input-bg)", color: "var(--dash-text-primary)" }}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="mb-1 block text-xs font-medium font-semibold" style={{ color: "var(--dash-text-secondary)" }}>
                        Qtd. Mínima
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={wholesaleMinQuantity}
                        onChange={(e) => setWholesaleMinQuantity(e.target.value)}
                        placeholder="Ex: 10"
                        className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                        style={{ borderColor: "var(--dash-input-border)", background: "var(--dash-input-bg)", color: "var(--dash-text-primary)" }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="block text-sm font-medium font-semibold" style={{ color: "var(--dash-text-primary)" }}>
                    Imagens (Até 5 fotos, máx. 2MB cada)
                  </label>
                  <span className="text-xs" style={{ color: "var(--dash-text-secondary)" }}>
                    {imagePreviewUrls.length} / 5
                  </span>
                </div>
                
                {imagePreviewUrls.length < 5 && (
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageFileChange}
                    className="w-full text-sm file:mr-3 file:rounded-lg file:border file:px-3 file:py-1.5 file:text-sm file:font-medium"
                    style={{ color: "var(--dash-text-secondary)" }}
                  />
                )}
                {imageFileError ? (
                  <p className="mt-1 text-xs text-red-500">{imageFileError}</p>
                ) : null}

                {imagePreviewUrls.length > 0 ? (
                  <div className="mt-3">
                    <p className="mb-2 text-xs font-medium" style={{ color: "var(--dash-text-secondary)" }}>
                      Pré-visualização
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {imagePreviewUrls.map((url, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={url}
                            alt="Pré-visualização"
                            className="h-24 w-24 rounded-lg border object-cover"
                            style={{ borderColor: "var(--dash-border)" }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600"
                            title="Remover imagem"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-xl border px-4 py-2 text-sm font-medium"
                  style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-secondary)" }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {saving ? "Salvando..." : "Salvar produto"}
                </button>
              </div>
            </form>
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
    </div>
  );
}
