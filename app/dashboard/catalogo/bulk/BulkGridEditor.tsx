"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { createClient } from "@/lib/supabase/client";
import { 
  Save, 
  Plus, 
  Trash2, 
  Users, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  CheckCircle,
  Image as ImageIcon,
  ChevronDown,
  GripVertical,
  Settings2,
  X,
  PlusCircle,
  ExternalLink,
  Download,
  FileUp,
  FileSpreadsheet,
  Search,
  RefreshCw,
  Database,
  Tags,
  Megaphone
} from "lucide-react";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import BulkImportModal from "@/components/dashboard/BulkImportModal";
import BulkPromoModal from "@/components/dashboard/BulkPromoModal";

// DnD Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

type Category = {
  id: string;
  name: string;
  specs_title?: string | null;
  show_specs?: boolean | null;
  show_colors?: boolean | null;
  colors?: string[] | null;
};


// --- Editable Cell Component ---
const EditableCell = ({
  getValue,
  row,
  column: { id },
  table,
  updateData,
  type = "text",
  options = [],
}: any) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);

  const onBlur = () => {
    updateData(row.index, id, value);
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const isReadOnly = row.original.is_caas && (id === "name" || id === "sku");

  if (isReadOnly) {
    return (
      <span className="text-sm p-1 opacity-60 select-none block truncate" title="Este campo pertence ao catálogo mestre e não pode ser editado.">
        {value ?? "—"}
      </span>
    );
  }

  if (type === "select") {
    return (
      <div className="relative group">
        <select
          value={value ?? ""}
          onChange={(e) => {
            setValue(e.target.value);
            updateData(row.index, id, e.target.value);
          }}
          className="dash-select w-full bg-transparent border-none focus:ring-0 text-sm pl-1 py-1 cursor-pointer truncate"
          style={{ color: "var(--dash-text-primary)" }}
        >
          <option value="">Selecione...</option>
          {options.map((opt: any) => (
            <option key={opt.id} value={opt.id} className="bg-[var(--dash-surface)]">
              {opt.name}
            </option>
          ))}
        </select>
        <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity">
          <ChevronDown size={14} />
        </div>
      </div>
    );
  }

  if (type === "checkbox") {
    return (
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) => {
          setValue(e.target.checked);
          updateData(row.index, id, e.target.checked);
        }}
        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
      />
    );
  }

  return (
    <input
      value={value ?? ""}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      type={type}
      className="w-full bg-transparent border-none focus:ring-0 text-sm p-1"
      style={{ color: "var(--dash-text-primary)" }}
      placeholder="..."
    />
  );
};

// --- Draggable Row Component ---
const DraggableRow = ({ row, children }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.original.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    position: "relative" as const,
  };

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-[var(--dash-border)] hover:bg-[var(--dash-hover-bg)] transition-colors group">
      {children(attributes, listeners)}
    </tr>
  );
};

import ProductDetailDrawer, { ProductRow } from "@/components/dashboard/ProductDetailDrawer";

