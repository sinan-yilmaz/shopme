/**
 * Einkaufsreihenfolge nach SPEC R4: zuerst alle Pflicht-Artikel in
 * Listenreihenfolge, danach alle übrigen in Listenreihenfolge.
 * Pure function — das Original-Array bleibt unverändert.
 *
 * @param {import('../types/Order').OrderItem[]} items
 * @returns {import('../types/Order').OrderItem[]}
 */
export default function sortItemsForShopping(items) {
  const byPosition = [...items].sort((a, b) => a.position - b.position);
  return [
    ...byPosition.filter((item) => item.mustHave),
    ...byPosition.filter((item) => !item.mustHave),
  ];
}
