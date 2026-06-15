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
import CategoryModal from "@/components/dashboard/CategoryModal";

type Category = {
  id: string;
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

export default function CatalogoPage({ adminCatalogId = null }: { adminCatalogId?: string | null }) {
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
  const [catalogType, setCatalogType] = useState<"product" | "service" | "hybrid">("product");
  const [whatsappTemplate, setWhatsappTemplate] = useState("");
  const [savingCatalog, setSavingCatalog] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [catalogId, setCatalogId] = useState<string | null>(null);
  const [isEmailConfirmed, setIsEmailConfirmed] = useState(true); // Definindo como true por padrão para não bloquear o gestor
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeProductTab, setActiveProductTab] = useState<"my_products" | "caas_products">("my_products");
  const [businessModel, setBusinessModel] = useState<string | null>(null);
  const [hasMasterCatalog, setHasMasterCatalog] = useState<boolean>(true);
  const [showUnlinkedWarning, setShowUnlinkedWarning] = useState(false);
  const [allowCaasDetachment, setAllowCaasDetachment] = useState(false);

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const [dragProductIndex, setDragProductIndex] = useState<number | null>(null);
  const [dragOverProductIndex, setDragOverProductIndex] = useState<number | null>(null);

  const [productListError, setProductListError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [showNoCategoryModal, setShowNoCategoryModal] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [showVisibilityAlert, setShowVisibilityAlert] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{ product: ProductRow, field: 'is_active' | 'is_in_stock' } | null>(null);
  const [userSlug, setUserSlug] = useState<string | null>(null);

  const stripHtml = (html: string) => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // --- AI ASSISTANT LOGIC ---
  // AI logic moved to ProductModal

  // Helper variables moved to ProductModal

  // Color logic moved to ProductModal

  async function fetchProductsForAdminCatalog(catalogId: string) {
    const supabase = createClient();
    setLoadingProducts(true);

    const { data: cats } = await supabase
      .from("categories")
      .select("id")
      .eq("catalog_id", catalogId);

    const catIds = cats?.map(c => c.id) || [];

    if (catIds.length === 0) {
      setProducts([]);
      setProductUsageCount(0);
      setLoadingProducts(false);
      return;
    }

    const { data: ownData, error: ownError } = await supabase
      .from("products")
      .select(
        `
      id,
      organization_id,
      category_id,
      name,
      description,
      specs,
      price,
      compare_at_price,
      sku,
      has_retail,
      has_wholesale,
      wholesale_price,
      wholesale_min_quantity,
      image_url,
      image_urls,
      is_active,
      is_in_stock,
      price_display_mode,
      highlight_text,
      show_highlight,
      type,
      sort_order,
      created_at,
      categories (
        id,
        name
      )
    `
      )
      .in("category_id", catIds)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    const prodList = (ownData ?? []) as unknown as ProductRow[];
    setProducts(prodList);
    setProductUsageCount(prodList.length);
    setLoadingProducts(false);
  }

  const refreshProductList = useCallback(() => {
    if (adminCatalogId) {
      fetchProductsForAdminCatalog(adminCatalogId);
    } else if (orgId) {
      fetchProducts(orgId);
    }
  }, [adminCatalogId, orgId]);

  useEffect(() => {
    async function initialize() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        if (adminCatalogId) {
          setCatalogId(adminCatalogId);
          setOrgId(null);
          setCanCreateProduct(true);
          
          const { data: catData } = await supabase
            .from("catalogs")
            .select("id, name, description, catalog_type, type, whatsapp_template")
            .eq("id", adminCatalogId)
            .single();

          if (catData) {
            setCatalog(catData as any);
            setCatalogDescription(catData.description || "");
            setCatalogType(catData.type as any || "product");
            setWhatsappTemplate(catData.whatsapp_template || "");
          }

          await Promise.all([
            fetchCategories(adminCatalogId),
            fetchProductsForAdminCatalog(adminCatalogId),
            fetchUserSlug(user.id)
          ]);
        } else {
          const oid = await fetchOrganizationId();
          
          if (oid) {
            setOrgId(oid);
            const cid = await fetchCatalog(oid);
            
            if (cid) {
              setCatalogId(cid);
              await Promise.all([refreshLimit(), fetchCategories(cid), fetchProducts(oid), fetchUserSlug(user.id)]);
            }
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
  }, [adminCatalogId]);

  async function fetchOrganizationId(): Promise<string | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // 1. Tenta buscar o perfil pelo ID principal (que deve ser igual ao do usuário)
    let { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      const { data: profileByUid } = await supabase
        .from("profiles")
        .select("organization_id, id, role")
        .eq("user_id", user.id)
        .maybeSingle();
      profile = profileByUid;
    }

    const shadowOrgId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("shadow_org_id="))
      ?.split("=")[1];

    const isSuperAdmin = profile?.role === "superadmin";
    const activeOrgId = (isSuperAdmin && shadowOrgId) ? shadowOrgId : profile?.organization_id;

    if (activeOrgId) {
      const { data: org } = await supabase
        .from("organizations")
        .select("plan_id, business_model, plans(*)")
        .eq("id", activeOrgId)
        .maybeSingle();
      
      const orgData = Array.isArray(org) ? org[0] : org;
      const plan = Array.isArray(orgData?.plans) ? orgData.plans[0] : orgData?.plans;
      if (plan) {
        setProductLimit(plan.max_products !== undefined && plan.max_products !== null ? plan.max_products : 20);
      }
      if (orgData?.business_model) {
        setBusinessModel(orgData.business_model);
      }
    }

    return activeOrgId ?? null;
  }

  async function fetchUserSlug(userId: string) {
    const supabase = createClient();
    
    // Tenta buscar o perfil (tentando id e user_id para garantir compatibilidade)
    let { data: profile } = await supabase
      .from("profiles")
      .select("slug, organization_id, role")
      .eq("id", userId)
      .maybeSingle();
      
    if (!profile) {
      const { data: profileByUid } = await supabase
        .from("profiles")
        .select("slug, organization_id, role")
        .eq("user_id", userId)
        .maybeSingle();
      profile = profileByUid;
    }

    const shadowOrgId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("shadow_org_id="))
      ?.split("=")[1];

    const isSuperAdmin = profile?.role === "superadmin";
    const activeOrgId = (isSuperAdmin && shadowOrgId) ? shadowOrgId : profile?.organization_id;
    
    if (isSuperAdmin && shadowOrgId) {
      // Busca o slug da organização simulada
      const { data: org } = await supabase
        .from("organizations")
        .select("slug")
        .eq("id", shadowOrgId)
        .maybeSingle();
      
      if (org?.slug) {
        setUserSlug(org.slug);
      }
    } else if (profile?.slug) {
      setUserSlug(profile.slug);
    } else if (activeOrgId) {
      // Fallback: busca o slug da organização se o perfil não tiver slug
      const { data: org } = await supabase
        .from("organizations")
        .select("slug")
        .eq("id", activeOrgId)
        .maybeSingle();
      
      if (org?.slug) {
        setUserSlug(org.slug);
      }
    }
  }

  async function fetchCatalog(orgId: string): Promise<string | null> {
    try {
      const res = await getOrCreateCatalog(orgId);
      if (res?.error || !res?.catalog) {
        console.error("Erro ao carregar ou criar catálogo via Server Action:", res?.error);
        return null;
      }

      const catalogData = res.catalog;
      setCatalog(catalogData as Catalog);
      setCatalogDescription(catalogData.description || "");
      setCatalogType((catalogData as any).type || (catalogData as any).catalog_type || "product");
      setWhatsappTemplate(catalogData.whatsapp_template || "");
      
      return catalogData.id;
    } catch (err) {
      console.error("Erro catastrófico no fetchCatalog:", err);
      return null;
    }
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

    const { data: ownData, error: ownError } = await supabase
      .from("products")
      .select(
        `
      id,
      organization_id,
      category_id,
      name,
      description,
      specs,
      price,
      compare_at_price,
      sku,
      has_retail,
      has_wholesale,
      wholesale_price,
      wholesale_min_quantity,
      image_url,
      image_urls,
      is_active,
      is_in_stock,
      price_display_mode,
      highlight_text,
      show_highlight,
      type,
      sort_order,
      created_at,
      categories (
        id,
        name
      )
    `
      )
      .eq("organization_id", orgId)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    let prodList = (ownData ?? []) as unknown as ProductRow[];

    // 2. Fetch CaaS Products (if any)
    const { data: enabledCatalogs } = await supabase
      .from("organization_catalogs")
      .select("catalog_id, is_enabled, allow_caas_detachment, catalogs(name, organization_id, catalog_type, deleted_at, organizations(name))")
      .eq("organization_id", orgId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasPlatformCatalog = enabledCatalogs?.some((c: any) => {
      const cat = Array.isArray(c.catalogs) ? c.catalogs[0] : c.catalogs;
      return c.is_enabled && (cat?.catalog_type === 'platform' || cat?.catalog_type === 'CaaS') && !cat?.deleted_at;
    });
    setHasMasterCatalog(!!hasPlatformCatalog);

    const hasAnyPlatformCatalog = enabledCatalogs?.some((c: any) => {
      const cat = Array.isArray(c.catalogs) ? c.catalogs[0] : c.catalogs;
      return cat?.catalog_type === 'platform' || cat?.catalog_type === 'CaaS';
    });
    setShowUnlinkedWarning(!hasPlatformCatalog && !!hasAnyPlatformCatalog);

    const activeCaaS = enabledCatalogs?.find((c: any) => {
      const cat = Array.isArray(c.catalogs) ? c.catalogs[0] : c.catalogs;
      return c.is_enabled && (cat?.catalog_type === 'platform' || cat?.catalog_type === 'CaaS');
    });
    setAllowCaasDetachment(!!activeCaaS?.allow_caas_detachment);

    if (enabledCatalogs && enabledCatalogs.length > 0) {
      const caasCatalogIds = enabledCatalogs
        .filter((c: any) => {
          const cat = Array.isArray(c.catalogs) ? c.catalogs[0] : c.catalogs;
          return c.is_enabled && cat && !cat.deleted_at;
        })
        .map(c => c.catalog_id);
      
      const { data: caasCategories } = await supabase
        .from("categories")
        .select("id")
        .in("catalog_id", caasCatalogIds);

      if (caasCategories && caasCategories.length > 0) {
        const caasCategoryIds = caasCategories.map(c => c.id);
        
        let query = supabase
          .from("products")
          .select(
            `
          id,
          organization_id,
          category_id,
          name,
          description,
          specs,
          price,
          compare_at_price,
          sku,
          has_retail,
          has_wholesale,
          wholesale_price,
          wholesale_min_quantity,
          image_url,
          image_urls,
          is_active,
          is_in_stock,
          price_display_mode,
          highlight_text,
          show_highlight,
          type,
          sort_order,
          created_at,
          categories (
            id,
            name,
            catalog_id,
            catalogs (
              id,
              name,
              catalog_type
            )
          )
        `
          )
          .in("category_id", caasCategoryIds)
          .eq("is_active", true) // Only active master products
          .is("deleted_at", null);

        if (orgId) {
          query = query.or(`organization_id.is.null,organization_id.neq.${orgId}`); // Exclude cloned products from CaaS stream
        }

        const { data: caasProductsData } = await query;

        if (caasProductsData && caasProductsData.length > 0) {
          // Fetch overrides
          const { data: overridesData } = await supabase
            .from("organization_product_overrides")
            .select("*")
            .eq("organization_id", orgId)
            .in("product_id", caasProductsData.map(p => p.id));
            
          const overrides = overridesData || [];

          const caasProductsList = caasProductsData.map((p: any) => {
            const override = overrides.find(o => o.product_id === p.id);
            
            const category = Array.isArray(p.categories) ? p.categories[0] : p.categories;
            const catalog = Array.isArray(category?.catalogs) ? category.catalogs[0] : category?.catalogs;
            
            // A product is CaaS ONLY if the catalog it belongs to is of type 'platform' or 'CaaS'
            // AND the catalog does not belong to the current organization.
            const isCaaSProduct = catalog 
              ? (catalog.catalog_type === 'platform' || catalog.catalog_type === 'CaaS') && catalog.organization_id !== orgId
              : true;

            const catalogLink = (enabledCatalogs as any[]).find(ec => {
              const cat = Array.isArray(ec.catalogs) ? ec.catalogs[0] : ec.catalogs;
              return cat?.id === catalog?.id;
            });
            const masterOrgName = (() => {
              const cat = Array.isArray(catalogLink?.catalogs) ? catalogLink?.catalogs[0] : catalogLink?.catalogs;
              const org = Array.isArray(cat?.organizations) ? cat?.organizations[0] : cat?.organizations;
              return org?.name || "Catálogo Mestre";
            })();
            
            return {
              ...p,
              is_caas: isCaaSProduct,
              override_id: override?.id,
              caas_owner_name: masterOrgName,
              original_category_id: p.category_id,
              category_id: override?.category_id || p.category_id,
              // Apply overrides if they exist
              price: (override?.price_b2c !== undefined && override?.price_b2c !== null) ? override.price_b2c : null,
              compare_at_price: (override?.compare_at_price !== undefined && override?.compare_at_price !== null) ? override.compare_at_price : null,
              wholesale_price: (override?.price_b2b !== undefined && override?.price_b2b !== null) ? override.price_b2b : null,
              sku: null,
              has_retail: (override?.has_retail !== undefined && override?.has_retail !== null) ? override.has_retail : p.has_retail,
              has_wholesale: (override?.has_wholesale !== undefined && override?.has_wholesale !== null) ? override.has_wholesale : p.has_wholesale,
              sort_order: (override?.sort_order !== undefined && override?.sort_order !== null) ? override.sort_order : p.sort_order,
              is_in_stock: (override?.is_in_stock !== undefined && override?.is_in_stock !== null) ? override.is_in_stock : p.is_in_stock,
              is_active: override ? (override.is_available ?? false) : false,
              is_new_from_master: !override,
              original_master_price: p.price,
              image_url: override?.image_url || p.image_url,
              image_urls: override?.image_urls || p.image_urls,
            };
          });

          prodList = [...prodList, ...caasProductsList];
        }
      }
    }

    setProducts(prodList);
    setProductUsageCount(prodList.filter(p => !p.is_caas).length); // Don't count CaaS against limit
    setLoadingProducts(false);
  }

  async function handleSaveCatalogDescription() {
    if (!catalogId || !catalog) return;
    setSavingCatalog(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("catalogs")
      .update({ 
        type: catalogType,
        whatsapp_template: whatsappTemplate.trim() || null 
      })
      .eq("id", catalogId);
    
    if (error) {
      console.error("Erro ao salvar catálogo:", error);
      alert("Erro ao salvar alterações.");
    } else {
      setCatalog(prev => prev ? { ...prev, type: catalogType, description: catalogDescription, whatsapp_template: whatsappTemplate } : null);
      alert("Configurações atualizadas com sucesso!");
    }
    setSavingCatalog(false);
  }

  // handleSaveCategory moved to CategoryModal

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

  // handleDelete moved down to consolidate

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
    try {
      await Promise.all(
        reordered.map((p, i) => {
          if (p.is_caas) {
            if (!orgId) return Promise.resolve();
            const overridePayload = {
              organization_id: orgId,
              product_id: p.id,
              price_b2c: p.price,
              price_b2b: p.wholesale_price,
              compare_at_price: p.compare_at_price,
              has_retail: p.has_retail,
              has_wholesale: p.has_wholesale,
              is_available: p.is_active,
              is_in_stock: p.is_in_stock,
              image_url: p.image_url || null,
              image_urls: p.image_urls || [],
              sort_order: i,
              category_id: p.category_id === p.original_category_id ? null : p.category_id
            };
            return supabase
              .from("organization_product_overrides")
              .upsert(overridePayload, { onConflict: 'organization_id, product_id' });
          } else {
            return supabase
              .from("products")
              .update({ sort_order: i })
              .eq("id", p.id);
          }
        })
      );
    } catch (err) {
      console.error("Erro ao reordenar produtos via drop:", err);
    }
    setSavingOrder(false);
  }

  function handleOpenCreateProduct() {
    if (categories.length === 0) {
      setShowNoCategoryModal(true);
      return;
    }

    if (!canCreateProduct && productLimit > 0) {
      setProductListError(
        "Você atingiu o limite do seu plano. Faça upgrade para continuar."
      );
      return;
    }

    setEditingProduct(null);
    setShowModal(true);
  }


  function handleOpenEdit(product: ProductRow) {
    setEditingProduct(product);
    setShowModal(true);
  }

  function handleDuplicateProduct(product: ProductRow) {
    if (!canCreateProduct && productLimit > 0) {
      setProductListError("Você atingiu o limite do seu plano. Faça upgrade para continuar.");
      return;
    }
    // Para duplicar, abrimos o modal enviando o produto mas sem o ID.
    // Se for CaaS, removemos as propriedades específicas para tratá-lo como um novo produto próprio.
    const productCopy = { 
      ...product, 
      id: "", 
      name: `${product.name.toUpperCase()} (CÓPIA)`,
      is_caas: false,
      override_id: undefined,
      caas_owner_name: undefined,
      original_category_id: undefined,
      original_master_price: undefined,
      source_caas_id: undefined
    };
    setEditingProduct(productCopy as any);
    setShowModal(true);
  }
  function handleCloseModal() {
    setShowModal(false);
    setEditingProduct(null);
  }

  const performStatusUpdate = async (product: ProductRow, field: 'is_active' | 'is_in_stock', newValue: boolean) => {
    const supabase = createClient();

    if (product.is_caas) {
      if (!orgId) return;
      const overridePayload = {
        organization_id: orgId,
        product_id: product.id,
        price_b2c: product.price,
        price_b2b: product.wholesale_price,
        compare_at_price: product.compare_at_price,
        has_retail: product.has_retail,
        has_wholesale: product.has_wholesale,
        is_available: field === 'is_active' ? newValue : (product.is_active ?? true),
        is_in_stock: field === 'is_in_stock' ? newValue : (product.is_in_stock ?? true),
        image_url: product.image_url || null,
        image_urls: product.image_urls || [],
        category_id: product.category_id === product.original_category_id ? null : product.category_id
      };

      const { error } = await supabase
        .from("organization_product_overrides")
        .upsert(overridePayload, { onConflict: 'organization_id, product_id' });

      if (error) {
        console.error(`Erro ao salvar override de ${field}:`, error.message);
        return;
      }

      if (orgId) fetchProducts(orgId);
      return;
    }

    const { error } = await supabase
      .from("products")
      .update({ [field]: newValue })
      .eq("id", product.id);

    if (error) {
      console.error(`Erro ao atualizar ${field}:`, error.message);
      return;
    }

    refreshProductList();
  };

  const toggleProductStatus = async (product: ProductRow, field: 'is_active' | 'is_in_stock') => {
    const newValue = product[field] === false ? true : false;

    if (field === 'is_active' && newValue === false) {
      const skipAlert = localStorage.getItem('skip_visibility_alert') === 'true';
      if (!skipAlert) {
        setPendingStatusUpdate({ product, field });
        setShowVisibilityAlert(true);
        return;
      }
    }

    await performStatusUpdate(product, field, newValue);
  };

  const handleReorderCategoryProducts = async (newCategoryOrder: ProductRow[], categoryId: string | null) => {
    const isThisCategory = (product: ProductRow) => {
      const catId = getProductCategoryId(product);
      if (categoryId === null) {
        return !catId || !categories.some(c => c.id === catId);
      }
      return catId === categoryId;
    };

    // 1. Update local state
    const newGlobalProducts = [...products];
    const indices: number[] = [];
    products.forEach((p, idx) => {
      if (isThisCategory(p)) {
        indices.push(idx);
      }
    });

    newCategoryOrder.forEach((p, idx) => {
      const targetIdx = indices[idx];
      if (targetIdx !== undefined) {
        newGlobalProducts[targetIdx] = p;
      }
    });

    setProducts(newGlobalProducts);

    // 2. Save in database
    setSavingOrder(true);
    const supabase = createClient();
    try {
      await Promise.all(
        newCategoryOrder.map((p, index) => {
          if (p.is_caas) {
            if (!orgId) return Promise.resolve();
            const overridePayload = {
              organization_id: orgId,
              product_id: p.id,
              price_b2c: p.price,
              price_b2b: p.wholesale_price,
              compare_at_price: p.compare_at_price,
              has_retail: p.has_retail,
              has_wholesale: p.has_wholesale,
              is_available: p.is_active,
              is_in_stock: p.is_in_stock,
              image_url: p.image_url || null,
              image_urls: p.image_urls || [],
              sort_order: index,
              category_id: p.category_id === p.original_category_id ? null : p.category_id
            };
            return supabase
              .from("organization_product_overrides")
              .upsert(overridePayload, { onConflict: 'organization_id, product_id' });
          } else {
            return supabase
              .from("products")
              .update({ sort_order: index })
              .eq("id", p.id);
          }
        })
      );
    } catch (err) {
      console.error("Erro ao salvar ordem dos produtos da categoria:", err);
    }
    setSavingOrder(false);
  };

  const confirmVisibilityUpdate = async () => {
    if (dontShowAgain) {
      localStorage.setItem('skip_visibility_alert', 'true');
    }
    if (pendingStatusUpdate) {
      await performStatusUpdate(pendingStatusUpdate.product, pendingStatusUpdate.field, false);
    }
    setShowVisibilityAlert(false);
    setPendingStatusUpdate(null);
  };

  async function handleDelete(product: ProductRow) {
    const isCaaSProduct = product.is_caas === true;
    
    if (isCaaSProduct) {
      if (!confirm("Este é um produto herdado (CaaS). Ele não pode ser excluído permanentemente, mas será desativado e ocultado da sua vitrine. Deseja desativá-lo?")) return;
      
      const supabase = createClient();
      const overridePayload = {
        organization_id: orgId,
        product_id: product.id,
        price_b2c: product.price,
        price_b2b: product.wholesale_price,
        compare_at_price: product.compare_at_price,
        has_retail: product.has_retail,
        has_wholesale: product.has_wholesale,
        is_available: false, // Desativa
        is_in_stock: product.is_in_stock,
        image_url: product.image_url || null,
        image_urls: product.image_urls || [],
        category_id: product.category_id === product.original_category_id ? null : product.category_id
      };
      
      const { error } = await supabase
        .from("organization_product_overrides")
        .upsert(overridePayload, { onConflict: 'organization_id, product_id' });
        
      if (error) {
        alert("Erro ao desativar produto herdado: " + error.message);
      } else {
        if (orgId) fetchProducts(orgId);
      }
      return;
    }

    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) {
      alert("Erro ao excluir produto: " + error.message);
      console.error("Erro ao excluir produto:", error);
      return;
    }
    if (orgId) fetchProducts(orgId);
    refreshLimit();
  }


  // handleSubmitProduct moved to ProductModal

  function formatPrice(value: number | null) {
    if (value === null) return "Sem preço";
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  const isEditMode = editingProduct !== null;

  const categorizedProducts = useMemo(() => {
    const categorized = categories.map(cat => {
      const catProducts = products.filter(p => 
        getProductCategoryId(p) === cat.id &&
        (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase())))
      );
      return {
        ...cat,
        products: catProducts
      };
    }).filter(cat => cat.products.length > 0);

    const uncategorizedProducts = products.filter(p => {
      const catId = getProductCategoryId(p);
      const hasValidCategory = catId && categories.some(c => c.id === catId);
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      return !hasValidCategory && matchesSearch;
    });

    return {
      categorized,
      uncategorized: uncategorizedProducts
    };
  }, [categories, products, searchQuery]);

  return (
    <div className="flex flex-col gap-10 pb-20">
      {showUnlinkedWarning && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-[32px] border border-amber-500/20 bg-amber-500/5 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-base text-amber-800 dark:text-amber-400">
                Catálogo Master Desvinculado
              </h3>
              <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1 leading-relaxed max-w-2xl">
                O catálogo master (CaaS) foi desvinculado ou removido desta franquia. No momento, você não está herdando nenhum produto da franqueadora. Entre em contato com o super administrador para vincular um catálogo.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header com Título e Limite */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight" style={{ color: "var(--dash-text-primary)" }}>
            {adminCatalogId ? `Master: ${catalog?.name || 'Carregando...'}` : 'Catálogo'}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--dash-text-secondary)" }}>
            {adminCatalogId 
              ? 'Gerenciamento centralizado de categorias e produtos deste Catálogo Master para distribuição CaaS.'
              : `Gerencie seus ${catalogType === 'service' ? 'serviços' : catalogType === 'hybrid' ? 'produtos e serviços' : 'produtos'}, categorias e a vitrine digital da sua marca.`}
          </p>

          <div className="mt-4 flex items-center gap-2">
            {[
              { id: 'product', label: '📦 Catálogo de Produtos' },
              { id: 'service', label: '🛠️ Catálogo de Serviços' },
              { id: 'hybrid', label: '🌓 Catálogo Híbrido' }
            ].map((type) => (
              <button
                key={type.id}
                onClick={async () => {
                  if (!catalogId) return;
                  setCatalogType(type.id as any);
                  const supabase = createClient();
                  await supabase.from("catalogs").update({ type: type.id }).eq("id", catalogId);
                }}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  catalogType === type.id 
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                    : "bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {!adminCatalogId ? (
          <div className="flex flex-col gap-3 rounded-[32px] border p-6 min-w-[300px] shadow-sm" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[var(--dash-text-muted)]">
              <span>Limite de Produtos</span>
              <span className={productLimit > 0 && productUsageCount >= productLimit ? "text-red-500" : "text-emerald-500"}>
                {productUsageCount} / {productLimit > 0 ? productLimit : "∞"}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${productLimit > 0 ? Math.min((productUsageCount / productLimit) * 100, 100) : 0}%` }}
                className={`h-full rounded-full transition-all duration-1000 ${
                  productLimit > 0 && productUsageCount >= productLimit ? "bg-red-500" : "bg-emerald-500"
                }`}
              />
            </div>
            <p className="text-[10px] font-bold text-center" style={{ color: "var(--dash-text-muted)" }}>
              {productLimit > 0 ? Math.round((productUsageCount / productLimit) * 100) : 0}% da sua capacidade utilizada
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-[32px] border p-6 min-w-[300px] shadow-sm bg-purple-500/5 border-purple-500/10" style={{ borderColor: "rgba(168, 85, 247, 0.3)" }}>
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-purple-500">
              <span>Status do Estoque Master</span>
              <span className="text-purple-500">Ativo</span>
            </div>
            <p className="text-xl font-black text-purple-500" style={{ color: "rgb(168, 85, 247)" }}>{productUsageCount} Itens Cadastrados</p>
            <p className="text-[10px] font-bold" style={{ color: "var(--dash-text-muted)" }}>
              Catálogo Master CaaS (Disponível para franquias)
            </p>
          </div>
        )}
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
                  setShowCategoryModal(true);
                }}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/10"
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
                        <Layers size={14} />
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button
                            onClick={() => {
                              setEditingCategory(cat);
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
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5 caret-primary"
                    style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                  />
                </div>
                <button
                  onClick={handleOpenCreateProduct}
                  className="hidden md:flex items-center gap-2 rounded-xl px-6 py-3 bg-primary text-white text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                >
                  <Plus size={20} /> Novo {catalogType === 'service' ? 'Serviço' : 'Produto'}
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
                  <div key={i} className="h-32 animate-pulse rounded-[32px]" style={{ background: "var(--dash-surface-secondary)" }} />
                ))
              ) : (categorizedProducts.categorized.length === 0 && categorizedProducts.uncategorized.length === 0) ? (
                <div className="p-20 text-center rounded-[40px] border border-dashed" style={{ borderColor: "var(--dash-border)" }}>
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
                          <Reorder.Item
                            key={product.id}
                            value={product}
                            onClick={() => handleOpenEdit(product)}
                            className="group relative flex items-center gap-4 p-4 rounded-[24px] border transition-all hover:shadow-xl hover:border-emerald-500/30 cursor-pointer"
                            style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
                          >
                            {/* Handle de Arraste (Sempre visível para facilitar descoberta) */}
                            <div className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 text-zinc-400 hover:text-emerald-500 transition-colors">
                              <GripVertical size={20} />
                            </div>

                            {/* Imagem compacta */}
                            <div className="relative flex-shrink-0">
                              {product.is_in_stock === false && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 rounded-2xl">
                                  <span className="bg-rose-600 !text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter shadow-lg">Esgotado</span>
                                </div>
                              )}
                              {getProductImage(product) ? (
                                <img 
                                  src={getProductImage(product)} 
                                  className={`h-16 w-16 rounded-2xl object-cover border border-zinc-100 shadow-sm bg-zinc-50 transition-opacity ${(product.is_in_stock === false || product.is_active === false) ? 'opacity-50' : 'opacity-100'}`} 
                                />
                              ) : (
                                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-zinc-400 ${(product.is_in_stock === false || product.is_active === false) ? 'opacity-50' : 'opacity-100'}`} style={{ background: "var(--dash-surface-secondary)" }}>
                                  <Package size={24} />
                                </div>
                              )}
                            </div>

                            {/* Conteúdo Principal */}
                            <div className="flex-1 min-w-0 flex flex-col gap-2">
                              {/* Linha Superior: Info */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-x-4">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-bold text-base truncate" style={{ color: "var(--dash-text-primary)" }}>
                                    {product.name}
                                  </h4>
                                  {(product as any).is_new_from_master && (
                                    <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-[9px] font-black uppercase tracking-widest border border-yellow-500/20">
                                      NOVO NO MASTER
                                    </span>
                                  )}
                                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                                    {Array.isArray(product.categories)
                                        ? (product.categories[0]?.name ?? "Sem categoria")
                                        : (product.categories?.name ?? "Sem categoria")}
                                  </span>
                                  {product.sku && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-zinc-800 text-[9px] font-bold text-white uppercase tracking-wider">
                                      {product.sku}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  {product.is_in_stock !== false && product.has_retail !== false && product.price !== null && (
                                    <div className="flex flex-col items-end">
                                      {(product.has_wholesale || product.compare_at_price) && (
                                        <span className="text-[8px] font-black uppercase text-zinc-400 leading-none mb-0.5">Varejo</span>
                                      )}
                                      {product.compare_at_price && (
                                        <span className="text-[9px] font-bold text-zinc-400 line-through leading-none mb-1">
                                          {formatPrice(product.compare_at_price)}
                                        </span>
                                      )}
                                      <p className="text-lg font-black" style={{ color: "var(--dash-text-primary)" }}>
                                        {formatPrice(product.price)}
                                      </p>
                                    </div>
                                  )}
                                  {product.is_in_stock !== false && product.has_retail !== false && product.price !== null && product.has_wholesale && product.wholesale_price !== null && (
                                    <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 self-end mb-1" />
                                  )}
                                  {product.is_in_stock !== false && product.has_wholesale && product.wholesale_price !== null && (
                                    <div className="flex flex-col items-end">
                                      <span className="text-[8px] font-black uppercase text-emerald-600 leading-none mb-0.5">Atacado</span>
                                      <p className="text-lg font-black text-emerald-600">
                                        {formatPrice(product.wholesale_price)}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Linha Inferior: Controles */}
                              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-dashed" style={{ borderColor: "var(--dash-border)" }} onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center gap-4">
                                  {/* Switches Compactos */}
                                  <div className="flex items-center gap-4">
                                    <div 
                                      onClick={(e) => { e.stopPropagation(); toggleProductStatus(product, 'is_active'); }}
                                      className="flex items-center gap-2 cursor-pointer group/sw"
                                    >
                                      <span className="text-[9px] font-bold uppercase text-[var(--dash-text-muted)]">
                                        {product.type === 'service' ? 'Disponível' : 'Visível'}
                                      </span>
                                      <div className={`w-8 h-4 rounded-full relative transition-all duration-300 ${product.is_active !== false ? 'bg-emerald-500' : 'bg-zinc-200'}`}>
                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 ${product.is_active !== false ? 'left-4.5' : 'left-0.5'}`} />
                                      </div>
                                    </div>

                                    <div 
                                      onClick={(e) => { e.stopPropagation(); toggleProductStatus(product, 'is_in_stock'); }}
                                      className="flex items-center gap-2 cursor-pointer group/sw"
                                    >
                                      <span className="text-[9px] font-bold uppercase text-[var(--dash-text-muted)]">Estoque</span>
                                      <div className={`w-8 h-4 rounded-full relative transition-all duration-300 ${product.is_in_stock !== false ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 ${product.is_in_stock !== false ? 'left-4.5' : 'left-0.5'}`} />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1">
                                  {userSlug ? (
                                    <Link
                                      href={`/${userSlug}/catalogo#${product.id}`}
                                      target="_blank"
                                      onClick={(e) => e.stopPropagation()}
                                      className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-sm active:scale-95"
                                      title="Ver no Catálogo Público"
                                    >
                                      <Eye size={14} />
                                    </Link>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        alert("Slug ainda não carregado. Tente novamente em um segundo.");
                                      }}
                                      className="p-2 rounded-lg bg-zinc-800 text-zinc-500 cursor-wait"
                                    >
                                      <Eye size={14} />
                                    </button>
                                  )}

                                  {(!product.is_caas || allowCaasDetachment) && (
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); handleDuplicateProduct(product); }}
                                      className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-sm active:scale-95"
                                      title="Duplicar"
                                    >
                                      <Copy size={14} />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleOpenEdit(product); }}
                                    className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-sm active:scale-95"
                                    title="Editar"
                                  >
                                    <EditIcon size={14} />
                                  </button>
                                  {(!product.is_caas || allowCaasDetachment) && (
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); handleDelete(product); }}
                                      className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-red-500 transition-all shadow-sm active:scale-95"
                                      title="Excluir"
                                    >
                                      <TrashIcon size={14} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Reorder.Item>
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
                          <Reorder.Item
                            key={product.id}
                            value={product}
                            onClick={() => handleOpenEdit(product)}
                            className="group relative flex items-center gap-4 p-4 rounded-[24px] border transition-all hover:shadow-xl hover:border-emerald-500/30 cursor-pointer"
                            style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
                          >
                            {/* Handle de Arraste (Sempre visível para facilitar descoberta) */}
                            <div className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 text-zinc-400 hover:text-emerald-500 transition-colors">
                              <GripVertical size={20} />
                            </div>

                            {/* Imagem compacta */}
                            <div className="relative flex-shrink-0">
                              {product.is_in_stock === false && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 rounded-2xl">
                                  <span className="bg-rose-600 !text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter shadow-lg">Esgotado</span>
                                </div>
                              )}
                              {getProductImage(product) ? (
                                <img 
                                  src={getProductImage(product)} 
                                  className={`h-16 w-16 rounded-2xl object-cover border border-zinc-100 shadow-sm bg-zinc-50 transition-opacity ${(product.is_in_stock === false || product.is_active === false) ? 'opacity-50' : 'opacity-100'}`} 
                                />
                              ) : (
                                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-zinc-400 ${(product.is_in_stock === false || product.is_active === false) ? 'opacity-50' : 'opacity-100'}`} style={{ background: "var(--dash-surface-secondary)" }}>
                                  <Package size={24} />
                                </div>
                              )}
                            </div>

                            {/* Conteúdo Principal */}
                            <div className="flex-1 min-w-0 flex flex-col gap-2">
                              {/* Linha Superior: Info */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-x-4">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-bold text-base truncate" style={{ color: "var(--dash-text-primary)" }}>
                                    {product.name}
                                  </h4>
                                  {(product as any).is_new_from_master && (
                                    <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-[9px] font-black uppercase tracking-widest border border-yellow-500/20">
                                      NOVO NO MASTER
                                    </span>
                                  )}
                                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                                    Sem categoria
                                  </span>
                                  {product.sku && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-zinc-800 text-[9px] font-bold text-white uppercase tracking-wider">
                                      {product.sku}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  {product.is_in_stock !== false && product.has_retail !== false && product.price !== null && (
                                    <div className="flex flex-col items-end">
                                      {(product.has_wholesale || product.compare_at_price) && (
                                        <span className="text-[8px] font-black uppercase text-zinc-400 leading-none mb-0.5">Varejo</span>
                                      )}
                                      {product.compare_at_price && (
                                        <span className="text-[9px] font-bold text-zinc-400 line-through leading-none mb-1">
                                          {formatPrice(product.compare_at_price)}
                                        </span>
                                      )}
                                      <p className="text-lg font-black" style={{ color: "var(--dash-text-primary)" }}>
                                        {formatPrice(product.price)}
                                      </p>
                                    </div>
                                  )}
                                  {product.is_in_stock !== false && product.has_retail !== false && product.price !== null && product.has_wholesale && product.wholesale_price !== null && (
                                    <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 self-end mb-1" />
                                  )}
                                  {product.is_in_stock !== false && product.has_wholesale && product.wholesale_price !== null && (
                                    <div className="flex flex-col items-end">
                                      <span className="text-[8px] font-black uppercase text-emerald-600 leading-none mb-0.5">Atacado</span>
                                      <p className="text-lg font-black text-emerald-600">
                                        {formatPrice(product.wholesale_price)}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Linha Inferior: Controles */}
                              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-dashed" style={{ borderColor: "var(--dash-border)" }} onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center gap-4">
                                  {/* Switches Compactos */}
                                  <div className="flex items-center gap-4">
                                    <div 
                                      onClick={(e) => { e.stopPropagation(); toggleProductStatus(product, 'is_active'); }}
                                      className="flex items-center gap-2 cursor-pointer group/sw"
                                    >
                                      <span className="text-[9px] font-bold uppercase text-[var(--dash-text-muted)]">
                                        {product.type === 'service' ? 'Disponível' : 'Visível'}
                                      </span>
                                      <div className={`w-8 h-4 rounded-full relative transition-all duration-300 ${product.is_active !== false ? 'bg-emerald-500' : 'bg-zinc-200'}`}>
                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 ${product.is_active !== false ? 'left-4.5' : 'left-0.5'}`} />
                                      </div>
                                    </div>

                                    <div 
                                      onClick={(e) => { e.stopPropagation(); toggleProductStatus(product, 'is_in_stock'); }}
                                      className="flex items-center gap-2 cursor-pointer group/sw"
                                    >
                                      <span className="text-[9px] font-bold uppercase text-[var(--dash-text-muted)]">Estoque</span>
                                      <div className={`w-8 h-4 rounded-full relative transition-all duration-300 ${product.is_in_stock !== false ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 ${product.is_in_stock !== false ? 'left-4.5' : 'left-0.5'}`} />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1">
                                  {userSlug ? (
                                    <Link
                                      href={`/${userSlug}/catalogo#${product.id}`}
                                      target="_blank"
                                      onClick={(e) => e.stopPropagation()}
                                      className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-sm active:scale-95"
                                      title="Ver no Catálogo Público"
                                    >
                                      <Eye size={14} />
                                    </Link>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        alert("Slug ainda não carregado. Tente novamente em um segundo.");
                                      }}
                                      className="p-2 rounded-lg bg-zinc-800 text-zinc-500 cursor-wait"
                                    >
                                      <Eye size={14} />
                                    </button>
                                  )}

                                  {(!product.is_caas || allowCaasDetachment) && (
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); handleDuplicateProduct(product); }}
                                      className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-sm active:scale-95"
                                      title="Duplicar"
                                    >
                                      <Copy size={14} />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleOpenEdit(product); }}
                                    className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-sm active:scale-95"
                                    title="Editar"
                                  >
                                    <EditIcon size={14} />
                                  </button>
                                  {(!product.is_caas || allowCaasDetachment) && (
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); handleDelete(product); }}
                                      className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-red-500 transition-all shadow-sm active:scale-95"
                                      title="Excluir"
                                    >
                                      <TrashIcon size={14} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Reorder.Item>
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
        categories={categories}
        orgId={orgId || ""}
        canCreateProduct={(canCreateProduct ?? false) || productLimit <= 0}
        catalogType={catalogType}
      />

      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSuccess={() => {
          if (catalogId) fetchCategories(catalogId);
        }}
        editingCategory={editingCategory}
        catalogId={catalogId}
      />
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


      {/* Alerta de Visibilidade */}
      <AnimatePresence>
        {showVisibilityAlert && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => { setShowVisibilityAlert(false); setPendingStatusUpdate(null); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md rounded-[32px] p-8 shadow-2xl border"
              style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
            >
              <div className="h-16 w-16 bg-amber-50 dark:bg-amber-900/10 rounded-2xl flex items-center justify-center text-amber-500 mb-6 mx-auto border border-amber-100 dark:border-amber-900/20">
                <Info size={32} />
              </div>
              
              <h3 className="text-xl font-black text-center mb-4 uppercase tracking-tight" style={{ color: "var(--dash-text-primary)" }}>Aviso de Visibilidade</h3>
              
              <p className="text-center text-sm leading-relaxed mb-8" style={{ color: "var(--dash-text-secondary)" }}>
                Ao tornar o produto <span className="font-bold text-red-500">indisponível</span> ele não aparecerá no catálogo para seus clientes.
              </p>

              <div className="flex flex-col gap-4">
                <label 
                  className="flex items-center gap-3 cursor-pointer p-4 rounded-2xl border group transition-all"
                  style={{ background: "var(--dash-surface-secondary)", borderColor: "var(--dash-border)" }}
                >
                  <input 
                    type="checkbox" 
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="h-5 w-5 rounded-lg border-zinc-300 text-emerald-600 focus:ring-emerald-500 bg-transparent"
                  />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--dash-text-secondary)" }}>Não mostrar novamente</span>
                </label>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowVisibilityAlert(false); setPendingStatusUpdate(null); }}
                    className="flex-1 px-6 py-4 rounded-2xl bg-zinc-100 text-zinc-500 text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmVisibilityUpdate}
                    className="flex-1 px-6 py-4 rounded-2xl bg-zinc-900 text-white text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-black/10"
                  >
                    Confirmar
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
