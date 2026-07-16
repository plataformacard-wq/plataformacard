import re
import os

filepath = 'app/dashboard/catalogo/CatalogoClient.tsx'
hookpath = 'app/dashboard/catalogo/hooks/useCatalogoManager.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Encontrar o início do componente
match = re.search(r'export default function CatalogoPage\([^)]*\)\s*\{', content)
start_idx = match.start()
component_decl = match.group(0)

# O início do corpo do hook
body_start = match.end()

# 2. Encontrar o início do return JSX (return ()
return_match = re.search(r'\n  return \(\n', content[body_start:])
if not return_match:
    print("Could not find return statement")
    exit(1)

body_end = body_start + return_match.start()

# O que vai para o hook
hook_body = content[body_start:body_end]

# 3. Extrair os imports e types do topo
top_content = content[:start_idx]

# Vamos criar o arquivo do hook
hook_content = f"""import React, {{ useState, useEffect, useCallback, useMemo }} from "react";
import {{ createClient }} from "@/lib/supabase/client";
import {{ getOrCreateCatalog }} from "@/lib/dashboard/sellerActions";

// Copiando as tipagens necessárias
{top_content[top_content.find('type Category ='):]}

export function useCatalogoManager(adminCatalogId: string | null = null) {{
{hook_body}

  return {{
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
    handleToggleVisibility, handleToggleStock, handleDeleteProduct, handleDeleteCategoryItem, hiddenInheritedProducts, setProductListError, setPendingStatusUpdate, setProducts, fetchProducts, setCategories
  }};
}}
"""

os.makedirs(os.path.dirname(hookpath), exist_ok=True)
with open(hookpath, 'w', encoding='utf-8') as f:
    f.write(hook_content)

# 4. Modificar o arquivo original para usar o hook
new_component_body = f"""  const {{
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
    handleToggleVisibility, handleToggleStock, handleDeleteProduct, handleDeleteCategoryItem, hiddenInheritedProducts, setProductListError, setPendingStatusUpdate, setProducts, fetchProducts, setCategories
  }} = useCatalogoManager(adminCatalogId);

"""

new_top_content = top_content + 'import { useCatalogoManager } from "./hooks/useCatalogoManager";\n\n'

new_content = new_top_content + component_decl + new_component_body + content[body_end:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Refatoração aplicada com sucesso via Python script!")
