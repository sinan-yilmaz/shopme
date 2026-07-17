/**
 * Datenmodell nach SPEC §4. Alle Geldbeträge sind Integer in Cent.
 *
 * @typedef {Object} OrderItem
 * @property {string} id
 * @property {string|null} catalogItemId   null = Freitext-Artikel
 * @property {string} label
 * @property {number} quantity             > 0
 * @property {string} unit
 * @property {boolean} bio
 * @property {boolean} mustHave            Pflicht-Artikel
 * @property {string} note                 z. B. "reife Avocados"
 * @property {number} position             Prio: 0 = wichtigster Rang, Reihenfolge der Liste
 * @property {'offen'|'gekauft'|'ersetzt'|'uebersprungen'} status
 * @property {number|null} priceCents      vom Fahrer optional erfasst
 * @property {string} substitutionNote
 */

/** @typedef {'eingegangen'|'bestaetigt'|'im_einkauf'|'unterwegs'|'geliefert'|'storniert'} OrderStatus */

/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {string} code                 "GZ-26-0001"
 * @property {string} createdAt            ISO
 * @property {OrderStatus} status
 * @property {{name:string, phone:string, street:string, zip:string, city:string,
 *             doorInfo:string, area:'stadt'|'umland'}} customer
 * @property {'rewe'|'lidl'|'aldi'|'dm'|'egal'} market
 * @property {boolean} allowSecondMarket
 * @property {string} slotId
 * @property {number} budgetCents
 * @property {OrderItem[]} items
 * @property {'vorkasse'|'tuer'} paymentMode
 * @property {number|null} prepaidCents    nur bei Vorkasse (R6)
 * @property {number|null} receiptCents    Kassenbon-Summe nach Einkauf
 * @property {{deliveryCents:number, serviceCents:number}|null} finalFees
 * @property {boolean} ageCheckConfirmed
 * @property {Object<string, string>} statusTimestamps  Ergänzung zur Spec: ISO-Zeitstempel
 *   je erreichtem Status — versorgt die Status-Timeline („Zeitstempel soweit vorhanden").
 */

export {};
