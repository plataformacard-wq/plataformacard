"use client";

export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

type Category = {
  id: string;
  name: string;
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

  useEffect(() => {
    async function initialize() {
      await Promise.all([refreshLimit(), fetchCategories(), fetchProducts()]);
    }

    initialize();
  }, []);

  async function refreshLimit() {
    const supabase = createClient();
    const { data } = await supabase.rpc("can_create_product");
    setCanCreateProduct(data);
    setLoadingLimit(false);
  }

  async function fetchCategories() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error("Erro ao buscar categorias:", error);
    } else if (data) {
      setCategories(data);
    }

    setLoadingCategories(false);
  }

  async function fetchProducts() {
    const supabase = createClient();
    setLoadingProducts(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("Usuário não autenticado");
      setLoadingProducts(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.organization_id) {
      console.error("Erro ao buscar organização:", profileError);
      setLoadingProducts(false);
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .select(
        `
      id,
      name,
      description,
      specs,
      price,
      image_url,
      image_urls,
      created_at,
      categories (
        id,
        name
      )
    `
      )
      .eq("organization_id", profile.organization_id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar produtos:", error);
    } else if (data) {
      setProducts((data ?? []) as unknown as ProductRow[]);
    }

    setLoadingProducts(false);
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
    await fetchProducts();
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
      await fetchProducts();
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
          await fetchProducts();
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
        await fetchProducts();
        return;
      }
    }

    handleCloseModal();
    await refreshLimit();
    await fetchProducts();
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
        Gestão dos produtos exibidos no catálogo.
      </p>

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

                      <div className="flex flex-wrap justify-end gap-2">
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
    </div>
  );
}
