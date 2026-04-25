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
  Database
} from "lucide-react";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import BulkImportModal from "@/components/dashboard/BulkImportModal";

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
};

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  sku: string | null;
  has_wholesale: boolean;
  wholesale_price: number | null;
  wholesale_min_quantity: number | null;
  category_id: string | null;
  image_url: string | null;
  image_urls: string[] | null;
  specs: any;
  updated_at: string;
  isNew?: boolean;
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

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  if (type === "select") {
    return (
      <div className="relative group">
        <select
          value={value ?? ""}
          onChange={(e) => {
            setValue(e.target.value);
            updateData(row.index, id, e.target.value);
          }}
          className="w-full bg-transparent border-none focus:ring-0 text-sm p-1 pr-6 appearance-none cursor-pointer truncate"
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

import ProductDetailDrawer from "@/components/dashboard/ProductDetailDrawer";

export default function BulkGridEditor() {
  const [data, setData] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [catalogId, setCatalogId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [presence, setPresence] = useState<{ user: string; color: string }[]>([]);
  const [showNoCategoryModal, setShowNoCategoryModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
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
          .select("organization_id, full_name")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!profile?.organization_id) return;

        setUserId(user.id);
        setUserName(profile.full_name || "Membro");
        setOrgId(profile.organization_id);
        
        // 1. Fetch products (primary data)
        const { data: prods, error: prodsError } = await supabase
          .from("products")
          .select(`
            id, name, description, price, sku, has_wholesale, wholesale_price, wholesale_min_quantity, 
            category_id, updated_at, image_url, image_urls, specs, organization_id,
            categories (id, name)
          `)
          .eq("organization_id", profile.organization_id)
          .is("deleted_at", null)
          .order("sort_order", { ascending: true });

        if (prodsError) throw prodsError;

        setData(prods || []);

        // 2. Fetch Catalog & Categories
        const { data: orgCatalog } = await supabase
          .from("organization_catalogs")
          .select("catalog_id")
          .eq("organization_id", profile.organization_id)
          .eq("is_enabled", true)
          .maybeSingle();

        if (orgCatalog?.catalog_id) {
          setCatalogId(orgCatalog.catalog_id);
          const { data: cats } = await supabase
            .from("categories")
            .select("id, name")
            .eq("catalog_id", orgCatalog.catalog_id);
          
          console.log(`[BulkEditor] Categorias carregadas: ${cats?.length || 0}`, cats);
          setCategories(cats || []);
        } else {
          console.warn("[BulkEditor] Nenhum catálogo ativo encontrado para esta organização.");
        }
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
      const { data: prods, error: prodsError } = await supabase
        .from("products")
        .select(`
          id, name, description, price, sku, has_wholesale, wholesale_price, wholesale_min_quantity, 
          category_id, updated_at, image_url, image_urls, specs,
          categories (id, name)
        `)
        .eq("organization_id", orgId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (prodsError) {
        console.error("[BulkEditor] Erro crítico no Refresh:", prodsError);
        throw prodsError;
      }
      
      setData((prods || []).map(p => ({
        ...p,
        has_wholesale: !!p.has_wholesale
      })));
    } catch (err) {
      console.error("[BulkEditor] Erro ao atualizar dados:", err);
    } finally {
      setLoading(false);
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
        accessorKey: "price",
        header: "Preço (R$)",
        cell: (props) => <EditableCell {...props} updateData={updateData} type="number" />,
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
      const productsToUpsert = data.map((p, index) => {
        const { isNew, updated_at, categories, ...cleanProd } = p as any;
        return {
          ...cleanProd,
          organization_id: orgId,
          sort_order: index, // A nova ordem é o índice atual na lista
        };
      });

      const { error: upsertError } = await supabase
        .from("products")
        .upsert(productsToUpsert, { onConflict: 'id' });

      if (upsertError) throw upsertError;

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
    <div className="flex flex-col gap-4">
      {/* --- Toolbar --- */}
      <div className="flex items-center justify-between bg-[var(--dash-surface)] border border-[var(--dash-border)] p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-6">
          <button
            onClick={addRow}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={18} />
            Novo Produto
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-[var(--dash-border)] text-[var(--dash-text-primary)] rounded-xl font-medium hover:bg-[var(--dash-hover-bg)] transition-all"
          >
            <FileUp size={18} />
            Importar CSV/Excel
          </button>

          {/* Botão de Download de Modelo Direto */}
          <button
            onClick={() => {
              // Reutiliza a lógica de geração de template FULL
              const templateHeaders = [
                "Nome do Produto", 
                "Preço Venda", 
                "Preço Atacado", 
                "Qtd Mínima Atacado", 
                "SKU", 
                "Categoria", 
                "Descrição", 
                "Especificações Técnicas (Ex: Cor:Preto | Material:Alumínio)"
              ];
              const exampleData = [
                [
                  "Exemplo: Scooter X1", 
                  "2500.00", 
                  "2200.00", 
                  "5", 
                  "SC-001", 
                  categories[0]?.name || "Geral", 
                  "Descrição curta aqui...", 
                  "Cor:Preto | Material:Alumínio | Autonomia:40km"
                ]
              ];
              const wb = XLSX.utils.book_new();
              const ws = XLSX.utils.aoa_to_sheet([templateHeaders, ...exampleData]);
              const wsCats = XLSX.utils.json_to_sheet(categories.map(c => ({ "Categorias Disponíveis": c.name })));
              XLSX.utils.book_append_sheet(wb, ws, "Modelo Importação");
              XLSX.utils.book_append_sheet(wb, wsCats, "Categorias");
              XLSX.writeFile(wb, "modelo_full_plataformacard.xlsx");
            }}
            className="flex items-center gap-2 px-4 py-2 border border-[var(--dash-border)] text-[var(--dash-text-primary)] rounded-xl font-medium hover:bg-[var(--dash-hover-bg)] transition-all"
            title="Baixar planilha modelo configurada"
          >
            <Download size={18} />
            Baixar Modelo
          </button>

          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-[var(--dash-border)] text-[var(--dash-text-primary)] rounded-xl font-medium hover:bg-[var(--dash-hover-bg)] transition-all disabled:opacity-50"
            title="Sincronizar com o banco de dados"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Database size={18} />}
            Sincronizar
          </button>
          
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

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-[var(--dash-text-primary)] text-[var(--dash-bg)] rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Salvar Alterações
        </button>
      </div>

      {/* --- Grid --- */}
      <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl shadow-sm overflow-hidden">
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
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
            </DndContext>
          </table>
        </div>
        
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
    </div>
  );
}
