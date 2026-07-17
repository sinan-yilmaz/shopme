/** Kategorien, die dm führt (Drogerie-Sortiment ohne frische Lebensmittel). */
const NON_FOOD_CATEGORY_IDS = new Set(["drogerie-haushalt", "baby-kind"]);

/**
 * Prüft, ob die Liste Artikel enthält, die dm nicht führt (HANDOFF 2.3):
 * true, wenn ein Item Freitext ist (`catalogItemId == null`) oder seine
 * Kategorie NICHT in {drogerie-haushalt, baby-kind} liegt.
 *
 * @param {{catalogItemId: string|null}[]} items Listen-Items des Entwurfs
 * @param {{id: string, categoryId: string}[]} catalogItems Katalog zur Auflösung
 * @returns {boolean}
 */
export default function hasFreshFoodItems(items, catalogItems) {
  const categoryById = new Map(
    (catalogItems ?? []).map((entry) => [entry.id, entry.categoryId]),
  );
  return (items ?? []).some((item) => {
    if (item.catalogItemId == null) return true;
    const categoryId = categoryById.get(item.catalogItemId);
    return !NON_FOOD_CATEGORY_IDS.has(categoryId);
  });
}
