import {
  FEE_DELIVERY_CITY_CENTS,
  FEE_DELIVERY_SUBURB_CENTS,
  SERVICE_FEE_MAX_CENTS,
  SERVICE_FEE_MIN_CENTS,
  SERVICE_FEE_RATE,
} from "../consts/fees";

/**
 * Servicegebühr auf einen Betrag: clamp(round(x * 0.10), 300, 1200) — SPEC R1.
 * @param {number} amountCents
 * @returns {number}
 */
export function serviceFeeCents(amountCents) {
  const raw = Math.round(amountCents * SERVICE_FEE_RATE);
  return Math.min(Math.max(raw, SERVICE_FEE_MIN_CENTS), SERVICE_FEE_MAX_CENTS);
}

/**
 * Liefergebühr nach Gebiet — SPEC R1.
 * @param {'stadt'|'umland'} area
 * @returns {number}
 */
export function deliveryFeeCents(area) {
  return area === "stadt" ? FEE_DELIVERY_CITY_CENTS : FEE_DELIVERY_SUBURB_CENTS;
}

/**
 * Vorkasse-Betrag für Neukunden — SPEC R6.
 * Beispiel: Budget 80 €, Stadt → 8000 + 490 + 800 = 9290.
 * @param {{budgetCents: number, area: 'stadt'|'umland'}} params
 * @returns {number}
 */
export function prepaidCents({ budgetCents, area }) {
  return budgetCents + deliveryFeeCents(area) + serviceFeeCents(budgetCents);
}

/**
 * Abrechnung nach Bon-Eingabe — SPEC R7.
 * Beispiel: Bon 67,43 € (Stadt, prepaid 92,90 €) → Service 6,74 €,
 * Total 79,07 €, Gutschrift 13,83 €. Negative Gutschrift = Nachzahlung.
 * @param {{receiptCents: number, area: 'stadt'|'umland', prepaidCents: number|null}} params
 * @returns {{deliveryCents: number, serviceCents: number, totalCents: number, creditCents: number|null}}
 */
export function calculateSettlement({
  receiptCents,
  area,
  prepaidCents: prepaid,
}) {
  const deliveryCents = deliveryFeeCents(area);
  const serviceCents = serviceFeeCents(receiptCents);
  const totalCents = receiptCents + deliveryCents + serviceCents;
  const creditCents = prepaid == null ? null : prepaid - totalCents;
  return { deliveryCents, serviceCents, totalCents, creditCents };
}
