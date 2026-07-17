import clsx from "clsx";
import { Check } from "lucide-react";
import { formatDateTime } from "common/services/dateFormat";
import { TimelineScene } from "ui/illustrations";
import {
  ORDER_STATUS_DESCRIPTIONS,
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABELS,
} from "../../consts/orderStatus";

/**
 * Horizontale Status-Timeline (HANDOFF 2.5): Straße mit 5 Stationen
 * (Zentren bei 10/30/50/70/90 %), Liefer-PKW fährt zur aktuellen Station,
 * Häkchen ploppen, aktive Station pulsiert (nicht bei „geliefert"),
 * bei „geliefert" winkt eine Figur vor dem Haus.
 */
export default function OrderStatusTimeline({ order }) {
  const currentIndex = ORDER_STATUS_FLOW.indexOf(order.status);
  const progressPercent =
    currentIndex >= 0 ? (currentIndex / (ORDER_STATUS_FLOW.length - 1)) * 100 : 0;
  const currentTimestamp = order.statusTimestamps?.[order.status];

  return (
    <div>
      <div className="relative">
        <TimelineScene
          statusIndex={Math.max(0, currentIndex)}
          stationCount={ORDER_STATUS_FLOW.length}
        />

        {/* Straße mit Fortschrittslinie */}
        <div className="relative mx-[10%] h-1 rounded-sm bg-[#EDE7DA]">
          <div
            className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-sm bg-brand"
            style={{
              width: `${progressPercent}%`,
              transition: "width 900ms cubic-bezier(.45,0,.2,1)",
            }}
          />
        </div>

        {/* Stationen */}
        <ol className="-mt-[17px] flex">
          {ORDER_STATUS_FLOW.map((status, index) => {
            const isReached = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const isDelivered = index === ORDER_STATUS_FLOW.length - 1;

            return (
              <li
                key={status}
                className="flex min-w-0 flex-1 flex-col items-center gap-[7px]"
                aria-current={isCurrent ? "step" : undefined}
              >
                <span
                  className={clsx(
                    "relative z-[2] inline-flex size-[30px] items-center justify-center rounded-full transition-colors duration-300 ease-out",
                    isReached
                      ? "bg-brand"
                      : "border-[2.5px] border-[#DCD6C9] bg-white",
                    isCurrent && !isDelivered && "animate-pulse-soft",
                  )}
                  aria-hidden="true"
                >
                  {isReached && (
                    <Check
                      className="size-[15px] animate-plop text-white"
                      strokeWidth={3}
                    />
                  )}
                </span>
                <span
                  className={clsx(
                    "px-0.5 text-center text-[11.5px] leading-[1.25] sm:text-[13px]",
                    isCurrent
                      ? "font-bold text-ink"
                      : isReached
                        ? "font-medium text-ink"
                        : "font-medium text-neutral-500",
                  )}
                >
                  {ORDER_STATUS_LABELS[status]}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <p aria-live="polite" className="mt-4 px-1 text-center text-[15.5px] text-muted">
        {currentIndex >= 0 && ORDER_STATUS_DESCRIPTIONS[order.status]}
        {currentTimestamp && (
          <span className="mt-0.5 block text-sm text-neutral-500">
            {formatDateTime(currentTimestamp)}
          </span>
        )}
      </p>
    </div>
  );
}
