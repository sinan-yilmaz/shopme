import clsx from "clsx";

const VARIANT_CLASSES = {
  ghost:
    "text-neutral-600 hover:bg-neutral-100 hover:text-ink active:bg-neutral-200",
  outline:
    "border border-neutral-300 bg-white text-neutral-700 hover:border-brand-400 hover:text-brand-700 active:bg-brand-50",
  brand: "bg-brand-100 text-brand-800 hover:bg-brand-200 active:bg-brand-300",
};

/**
 * Quadratischer Icon-Button mit 44-px-Touch-Target.
 * `label` ist Pflicht und wird zum aria-label.
 */
export default function IconButton({
  label,
  variant = "ghost",
  size = "md",
  disabled = false,
  className,
  children,
  ...rest
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      className={clsx(
        "inline-flex shrink-0 items-center justify-center rounded-lg transition-colors duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        "disabled:cursor-not-allowed disabled:opacity-40",
        size === "sm" ? "size-9" : "size-11",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
