"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import nextDynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { getOrCreateCatalog } from "@/lib/dashboard/sellerActions";

import Link from "next/link";
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
  Palette,
  GripVertical,
  DollarSign,
  Bold,
  Italic,
  Info,
  Plus as PlusIcon
} from "lucide-react";
import { HexColorPicker } from "react-colorful";
import ProductModal from "@/components/dashboard/ProductModal";
import CatalogProductItem from "@/components/dashboard/catalogo/CatalogProductItem";
import CatalogHeader from "@/components/dashboard/catalogo/CatalogHeader";
import CatalogCategoryList from "@/components/dashboard/catalogo/CatalogCategoryList";
import CategoryModal from "@/components/dashboard/CategoryModal";
import NoCategoryModal from "@/components/dashboard/NoCategoryModal";
import VisibilityAlertModal from "@/components/dashboard/VisibilityAlertModal";

type Category = {
  id: string;
  catalog_id?: string | null;
  name: string;
  description?: string | null;
  sort_order?: number | null;
  specs_title?: string | null;
  show_specs?: boolean | null;
  show_colors?: boolean | null;
  colors?: string[] | null;
};

type Catalog = {
  id: string;
  name: string;
  description: string | null;
  type: "product" | "service" | "hybrid";
};

type Spec = { id?: string; chave: string; valor: string };

const PRICE_INPUT_REGEX = /^[0-9.,]*$/;

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

type ProductRow = {
  id: string;
  catalog_id?: string | null;
  organization_id: string;
  whatsapp_template: string | null;
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
  stock_quantity?: number | null;
  manual_stock?: boolean | null;
  specs_title?: string | null;
  show_specs?: boolean | null;
  show_colors?: boolean | null;
  colors?: string[] | null;
  highlight_text?: string | null;
  show_highlight?: boolean | null;
  type?: "product" | "service";
  is_caas?: boolean;
  is_new_from_master?: boolean;
  original_master_price?: number | null;
  caas_owner_name?: string;
  override_id?: string;
  original_category_id?: string | null;
  created_at: string;
  sort_order: number | null;
  categories: any;
  allow_price_overrides?: boolean;
};

function getProductCategoryId(product: ProductRow): string {
  if (product.category_id) return product.category_id;
  const c = product.categories;
  if (Array.isArray(c)) return c[0]?.id ?? "";
  return c?.id ?? "";
}

