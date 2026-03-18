import { z } from "zod";
import type { CapasInput } from "./types.js";

/**
 * Runtime validation for `CapasInput` (Capas Frías v2). Mirrors the v1
 * `input-schema.ts` philosophy: bound every field to sensible maxima,
 * percentages to 0..1, all quantities non-negative. The calc itself clamps
 * defensively too — this schema is the boundary guard for API bodies /
 * persisted rows, where a discriminated union keeps the four scenario shapes
 * mutually exclusive.
 */

const pct = z.number().min(0).max(1);
const nonNegMoney = z.number().nonnegative().max(1_000_000_000_000);
const nonNegKg = z.number().nonnegative().max(10_000_000);
const nonNegCount = z.number().nonnegative().max(1_000_000);

const layersCajasSchema = z.object({
  packaging: z.literal("cajas"),
  stripsPerLayer: z.number().nonnegative().max(10_000),
  layersPerBox: z.number().nonnegative().max(10_000),
  stripWeightKgOverride: z.number().nonnegative().max(1_000).optional(),
  // Guided-mode metadata (see types.ts) — UI-only, ignored by the engine.
  boxLengthCm: z.number().nonnegative().max(100_000).optional(),
  heatSensitivity: z.enum(["sensible", "altamente-sensible"]).optional(),
});

const layersPalletsSchema = z.object({
  packaging: z.literal("pallets"),
  layersPerPallet: z.number().nonnegative().max(10_000),
  costPerPalletLayerCop: nonNegMoney,
  weightPerPalletLayerKg: z.number().nonnegative().max(10_000),
});

const layersSchema = z.discriminatedUnion("packaging", [
  layersCajasSchema,
  layersPalletsSchema,
]);

const productSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  unitsPerCarrier: nonNegCount,
  productKgPerCarrier: nonNegKg,
  valuePerCarrierCop: nonNegMoney,
});

const spoilageSchema = z.object({
  spoilagePct: pct,
  coldChainSharePct: pct,
  residualSharePct: pct,
});

const reuseSchema = z.object({
  hasReturnLogistics: z.boolean(),
  outboundDays: z.number().nonnegative().max(3_650),
  returnDaysOverride: z.number().nonnegative().max(3_650).optional(),
});

const nacionalSchema = z.object({
  market: z.literal("nacional"),
  reeferTruckCostCop: nonNegMoney,
  reeferPremiumPct: z.number().nonnegative().max(10),
  carriersPerTruck: nonNegCount,
  tripsPerMonth: z.number().nonnegative().max(10_000),
  distanceKm: z.number().nonnegative().max(100_000),
  reeferHoursPerTrip: z.number().nonnegative().max(10_000),
  reuse: reuseSchema,
});

const landLegSchema = z.object({
  replaceReeferTruck: z.boolean(),
  carriersPerTruck: nonNegCount,
  reeferTruckCostCop: nonNegMoney,
  reeferPremiumPct: z.number().nonnegative().max(10),
  reeferHoursPerTruck: z.number().nonnegative().max(10_000),
});

const exportacionSchema = z.object({
  market: z.literal("exportacion"),
  airRatePerKgCop: nonNegMoney,
  carriersPerShipment: nonNegCount,
  // Defaulted to 4 (spec §4.8) so pre-normalisation bodies still parse.
  shipmentsPerMonth: z.number().nonnegative().max(10_000).default(4),
  airDistanceKm: z.number().nonnegative().max(100_000),
  landLeg: landLegSchema.optional(),
});

const logisticsSchema = z.discriminatedUnion("market", [
  nacionalSchema,
  exportacionSchema,
]);

const socialSchema = z.object({
  jobsTotal: nonNegCount.optional(),
  jobsMen: nonNegCount.optional(),
  jobsWomen: nonNegCount.optional(),
});

// Every assumption is optional (partial override). Bounds are generous — the
// calc clamps too — but keep them finite so a stray Infinity can't sneak in.
const assumptionsSchema = z
  .object({
    stripsPerNfPallet: z.number().positive().max(100_000),
    nfPalletCostCop: nonNegMoney,
    nfPalletWeightKg: z.number().nonnegative().max(100_000),
    copPerUsd: z.number().positive().max(1_000_000),
    layerLifeDays: z.number().nonnegative().max(36_500),
    freezeHours: z.number().nonnegative().max(10_000),
    daysPerMonth: z.number().positive().max(366),
    dieselKgCo2PerL: z.number().nonnegative().max(1_000),
    reeferLPerHour: z.number().nonnegative().max(10_000),
    airKgCo2PerTonKm: z.number().nonnegative().max(1_000),
    truckKgCo2PerTonKm: z.number().nonnegative().max(1_000),
    productKgCo2PerKg: z.number().nonnegative().max(1_000),
    landfillKgCo2PerKg: z.number().nonnegative().max(1_000),
    manufacturingKgCo2PerLayer: z.number().nonnegative().max(1_000),
    dieselPriceCopPerL: nonNegMoney,
  })
  .partial();

export const capasInputSchema = z.object({
  layers: layersSchema,
  product: productSchema,
  spoilage: spoilageSchema,
  logistics: logisticsSchema,
  social: socialSchema.optional(),
  assumptions: assumptionsSchema.optional(),
});

export type CapasInputSchema = z.infer<typeof capasInputSchema>;

/**
 * Normalise a parsed body into a concrete `CapasInput`. The Zod schema already
 * constrains every field (and defaults `shipmentsPerMonth` to 4); this cast
 * drops the schema-only type variance, mirroring v1's `toColdChainInput`.
 */
export function toCapasInput(parsed: CapasInputSchema): CapasInput {
  return parsed as CapasInput;
}
