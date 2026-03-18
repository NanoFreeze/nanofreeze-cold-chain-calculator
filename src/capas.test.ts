import { describe, it, expect } from "vitest";
import {
  computeCapas,
  capasScenarioLabel,
  capasInputSchema,
  CAPAS_DEFAULT_ASSUMPTIONS,
  CAPAS_ASSUMPTIONS_META,
} from "./capas/index.js";
import type { CapasInput } from "./capas/index.js";

/**
 * Excel parity fixtures — every number comes straight out of
 * `Business Case - Capas Frias - Template - Updated.xlsx` (see spec §7). If the
 * engine ever drifts, these lock-ins catch it. COP unless noted.
 *
 * The four inputs were reverse-derived from the workbook's outputs and are
 * internally consistent (COP 725/strip, 0.125 kg/strip, 3 500 000 reefer @ 40 %
 * premium, 500 km / 5 000 air-km, etc.).
 */

const NACIONAL_CAJAS: CapasInput = {
  layers: { packaging: "cajas", stripsPerLayer: 7, layersPerBox: 1 },
  product: { name: "Producto", unitsPerCarrier: 16, productKgPerCarrier: 16, valuePerCarrierCop: 360_000 },
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

const NACIONAL_PALLETS: CapasInput = {
  layers: { packaging: "pallets", layersPerPallet: 8, costPerPalletLayerCop: 2_900, weightPerPalletLayerKg: 1.5 },
  product: { unitsPerCarrier: 320, productKgPerCarrier: 320, valuePerCarrierCop: 7_200_000 },
  spoilage: { spoilagePct: 0.15, coldChainSharePct: 0.5, residualSharePct: 0 },
  logistics: {
    market: "nacional",
    reeferTruckCostCop: 3_500_000,
    reeferPremiumPct: 0.4,
    carriersPerTruck: 10,
    tripsPerMonth: 8,
    distanceKm: 500,
    reeferHoursPerTrip: 10,
    // Degenerate reuse branch (spec deviation #5): no return logistics, empty
    // outbound days → single-use, buy one set per trip across the horizon.
    reuse: { hasReturnLogistics: false, outboundDays: 0 },
  },
};

const EXPORT_CAJAS: CapasInput = {
  layers: { packaging: "cajas", stripsPerLayer: 7, layersPerBox: 1 },
  product: { unitsPerCarrier: 16, productKgPerCarrier: 16, valuePerCarrierCop: 360_000 },
  spoilage: { spoilagePct: 0.3, coldChainSharePct: 0.5, residualSharePct: 0 },
  logistics: {
    market: "exportacion",
    airRatePerKgCop: 8_000,
    carriersPerShipment: 400,
    shipmentsPerMonth: 4,
    airDistanceKm: 5_000,
    landLeg: {
      replaceReeferTruck: true,
      carriersPerTruck: 200,
      reeferTruckCostCop: 3_500_000,
      reeferPremiumPct: 0.4,
      reeferHoursPerTruck: 6,
    },
  },
};

const EXPORT_PALLETS: CapasInput = {
  layers: { packaging: "pallets", layersPerPallet: 8, costPerPalletLayerCop: 2_900, weightPerPalletLayerKg: 1.5 },
  product: { unitsPerCarrier: 320, productKgPerCarrier: 320, valuePerCarrierCop: 7_200_000 },
  spoilage: { spoilagePct: 0.3, coldChainSharePct: 0.5, residualSharePct: 0 },
  logistics: {
    market: "exportacion",
    airRatePerKgCop: 8_000,
    carriersPerShipment: 20,
    shipmentsPerMonth: 4,
    airDistanceKm: 5_000,
    landLeg: {
      replaceReeferTruck: true,
      carriersPerTruck: 10,
      reeferTruckCostCop: 3_500_000,
      reeferPremiumPct: 0.4,
      reeferHoursPerTruck: 6,
    },
  },
};

/** Walk an output object and assert every number is finite (no NaN/Infinity). */
function assertAllFinite(obj: unknown, path = "$"): void {
  if (obj === null || obj === undefined) return;
  if (typeof obj === "number") {
    expect(Number.isFinite(obj), `${path} should be finite, got ${obj}`).toBe(true);
    return;
  }
  if (typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) assertAllFinite(v, `${path}.${k}`);
  }
}

const CLOSE = 6;

