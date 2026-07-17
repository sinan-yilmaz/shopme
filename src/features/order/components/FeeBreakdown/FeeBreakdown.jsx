import clsx from "clsx";
import { BRAND_NAME } from "common/consts/brand";
import { formatCents } from "common/services/money";
import {
  deliveryFeeCents,
  prepaidCents,
  serviceFeeCents,
} from "../../services/calculateFees";

const SERVICE_FEE_LABEL =
  "Servicegebühr 10 % vom Kassenbon (mind. 3 €, max. 12 €)";
const TRANSPARENCY_NOTE =
  "Sie zahlen am Ende exakt den Kassenbon plus Liefer- und Servicegebühr. Der Kassenbon liegt Ihrer Lieferung bei — keine versteckten Aufschläge.";

/**
 * Gebühren-Zeile nach HANDOFF 2.4: Label darf mehrzeilig umbrechen,
 * Betrag rechtsbündig tabular — nie abgeschnitten.
 */
function FeeRow({ label, value }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4">
      <span className="text-[15px] text-muted [text-wrap:pretty]">{label}</span>
      <span className="text-right text-[15.5px] font-semibold tabular-nums text-ink">
        {value}
      </span>
    </div>
  );
}

/** Stärkste Zeile des Bons: Gesamt über gestrichelter Trennlinie. */
function TotalRow({ label, value }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 border-t-[1.5px] border-dashed border-[#D8D2C4] pt-3">
      <span className="text-[17px] font-bold text-ink">{label}</span>
      <span className="text-right font-display text-[21px] font-bold tabular-nums text-brand-deep">
        {value}
      </span>
    </div>
  );
}

/**
 * Gebühren-Aufstellung im Kassenbon-Stil — das Vertrauensversprechen der
 * Marke (C9). `variant="estimate"` zeigt die Obergrenzen aus Budget + R1/R6,
 * `variant="final"` die echte Abrechnung nach R7 inkl. Gutschrift/Nachzahlung.
 */
export default function FeeBreakdown({
  variant,
  budgetCents,
  area,
  receiptCents,
  finalFees,
  prepaidCents: prepaid,
  showTransparencyNote = true,
}) {
  const isFinal = variant === "final";

  const rows = isFinal
    ? {
        delivery: finalFees.deliveryCents,
        service: finalFees.serviceCents,
        total: receiptCents + finalFees.deliveryCents + finalFees.serviceCents,
      }
    : {
        delivery: deliveryFeeCents(area),
        service: serviceFeeCents(budgetCents),
        total: prepaidCents({ budgetCents, area }),
      };

  const credit = isFinal && prepaid != null ? prepaid - rows.total : null;
  const deliveryLabel = `Liefergebühr (${area === "stadt" ? "Stadt" : "Umland"})`;

  return (
    <div>
      <div className="rounded-t-2xl bg-white px-5 pb-4 pt-6 shadow-card sm:px-6">
        <p className="text-center font-display text-[13px] font-bold uppercase tracking-[0.3em] text-muted">
          {BRAND_NAME}
        </p>
        <p className="mt-0.5 text-center text-sm text-neutral-500">
          {isFinal ? "Ihre Abrechnung" : "Ihre Kosten-Obergrenze"}
        </p>

        <div className="mt-5 flex flex-col gap-[11px]">
          {isFinal ? (
            <FeeRow
              label="Kassenbon (Warenwert)"
              value={formatCents(receiptCents)}
            />
          ) : (
            <FeeRow
              label="Budget (Obergrenze Warenwert)"
              value={formatCents(budgetCents)}
            />
          )}
          <FeeRow label={deliveryLabel} value={formatCents(rows.delivery)} />
          <FeeRow
            label={
              isFinal ? SERVICE_FEE_LABEL : `${SERVICE_FEE_LABEL} — Obergrenze`
            }
            value={formatCents(rows.service)}
          />
          <TotalRow
            label={isFinal ? "Gesamt" : "Gesamt-Obergrenze"}
            value={formatCents(rows.total)}
          />
          {isFinal && prepaid != null && (
            <FeeRow
              label="Bereits bezahlt (Vorkasse)"
              value={`− ${formatCents(prepaid)}`}
            />
          )}
        </div>
      </div>
      <div className="receipt-zigzag" aria-hidden="true" />

      {credit != null && (
        <div
          className={clsx(
            "mt-3.5 animate-fade-up rounded-2xl px-4 py-4",
            credit >= 0 ? "bg-brand-soft" : "bg-warn-bg",
          )}
        >
          {credit > 0 && (
            <p className="text-[16.5px] font-bold text-brand-deep">
              Ihr Guthaben:{" "}
              <span className="tabular-nums">{formatCents(credit)}</span>
              <span className="mt-1 block text-sm font-normal text-brand">
                Erhalten Sie zurück — auf Wunsch auch als Rücküberweisung.
              </span>
            </p>
          )}
          {credit === 0 && (
            <p className="text-[16.5px] font-bold text-brand-deep">
              Alles beglichen — es bleibt kein Rest.
            </p>
          )}
          {credit < 0 && (
            <p className="text-base font-bold text-warn">
              Nachzahlung an der Tür:{" "}
              <span className="tabular-nums">
                {formatCents(Math.abs(credit))}
              </span>
            </p>
          )}
        </div>
      )}

      {isFinal && prepaid == null && (
        <div className="mt-3.5 rounded-2xl bg-neutral-100 px-4 py-4">
          <p className="text-base font-bold text-ink">
            Zu zahlen an der Tür:{" "}
            <span className="tabular-nums">{formatCents(rows.total)}</span>
            <span className="mt-0.5 block text-sm font-normal text-muted">
              Karte, bar oder PayPal — ganz wie es Ihnen passt.
            </span>
          </p>
        </div>
      )}

      {showTransparencyNote && (
        <p className="mt-3 px-1 text-sm text-muted [text-wrap:pretty]">
          {TRANSPARENCY_NOTE}
        </p>
      )}
    </div>
  );
}
