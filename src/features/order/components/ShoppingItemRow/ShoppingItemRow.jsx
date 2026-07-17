import { useState } from "react";
import clsx from "clsx";
import { Check, MessageCircle, X } from "lucide-react";
import { formatCents, parseEuroToCents } from "common/services/money";
import Button, { buttonClasses } from "lib/primitives/Button";
import Dialog from "lib/primitives/Dialog";
import Input from "lib/primitives/Input";

/**
 * Position im Einkaufsmodus (SPEC §9.2, HANDOFF §6): Nummern-Kreis, große
 * Aktionen „Gekauft" (brand, ≥50 px) und „Nicht da" (ghost) im ~60/40-Split;
 * erledigte Zeilen mit warmem Grund und „Rückgängig". Der „Nicht da"-Dialog
 * (Ersetzen / Überspringen / Kunde per WhatsApp fragen, C12) bleibt.
 */
export default function ShoppingItemRow({
  item,
  catalogItem,
  number,
  customerPhone,
  onPatch,
}) {
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [missingDialogOpen, setMissingDialogOpen] = useState(false);
  const [priceText, setPriceText] = useState("");
  const [substitutionText, setSubstitutionText] = useState("");

  const isOpen = item.status === "offen";
  const isBought = item.status === "gekauft";
  const isReplaced = item.status === "ersetzt";
  const isSkipped = item.status === "uebersprungen";
  const isAgeRestricted = catalogItem?.ageRestricted ?? false;

  const priceCents = priceText.trim() ? parseEuroToCents(priceText) : null;
  const priceInvalid = priceText.trim() !== "" && priceCents === null;
  const whatsappHref = `https://wa.me/${customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hallo, hier ist Ihr Einkaufsservice. „${item.label}" ist leider nicht verfügbar. Sollen wir etwas Ähnliches mitbringen?`,
  )}`;

  const confirmBought = () => {
    if (priceInvalid) return;
    onPatch({ status: "gekauft", priceCents });
    setPriceDialogOpen(false);
    setPriceText("");
  };

  const confirmReplaced = () => {
    if (!substitutionText.trim()) return;
    onPatch({ status: "ersetzt", substitutionNote: substitutionText.trim() });
    setMissingDialogOpen(false);
    setSubstitutionText("");
  };

  const confirmSkipped = () => {
    onPatch({ status: "uebersprungen" });
    setMissingDialogOpen(false);
  };

  const resetItem = () => {
    onPatch({ status: "offen", priceCents: null, substitutionNote: "" });
  };

  return (
    <li
      className={clsx(
        "rounded-2xl border border-line px-4 py-[15px] transition-colors duration-200",
        isOpen ? "bg-white" : "bg-[#F6F4EE]",
      )}
    >
      <div className="flex items-start gap-[11px]">
        <span
          className="mt-0.5 inline-flex size-[26px] shrink-0 items-center justify-center rounded-full bg-field text-[13px] font-bold tabular-nums text-muted"
          aria-label={`Einkaufsposition ${number}`}
        >
          {number}
        </span>
        <span className="shrink-0 text-2xl leading-[1.2]" aria-hidden="true">
          {catalogItem?.emoji ?? "🛒"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-bold leading-snug text-ink">
            {item.label}
            {item.mustHave && (
              <span
                className="ml-1.5 text-accent"
                title="Pflicht-Artikel"
                aria-label="Pflicht-Artikel"
              >
                ★
              </span>
            )}
            {isAgeRestricted && (
              <span
                className="ml-1.5 inline-block translate-y-[-2px] rounded-[5px] border-[1.5px] border-danger px-[5px] py-px align-middle text-[11px] font-bold leading-tight text-danger"
                title="Ab 18 — Ausweis prüfen"
              >
                18+
              </span>
            )}
          </p>
          <p className="mt-0.5 text-[14.5px] text-muted">
            {item.quantity} {item.unit}
            {item.bio && " · Bio"}
          </p>
          {item.note && (
            <p className="mt-1 text-sm font-semibold text-brand-deep">
              „{item.note}“
            </p>
          )}
          {isReplaced && item.substitutionNote && (
            <p className="mt-1 text-sm text-neutral-700">
              Ersetzt durch: {item.substitutionNote}
            </p>
          )}
        </div>

        {isBought && (
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="inline-flex animate-[plop_350ms_cubic-bezier(.3,1.4,.5,1)_both] items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-[3px] text-[13px] font-semibold text-brand-deep">
              <Check className="size-[13px]" strokeWidth={3} aria-hidden="true" />
              Gekauft
            </span>
            {item.priceCents != null && (
              <span className="text-[14.5px] font-semibold tabular-nums text-ink">
                {formatCents(item.priceCents)}
              </span>
            )}
          </div>
        )}
        {isReplaced && (
          <span className="inline-flex shrink-0 animate-[plop_350ms_ease-out_both] items-center rounded-full bg-field px-2.5 py-[3px] text-[13px] font-semibold text-neutral-700">
            Ersetzt
          </span>
        )}
        {isSkipped && (
          <span className="inline-flex shrink-0 animate-[plop_350ms_ease-out_both] items-center rounded-full bg-warn-bg px-2.5 py-[3px] text-[13px] font-semibold text-warn">
            Übersprungen
          </span>
        )}
      </div>

      {isOpen && (
        <div className="mt-3 flex gap-[9px]">
          <button
            type="button"
            onClick={() => setPriceDialogOpen(true)}
            className={clsx(
              "inline-flex h-[50px] flex-[1.4] items-center justify-center gap-2 rounded-lg bg-brand text-base font-semibold text-white",
              "transition-all duration-150 ease-out hover:bg-brand-deep active:scale-[0.98]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
            )}
          >
            <Check className="size-[18px]" strokeWidth={2.6} aria-hidden="true" />
            Gekauft
          </button>
          <button
            type="button"
            onClick={() => setMissingDialogOpen(true)}
            className={clsx(
              "h-[50px] flex-1 rounded-lg border-[1.5px] border-line-strong bg-white text-[15px] font-semibold text-neutral-700",
              "transition-all duration-150 ease-out hover:border-warn hover:text-warn",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
            )}
          >
            Nicht da
          </button>
        </div>
      )}

      {!isOpen && (
        <button
          type="button"
          onClick={resetItem}
          className="mt-2 rounded px-0 py-1 text-[13px] font-semibold text-neutral-500 underline underline-offset-[3px] transition-colors duration-150 hover:text-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          Rückgängig
        </button>
      )}

      {/* Preis-Quickdialog (überspringbar) */}
      <Dialog
        open={priceDialogOpen}
        onClose={() => setPriceDialogOpen(false)}
        title={`${item.label} gekauft`}
        size="sm"
      >
        <label
          htmlFor={`price-${item.id}`}
          className="mb-[5px] block text-[14.5px] font-semibold text-neutral-700"
        >
          Preis laut Etikett (optional)
        </label>
        <span className="relative block">
          <Input
            id={`price-${item.id}`}
            value={priceText}
            onChange={(event) => setPriceText(event.target.value)}
            inputMode="decimal"
            placeholder="z. B. 2,49"
            hasError={priceInvalid}
            autoComplete="off"
            className="pr-10 text-center font-display text-xl font-bold tabular-nums"
          />
          <span
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg text-neutral-500"
            aria-hidden="true"
          >
            €
          </span>
        </span>
        {priceInvalid && (
          <p className="mt-1.5 text-sm font-semibold text-danger" role="alert">
            Bitte einen gültigen Betrag eingeben, z. B. 2,49.
          </p>
        )}
        <div className="mt-4 grid gap-2">
          <Button size="lg" onClick={confirmBought} disabled={priceInvalid}>
            {priceCents != null
              ? `Mit ${formatCents(priceCents)} speichern`
              : "Speichern"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setPriceText("");
              onPatch({ status: "gekauft", priceCents: null });
              setPriceDialogOpen(false);
            }}
          >
            Ohne Preis speichern
          </Button>
        </div>
      </Dialog>

      {/* „Nicht da"-Dialog */}
      <Dialog
        open={missingDialogOpen}
        onClose={() => setMissingDialogOpen(false)}
        title={`${item.label} ist nicht da`}
        size="sm"
      >
        <div className="space-y-5">
          <div>
            <label
              htmlFor={`substitute-${item.id}`}
              className="mb-[5px] block text-[14.5px] font-semibold text-neutral-700"
            >
              Ersetzt durch …
            </label>
            <Input
              id={`substitute-${item.id}`}
              value={substitutionText}
              onChange={(event) => setSubstitutionText(event.target.value)}
              placeholder="z. B. Cherrytomaten statt Strauchtomaten"
              autoComplete="off"
            />
            <Button
              fullWidth
              className="mt-2"
              onClick={confirmReplaced}
              disabled={!substitutionText.trim()}
            >
              Ersatz speichern
            </Button>
          </div>

          <div className="border-t border-line pt-4">
            <Button fullWidth variant="secondary" onClick={confirmSkipped}>
              <X className="size-5" aria-hidden="true" />
              Überspringen
            </Button>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer noopener"
              className={clsx(
                buttonClasses({ variant: "ghost", fullWidth: true }),
                "mt-2",
              )}
            >
              <MessageCircle className="size-5" aria-hidden="true" />
              Kunde fragen (WhatsApp)
            </a>
          </div>
        </div>
      </Dialog>
    </li>
  );
}
