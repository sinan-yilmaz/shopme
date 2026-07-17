import { useMemo } from "react";
import { Star } from "lucide-react";
import sortItemsForShopping from "../../services/sortItemsForShopping";
import ShoppingItemRow from "../ShoppingItemRow";

/**
 * Einkaufsliste in Einkaufsreihenfolge nach R4: Sektion „Pflicht" zuerst,
 * dann „Weitere" — durchnummeriert, Reihenfolge sichtbar.
 */
export default function ShoppingChecklist({
  order,
  catalogItems,
  onPatchItem,
}) {
  const sorted = useMemo(
    () => sortItemsForShopping(order.items),
    [order.items],
  );
  const catalogById = useMemo(
    () => new Map((catalogItems ?? []).map((entry) => [entry.id, entry])),
    [catalogItems],
  );

  const mustHaveItems = sorted.filter((item) => item.mustHave);
  const otherItems = sorted.filter((item) => !item.mustHave);

  const renderRows = (items, offset) =>
    items.map((item, index) => (
      <ShoppingItemRow
        key={item.id}
        item={item}
        catalogItem={
          item.catalogItemId ? catalogById.get(item.catalogItemId) : null
        }
        number={offset + index + 1}
        customerPhone={order.customer.phone}
        onPatch={(patch) => onPatchItem(item.id, patch)}
      />
    ));

  return (
    <div className="space-y-6">
      {mustHaveItems.length > 0 && (
        <section aria-label="Pflicht-Artikel">
          <h3 className="mb-2.5 flex items-center gap-2 font-display text-[17px] font-bold text-ink">
            <Star
              className="size-4.5 fill-accent text-accent"
              aria-hidden="true"
            />
            Pflicht zuerst ({mustHaveItems.length})
          </h3>
          <ul className="space-y-2.5">{renderRows(mustHaveItems, 0)}</ul>
        </section>
      )}
      {otherItems.length > 0 && (
        <section aria-label="Weitere Artikel">
          <h3 className="mb-2.5 font-display text-[17px] font-bold text-neutral-700">
            Weitere Artikel ({otherItems.length})
          </h3>
          <ul className="space-y-2.5">
            {renderRows(otherItems, mustHaveItems.length)}
          </ul>
        </section>
      )}
    </div>
  );
}
