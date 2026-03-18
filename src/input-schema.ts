import { z } from "zod";
import type { ColdChainInput, ColdChainScenario } from "./types.js";

const scenarioSchema = z.object({
  name: z.string().min(1).max(120),
  exportPct: z.number().min(0).max(1),
  localPct: z.number().min(0).max(1),
  wastePct: z.number().min(0).max(1),
});

/** ISO 3166-1 alpha-2 (two upper-case letters). Loose match — the
 *  country catalog is small and the resolver falls back to "CO" on
 *  unknown codes, so over-strict regex here would just create silly
 *  validation failures without any safety upside. */
const isoCountryCode = z
  .string()
  .regex(/^[A-Z]{2}$/i, "Country code must be a 2-letter ISO code")
  .transform((s) => s.toUpperCase());

export const coldChainInputSchema = z.object({
  kgPerCanastilla: z.number().positive().max(10_000),
  canastillasPerTruck: z.number().int().positive().max(100_000),
  canastillasPerTorre: z.number().int().positive().max(1_000),

  priceExportPerKg: z.number().nonnegative().max(10_000_000),
  priceLocalPerKg: z.number().nonnegative().max(10_000_000),

  baseline: scenarioSchema,
  scenarios: z.array(scenarioSchema).min(1).max(8),

  costPerCapa: z.number().nonnegative().max(100_000_000),
  monthsLifespan: z.number().positive().max(120),
  tripsPerMonth: z.number().positive().max(1_000),

  currency: z.string().min(3).max(8).optional(),

  // Phase 2 of cold-chain (multi-currency + origin/destination split).
  // All optional so existing serialized inputs (which predate these
  // fields) still parse; the calc + persistence layers default the
  // missing values explicitly.
  countryCode: isoCountryCode.optional(),
  shipMode: z.enum(["domestic", "international"]).optional(),
  destinationCountryCode: isoCountryCode.nullable().optional(),
});

export type ColdChainInputSchema = z.infer<typeof coldChainInputSchema>;

/** Strip a parsed body into the concrete ColdChainInput. The Zod schema
 *  already constrains every field, but we cast through a guard to drop the
 *  schema-only type variance.
 *
 *  Normalisation rules for the Phase-2 fields:
 *    - `countryCode` falls back to "CO" so the calc + persistence layer
 *      never see `undefined` (matches the DB default).
 *    - `shipMode` defaults to `"international"` for back-compat with rows
 *      that predate the toggle (the original calc semantics implied
 *      cross-border shipping).
 *    - `destinationCountryCode` is force-nulled when domestic — even if
 *      the client posts one, it's nonsensical without a destination
 *      shipment context. Keep the DB clean.
 */
export function toColdChainInput(parsed: ColdChainInputSchema): ColdChainInput {
  const shipMode = parsed.shipMode ?? "international";
  const destinationCountryCode =
    shipMode === "international" ? (parsed.destinationCountryCode ?? null) : null;
  return {
    kgPerCanastilla: parsed.kgPerCanastilla,
    canastillasPerTruck: parsed.canastillasPerTruck,
    canastillasPerTorre: parsed.canastillasPerTorre,
    priceExportPerKg: parsed.priceExportPerKg,
    priceLocalPerKg: parsed.priceLocalPerKg,
    baseline: parsed.baseline as ColdChainScenario,
    scenarios: parsed.scenarios as ColdChainScenario[],
    costPerCapa: parsed.costPerCapa,
    monthsLifespan: parsed.monthsLifespan,
    tripsPerMonth: parsed.tripsPerMonth,
    currency: parsed.currency,
    countryCode: parsed.countryCode ?? "CO",
    shipMode,
    destinationCountryCode,
  };
}
