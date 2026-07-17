import { describe, expect, it } from "vitest";
import seedCatalog from "features/catalog/mocks/seedCatalog";
import parseShoppingList from "./parseShoppingList";

const catalog = seedCatalog();

describe("parseShoppingList (SPEC §8.1.1)", () => {
  it("parst das T2-Beispiel korrekt", () => {
    const text =
      "2x Milch, Eier\n- Nudeln\n3 Paprika\nKlopapier\nKatzenstreu Marke XY";
    const items = parseShoppingList(text, catalog);

    expect(items).toHaveLength(6);
    expect(items[0]).toMatchObject({
      catalogItemId: "milch",
      label: "Milch",
      quantity: 2,
    });
    expect(items[1]).toMatchObject({
      catalogItemId: "eier",
      label: "Eier",
      quantity: 1,
    });
    expect(items[2]).toMatchObject({
      catalogItemId: "nudeln",
      label: "Nudeln",
      quantity: 1,
    });
    expect(items[3]).toMatchObject({
      catalogItemId: "paprika",
      label: "Paprika",
      quantity: 3,
    });
    expect(items[4]).toMatchObject({
      catalogItemId: "toilettenpapier",
      label: "Toilettenpapier",
    });
    expect(items[5]).toMatchObject({
      catalogItemId: null,
      label: "Katzenstreu Marke XY",
      quantity: 1,
    });
  });

  it("entfernt führende Aufzählungszeichen aller Varianten", () => {
    const text = "- Nudeln\n* Eier\n• Brot\n– Milch\n1. Salat\n2) Gurke";
    const items = parseShoppingList(text, catalog);
    expect(items.map((item) => item.catalogItemId)).toEqual([
      "nudeln",
      "eier",
      "brot",
      "milch",
      "salat",
      "gurke",
    ]);
  });

  it("erkennt Mengen-Präfixe mit und ohne x", () => {
    const items = parseShoppingList("2x Milch\n3 Paprika\n4 × Eier", catalog);
    expect(items.map((item) => item.quantity)).toEqual([2, 3, 4]);
  });

  it("verwirft leere Segmente", () => {
    const items = parseShoppingList("Milch,,;\n\n  \n;Eier", catalog);
    expect(items).toHaveLength(2);
  });

  it("matcht case- und segmentweise, Umlaute bleiben erhalten", () => {
    const items = parseShoppingList("EIER; öl", catalog);
    expect(items[0].catalogItemId).toBe("eier");
    // „öl" ist exaktes Keyword von Olivenöl (erster Treffer in Katalogreihenfolge)
    expect(items[1].catalogItemId).toBe("olivenoel");
  });

  it("bevorzugt exakten Namen vor Keyword und includes", () => {
    // „Vollkornbrot" ist eigener Artikel und darf nicht auf „Brot" fallen
    const items = parseShoppingList("Vollkornbrot\nMilch", catalog);
    expect(items[0].catalogItemId).toBe("vollkornbrot");
    // „Milch" trifft exakt Milch, nicht Buttermilch (includes)
    expect(items[1].catalogItemId).toBe("milch");
  });

  it("findet includes-Treffer, wenn kein exakter Treffer existiert", () => {
    const items = parseShoppingList("Bratkartoffeln", catalog);
    expect(items[0].catalogItemId).toBe("kartoffeln");
  });

  it("lässt Kurz-Keywords nicht als Teilstring in Freitext zuschlagen", () => {
    // „ei" ⊂ „Eimer" darf keinen Eier-Treffer erzeugen
    const items = parseShoppingList("Eimer blau", catalog);
    expect(items[0]).toMatchObject({
      catalogItemId: null,
      label: "Eimer blau",
    });
  });

  it('übernimmt Default-Unit des Katalogartikels, Freitext bekommt „Stück"', () => {
    const items = parseShoppingList("Milch\nIrgendwas Exotisches", catalog);
    expect(items[0].unit).toBe("Liter");
    expect(items[1]).toMatchObject({ catalogItemId: null, unit: "Stück" });
  });
});
