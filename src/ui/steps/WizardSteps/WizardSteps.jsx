import clsx from "clsx";

/**
 * Fortschrittsanzeige des Bestell-Wizards (HANDOFF 2.6): Desktop mit
 * Kreisen + Labels + Verbindungsbalken, mobil (<760 px) „Schritt X von 4 ·
 * Label" plus vier Punkte (aktiver Punkt als 22-px-Pille). Bereits besuchte
 * Schritte sind klickbar (SPEC §8).
 *
 * @param {{steps: {number: number, label: string}[], currentStep: number,
 *   onStepClick: (step: number) => void}} props
 */
export default function WizardSteps({ steps, currentStep, onStepClick }) {
  const current = steps.find((step) => step.number === currentStep);

  return (
    <nav aria-label="Bestellschritte" className="mb-6 sm:mb-8">
      {/* Mobil: kompakte Zeile + Punkte */}
      <div className="flex items-center justify-between gap-3 md:hidden">
        <span className="text-[15px] font-semibold text-brand-deep">
          Schritt {currentStep} von {steps.length} · {current?.label}
        </span>
        <span className="flex gap-1.5" aria-hidden="true">
          {steps.map((step) => {
            const isDone = step.number < currentStep;
            const isCurrent = step.number === currentStep;
            return (
              <span
                key={step.number}
                className={clsx(
                  "h-2 rounded-full transition-all duration-200 ease-out",
                  isCurrent ? "w-[22px]" : "w-2",
                  isDone || isCurrent ? "bg-brand" : "bg-line-strong",
                )}
              />
            );
          })}
        </span>
      </div>

      {/* Desktop: Kreise + Labels + Balken */}
      <ol className="hidden items-center gap-2.5 md:flex">
        {steps.map((step, index) => {
          const isDone = step.number < currentStep;
          const isCurrent = step.number === currentStep;

          return (
            <li key={step.number} className="contents">
              <span className="flex flex-none items-center gap-2.5">
                <button
                  type="button"
                  onClick={isDone ? () => onStepClick(step.number) : undefined}
                  disabled={!isDone}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`Schritt ${step.number}: ${step.label}${isDone ? " (erledigt)" : ""}`}
                  className={clsx(
                    "inline-flex size-[38px] items-center justify-center rounded-full text-base font-bold transition-colors duration-[180ms] ease-out",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                    isDone && "cursor-pointer bg-brand text-white hover:bg-brand-deep",
                    isCurrent &&
                      "bg-brand text-white shadow-[0_0_0_4px_#E7F1EA]",
                    !isDone && !isCurrent && "bg-field text-muted",
                  )}
                >
                  {isDone ? "✓" : step.number}
                </button>
                <span
                  className={clsx(
                    "whitespace-nowrap text-[13.5px]",
                    isCurrent
                      ? "font-semibold text-brand-deep"
                      : "font-medium text-muted",
                  )}
                >
                  {step.label}
                </span>
              </span>
              {index < steps.length - 1 && (
                <span
                  className={clsx(
                    "h-[3px] flex-1 rounded-sm transition-colors duration-[180ms] ease-out",
                    step.number < currentStep ? "bg-brand" : "bg-line-strong",
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
