import { describe, expect, it } from "vitest";
import sortItemsForShopping from "./sortItemsForShopping";

const item = (id, position, mustHave = false) => ({ id, position, mustHave });

describe("sortItemsForShopping (R4)", () => {
  it("stellt Pflicht-Artikel in Listenreihenfolge nach vorn, danach die übrigen (T10)", () => {
    const items = [
      item("a", 0),
      item("b", 1, true),
      item("c", 2),
      item("d", 3, true),
      item("e", 4),
    ];
    expect(sortItemsForShopping(items).map((entry) => entry.id)).toEqual([
      "b",
      "d",
      "a",
      "c",
      "e",
    ]);
  });

  it("sortiert unabhängig von der Array-Reihenfolge nach position", () => {
    const items = [
      item("e", 4),
      item("b", 1, true),
      item("a", 0),
      item("d", 3, true),
      item("c", 2),
    ];
    expect(sortItemsForShopping(items).map((entry) => entry.id)).toEqual([
      "b",
      "d",
      "a",
      "c",
      "e",
    ]);
  });

  it("lässt das Original-Array unverändert (pure)", () => {
    const items = [item("a", 0), item("b", 1, true)];
    const copy = [...items];
    sortItemsForShopping(items);
    expect(items).toEqual(copy);
  });

  it("funktioniert ohne Pflicht-Artikel und mit leerer Liste", () => {
    expect(sortItemsForShopping([]).length).toBe(0);
    const items = [item("a", 1), item("b", 0)];
    expect(sortItemsForShopping(items).map((entry) => entry.id)).toEqual([
      "b",
      "a",
    ]);
  });
});
