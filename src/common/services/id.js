/** Zufällige ID für Datensätze (Items, Bestellungen). */
export function createId() {
  return crypto.randomUUID();
}

/**
 * Fortlaufender Bestellcode pro Demo-Datenbestand (SPEC R9).
 * @param {number} seq z. B. 5
 * @returns {string} "GZ-26-0005"
 */
export function formatOrderCode(seq) {
  return `GZ-26-${String(seq).padStart(4, "0")}`;
}
