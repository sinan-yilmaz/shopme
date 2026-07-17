/**
 * Katalogsuche: case- und umlaut-tolerant (SPEC §8.1).
 * „öl" findet „Öl", „huehnereier" findet „Hühnereier" — und umgekehrt.
 */

/**
 * Lowercase + Umlaut-Folding (ä→ae, ö→oe, ü→ue, ß→ss).
 * @param {string} text
 * @returns {string}
 */
export function foldSearchText(text) {
  return text
    .toLowerCase()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .trim();
}

/**
 * @param {import('../types/CatalogItem').CatalogItem} item
 * @param {string} foldedQuery bereits durch foldSearchText normalisiert
 * @returns {boolean}
 */
function matchesItem(item, foldedQuery) {
  if (foldSearchText(item.name).includes(foldedQuery)) return true;
  return item.keywords.some((keyword) =>
    foldSearchText(keyword).includes(foldedQuery),
  );
}

/**
 * Treffer in Katalogreihenfolge; leere Eingabe → keine Treffer.
 * @param {import('../types/CatalogItem').CatalogItem[]} items
 * @param {string} query
 * @returns {import('../types/CatalogItem').CatalogItem[]}
 */
export function searchCatalogItems(items, query) {
  const folded = foldSearchText(query ?? "");
  if (!folded) return [];
  return items.filter((item) => matchesItem(item, folded));
}
