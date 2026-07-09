import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export const EditableCell = ({
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

  const isReadOnly = 
    row.original.is_caas && 
    (
      id === "name" || 
      id === "sku" || 
      (row.original.allow_price_overrides === false && (id === "price" || id === "compare_at_price" || id === "wholesale_price" || id === "wholesale_min_quantity"))
    );

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
