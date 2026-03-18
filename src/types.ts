/**
 * Cold-chain savings calculator — pure types.
 *
 * The calculator models the economics of installing NanoFreeze cold capas
 * ("cold blankets" — insulating sleeves placed over canastilla towers during
 * truck transport from farm to post-harvest). The mechanic is:
 *
 *   - A truck carries N canastillas (baskets), grouped into towers of M.
 *   - A fraction of the load is exported (high price), the rest sold locally
 *     (low price), and a fraction is lost to heat damage on the way (waste).
 *   - Installing cold capas reduces heat damage → more of the load reaches
 *     export grade → revenue per trip rises. Waste % stays roughly the same
 *     across scenarios; the gain comes from converting local-grade fruit
 *     to export-grade fruit.
 *   - The investment is `costPerCapa × capasPerTruck`; lifespan is
 *     `monthsLifespan × tripsPerMonth` trips. Per-trip depreciation =
 *     totalCost / lifespanTrips.
 *
 * Extracted from the Caribbean Exotics business-case spreadsheet
 * (caribbean-exotics.xlsx). Every number in that file is reproducible here —
 * see calc.test.ts for the lock-in fixtures.
 */

/** A production-distribution scenario. Percentages must sum to ≤ 1; any
 *  residual is treated as "other" and ignored. Waste stays constant at the
 *  same value across the baseline and improved scenarios — the mechanism
 *  is conversion of local-grade to export-grade, not reduction in waste. */
export interface ColdChainScenario {
  /** Human-readable name shown in the UI ("Baseline", "+10%", "+5%"). */
  name: string;
  /** Fraction (0..1) of the truck's load sold at export price. */
  exportPct: number;
  /** Fraction (0..1) of the truck's load sold at local price. */
  localPct: number;
  /** Fraction (0..1) lost to heat damage. Same across scenarios in the
   *  base model — improvements convert local→export, not waste→sale. */
  wastePct: number;
}

export interface ColdChainInput {
  /** kg per canastilla (basket). */
  kgPerCanastilla: number;
  /** Number of canastillas the truck carries on each trip. */
  canastillasPerTruck: number;
  /** Canastillas per tower — drives `capasPerTruck = canastillas / canastillasPerTorre`. */
  canastillasPerTorre: number;

  /** Export-grade price per kg, in the model currency (default COP). */
  priceExportPerKg: number;
  /** Local-grade price per kg, in the model currency. */
  priceLocalPerKg: number;

  /** Baseline ("Sin Capas Frías") production distribution. */
  baseline: ColdChainScenario;
  /** One or more improved scenarios to compare against the baseline. */
  scenarios: ColdChainScenario[];

  /** Cost per individual cold capa (one per tower). */
  costPerCapa: number;
  /** Months the capas last before needing replacement. */
  monthsLifespan: number;
  /** Trips per month the truck runs. */
  tripsPerMonth: number;

  /** Currency code for display (defaults to "COP"). Derived from
   *  `countryCode` when present; the explicit field exists for legacy
   *  callers and one-off overrides. */
  currency?: string;
  /** ISO 3166-1 alpha-2 country of ORIGIN — where the fruit ships FROM
   *  and where the prospect invoices in. Drives currency + locale +
   *  formatter via `getColdChainCountry()`. Defaults to "CO" when
   *  undefined so existing Caribbean-Exotics-derived seeds keep
   *  producing COP. Persisted on `cold_chain_proposals.country_code` for
   *  back-compat — the column predates the origin/destination split. */
  countryCode?: string;
  /** Shipping scope:
   *   - `"international"` (default) — fruit crosses borders; the wizard
   *     surfaces `destinationCountryCode` and the export-vs-local price
   *     split represents export-buyer (foreign) vs local-buyer (domestic).
   *   - `"domestic"` — fruit stays within the origin country. Destination
   *     stays null; the export/local split represents premium-grade vs
   *     standard-grade within the same market.
   *  Persisted on `cold_chain_proposals.ship_mode`. */
  shipMode?: "domestic" | "international";
  /** ISO 3166-1 alpha-2 country of DESTINATION. Only meaningful when
   *  `shipMode === "international"`; ignored otherwise. Informational
   *  for v1 (shows in the proposal chrome + PDF + share view) — the calc
   *  still treats both prices as expressed in the origin currency. */
  destinationCountryCode?: string | null;
}

export interface ColdChainScenarioOutput {
  name: string;
  exportPct: number;
  localPct: number;
  wastePct: number;
  /** Revenue from export-grade fruit sold this trip. */
  revenueExport: number;
  /** Revenue from local-grade fruit sold this trip. */
  revenueLocal: number;
  /** Opportunity cost of the waste fraction (lost at export price). */
  wasteLoss: number;
  /** Total realised revenue per trip (revenueExport + revenueLocal). */
  netRevenue: number;
  /** vs. baseline scenario, per trip. Zero for the baseline row. */
  differential: number;
  /** Per-trip cost of cold capa depreciation. */
  depreciationPerTrip: number;
  /** Per-trip net gain after subtracting depreciation. Zero for the baseline. */
  netGainPerTrip: number;
  /** Net gain summed over the full capa lifespan (depreciation paid back). */
  lifetimeGain: number;
  /** Lifetime gain divided by initial capa investment (ratio, not %).
   *  A 1.0 ROI means you break even at the end of lifespan. */
  roi: number;
}

export interface ColdChainOutput {
  /** kgPerCanastilla × canastillasPerTruck. */
  totalTruckKg: number;
  /** canastillasPerTruck / canastillasPerTorre. */
  capasPerTruck: number;
  /** costPerCapa × capasPerTruck. */
  totalCapaCost: number;
  /** monthsLifespan × tripsPerMonth. */
  totalTripsLifespan: number;
  /** totalCapaCost / totalTripsLifespan. */
  depreciationPerTrip: number;

  /** Baseline scenario, computed for completeness so the UI can show it
   *  alongside improved scenarios. `differential` / `netGainPerTrip` /
   *  `lifetimeGain` / `roi` are all zero on the baseline by definition. */
  baseline: ColdChainScenarioOutput;
  /** Improved scenarios, in the same order as `input.scenarios`. */
  scenarios: ColdChainScenarioOutput[];

  /** Currency echoed from input for downstream formatters. */
  currency: string;
  /** ISO 3166-1 alpha-2 country code echoed from input. Drives the
   *  formatter's locale so a Brazilian proposal renders "R$ 1.234" and
   *  a US one renders "US$ 1,234" without per-callsite logic. */
  countryCode: string;
  /** Echoed shipping scope. Display chrome reads this to decide whether
   *  to show a "→ destination" arrow on the proposal header. */
  shipMode: "domestic" | "international";
  /** Echoed destination country code (only meaningful for international). */
  destinationCountryCode: string | null;
}
