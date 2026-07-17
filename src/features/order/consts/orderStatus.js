/** @typedef {import('../types/Order').OrderStatus} OrderStatus */

export const ORDER_STATUS = {
  eingegangen: "eingegangen",
  bestaetigt: "bestaetigt",
  imEinkauf: "im_einkauf",
  unterwegs: "unterwegs",
  geliefert: "geliefert",
  storniert: "storniert",
};

/** Gültige Status-Übergänge (SPEC §4) — alles andere lehnt OrderApi ab. */
export const ORDER_STATUS_TRANSITIONS = {
  eingegangen: ["bestaetigt", "storniert"],
  bestaetigt: ["im_einkauf", "storniert"],
  im_einkauf: ["unterwegs"],
  unterwegs: ["geliefert"],
  geliefert: [],
  storniert: [],
};

/** Die 5 Stationen der Status-Timeline (ohne storniert). */
export const ORDER_STATUS_FLOW = [
  "eingegangen",
  "bestaetigt",
  "im_einkauf",
  "unterwegs",
  "geliefert",
];

export const ORDER_STATUS_LABELS = {
  eingegangen: "Eingegangen",
  bestaetigt: "Bestätigt",
  im_einkauf: "Im Einkauf",
  unterwegs: "Unterwegs",
  geliefert: "Geliefert",
  storniert: "Storniert",
};

/** Kundengerichtete Beschreibungen für die Status-Timeline. */
export const ORDER_STATUS_DESCRIPTIONS = {
  eingegangen: "Ihre Bestellung ist bei uns angekommen.",
  bestaetigt: "Wir haben Ihre Bestellung fest eingeplant.",
  im_einkauf: "Wir sind gerade für Sie im Markt unterwegs.",
  unterwegs: "Ihr Einkauf ist auf dem Weg zu Ihnen.",
  geliefert: "Zugestellt — vielen Dank für Ihre Bestellung!",
};

/** Positionsstatus im Einkaufsmodus. */
export const ORDER_ITEM_STATUS = {
  offen: "offen",
  gekauft: "gekauft",
  ersetzt: "ersetzt",
  uebersprungen: "uebersprungen",
};

export const ORDER_ITEM_STATUS_LABELS = {
  offen: "Offen",
  gekauft: "Gekauft",
  ersetzt: "Ersetzt",
  uebersprungen: "Übersprungen",
};

/**
 * @param {OrderStatus} from
 * @param {OrderStatus} to
 * @returns {boolean}
 */
export function canTransition(from, to) {
  return ORDER_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}
