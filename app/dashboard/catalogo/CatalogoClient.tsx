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

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [specChaveDraft, setSpecChaveDraft] = useState("");
  const [specValorDraft, setSpecValorDraft] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const [nameError, setNameError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [imageFileError, setImageFileError] = useState("");
  const [specDraftError, setSpecDraftError] = useState("");
  const [productFormError, setProductFormError] = useState("");
  const [createProductError, setCreateProductError] = useState("");
  const [productListError, setProductListError] = useState("");

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
    setSpecChaveDraft("");
    setSpecValorDraft("");
    setProductPrice("");
    setNameError("");
    setCategoryError("");
    setPriceError("");
    setImageFileError("");
    setSpecDraftError("");
    setProductFormError("");
    setImageFile(null);
    revokePreviewIfBlob(imagePreviewUrl);
    setImagePreviewUrl(null);
    setShowModal(true);
  }

  function handleOpenEdit(product: ProductRow) {
    setCreateProductError("");
    setEditingProduct(product);
    setSelectedCategoryId(getProductCategoryId(product));
    setProductName(product.name.toUpperCase());
    setProductDescription(product.description ?? "");
    setSpecs(product.specs ?? []);
    setSpecChaveDraft("");
    setSpecValorDraft("");
    setProductPrice(formatPriceForInput(product.price));
    setImageFile(null);
    revokePreviewIfBlob(imagePreviewUrl);
    setImagePreviewUrl(product.image_url);
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
    setSpecChaveDraft("");
    setSpecValorDraft("");
    setProductPrice("");
    setImageFile(null);
    revokePreviewIfBlob(imagePreviewUrl);
    setImagePreviewUrl(null);
    setSaving(false);
    setNameError("");
    setCategoryError("");
    setPriceError("");
    setImageFileError("");
    setSpecDraftError("");
    setProductFormError("");
  }

  function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";

    if (!file) {
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setImageFileError("A imagem deve ter no máximo 2MB");
      return;
    }

    setImageFileError("");
    setImageFile(file);
    revokePreviewIfBlob(imagePreviewUrl);
    setImagePreviewUrl(URL.createObjectURL(file));
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
      let imageUrl = editingProduct.image_url;

      if (imageFile) {
        const uploaded = await uploadProductImage(orgId, editingProduct.id, imageFile);
        if (!uploaded) {
          setProductFormError("Erro ao enviar a imagem. Tente novamente.");
          setSaving(false);
          return;
        }
        imageUrl = uploaded;
      }

      const { error } = await supabase
        .from("products")
        .update({
          ...basePayload,
          image_url: imageUrl,
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

    if (imageFile) {
      const uploaded = await uploadProductImage(orgId, inserted.id, imageFile);
      if (!uploaded) {
        setProductFormError("Produto criado, mas houve erro ao enviar a imagem.");
        setSaving(false);
        handleCloseModal();
        await refreshLimit();
        await fetchProducts();
        return;
      }

      const { error: updateImgError } = await supabase
        .from("products")
        .update({ image_url: uploaded })
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Catálogo</h1>

      <p className="mt-2 text-sm text-neutral-600">
        Gestão dos produtos exibidos no catálogo.
      </p>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900">
          Limite do plano
        </h2>

        {loadingLimit ? (
          <p className="mt-2 text-sm text-neutral-600">Verificando limite...</p>
        ) : canCreateProduct ? (
          <p className="mt-2 text-sm text-green-700">
            Seu plano permite criar novos produtos.
          </p>
        ) : (
          <p className="mt-2 text-sm text-red-600">
            Você atingiu o limite de produtos do seu plano.
          </p>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={handleOpenCreateProduct}
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Novo produto
        </button>
        {createProductError ? (
          <p className="mt-1 text-xs text-red-500">{createProductError}</p>
        ) : null}
      </div>

      <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            Produtos cadastrados
          </h2>

          <span className="text-sm text-neutral-500">
            {products.length} produto(s)
          </span>
        </div>

        {productListError ? (
          <p className="mt-4 text-xs text-red-500">{productListError}</p>
        ) : null}

        {loadingProducts ? (
          <p className="mt-4 text-sm text-neutral-600">Carregando produtos...</p>
        ) : products.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-600">
            Nenhum produto cadastrado ainda.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl border border-neutral-200 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-neutral-900">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-sm text-neutral-500">
                      Categoria:{" "}
                      {Array.isArray(product.categories)
                        ? (product.categories[0]?.name ?? "Sem categoria")
                        : (product.categories?.name ?? "Sem categoria")}
                    </p>

                    <p className="mt-2 text-sm text-neutral-700">
                      {product.description || "Sem descrição"}
                    </p>

                    {product.specs && product.specs.length > 0 && (
                      <p className="mt-2 text-sm text-neutral-600">
                        {product.specs
                          .map((s) => `${s.chave}: ${s.valor}`)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 text-right">
                    <p className="text-sm font-medium text-neutral-900">
                      {formatPrice(product.price)}
                    </p>

                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(product)}
                        className="rounded-lg border border-neutral-300 px-3 py-1 text-sm text-neutral-700 hover:bg-neutral-50"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        className="rounded-lg border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>

                {product.image_url && (
                  <p className="mt-3 break-all text-xs text-neutral-500">
                    Imagem: {product.image_url}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">
                  {isEditMode ? "Editar produto" : "Novo produto"}
                </h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Preencha os dados básicos do produto.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-lg px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100"
              >
                X
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="mt-6 space-y-4">
              {productFormError ? (
                <p className="text-xs text-red-500">{productFormError}</p>
              ) : null}

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Categoria
                </label>

                <select
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value);
                    setCategoryError("");
                  }}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
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
                <label className="mb-1 block text-sm font-medium text-neutral-700">
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
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
                />
                {nameError ? (
                  <p className="mt-1 text-xs text-red-500">{nameError}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Descrição
                </label>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="Descreva o produto"
                  className="min-h-[100px] w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
                  required
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-neutral-700">
                  Especificações técnicas (opcional)
                </p>

                {specs.length > 0 && (
                  <ul className="mb-3 space-y-2">
                    {specs.map((s, index) => (
                      <li
                        key={`${s.chave}-${index}`}
                        className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800"
                      >
                        <span>
                          {s.chave}: {s.valor}
                        </span>
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
                    <label className="mb-1 block text-xs font-medium text-neutral-600">
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
                      className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <label className="mb-1 block text-xs font-medium text-neutral-600">
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
                      className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addSpec}
                    className="shrink-0 rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
                  >
                    Adicionar
                  </button>
                </div>
                {specDraftError ? (
                  <p className="mt-1 text-xs text-red-500">{specDraftError}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
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
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
                />
                {priceError ? (
                  <p className="mt-1 text-xs text-red-500">{priceError}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Imagem (JPEG, PNG ou WebP, máx. 2MB)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageFileChange}
                  className="w-full text-sm text-neutral-700 file:mr-3 file:rounded-lg file:border file:border-neutral-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-neutral-800 hover:file:bg-neutral-50"
                />
                {imageFileError ? (
                  <p className="mt-1 text-xs text-red-500">{imageFileError}</p>
                ) : null}
                {imagePreviewUrl ? (
                  <div className="mt-3">
                    <p className="mb-1 text-xs font-medium text-neutral-600">
                      Pré-visualização
                    </p>
                    <img
                      src={imagePreviewUrl}
                      alt="Pré-visualização do produto"
                      className="max-h-48 w-auto max-w-full rounded-lg border border-neutral-200 object-contain"
                    />
                  </div>
                ) : null}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700"
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
