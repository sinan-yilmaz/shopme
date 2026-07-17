import clsx from "clsx";
import { Check } from "lucide-react";
import { MARKETS } from "../../consts/markets";

const DM_HINT =
  "dm führt keine frischen Lebensmittel. Sollen wir die übrigen Artikel in einem Supermarkt kaufen?";

/**
 * Markt-Auswahl nach HANDOFF 2.3: Radio-Karten mit Beschreibung, „Egal" über
 * volle Breite mit „Empfohlen"-Badge; bei dm + frischen Lebensmitteln ein
 * Inline-Hinweis mit Ein-Klick-Wechsel (blockiert nichts).
 */
export default function MarketPicker({
  market,
  onChangeMarket,
  allowSecondMarket,
  onChangeAllowSecondMarket,
  showDmFreshFoodHint = false,
}) {
  return (
    <div>
      <p
        className="mb-3.5 text-base font-semibold text-ink"
        id="market-picker-label"
      >
        Wo sollen wir einkaufen?
        <span className="text-brand" aria-hidden="true">
          {" "}
          *
        </span>
      </p>
      <div
        role="radiogroup"
        aria-labelledby="market-picker-label"
        className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-2.5"
      >
        {MARKETS.map((entry) => {
          const isSelected = market === entry.id;
          const isWildcard = entry.id === "egal";
          return (
            <button
              key={entry.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChangeMarket(entry.id)}
              className={clsx(
                "relative flex w-full items-start gap-3 rounded-2xl border-[1.5px] px-4 py-3.5 text-left transition-all duration-[180ms] ease-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                isWildcard && "col-span-full",
                isSelected
                  ? "border-brand bg-brand-50 shadow-[0_0_0_3px_#E7F1EA]"
                  : "border-line bg-white hover:border-brand",
              )}
            >
              <span
                aria-hidden="true"
                className={clsx(
                  "mt-0.5 inline-flex size-[22px] shrink-0 rounded-full bg-white transition-all duration-[180ms] ease-out",
                  isSelected
                    ? "border-[7px] border-brand"
                    : "border-2 border-[#C9C2B4]",
                )}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[16.5px] font-bold text-ink">
                  {entry.label}
                </span>
                <span className="mt-0.5 block text-sm leading-snug text-muted [text-wrap:pretty]">
                  {entry.description}
                </span>
              </span>
              {isWildcard && (
                <span className="absolute -top-[9px] right-3.5 rounded-full bg-accent px-2.5 py-[3px] text-[11.5px] font-bold tracking-[0.04em] text-accent-ink">
                  Empfohlen
                </span>
              )}
            </button>
          );
        })}
      </div>

      {showDmFreshFoodHint && (
        <div className="mt-3.5 flex animate-fade-up flex-wrap items-center gap-x-3.5 gap-y-2.5 rounded-xl bg-warn-bg px-4 py-3.5">
          <p className="min-w-[220px] flex-1 text-[15px] leading-relaxed text-warn [text-wrap:pretty]">
            {DM_HINT}
          </p>
          <button
            type="button"
            onClick={() => onChangeMarket("egal")}
            className={clsx(
              "h-10 shrink-0 rounded-[10px] border-[1.5px] border-warn bg-transparent px-3.5 text-sm font-semibold text-warn",
              "transition-all duration-150 ease-out hover:bg-warn hover:text-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warn focus-visible:ring-offset-2 focus-visible:ring-offset-warn-bg",
            )}
          >
            Auf „Egal — Sie entscheiden“ wechseln
          </button>
        </div>
      )}

      <button
        type="button"
        role="checkbox"
        aria-checked={allowSecondMarket}
        onClick={() => onChangeAllowSecondMarket(!allowSecondMarket)}
        className="mt-4 flex w-full items-start gap-3 rounded-[10px] p-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        <span
          aria-hidden="true"
          className={clsx(
            "inline-flex size-6 shrink-0 items-center justify-center rounded-[7px] transition-all duration-150 ease-out",
            allowSecondMarket
              ? "bg-brand text-white"
              : "border-2 border-[#C9C2B4] bg-white text-transparent",
          )}
        >
          <Check className="size-[15px]" strokeWidth={3.2} />
        </span>
        <span>
          <span className="block text-[15.5px] font-semibold text-ink">
            Zweiter Markt erlaubt, falls etwas fehlt
          </span>
          <span className="block text-sm text-muted">
            Wir fahren dann z. B. noch kurz zum dm, wenn ein Artikel ausverkauft
            ist.
          </span>
        </span>
      </button>
    </div>
  );
}
