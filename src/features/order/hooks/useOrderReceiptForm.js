import { useController, useForm } from "react-hook-form";
import { parseEuroToCents } from "common/services/money";

const DEFAULT_VALUES = { receipt: "" };

function validateReceipt(value) {
  const cents = parseEuroToCents(value);
  if (cents === null || cents <= 0) {
    return "Bitte einen gültigen Betrag eingeben, z. B. 67,43.";
  }
  return true;
}

export default function useOrderReceiptForm({ defaultValues } = {}) {
  const form = useForm({
    mode: "onTouched",
    defaultValues: Object.fromEntries(
      Object.entries(DEFAULT_VALUES).map(([key, value]) => [
        key,
        defaultValues?.[key] ?? value,
      ]),
    ),
  });

  return {
    form,
    fields: {
      receipt: useController({
        control: form.control,
        name: "receipt",
        rules: {
          required: "Bitte die Kassenbon-Summe eingeben.",
          validate: validateReceipt,
        },
      }),
    },
  };
}
