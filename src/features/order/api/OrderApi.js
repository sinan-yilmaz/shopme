import { delay, readDb, writeDb } from "common/services/demoDb";
import { createId, formatOrderCode } from "common/services/id";
import { findDeliveryArea } from "features/delivery/consts/areas";
import {
  isSlotBookable,
  slotSortKey,
} from "features/delivery/services/slotRules";
import { MIN_BUDGET_CENTS } from "../consts/fees";
import { canTransition, ORDER_ITEM_STATUS } from "../consts/orderStatus";
import { calculateSettlement, prepaidCents } from "../services/calculateFees";
import hasAgeRestrictedItems from "../services/ageRestriction";
import AgeCheckRequiredError from "../errors/AgeCheckRequiredError";
import InvalidStatusTransitionError from "../errors/InvalidStatusTransitionError";
import OrderNotFoundError from "../errors/OrderNotFoundError";
import OrderValidationError from "../errors/OrderValidationError";

const MARKETS = ["rewe", "lidl", "aldi", "dm", "egal"];
const PAYMENT_MODES = ["vorkasse", "tuer"];

/** Bestellungen werden für die UI um das zugehörige Zeitfenster angereichert. */
function attachSlot(order, db) {
  return {
    ...order,
    slot: db.slots.find((slot) => slot.id === order.slotId) ?? null,
  };
}

function requireOrder(db, orderId) {
  const order = db.orders.find((entry) => entry.id === orderId);
  if (!order) throw new OrderNotFoundError(orderId);
  return order;
}

