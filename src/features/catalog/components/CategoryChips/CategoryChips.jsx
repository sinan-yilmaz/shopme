import { useEffect, useRef } from "react";
import clsx from "clsx";
import { CATALOG_CATEGORIES } from "../../consts/categories";

/**
 * Horizontal scrollbare Kategorie-Chips; Tipp öffnet/schließt die Kategorie.
 * Wechselt die aktive Kategorie (z. B. per Swipe im Kachel-Grid), scrollt
 * die Leiste automatisch, bis der aktive Chip sichtbar ist.
 */
export default function CategoryChips({ activeCategoryId, onSelect }) {
  const chipRefs = useRef(new Map());

  useEffect(() => {
    if (!activeCategoryId) return;
    chipRefs.current
      .get(activeCategoryId)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [activeCategoryId]);

  return (
    <div
      className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
      role="group"
      aria-label="Kategorien"
    >
      {CATALOG_CATEGORIES.map((category) => {
        const isActive = category.id === activeCategoryId;
        return (
          <button
            key={category.id}
            ref={(node) => {
              if (node) chipRefs.current.set(category.id, node);
              else chipRefs.current.delete(category.id);
            }}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(isActive ? null : category.id)}
            className={clsx(
              "h-[42px] shrink-0 whitespace-nowrap rounded-full border-[1.5px] px-4 text-[15px] font-semibold transition-colors duration-[180ms] ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
              isActive
                ? "border-brand bg-brand text-white"
                : "border-line-strong bg-white text-neutral-700 hover:border-brand hover:text-brand-deep",
            )}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
