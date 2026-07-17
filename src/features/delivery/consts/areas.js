/**
 * Liefergebiet nach SPEC R2: PLZ → Ort + Gebiet.
 * Jede andere PLZ ist (noch) nicht belieferbar.
 */

/** Copy C7 — Hinweis bei PLZ außerhalb des Liefergebiets. */
export const OUTSIDE_DELIVERY_AREA_MESSAGE =
  "Diese Adresse liegt noch außerhalb unseres Liefergebiets (Günzburg, Leipheim, Bubesheim, Kötz, Ichenhausen). Schreiben Sie uns gern per WhatsApp — wir melden uns, sobald wir Ihren Ort beliefern.";
export const DELIVERY_AREAS = [
  { zip: "89312", city: "Günzburg", area: "stadt", note: "inkl. Ortsteile" },
  { zip: "89340", city: "Leipheim", area: "umland" },
  { zip: "89347", city: "Bubesheim", area: "umland" },
  { zip: "89359", city: "Kötz", area: "umland" },
  { zip: "89335", city: "Ichenhausen", area: "umland" },
];

/**
 * @param {string} zip
 * @returns {{zip:string, city:string, area:'stadt'|'umland'}|null}
 */
export function findDeliveryArea(zip) {
  return (
    DELIVERY_AREAS.find((entry) => entry.zip === String(zip).trim()) ?? null
  );
}

/**
 * @param {string} zip
 * @returns {boolean}
 */
export function isDeliverableZip(zip) {
  return findDeliveryArea(zip) !== null;
}
