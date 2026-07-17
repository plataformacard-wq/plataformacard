import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { GripVertical, Settings2, Trash2, AlertCircle } from "lucide-react";
import { ProductRow } from "@/components/dashboard/ProductDetailDrawer";
import { Category } from "@/app/dashboard/catalogo/bulk/useBulkEditorManager";
import { EditableCell } from "@/app/dashboard/catalogo/bulk/components/EditableCell";
import { DraggableRow } from "@/app/dashboard/catalogo/bulk/components/DraggableRow";

type BulkEditorTableProps = {
  data: ProductRow[];
  categories: Category[];
  updateData: (rowIndex: number, columnId: string, value: any) => void;
  removeRow: (id: string) => void;
  setEditingRowIndex: (index: number) => void;
  handleDragEnd: (event: DragEndEvent) => void;
};

export default function BulkEditorTable({
  data,
  categories,
  updateData,
  removeRow,
  setEditingRowIndex,
  handleDragEnd,
}: BulkEditorTableProps) {
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
        accessorKey: "compare_at_price",
        header: "Preço De (R$)",
        cell: (props) => {
          const hasRetail = props.row.original.has_retail;
          return (
            <div className={!hasRetail ? "opacity-50" : ""}>
              <EditableCell {...props} updateData={updateData} type="number" />
            </div>
          );
        },
        size: 160,
      },
      {
        accessorKey: "price",
        header: "Preço Por (R$)",
        cell: (props) => {
          const hasRetail = props.row.original.has_retail;
          return (
            <div className={!hasRetail ? "opacity-50" : ""}>
              <EditableCell {...props} updateData={updateData} type="number" />
            </div>
          );
        },
        size: 160,
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
        accessorKey: "has_wholesale",
        header: "Atacado?",
        cell: (props) => <EditableCell {...props} updateData={updateData} type="checkbox" />,
        size: 90,
      },
      {
        accessorKey: "wholesale_price",
        header: "Preço Atacado",
        cell: (props) => {
          const hasWholesale = props.row.original.has_wholesale;
          return (
            <div className={!hasWholesale ? "opacity-50" : ""}>
              <EditableCell {...props} updateData={updateData} type="number" />
            </div>
          );
        },
        size: 160,
      },
      {
        accessorKey: "wholesale_min_quantity",
        header: "Mín. Atacado",
        cell: (props) => {
          const hasWholesale = props.row.original.has_wholesale;
          return (
            <div className={!hasWholesale ? "opacity-50" : ""}>
              <EditableCell {...props} updateData={updateData} type="number" />
            </div>
          );
        },
        size: 140,
      },
      {
        accessorKey: "is_in_stock",
        header: "Em Estoque?",
        cell: (props) => <EditableCell {...props} updateData={updateData} type="checkbox" />,
        size: 100,
      },
      {
        accessorKey: "manual_stock",
        header: "Estoque Manual?",
        cell: (props) => <EditableCell {...props} updateData={updateData} type="checkbox" />,
        size: 110,
      },
      {
        accessorKey: "stock_quantity",
        header: "Qtd. Estoque",
        cell: (props) => <EditableCell {...props} updateData={updateData} type="number" />,
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
    [categories, removeRow, setEditingRowIndex, updateData]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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

  return (
    <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[27px] shadow-sm overflow-hidden">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-max border-collapse text-left">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-[var(--dash-border)] bg-[var(--dash-hover-bg)]/50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-xs font-bold text-[var(--dash-text-secondary)] uppercase tracking-wider whitespace-nowrap"
                      style={{ width: header.getSize(), minWidth: header.getSize() }}
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
                            style={{ width: cell.column.getSize(), minWidth: cell.column.getSize() }}
                            {...(cell.column.id === "drag-handle" ? { ...attributes, ...listeners } : {})}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
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
  );
}
