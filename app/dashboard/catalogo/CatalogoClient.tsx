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

export default function CatalogoPage({ adminCatalogId = null }: { adminCatalogId?: string | null }) {
  const [userRole, setUserRole] = useState<string>("seller");
  const [granularPermissions, setGranularPermissions] = useState<any>(null);
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
  const [makingAllVisible, setMakingAllVisible] = useState(false);

  const hiddenInheritedProducts = useMemo(() => {
    return products.filter(p => p.is_caas && p.is_new_from_master);
  }, [products]);

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
      stock_quantity,
      manual_stock,
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
              await Promise.all([refreshLimit(), fetchCategories(cid, oid), fetchProducts(oid), fetchUserSlug(user.id)]);
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
      .select("organization_id, id, role, granular_permissions")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      const { data: profileByUid } = await supabase
        .from("profiles")
        .select("organization_id, id, role, granular_permissions")
        .eq("user_id", user.id)
        .maybeSingle();
      profile = profileByUid;
    }

    if (profile) {
      setUserRole(profile.role);
      setGranularPermissions(profile.granular_permissions);
    }

    const shadowOrgId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("shadow_org_id="))
      ?.split("=")[1];

    const isSuperAdmin = profile?.role === "main_admin";
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

    const isSuperAdmin = profile?.role === "main_admin";
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

  async function fetchCategories(catalogId: string, customOrgId?: string | null) {
    const supabase = createClient();
    const targetOrgId = customOrgId || orgId;
    let catalogIds = [catalogId];

    if (targetOrgId) {
      const { data: enabledCatalogs } = await supabase
        .from("organization_catalogs")
        .select("catalog_id, is_enabled, catalogs(deleted_at)")
        .eq("organization_id", targetOrgId);

      if (enabledCatalogs && enabledCatalogs.length > 0) {
        const caasCatalogIds = (enabledCatalogs as unknown as {
          catalog_id: string;
          is_enabled: boolean;
          catalogs: { deleted_at: string | null } | { deleted_at: string | null }[] | null;
        }[])
          .filter(c => {
            const cat = Array.isArray(c.catalogs) ? c.catalogs[0] : c.catalogs;
            return c.is_enabled && cat && !cat.deleted_at;
          })
          .map(c => c.catalog_id);
        
        caasCatalogIds.forEach((id: string) => {
          if (!catalogIds.includes(id)) {
            catalogIds.push(id);
          }
        });
      }
    }

    const { data, error } = await supabase
      .from("categories")
      .select("id, catalog_id, name, description, sort_order")
      .in("catalog_id", catalogIds)
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
      stock_quantity,
      manual_stock,
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
          deleted_at
        )
      )
    `
      )
      .eq("organization_id", orgId)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    console.log("fetchProducts DB result:", { ownData, ownError });

    let prodList = (ownData ?? []) as unknown as ProductRow[];

    // 2. Fetch CaaS Products (if any)
    const { data: enabledCatalogs } = await supabase
      .from("organization_catalogs")
      .select("catalog_id, is_enabled, allow_caas_detachment, catalogs(name, organization_id, catalog_type, deleted_at, organizations(name))")
      .eq("organization_id", orgId);

    const activeCatalogIds = enabledCatalogs
      ?.filter((c: any) => c.is_enabled)
      .map((c: any) => c.catalog_id) || [];

    // Filter out products belonging to deleted catalogs AND non-active catalogs
    prodList = prodList.filter(p => {
      if (!p.category_id) return true;
      const category = Array.isArray(p.categories) ? p.categories[0] : p.categories;
      if (!category) return false;
      
      // Filtrar produtos que não pertencem ao catálogo ativo (para alternância de catálogos Próprio/Herdado)
      if (category.catalog_id && !activeCatalogIds.includes(category.catalog_id)) {
        return false;
      }

      const catalog = Array.isArray(category.catalogs) ? category.catalogs[0] : category.catalogs;
      if (catalog && catalog.deleted_at) return false;
      
      return true;
    });

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

      if (caasCatalogIds && caasCatalogIds.length > 0) {
        const caasCategoryIds = caasCategories ? caasCategories.map(c => c.id) : [];
        
        // query1 was attempting to filter by catalog_id on products table, which doesn't exist.
        // We only need query2, which filters by category_id.
        let query1 = null as any;

        let query2 = null;
        if (caasCategoryIds.length > 0) {
          query2 = supabase
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
            stock_quantity,
            manual_stock,
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
            .eq("is_active", true)
            .is("deleted_at", null);
        }

        if (orgId) {
          if (query2) {
            query2 = query2.or(`organization_id.is.null,organization_id.neq.${orgId}`);
          }
        }

        const { data: prods2 } = query2 ? await query2 : { data: [] };
        
        const allCaasMap = new Map();
        prods2?.forEach(p => allCaasMap.set(p.id, p));
        const caasProductsData = Array.from(allCaasMap.values());

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
            const allowOverrides = (() => {
              const cat = Array.isArray(catalogLink?.catalogs) ? catalogLink?.catalogs[0] : catalogLink?.catalogs;
              return cat?.allow_price_overrides ?? true;
            })();
            
            return {
              ...p,
              allow_price_overrides: allowOverrides,
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
              stock_quantity: (override?.stock_quantity !== undefined && override?.stock_quantity !== null) ? override.stock_quantity : p.stock_quantity,
              manual_stock: (override?.manual_stock !== undefined && override?.manual_stock !== null) ? override.manual_stock : p.manual_stock,
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
      if (catalogId) await fetchCategories(catalogId, orgId);
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

  async function handleMakeAllVisible() {
    if (!orgId || hiddenInheritedProducts.length === 0) return;
    
    const confirmMessage = `Você está prestes a tornar ${hiddenInheritedProducts.length} produtos herdados visíveis na sua vitrine. Deseja continuar?`;
    if (!confirm(confirmMessage)) return;

    setMakingAllVisible(true);
    const supabase = createClient();
    
    try {
      const overridesPayload = hiddenInheritedProducts.map((p, i) => ({
        organization_id: orgId,
        product_id: p.id,
        price_b2c: p.price,
        price_b2b: p.wholesale_price,
        compare_at_price: p.compare_at_price,
        has_retail: p.has_retail,
        has_wholesale: p.has_wholesale,
        is_available: true,
        is_in_stock: p.is_in_stock,
        image_url: p.image_url || null,
        image_urls: p.image_urls || [],
        sort_order: (p.sort_order || 0) + i,
        category_id: p.category_id === p.original_category_id ? null : p.category_id
      }));

      const { error } = await supabase
        .from("organization_product_overrides")
        .upsert(overridesPayload, { onConflict: 'organization_id, product_id' });
        
      if (error) {
        throw error;
      }
      
      alert("Produtos ativados com sucesso!");
      fetchProducts(orgId);
    } catch (err: unknown) {
      console.error("Erro ao visibilizar produtos:", err);
      alert("Erro ao executar a ação: " + (err as Error).message);
    } finally {
      setMakingAllVisible(false);
    }
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
      if (!confirm("Este é um produto catálogo franqueado. Ele não pode ser excluído permanentemente, mas será desativado e ocultado da sua vitrine. Deseja desativá-lo?")) return;
      
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
          className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
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
        <div className="mt-8 flex flex-col items-center justify-center text-center p-16 border-2 border-dashed rounded-2xl" style={{ borderColor: "var(--dash-border)", background: "var(--dash-surface)" }}>
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
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5 caret-primary"
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
              <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-500 text-sm font-medium">
                {productListError}
              </div>
            )}

            <div className="space-y-4">
              {loadingProducts ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-32 animate-pulse rounded-2xl" style={{ background: "var(--dash-surface-secondary)" }} />
                ))
              ) : (categorizedProducts.categorized.length === 0 && categorizedProducts.uncategorized.length === 0) ? (
                <div className="p-20 text-center rounded-2xl border border-dashed" style={{ borderColor: "var(--dash-border)" }}>
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
