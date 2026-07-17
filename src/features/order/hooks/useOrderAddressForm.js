import { useController, useForm } from "react-hook-form";
import {
  isDeliverableZip,
  OUTSIDE_DELIVERY_AREA_MESSAGE,
} from "features/delivery/consts/areas";

const DEFAULT_VALUES = {
  name: "",
  street: "",
  zip: "",
  doorInfo: "",
  phone: "",
};

/** Telefon: 7–15 Ziffern, `+` und Leerzeichen erlaubt (SPEC §8.3). */
function validatePhone(value) {
  const digits = value.replace(/\D/g, "");
  const formatValid = /^\+?[\d\s]+$/.test(value.trim());
  if (!formatValid || digits.length < 7 || digits.length > 15) {
    return 'Bitte geben Sie eine gültige Telefonnummer an (7–15 Ziffern; „+" und Leerzeichen sind erlaubt).';
  }
  return true;
}

export default function useOrderAddressForm({ defaultValues } = {}) {
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
      name: useController({
        control: form.control,
        name: "name",
        rules: { required: "Bitte geben Sie Ihren Namen an." },
      }),
      street: useController({
        control: form.control,
        name: "street",
        rules: { required: "Bitte geben Sie Straße und Hausnummer an." },
      }),
      zip: useController({
        control: form.control,
        name: "zip",
        rules: {
          required: "Bitte geben Sie Ihre Postleitzahl an.",
          validate: (value) =>
            isDeliverableZip(value) || OUTSIDE_DELIVERY_AREA_MESSAGE,
        },
      }),
      doorInfo: useController({
        control: form.control,
        name: "doorInfo",
      }),
      phone: useController({
        control: form.control,
        name: "phone",
        rules: {
          required: "Bitte geben Sie Ihre Telefonnummer an.",
          validate: validatePhone,
        },
      }),
    },
  };
}
