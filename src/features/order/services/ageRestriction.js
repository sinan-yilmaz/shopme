/**
 * Prüft, ob eine Bestellung mindestens einen alterbeschränkten Artikel
 * enthält (SPEC R8). Freitext-Artikel können nicht geprüft werden.
 *
 * @param {import('../types/Order').Order} order
 * @param {import('features/catalog/types/CatalogItem').CatalogItem[]} catalogItems
 * @returns {boolean}
 */
export default function hasAgeRestrictedItems(order, catalogItems) {
  const restrictedIds = new Set(
    catalogItems.filter((item) => item.ageRestricted).map((item) => item.id),
  );
  return order.items.some(
    (item) =>
      item.catalogItemId !== null && restrictedIds.has(item.catalogItemId),
  );
}
