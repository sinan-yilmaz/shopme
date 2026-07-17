import { useMemo, useState } from "react";
import clsx from "clsx";
import { ClipboardPaste } from "lucide-react";
import {
  CatalogItemButton,
  CatalogSearch,
  CategoryChips,
  CategoryTilePager,
} from "features/catalog/components";
import { findCategory } from "features/catalog/consts/categories";
import { OrderItemList, PasteImportDialog } from "features/order/components";
import { useOrderDraft } from "features/order/context/OrderDraftProvider";
import useMediaQuery from "common/hooks/useMediaQuery";
import Skeleton from "lib/primitives/Skeleton";
import { InfoBox } from "ui/feedback";
import { EmptyBag } from "ui/illustrations";

const LIST_INFO =
  "Ganz oben steht, was auf keinen Fall fehlen darf. Wir kaufen in dieser Reihenfolge ein und bleiben dabei immer unter Ihrem Budget — passt ein Artikel nicht mehr hinein, lassen wir nur diesen weg und machen mit den nächsten weiter.";

/** Mobil: 3 Spalten × 3 Zeilen pro Seite im Kategorie-Carousel. */
const MOBILE_PAGE_SIZE = 9;

/** Schritt 1 — Einkaufsliste (SPEC §8.1). */
export default function StepShoppingList({ catalogItems, isCatalogLoading }) {
  const {
    draft,
    addCatalogItem,
    addFreeTextItem,
    updateItem,
    removeItem,
    moveItem,
    reorderItems,
  } = useOrderDraft();
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [page, setPage] = useState(0);
  const [importOpen, setImportOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 767px)");

  const containedIds = useMemo(
    () =>
      new Set(draft.items.map((item) => item.catalogItemId).filter(Boolean)),
    [draft.items],
  );
  /** catalogItemId → Listen-Item (für Mengen-Badge und „−" auf der Kachel). */
  const draftByCatalogId = useMemo(() => {
    const map = new Map();
    for (const item of draft.items) {
      if (item.catalogItemId) map.set(item.catalogItemId, item);
    }
    return map;
  }, [draft.items]);
  /** categoryId → Artikel (alphabetisch), für Grid und Seitenzahl der Nachbar-Kategorien. */
  const itemsByCategory = useMemo(() => {
    const map = new Map();
    for (const item of catalogItems ?? []) {
      if (!map.has(item.categoryId)) map.set(item.categoryId, []);
      map.get(item.categoryId).push(item);
    }
    for (const items of map.values()) {
      items.sort((a, b) => a.name.localeCompare(b.name, "de"));
    }
    return map;
  }, [catalogItems]);

  const categoryItems = activeCategoryId
    ? (itemsByCategory.get(activeCategoryId) ?? [])
    : [];
  const pageCount = Math.max(
    1,
    Math.ceil(categoryItems.length / MOBILE_PAGE_SIZE),
  );
  const clampedPage = Math.min(page, pageCount - 1);

  const openCategory = (categoryId) => {
    setActiveCategoryId(categoryId);
    setPage(0);
  };

  /** „−" auf der Kachel: bei Menge 1 entfernen, sonst Menge verringern. */
  const decrementCatalogItem = (catalogItemId) => {
    const draftItem = draftByCatalogId.get(catalogItemId);
    if (!draftItem) return;
    if (draftItem.quantity <= 1) {
      removeItem(draftItem.id);
    } else {
      updateItem(draftItem.id, { quantity: draftItem.quantity - 1 });
    }
  };

  return (
    <div>
      <h2 className="mb-4 font-display text-[26px] font-bold leading-tight tracking-[-0.01em] text-ink">
        Was dürfen wir für Sie einkaufen?
      </h2>

      {isCatalogLoading ? (
        <Skeleton className="h-[58px] rounded-xl" />
      ) : (
        <CatalogSearch
          items={catalogItems}
          containedIds={containedIds}
          onSelectItem={addCatalogItem}
          onAddFreeText={addFreeTextItem}
        />
      )}

      <div className="mt-4">
        <CategoryChips
          activeCategoryId={activeCategoryId}
          onSelect={openCategory}
        />
      </div>

      {activeCategoryId && (
        <div className="mt-3 animate-fade-up rounded-2xl border border-line bg-white p-4 shadow-card">
          {isCatalogLoading ? (
            <div className="grid grid-cols-3 gap-2.5 md:grid-cols-[repeat(auto-fill,minmax(100px,1fr))]">
              {Array.from({ length: isMobile ? 9 : 8 }, (_, index) => (
                <Skeleton key={index} className="min-h-[104px] rounded-2xl" />
              ))}
            </div>
          ) : isMobile ? (
            <CategoryTilePager
              activeCategoryId={activeCategoryId}
              page={clampedPage}
              onNavigate={(categoryId, nextPage) => {
                setActiveCategoryId(categoryId);
                setPage(nextPage);
              }}
              itemsByCategory={itemsByCategory}
              pageSize={MOBILE_PAGE_SIZE}
              renderTile={(item) => {
                const draftItem = draftByCatalogId.get(item.id);
                return (
                  <CatalogItemButton
                    key={item.id}
                    item={item}
                    quantity={draftItem?.quantity ?? 0}
                    onClick={() => addCatalogItem(item)}
                    onDecrement={() => decrementCatalogItem(item.id)}
                  />
                );
              }}
            />
          ) : (
            <div key={activeCategoryId} className="animate-fade-up">
              <p className="mb-3 font-display text-[17px] font-bold text-ink">
                {findCategory(activeCategoryId)?.label}
              </p>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2.5">
                {categoryItems.map((item) => {
                  const draftItem = draftByCatalogId.get(item.id);
                  return (
                    <CatalogItemButton
                      key={item.id}
                      item={item}
                      quantity={draftItem?.quantity ?? 0}
                      onClick={() => addCatalogItem(item)}
                      onDecrement={() => decrementCatalogItem(item.id)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setImportOpen(true)}
        disabled={isCatalogLoading}
        className={clsx(
          "mt-3.5 flex h-[50px] w-full items-center justify-center gap-2 rounded-lg border-[1.5px] border-dashed border-[#C9C2B4] bg-transparent text-base font-semibold text-neutral-700",
          "transition-all duration-150 ease-out hover:border-brand hover:bg-brand-50 hover:text-brand-deep",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <ClipboardPaste className="size-[18px]" aria-hidden="true" />
        Fertige Liste einfügen
      </button>

      <section className="mt-7" aria-label="Ihre Einkaufsliste">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="font-display text-[21px] font-bold text-ink">
            Ihre Liste
          </h3>
          <span className="text-[15px] text-muted" aria-live="polite">
            {draft.items.length} Artikel
          </span>
        </div>

        {draft.items.length === 0 ? (
          <div className="rounded-2xl border-[1.5px] border-dashed border-[#D8D2C4] bg-white px-6 py-9 text-center">
            <EmptyBag className="mx-auto block" />
            <p className="mt-3.5 font-display text-lg font-bold text-ink">
              Ihre Liste ist noch leer
            </p>
            <p className="mx-auto mt-1.5 max-w-[38ch] text-[15.5px] text-muted">
              Suchen Sie oben nach Artikeln, tippen Sie auf eine Kategorie —
              oder fügen Sie Ihre fertige Liste ein.
            </p>
          </div>
        ) : (
          <OrderItemList
            items={draft.items}
            catalogItems={catalogItems ?? []}
            onReorder={reorderItems}
            onMove={moveItem}
            onUpdate={updateItem}
            onRemove={removeItem}
          />
        )}
      </section>

      <div className="mt-5">
        <InfoBox>
          <strong className="font-bold">
            Die Reihenfolge ist Ihre Wunschliste.
          </strong>{" "}
          {LIST_INFO}
        </InfoBox>
      </div>

      <PasteImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        catalogItems={catalogItems ?? []}
      />
    </div>
  );
}