describe("computeCapas — Nacional · Cajas parity", () => {
  const out = computeCapas(NACIONAL_CAJAS);

  it("carries the right frame", () => {
    expect(out.modelVersion).toBe(2);
    expect(out.market).toBe("nacional");
    expect(out.packaging).toBe("cajas");
    expect(out.eventLabel).toBe("trip");
    expect(out.eventsPerMonth).toBe(8);
    expect(out.horizonMonths).toBe(6);
  });

  it("layer economics", () => {
    expect(out.layers.costPerCarrier.cop).toBeCloseTo(5_075, CLOSE); // 7 × 725
    expect(out.layers.weightPerCarrierKg).toBeCloseTo(0.875, CLOSE); // 7 × 0.125
  });

  it("reuse cycle", () => {
    expect(out.reuse).not.toBeNull();
    expect(out.reuse!.cycleDays).toBeCloseTo(3.5, CLOSE);
    expect(out.reuse!.usesPerLayer).toBe(51);
    expect(out.reuse!.tripsPerMonthPerSet).toBe(8);
    expect(out.reuse!.setsToBuy).toBe(1);
    expect(out.reuse!.lifeMonths).toBeCloseTo(6, CLOSE);
    expect(out.reuse!.setCost.cop).toBeCloseTo(609_000, CLOSE);
    expect(out.reuse!.investment.cop).toBeCloseTo(609_000, CLOSE);
    expect(out.reuse!.amortizedPerTrip.cop).toBeCloseTo(12_687.5, CLOSE);
  });

  it("transport savings — gross vs the Excel's net (A − B)", () => {
    // transportSavings is GROSS; net (A − B) = transportSavings − amortized.
    expect(out.monetary.transportSavings.perEvent.cop).toBeCloseTo(1_000_000, CLOSE);
    const net = out.details.market === "nacional"
      ? out.details.optionAPerTrip.cop - out.details.optionBPerTrip.cop
      : NaN;
    expect(net).toBeCloseTo(987_312.5, CLOSE);
  });

  it("recovered value, extra fuel, and total", () => {
    expect(out.monetary.recoveredValue.perEvent.cop).toBeCloseTo(3_240_000, CLOSE);
    expect(out.monetary.extraCost.perEvent.cop).toBeCloseTo(19_589.552238805969, CLOSE);
    expect(out.monetary.total.perEvent.cop).toBeCloseTo(4_207_722.947761194, CLOSE);
    expect(out.monetary.total.perMonth.cop).toBeCloseTo(33_661_783.58208955, CLOSE);
    expect(out.monetary.total.perHorizon!.cop).toBeCloseTo(201_970_701.49253732, CLOSE);
    expect(out.details.market === "nacional" && out.details.extraFuelLitersPerTrip).toBeCloseTo(1.958955223880597, CLOSE);
  });

  it("environmental breakdown", () => {
    const e = out.environmental.perEvent;
    expect(e.avoidedSpoilageKg).toBeCloseTo(388.8, CLOSE);
    expect(e.avoidedReeferKg).toBeCloseTo(101.84, CLOSE);
    expect(e.penaltyWeightKg).toBeCloseTo(5.25, CLOSE);
    expect(e.netKg).toBeCloseTo(485.39, CLOSE);
    expect(out.environmental.perMonthKg).toBeCloseTo(3_883.12, CLOSE);
    expect(out.environmental.perHorizonKg!).toBeCloseTo(23_298.72, CLOSE);
  });

  it("perishables", () => {
    expect(out.perishables.perEvent.kgSaved).toBeCloseTo(144, CLOSE);
  });

  it("USD is COP / 3500", () => {
    expect(out.monetary.total.perEvent.usd).toBeCloseTo(4_207_722.947761194 / 3_500, CLOSE);
    expect(out.monetary.recoveredValue.perEvent.usd).toBeCloseTo(3_240_000 / 3_500, CLOSE);
  });

  it("produces no NaN/Infinity anywhere", () => assertAllFinite(out));
});

