/**
 * Deterministischer Listen-Parser (SPEC §8.1.1) — kein LLM, keine Netzwerkaufrufe.
 *
 * 1. Split an Zeilenumbrüchen, `,` und `;`
 * 2. Segmente trimmen, führende Aufzählungszeichen entfernen (-, *, •, –, "1.", "2)")
 * 3. Mengen-Präfix erkennen: "2x Milch", "3 Paprika"
 * 4. Rest lowercase-normalisiert (Umlaute erhalten) gegen den Katalog matchen:
 *    exakter Name > exaktes Keyword > includes; bei Mehrdeutigkeit erster
 *    Treffer nach Katalogreihenfolge
 * 5. Kein Treffer → Freitext-Item (catalogItemId: null)
 */

const BULLET_PATTERN = /^(?:[-*•–—]+|\d+[.)])\s*/;
const QUANTITY_PATTERN = /^(\d+)\s*[x×]?\s+(.+)$/;
/**
 * In der includes-Stufe darf ein Katalogwort nur dann als Teilstring des
 * eingegebenen Texts zählen, wenn es mindestens so lang ist — sonst machen
 * Kurz-Keywords wie „ei" aus „Eimer" einen Eier-Treffer.
 */
const MIN_CANDIDATE_LENGTH_IN_QUERY = 4;

/** Lowercase-Normalisierung, Umlaute äöüß bleiben erhalten. */
const normalize = (text) => text.toLowerCase().trim();

/**
 * @param {string} text
 * @param {import('features/catalog/types/CatalogItem').CatalogItem[]} catalogItems
 * @returns {Array<{catalogItemId: string|null, label: string, quantity: number,
 *   unit: string, bio: boolean, mustHave: boolean, note: string}>} OrderItem-Rohlinge
 */
export default function parseShoppingList(text, catalogItems) {
  return String(text ?? "")
    .split(/[\n\r,;]+/)
    .map((segment) => parseSegment(segment, catalogItems))
    .filter(Boolean);
}

function parseSegment(rawSegment, catalogItems) {
  const withoutBullet = rawSegment.trim().replace(BULLET_PATTERN, "");

  let quantity = 1;
  let label = withoutBullet;
  const quantityMatch = withoutBullet.match(QUANTITY_PATTERN);
  if (quantityMatch) {
    quantity = Number.parseInt(quantityMatch[1], 10);
    label = quantityMatch[2].trim();
  }

  if (!label) return null;

  const match = matchCatalogItem(label, catalogItems);
  if (match) {
    return {
      catalogItemId: match.id,
      label: match.name,
      quantity,
      unit: match.units[0],
      bio: false,
      mustHave: false,
      note: "",
    };
  }

  return {
    catalogItemId: null,
    label,
    quantity,
    unit: "Stück",
    bio: false,
    mustHave: false,
    note: "",
  };
}

/**
 * Exakter Name > exaktes Keyword > includes-Treffer (Name oder Keyword als
 * Teilstring in beide Richtungen); je Stufe erster Treffer in Katalogreihenfolge.
 */
function matchCatalogItem(label, catalogItems) {
  const query = normalize(label);

  const exactName = catalogItems.find((item) => normalize(item.name) === query);
  if (exactName) return exactName;

  const exactKeyword = catalogItems.find((item) =>
    item.keywords.some((keyword) => normalize(keyword) === query),
  );
  if (exactKeyword) return exactKeyword;

  const includesMatch = (candidate) => {
    if (candidate.includes(query)) return true;
    return (
      candidate.length >= MIN_CANDIDATE_LENGTH_IN_QUERY &&
      query.includes(candidate)
    );
  };

  return (
    catalogItems.find(
      (item) =>
        includesMatch(normalize(item.name)) ||
        item.keywords.some((keyword) => includesMatch(normalize(keyword))),
    ) ?? null
  );
}
