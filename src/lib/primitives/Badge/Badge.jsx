import clsx from "clsx";

const VARIANT_CLASSES = {
  neutral: "bg-field text-neutral-700",
  brand: "bg-brand-soft text-brand-deep",
  "brand-solid": "bg-brand text-white",
  ink: "bg-neutral-700 text-white",
  warn: "bg-warn-bg text-warn",
  muted: "bg-field text-muted",
  outline: "border border-line-strong bg-white text-neutral-700",
};

export default function Badge({ variant = "neutral", className, children }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-[3px] text-[13px] font-semibold",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
