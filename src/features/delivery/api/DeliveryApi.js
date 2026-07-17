import { delay, readDb } from "common/services/demoDb";
import { slotSortKey, toDateKey } from "../services/slotRules";

const DeliveryApi = {
  /**
   * Zeitfenster der nächsten 7 Kalendertage — inklusive voller und
   * abgelaufener Fenster (die UI zeigt sie deaktiviert).
   * @returns {Promise<import('../types/DeliverySlot').DeliverySlot[]>}
   */
  async getSlots() {
    await delay();
    const db = readDb();
    const todayKey = toDateKey(new Date());
    return db.slots
      .filter((slot) => slot.date >= todayKey)
      .sort((a, b) => slotSortKey(a).localeCompare(slotSortKey(b)));
  },
};

export default DeliveryApi;
