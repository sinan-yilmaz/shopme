import { useMemo } from "react";
import { BRAND_NAME } from "common/consts/brand";
import { formatCents } from "common/services/money";
import { formatDayShort } from "common/services/dateFormat";
import { findDeliveryArea } from "features/delivery/consts/areas";
import { fromDateKey } from "features/delivery/services/slotRules";
import { marketLabel } from "../../consts/markets";
import {
  deliveryFeeCents,
  prepaidCents,
  serviceFeeCents,
} from "../../services/calculateFees";

const TRANSPARENCY_NOTE =
  "Sie zahlen am Ende exakt den Kassenbon plus Liefer- und Servicegebühr. Der Kassenbon liegt Ihrer Lieferung bei — keine versteckten Aufschläge.";

function EditButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="justify-self-end rounded p-0.5 text-sm font-semibold text-brand underline underline-offset-[3px] transition-colors duration-150 hover:text-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      Bearbeiten
    </button>
  );
}

/**
 * Zusammenfassung in Schritt 4 als Kassenbon (HANDOFF §6): zentrierter
 * Marken-Kopf, Positionen mit gepunkteter Führungslinie, gestrichelte
 * Trenner, Gebühren nach 2.4, Zackenkante — jede Sektion mit „Bearbeiten".
 */
export default function OrderSummary({
  draft,
  slot,
  catalogItems,
  onEditStep,
}) {
  const catalogById = useMemo(
    () => new Map((catalogItems ?? []).map((entry) => [entry.id, entry])),
    [catalogItems],
  );

  const areaEntry = findDeliveryArea(draft.customer.zip);
  const area = areaEntry?.area ?? "stadt";
  const budgetCents = draft.budgetCents ?? 0;
  const fees = {
    delivery: deliveryFeeCents(area),
    service: serviceFeeCents(budgetCents),
    total: prepaidCents({ budgetCents, area }),
  };

  return (
    <div>
      <div className="rounded-t-2xl bg-white px-5 pb-[18px] pt-[26px] shadow-card sm:px-6">
        <p className="text-center font-display text-[13px] font-bold uppercase tracking-[0.3em] text-muted">
          {BRAND_NAME}
        </p>
        <p className="mt-[3px] text-center text-[13.5px] text-neutral-500">
          Ihre Bestellung im Überblick
        </p>

        {/* Liste */}
        <div className="mt-5 flex items-baseline justify-between gap-3">
          <p className="text-[15px] font-bold tracking-[0.02em] text-ink">
            Ihre Liste
          </p>
          <EditButton
            onClick={() => onEditStep(1)}
            label="Einkaufsliste bearbeiten (Schritt 1)"
          />
        </div>
        <ul className="mt-2.5 flex flex-col gap-[9px]">
          {draft.items.map((item) => {
            const catalogItem = item.catalogItemId
              ? catalogById.get(item.catalogItemId)
              : null;
            const meta = [
              `${item.quantity} ${item.unit}`,
              item.bio ? "Bio" : null,
              item.note ? `„${item.note}“` : null,
            ]
              .filter(Boolean)
              .join(" · ");
            return (
              <li key={item.id} className="flex items-baseline gap-2.5">
                <span className="shrink-0 text-base" aria-hidden="true">
                  {catalogItem?.emoji ?? "🛒"}
                </span>
                <span className="text-[15.5px] font-medium text-ink">
                  {item.label}
                </span>
                {item.mustHave && (
                  <span
                    className="text-sm text-accent"
                    title="Pflicht-Artikel"
                    aria-label="Pflicht-Artikel"
                  >
                    ★
                  </span>
                )}
                <span
                  className="flex-1 -translate-y-[3px] border-b-[1.5px] border-dotted border-[#D8D2C4]"
                  aria-hidden="true"
                />
                <span className="shrink-0 text-right text-sm font-medium text-muted">
                  {meta}
                </span>
              </li>
            );
          })}
        </ul>

        {/* Markt */}
        <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3.5 gap-y-[3px] border-t-[1.5px] border-dashed border-[#D8D2C4] pt-4">
          <p className="text-[15px] font-bold text-ink">Markt</p>
          <EditButton
            onClick={() => onEditStep(2)}
            label="Budget und Markt bearbeiten (Schritt 2)"
          />
          <p className="col-span-full text-[15px] text-muted">
            {marketLabel(draft.market)}
            {draft.allowSecondMarket ? " · zweiter Markt erlaubt" : ""}
          </p>
        </div>

        {/* Lieferung */}
        <div className="mt-3.5 grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3.5 gap-y-[3px]">
          <p className="text-[15px] font-bold text-ink">Lieferung</p>
          <EditButton
            onClick={() => onEditStep(3)}
            label="Lieferung bearbeiten (Schritt 3)"
          />
          <p className="col-span-full text-[15px] text-muted">
            {slot && (
              <>
                {formatDayShort(fromDateKey(slot.date))} · {slot.label}
                <br />
              </>
            )}
            {draft.customer.name} · {draft.customer.street},{" "}
            {draft.customer.zip} {areaEntry?.city ?? ""}
            {draft.customer.doorInfo && (
              <>
                <br />
                {draft.customer.doorInfo}
              </>
            )}{" "}
            · {draft.customer.phone}
          </p>
        </div>

        {/* Gebühren (HANDOFF 2.4) */}
        <div className="mt-5 flex flex-col gap-[11px] border-t-[1.5px] border-dashed border-[#D8D2C4] pt-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4">
            <span className="text-[15px] text-muted">
              Budget (Obergrenze Warenwert)
            </span>
            <span className="text-right text-[15.5px] font-semibold tabular-nums">
              {formatCents(budgetCents)}
            </span>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4">
            <span className="text-[15px] text-muted">
              Liefergebühr ({area === "stadt" ? "Stadt" : "Umland"})
            </span>
            <span className="text-right text-[15.5px] font-semibold tabular-nums">
              {formatCents(fees.delivery)}
            </span>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4">
            <span className="text-[15px] text-muted [text-wrap:pretty]">
              Servicegebühr 10 % vom Kassenbon (mind. 3 €, max. 12 €) —
              Obergrenze
            </span>
            <span className="text-right text-[15.5px] font-semibold tabular-nums">
              {formatCents(fees.service)}
            </span>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 border-t-[1.5px] border-dashed border-[#D8D2C4] pt-3">
            <span className="text-[17px] font-bold text-ink">
              Gesamt-Obergrenze
            </span>
            <span className="text-right font-display text-[21px] font-bold tabular-nums text-brand-deep">
              {formatCents(fees.total)}
            </span>
          </div>
        </div>
      </div>
      <div className="receipt-zigzag" aria-hidden="true" />
      <p className="mt-3 px-1 text-sm text-muted [text-wrap:pretty]">
        {TRANSPARENCY_NOTE}
      </p>
    </div>
  );
}
