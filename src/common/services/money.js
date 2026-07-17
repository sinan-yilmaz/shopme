/**
 * Geldbeträge sind app-weit Integer in Cent (SPEC R11).
 * Formatierung ausschließlich hier, immer de-DE.
 */

const euroFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

/**
 * @param {number} cents
 * @returns {string} z. B. 9290 → "92,90 €"
 */
export function formatCents(cents) {
  return euroFormatter.format(cents / 100);
}

/**
 * Formatiert Cent als Eingabewert ohne Währungszeichen, z. B. 6743 → "67,43".
 * Integer-Arithmetik, kein Float-Rechnen auf Eurobeträgen.
 * @param {number} cents
 * @returns {string}
 */
export function formatCentsPlain(cents) {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const euros = Math.trunc(abs / 100);
  const rest = abs % 100;
  return `${sign}${euros},${String(rest).padStart(2, "0")}`;
}

/**
 * Parst eine deutsche Euro-Eingabe ("67,43", "67.43", "67") zu Cent.
 * @param {string} input
 * @returns {number|null} Cent-Integer oder null bei ungültiger Eingabe
 */
export function parseEuroToCents(input) {
  if (typeof input !== "string") return null;
  const cleaned = input.replace(/[€\s]/g, "");
  const match = cleaned.match(/^(\d+)(?:[.,](\d{1,2}))?$/);
  if (!match) return null;
  const euros = Number.parseInt(match[1], 10);
  const cents = match[2] ? Number.parseInt(match[2].padEnd(2, "0"), 10) : 0;
  return euros * 100 + cents;
}
