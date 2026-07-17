import { useId, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Search } from "lucide-react";
import useDebounce from "common/hooks/useDebounce";
import { findCategory } from "../../consts/categories";
import { searchCatalogItems } from "../../services/searchCatalog";

const MAX_RESULTS = 8;

/**
 * Suchfeld als Held von Schritt 1 (HANDOFF §6): 58 px hoch, Radius 14,
 * Fokus-Glow in brand-soft; Treffer-Dropdown als Float-Karte mit
 * Emoji-Chip + Name + Kategorie rechts. Enter ohne Treffer legt einen
 * Freitext-Artikel an (SPEC §8.1).
 */
export default function CatalogSearch({
  items,
  containedIds,
  onSelectItem,
  onAddFreeText,
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const debouncedQuery = useDebounce(query, 150);
  const listboxId = useId();
  const inputRef = useRef(null);

  const results = useMemo(
    () => searchCatalogItems(items ?? [], debouncedQuery).slice(0, MAX_RESULTS),
    [items, debouncedQuery],
  );
  const trimmedQuery = query.trim();
  const hasFreeTextOption = trimmedQuery.length > 0;
  const optionCount = results.length + (hasFreeTextOption ? 1 : 0);

  // Auswahl-Cursor zurücksetzen, sobald sich die Treffer ändern
  const [lastQuery, setLastQuery] = useState(debouncedQuery);
  if (lastQuery !== debouncedQuery) {
    setLastQuery(debouncedQuery);
    setActiveIndex(0);
  }

  const selectCatalogItem = (item) => {
    onSelectItem(item);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const selectFreeText = () => {
    if (!trimmedQuery) return;
    onAddFreeText(trimmedQuery);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!optionCount) return;
      setIsOpen(true);
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex(
        (current) => (current + delta + optionCount) % optionCount,
      );
      return;
    }
    if (event.key === "Enter") {
      if (!trimmedQuery) return;
      event.preventDefault();
      if (results.length > 0 && activeIndex < results.length) {
        selectCatalogItem(results[activeIndex]);
      } else {
        selectFreeText();
      }
      return;
    }
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  const showListbox = isOpen && optionCount > 0;

  return (
    <div className="relative z-30">
      <Search
        className="pointer-events-none absolute left-[18px] top-1/2 size-[21px] -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={showListbox}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          showListbox ? `${listboxId}-option-${activeIndex}` : undefined
        }
        aria-label="Artikel suchen"
        placeholder="Suchen, z. B. Eier, Sprudel, Klopapier …"
        autoComplete="off"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onKeyDown={handleKeyDown}
        className={clsx(
          "h-[58px] w-full rounded-xl border-[1.5px] border-line-strong bg-white pl-[50px] pr-4 text-[17px] font-medium text-ink",
          "transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-[#9AA79F]",
          "focus:border-brand focus:shadow-[0_0_0_3px_#E7F1EA] focus:outline-none",
        )}
      />

      {showListbox && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Suchtreffer"
          className="absolute top-[64px] z-30 max-h-80 w-full animate-[fadeUp_150ms_ease-out] overflow-y-auto rounded-2xl border border-line bg-white p-1.5 shadow-float"
        >
          {results.map((item, index) => {
            const isContained = containedIds?.has(item.id);
            return (
              <li key={item.id} role="presentation">
                <button
                  type="button"
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  tabIndex={-1}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectCatalogItem(item)}
                  className={clsx(
                    "flex w-full items-center gap-[11px] rounded-[11px] px-2.5 py-[9px] text-left transition-colors duration-100",
                    index === activeIndex ? "bg-brand-50" : "bg-transparent",
                  )}
                >
                  <span
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-lg"
                    aria-hidden="true"
                  >
                    {item.emoji}
                  </span>
                  <span className="flex-1 text-base font-semibold text-ink">
                    {item.name}
                    {isContained && (
                      <span className="ml-2 align-middle text-[13px] font-medium text-brand">
                        In der Liste
                      </span>
                    )}
                  </span>
                  <span className="text-[13px] font-medium text-neutral-500">
                    {findCategory(item.categoryId)?.label}
                  </span>
                </button>
              </li>
            );
          })}
          {hasFreeTextOption && (
            <li role="presentation">
              <button
                type="button"
                id={`${listboxId}-option-${results.length}`}
                role="option"
                aria-selected={activeIndex === results.length}
                tabIndex={-1}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(results.length)}
                onClick={selectFreeText}
                className={clsx(
                  "flex w-full items-center gap-[11px] rounded-[11px] px-2.5 py-[11px] text-left transition-colors duration-100",
                  activeIndex === results.length
                    ? "bg-brand-50"
                    : "bg-transparent",
                )}
              >
                <span
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-warn-bg text-lg"
                  aria-hidden="true"
                >
                  ＋
                </span>
                <span className="flex-1 text-[15.5px] font-medium text-neutral-700">
                  „{trimmedQuery}“ als eigenen Artikel hinzufügen{" "}
                  <span className="text-neutral-500">(Enter)</span>
                </span>
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