describe("computeCapas — Nacional · Pallets parity (degenerate reuse)", () => {
  const out = computeCapas(NACIONAL_PALLETS);

  it("reuse — single-use branch", () => {
    expect(out.reuse!.setsToBuy).toBe(48);
    expect(out.reuse!.investment.cop).toBeCloseTo(11_136_000, CLOSE);
    expect(out.reuse!.amortizedPerTrip.cop).toBeCloseTo(232_000, CLOSE);
  });

  it("transport net (A − B) and savings %", () => {
    const net = out.details.market === "nacional"
      ? out.details.optionAPerTrip.cop - out.details.optionBPerTrip.cop
      : NaN;
    expect(net).toBeCloseTo(768_000, CLOSE);
    expect(out.monetary.savingsPctVsReefer!).toBeCloseTo(0.21942857142857142, CLOSE);
  });

  it("total per trip", () => {
    expect(out.monetary.total.perEvent.cop).toBeCloseTo(6_145_611.940298508, CLOSE);
  });

  it("environmental + perishables", () => {
    expect(out.environmental.perEvent.netKg).toBeCloseTo(743.84, CLOSE);
    expect(out.environmental.perHorizonKg!).toBeCloseTo(35_704.32, CLOSE);
    expect(out.perishables.perEvent.kgSaved).toBeCloseTo(240, CLOSE);
  });

  it("produces no NaN/Infinity anywhere", () => assertAllFinite(out));
});

describe("computeCapas — Export · Cajas parity", () => {
  const out = computeCapas(EXPORT_CAJAS);

  it("frame is export (no horizon, no reuse)", () => {
    expect(out.market).toBe("exportacion");
    expect(out.eventLabel).toBe("shipment");
    expect(out.horizonMonths).toBeNull();
    expect(out.reuse).toBeNull();
    expect(out.monetary.savingsPctVsReefer).toBeNull();
    expect(out.monetary.total.perHorizon).toBeNull();
  });

  it("layer + freight economics", () => {
    expect(out.layers.costPerCarrier.cop).toBeCloseTo(5_075, CLOSE); // capas/caja
    expect(out.layers.weightPerCarrierKg).toBeCloseTo(0.875, CLOSE);
    if (out.details.market !== "exportacion") throw new Error("expected export details");
    expect(out.details.extraFreightPerCarrier.cop).toBeCloseTo(7_000, CLOSE);
    expect(out.details.perCarrier.investment.cop).toBeCloseTo(12_075, CLOSE);
    expect(out.details.perCarrier.recovered.cop).toBeCloseTo(54_000, CLOSE);
    expect(out.details.perCarrier.netBenefit.cop).toBeCloseTo(41_925, CLOSE);
    expect(out.details.perCarrier.roi).toBeCloseTo(3.472049689440994, CLOSE);
    expect(out.monetary.roi).toBeCloseTo(3.472049689440994, CLOSE);
    expect(out.details.landLeg!.trucksPerShipment).toBe(2);
    expect(out.details.landLeg!.savingsPerShipment.cop).toBeCloseTo(2_000_000, CLOSE);
  });

  it("shipment monetary totals", () => {
    expect(out.monetary.transportSavings.perEvent.cop).toBeCloseTo(2_000_000, CLOSE);
    expect(out.monetary.total.perEvent.cop).toBeCloseTo(18_770_000, CLOSE);
    // Export flows: month = event × shipmentsPerMonth; annual = month × 12.
    expect(out.monetary.total.perMonth.cop).toBeCloseTo(18_770_000 * 4, CLOSE);
    expect(out.monetary.total.annual.cop).toBeCloseTo(18_770_000 * 4 * 12, CLOSE);
    expect(out.monetary.total.perEvent.usd).toBeCloseTo(18_770_000 / 3_500, CLOSE);
  });

  it("environmental + perishables", () => {
    const e = out.environmental.perEvent;
    expect(e.avoidedSpoilageKg).toBeCloseTo(2_592, CLOSE);
    expect(e.avoidedReeferKg).toBeCloseTo(122.208, CLOSE);
    expect(e.penaltyWeightKg).toBeCloseTo(1_050, CLOSE);
    expect(e.netKg).toBeCloseTo(1_664.208, CLOSE);
    expect(out.perishables.perEvent.kgSaved).toBeCloseTo(960, CLOSE);
  });

  it("produces no NaN/Infinity anywhere", () => assertAllFinite(out));
});

