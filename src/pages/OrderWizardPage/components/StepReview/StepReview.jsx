import clsx from "clsx";
import { Check } from "lucide-react";
import { formatCents } from "common/services/money";
import { findDeliveryArea } from "features/delivery/consts/areas";
import { OrderSummary } from "features/order/components";
import { useOrderDraft } from "features/order/context/OrderDraftProvider";
import { prepaidCents } from "features/order/services/calculateFees";
import { InfoBox, WarningBox } from "ui/feedback";

const PREPAY_EXPLANATION =
  "Bei der ersten Bestellung bitten wir um Vorkasse in Höhe Ihrer Budget-Obergrenze. Was wir nicht ausgeben, erhalten Sie als Guthaben zurück — auf Wunsch auch als Rücküberweisung.";

/** Radio-Karte der Zahlarten (C9a): Inline-Erklärung nur wenn gewählt. */
function PaymentCard({ selected, onSelect, title, children }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={clsx(
        "w-full rounded-2xl border-[1.5px] p-4 text-left transition-all duration-[180ms] ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        selected
          ? "border-brand bg-brand-50 shadow-[0_0_0_3px_#E7F1EA]"
          : "border-line bg-white hover:border-brand",
      )}
    >
      <span className="flex gap-3">
        <span
          aria-hidden="true"
          className={clsx(
            "mt-0.5 inline-flex size-[22px] shrink-0 rounded-full bg-white transition-all duration-[180ms] ease-out",
            selected ? "border-[7px] border-brand" : "border-2 border-[#C9C2B4]",
          )}
        />
        <span className="flex-1">
          <span className="block text-base font-bold text-ink">{title}</span>
          {selected && children}
        </span>
      </span>
    </button>
  );
}

/** Schritt 4 — Prüfen & Bestellen (SPEC §8.4). */
export default function StepReview({ slots, catalogItems, submitError }) {
  const { draft, goToStep, setPaymentMode, setTermsAccepted } = useOrderDraft();

  const areaEntry = findDeliveryArea(draft.customer.zip);
  const area = areaEntry?.area ?? "stadt";
  const slot = (slots ?? []).find((entry) => entry.id === draft.slotId) ?? null;
  const prepaid = prepaidCents({ budgetCents: draft.budgetCents ?? 0, area });

  return (
    <div className="flex flex-col gap-[18px]">
      <h2 className="font-display text-[26px] font-bold leading-tight tracking-[-0.01em] text-ink">
        Prüfen &amp; Bestellen
      </h2>

      <OrderSummary
        draft={draft}
        slot={slot}
        catalogItems={catalogItems}
        onEditStep={goToStep}
      />

      <section aria-label="Zahlungsart" className="flex flex-col gap-2.5">
        <p className="mt-1.5 text-base font-semibold text-ink">
          Wie möchten Sie zahlen?
        </p>
        <div role="radiogroup" aria-label="Zahlungsart" className="contents">
          <PaymentCard
            selected={draft.paymentMode === "vorkasse"}
            onSelect={() => setPaymentMode("vorkasse")}
            title="Ich bestelle zum ersten Mal"
          >
            <span className="mt-1.5 block text-[14.5px] leading-relaxed text-muted [text-wrap:pretty]">
              {PREPAY_EXPLANATION}
            </span>
            <span className="mt-2 block text-[15.5px] font-semibold text-brand-deep">
              Jetzt per (simuliertem) Zahlungslink:{" "}
              <span className="tabular-nums">{formatCents(prepaid)}</span>
            </span>
          </PaymentCard>
          <PaymentCard
            selected={draft.paymentMode === "tuer"}
            onSelect={() => setPaymentMode("tuer")}
            title={
              <>
                Ich bin bereits Kunde{" "}
                <span className="font-medium text-neutral-500">(Demo)</span>
              </>
            }
          >
            <span className="mt-1.5 block text-[14.5px] text-muted">
              Zahlung an der Tür — Karte, bar oder PayPal.
            </span>
          </PaymentCard>
        </div>

        <button
          type="button"
          role="checkbox"
          aria-checked={draft.termsAccepted}
          onClick={() => setTermsAccepted(!draft.termsAccepted)}
          className={clsx(
            "flex w-full items-start gap-3 rounded-2xl border border-line bg-white p-4 text-left transition-colors duration-150 ease-out hover:border-brand-300",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
          )}
        >
          <span
            aria-hidden="true"
            className={clsx(
              "inline-flex size-6 shrink-0 items-center justify-center rounded-[7px] transition-all duration-150 ease-out",
              draft.termsAccepted
                ? "bg-brand text-white"
                : "border-2 border-[#C9C2B4] bg-white text-transparent",
            )}
          >
            <Check className="size-[15px]" strokeWidth={3.2} />
          </span>
          <span>
            <span className="block text-[15.5px] font-semibold text-ink">
              Ich akzeptiere die Demo-Bedingungen.
            </span>
            <span className="block text-[13.5px] text-neutral-500">
              Platzhalter — in der Demo werden keine echten Verträge
              geschlossen.
            </span>
          </span>
        </button>
      </section>

      {submitError && (
        <WarningBox title="Die Bestellung konnte nicht abgeschickt werden">
          {submitError}
        </WarningBox>
      )}

      {!slot && (
        <InfoBox>
          Ihr Lieferfenster fehlt noch — bitte wählen Sie es in Schritt 3 aus.
        </InfoBox>
      )}
    </div>
  );
}
