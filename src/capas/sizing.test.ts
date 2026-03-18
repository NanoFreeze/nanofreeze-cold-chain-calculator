import { describe, it, expect } from "vitest";
import {
  CAPA_STRIP_LENGTH_CM,
  CAPA_PALLET_LENGTH_CM,
  stripsPerLayerForBoxLength,
  layersForSensitivity,
  capasInputSchema,
} from "./index.js";

describe("stripsPerLayerForBoxLength", () => {
  it("matches the one-pager cut guide (XS=15, S=45, M=105, L=120, pallet=360)", () => {
    expect(stripsPerLayerForBoxLength(15)).toBe(1);
    expect(stripsPerLayerForBoxLength(45)).toBe(3);
    expect(stripsPerLayerForBoxLength(105)).toBe(7); // the preset default
    expect(stripsPerLayerForBoxLength(120)).toBe(8);
    expect(stripsPerLayerForBoxLength(CAPA_PALLET_LENGTH_CM)).toBe(24);
  });

  it("rounds partial franjas up — a 100 cm box needs 7 franjas (105 cm)", () => {
    expect(stripsPerLayerForBoxLength(100)).toBe(7);
    expect(stripsPerLayerForBoxLength(16)).toBe(2);
  });

  it("floors at one whole franja for any positive length", () => {
    expect(stripsPerLayerForBoxLength(1)).toBe(1);
    expect(stripsPerLayerForBoxLength(CAPA_STRIP_LENGTH_CM - 0.01)).toBe(1);
  });

  it("yields 0 for empty / invalid lengths", () => {
    expect(stripsPerLayerForBoxLength(0)).toBe(0);
    expect(stripsPerLayerForBoxLength(-5)).toBe(0);
    expect(stripsPerLayerForBoxLength(Number.NaN)).toBe(0);
    expect(stripsPerLayerForBoxLength(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("layersForSensitivity", () => {
  it("sensible → 1 capa, altamente-sensible → 2 capas", () => {
    expect(layersForSensitivity("sensible")).toBe(1);
    expect(layersForSensitivity("altamente-sensible")).toBe(2);
  });
});

describe("guided metadata on the cajas layers schema", () => {
  const base = {
    layers: { packaging: "cajas", stripsPerLayer: 7, layersPerBox: 1 },
    product: { unitsPerCarrier: 150, productKgPerCarrier: 16, valuePerCarrierCop: 360_000 },
    spoilage: { spoilagePct: 0.15, coldChainSharePct: 0.5, residualSharePct: 0 },
    logistics: {
      market: "nacional",
      reeferTruckCostCop: 3_500_000,
      reeferPremiumPct: 0.4,
      carriersPerTruck: 120,
      tripsPerMonth: 8,
      distanceKm: 500,
      reeferHoursPerTrip: 10,
      reuse: { hasReturnLogistics: true, outboundDays: 1 },
    },
  };

  it("accepts boxLengthCm + heatSensitivity", () => {
    const parsed = capasInputSchema.parse({
      ...base,
      layers: {
        ...base.layers,
        boxLengthCm: 105,
        heatSensitivity: "altamente-sensible",
      },
    });
    expect(parsed.layers).toMatchObject({
      boxLengthCm: 105,
      heatSensitivity: "altamente-sensible",
    });
  });

  it("stays optional — legacy bodies without metadata still parse", () => {
    expect(() => capasInputSchema.parse(base)).not.toThrow();
  });

  it("rejects an unknown sensitivity value", () => {
    expect(() =>
      capasInputSchema.parse({
        ...base,
        layers: { ...base.layers, heatSensitivity: "tibio" },
      }),
    ).toThrow();
  });
});
