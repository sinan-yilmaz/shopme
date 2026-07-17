import { describe, expect, it } from "vitest";
import {
  fromDateKey,
  generateSlotRange,
  generateSlotsForDate,
  isSlotBookable,
  isSlotExpired,
  isSlotFull,
  reconstructSlotById,
  remainingCapacity,
  toDateKey,
} from "./slotRules";

// Fixe Referenztage: 2026-07-18 = Samstag, 2026-07-19 = Sonntag, 2026-07-20 = Montag
const saturday = new Date(2026, 6, 18);
const sunday = new Date(2026, 6, 19);
const monday = new Date(2026, 6, 20);

describe("generateSlotsForDate (R5)", () => {
  it("Mo–Fr: ein Abendfenster 17:30–20:30 mit Cutoff 14:00 am selben Tag", () => {
    const slots = generateSlotsForDate(monday);
    expect(slots).toHaveLength(1);
    expect(slots[0]).toMatchObject({
      id: "2026-07-20_abend",
      date: "2026-07-20",
      label: "17:30–20:30 Uhr",
      start: "17:30",
      end: "20:30",
      capacity: 8,
      bookedCount: 0,
    });
    expect(new Date(slots[0].cutoffAt)).toEqual(new Date(2026, 6, 20, 14, 0));
  });

  it("Sa: zwei Fenster mit Cutoff Freitag 20:00", () => {
    const slots = generateSlotsForDate(saturday);
    expect(slots.map((slot) => slot.id)).toEqual([
      "2026-07-18_am",
      "2026-07-18_pm",
    ]);
    expect(slots[0].label).toBe("10:00–13:00 Uhr");
    expect(slots[1].label).toBe("14:00–17:00 Uhr");
    const fridayCutoff = new Date(2026, 6, 17, 20, 0);
    expect(new Date(slots[0].cutoffAt)).toEqual(fridayCutoff);
    expect(new Date(slots[1].cutoffAt)).toEqual(fridayCutoff);
  });

  it("So: keine Fenster", () => {
    expect(generateSlotsForDate(sunday)).toEqual([]);
  });
});

describe("generateSlotRange", () => {
  it("erzeugt Fenster für 7 Kalendertage (Do–Mi → 7 Fenster)", () => {
    const thursday = new Date(2026, 6, 16);
    const slots = generateSlotRange(thursday);
    // Do, Fr je 1 · Sa 2 · So 0 · Mo, Di, Mi je 1
    expect(slots).toHaveLength(7);
    expect(slots[0].date).toBe("2026-07-16");
    expect(slots.at(-1).date).toBe("2026-07-22");
  });
});

describe("Cutoff & Kapazität (R5, T6/T7)", () => {
  const slot = generateSlotsForDate(monday)[0];

  it("nach 14:00 ist das heutige Abendfenster nicht mehr wählbar (T7)", () => {
    expect(isSlotExpired(slot, new Date(2026, 6, 20, 13, 59))).toBe(false);
    expect(isSlotExpired(slot, new Date(2026, 6, 20, 14, 0))).toBe(true);
    expect(isSlotBookable(slot, new Date(2026, 6, 20, 14, 0))).toBe(false);
    expect(isSlotBookable(slot, new Date(2026, 6, 20, 13, 59))).toBe(true);
  });

  it("volle Fenster sind nicht buchbar (T6)", () => {
    const full = { ...slot, bookedCount: 8 };
    expect(isSlotFull(full)).toBe(true);
    expect(isSlotBookable(full, new Date(2026, 6, 20, 10, 0))).toBe(false);
    expect(remainingCapacity(full)).toBe(0);
    const almostFull = { ...slot, bookedCount: 6 };
    expect(remainingCapacity(almostFull)).toBe(2);
    expect(isSlotBookable(almostFull, new Date(2026, 6, 20, 10, 0))).toBe(true);
  });
});

describe("Datums-Helfer", () => {
  it("toDateKey/fromDateKey sind invers zueinander (lokale Zeit)", () => {
    expect(toDateKey(saturday)).toBe("2026-07-18");
    expect(toDateKey(fromDateKey("2026-07-18"))).toBe("2026-07-18");
  });

  it("reconstructSlotById stellt vergangene Fenster wieder her", () => {
    const slot = reconstructSlotById("2026-07-18_am");
    expect(slot).toMatchObject({
      id: "2026-07-18_am",
      label: "10:00–13:00 Uhr",
    });
    expect(reconstructSlotById("unsinn")).toBeNull();
    expect(reconstructSlotById("2026-07-19_abend")).toBeNull();
  });
});
