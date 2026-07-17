/**
 * Zeitfenster-Logik nach SPEC R5 — ausschließlich pure functions.
 *
 * Regeln: Mo–Fr ein Fenster 17:30–20:30 (Cutoff gleicher Tag 14:00),
 * Sa zwei Fenster 10:00–13:00 und 14:00–17:00 (Cutoff Freitag 20:00),
 * So keine Fenster. Kapazität je Fenster: 8.
 */

export const SLOT_CAPACITY = 8;
/** Ab so vielen Restplätzen (oder weniger) zeigt die UI „Nur noch X Plätze". */
export const LOW_REMAINING_THRESHOLD = 2;
/** Anzahl Kalendertage, für die Fenster erzeugt werden (heute + 6). */
export const SLOT_RANGE_DAYS = 7;

const pad2 = (value) => String(value).padStart(2, "0");

/**
 * Lokaler Kalendertag als Schlüssel, z. B. "2026-07-18" (keine UTC-Verschiebung).
 * @param {Date} date
 * @returns {string}
 */
export function toDateKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/**
 * @param {string} dateKey "2026-07-18"
 * @returns {Date} lokale Mitternacht des Tages
 */
export function fromDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function atTime(date, hours, minutes) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    minutes,
    0,
    0,
  );
}

function buildSlot({ date, suffix, start, end, cutoff }) {
  const dateKey = toDateKey(date);
  return {
    id: `${dateKey}_${suffix}`,
    date: dateKey,
    label: `${start}–${end} Uhr`,
    start,
    end,
    cutoffAt: cutoff.toISOString(),
    capacity: SLOT_CAPACITY,
    bookedCount: 0,
  };
}

/**
 * Alle Fenster eines Kalendertags (0–2 Stück, bookedCount 0).
 * @param {Date} date
 * @returns {import('../types/DeliverySlot').DeliverySlot[]}
 */
export function generateSlotsForDate(date) {
  const weekday = date.getDay();
  if (weekday === 0) return []; // Sonntag: keine Fenster
  if (weekday === 6) {
    const friday = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() - 1,
    );
    const cutoff = atTime(friday, 20, 0);
    return [
      buildSlot({ date, suffix: "am", start: "10:00", end: "13:00", cutoff }),
      buildSlot({ date, suffix: "pm", start: "14:00", end: "17:00", cutoff }),
    ];
  }
  return [
    buildSlot({
      date,
      suffix: "abend",
      start: "17:30",
      end: "20:30",
      cutoff: atTime(date, 14, 0),
    }),
  ];
}

/**
 * Fenster für `days` Kalendertage ab `from` (einschließlich).
 * @param {Date} from
 * @param {number} [days]
 * @returns {import('../types/DeliverySlot').DeliverySlot[]}
 */
export function generateSlotRange(from, days = SLOT_RANGE_DAYS) {
  const slots = [];
  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(
      from.getFullYear(),
      from.getMonth(),
      from.getDate() + offset,
    );
    slots.push(...generateSlotsForDate(date));
  }
  return slots;
}

/**
 * Rekonstruiert ein Fenster aus seiner ID (z. B. "2026-07-18_am"),
 * etwa für vergangene Fenster, auf die Bestellungen noch zeigen.
 * @param {string} slotId
 * @returns {import('../types/DeliverySlot').DeliverySlot|null}
 */
export function reconstructSlotById(slotId) {
  const [dateKey] = slotId.split("_");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey ?? "")) return null;
  return (
    generateSlotsForDate(fromDateKey(dateKey)).find(
      (slot) => slot.id === slotId,
    ) ?? null
  );
}

/**
 * Deterministische Grundbelegung 0–2 für Fenster ohne Seed-Vorgabe (SPEC §12.2).
 * @param {string} slotId
 * @returns {number}
 */
export function baseBookedCount(slotId) {
  let sum = 0;
  for (const char of slotId) sum += char.charCodeAt(0);
  return sum % 3;
}

/**
 * @param {import('../types/DeliverySlot').DeliverySlot} slot
 * @param {Date} now
 * @returns {boolean} Bestellschluss erreicht/überschritten?
 */
export function isSlotExpired(slot, now) {
  return now.getTime() >= new Date(slot.cutoffAt).getTime();
}

/**
 * @param {import('../types/DeliverySlot').DeliverySlot} slot
 * @returns {boolean}
 */
export function isSlotFull(slot) {
  return slot.bookedCount >= slot.capacity;
}

/**
 * Buchbar nur, wenn now < cutoffAt und bookedCount < capacity (SPEC R5).
 * @param {import('../types/DeliverySlot').DeliverySlot} slot
 * @param {Date} now
 * @returns {boolean}
 */
export function isSlotBookable(slot, now) {
  return !isSlotExpired(slot, now) && !isSlotFull(slot);
}

/**
 * @param {import('../types/DeliverySlot').DeliverySlot} slot
 * @returns {number}
 */
export function remainingCapacity(slot) {
  return Math.max(0, slot.capacity - slot.bookedCount);
}

/**
 * Sortierwert für Fenster: Datum + Startzeit.
 * @param {import('../types/DeliverySlot').DeliverySlot} slot
 * @returns {string}
 */
export function slotSortKey(slot) {
  return `${slot.date}T${slot.start}`;
}
