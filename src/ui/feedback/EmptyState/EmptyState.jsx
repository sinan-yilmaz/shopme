/**
 * Gestalteter leerer Zustand: Icon + Titel + Hilfetext + optionale Aktion.
 * `icon` ist eine lucide-Icon-Komponente.
 */
export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center px-4 py-12 text-center">
      {Icon && (
        <span className="mb-4 inline-flex size-14 items-center justify-center rounded-full bg-brand-soft">
          <Icon className="size-7 text-brand-deep" aria-hidden="true" />
        </span>
      )}
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-base text-neutral-600">
          {description}
        </p>
      )}
      {action && <div className="mt-5 w-full max-w-xs">{action}</div>}
    </div>
  );
}
