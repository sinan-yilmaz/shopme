import { describe, expect, it } from "vitest";
import {
  calculateSettlement,
  deliveryFeeCents,
  prepaidCents,
  serviceFeeCents,
} from "./calculateFees";

describe("serviceFeeCents (R1)", () => {
  it("rundet 10 % kaufmännisch", () => {
    expect(serviceFeeCents(6743)).toBe(674);
    expect(serviceFeeCents(8000)).toBe(800);
  });

  it("klemmt auf das Minimum von 3 €", () => {
    expect(serviceFeeCents(1000)).toBe(300);
    expect(serviceFeeCents(2999)).toBe(300);
    expect(serviceFeeCents(3000)).toBe(300);
  });

  it("klemmt auf das Maximum von 12 €", () => {
    expect(serviceFeeCents(15000)).toBe(1200);
    expect(serviceFeeCents(12000)).toBe(1200);
    expect(serviceFeeCents(11999)).toBe(1200);
  });
});

describe("deliveryFeeCents (R1)", () => {
  it("Stadt 4,90 €, Umland 6,90 €", () => {
    expect(deliveryFeeCents("stadt")).toBe(490);
    expect(deliveryFeeCents("umland")).toBe(690);
  });
});

describe("prepaidCents (R6)", () => {
  it("Beispiel aus der Spec: Budget 80 €, Stadt → 92,90 €", () => {
    expect(prepaidCents({ budgetCents: 8000, area: "stadt" })).toBe(9290);
  });

  it("Umland nutzt die höhere Liefergebühr", () => {
    expect(prepaidCents({ budgetCents: 8000, area: "umland" })).toBe(9490);
  });

  it("kleines Budget: Servicegebühr-Minimum greift", () => {
    // 3000 + 490 + max(300, 300) = 3790
    expect(prepaidCents({ budgetCents: 3000, area: "stadt" })).toBe(3790);
  });
});

describe("calculateSettlement (R7)", () => {
  it("Beispiel aus der Spec: Bon 67,43 € → Service 6,74 €, Total 79,07 €, Gutschrift 13,83 €", () => {
    const result = calculateSettlement({
      receiptCents: 6743,
      area: "stadt",
      prepaidCents: 9290,
    });
    expect(result).toEqual({
      deliveryCents: 490,
      serviceCents: 674,
      totalCents: 7907,
      creditCents: 1383,
    });
  });

  it("Bon über Budget → negative Gutschrift (Nachzahlung an der Tür)", () => {
    const result = calculateSettlement({
      receiptCents: 9000,
      area: "stadt",
      prepaidCents: 9290,
    });
    expect(result.totalCents).toBe(9000 + 490 + 900);
    expect(result.creditCents).toBe(9290 - 10390);
  });

  it("ohne Vorkasse gibt es keine Gutschrift", () => {
    const result = calculateSettlement({
      receiptCents: 6120,
      area: "stadt",
      prepaidCents: null,
    });
    expect(result).toEqual({
      deliveryCents: 490,
      serviceCents: 612,
      totalCents: 7222,
      creditCents: null,
    });
  });
});
