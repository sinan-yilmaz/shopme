import clsx from "clsx";
import { Loader2 } from "lucide-react";

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed";

const VARIANT_CLASSES = {
  primary:
    "bg-brand text-white shadow-[0_6px_18px_rgb(23_73_53/0.18)] hover:bg-brand-deep active:scale-[0.98] disabled:bg-[#C9D6CD] disabled:text-white disabled:shadow-none",
  secondary:
    "border-[1.5px] border-line-strong bg-white text-neutral-700 hover:border-brand hover:text-brand-deep active:bg-brand-50 disabled:border-line disabled:bg-neutral-100 disabled:text-neutral-400",
  ghost:
    "bg-transparent text-brand hover:bg-brand-soft active:bg-brand-100 disabled:text-neutral-400",
  /** Ghost mit brand-Border (Prototyp: WhatsApp-CTA, Sekundär-Aktionen) */
  "ghost-brand":
    "border-[1.5px] border-brand/35 bg-transparent text-brand hover:bg-brand-soft active:bg-brand-100 disabled:border-line disabled:text-neutral-400",
  warn: "bg-warn text-white hover:bg-warn-800 active:bg-warn-900 disabled:bg-neutral-300 disabled:text-neutral-500",
};

const SIZE_CLASSES = {
  md: "h-11 px-4 text-base",
  lg: "h-[52px] px-6 text-[17px]",
};

/** Stellt Button-Klassen auch für Link-Elemente bereit (gleiche Optik). */
export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
} = {}) {
  return clsx(
    BASE_CLASSES,
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth && "w-full",
  );
}

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  busy = false,
  disabled = false,
  type = "button",
  className,
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || busy}
      className={clsx(buttonClasses({ variant, size, fullWidth }), className)}
      {...rest}
    >
      {busy && <Loader2 className="size-5 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