export default function BulkGridEditor() {
  const [data, setData] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [storedSheetUrl, setStoredSheetUrl] = useState<string | null>(null);
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

  // Fetch initial data
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
        
        // 1. Fetch own products
        const { data: ownData, error: prodsError } = await supabase
          .from("products")
          .select(`
            id, name, description, price, compare_at_price, sku, has_retail, has_wholesale, wholesale_price, wholesale_min_quantity, 
            category_id, updated_at, image_url, image_urls, specs, organization_id, is_in_stock,
            highlight_text, show_highlight,
            categories (id, name)
          `)
          .eq("organization_id", activeOrgId)
          .is("deleted_at", null)
          .order("sort_order", { ascending: true });

        if (prodsError) throw prodsError;

        let prodList = (ownData ?? []) as any[];

        // 2. Fetch Catalog & Categories
        const { data: orgCatalogs, error: orgCatalogError } = await supabase
          .from("organization_catalogs")
          .select("catalog_id")
          .eq("organization_id", activeOrgId)
          .eq("is_enabled", true);

        if (orgCatalogError) throw orgCatalogError;

        if (orgCatalogs && orgCatalogs.length > 0) {
          const catalogIds = orgCatalogs.map((c) => c.catalog_id);

          // Fetch catalog details to identify types
          const { data: catalogsData } = await supabase
            .from("catalogs")
            .select("id, name, catalog_type")
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
          
          console.log(`[BulkEditor] Categorias carregadas: ${cats?.length || 0}`, cats);
          const activeCats = cats || [];
          setCategories(activeCats);

          // Check if any catalog is CaaS/platform
          const caasCatalogIds = catalogsData
            ?.filter((c) => c.catalog_type === "CaaS" || c.catalog_type === "platform")
            .map((c) => c.id) || [];

          const caasCats = activeCats.filter((c) => caasCatalogIds.includes(c.catalog_id));

          if (caasCatalogIds.length > 0) {
            const { data: prods1 } = await supabase
              .from("products")
              .select(`
                id, organization_id, category_id, name, description, specs, price, compare_at_price, sku, 
                has_retail, has_wholesale, wholesale_price, wholesale_min_quantity, image_url, image_urls, 
                is_active, is_in_stock, highlight_text, show_highlight, sort_order, created_at,
                categories (id, name)
              `)
              .in("catalog_id", caasCatalogIds)
              .eq("is_active", true)
              .is("deleted_at", null);
              
            const { data: prods2 } = caasCats.length > 0 ? await supabase
              .from("products")
              .select(`
                id, organization_id, category_id, name, description, specs, price, compare_at_price, sku, 
                has_retail, has_wholesale, wholesale_price, wholesale_min_quantity, image_url, image_urls, 
                is_active, is_in_stock, highlight_text, show_highlight, sort_order, created_at,
                categories (id, name)
              `)
              .in("category_id", caasCats.map((c) => c.id))
              .eq("is_active", true)
              .is("deleted_at", null) : { data: [] };
              
            const allCaasMap = new Map();
            prods1?.forEach(p => allCaasMap.set(p.id, p));
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
                return {
                  ...p,
                  is_caas: true,
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
        } else {
          console.warn("[BulkEditor] Nenhum catálogo ativo encontrado para esta organização.");
        }

        setData(prodList.map(p => ({
          ...p,
          has_wholesale: !!p.has_wholesale
        })));
      } catch (err) {
        console.error("Erro ao carregar dados do Bulk Editor:", err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [supabase]);

  const refreshData = async () => {
    if (!orgId) {
      console.warn("[BulkEditor] Tentativa de refresh sem OrgId");
      return;
    }
    setLoading(true);
    try {
      console.log(`[BulkEditor] Forçando atualização para Org: ${orgId}`);
      
      // 1. Fetch own products
      const { data: ownData, error: ownError } = await supabase
        .from("products")
        .select(`
          id, name, description, price, compare_at_price, sku, has_retail, has_wholesale, wholesale_price, wholesale_min_quantity, 
          category_id, updated_at, image_url, image_urls, specs, organization_id, is_in_stock,
          highlight_text, show_highlight,
          categories (id, name)
        `)
        .eq("organization_id", orgId)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

      if (ownError) throw ownError;

      let prodList = (ownData ?? []) as any[];

      // 2. Fetch Catalog & Categories
      const { data: orgCatalogs, error: orgCatalogError } = await supabase
        .from("organization_catalogs")
        .select("catalog_id")
        .eq("organization_id", orgId)
        .eq("is_enabled", true);

      if (orgCatalogError) throw orgCatalogError;

      if (orgCatalogs && orgCatalogs.length > 0) {
        const catalogIds = orgCatalogs.map((c) => c.catalog_id);

        // Fetch catalog details to identify types
        const { data: catalogsData } = await supabase
          .from("catalogs")
          .select("id, name, catalog_type")
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

        // Check if any catalog is CaaS/platform
        const caasCatalogIds = catalogsData
          ?.filter((c) => c.catalog_type === "CaaS" || c.catalog_type === "platform")
          .map((c) => c.id) || [];

        const caasCats = activeCats.filter((c) => caasCatalogIds.includes(c.catalog_id));

        if (caasCats.length > 0) {
          const { data: caasProductsData } = await supabase
            .from("products")
            .select(`
              id, organization_id, category_id, name, description, specs, price, compare_at_price, sku, 
              has_retail, has_wholesale, wholesale_price, wholesale_min_quantity, image_url, image_urls, 
              is_active, is_in_stock, highlight_text, show_highlight, sort_order, created_at,
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
              return {
                ...p,
                is_caas: true,
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
      
      setData(prodList.map(p => ({
        ...p,
        has_wholesale: !!p.has_wholesale
      })));
    } catch (err) {
      console.error("[BulkEditor] Erro ao atualizar dados:", err);
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

      // Se houver link, abrimos o modal já com a URL carregada para o processamento final
      setShowImportModal(true);
    } catch (err: any) {
      alert("Erro na sincronização direta: " + err.message);
      setShowImportModal(true);
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // --- Real-time Presence Logic ---
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
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users: { user: string; color: string }[] = [];
        
        Object.keys(state).forEach((key) => {
          const userPresence = state[key][0] as any;
          if (userPresence) {
            users.push({
              user: userPresence.user,
              color: userPresence.color,
            });
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
          return {
            ...old[rowIndex],
            [columnId]: value,
          };
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

  const columns = useMemo<ColumnDef<ProductRow>[]>(
    () => [
      {
        id: "drag-handle",
        header: "",
        cell: () => (
          <div className="cursor-grab active:cursor-grabbing p-1 opacity-30 group-hover:opacity-100 transition-opacity">
            <GripVertical size={18} />
          </div>
        ),
        size: 40,
      },
      {
        id: "edit-details",
        header: "",
        cell: ({ row }) => (
          <button 
            onClick={() => setEditingRowIndex(row.index)}
            className="p-2 text-[var(--dash-text-muted)] hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
            title="Editar todos os detalhes"
          >
            <Settings2 size={18} />
          </button>
        ),
        size: 50,
      },
      {
        accessorKey: "name",
        header: "Nome do Produto",
        cell: (props) => <EditableCell {...props} updateData={updateData} />,
        size: 250,
      },
      {
        accessorKey: "category_id",
        header: "Categoria",
        cell: (props) => (
          <EditableCell 
            {...props} 
            updateData={updateData} 
            type="select" 
            options={categories} 
          />
        ),
        size: 180,
      },
      {
        accessorKey: "sku",
        header: "SKU",
        cell: (props) => <EditableCell {...props} updateData={updateData} />,
        size: 120,
      },
      {
        accessorKey: "has_retail",
        header: "Varejo?",
        cell: (props) => <EditableCell {...props} updateData={updateData} type="checkbox" />,
        size: 80,
      },
      {
        accessorKey: "is_active",
        header: "Ativo?",
        cell: (props) => <EditableCell {...props} updateData={updateData} type="checkbox" />,
        size: 80,
      },
      {
        accessorKey: "show_highlight",
        header: "No Banner?",
        cell: (props) => <EditableCell {...props} updateData={updateData} type="checkbox" />,
        size: 90,
      },
      {
        accessorKey: "highlight_text",
        header: "Texto Destaque",
        cell: (props) => <EditableCell {...props} updateData={updateData} />,
        size: 150,
      },
      {
        accessorKey: "compare_at_price",
        header: "Preço De (R$)",
        cell: (props) => {
          const hasRetail = props.row.original.has_retail;
          return (
            <div className={!hasRetail ? "opacity-30 pointer-events-none" : ""}>
              <EditableCell {...props} updateData={updateData} type="number" />
            </div>
          );
        },
        size: 120,
      },
      {
        accessorKey: "price",
        header: "Preço Por (R$)",
        cell: (props) => {
          const hasRetail = props.row.original.has_retail;
          return (
            <div className={!hasRetail ? "opacity-30 pointer-events-none" : ""}>
              <EditableCell {...props} updateData={updateData} type="number" />
            </div>
          );
        },
        size: 120,
      },
      {
        accessorKey: "has_wholesale",
        header: "Atacado?",
        cell: (props) => <EditableCell {...props} updateData={updateData} type="checkbox" />,
        size: 80,
      },
      {
        accessorKey: "wholesale_price",
        header: "Preço Atacado",
        cell: (props) => {
          const hasWholesale = props.row.original.has_wholesale;
          return (
            <div className={!hasWholesale ? "opacity-30 pointer-events-none" : ""}>
              <EditableCell {...props} updateData={updateData} type="number" />
            </div>
          );
        },
        size: 120,
      },
      {
        accessorKey: "wholesale_min_quantity",
        header: "Mín. Atacado",
        cell: (props) => {
          const hasWholesale = props.row.original.has_wholesale;
          return (
            <div className={!hasWholesale ? "opacity-30 pointer-events-none" : ""}>
              <EditableCell {...props} updateData={updateData} type="number" />
            </div>
          );
        },
        size: 120,
      },
      {
        accessorKey: "is_in_stock",
        header: "Em Estoque?",
        cell: (props) => <EditableCell {...props} updateData={updateData} type="checkbox" />,
        size: 100,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <button 
            onClick={() => removeRow(row.original.id)}
            className="text-red-400 hover:text-red-600 transition-colors p-1"
          >
            <Trash2 size={16} />
          </button>
        ),
        size: 50,
      },
    ],
    [categories] // Removido 'data' daqui para evitar re-criação constante das colunas
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleSave = async () => {
    if (!orgId || !catalogId) return;
    
    // 1. Validation
    const invalidProducts = data.filter(p => !p.name || !p.category_id);
    if (invalidProducts.length > 0) {
      alert("Todos os produtos devem ter pelo menos um Nome e uma Categoria.");
      return;
    }

    setSaving(true);
    try {
      const ownProducts = data.filter(p => !p.is_caas);
      const caasProducts = data.filter(p => p.is_caas);

      // Save own products
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

      // Save CaaS overrides
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

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="md:hidden flex flex-col items-center justify-center p-8 bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-3xl text-center space-y-4 shadow-sm my-10">
        <div className="h-16 w-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-2">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-[var(--dash-text-primary)]">Dispositivo não Suportado</h2>
        <p className="text-sm text-[var(--dash-text-secondary)]">
          O gerenciamento em massa requer uma tela maior para exibir a grade de dados adequadamente. Por favor, acesse esta ferramenta pelo computador ou tablet.
        </p>
      </div>

      <div className="hidden md:flex flex-col gap-4">
      {/* --- Toolbar --- */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-[var(--dash-surface)] border border-[var(--dash-border)] p-4 rounded-2xl shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Edição Manual */}
          <button
            onClick={addRow}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold hover:opacity-90 shadow-lg shadow-primary/20 transition-all border-none"
          >
            <Plus size={18} />
            Novo Produto
          </button>

          <button
            onClick={handleSave}
            disabled={saving || data.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 transition-all shadow-lg shadow-green-900/20"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Salvar Alterações
          </button>

          <div className="h-6 w-px bg-[var(--dash-border)] mx-1" />

          {/* Ferramentas de Massa */}
          <button
            onClick={() => {
              const templateHeaders = ["Nome do Produto", "Preço Venda", "Preço Atacado", "Qtd Mínima Atacado", "SKU", "Categoria", "Descrição", "Especificações Técnicas"];
              const exampleData = [["Exemplo: Scooter X1", "2500.00", "2200.00", "5", "SC-001", categories[0]?.name || "Geral", "Descrição curta aqui...", "Cor:Preto | Material:Alumínio"]];
              const wb = XLSX.utils.book_new();
              const ws = XLSX.utils.aoa_to_sheet([templateHeaders, ...exampleData]);
              ws['!freeze'] = { xSplit: 0, ySplit: 1 };
              ws['!protect'] = { password: 'plataformashop' };
              const wsCats = XLSX.utils.json_to_sheet(categories.map(c => ({ "Categorias Disponíveis": c.name })));
              XLSX.utils.book_append_sheet(wb, ws, "Modelo Importação");
              XLSX.utils.book_append_sheet(wb, wsCats, "Categorias");
              XLSX.writeFile(wb, "plataformashop_v1.0.xlsx");
            }}
            className="flex items-center gap-2 px-4 py-2 border border-[var(--dash-border)] text-[var(--dash-text-secondary)] rounded-xl font-medium hover:bg-[var(--dash-hover-bg)] transition-all"
            title="Baixar planilha modelo v1.0"
          >
            <Download size={18} />
            Modelo
          </button>

          <button
            onClick={handleDirectSheetSync}
            disabled={isSyncingSheets}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-900/20 border-none"
            title={storedSheetUrl ? "Sincronizar agora com o Google Sheets salvo" : "Configurar Google Sheets para sincronização"}
          >
            {isSyncingSheets ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            Sincronizar Sheets
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-[var(--dash-border)] text-[var(--dash-text-primary)] rounded-xl font-medium hover:bg-[var(--dash-hover-bg)] transition-all"
            title="Importar arquivos locais"
          >
            <Database size={18} />
            Importar & Sync
          </button>

          <div className="flex bg-[var(--dash-hover-bg)] rounded-xl border border-[var(--dash-border)] p-1 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => {
                if (confirm("Deseja ATIVAR todos os produtos carregados nesta lista?")) {
                  setData(data.map(p => ({ ...p, is_active: true })));
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-emerald-600 hover:bg-emerald-500/10 transition-all font-bold text-xs whitespace-nowrap"
              title="Ativar todos os produtos"
            >
              <CheckCircle size={14} /> Ativar Produtos
            </button>
            <button
              onClick={() => {
                if (confirm("Deseja DESATIVAR todos os produtos carregados nesta lista?")) {
                  setData(data.map(p => ({ ...p, is_active: false })));
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-all font-bold text-xs whitespace-nowrap"
              title="Desativar todos os produtos"
            >
              <X size={14} /> Desativar Produtos
            </button>
            
            <div className="w-px h-6 bg-[var(--dash-border)] mx-1 self-center" />

            <button
              onClick={() => {
                const text = prompt("Digite o texto de destaque para o Banner Promocional (ex: OFERTA, NOVIDADE):", "DESTAQUE");
                if (text !== null) {
                  setData(data.map(p => ({ ...p, show_highlight: true, highlight_text: text })));
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-amber-600 hover:bg-amber-500/10 transition-all font-bold text-xs whitespace-nowrap"
              title="Destacar todos os produtos no Banner Promocional"
            >
              <Megaphone size={14} /> Ativar no Banner
            </button>
            <button
              onClick={() => {
                if (confirm("Deseja REMOVER todos os produtos do Banner Promocional?")) {
                  setData(data.map(p => ({ ...p, show_highlight: false, highlight_text: null })));
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-500/10 transition-all font-bold text-xs whitespace-nowrap"
              title="Remover todos os produtos do Banner Promocional"
            >
              <X size={14} /> Remover do Banner
            </button>
          </div>

          <button
            onClick={() => setShowPromoModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-900/20 border-none"
            title="Ajustar preços e promoções em lote"
          >
            <Tags size={18} />
            Ajustes e Promoções
          </button>
        </div>
          
          {presence.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[var(--dash-text-muted)] uppercase tracking-wider">
                Usuários online simultâneos:
              </span>
              <div className="flex -space-x-2">
                {presence.map((p, i) => (
                  <div 
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-[var(--dash-surface)] flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: p.color }}
                    title={p.user}
                  >
                    {p.user[0]}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>



      {/* --- Grid --- */}
      <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl shadow-sm overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-[var(--dash-border)] bg-[var(--dash-hover-bg)]/50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-xs font-bold text-[var(--dash-text-secondary)] uppercase tracking-wider"
                      style={{ width: header.getSize() }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <SortableContext
              items={data.map((d) => d.id)}
              strategy={verticalListSortingStrategy}
            >
              <tbody className="divide-y divide-[var(--dash-border)]">
                  {table.getRowModel().rows.map((row) => (
                    <DraggableRow key={row.id} row={row}>
                      {(attributes: any, listeners: any) => (
                        <>
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              className="px-4 py-2 align-middle relative"
                              style={{ width: cell.column.getSize() }}
                              {...(cell.column.id === "drag-handle" ? { ...attributes, ...listeners } : {})}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                              {/* Indicador visual de foco/interação */}
                              <div className="absolute inset-y-0 left-0 w-0.5 bg-transparent group-focus-within:bg-primary transition-colors" />
                            </td>
                          ))}
                        </>
                      )}
                    </DraggableRow>
                  ))}
                </tbody>
              </SortableContext>
            </table>
          </div>
        </DndContext>
        
        {data.length === 0 && (
          <div className="p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-[var(--dash-text-muted)] opacity-20 mb-4" />
            <p className="text-[var(--dash-text-secondary)]">Nenhum produto encontrado para edição em massa.</p>
          </div>
        )}
      </div>

      {/* --- Tips/Footer --- */}
      <div className="flex items-center gap-4 text-xs text-[var(--dash-text-muted)]">
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded border border-[var(--dash-border)] bg-[var(--dash-hover-bg)] font-sans">Tab</kbd>
          <span>Navegar</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded border border-[var(--dash-border)] bg-[var(--dash-hover-bg)] font-sans">Enter</kbd>
          <span>Confirmar</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span>Alterações locais não salvas</span>
        </div>
      </div>
      {/* --- No Category Modal --- */}
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
                  Para realizar o cadastro em massa, você precisa ter pelo menos uma categoria cadastrada.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      window.location.href = "/dashboard/catalogo";
                    }}
                    className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                  >
                    Ir para Gestão de Categorias
                  </button>
                  <button
                    onClick={() => setShowNoCategoryModal(false)}
                    className="w-full py-2 text-sm font-medium hover:underline"
                    style={{ color: "var(--dash-text-muted)" }}
                  >
                    Voltar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Detail Drawer */}
      <AnimatePresence>
        {editingProduct && editingRowIndex !== null && (
          <ProductDetailDrawer 
            product={editingProduct}
            rowIndex={editingRowIndex}
            categories={categories}
            updateData={updateData}
            onClose={() => setEditingRowIndex(null)}
          />
        )}
      </AnimatePresence>

      {orgId && catalogId && (
        <BulkImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            refreshData();
            setShowImportModal(false);
          }}
          orgId={orgId}
          catalogId={catalogId}
          categories={categories}
        />
      )}

      {orgId && catalogId && (
        <BulkPromoModal
          isOpen={showPromoModal}
          onClose={() => setShowPromoModal(false)}
          onSuccess={() => {
            refreshData();
            setShowPromoModal(false);
          }}
          catalogId={catalogId}
          orgId={orgId}
          categories={categories}
          products={data}
        />
      )}
    </div>
    </>
  );
}
