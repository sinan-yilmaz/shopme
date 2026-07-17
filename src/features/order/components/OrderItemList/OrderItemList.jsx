import { useMemo } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import OrderItemRow from "../OrderItemRow";

/**
 * Sortierbare Einkaufsliste: Drag & Drop (dnd-kit) und Pfeil-Buttons ändern
 * die Reihenfolge identisch (SPEC §8.1) — die Reihenfolge ist die Priorität.
 */
export default function OrderItemList({
  items,
  catalogItems,
  onReorder,
  onMove,
  onUpdate,
  onRemove,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const catalogById = useMemo(
    () => new Map((catalogItems ?? []).map((entry) => [entry.id, entry])),
    [catalogItems],
  );

  const handleDragEnd = ({ active, over }) => {
    if (over && active.id !== over.id) onReorder(active.id, over.id);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="space-y-3">
          {items.map((item, index) => (
            <OrderItemRow
              key={item.id}
              item={item}
              catalogItem={
                item.catalogItemId ? catalogById.get(item.catalogItemId) : null
              }
              index={index}
              total={items.length}
              onUpdate={(patch) => onUpdate(item.id, patch)}
              onRemove={() => onRemove(item.id)}
              onMoveUp={() => onMove(item.id, -1)}
              onMoveDown={() => onMove(item.id, 1)}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
