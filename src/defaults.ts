import type { ColdChainInput } from "./types.js";

/**
 * Caribbean Exotics-derived defaults — the seed values from the original
 * `caribbean-exotics.xlsx` business case. New prospects land on these
 * numbers and edit from there. Currency is COP (Colombian pesos).
 *
 * Two improved scenarios are pre-loaded so the prospect immediately sees a
 * comparison without having to define their own bands:
 *   - +10% export conversion (waste stays at 5%)
 *   - +5% export conversion (waste stays at 5%)
 */
export const COLD_CHAIN_DEFAULTS: ColdChainInput = {
  kgPerCanastilla: 7,
  canastillasPerTruck: 280,
  canastillasPerTorre: 10,

  priceExportPerKg: 7_000,
  priceLocalPerKg: 1_200,

  baseline: {
    name: "Sin capas frías",
    exportPct: 0.7,
    localPct: 0.25,
    wastePct: 0.05,
  },
  scenarios: [
    {
      name: "Con capas frías (+10%)",
      exportPct: 0.8,
      localPct: 0.15,
      wastePct: 0.05,
    },
    {
      name: "Con capas frías (+5%)",
      exportPct: 0.75,
      localPct: 0.2,
      wastePct: 0.05,
    },
  ],

  costPerCapa: 17_400,
  monthsLifespan: 3,
  tripsPerMonth: 16,

  currency: "COP",
  countryCode: "CO",
  shipMode: "international",
  destinationCountryCode: null,
};