function getProductImage(product: ProductRow): string {
  // Se image_urls for string, tenta fazer o parse
  let urls = product.image_urls;
  if (typeof urls === 'string') {
    try {
      urls = JSON.parse(urls);
    } catch (e) {
      urls = [];
    }
  }
  
  if (Array.isArray(urls) && urls.length > 0) {
    return urls[0];
  }
  
  return product.image_url || "";
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

import { useCatalogoManager } from "./hooks/useCatalogoManager";

export default function CatalogoPage({ adminCatalogId = null }: { adminCatalogId?: string | null }) {  const {
    userRole, granularPermissions, canCreateProduct, productLimit, productUsageCount, loadingLimit, showModal, setShowModal,
    saving, setSaving, editingProduct, setEditingProduct, categories, loadingCategories, selectedCategoryId, setSelectedCategoryId,
    catalog, catalogDescription, setCatalogDescription, catalogType, setCatalogType, whatsappTemplate, setWhatsappTemplate,
    savingCatalog, orgId, catalogId, isEmailConfirmed, showCategoryModal, setShowCategoryModal, editingCategory, setEditingCategory,
    activeProductTab, setActiveProductTab, businessModel, hasMasterCatalog, showUnlinkedWarning, allowCaasDetachment, products,
    loadingProducts, savingOrder, dragProductIndex, setDragProductIndex, dragOverProductIndex, setDragOverProductIndex,
    productListError, searchQuery, setSearchQuery, showNoCategoryModal, setShowNoCategoryModal, isPickerOpen, setIsPickerOpen,
    showVisibilityAlert, setShowVisibilityAlert, dontShowAgain, setDontShowAgain, pendingStatusUpdate, userSlug, makingAllVisible,
    stripHtml, refreshProductList, handleSaveCatalogDescription, handleDeleteCategory, handleCategoryDrop, handleProductDrop,
    handleMakeAllVisible, handleOpenCreateProduct, handleOpenEdit, handleDuplicateProduct, handleCloseModal, performStatusUpdate,
    hiddenInheritedProducts, setProductListError, setPendingStatusUpdate, setProducts, fetchProducts, setCategories, refreshLimit,
    categorizedProducts, handleReorderCategoryProducts, formatPrice, toggleProductStatus, handleDelete, confirmVisibilityUpdate,
    fetchCategories
  } = useCatalogoManager(adminCatalogId);


  return (
    <div className="flex flex-col gap-10 pb-20">
      {showUnlinkedWarning && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-[27px] border border-amber-500/20 bg-amber-500/5 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-[27px] bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-base text-amber-800 dark:text-amber-400">
                Catálogo Franquias Desvinculado
              </h3>
              <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1 leading-relaxed max-w-2xl">
                O Catálogo Franquias foi desvinculado ou removido desta franquia. No momento, você não está herdando nenhum produto da franqueadora. Entre em contato com o super administrador para vincular um catálogo.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header com Título e Limite */}
      <CatalogHeader
        adminCatalogId={adminCatalogId}
        catalog={catalog}
        catalogType={catalogType}
        catalogId={catalogId}
        setCatalogType={setCatalogType}
        productUsageCount={productUsageCount}
        productLimit={productLimit}
      />

      {!loadingProducts && !loadingCategories && !catalogId ? (
        <div className="mt-8 flex flex-col items-center justify-center text-center p-16 border-2 border-dashed rounded-[27px]" style={{ borderColor: "var(--dash-border)", background: "var(--dash-surface)" }}>
          <div className="bg-amber-100 dark:bg-amber-900/30 p-5 rounded-full mb-6">
            <AlertCircle className="text-amber-600 dark:text-amber-400" size={48} />
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: "var(--dash-text-primary)" }}>Inicializando Catálogo</h2>
          <p className="max-w-md text-base mb-8 leading-relaxed" style={{ color: "var(--dash-text-secondary)" }}>
            Estamos preparando sua área de produtos. Se esta mensagem persistir, por favor recarregue a página.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-10 py-4 bg-primary text-white rounded-[27px] font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Recarregar Catálogo
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Categorias Section */}
          <CatalogCategoryList
            hiddenInheritedProducts={hiddenInheritedProducts}
            handleMakeAllVisible={handleMakeAllVisible}
            makingAllVisible={makingAllVisible}
            setEditingCategory={setEditingCategory}
            setShowCategoryModal={setShowCategoryModal}
            loadingCategories={loadingCategories}
            categories={categories}
            catalogId={catalogId}
            products={products}
            getProductCategoryId={getProductCategoryId}
            handleDeleteCategory={handleDeleteCategory}
          />

          {/* Produtos Section */}
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Package size={24} />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: "var(--dash-text-primary)" }}>
                  {catalogType === 'service' ? 'Serviços' : catalogType === 'hybrid' ? 'Produtos/Serviços' : 'Produtos'}
                </h2>
              </div>
              
              <div className="flex items-center gap-3 flex-1 max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-[27px] border outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5 caret-primary"
                    style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                  />
                </div>
                {(userRole !== 'seller' || granularPermissions?.catalog?.create !== false) && (
                  <button
                    onClick={handleOpenCreateProduct}
                    className="hidden md:flex items-center gap-2 rounded-xl px-6 py-3 bg-primary text-white text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                  >
                    <Plus size={20} /> Novo {catalogType === 'service' ? 'Serviço' : 'Produto'}
                  </button>
                )}
              </div>
            </div>

            {productListError && (
              <div className="p-4 rounded-[27px] bg-red-50 border border-red-100 text-red-500 text-sm font-medium">
                {productListError}
              </div>
            )}

            <div className="space-y-4">
              {loadingProducts ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-32 animate-pulse rounded-[27px]" style={{ background: "var(--dash-surface-secondary)" }} />
                ))
              ) : (categorizedProducts.categorized.length === 0 && categorizedProducts.uncategorized.length === 0) ? (
                <div className="p-20 text-center rounded-[27px] border border-dashed" style={{ borderColor: "var(--dash-border)" }}>
                  <Package className="mx-auto h-16 w-16 text-zinc-200 mb-4" />
                  <p className="text-zinc-500 font-medium">
                    {searchQuery ? "Nenhum produto corresponde à sua busca." : "Nenhum produto cadastrado."}
                  </p>
                </div>
              ) : (
                <div className="space-y-10">
                  {/* Categorized Products */}
                  {categorizedProducts.categorized.map((category) => (
                    <div key={category.id} className="space-y-4">
                      <div className="flex items-center gap-2 px-2">
                        <span className="w-1.5 h-4 rounded-full bg-emerald-500 shadow-sm" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-[var(--dash-text-muted)]">
                          {category.name} ({category.products.length})
                        </h3>
                      </div>
                      <Reorder.Group 
                        axis="y" 
                        values={category.products} 
                        onReorder={(newOrder) => handleReorderCategoryProducts(newOrder, category.id)} 
                        className="space-y-4"
                      >
                        {category.products.map((product) => (
                                                    <CatalogProductItem
                            key={product.id}
                            product={product}
                            handleOpenEdit={handleOpenEdit}
                            getProductImage={getProductImage}
                            formatPrice={formatPrice}
                            toggleProductStatus={toggleProductStatus}
                            userSlug={userSlug}
                            adminCatalogId={adminCatalogId}
                            catalogId={catalogId}
                            allowCaasDetachment={allowCaasDetachment}
                            handleDuplicateProduct={handleDuplicateProduct}
                            handleDelete={handleDelete}
                          />
                        ))}
                      </Reorder.Group>
                    </div>
                  ))}

                  {/* Uncategorized Products */}
                  {categorizedProducts.uncategorized.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-2">
                        <span className="w-1.5 h-4 rounded-full bg-zinc-500 shadow-sm" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-[var(--dash-text-muted)]">
                          Sem Categoria ({categorizedProducts.uncategorized.length})
                        </h3>
                      </div>
                      <Reorder.Group 
                        axis="y" 
                        values={categorizedProducts.uncategorized} 
                        onReorder={(newOrder) => handleReorderCategoryProducts(newOrder, null)} 
                        className="space-y-4"
                      >
                        {categorizedProducts.uncategorized.map((product) => (
                                                    <CatalogProductItem
                            key={product.id}
                            product={product}
                            handleOpenEdit={handleOpenEdit}
                            getProductImage={getProductImage}
                            formatPrice={formatPrice}
                            toggleProductStatus={toggleProductStatus}
                            userSlug={userSlug}
                            adminCatalogId={adminCatalogId}
                            catalogId={catalogId}
                            allowCaasDetachment={allowCaasDetachment}
                            handleDuplicateProduct={handleDuplicateProduct}
                            handleDelete={handleDelete}
                          />
                        ))}
                      </Reorder.Group>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      <ProductModal
        isOpen={showModal}
        allowCaasDetachment={allowCaasDetachment}
        onClose={handleCloseModal}
        onSuccess={() => {
          refreshProductList();
          refreshLimit();
        }}
        editingProduct={editingProduct}
        categories={categories.filter(c => c.catalog_id === catalogId)}
        orgId={orgId || ""}
        canCreateProduct={(canCreateProduct ?? false) || productLimit <= 0}
        catalogType={catalogType}
      />

      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSuccess={() => {
          if (catalogId) fetchCategories(catalogId, orgId);
        }}
        editingCategory={editingCategory}
        catalogId={catalogId}
      />
      {/* Modal: Nenhuma Categoria Encontrada */}
      <NoCategoryModal 
        isOpen={showNoCategoryModal}
        onClose={() => setShowNoCategoryModal(false)}
        onCreateCategory={() => {
          setShowNoCategoryModal(false);
          setShowCategoryModal(true);
        }}
      />

      <VisibilityAlertModal 
        isOpen={showVisibilityAlert}
        dontShowAgain={dontShowAgain}
        setDontShowAgain={setDontShowAgain}
        onClose={() => { setShowVisibilityAlert(false); setPendingStatusUpdate(null); }}
        onConfirm={confirmVisibilityUpdate}
      />

    </div>
  );
}
