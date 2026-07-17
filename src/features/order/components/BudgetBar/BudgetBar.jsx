import { formatCents } from "common/services/money";

const WARN_THRESHOLD = 0.9;

/**
 * Budget-Fortschritt im Einkaufsmodus (SPEC §9.2, HANDOFF §6): 10-px-Track,
 * Verlauf brand-hell → brand, ab 90 % brand → warn plus Hinweis (C11).
 * Zählt nur erfasste Preise.
 */
export default function BudgetBar({ budgetCents, spentCents }) {
  const ratio = budgetCents > 0 ? spentCents / budgetCents : 0;
  const isWarning = ratio >= WARN_THRESHOLD;
  const isOver = spentCents > budgetCents;
  const remaining = budgetCents - spentCents;
  const percent = Math.min(100, Math.round(ratio * 100));

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm font-semibold">
        <span className="text-neutral-700">
          Erfasst:{" "}
          <span className="tabular-nums text-ink">
            {formatCents(spentCents)}
          </span>
        </span>
        <span className="text-muted">
          Budget <span className="tabular-nums">{formatCents(budgetCents)}</span>{" "}
          · frei{" "}
          <span className="tabular-nums">
            {formatCents(Math.max(0, remaining))}
          </span>
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Budget-Verbrauch"
        aria-valuemin={0}
        aria-valuemax={budgetCents}
        aria-valuenow={Math.min(spentCents, budgetCents)}
        aria-valuetext={`${formatCents(spentCents)} von ${formatCents(budgetCents)}`}
        className="mt-[7px] h-2.5 overflow-hidden rounded-full bg-field"
      >
        <div
          className="h-full rounded-full transition-[width,background] duration-[400ms] ease-out"
          style={{
            width: `${percent}%`,
            background: isWarning
              ? "linear-gradient(90deg, #1E5C43, #9A6B1F)"
              : "linear-gradient(90deg, #2E7D5B, #1E5C43)",
          }}
        />
      </div>
      <p aria-live="polite" className="mt-1.5 min-h-5 text-sm font-semibold">
        {isOver && (
          <span className="text-warn">
            Budget überschritten — {formatCents(spentCents - budgetCents)}{" "}
            darüber.
          </span>
        )}
        {!isOver && isWarning && (
          <span className="text-warn">
            Budget fast erreicht — nur noch {formatCents(remaining)} frei.
          </span>
        )}
      </p>
    </div>
  );
}
