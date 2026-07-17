import { useId } from "react";
import clsx from "clsx";
import { Check } from "lucide-react";

export default function Checkbox({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  hasError = false,
  className,
  ...rest
}) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className={clsx(
        "flex min-h-11 cursor-pointer items-start gap-3 py-1",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange?.(event.target.checked)}
          disabled={disabled}
          className={clsx(
            "peer size-6 appearance-none rounded-md border bg-white transition-colors duration-150 ease-out",
            "checked:border-brand-700 checked:bg-brand-700",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
            hasError ? "border-warn-600" : "border-neutral-400",
          )}
          {...rest}
        />
        <Check
          className="pointer-events-none absolute inset-0 m-auto size-4 text-white opacity-0 transition-opacity duration-150 peer-checked:opacity-100"
          strokeWidth={3}
          aria-hidden="true"
        />
      </span>
      <span className="text-base text-ink">
        {label}
        {description && (
          <span className="mt-0.5 block text-sm text-neutral-600">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
