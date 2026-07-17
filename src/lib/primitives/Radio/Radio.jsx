import clsx from "clsx";

export default function Radio({
  checked,
  onChange,
  name,
  value,
  label,
  className,
  ...rest
}) {
  return (
    <label
      className={clsx(
        "flex min-h-11 cursor-pointer items-center gap-3 py-1",
        className,
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange?.(value)}
        className={clsx(
          "size-6 shrink-0 appearance-none rounded-full border bg-white transition-all duration-150 ease-out",
          "checked:border-[7px] checked:border-brand-700",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          "border-neutral-400",
        )}
        {...rest}
      />
      <span className="text-base text-ink">{label}</span>
    </label>
  );
}
