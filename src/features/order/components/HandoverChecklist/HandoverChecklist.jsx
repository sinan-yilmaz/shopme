import { BadgeEuro, CheckCircle2, MapPin, Phone } from "lucide-react";
import { formatCents } from "common/services/money";
import Button, { buttonClasses } from "lib/primitives/Button";
import Checkbox from "lib/primitives/Checkbox";
import { WarningBox } from "ui/feedback";

const AGE_CHECK_LABEL = "Ausweis geprüft — Kunde ist 18 oder älter.";

/**
 * Übergabe-Checkliste im Status „unterwegs" (SPEC §9.2): Adresse,
 * Zahlhinweis, bei 🔞 Pflicht-Checkbox nach R8, dann „Als geliefert markieren".
 */
export default function HandoverChecklist({
  order,
  hasAgeRestricted,
  ageChecked,
  onChangeAgeChecked,
  onMarkDelivered,
  isSubmitting,
  submitError,
}) {
  const total =
    order.receiptCents +
    order.finalFees.deliveryCents +
    order.finalFees.serviceCents;
  const credit = order.prepaidCents != null ? order.prepaidCents - total : null;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-card">
        <h3 className="flex items-center gap-2 text-base font-semibold text-ink">
          <MapPin className="size-5 text-brand-700" aria-hidden="true" />
          Lieferadresse
        </h3>
        <p className="mt-2 text-base text-neutral-800">
          {order.customer.name}
          <span className="block">{order.customer.street}</span>
          <span className="block">
            {order.customer.zip} {order.customer.city}
          </span>
          {order.customer.doorInfo && (
            <span className="block text-neutral-600">
              {order.customer.doorInfo}
            </span>
          )}
        </p>
        <a
          href={`tel:${order.customer.phone.replace(/\s/g, "")}`}
          className={
            buttonClasses({ variant: "secondary", fullWidth: true }) + " mt-3"
          }
        >
          <Phone className="size-5" aria-hidden="true" />
          {order.customer.name.split(" ")[0]} anrufen
        </a>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-card">
        <h3 className="flex items-center gap-2 text-base font-semibold text-ink">
          <BadgeEuro className="size-5 text-brand-700" aria-hidden="true" />
          An der Tür
        </h3>
        {credit != null ? (
          credit >= 0 ? (
            <p className="mt-2 text-base text-neutral-800">
              Gutschrift{" "}
              <strong className="tabular-nums">{formatCents(credit)}</strong>{" "}
              mitteilen — der Betrag wird als Guthaben verrechnet oder
              zurücküberwiesen.
            </p>
          ) : (
            <p className="mt-2 text-base text-neutral-800">
              Nachzahlung{" "}
              <strong className="tabular-nums">
                {formatCents(Math.abs(credit))}
              </strong>{" "}
              kassieren (Bon lag über dem Budget).
            </p>
          )
        ) : (
          <p className="mt-2 text-base text-neutral-800">
            Gesamt{" "}
            <strong className="tabular-nums">{formatCents(total)}</strong>{" "}
            kassieren — Karte, bar oder PayPal.
          </p>
        )}
      </div>

      {hasAgeRestricted && (
        <div className="rounded-xl border-[1.5px] border-warn-200 bg-warn-50 p-3.5">
          <p className="mb-1 text-base font-semibold text-ink">
            <span
              className="mr-1.5 inline-block rounded-md border-[1.5px] border-danger px-1.5 py-0.5 align-[1px] text-xs font-bold text-danger"
              aria-hidden="true"
            >
              18+
            </span>
            Diese Bestellung enthält Artikel ab 18
          </p>
          <Checkbox
            checked={ageChecked}
            onChange={onChangeAgeChecked}
            label={AGE_CHECK_LABEL}
          />
        </div>
      )}

      {submitError && (
        <WarningBox title="Das hat nicht geklappt">{submitError}</WarningBox>
      )}

      <Button
        size="lg"
        fullWidth
        onClick={onMarkDelivered}
        busy={isSubmitting}
        disabled={hasAgeRestricted && !ageChecked}
      >
        <CheckCircle2 className="size-5" aria-hidden="true" />
        Als geliefert markieren
      </Button>
    </div>
  );
}
