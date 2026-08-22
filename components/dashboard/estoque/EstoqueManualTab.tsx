"use client";

import React, { useState, useEffect } from "react";
import { Search, Package, Check, AlertCircle, Loader2, X, ChevronDown, ChevronRight, Palette, Sparkles } from "lucide-react";
import { updateProductStock, updateProductColorStock } from "@/app/dashboard/estoque/actions";
import { smartSearchMatch } from "@/lib/utils/smart-search";
import { ProductStatusModal } from "@/components/dashboard/ProductStatusModal";

interface ColorItem {
  name: string;
  hex?: string;
  sku?: string | null;
  stock_quantity?: number | null;
  is_in_stock?: boolean;
}

interface Product {
  id: string;
  name: string;
  sku: string | null;
  image_url: string | null;
  stock_quantity: number | null;
  is_in_stock: boolean;
  category_id: string | null;
  colors?: ColorItem[] | null;
  categories?: { name: string } | null;
}

interface Category {
  id: string;
  name: string;
}

import { useSearchParams } from "next/navigation";

interface EstoqueManualTabProps {
  products: Product[];
  categories: Category[];
  hasBlingConnection: boolean;
}

export default function EstoqueManualTab({ products: initialProducts, categories, hasBlingConnection }: EstoqueManualTabProps) {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatusProduct, setSelectedStatusProduct] = useState<Product | null>(null);

  useEffect(() => {
    const q = searchParams?.get("search");
    if (q !== null && q !== undefined) {
      setSearchQuery(q);
    }
  }, [searchParams]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updatingColorKey, setUpdatingColorKey] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, "success" | "error" | null>>({});
  const [showBlingWarning, setShowBlingWarning] = useState(true);
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});

  const itemsPerPage = 25;

  const toggleExpand = (productId: string) => {
    setExpandedProducts((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  // Filtragem inteligente dos produtos com suporte semântico (ex: esgotado, baixo, promoção)
  const filteredProducts = products.filter((product) => {
    const matchesSearch = smartSearchMatch(product, searchQuery);
    const matchesCategory =
      selectedCategory === "all" || product.category_id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Auto-scroll suave e foco no produto buscado
  useEffect(() => {
    if (searchQuery.trim().length > 0 && filteredProducts.length > 0) {
      const timer = setTimeout(() => {
        const targetRow = document.getElementById(`product-row-${filteredProducts[0].id}`);
        if (targetRow) {
          targetRow.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, filteredProducts]);

  // Paginação
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Atualização de estoque inline (onBlur)
  const handleQuantityBlur = async (productId: string, valueStr: string, currentVal: number | null) => {
    const newVal = valueStr === "" ? 0 : parseInt(valueStr, 10);
    if (isNaN(newVal) || newVal === currentVal) return;

    setUpdatingId(productId);
    setStatuses((prev) => ({ ...prev, [productId]: null }));

    try {
      const res = await updateProductStock(productId, newVal);
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, stock_quantity: newVal, is_in_stock: newVal > 0 } : p
          )
        );
        setStatuses((prev) => ({ ...prev, [productId]: "success" }));
        setTimeout(() => {
          setStatuses((prev) => ({ ...prev, [productId]: null }));
        }, 3000);
      } else {
        setStatuses((prev) => ({ ...prev, [productId]: "error" }));
      }
    } catch (err) {
      setStatuses((prev) => ({ ...prev, [productId]: "error" }));
    } finally {
      setUpdatingId(null);
    }
  };

  // Atualização de estoque de cor específica
  const handleColorQuantityBlur = async (productId: string, colorName: string, valueStr: string, currentVal: number | null) => {
    const newVal = valueStr === "" ? 0 : parseInt(valueStr, 10);
    if (isNaN(newVal) || newVal === currentVal) return;

    const colorKey = `${productId}-${colorName}`;
    setUpdatingColorKey(colorKey);

    try {
      const res = await updateProductColorStock(productId, colorName, newVal);
      if (res.success && res.updatedColors) {
        setProducts((prev) =>
          prev.map((p) => {
            if (p.id === productId) {
              const updatedTotal = res.totalStock ?? p.stock_quantity;
              return {
                ...p,
                colors: res.updatedColors,
                stock_quantity: updatedTotal,
                is_in_stock: updatedTotal > 0
              };
            }
            return p;
          })
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingColorKey(null);
    }
  };

  return (
    <div className="space-y-6">
      {hasBlingConnection && showBlingWarning && (
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>Sua conta está integrada ao Bling. A edição manual foi desabilitada para evitar divergências.</span>
          </div>
          <button 
            onClick={() => setShowBlingWarning(false)}
            className="p-1 hover:bg-amber-500/20 rounded-md transition-colors text-amber-600 dark:text-amber-400 shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Controles de Filtro e Busca */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[27px]">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dash-text-muted)]" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome ou SKU..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-lg outline-none focus:ring-2 focus:ring-primary transition-all text-sm font-medium text-[var(--dash-text-primary)]"
          />
        </div>

        <div className="w-full md:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="dash-select w-full border border-[var(--dash-border)] pl-4 py-3 rounded-lg bg-[var(--dash-hover-bg)] text-sm font-medium text-[var(--dash-text-primary)] outline-none"
          >
            <option value="all">Todas as Categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="overflow-x-auto border border-[var(--dash-border)] bg-[var(--dash-surface)] rounded-[27px]">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--dash-border)] text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)]">
              <th className="px-6 py-4">Produto</th>
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4 w-36">Quantidade</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--dash-border)] text-sm font-medium text-[var(--dash-text-primary)]">
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((p) => {
                const rowStatus = statuses[p.id];
                const catName = p.categories ? p.categories.name : "Sem Categoria";
                const hasColors = Array.isArray(p.colors) && p.colors.length > 0;
                const isExpanded = expandedProducts[p.id] ?? false;
                const isSearched = searchQuery.trim().length > 0 && smartSearchMatch(p, searchQuery);

                return (
                  <React.Fragment key={p.id}>
                    <tr
                      id={`product-row-${p.id}`}
                      className={`transition-all duration-300 hover:bg-[var(--dash-hover-bg)]/50 ${
                        isSearched
                          ? "bg-emerald-500/10 border-l-4 border-l-emerald-500 font-bold shadow-md"
                          : rowStatus === "success"
                          ? "bg-green-500/5"
                          : rowStatus === "error"
                          ? "bg-red-500/5"
                          : ""
                      }`}
                    >
                          <td className="px-6 py-4 flex items-center gap-4">
                            {hasColors ? (
                              <button
                                type="button"
                                onClick={() => toggleExpand(p.id)}
                                className="p-1.5 rounded-lg bg-[var(--dash-hover-bg)] text-[var(--dash-text-secondary)] hover:text-white transition-colors"
                                title="Expandir cores"
                              >
                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              </button>
                            ) : null}
                            {p.image_url ? (
                              <img
                                src={p.image_url}
                                alt={p.name}
                                className="w-12 h-12 rounded-lg object-cover border border-[var(--dash-border)]"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Package size={20} />
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="font-bold line-clamp-2 max-w-sm" title={p.name}>
                                {p.name}
                              </span>
                              {hasColors && (
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(p.id)}
                                  className="text-xs text-primary font-semibold flex items-center gap-1 mt-0.5 hover:underline text-left"
                                >
                                  <Palette size={12} />
                                  {p.colors?.length} cor(es) cadastrada(s)
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[var(--dash-text-secondary)] font-mono">
                            {p.sku || "-"}
                          </td>
                          <td className="px-6 py-4 text-[var(--dash-text-secondary)]">
                            {catName}
                          </td>
                          <td className="px-6 py-4 relative">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={p.stock_quantity ?? 0}
                                readOnly={hasBlingConnection || hasColors}
                                disabled={updatingId === p.id}
                                onChange={(e) => {
                                  if (!hasBlingConnection && !hasColors) {
                                    const val = parseInt(e.target.value, 10);
                                    setProducts(prev => prev.map(prod => prod.id === p.id ? { ...prod, stock_quantity: isNaN(val) ? 0 : val } : prod));
                                  }
                                }}
                                onBlur={(e) => !hasBlingConnection && !hasColors && handleQuantityBlur(p.id, e.target.value, p.stock_quantity)}
                                onClick={() => {
                                  if (hasBlingConnection) {
                                    alert("Para alterar o estoque manualmente, você precisa desconectar a integração com o Bling na aba 'Sincronização Bling'.");
                                  } else if (hasColors) {
                                    toggleExpand(p.id);
                                  }
                                }}
                                className={`w-24 px-3 py-2 bg-[var(--dash-hover-bg)] border rounded-lg text-center font-bold text-sm outline-none transition-all ${
                                  hasBlingConnection || hasColors ? "cursor-pointer opacity-80 border-[var(--dash-border)]" :
                                  rowStatus === "success"
                                    ? "border-green-500 ring-2 ring-green-500/20"
                                    : rowStatus === "error"
                                    ? "border-red-500 ring-2 ring-red-500/20"
                                    : "border-[var(--dash-border)] focus:ring-2 focus:ring-primary"
                                }`}
                                title={hasColors ? "Estoque calculated automaticamente pelas cores" : undefined}
                              />
                              {updatingId === p.id && (
                                <Loader2 size={16} className="animate-spin text-primary" />
                              )}
                              {rowStatus === "success" && (
                                <Check size={16} className="text-green-500 animate-bounce" />
                              )}
                              {rowStatus === "error" && (
                                <AlertCircle size={16} className="text-red-500 animate-pulse" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                            <span
                              className={`inline-flex px-3 py-1 rounded text-xs font-bold ${
                                p.is_in_stock
                                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                  : "bg-red-500/10 text-red-500 border border-red-500/20"
                              }`}
                            >
                              {p.is_in_stock ? "Em Estoque" : "Esgotado"}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedStatusProduct(p)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-extrabold transition-all shadow-sm active:scale-95"
                              title="Ver Raio-X 360° do Produto"
                            >
                              <Sparkles size={12} /> Status 360°
                            </button>
                          </td>
                        </tr>

                    {/* Sub-tabela de Cores Expansível */}
                    {hasColors && isExpanded && (
                      <tr className="bg-[var(--dash-hover-bg)]/20 border-b border-[var(--dash-border)]">
                        <td colSpan={5} className="px-12 py-3">
                          <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-lg p-4 space-y-3">
                            <span className="text-xs font-bold text-[var(--dash-text-secondary)] uppercase tracking-wider block">
                              Estoque por Variação de Cor
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {p.colors?.map((c: any, cIdx: number) => {
                                const colorName = typeof c === "string" ? c : c.name;
                                const colorHex = typeof c === "object" ? c.hex || "#71717A" : "#71717A";
                                const colorSku = typeof c === "object" ? c.sku || null : null;
                                const colorQty = typeof c === "object" && typeof c.stock_quantity === "number" ? c.stock_quantity : 0;
                                const cKey = `${p.id}-${colorName}`;
                                const isUpdating = updatingColorKey === cKey;

                                return (
                                  <div
                                    key={cIdx}
                                    className="flex items-center justify-between p-3 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-hover-bg)]/50 gap-3"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <span
                                        className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                                        style={{ backgroundColor: colorHex }}
                                      />
                                      <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-bold text-[var(--dash-text-primary)] truncate">
                                          {colorName}
                                        </span>
                                        {colorSku && (
                                          <span className="text-[10px] font-mono text-[var(--dash-text-muted)] truncate">
                                            SKU: {colorSku}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <input
                                        type="number"
                                        defaultValue={colorQty}
                                        readOnly={hasBlingConnection}
                                        disabled={isUpdating}
                                        onChange={(e) => {
                                          if (!hasBlingConnection) {
                                            const val = parseInt(e.target.value, 10);
                                            setProducts((prev) =>
                                              prev.map((prod) => {
                                                if (prod.id === p.id && Array.isArray(prod.colors)) {
                                                  const newCols = prod.colors.map((item: any) => {
                                                    const nameMatch = typeof item === "string" ? item === colorName : item.name === colorName;
                                                    if (nameMatch) {
                                                      return typeof item === "string"
                                                        ? { name: item, stock_quantity: isNaN(val) ? 0 : val }
                                                        : { ...item, stock_quantity: isNaN(val) ? 0 : val };
                                                    }
                                                    return item;
                                                  });
                                                  const newTot = newCols.reduce((s: number, col: any) => s + (col.stock_quantity || 0), 0);
                                                  return { ...prod, colors: newCols, stock_quantity: newTot, is_in_stock: newTot > 0 };
                                                }
                                                return prod;
                                              })
                                            );
                                          }
                                        }}
                                        onBlur={(e) => !hasBlingConnection && handleColorQuantityBlur(p.id, colorName, e.target.value, colorQty)}
                                        className="w-16 px-2 py-1 bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded text-center text-xs font-bold text-[var(--dash-text-primary)] outline-none focus:ring-1 focus:ring-primary"
                                      />
                                      {isUpdating && <Loader2 size={12} className="animate-spin text-primary" />}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[var(--dash-text-muted)]">
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[27px]">
          <span className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)]">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-[var(--dash-border)] bg-[var(--dash-hover-bg)] hover:bg-[var(--dash-surface)] rounded-lg text-xs font-black uppercase tracking-widest text-[var(--dash-text-primary)] disabled:opacity-50 transition-all active:scale-95"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-[var(--dash-border)] bg-[var(--dash-hover-bg)] hover:bg-[var(--dash-surface)] rounded-lg text-xs font-black uppercase tracking-widest text-[var(--dash-text-primary)] disabled:opacity-50 transition-all active:scale-95"
            >
              Próximo
            </button>
          </div>
        </div>
      )}

      <ProductStatusModal
        product={selectedStatusProduct}
        isOpen={!!selectedStatusProduct}
        onClose={() => setSelectedStatusProduct(null)}
        hasBlingConnection={hasBlingConnection}
      />
    </div>
  );
}
