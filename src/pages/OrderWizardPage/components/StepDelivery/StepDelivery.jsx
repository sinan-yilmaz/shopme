import { useEffect } from "react";
import { formatCents } from "common/services/money";
import { AreaHint, SlotPicker } from "features/delivery/components";
import { findDeliveryArea } from "features/delivery/consts/areas";
import { useOrderDraft } from "features/order/context/OrderDraftProvider";
import { FEE_DELIVERY_SUBURB_CENTS } from "features/order/consts/fees";
import useOrderAddressForm from "features/order/hooks/useOrderAddressForm";
import FieldGrid from "lib/form-layout/FieldGrid";
import FormStack from "lib/form-layout/FormStack";
import TextField from "lib/form-fields/TextField";
import Input from "lib/primitives/Input";
import Skeleton from "lib/primitives/Skeleton";
import { InfoBox } from "ui/feedback";

export const ADDRESS_FORM_ID = "order-address-form";

const PHONE_HELP =
  "Wir brauchen Ihre Nummer nur für Rückfragen zu Ihrem Einkauf — z. B. wenn ein Artikel ausverkauft ist.";

/**
 * Schritt 3 — Lieferung (SPEC §8.3): SlotPicker nach R5 + Adressformular
 * nach den Form-Konventionen. Umland-InfoBox und C7-Hinweis stehen direkt
 * am PLZ-Feld (HANDOFF §6). Der Weiter-Button der Seite submittet dieses
 * Formular über form="order-address-form".
 */
export default function StepDelivery({
  slots,
  isSlotsLoading,
  slotError,
  onValidSubmit,
}) {
  const { draft, setSlotId, setCustomer } = useOrderDraft();
  const { form, fields } = useOrderAddressForm({
    defaultValues: draft.customer,
  });

  // Formularwerte in den Draft spiegeln — der Entwurf übersteht Reloads (R10).
  useEffect(() => {
    const subscription = form.watch((values) => setCustomer(values));
    return () => subscription.unsubscribe();
  }, [form, setCustomer]);

  const zipValue = (form.watch("zip") ?? "").trim();
  const areaEntry = findDeliveryArea(zipValue);
  const zipComplete = zipValue.length === 5;
  const showAreaHint = zipComplete && !areaEntry;

  const handleSubmit = form.handleSubmit((values) => {
    setCustomer(values);
    onValidSubmit();
  });

  return (
    <div className="flex flex-col gap-[18px]">
      <h2 className="font-display text-[26px] font-bold leading-tight tracking-[-0.01em] text-ink">
        Lieferung
      </h2>

      <section
        aria-label="Lieferfenster"
        className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6"
      >
        <p className="mb-3 text-base font-semibold text-ink">
          Wann sollen wir liefern?
        </p>
        {isSlotsLoading ? (
          <div className="space-y-2.5">
            <Skeleton className="h-[74px] rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
          </div>
        ) : (
          <SlotPicker
            slots={slots ?? []}
            selectedSlotId={draft.slotId}
            onSelect={setSlotId}
          />
        )}
        <p aria-live="polite">
          {slotError && (
            <span className="mt-2 block text-sm font-semibold text-danger">
              {slotError}
            </span>
          )}
        </p>
      </section>

      <section
        aria-label="Adresse und Kontakt"
        className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6"
      >
        <p className="mb-3.5 text-base font-semibold text-ink">
          Wohin liefern wir?
        </p>
        <form id={ADDRESS_FORM_ID} onSubmit={handleSubmit} noValidate>
          <FormStack>
            <TextField
              label="Name"
              required
              controller={fields.name}
              autoComplete="name"
              placeholder="Vor- und Nachname"
            />
            <TextField
              label="Straße und Hausnummer"
              required
              controller={fields.street}
              autoComplete="street-address"
              placeholder="z. B. Ulmer Str. 12"
            />
            <FieldGrid>
              <TextField
                label="Postleitzahl"
                required
                controller={fields.zip}
                inputMode="numeric"
                maxLength={5}
                autoComplete="postal-code"
                placeholder="z. B. 89312"
              />
              <div>
                <label
                  htmlFor="delivery-city"
                  className="mb-[5px] block text-[14.5px] font-semibold text-neutral-700"
                >
                  Ort
                </label>
                <Input
                  id="delivery-city"
                  value={areaEntry?.city ?? ""}
                  placeholder="wird aus der PLZ ergänzt"
                  disabled
                  readOnly
                  aria-label="Ort (wird aus der Postleitzahl übernommen)"
                />
              </div>
            </FieldGrid>

            {showAreaHint && <AreaHint zip={zipValue} />}

            {areaEntry?.area === "umland" && (
              <div className="animate-fade-up">
                <InfoBox>
                  Im Umland beträgt die Liefergebühr{" "}
                  {formatCents(FEE_DELIVERY_SUBURB_CENTS)} — Sie sehen sie
                  gleich in der Übersicht, keine Überraschung.
                </InfoBox>
              </div>
            )}

            <TextField
              label="Telefonnummer"
              required
              controller={fields.phone}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="z. B. +49 151 2345678"
              help={PHONE_HELP}
            />
            <TextField
              label="Klingel, Etage, Hinweis"
              controller={fields.doorInfo}
              placeholder="z. B. EG links, bitte 2× klingeln"
            />
          </FormStack>
        </form>
      </section>
    </div>
  );
}
