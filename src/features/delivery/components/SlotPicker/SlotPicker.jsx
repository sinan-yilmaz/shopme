import { useMemo, useState } from "react";
import clsx from "clsx";
import { formatDayShort } from "common/services/dateFormat";
import {
  isSlotBookable,
  isSlotExpired,
  isSlotFull,
  LOW_REMAINING_THRESHOLD,
  remainingCapacity,
  SLOT_RANGE_DAYS,
  toDateKey,
} from "../../services/slotRules";

/**
 * 7-Tage-Leiste mit Tag-Kacheln und den Fenstern des gewählten Tags als
 * Radio-Karten mit Restplatz-Badge (SPEC §8.3, R5; HANDOFF §6 Schritt 3):
 * aktiver Tag brand-gefüllt, Sonntag ausgegraut „keine Lieferung",
 * ausgebuchte/abgelaufene Karten sichtbar aber deaktiviert.
 */
export default function SlotPicker({ slots, selectedSlotId, onSelect }) {
  const now = new Date();

  const days = useMemo(() => {
    const list = [];
    for (let offset = 0; offset < SLOT_RANGE_DAYS; offset += 1) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + offset,
      );
      const key = toDateKey(date);
      list.push({
        key,
        date,
        isToday: offset === 0,
        slots: slots.filter((slot) => slot.date === key),
      });
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots]);

  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId) ?? null;
  const initialDay =
    selectedSlot?.date ??
    days.find((day) => day.slots.some((slot) => isSlotBookable(slot, now)))
      ?.key ??
    days[0]?.key;
  const [activeDayKey, setActiveDayKey] = useState(initialDay);

  const activeDay = days.find((day) => day.key === activeDayKey) ?? days[0];

  return (
    <div>
      <div
        className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 pb-2.5 sm:-mx-6 sm:px-6"
        role="group"
        aria-label="Liefertag wählen"
      >
        {days.map((day) => {
          const hasSlots = day.slots.length > 0;
          const isActive = day.key === activeDayKey;
          const [weekday, dateLabel] = formatDayShort(day.date).split(", ");
          return (
            <button
              key={day.key}
              type="button"
              disabled={!hasSlots}
              aria-pressed={isActive}
              onClick={() => setActiveDayKey(day.key)}
              className={clsx(
                "flex min-w-[86px] shrink-0 flex-col items-center gap-0.5 rounded-2xl border-[1.5px] px-3 py-2.5 transition-all duration-[180ms] ease-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                !hasSlots &&
                  "cursor-not-allowed border-line-strong bg-[#F1EEE7] text-[#A8A395] opacity-75",
                hasSlots &&
                  (isActive
                    ? "border-brand bg-brand text-white"
                    : "border-line-strong bg-white text-ink hover:border-brand"),
              )}
            >
              <span className="text-[15.5px] font-bold leading-snug">
                {day.isToday ? "Heute" : weekday}
              </span>
              <span
                className={clsx(
                  "text-[12.5px] font-medium leading-tight",
                  !hasSlots
                    ? "text-[#A8A395]"
                    : isActive
                      ? "text-[#CFE5D8]"
                      : "text-muted",
                )}
              >
                {hasSlots ? dateLabel : "keine Lieferung"}
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="radiogroup"
        aria-label="Lieferfenster wählen"
        className="mt-2 flex flex-col gap-2.5"
      >
        {activeDay?.slots.length === 0 && (
          <div className="rounded-2xl border border-line bg-neutral-50 px-4 py-4 text-base text-muted">
            Sonntags liefern wir nicht — wählen Sie gern einen anderen Tag.
          </div>
        )}
        {activeDay?.slots.map((slot) => {
          const expired = isSlotExpired(slot, now);
          const full = isSlotFull(slot);
          const bookable = !expired && !full;
          const remaining = remainingCapacity(slot);
          const isSelected = slot.id === selectedSlotId;

          return (
            <button
              key={slot.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={!bookable}
              onClick={() => onSelect(slot.id)}
              className={clsx(
                "flex w-full items-center gap-[13px] rounded-2xl border-[1.5px] px-4 py-[15px] text-left transition-all duration-[180ms] ease-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                !bookable && "cursor-not-allowed border-line bg-[#F1EEE7] opacity-80",
                bookable &&
                  (isSelected
                    ? "border-brand bg-brand-50 shadow-[0_0_0_3px_#E7F1EA]"
                    : "border-line bg-white hover:border-brand"),
              )}
            >
              <span
                aria-hidden="true"
                className={clsx(
                  "inline-flex size-[22px] shrink-0 rounded-full bg-white transition-all duration-[180ms] ease-out",
                  isSelected
                    ? "border-[7px] border-brand"
                    : "border-2 border-[#C9C2B4]",
                )}
              />
              <span className="flex-1">
                <span
                  className={clsx(
                    "block text-[17px] font-bold",
                    bookable ? "text-ink" : "text-neutral-500",
                  )}
                >
                  {slot.label}
                </span>
                <span className="block text-sm text-muted">
                  {formatDayShort(new Date(`${slot.date}T12:00:00`))}
                </span>
              </span>

              {expired ? (
                <span className="whitespace-nowrap text-[13.5px] font-medium text-neutral-500">
                  Bestellschluss vorbei
                </span>
              ) : full ? (
                <span className="whitespace-nowrap text-[13.5px] font-medium text-neutral-500">
                  Ausgebucht
                </span>
              ) : remaining <= LOW_REMAINING_THRESHOLD ? (
                <span className="whitespace-nowrap rounded-full bg-warn-bg px-2.5 py-1 text-[13.5px] font-semibold text-warn">
                  Nur noch {remaining} {remaining === 1 ? "Platz" : "Plätze"}
                </span>
              ) : (
                <span className="whitespace-nowrap rounded-full bg-brand-soft px-2.5 py-1 text-[13.5px] font-semibold text-brand">
                  Verfügbar
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
