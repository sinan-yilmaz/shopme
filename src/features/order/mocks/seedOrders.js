import { fromDateKey } from "features/delivery/services/slotRules";
import { calculateSettlement, prepaidCents } from "../services/calculateFees";

/**
 * Die 4 Demo-Bestellungen für die Fahrer-Ansicht (SPEC §12.3).
 * Zeitstempel sind relativ zu „jetzt", damit die Demo immer frisch wirkt.
 *
 * @param {{now: Date, catalogItems: Object[], eveningSlotId: string, pastSlot: Object|null}} params
 * @returns {import('../types/Order').Order[]}
 */
export default function seedOrders({
  now,
  catalogItems,
  eveningSlotId,
  pastSlot,
}) {
  const catalogById = new Map(catalogItems.map((entry) => [entry.id, entry]));
  let itemSeq = 0;

  const makeItem = (catalogId, position, overrides = {}) => {
    const catalogItem = catalogById.get(catalogId);
    if (!catalogItem)
      throw new Error(
        `Seed verweist auf unbekannten Katalogartikel „${catalogId}".`,
      );
    itemSeq += 1;
    return {
      id: `seed-item-${itemSeq}`,
      catalogItemId: catalogItem.id,
      label: catalogItem.name,
      quantity: 1,
      unit: catalogItem.units[0],
      bio: false,
      mustHave: false,
      note: "",
      position,
      status: "offen",
      priceCents: null,
      substitutionNote: "",
      ...overrides,
    };
  };

  const freeTextItem = (label, position, overrides = {}) => {
    itemSeq += 1;
    return {
      id: `seed-item-${itemSeq}`,
      catalogItemId: null,
      label,
      quantity: 1,
      unit: "Stück",
      bio: false,
      mustHave: false,
      note: "",
      position,
      status: "offen",
      priceCents: null,
      substitutionNote: "",
      ...overrides,
    };
  };

  const minutesAgo = (minutes) =>
    new Date(now.getTime() - minutes * 60_000).toISOString();
  const onDayAt = (dateKey, time) => {
    const day = fromDateKey(dateKey);
    const [hours, minutes] = time.split(":").map(Number);
    day.setHours(hours, minutes, 0, 0);
    return day.toISOString();
  };
  const shiftMinutes = (iso, minutes) =>
    new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();

  // GZ-26-0001 — eingegangen · Vorkasse · Budget 80 € · Stadt · 12 Positionen
  const order1 = {
    id: "seed-order-1",
    code: "GZ-26-0001",
    createdAt: minutesAgo(120),
    status: "eingegangen",
    customer: {
      name: "Maria Huber",
      phone: "+49 151 2345671",
      street: "Ulmer Str. 12",
      zip: "89312",
      city: "Günzburg",
      doorInfo: "EG links — bitte 2× klingeln",
      area: "stadt",
    },
    market: "rewe",
    allowSecondMarket: true,
    slotId: eveningSlotId,
    budgetCents: 8000,
    items: [
      makeItem("milch", 0, { mustHave: true, quantity: 2, unit: "Liter" }),
      makeItem("eier", 1),
      makeItem("brot", 2, { note: "geschnitten, bitte" }),
      makeItem("windeln", 3, { mustHave: true, note: "Größe 4" }),
      makeItem("aepfel", 4, { bio: true }),
      makeItem("bananen", 5),
      makeItem("tomaten", 6),
      makeItem("mineralwasser-kiste", 7, { mustHave: true }),
      makeItem("nudeln", 8, { quantity: 2 }),
      makeItem("schokolade", 9, { quantity: 2 }),
      makeItem("butter", 10),
      freeTextItem("Katzenstreu", 11),
    ],
    paymentMode: "vorkasse",
    prepaidCents: prepaidCents({ budgetCents: 8000, area: "stadt" }),
    receiptCents: null,
    finalFees: null,
    ageCheckConfirmed: false,
    statusTimestamps: { eingegangen: minutesAgo(120) },
  };

  // GZ-26-0002 — bestätigt · Zahlung an der Tür · Budget 60 € · Leipheim · Bier (🔞)
  const order2 = {
    id: "seed-order-2",
    code: "GZ-26-0002",
    createdAt: minutesAgo(300),
    status: "bestaetigt",
    customer: {
      name: "Karl Brenner",
      phone: "+49 160 5556672",
      street: "Bahnhofstraße 3",
      zip: "89340",
      city: "Leipheim",
      doorInfo: "2. OG, Aufzug vorhanden",
      area: "umland",
    },
    market: "lidl",
    allowSecondMarket: false,
    slotId: eveningSlotId,
    budgetCents: 6000,
    items: [
      makeItem("kartoffeln", 0, { mustHave: true, quantity: 2, unit: "kg" }),
      makeItem("hackfleisch", 1, { mustHave: true, quantity: 500, unit: "g" }),
      makeItem("zwiebeln", 2),
      makeItem("bier", 3, { unit: "Kiste" }),
      makeItem("broetchen", 4, { quantity: 8 }),
      makeItem("kaese-scheiben", 5),
      makeItem("joghurt", 6, { quantity: 4 }),
      makeItem("chips", 7),
    ],
    paymentMode: "tuer",
    prepaidCents: null,
    receiptCents: null,
    finalFees: null,
    ageCheckConfirmed: false,
    statusTimestamps: {
      eingegangen: minutesAgo(300),
      bestaetigt: minutesAgo(270),
    },
  };

  // GZ-26-0003 — im Einkauf · Vorkasse · Budget 50 € · 3 gekauft, 1 ersetzt, 2 offen
  const order3 = {
    id: "seed-order-3",
    code: "GZ-26-0003",
    createdAt: minutesAgo(240),
    status: "im_einkauf",
    customer: {
      name: "Anneliese Vogt",
      phone: "+49 170 8892233",
      street: "Augsburger Straße 41",
      zip: "89312",
      city: "Günzburg",
      doorInfo: 'Hinterhaus, Klingel „Vogt"',
      area: "stadt",
    },
    market: "rewe",
    allowSecondMarket: true,
    slotId: eveningSlotId,
    budgetCents: 5000,
    items: [
      makeItem("salat", 0, { status: "gekauft", priceCents: 129 }),
      makeItem("gurke", 1, { status: "gekauft", priceCents: 89 }),
      makeItem("tomaten", 2, {
        status: "ersetzt",
        substitutionNote: "Cherrytomaten statt Strauchtomaten",
      }),
      makeItem("haehnchenbrust", 3, {
        status: "gekauft",
        priceCents: 649,
        quantity: 600,
        unit: "g",
      }),
      makeItem("reis", 4),
      makeItem("muesli", 5, { bio: true }),
    ],
    paymentMode: "vorkasse",
    prepaidCents: prepaidCents({ budgetCents: 5000, area: "stadt" }),
    receiptCents: null,
    finalFees: null,
    ageCheckConfirmed: false,
    statusTimestamps: {
      eingegangen: minutesAgo(240),
      bestaetigt: minutesAgo(180),
      im_einkauf: minutesAgo(25),
    },
  };

  // GZ-26-0004 — geliefert (gestriges Fenster) · Tür · Bon 61,20 €
  const pastDate = pastSlot?.date ?? null;
  const receipt4 = 6120;
  const settlement4 = calculateSettlement({
    receiptCents: receipt4,
    area: "stadt",
    prepaidCents: null,
  });
  const delivered4 = pastDate
    ? shiftMinutes(onDayAt(pastDate, pastSlot.end), -20)
    : minutesAgo(1500);
  const order4 = {
    id: "seed-order-4",
    code: "GZ-26-0004",
    createdAt: pastDate ? onDayAt(pastDate, "09:00") : minutesAgo(1800),
    status: "geliefert",
    customer: {
      name: "Thomas Steiner",
      phone: "+49 152 3319884",
      street: "Dillinger Straße 8",
      zip: "89312",
      city: "Günzburg",
      doorInfo: "",
      area: "stadt",
    },
    market: "egal",
    allowSecondMarket: true,
    slotId: pastSlot?.id ?? eveningSlotId,
    budgetCents: 7000,
    items: [
      makeItem("brot", 0, { status: "gekauft", priceCents: 289 }),
      makeItem("milch", 1, {
        status: "gekauft",
        priceCents: 238,
        quantity: 2,
        unit: "Liter",
      }),
      makeItem("eier", 2, { status: "gekauft", priceCents: 329 }),
      makeItem("haehnchenbrust", 3, { status: "gekauft", priceCents: 1099 }),
      makeItem("kaffee", 4, { status: "gekauft", priceCents: 799 }),
      makeItem("tiefkuehlpizza", 5, {
        status: "gekauft",
        priceCents: 897,
        quantity: 3,
      }),
      makeItem("mineralwasser-kiste", 6, {
        status: "gekauft",
        priceCents: 999,
      }),
      makeItem("aepfel", 7, { status: "gekauft", priceCents: 472 }),
      makeItem("toilettenpapier", 8, { status: "gekauft", priceCents: 998 }),
    ],
    paymentMode: "tuer",
    prepaidCents: null,
    receiptCents: receipt4,
    finalFees: {
      deliveryCents: settlement4.deliveryCents,
      serviceCents: settlement4.serviceCents,
    },
    ageCheckConfirmed: false,
    statusTimestamps: pastDate
      ? {
          eingegangen: onDayAt(pastDate, "09:00"),
          bestaetigt: onDayAt(pastDate, "10:30"),
          im_einkauf: shiftMinutes(onDayAt(pastDate, pastSlot.start), -60),
          unterwegs: shiftMinutes(onDayAt(pastDate, pastSlot.start), 10),
          geliefert: delivered4,
        }
      : { eingegangen: minutesAgo(1800), geliefert: delivered4 },
  };

  return [order1, order2, order3, order4];
}