describe("computeCapas — Export · Pallets parity", () => {
  const out = computeCapas(EXPORT_PALLETS);

  it("investment, net benefit, total", () => {
    if (out.details.market !== "exportacion") throw new Error("expected export details");
    expect(out.details.perCarrier.investment.cop).toBeCloseTo(119_200, CLOSE);
    expect(out.details.perCarrier.netBenefit.cop).toBeCloseTo(960_800, CLOSE);
    expect(out.monetary.total.perEvent.cop).toBeCloseTo(21_216_000, CLOSE);
  });

  it("environmental + perishables", () => {
    expect(out.environmental.perEvent.netKg).toBeCloseTo(1_994.208, CLOSE);
    expect(out.perishables.perEvent.kgSaved).toBeCloseTo(960, CLOSE);
  });

  it("produces no NaN/Infinity anywhere", () => assertAllFinite(out));
});

describe("deviations", () => {
  it("export without reefer replacement: zero reefer CO₂ AND transportSavings zero-flow", () => {
    const input: CapasInput = {
      ...EXPORT_CAJAS,
      logistics: {
        market: "exportacion",
        airRatePerKgCop: 8_000,
        carriersPerShipment: 400,
        shipmentsPerMonth: 4,
        airDistanceKm: 5_000,
        landLeg: {
          replaceReeferTruck: false,
          carriersPerTruck: 200,
          reeferTruckCostCop: 3_500_000,
          reeferPremiumPct: 0.4,
          reeferHoursPerTruck: 6,
        },
      },
    };
    const out = computeCapas(input);
    expect(out.environmental.perEvent.avoidedReeferKg).toBe(0);
    expect(out.monetary.transportSavings.perEvent.cop).toBe(0);
    expect(out.monetary.transportSavings.perMonth.cop).toBe(0);
    expect(out.monetary.transportSavings.annual.cop).toBe(0);
    expect(out.monetary.transportSavings.perHorizon).toBeNull();
    // Land-leg detail still renders (with zero savings) since the leg exists.
    if (out.details.market !== "exportacion") throw new Error("expected export details");
    expect(out.details.landLeg!.savingsPerShipment.cop).toBe(0);
  });

  it("nacional manufacturing footprint is subtracted once per horizon, not per event", () => {
    const m = 4; // kg CO₂e per layer
    const base = computeCapas(NACIONAL_CAJAS);
    const withMfg = computeCapas({
      ...NACIONAL_CAJAS,
      assumptions: { manufacturingKgCo2PerLayer: m },
    });
    // One set = a whole truck's layers: 120 boxes × 7 strips (Excel C46).
    // perEvent.manufacturingKg reports the set total, but netKg per event is
    // unchanged (nacional excludes manufacturing from the per-event net).
    expect(withMfg.environmental.perEvent.manufacturingKg).toBeCloseTo(120 * 7 * m, CLOSE);
    expect(withMfg.environmental.perEvent.netKg).toBeCloseTo(base.environmental.perEvent.netKg, CLOSE);
    // Horizon drops by setsToBuy(1) × (120 × 7) × m once.
    const mfgPerHorizon = base.reuse!.setsToBuy * 120 * 7 * m;
    expect(base.environmental.perHorizonKg! - withMfg.environmental.perHorizonKg!).toBeCloseTo(mfgPerHorizon, CLOSE);
  });

  it("export manufacturing footprint is subtracted every shipment", () => {
    const m = 4;
    const base = computeCapas(EXPORT_CAJAS);
    const withMfg = computeCapas({
      ...EXPORT_CAJAS,
      assumptions: { manufacturingKgCo2PerLayer: m },
    });
    // Single use → the WHOLE shipment's layers are manufactured for it:
    // 400 boxes × 7 strips (Excel G92 = G70 × G13 × factor).
    expect(withMfg.environmental.perEvent.manufacturingKg).toBeCloseTo(400 * 7 * m, CLOSE);
    expect(base.environmental.perEvent.netKg - withMfg.environmental.perEvent.netKg).toBeCloseTo(400 * 7 * m, CLOSE);
  });
});

