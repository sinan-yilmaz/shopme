import clsx from "clsx";

/**
 * Artikel-Kachel im Kategorie-Grid (SPEC §8.1, HANDOFF 2.1): Tipp fügt hinzu
 * bzw. erhöht die Menge. Steht der Artikel auf der Liste, zeigt die Kachel
 * einen Mengen-Badge (oben rechts) und einen „−"-Button (oben links);
 * „−" bei Menge 1 entfernt den Artikel.
 */
export default function CatalogItemButton({
  item,
  quantity = 0,
  onClick,
  onDecrement,
}) {
  const isInList = quantity > 0;

  const handleDecrement = (event) => {
    event.stopPropagation();
    onDecrement?.();
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        isInList
          ? `${item.name} — ${quantity} auf der Liste, Menge erhöhen`
          : `${item.name} hinzufügen`
      }
      className={clsx(
        "relative flex min-h-[104px] flex-col items-center justify-center gap-1.5 rounded-2xl border-[1.5px] bg-white p-2.5 text-center transition-all duration-150 ease-out",
        "hover:border-brand active:scale-[0.97]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        isInList ? "border-brand bg-brand-50" : "border-line",
      )}
    >
      {isInList && (
        <>
          <span
            aria-hidden="true"
            className="absolute right-1.5 top-1.5 inline-flex h-6 min-w-6 animate-plop items-center justify-center rounded-full bg-brand px-1.5 text-sm font-bold text-white tabular-nums"
          >
            {quantity}
          </span>
          <span
            role="button"
            tabIndex={0}
            aria-label={`Menge von ${item.name} verringern${quantity === 1 ? " — entfernt den Artikel" : ""}`}
            onClick={handleDecrement}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleDecrement(event);
              }
            }}
            className={clsx(
              "absolute left-1.5 top-1.5 inline-flex size-[26px] animate-plop items-center justify-center rounded-full border-[1.5px] border-line-strong bg-white text-[15px] font-bold leading-none text-brand-deep",
              "transition-colors duration-150 hover:bg-warn-bg",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
            )}
          >
            −
          </span>
        </>
      )}
      <span className="text-[27px] leading-none" aria-hidden="true">
        {item.emoji}
      </span>
      <span className="text-[13.5px] font-semibold leading-tight text-ink">
        {item.name}
      </span>
    </button>
  );
}
