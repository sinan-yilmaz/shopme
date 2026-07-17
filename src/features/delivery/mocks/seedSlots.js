import {
  baseBookedCount,
  generateSlotRange,
  generateSlotsForDate,
  isSlotExpired,
} from "../services/slotRules";

/**
 * Seed-Belegung nach SPEC §12.2: nächstes verfügbares Abendfenster 6 gebucht
 * („Nur noch 2 Plätze"), erstes Samstagsfenster ausgebucht (8), übrige 0–2.
 *
 * @param {Date} now
 * @returns {{slots: Object[], eveningSlotId: string|null, pastSlot: Object|null}}
 */
export default function seedSlots(now) {
  const slots = generateSlotRange(now).map((slot) => ({
    ...slot,
    bookedCount: baseBookedCount(slot.id),
  }));

  const evening = slots.find(
    (slot) => slot.id.endsWith("_abend") && !isSlotExpired(slot, now),
  );
  if (evening) evening.bookedCount = 6;

  const saturday = slots.find((slot) => slot.id.endsWith("_am"));
  if (saturday) saturday.bookedCount = saturday.capacity;

  const pastSlot = findPastSlot(now);
  if (pastSlot) slots.push(pastSlot);

  return { slots, eveningSlotId: evening?.id ?? null, pastSlot };
}

/**
 * Jüngstes vergangenes Fenster (für die gelieferte Seed-Bestellung GZ-26-0004).
 * Geht von gestern rückwärts, bis ein Tag Fenster hat (Sonntage überspringen).
 * @param {Date} now
 * @returns {Object|null}
 */
function findPastSlot(now) {
  for (let offset = 1; offset <= 3; offset += 1) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - offset,
    );
    const daySlots = generateSlotsForDate(date);
    if (daySlots.length > 0) {
      const last = daySlots[daySlots.length - 1];
      return { ...last, bookedCount: 5 };
    }
  }
  return null;
}
