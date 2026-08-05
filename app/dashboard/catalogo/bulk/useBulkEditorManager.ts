import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProductRow } from "@/components/dashboard/ProductDetailDrawer";
import { arrayMove } from "@dnd-kit/sortable";
import { DragEndEvent } from "@dnd-kit/core";

export type Category = {
  id: string;
  name: string;
  specs_title?: string | null;
  show_specs?: boolean | null;
  show_colors?: boolean | null;
  colors?: string[] | null;
};

export function useBulkEditorManager() {
  const [data, setData] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [storedSheetUrl, setStoredSheetUrl] = useState<string | null>(null);
  const [planSlug, setPlanSlug] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [catalogId, setCatalogId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [presence, setPresence] = useState<{ user: string; color: string }[]>([]);
  const [showNoCategoryModal, setShowNoCategoryModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  
  const editingProduct = editingRowIndex !== null ? data[editingRowIndex] : null;
  
  const supabase = createClient();

  useEffect(() => {
    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        const user = session.user;

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("organization_id, full_name, role")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        const shadowOrgId = document.cookie
          .split("; ")
          .find((row) => row.startsWith("shadow_org_id="))
          ?.split("=")[1];

        const isSuperAdmin = profile?.role === "main_admin";
        const activeOrgId = (isSuperAdmin && shadowOrgId) ? shadowOrgId : profile?.organization_id;

        if (!activeOrgId || !profile) return;

        setUserId(user.id);
        setUserName(profile.full_name || "Membro");
        setOrgId(activeOrgId);

        const { data: orgData } = await supabase
          .from("organizations")
          .select("plan_id, google_sheets_url")
          .eq("id", activeOrgId)
          .maybeSingle();

        setPlanSlug(orgData?.plan_id || null);
        
        const { data: ownData, error: prodsError } = await supabase
          .from("products")
          .select(`
            id, name, description, price, compare_at_price, sku, has_retail, has_wholesale, wholesale_price, wholesale_min_quantity, 
            category_id, updated_at, image_url, image_urls, specs, organization_id, is_in_stock, stock_quantity, manual_stock,
            highlight_text, show_highlight,
            categories (id, name)
          `)
          .eq("organization_id", activeOrgId)
          .is("deleted_at", null)
          .order("sort_order", { ascending: true });

        if (prodsError) throw prodsError;

        let prodList = (ownData ?? []) as any[];

        const { data: orgCatalogs, error: orgCatalogError } = await supabase
          .from("organization_catalogs")
          .select("catalog_id")
          .eq("organization_id", activeOrgId)
          .eq("is_enabled", true);

        if (orgCatalogError) throw orgCatalogError;

        if (orgCatalogs && orgCatalogs.length > 0) {
          const catalogIds = orgCatalogs.map((c) => c.catalog_id);

          const { data: catalogsData } = await supabase
            .from("catalogs")
            .select("id, name, catalog_type, allow_price_overrides")
            .in("id", catalogIds);

          const caasCatalog = catalogsData?.find((c) => c.catalog_type === "CaaS" || c.catalog_type === "platform");
          const primaryCatalog = caasCatalog || catalogsData?.[0];

          if (primaryCatalog) {
            setCatalogId(primaryCatalog.id);
          }

          const { data: cats } = await supabase
            .from("categories")
            .select("id, name, catalog_id")
            .in("catalog_id", catalogIds);
          
          const activeCats = cats || [];
          setCategories(activeCats);

          const caasCatalogIds = catalogsData
            ?.filter((c) => c.catalog_type === "CaaS" || c.catalog_type === "platform")
            .map((c) => c.id) || [];

          const caasCats = activeCats.filter((c) => caasCatalogIds.includes(c.catalog_id));

          if (caasCatalogIds.length > 0) {
            const { data: prods2 } = caasCats.length > 0 ? await supabase
              .from("products")
              .select(`
                id, organization_id, category_id, name, description, specs, price, compare_at_price, sku, 
                has_retail, has_wholesale, wholesale_price, wholesale_min_quantity, image_url, image_urls, 
                is_active, is_in_stock, stock_quantity, manual_stock, highlight_text, show_highlight, sort_order, created_at,
                categories (id, name)
              `)
              .in("category_id", caasCats.map((c) => c.id))
              .eq("is_active", true)
              .is("deleted_at", null) : { data: [] };
              
            const allCaasMap = new Map();
            prods2?.forEach(p => allCaasMap.set(p.id, p));
            const caasProductsData = Array.from(allCaasMap.values());

            if (caasProductsData && caasProductsData.length > 0) {
              const { data: overridesData } = await supabase
                .from("organization_product_overrides")
                .select("*")
                .eq("organization_id", activeOrgId)
                .in("product_id", caasProductsData.map((p) => p.id));
              
              const overrides = overridesData || [];

              const caasProductsList = caasProductsData.map((p: any) => {
                const override = overrides.find((o) => o.product_id === p.id);
                const catalog = catalogsData?.find(c => caasCats.find(cat => cat.id === p.category_id)?.catalog_id === c.id);
                return {
                  ...p,
                  is_caas: true,
                  allow_price_overrides: catalog?.allow_price_overrides ?? true,
                  override_id: override?.id,
                  original_category_id: p.category_id,
                  category_id: override?.category_id || p.category_id,
                  price: (override?.price_b2c !== undefined && override?.price_b2c !== null) ? override.price_b2c : null,
                  compare_at_price: (override?.compare_at_price !== undefined && override?.compare_at_price !== null) ? override.compare_at_price : null,
                  wholesale_price: (override?.price_b2b !== undefined && override?.price_b2b !== null) ? override.price_b2b : null,
                  sku: p.sku,
                  has_retail: (override?.has_retail !== undefined && override?.has_retail !== null) ? override.has_retail : p.has_retail,
                  has_wholesale: (override?.has_wholesale !== undefined && override?.has_wholesale !== null) ? override.has_wholesale : p.has_wholesale,
                  sort_order: (override?.sort_order !== undefined && override?.sort_order !== null) ? override.sort_order : p.sort_order,
                  is_in_stock: (override?.is_in_stock !== undefined && override?.is_in_stock !== null) ? override.is_in_stock : p.is_in_stock,
                  stock_quantity: (override?.stock_quantity !== undefined && override?.stock_quantity !== null) ? override.stock_quantity : p.stock_quantity,
                  manual_stock: (override?.manual_stock !== undefined && override?.manual_stock !== null) ? override.manual_stock : p.manual_stock,
                  is_active: override ? (override.is_available ?? false) : false,
                  image_url: override?.image_url || p.image_url,
                  image_urls: override?.image_urls || p.image_urls
                };
              });

              prodList = [...prodList, ...caasProductsList];
            }
          }
        }
        
        setData(prodList.map(p => ({
          ...p,
          has_wholesale: !!p.has_wholesale
        })));
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [supabase]);

  const refreshData = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const { data: ownData, error: ownError } = await supabase
        .from("products")
        .select(`
          id, name, description, price, compare_at_price, sku, has_retail, has_wholesale, wholesale_price, wholesale_min_quantity, 
          category_id, updated_at, image_url, image_urls, specs, organization_id, is_in_stock, stock_quantity, manual_stock,
          highlight_text, show_highlight,
          categories (id, name)
        `)
        .eq("organization_id", orgId)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

      if (ownError) throw ownError;

      let prodList = (ownData ?? []) as any[];

      const { data: orgCatalogs, error: orgCatalogError } = await supabase
        .from("organization_catalogs")
        .select("catalog_id")
        .eq("organization_id", orgId)
        .eq("is_enabled", true);

      if (orgCatalogError) throw orgCatalogError;

      if (orgCatalogs && orgCatalogs.length > 0) {
        const catalogIds = orgCatalogs.map((c) => c.catalog_id);
        
        const { data: catalogsData } = await supabase
          .from("catalogs")
          .select("id, name, catalog_type, allow_price_overrides")
          .in("id", catalogIds);

        const caasCatalog = catalogsData?.find((c) => c.catalog_type === "CaaS" || c.catalog_type === "platform");
        const primaryCatalog = caasCatalog || catalogsData?.[0];

        if (primaryCatalog) setCatalogId(primaryCatalog.id);

        const { data: cats } = await supabase
          .from("categories")
          .select("id, name, catalog_id")
          .in("catalog_id", catalogIds);
        
        const activeCats = cats || [];
        setCategories(activeCats);

        const caasCatalogIds = catalogsData?.filter((c) => c.catalog_type === "CaaS" || c.catalog_type === "platform").map((c) => c.id) || [];
        const caasCats = activeCats.filter((c) => caasCatalogIds.includes(c.catalog_id));

        if (caasCats.length > 0) {
          const { data: caasProductsData } = await supabase
            .from("products")
            .select(`
              id, organization_id, category_id, name, description, specs, price, compare_at_price, sku, 
              has_retail, has_wholesale, wholesale_price, wholesale_min_quantity, image_url, image_urls, 
              is_active, is_in_stock, stock_quantity, manual_stock, highlight_text, show_highlight, sort_order, created_at,
              categories (id, name)
            `)
            .in("category_id", caasCats.map((c) => c.id))
            .eq("is_active", true)
            .is("deleted_at", null);

          if (caasProductsData && caasProductsData.length > 0) {
            const { data: overridesData } = await supabase
              .from("organization_product_overrides")
              .select("*")
              .eq("organization_id", orgId)
              .in("product_id", caasProductsData.map((p) => p.id));
            
            const overrides = overridesData || [];

            const caasProductsList = caasProductsData.map((p: any) => {
              const override = overrides.find((o) => o.product_id === p.id);
              const catalog = catalogsData?.find(c => caasCats.find(cat => cat.id === p.category_id)?.catalog_id === c.id);
              return {
                ...p,
                is_caas: true,
                allow_price_overrides: catalog?.allow_price_overrides ?? true,
                override_id: override?.id,
                original_category_id: p.category_id,
                category_id: override?.category_id || p.category_id,
                price: (override?.price_b2c !== undefined && override?.price_b2c !== null) ? override.price_b2c : null,
                compare_at_price: (override?.compare_at_price !== undefined && override?.compare_at_price !== null) ? override.compare_at_price : null,
                wholesale_price: (override?.price_b2b !== undefined && override?.price_b2b !== null) ? override.price_b2b : null,
                sku: p.sku,
                has_retail: (override?.has_retail !== undefined && override?.has_retail !== null) ? override.has_retail : p.has_retail,
                has_wholesale: (override?.has_wholesale !== undefined && override?.has_wholesale !== null) ? override.has_wholesale : p.has_wholesale,
                sort_order: (override?.sort_order !== undefined && override?.sort_order !== null) ? override.sort_order : p.sort_order,
                is_in_stock: (override?.is_in_stock !== undefined && override?.is_in_stock !== null) ? override.is_in_stock : p.is_in_stock,
                is_active: override ? (override.is_available ?? false) : false,
                image_url: override?.image_url || p.image_url,
                image_urls: override?.image_urls || p.image_urls
              };
            });

            prodList = [...prodList, ...caasProductsList];
          }
        }
      }
      
      setData(prodList.map(p => ({ ...p, has_wholesale: !!p.has_wholesale })));
    } catch (err) {
      console.error("Erro ao atualizar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectSheetSync = async () => {
    if (!storedSheetUrl) {
      setShowImportModal(true);
      return;
    }
    setIsSyncingSheets(true);
    try {
      let fetchUrl = storedSheetUrl;
      if (storedSheetUrl.includes("/edit")) {
        fetchUrl = storedSheetUrl.split("/edit")[0] + "/export?format=csv";
      }
      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error("Link inválido ou sem permissão.");
      setShowImportModal(true);
    } catch (err: any) {
      alert("Erro na sincronização: " + err.message);
      setShowImportModal(true);
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handleSave = async () => {
    if (!orgId || !catalogId) return;
    
    const invalidProducts = data.filter(p => !p.name || !p.category_id);
    if (invalidProducts.length > 0) {
      alert("Todos os produtos devem ter pelo menos um Nome e uma Categoria.");
      return;
    }

    setSaving(true);
    try {
      const ownProducts = data.filter(p => !p.is_caas);
      const caasProducts = data.filter(p => p.is_caas);

      if (ownProducts.length > 0) {
        const productsToUpsert = ownProducts.map((p, index) => {
          const { isNew, updated_at, categories, ...cleanProd } = p as any;
          return {
            ...cleanProd,
            organization_id: orgId,
            sort_order: index,
          };
        });

        const { error: upsertError } = await supabase
          .from("products")
          .upsert(productsToUpsert, { onConflict: 'id' });

        if (upsertError) throw upsertError;
      }

      if (caasProducts.length > 0) {
        const overridesToUpsert = caasProducts.map((p, index) => {
          return {
            organization_id: orgId,
            product_id: p.id,
            price_b2c: p.price,
            price_b2b: p.wholesale_price,
            compare_at_price: p.compare_at_price,
            has_retail: p.has_retail,
            has_wholesale: p.has_wholesale,
            is_available: p.is_active,
            is_in_stock: p.is_in_stock,
            stock_quantity: p.stock_quantity,
            manual_stock: p.manual_stock,
            sort_order: index,
            category_id: p.category_id === p.original_category_id ? null : p.category_id,
            image_url: p.image_url || null,
            image_urls: p.image_urls || []
          };
        });

        const { error: overrideError } = await supabase
          .from("organization_product_overrides")
          .upsert(overridesToUpsert, { onConflict: 'organization_id, product_id' });

        if (overrideError) throw overrideError;
      }

      alert("Alterações salvas com sucesso!");
      await refreshData();
    } catch (err: any) {
      console.error("Erro ao salvar produtos:", err);
      alert("Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!orgId || !catalogId || !userId || !userName) return;

    const getUserColor = (id: string) => {
      const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    };

    const channel = supabase.channel(`bulk_presence_${catalogId}`, {
      config: { presence: { key: userId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users: { user: string; color: string }[] = [];
        Object.keys(state).forEach((key) => {
          const userPresence = state[key][0] as any;
          if (userPresence) {
            users.push({ user: userPresence.user, color: userPresence.color });
          }
        });
        setPresence(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user: userName,
            color: getUserColor(userId),
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [orgId, catalogId, userId, userName, supabase]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setData((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const updateData = (rowIndex: number, columnId: string, value: any) => {
    setData((old) =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return { ...old[rowIndex], [columnId]: value };
        }
        return row;
      })
    );
  };

  const addRow = () => {
    if (categories.length === 0) {
      setShowNoCategoryModal(true);
      return;
    }
    const newRow: ProductRow = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      price: null,
      sku: "",
      has_wholesale: false,
      wholesale_price: null,
      wholesale_min_quantity: null,
      category_id: categories[0]?.id || null,
      image_url: null,
      image_urls: [],
      specs: [],
      updated_at: new Date().toISOString(),
      isNew: true
    };
    setData([newRow, ...data]);
  };

  const removeRow = (id: string) => {
    if (confirm("Deseja remover esta linha da edição? (Não excluirá do banco até salvar)")) {
      setData(data.filter(r => r.id !== id));
    }
  };

  return {
    data,
    setData,
    categories,
    loading,
    saving,
    isSyncingSheets,
    isExporting,
    setIsExporting,
    storedSheetUrl,
    planSlug,
    orgId,
    catalogId,
    presence,
    showNoCategoryModal,
    setShowNoCategoryModal,
    showImportModal,
    setShowImportModal,
    showPromoModal,
    setShowPromoModal,
    editingRowIndex,
    setEditingRowIndex,
    editingProduct,
    refreshData,
    handleDirectSheetSync,
    handleSave,
    addRow,
    removeRow,
    updateData,
    handleDragEnd,
  };
}
