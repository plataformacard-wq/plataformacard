"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
let createClient: any;

type Category = {
  id: string;
  name: string;
};

type Spec = { chave: string; valor: string };

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

export default function CatalogoPage() {

  const [canCreateProduct, setCanCreateProduct] = useState<boolean | null>(null);
  const [loadingLimit, setLoadingLimit] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

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
  const [productImageUrl, setProductImageUrl] = useState("");

  useEffect(() => {
  async function initialize() {
    const mod = await import("@/lib/supabase/client");
    createClient = mod.createClient;

    await Promise.all([
      refreshLimit(),
      fetchCategories(),
      fetchProducts(),
    ]);
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

  // 1. pegar usuário logado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("Usuário não autenticado");
    setLoadingProducts(false);
    return;
  }

  // 2. buscar organização do usuário
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

  // 3. buscar produtos filtrados
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
    alert("Erro ao excluir produto");
    return;
  }

  await fetchProducts();
}
  function handleOpenCreateProduct() {
    const supabase = createClient();
    if (!canCreateProduct) {
      alert("Você atingiu o limite do seu plano. Faça upgrade para continuar.");
      return;
    }

    setShowModal(true);
  }

  function handleCloseModal() {
    setShowModal(false);
    setSelectedCategoryId("");
    setProductName("");
    setProductDescription("");
    setSpecs([]);
    setSpecChaveDraft("");
    setSpecValorDraft("");
    setProductPrice("");
    setProductImageUrl("");
    setSaving(false);
  }

  function addSpec() {
    const chave = specChaveDraft.trim();
    const valor = specValorDraft.trim();
    if (!chave || !valor) {
      alert("Preencha característica e valor.");
      return;
    }
    setSpecs((prev) => [...prev, { chave, valor }]);
    setSpecChaveDraft("");
    setSpecValorDraft("");
  }

  function removeSpec(index: number) {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmitProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!canCreateProduct) {
      alert("Você atingiu o limite do seu plano. Faça upgrade para continuar.");
      return;
    }

    if (!selectedCategoryId) {
      alert("Selecione uma categoria.");
      return;
    }

    setSaving(true);

    const parsedPrice =
      productPrice.trim() === ""
        ? null
        : Number(productPrice.replace(",", "."));

    if (parsedPrice !== null && Number.isNaN(parsedPrice)) {
      alert("Preço inválido. Use apenas números, por exemplo: 199,90");
      setSaving(false);
      return;
    }

// 1. pegar usuário logado
const supabase = createClient();

const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  alert("Usuário não autenticado.");
  setSaving(false);
  return;
}

// 2. buscar organização do usuário
const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("organization_id")
  .eq("id", user.id)
  .single();

if (profileError) {
  console.error("Erro ao buscar perfil:", profileError);
  alert("Erro ao identificar a organização do usuário.");
  setSaving(false);
  return;
}

if (!profile?.organization_id) {
  alert("Usuário sem organização.");
  setSaving(false);
  return;
}

// 3. salvar produto com organization_id
const { error } = await supabase.from("products").insert({
  category_id: selectedCategoryId,
  name: productName.trim(),
  description: productDescription.trim(),
  specs,
  price: parsedPrice,
  image_url: productImageUrl.trim() || null,
  is_extra: false,
  sort_order: 0,
  organization_id: profile.organization_id,
});

    if (error) {
      console.error("Erro ao salvar produto:", error);
      alert("Erro ao salvar produto.");
      setSaving(false);
      return;
    }

    alert("Produto salvo com sucesso.");
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
                      Categoria: {Array.isArray(product.categories) ? product.categories[0]?.name ?? "Sem categoria" : product.categories?.name ?? "Sem categoria"}
                    </p>

                    <p className="mt-2 text-sm text-neutral-700">
                      {product.description || "Sem descrição"}
                    </p>

                    {product.specs &&
                      product.specs.length > 0 && (
                        <p className="mt-2 text-sm text-neutral-600">
                          {product.specs
                            .map((s) => `${s.chave}: ${s.valor}`)
                            .join(" · ")}
                        </p>
                      )}
                  </div>
                   <div className="text-right flex flex-col items-end gap-2">
                   <p className="text-sm font-medium text-neutral-900">
                    {formatPrice(product.price)}
                    </p>

                    <button
                    onClick={() => handleDelete(product.id)}
                     className="text-xs text-red-600 hover:text-red-800">
                     Excluir
                     </button>
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
                  Novo produto
                </h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Preencha os dados básicos do produto.
                </p>
              </div>

              <button
                onClick={handleCloseModal}
                className="rounded-lg px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100"
              >
                X
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Categoria
                </label>

                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
                  required
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
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Nome do produto
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Ex: Kit Amostras Premium"
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
                  required
                />
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
                      onChange={(e) => setSpecChaveDraft(e.target.value)}
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
                      onChange={(e) => setSpecValorDraft(e.target.value)}
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
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Preço
                </label>
                <input
                  type="text"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  placeholder="Ex: 199,90"
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  URL da imagem
                </label>
                <input
                  type="text"
                  value={productImageUrl}
                  onChange={(e) => setProductImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
                />
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