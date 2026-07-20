"use client";

import React, { useState, useTransition } from "react";
import { Search, Package, Check, AlertCircle, Loader2, X } from "lucide-react";
import { updateProductStock } from "@/app/dashboard/estoque/actions";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  image_url: string | null;
  stock_quantity: number | null;
  is_in_stock: boolean;
  category_id: string | null;
  categories?: { name: string } | null;
}

interface Category {
  id: string;
  name: string;
}

interface EstoqueManualTabProps {
  products: Product[];
  categories: Category[];
  hasBlingConnection: boolean;
}

export default function EstoqueManualTab({ products: initialProducts, categories, hasBlingConnection }: EstoqueManualTabProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, "success" | "error" | null>>({});
  const [showBlingWarning, setShowBlingWarning] = useState(true);

  const itemsPerPage = 25;

  // Filtragem dos produtos
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" || product.category_id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

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

  return (
    <div className="space-y-6">
      {hasBlingConnection && showBlingWarning && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center justify-between gap-2 animate-fadeIn">
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
            className="w-full pl-12 pr-4 py-3 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all text-sm font-medium text-[var(--dash-text-primary)]"
          />
        </div>

        <div className="w-full md:w-64">
          {/* Cumprindo a regra do select: usar a classe .dash-select e apenas pl-3 ou pl-4 */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="dash-select w-full border border-[var(--dash-border)] pl-4 py-3 rounded-xl bg-[var(--dash-hover-bg)] text-sm font-medium text-[var(--dash-text-primary)] outline-none"
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

                return (
                  <tr
                    key={p.id}
                    className={`transition-colors hover:bg-[var(--dash-hover-bg)]/50 ${
                      rowStatus === "success"
                        ? "bg-green-500/5"
                        : rowStatus === "error"
                        ? "bg-red-500/5"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4 flex items-center gap-4">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover border border-[var(--dash-border)]"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <Package size={20} />
                        </div>
                      )}
                      <span className="font-bold line-clamp-2 max-w-sm" title={p.name}>
                        {p.name}
                      </span>
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
                          readOnly={hasBlingConnection}
                          disabled={updatingId === p.id}
                          onChange={(e) => {
                            if (!hasBlingConnection) {
                              const val = parseInt(e.target.value, 10);
                              setProducts(prev => prev.map(prod => prod.id === p.id ? { ...prod, stock_quantity: isNaN(val) ? 0 : val } : prod));
                            }
                          }}
                          onBlur={(e) => !hasBlingConnection && handleQuantityBlur(p.id, e.target.value, p.stock_quantity)}
                          onClick={() => {
                            if (hasBlingConnection) {
                              alert("Para alterar o estoque manualmente, você precisa desconectar a integração com o Bling na aba 'Sincronização Bling'.");
                            }
                          }}
                          className={`w-24 px-3 py-2 bg-[var(--dash-hover-bg)] border rounded-lg text-center font-bold text-sm outline-none transition-all ${
                            hasBlingConnection ? "cursor-pointer opacity-70 border-[var(--dash-border)]" :
                            rowStatus === "success"
                              ? "border-green-500 ring-2 ring-green-500/20"
                              : rowStatus === "error"
                              ? "border-red-500 ring-2 ring-red-500/20"
                              : "border-[var(--dash-border)] focus:ring-2 focus:ring-primary"
                          }`}
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
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                          p.is_in_stock
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-500 border border-red-500/20"
                        }`}
                      >
                        {p.is_in_stock ? "Em Estoque" : "Esgotado"}
                      </span>
                    </td>
                  </tr>
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
    </div>
  );
}
