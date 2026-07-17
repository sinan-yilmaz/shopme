import { useId } from "react";
import clsx from "clsx";
import { MIN_BUDGET_CENTS } from "../../consts/fees";

const QUICK_CHOICES_EUROS = [40, 60, 80, 100, 120];
const STEP_EUROS = 5;

const BUDGET_HELP =
  "Zur Orientierung: Ein typischer Wocheneinkauf für 2 Personen liegt bei 60–90 €, für eine Familie bei 90–130 €.";
const BUDGET_ERROR = "Der Mindestbestellwert liegt bei 30 €.";

/**
 * Budget-Eingabe (SPEC §8.2, HANDOFF §6 Schritt 2): zentrierte Zahl in
 * Bricolage 40 px, flankiert von −/+ (52 px), Schnellwahl-Chips darunter,
 * Fehler C5a in danger. Wert intern in Cent (R11), Eingabe in ganzen Euro.
 */
export default function BudgetInput({ valueCents, onChangeCents }) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const helpId = `${inputId}-help`;

  const euros = valueCents == null ? "" : String(Math.round(valueCents / 100));
  const showError = valueCents != null && valueCents < MIN_BUDGET_CENTS;

  const handleInputChange = (event) => {
    const raw = event.target.value.replace(/\D/g, "");
    onChangeCents(raw === "" ? null : Number.parseInt(raw, 10) * 100);
  };

  const handleStep = (direction) => {
    const currentEuros = valueCents == null ? 0 : Math.round(valueCents / 100);
    const next = Math.max(0, currentEuros + direction * STEP_EUROS);
    onChangeCents(next * 100);
  };

  const stepperClasses = clsx(
    "size-[52px] shrink-0 rounded-xl border-[1.5px] border-line-strong bg-white text-2xl font-semibold leading-none text-brand-deep",
    "transition-all duration-150 ease-out hover:border-brand hover:bg-brand-50",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    "disabled:cursor-not-allowed disabled:opacity-40",
  );

  return (
    <div>
      <label htmlFor={inputId} className="block text-base font-semibold text-ink">
        Ihr Budget{" "}
        <span className="font-medium text-muted">
          — Obergrenze für den Warenwert
        </span>
        <span className="text-brand" aria-hidden="true">
          {" "}
          *
        </span>
      </label>

      <div className="mt-[18px] flex items-center justify-center gap-[18px]">
        <button
          type="button"
          onClick={() => handleStep(-1)}
          disabled={valueCents != null && valueCents <= 0}
          aria-label={`${STEP_EUROS} Euro weniger`}
          className={stepperClasses}
        >
          −
        </button>
        <span className="inline-flex items-baseline gap-1.5">
          <input
            id={inputId}
            type="text"
            inputMode="numeric"
            value={euros}
            onChange={handleInputChange}
            placeholder="80"
            aria-invalid={showError ? "true" : undefined}
            aria-describedby={showError ? errorId : helpId}
            className={clsx(
              "w-24 border-0 border-b-2 bg-transparent pb-0.5 text-center font-display text-[40px] font-bold tabular-nums text-ink",
              "transition-colors duration-150 ease-out placeholder:font-normal placeholder:text-[#9AA79F]",
              "focus:outline-none",
              showError
                ? "border-danger"
                : "border-line-strong focus:border-brand",
            )}
          />
          <span
            className="font-display text-[26px] font-bold text-muted"
            aria-hidden="true"
          >
            €
          </span>
        </span>
        <button
          type="button"
          onClick={() => handleStep(1)}
          aria-label={`${STEP_EUROS} Euro mehr`}
          className={stepperClasses}
        >
          +
        </button>
      </div>

      <div
        className="mt-[18px] flex flex-wrap justify-center gap-2"
        role="group"
        aria-label="Budget-Schnellwahl"
      >
        {QUICK_CHOICES_EUROS.map((choice) => {
          const isActive = valueCents === choice * 100;
          return (
            <button
              key={choice}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChangeCents(choice * 100)}
              className={clsx(
                "h-[42px] shrink-0 rounded-full border-[1.5px] px-4 text-[15px] font-semibold tabular-nums transition-colors duration-[180ms] ease-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                isActive
                  ? "border-brand bg-brand text-white"
                  : "border-line-strong bg-white text-neutral-700 hover:border-brand hover:text-brand-deep",
              )}
            >
              {choice} €
            </button>
          );
        })}
      </div>

      {showError ? (
        <p
          id={errorId}
          className="mt-3.5 text-center text-[15px] font-semibold text-danger"
          role="alert"
        >
          {BUDGET_ERROR}
        </p>
      ) : (
        <p
          id={helpId}
          className="mt-3.5 text-center text-[14.5px] text-muted [text-wrap:pretty]"
        >
          {BUDGET_HELP}
        </p>
      )}
    </div>
  );
}
