/** Kategorien in Anzeige-Reihenfolge (SPEC §12.1). */
export const CATALOG_CATEGORIES = [
  { id: "obst-gemuese", label: "Obst & Gemüse" },
  { id: "brot-backwaren", label: "Brot & Backwaren" },
  { id: "milchprodukte-eier", label: "Milchprodukte & Eier" },
  { id: "fleisch-wurst", label: "Fleisch & Wurst" },
  { id: "tiefkuehl", label: "Tiefkühl" },
  { id: "vorrat-nudeln", label: "Vorrat & Nudeln" },
  { id: "getraenke", label: "Getränke" },
  { id: "suesses-snacks", label: "Süßes & Snacks" },
  { id: "drogerie-haushalt", label: "Drogerie & Haushalt" },
  { id: "baby-kind", label: "Baby & Kind" },
];

/**
 * @param {string} categoryId
 * @returns {{id:string, label:string}|null}
 */
export function findCategory(categoryId) {
  return (
    CATALOG_CATEGORIES.find((category) => category.id === categoryId) ?? null
  );
}
