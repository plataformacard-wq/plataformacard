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
  Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  updated_at: string;
  isNew?: boolean;
};

// --- Editable Cell Component ---
const EditableCell = ({
  value: initialValue,
  row: { index },
  column: { id },
  updateData,
  type = "text",
  options = [],
}: any) => {
  const [value, setValue] = useState(initialValue);

  const onBlur = () => {
    updateData(index, id, value);
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  if (type === "select") {
    return (
      <select
        value={value || ""}
        onChange={(e) => {
          setValue(e.target.value);
          updateData(index, id, e.target.value);
        }}
        className="w-full bg-transparent border-none focus:ring-0 text-sm p-1"
        style={{ color: "var(--dash-text-primary)" }}
      >
        <option value="">Selecione...</option>
        {options.map((opt: any) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
    );
  }

  if (type === "checkbox") {
    return (
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) => {
          setValue(e.target.checked);
          updateData(index, id, e.target.checked);
        }}
        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
      />
    );
  }

  return (
    <input
      value={value || ""}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      type={type}
      className="w-full bg-transparent border-none focus:ring-0 text-sm p-1"
      style={{ color: "var(--dash-text-primary)" }}
      placeholder="..."
    />
  );
};

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
  
  const supabase = createClient();

  // Fetch initial data
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id, full_name")
        .eq("id", user.id)
        .single();

      if (profile?.organization_id) {
        setUserId(user.id);
        setUserName(profile.full_name || "Membro");
        setOrgId(profile.organization_id);
        
        // Fetch Catalog
        const { data: orgCatalog } = await supabase
          .from("organization_catalogs")
          .select("catalog_id")
          .eq("organization_id", profile.organization_id)
          .eq("is_enabled", true)
          .maybeSingle();

        if (orgCatalog?.catalog_id) {
          setCatalogId(orgCatalog.catalog_id);
          
          // Fetch Categories
          const { data: cats } = await supabase
            .from("categories")
            .select("id, name")
            .eq("catalog_id", orgCatalog.catalog_id);
          setCategories(cats || []);

          // Fetch Products
          const { data: prods } = await supabase
            .from("products")
            .select("id, name, description, price, sku, has_wholesale, wholesale_price, wholesale_min_quantity, category_id, updated_at")
            .eq("organization_id", profile.organization_id)
            .is("deleted_at", null)
            .order("created_at", { ascending: false });

          setData((prods || []).map(p => ({
            ...p,
            has_wholesale: !!p.has_wholesale
          })));
        }
      }
      setLoading(false);
    }

    init();
  }, [supabase]);

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
    [categories, data]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleSave = async () => {
    setSaving(true);
    // Logic for validation and upsert will be in Sprint 4
    // For now, just a simulation
    setTimeout(() => {
      setSaving(false);
      alert("Sprint 1: Estrutura do Grid validada! A lógica de salvamento com concorrência será implementada na Sprint 4.");
    }, 1500);
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
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr 
                  key={row.id} 
                  className="border-b border-[var(--dash-border)] hover:bg-[var(--dash-hover-bg)]/30 transition-colors group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2 relative">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      {/* Interaction highlight indicator (for Presence/Locking later) */}
                      <div className="absolute inset-y-0 left-0 w-0.5 bg-transparent group-focus-within:bg-primary transition-colors" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
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
    </div>
  );
}