describe("guards", () => {
  it("all-zero logistics never produces NaN/Infinity", () => {
    const zeroed: CapasInput = {
      layers: { packaging: "cajas", stripsPerLayer: 0, layersPerBox: 0 },
      product: { unitsPerCarrier: 0, productKgPerCarrier: 0, valuePerCarrierCop: 0 },
      spoilage: { spoilagePct: 0, coldChainSharePct: 0, residualSharePct: 0 },
      logistics: {
        market: "nacional",
        reeferTruckCostCop: 0,
        reeferPremiumPct: 0,
        carriersPerTruck: 0,
        tripsPerMonth: 0,
        distanceKm: 0,
        reeferHoursPerTrip: 0,
        reuse: { hasReturnLogistics: true, outboundDays: 0 },
      },
    };
    const out = computeCapas(zeroed);
    assertAllFinite(out);
    expect(out.monetary.roi).toBe(0);
  });

  it("negative inputs clamp to zero rather than leaking negatives", () => {
    const out = computeCapas({
      ...NACIONAL_CAJAS,
      product: { ...NACIONAL_CAJAS.product, valuePerCarrierCop: -1 },
    });
    expect(out.perishables.perEvent.valueRecovered.cop).toBe(0);
  });

  it("cycleDays = 0 (freeze + outbound + return all zero) is handled", () => {
    const out = computeCapas({
      ...NACIONAL_CAJAS,
      assumptions: { freezeHours: 0 },
      logistics: {
        market: "nacional",
        reeferTruckCostCop: 3_500_000,
        reeferPremiumPct: 0.4,
        carriersPerTruck: 120,
        tripsPerMonth: 8,
        distanceKm: 500,
        reeferHoursPerTrip: 10,
        reuse: { hasReturnLogistics: true, outboundDays: 0, returnDaysOverride: 0 },
      },
    });
    expect(out.reuse!.cycleDays).toBe(0);
    expect(out.reuse!.usesPerLayer).toBe(0);
    expect(out.reuse!.tripsPerMonthPerSet).toBe(0);
    expect(out.reuse!.setsToBuy).toBe(1); // max(1, …)
    assertAllFinite(out);
  });
});

describe("capasInputSchema", () => {
  it("accepts each of the four scenario shapes", () => {
    for (const fixture of [NACIONAL_CAJAS, NACIONAL_PALLETS, EXPORT_CAJAS, EXPORT_PALLETS]) {
      expect(capasInputSchema.safeParse(fixture).success).toBe(true);
    }
  });

  it("defaults export shipmentsPerMonth to 4 when omitted", () => {
    const parsed = capasInputSchema.parse({
      layers: { packaging: "cajas", stripsPerLayer: 7, layersPerBox: 1 },
      product: { unitsPerCarrier: 16, productKgPerCarrier: 16, valuePerCarrierCop: 360_000 },
      spoilage: { spoilagePct: 0.3, coldChainSharePct: 0.5, residualSharePct: 0 },
      logistics: {
        market: "exportacion",
        airRatePerKgCop: 8_000,
        carriersPerShipment: 400,
        airDistanceKm: 5_000,
      },
    });
    expect(parsed.logistics.market === "exportacion" && parsed.logistics.shipmentsPerMonth).toBe(4);
  });

  it("rejects out-of-range percentages", () => {
    const bad = { ...NACIONAL_CAJAS, spoilage: { spoilagePct: 2, coldChainSharePct: 0.5, residualSharePct: 0 } };
    expect(capasInputSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a mismatched packaging discriminant", () => {
    const bad = { ...NACIONAL_CAJAS, layers: { packaging: "cajas", layersPerPallet: 8, costPerPalletLayerCop: 2_900, weightPerPalletLayerKg: 1.5 } };
    expect(capasInputSchema.safeParse(bad).success).toBe(false);
  });
});

describe("capasScenarioLabel", () => {
  it("renders ES labels", () => {
    expect(capasScenarioLabel("nacional", "cajas", "es")).toBe("Nacional · Cajas");
    expect(capasScenarioLabel("exportacion", "pallets", "es")).toBe("Exportación · Pallets");
  });
  it("renders EN labels", () => {
    expect(capasScenarioLabel("nacional", "cajas", "en")).toBe("Domestic · Boxes");
    expect(capasScenarioLabel("exportacion", "pallets", "en")).toBe("Export · Pallets");
  });
});

describe("assumptions metadata", () => {
  it("has one meta entry per default assumption", () => {
    const metaKeys = CAPAS_ASSUMPTIONS_META.map((m) => m.key).sort();
    const defaultKeys = Object.keys(CAPAS_DEFAULT_ASSUMPTIONS).sort();
    expect(metaKeys).toEqual(defaultKeys);
  });
  it("flags the manufacturing placeholder as supplier-confirmed", () => {
    const meta = CAPAS_ASSUMPTIONS_META.find((m) => m.key === "manufacturingKgCo2PerLayer");
    expect(meta?.source).toMatch(/confirm with supplier/i);
  });
});