const OrderApi = {
  /**
   * Validiert R2/R3/R5, bucht das Zeitfenster (+1), vergibt den nächsten
   * Bestellcode und legt die Bestellung mit Status „eingegangen" an.
   * @param {Object} draft
   * @returns {Promise<import('../types/Order').Order>}
   */
  async create(draft) {
    await delay();
    const db = readDb();

    if (!draft?.items?.length) {
      throw new OrderValidationError("Die Einkaufsliste ist leer.");
    }
    if (
      !Number.isInteger(draft.budgetCents) ||
      draft.budgetCents < MIN_BUDGET_CENTS
    ) {
      throw new OrderValidationError("Der Mindestbestellwert liegt bei 30 €.");
    }
    const areaEntry = findDeliveryArea(draft.customer?.zip ?? "");
    if (!areaEntry) {
      throw new OrderValidationError(
        "Diese Adresse liegt außerhalb unseres Liefergebiets.",
      );
    }
    if (!MARKETS.includes(draft.market)) {
      throw new OrderValidationError("Bitte wählen Sie einen Markt aus.");
    }
    if (!PAYMENT_MODES.includes(draft.paymentMode)) {
      throw new OrderValidationError("Bitte wählen Sie eine Zahlungsart aus.");
    }
    const slot = db.slots.find((entry) => entry.id === draft.slotId);
    if (!slot || !isSlotBookable(slot, new Date())) {
      throw new OrderValidationError(
        "Das gewählte Zeitfenster ist leider nicht mehr verfügbar. Bitte wählen Sie ein anderes.",
      );
    }

    slot.bookedCount += 1;
    const seq = db.orderSeq + 1;
    const nowIso = new Date().toISOString();
    const order = {
      id: createId(),
      code: formatOrderCode(seq),
      createdAt: nowIso,
      status: "eingegangen",
      customer: {
        name: draft.customer.name.trim(),
        phone: draft.customer.phone.trim(),
        street: draft.customer.street.trim(),
        zip: areaEntry.zip,
        city: areaEntry.city,
        doorInfo: (draft.customer.doorInfo ?? "").trim(),
        area: areaEntry.area,
      },
      market: draft.market,
      allowSecondMarket: Boolean(draft.allowSecondMarket),
      slotId: slot.id,
      budgetCents: draft.budgetCents,
      items: draft.items.map((item, index) => ({
        id: item.id ?? createId(),
        catalogItemId: item.catalogItemId ?? null,
        label: item.label,
        quantity: item.quantity,
        unit: item.unit,
        bio: Boolean(item.bio),
        mustHave: Boolean(item.mustHave),
        note: item.note ?? "",
        position: index,
        status: "offen",
        priceCents: null,
        substitutionNote: "",
      })),
      paymentMode: draft.paymentMode,
      prepaidCents:
        draft.paymentMode === "vorkasse"
          ? prepaidCents({
              budgetCents: draft.budgetCents,
              area: areaEntry.area,
            })
          : null,
      receiptCents: null,
      finalFees: null,
      ageCheckConfirmed: false,
      statusTimestamps: { eingegangen: nowIso },
    };

    db.orders.push(order);
    db.orderSeq = seq;
    writeDb(db);
    return attachSlot(order, db);
  },

  /**
   * @param {{code: string}} params
   * @returns {Promise<import('../types/Order').Order>}
   */
  async getByCode({ code }) {
    await delay();
    const db = readDb();
    const normalized = String(code ?? "")
      .trim()
      .toUpperCase();
    const order = db.orders.find(
      (entry) => entry.code.toUpperCase() === normalized,
    );
    if (!order) throw new OrderNotFoundError(code);
    return attachSlot(order, db);
  },

  /**
   * @param {{id: string}} params
   * @returns {Promise<import('../types/Order').Order>}
   */
  async getById({ id }) {
    await delay();
    const db = readDb();
    return attachSlot(requireOrder(db, id), db);
  },

  /**
   * Alle Bestellungen für die Fahrer-Übersicht, sortiert nach Fenster (Datum
   * + Start), innerhalb eines Fensters nach Eingang.
   * @returns {Promise<import('../types/Order').Order[]>}
   */
  async getAll() {
    await delay();
    const db = readDb();
    return db.orders
      .map((order) => attachSlot(order, db))
      .sort((a, b) => {
        const keyA = a.slot ? slotSortKey(a.slot) : "9999-99-99";
        const keyB = b.slot ? slotSortKey(b.slot) : "9999-99-99";
        if (keyA !== keyB) return keyA.localeCompare(keyB);
        return a.createdAt.localeCompare(b.createdAt);
      });
  },

  /**
   * Aktualisiert Status/Preis/Ersatznotiz einer Position — nur im Einkaufsmodus.
   * @param {{orderId: string, itemId: string, patch: Object}} params
   * @returns {Promise<import('../types/Order').Order>}
   */
  async updateItem({ orderId, itemId, patch }) {
    await delay();
    const db = readDb();
    const order = requireOrder(db, orderId);
    if (order.status !== "im_einkauf") {
      throw new OrderValidationError(
        "Positionen lassen sich nur im Einkaufsmodus bearbeiten.",
      );
    }
    const item = order.items.find((entry) => entry.id === itemId);
    if (!item) throw new OrderNotFoundError(itemId);

    if (patch.status !== undefined) {
      if (!Object.values(ORDER_ITEM_STATUS).includes(patch.status)) {
        throw new OrderValidationError(
          `Unbekannter Positionsstatus „${patch.status}".`,
        );
      }
      item.status = patch.status;
    }
    if (patch.priceCents !== undefined) {
      if (
        patch.priceCents !== null &&
        (!Number.isInteger(patch.priceCents) || patch.priceCents < 0)
      ) {
        throw new OrderValidationError(
          "Der Preis muss ein Betrag in Cent sein.",
        );
      }
      item.priceCents = patch.priceCents;
    }
    if (patch.substitutionNote !== undefined) {
      item.substitutionNote = String(patch.substitutionNote);
    }

    writeDb(db);
    return attachSlot(order, db);
  },

  /**
   * Schließt den Einkauf ab (SPEC R7): setzt die Bon-Summe, berechnet die
   * finalen Gebühren und stellt den Status auf „unterwegs".
   * @param {{orderId: string, receiptCents: number}} params
   * @returns {Promise<import('../types/Order').Order>}
   */
  async completeShopping({ orderId, receiptCents }) {
    await delay();
    const db = readDb();
    const order = requireOrder(db, orderId);
    if (order.status !== "im_einkauf") {
      throw new InvalidStatusTransitionError(order.status, "unterwegs");
    }
    if (!Number.isInteger(receiptCents) || receiptCents <= 0) {
      throw new OrderValidationError("Bitte geben Sie die Kassenbon-Summe an.");
    }
    if (order.items.some((item) => item.status === "offen")) {
      throw new OrderValidationError(
        "Es sind noch offene Positionen auf der Liste.",
      );
    }

    const settlement = calculateSettlement({
      receiptCents,
      area: order.customer.area,
      prepaidCents: order.prepaidCents,
    });
    order.receiptCents = receiptCents;
    order.finalFees = {
      deliveryCents: settlement.deliveryCents,
      serviceCents: settlement.serviceCents,
    };
    order.status = "unterwegs";
    order.statusTimestamps = {
      ...order.statusTimestamps,
      unterwegs: new Date().toISOString(),
    };

    writeDb(db);
    return attachSlot(order, db);
  },

  /**
   * Statuswechsel entlang der Statusmaschine; bei „geliefert" greift die
   * Altersprüfung (SPEC R8), falls die Bestellung 🔞-Artikel enthält.
   * @param {{orderId: string, status: import('../types/Order').OrderStatus,
   *   ageCheckConfirmed?: boolean}} params
   * @returns {Promise<import('../types/Order').Order>}
   */
  async updateStatus({ orderId, status, ageCheckConfirmed }) {
    await delay();
    const db = readDb();
    const order = requireOrder(db, orderId);
    if (!canTransition(order.status, status)) {
      throw new InvalidStatusTransitionError(order.status, status);
    }
    if (typeof ageCheckConfirmed === "boolean") {
      order.ageCheckConfirmed = ageCheckConfirmed;
    }
    if (
      status === "geliefert" &&
      hasAgeRestrictedItems(order, db.catalogItems) &&
      !order.ageCheckConfirmed
    ) {
      throw new AgeCheckRequiredError();
    }

    order.status = status;
    order.statusTimestamps = {
      ...order.statusTimestamps,
      [status]: new Date().toISOString(),
    };

    writeDb(db);
    return attachSlot(order, db);
  },
};

export default OrderApi;
