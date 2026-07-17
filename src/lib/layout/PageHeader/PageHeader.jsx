export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="mb-6 sm:mb-8">
      {eyebrow && (
        <p className="mb-1.5 text-[13.5px] font-semibold uppercase tracking-[0.12em] text-brand">
          {eyebrow}
        </p>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="font-display text-[30px] font-extrabold leading-[1.1] tracking-[-0.01em] text-ink">
          {title}
        </h1>
        {actions}
      </div>
      {description && (
        <p className="mt-1.5 max-w-prose text-[15.5px] text-muted">
          {description}
        </p>
      )}
    </header>
  );
}
