import { describe, it, expect } from "vitest";
import { computeColdChain, pickRecommendedScenario, paybackTrips } from "./calc.js";
import { COLD_CHAIN_DEFAULTS } from "./defaults.js";

/**
 * Lock-in fixtures from caribbean-exotics.xlsx. Every number on this page
 * comes straight out of the original spreadsheet; if the calc ever drifts,
 * this suite will catch it. Values are in COP.
 */
describe("computeColdChain — Caribbean Exotics fixtures", () => {
  const out = computeColdChain(COLD_CHAIN_DEFAULTS);

  it("derives truck capacity and capa count", () => {
    expect(out.totalTruckKg).toBe(1960); // 7 × 280
    expect(out.capasPerTruck).toBe(28); // 280 / 10 towers
    expect(out.totalCapaCost).toBe(487_200); // 17,400 × 28
    expect(out.totalTripsLifespan).toBe(48); // 3 × 16
    expect(out.depreciationPerTrip).toBeCloseTo(10_150, 0); // 487,200 / 48
  });

  it("computes baseline revenue and zero-differential row", () => {
    expect(out.baseline.revenueExport).toBe(9_604_000); // 1960 × 0.7 × 7000
    expect(out.baseline.revenueLocal).toBe(588_000); // 1960 × 0.25 × 1200
    expect(out.baseline.netRevenue).toBe(10_192_000);
    expect(out.baseline.differential).toBe(0);
    expect(out.baseline.netGainPerTrip).toBe(0);
    expect(out.baseline.lifetimeGain).toBe(0);
    expect(out.baseline.roi).toBe(0);
  });

  it("computes the +10% scenario", () => {
    const s = out.scenarios[0]!;
    expect(s.revenueExport).toBe(10_976_000); // 1960 × 0.8 × 7000
    expect(s.revenueLocal).toBe(352_800); // 1960 × 0.15 × 1200
    expect(s.netRevenue).toBe(11_328_800);
    expect(s.differential).toBe(1_136_800);
    expect(s.netGainPerTrip).toBeCloseTo(1_126_650, 0);
    expect(s.lifetimeGain).toBeCloseTo(54_079_200, -1);
    expect(s.roi).toBeCloseTo(110.99, 1); // ≈ 111x return
  });

  it("computes the +5% scenario", () => {
    const s = out.scenarios[1]!;
    expect(s.revenueExport).toBe(10_290_000); // 1960 × 0.75 × 7000
    expect(s.revenueLocal).toBe(470_400); // 1960 × 0.2 × 1200
    expect(s.netRevenue).toBe(10_760_400);
    expect(s.differential).toBe(568_400);
    expect(s.netGainPerTrip).toBeCloseTo(558_250, 0);
    expect(s.lifetimeGain).toBeCloseTo(26_796_000, -1);
    expect(s.roi).toBeCloseTo(54.99, 1); // ≈ 55x return
  });
});

describe("pickRecommendedScenario", () => {
  it("returns the scenario with the highest lifetime gain", () => {
    const out = computeColdChain(COLD_CHAIN_DEFAULTS);
    const winner = pickRecommendedScenario(out);
    expect(winner?.name).toBe("Con capas frías (+10%)");
  });

  it("returns null when no improved scenarios are defined", () => {
    const out = computeColdChain({ ...COLD_CHAIN_DEFAULTS, scenarios: [] });
    expect(pickRecommendedScenario(out)).toBeNull();
  });
});

describe("paybackTrips", () => {
  it("returns trips needed to recoup capa cost", () => {
    const out = computeColdChain(COLD_CHAIN_DEFAULTS);
    const trips = paybackTrips(out.scenarios[0]!, out.totalCapaCost);
    // 487,200 / 1,126,650 ≈ 0.43 trips — capas pay back inside the first run
    expect(trips).toBeLessThan(1);
    expect(trips).toBeGreaterThan(0);
  });

  it("returns Infinity when the scenario doesn't pay back", () => {
    const out = computeColdChain(COLD_CHAIN_DEFAULTS);
    const loser = {
      ...out.scenarios[0]!,
      netGainPerTrip: 0,
    };
    expect(paybackTrips(loser, out.totalCapaCost)).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("edge cases", () => {
  it("handles zero monthsLifespan without dividing by zero", () => {
    const out = computeColdChain({ ...COLD_CHAIN_DEFAULTS, monthsLifespan: 0 });
    expect(out.depreciationPerTrip).toBe(0);
    expect(out.totalTripsLifespan).toBe(0);
  });

  it("rounds capasPerTruck up when canastillas don't divide evenly", () => {
    const out = computeColdChain({ ...COLD_CHAIN_DEFAULTS, canastillasPerTruck: 281 });
    expect(out.capasPerTruck).toBe(29); // ceil(281/10)
  });

  it("clamps negative inputs to zero rather than producing negative revenue", () => {
    const out = computeColdChain({ ...COLD_CHAIN_DEFAULTS, priceExportPerKg: -1 });
    expect(out.baseline.revenueExport).toBe(0);
  });
});
