import seedCatalog from "features/catalog/mocks/seedCatalog";
import seedSlots from "features/delivery/mocks/seedSlots";
import seedOrders from "./seedOrders";

/**
 * Baut den kompletten frischen Demo-Datenbestand (SPEC §12).
 * Wird von main.jsx in das domänenfreie demoDb injiziert.
 * @returns {{catalogItems: Object[], slots: Object[], orders: Object[], orderSeq: number}}
 */
export default function buildDemoSeed() {
  const now = new Date();
  const catalogItems = seedCatalog();
  const { slots, eveningSlotId, pastSlot } = seedSlots(now);
  const fallbackSlotId = slots[0]?.id ?? null;
  const orders = seedOrders({
    now,
    catalogItems,
    eveningSlotId: eveningSlotId ?? fallbackSlotId,
    pastSlot,
  });
  return { catalogItems, slots, orders, orderSeq: orders.length };
}
