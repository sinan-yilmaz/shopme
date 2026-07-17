import {
  baseBookedCount,
  generateSlotRange,
  reconstructSlotById,
} from "features/delivery/services/slotRules";

/**
 * Hält den Datenbestand beim Laden konsistent (SPEC §6): Die Zeitfenster
 * werden relativ zu „heute" neu erzeugt; bestehende Buchungszähler bleiben
 * erhalten, neue Tage bekommen die deterministische Grundbelegung, und
 * Fenster, auf die Bestellungen zeigen, verschwinden nie (Archiv).
 * Idempotent — mehrfache Aufrufe ändern nichts mehr.
 *
 * @param {Object} db
 * @returns {Object}
 */
export default function refreshDemoDb(db) {
  const now = new Date();
  const existingById = new Map(db.slots.map((slot) => [slot.id, slot]));

  const ordersPerSlot = new Map();
  for (const order of db.orders) {
    if (order.status === "storniert") continue;
    ordersPerSlot.set(order.slotId, (ordersPerSlot.get(order.slotId) ?? 0) + 1);
  }

  const nextSlots = generateSlotRange(now).map((slot) => {
    const existing = existingById.get(slot.id);
    const base = existing ? existing.bookedCount : baseBookedCount(slot.id);
    return {
      ...slot,
      bookedCount: Math.max(base, ordersPerSlot.get(slot.id) ?? 0),
    };
  });

  const rangeIds = new Set(nextSlots.map((slot) => slot.id));
  for (const slotId of ordersPerSlot.keys()) {
    if (rangeIds.has(slotId)) continue;
    const archived = existingById.get(slotId) ?? reconstructSlotById(slotId);
    if (archived) nextSlots.push({ ...archived });
  }

  return { ...db, slots: nextSlots };
}
