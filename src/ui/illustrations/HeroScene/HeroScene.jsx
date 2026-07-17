import { BRAND_NAME } from "common/consts/brand";
import { formatCents } from "common/services/money";
import { prepaidCents } from "features/order/services/calculateFees";
import DeliveryCar from "../DeliveryCar";

/**
 * Home-Hero (HANDOFF §5): Punktraster, driftende Wolken, Karten-Duo
 * (Liste −2°, Bon +1.5° mit Zackenkante), gestrichelte Straße und PKW mit
 * driveIn + Idle-bob. Layout und Werte 1:1 aus dem Prototyp.
 */
const PREVIEW_ITEMS = [
  { emoji: "🥛", label: "Milch", amount: "2 Liter", mustHave: true },
  { emoji: "🥚", label: "Eier", amount: "1 Pack.", mustHave: true },
  { emoji: "💧", label: "Mineralwasser", amount: "1 Kiste", mustHave: false },
  { emoji: "🍫", label: "Schokolade", amount: "2 Stück", mustHave: false },
];

export default function HeroScene() {
  return (
    <div
      aria-hidden="true"
      className="relative min-h-[470px] overflow-hidden rounded-2xl bg-[#F3F0E9]"
      style={{
        backgroundImage:
          "radial-gradient(rgb(30 92 67 / 0.10) 1.2px, transparent 1.2px)",
        backgroundSize: "22px 22px",
      }}
    >
      <svg
        viewBox="0 0 480 90"
        className="absolute left-0 top-3.5 w-full"
        aria-hidden="true"
      >
        <g style={{ animation: "cloudDrift 26s ease-in-out infinite" }}>
          <ellipse cx="92" cy="40" rx="36" ry="12" fill="#FFFFFF" opacity=".8" />
          <ellipse cx="122" cy="31" rx="24" ry="10" fill="#FFFFFF" opacity=".8" />
        </g>
        <g style={{ animation: "cloudDrift 34s ease-in-out -9s infinite" }}>
          <ellipse cx="368" cy="30" rx="42" ry="13" fill="#FFFFFF" opacity=".65" />
        </g>
      </svg>

      {/* Einkaufslisten-Karte, leicht rotiert, floaty */}
      <div
        className="absolute left-1/2 top-[46px] w-[min(75%,270px)]"
        style={{
          transform: "translateX(-58%) rotate(-2deg)",
          animation: "floaty 7s ease-in-out infinite",
        }}
      >
        <div className="rounded-2xl border border-line bg-white px-4 py-4 shadow-float">
          <p className="mb-2.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-muted">
            Ihre Einkaufsliste
          </p>
          <div className="flex flex-col gap-2 text-[15px]">
            {PREVIEW_ITEMS.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-brand-soft text-[15px]">
                  {item.emoji}
                </span>
                <span className="flex-1 truncate font-semibold">
                  {item.label}
                </span>
                {item.mustHave && <span className="text-accent">★</span>}
                <span className="whitespace-nowrap text-[13.5px] text-muted">
                  {item.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bon-Karte mit Zackenkante */}
      <div
        className="absolute right-[9%] top-[252px] w-44"
        style={{
          transform: "rotate(1.5deg)",
          animation: "floaty2 8s ease-in-out -2s infinite",
        }}
      >
        <div className="rounded-t-xl bg-white px-3.5 pb-2 pt-3 shadow-float">
          <p className="text-center font-display text-[11px] font-bold uppercase tracking-[0.28em] text-muted">
            {BRAND_NAME}
          </p>
          <div className="mt-2 flex justify-between border-t border-dashed border-line-strong pt-1.5 text-[12.5px] text-muted">
            <span>Budget</span>
            <span className="whitespace-nowrap font-semibold tabular-nums text-ink">
              {formatCents(8000)}
            </span>
          </div>
          <div className="flex justify-between text-[12.5px] text-muted">
            <span>Obergrenze</span>
            <span className="whitespace-nowrap font-bold tabular-nums text-brand-deep">
              {formatCents(prepaidCents({ budgetCents: 8000, area: "stadt" }))}
            </span>
          </div>
        </div>
        <div className="receipt-zigzag" />
      </div>

      {/* Straße + PKW */}
      <div className="absolute inset-x-0 bottom-0 h-24">
        <div className="absolute inset-x-0 bottom-[26px] h-1 rounded-sm bg-[#DCE8DF]" />
        <div
          className="absolute bottom-[33px] left-[6%] w-[170px]"
          style={{ animation: "driveIn 1.6s cubic-bezier(.22,.9,.3,1) both" }}
        >
          <div style={{ animation: "bob 4.5s ease-in-out 1.8s infinite" }}>
            <DeliveryCar width={170} spinWheels />
          </div>
        </div>
      </div>
    </div>
  );
}
