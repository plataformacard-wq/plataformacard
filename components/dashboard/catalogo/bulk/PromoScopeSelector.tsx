export default function PromoScopeSelector({
  scope,
  setScope,
  selectedCategoryId,
  setSelectedCategoryId,
  categories,
  selectedProductId,
  setSelectedProductId,
  productSearch,
  setProductSearch,
  filteredSearchProducts
}: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-secondary)]">
          Escopo da Alteração
        </label>
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="dash-select w-full bg-[var(--dash-surface-secondary)] border border-[var(--dash-border)] rounded-xl pl-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        >
          <option value="all">Todo o Catálogo</option>
          <option value="category">Por Categoria</option>
          <option value="product">Por Produto Específico</option>
        </select>
      </div>

      {/* Conditional Filters based on scope */}
      {scope === "category" && (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-secondary)]">
            Selecione a Categoria
          </label>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="dash-select w-full bg-[var(--dash-surface-secondary)] border border-[var(--dash-border)] rounded-xl pl-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          >
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {scope === "product" && (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-secondary)]">
            Selecione o Produto
          </label>
          <div className="relative">
            <input 
              type="text"
              placeholder="Buscar produto por nome ou SKU..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full bg-[var(--dash-surface-secondary)] border border-[var(--dash-border)] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all mb-1"
            />
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="dash-select w-full bg-[var(--dash-surface-secondary)] border border-[var(--dash-border)] rounded-xl pl-4 py-2 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all max-h-32"
            >
              {filteredSearchProducts.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.sku ? `(SKU: ${p.sku})` : ""} - {p.price ? `R$ ${p.price}` : "Sem preço"}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
