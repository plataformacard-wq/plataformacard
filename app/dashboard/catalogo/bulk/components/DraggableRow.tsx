import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const DraggableRow = ({ row, children }: any) => {
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
