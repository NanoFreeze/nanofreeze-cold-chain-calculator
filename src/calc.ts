import type {
  ColdChainInput,
  ColdChainOutput,
  ColdChainScenario,
  ColdChainScenarioOutput,
} from "./types.js";
import { getColdChainCountry } from "./country.js";

function clampNonNeg(n: number): number {
  return !Number.isFinite(n) || n < 0 ? 0 : n;
}

/** Compute one scenario's per-trip economics. The baseline carries
 *  `depreciationPerTrip = 0` and `differential = 0` by definition — we keep
 *  the row uniform so consumers can render the comparison table without
 *  branching on "is this the baseline." */
function computeScenario(
  scenario: ColdChainScenario,
  baseline: ColdChainScenario,
  isBaseline: boolean,
  ctx: {
    totalTruckKg: number;
    priceExportPerKg: number;
    priceLocalPerKg: number;
    depreciationPerTrip: number;
    totalTripsLifespan: number;
    totalCapaCost: number;
  },
): ColdChainScenarioOutput {
  const exportPct = clampNonNeg(scenario.exportPct);
  const localPct = clampNonNeg(scenario.localPct);
  const wastePct = clampNonNeg(scenario.wastePct);

  const revenueExport = ctx.totalTruckKg * exportPct * ctx.priceExportPerKg;
  const revenueLocal = ctx.totalTruckKg * localPct * ctx.priceLocalPerKg;
  const wasteLoss = ctx.totalTruckKg * wastePct * ctx.priceExportPerKg;
  const netRevenue = revenueExport + revenueLocal;

  const baselineRevenue =
    ctx.totalTruckKg * clampNonNeg(baseline.exportPct) * ctx.priceExportPerKg +
    ctx.totalTruckKg * clampNonNeg(baseline.localPct) * ctx.priceLocalPerKg;

  const differential = isBaseline ? 0 : netRevenue - baselineRevenue;
  const depreciationPerTrip = isBaseline ? 0 : ctx.depreciationPerTrip;
  const netGainPerTrip = differential - depreciationPerTrip;
  const lifetimeGain = isBaseline ? 0 : netGainPerTrip * ctx.totalTripsLifespan;
  const roi =
    isBaseline || ctx.totalCapaCost <= 0 ? 0 : lifetimeGain / ctx.totalCapaCost;

  return {
    name: scenario.name,
    exportPct,
    localPct,
    wastePct,
    revenueExport,
    revenueLocal,
    wasteLoss,
    netRevenue,
    differential,
    depreciationPerTrip,
    netGainPerTrip,
    lifetimeGain,
    roi,
  };
}

/**
 * Run the cold-chain savings model. Pure: no IO, no globals, no Date. Same
 * input → same output, every time.
 *
 * Domain notes (carried over from the Caribbean Exotics spreadsheet):
 *
 *   - `totalTruckKg = kgPerCanastilla × canastillasPerTruck` — the workload
 *     the calc operates on. The spreadsheet's truck row hardcoded 1,960 kg;
 *     here it's always derived so a different basket size or truck capacity
 *     re-computes consistently.
 *   - `capasPerTruck = canastillasPerTruck / canastillasPerTorre` — one capa
 *     per tower of baskets. Rounded UP because a partial tower still needs
 *     a capa.
 *   - `wasteLoss` is informational only — the model assumes the waste %
 *     never reached sale, so it doesn't get subtracted from netRevenue. The
 *     differential between scenarios is what matters; waste cancels out.
 */
export function computeColdChain(input: ColdChainInput): ColdChainOutput {
  const totalTruckKg = clampNonNeg(input.kgPerCanastilla) * clampNonNeg(input.canastillasPerTruck);
  const capasPerTruck =
    input.canastillasPerTorre > 0
      ? Math.ceil(clampNonNeg(input.canastillasPerTruck) / clampNonNeg(input.canastillasPerTorre))
      : 0;
  const totalCapaCost = clampNonNeg(input.costPerCapa) * capasPerTruck;
  const totalTripsLifespan =
    clampNonNeg(input.monthsLifespan) * clampNonNeg(input.tripsPerMonth);
  const depreciationPerTrip =
    totalTripsLifespan > 0 ? totalCapaCost / totalTripsLifespan : 0;

  const ctx = {
    totalTruckKg,
    priceExportPerKg: clampNonNeg(input.priceExportPerKg),
    priceLocalPerKg: clampNonNeg(input.priceLocalPerKg),
    depreciationPerTrip,
    totalTripsLifespan,
    totalCapaCost,
  };

  const baseline = computeScenario(input.baseline, input.baseline, true, ctx);
  const scenarios = input.scenarios.map((s) =>
    computeScenario(s, input.baseline, false, ctx),
  );

  // Country drives currency. Explicit `input.currency` still wins so the
  // Caribbean Exotics-derived seed (where the spreadsheet hardcoded COP)
  // keeps producing COP regardless of the country picker default.
  const country = getColdChainCountry(input.countryCode);
  const currency = input.currency ?? country.currency;

  // Shipping scope is informational for v1 — display chrome reads
  // `shipMode` + `destinationCountryCode` to render the origin → dest
  // header. Default to "international" so existing rows (no shipMode
  // persisted) keep the export/local price interpretation they shipped
  // with.
  const shipMode = input.shipMode ?? "international";
  const destinationCountryCode =
    shipMode === "international" ? (input.destinationCountryCode ?? null) : null;

  return {
    totalTruckKg,
    capasPerTruck,
    totalCapaCost,
    totalTripsLifespan,
    depreciationPerTrip,
    baseline,
    scenarios,
    currency,
    countryCode: country.code,
    shipMode,
    destinationCountryCode,
  };
}

/** Pick the scenario with the highest lifetime gain. If there are no
 *  improved scenarios, returns null. Used by the UI to highlight the
 *  recommended option in the results summary. */
export function pickRecommendedScenario(
  output: ColdChainOutput,
): ColdChainScenarioOutput | null {
  if (output.scenarios.length === 0) return null;
  return output.scenarios.reduce((best, s) =>
    s.lifetimeGain > best.lifetimeGain ? s : best,
  );
}

/** Payback in trips — how many trips until the capa investment is recouped
 *  through the scenario's net gain. Returns Infinity when net gain is <= 0
 *  (the capas never pay back at this scenario), and 0 when there's nothing
 *  to recoup. */
export function paybackTrips(
  scenario: ColdChainScenarioOutput,
  totalCapaCost: number,
): number {
  if (totalCapaCost <= 0) return 0;
  if (scenario.netGainPerTrip <= 0) return Number.POSITIVE_INFINITY;
  return totalCapaCost / scenario.netGainPerTrip;
}
