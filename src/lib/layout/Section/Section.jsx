import clsx from "clsx";

export default function Section({
  title,
  description,
  actions,
  className,
  children,
}) {
  return (
    <section className={clsx("mt-8 first:mt-0", className)}>
      {(title || actions) && (
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          {title && <h2 className="text-xl font-semibold text-ink">{title}</h2>}
          {actions}
        </div>
      )}
      {description && (
        <p className="mb-3 max-w-prose text-base text-neutral-600">
          {description}
        </p>
      )}
      {children}
    </section>
  );
}
