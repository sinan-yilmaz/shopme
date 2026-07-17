import { useState } from "react";
import { formatCents, parseEuroToCents } from "common/services/money";
import useOrderReceiptForm from "../../hooks/useOrderReceiptForm";
import Button from "lib/primitives/Button";
import Checkbox from "lib/primitives/Checkbox";
import Input from "lib/primitives/Input";
import { WarningBox } from "ui/feedback";

const RECEIPT_FORM_ID = "order-receipt-form";

/**
 * Bon-Eingabe beim Einkaufsabschluss (SPEC §9.2): Pflichtfeld, mit
 * Warnung + bewusster Bestätigung, falls der Bon über dem Budget liegt.
 */
export default function ReceiptForm({
  budgetCents,
  isSubmitting,
  onSubmitReceipt,
}) {
  const { form, fields } = useOrderReceiptForm();
  const [overBudgetConfirmed, setOverBudgetConfirmed] = useState(false);

  const receiptCents = parseEuroToCents(fields.receipt.field.value ?? "");
  const isOverBudget = receiptCents != null && receiptCents > budgetCents;
  const error = fields.receipt.fieldState.error?.message;

  const handleSubmit = form.handleSubmit((values) => {
    const cents = parseEuroToCents(values.receipt);
    if (cents == null) return;
    if (cents > budgetCents && !overBudgetConfirmed) return;
    onSubmitReceipt(cents);
  });

  return (
    <form id={RECEIPT_FORM_ID} onSubmit={handleSubmit} noValidate>
      <label
        htmlFor="receipt-input"
        className="mb-1.5 block text-base font-medium text-ink"
      >
        Kassenbon-Summe
        <span className="text-brand-600" aria-hidden="true">
          {" "}
          *
        </span>
      </label>
      <span className="relative block">
        <Input
          id="receipt-input"
          {...fields.receipt.field}
          inputMode="decimal"
          placeholder="z. B. 67,43"
          autoComplete="off"
          hasError={Boolean(error)}
          aria-invalid={error ? "true" : undefined}
          className="pr-10 text-center text-xl font-semibold tabular-nums"
        />
        <span
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg text-neutral-500"
          aria-hidden="true"
        >
          €
        </span>
      </span>
      {error && (
        <p className="mt-1.5 text-sm font-medium text-warn-800" role="alert">
          {error}
        </p>
      )}

      {isOverBudget && (
        <div className="mt-4">
          <WarningBox title="Bon liegt über dem Budget">
            <p>
              Der Bon ({formatCents(receiptCents)}) liegt über dem Budget von{" "}
              {formatCents(budgetCents)}. Die Differenz zahlt der Kunde an der
              Tür nach.
            </p>
            <Checkbox
              className="mt-2"
              checked={overBudgetConfirmed}
              onChange={setOverBudgetConfirmed}
              label="Ich bestätige das bewusst."
            />
          </WarningBox>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        fullWidth
        className="mt-4"
        busy={isSubmitting}
        disabled={isOverBudget && !overBudgetConfirmed}
      >
        Abrechnung erstellen
      </Button>
    </form>
  );
}
