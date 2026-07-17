import { Check, Link2 } from "lucide-react";
import { formatCents } from "common/services/money";
import Button from "lib/primitives/Button";

/**
 * Zwischenscreen nach Vorkasse-Bestellung (SPEC §8.4, HANDOFF §6):
 * gestalteter Link-Kasten (gestrichelt, mono), Betrag groß in Bricolage,
 * „Zahlung simulieren" — die Zahlung wird nur simuliert.
 */
export default function PaymentSimulation({ order, onSimulatePayment }) {
  return (
    <div className="mx-auto max-w-md animate-step-in">
      <div className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-7">
        <span
          className="inline-flex size-[46px] items-center justify-center rounded-xl bg-brand-soft"
          aria-hidden="true"
        >
          <Link2 className="size-[22px] text-brand-deep" />
        </span>
        <h2 className="mt-4 font-display text-[25px] font-bold leading-tight tracking-[-0.01em] text-ink">
          Zahlungslink simuliert
        </h2>
        <p className="mt-2 text-base text-muted [text-wrap:pretty]">
          Im echten Betrieb erhalten Sie jetzt einen Zahlungslink per WhatsApp
          oder SMS. Für die Demo genügt ein Klick:
        </p>

        <div className="mt-4 flex items-center gap-2.5 rounded-lg border-[1.5px] border-dashed border-[#C9C2B4] bg-bg px-3.5 py-3">
          <Link2
            className="size-[17px] shrink-0 text-neutral-500"
            aria-hidden="true"
          />
          <span className="truncate font-mono text-sm font-medium text-muted">
            pay.demo/{order.code.toLowerCase()}
          </span>
        </div>

        <dl className="mt-[18px] flex items-baseline justify-between gap-3.5">
          <dt className="text-[15.5px] text-muted">Vorkasse-Betrag</dt>
          <dd className="font-display text-2xl font-bold tabular-nums text-brand-deep">
            {formatCents(order.prepaidCents)}
          </dd>
        </dl>

        <Button size="lg" fullWidth className="mt-5" onClick={onSimulatePayment}>
          <Check className="size-[19px]" strokeWidth={2.4} aria-hidden="true" />
          Zahlung simulieren
        </Button>
      </div>

      <p className="mt-3.5 px-1 text-center text-sm text-neutral-500">
        Es wird nichts berechnet — dieser Schritt ist in der Demo nur
        nachgestellt.
      </p>
    </div>
  );
}
