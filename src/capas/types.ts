/**
 * Capas Frías — cost & impact model v2 (pure types).
 *
 * Where the v1 engine (`../calc.ts`) models a *revenue uplift* (more kg reach
 * export grade), the `capas` module models the **cost & impact of cold layers
 * as a refrigeration replacement**:
 *
 *   - Reefer replacement — a NanoFreeze cold-layer set lets a non-refrigerated
 *     truck (or a cheaper air lane) carry the load, so you save the reefer
 *     premium net of what the layers cost.
 *   - Spoilage recovery — fewer kg lost in the cold chain → recovered cargo
 *     value + recovered perishable kg/units.
 *   - CO₂ — avoided spoilage decomposition + avoided reefer diesel, minus the
 *     penalty of hauling the extra layer weight and (optionally) the layers'
 *     embodied manufacturing footprint.
 *
 * Two axes → four scenarios: `market` (`nacional` | `exportacion`) ×
 * `packaging` (`cajas` | `pallets`). Derived cell-by-cell from
 * `Business Case - Capas Frias - Template - Updated.xlsx`; every number is
 * reproducible — see `../capas.test.ts` for the parity fixtures.
 *
 * Pure: no IO, no globals, no `Date`. Same input → same output.
 */

export type CapasMarket = "nacional" | "exportacion";
export type CapasPackaging = "cajas" | "pallets";

/** Money is always carried as COP + a presentation USD derived at the fixed
 *  TRM assumption (`copPerUsd`). USD is display-only — not a live FX rate. */
export interface CapasMoney {
  cop: number;
  usd: number;
}

/** A value normalised across the four reporting horizons. `perHorizon` is the
 *  layer-life window (nacional only, `layerLifeDays/daysPerMonth` months); it
 *  is `null` for export, which reports per-shipment/month/year only. */
export interface CapasFlow {
  perEvent: CapasMoney;
  perMonth: CapasMoney;
  annual: CapasMoney;
  perHorizon: CapasMoney | null;
}

/**
 * Global model assumptions (the Excel "Supuestos" sheet). Every field is
 * override-able per input via `CapasInput.assumptions`; each ships bilingual
 * explain metadata in `CAPAS_ASSUMPTIONS_META` so the UI/PDF can justify it.
 */
export interface CapasAssumptions {
  /** Cold-layer strips per NanoFreeze commercial pallet. */
  stripsPerNfPallet: number;
  /** Price of one NF pallet, COP (ex-VAT) ⇒ `costPerStrip` is derived. */
  nfPalletCostCop: number;
  /** Weight of one NF pallet, kg ⇒ `stripWeightKg` is derived. */
  nfPalletWeightKg: number;
  /** Reference TRM, COP per USD — presentation only. */
  copPerUsd: number;
  /** Useful life of a layer with return logistics, days. */
  layerLifeDays: number;
  /** Hours to re-freeze / recharge a layer before reuse. */
  freezeHours: number;
  /** Month-normalisation constant, days. */
  daysPerMonth: number;
  /** Diesel emission factor, kg CO₂ per litre. */
  dieselKgCo2PerL: number;
  /** Reefer unit fuel burn, litres per hour. */
  reeferLPerHour: number;
  /** Air-freight modal factor, kg CO₂e per tonne·km. */
  airKgCo2PerTonKm: number;
  /** Road-freight modal factor, kg CO₂e per tonne·km. */
  truckKgCo2PerTonKm: number;
  /** Embedded footprint of the perishable, kg CO₂e per kg. */
  productKgCo2PerKg: number;
  /** Avoided landfill decomposition, kg CO₂e per kg spoiled. */
  landfillKgCo2PerKg: number;
  /** Layer manufacturing footprint, kg CO₂e per layer. Placeholder (0) —
   *  confirm with supplier. */
  manufacturingKgCo2PerLayer: number;
  /** Diesel price used to cost the extra layer weight, COP per litre. */
  dieselPriceCopPerL: number;
}

/** How heat-sensitive the transported product is. Drives the guided layer
 *  count: `sensible` → 1 capa per box, `altamente-sensible` → 2. */
export type HeatSensitivity = "sensible" | "altamente-sensible";

/** Layers packed as boxes (cajas). Strip cost/weight derive from the NF pallet
 *  assumptions; the weight per strip is overridable per input. */
export interface CapasLayersCajas {
  packaging: "cajas";
  stripsPerLayer: number;
  layersPerBox: number;
  /** Override the derived `nfPalletWeightKg / stripsPerNfPallet` (0.125). */
  stripWeightKgOverride?: number;
  /** Guided-mode metadata — the box length the prospect entered. The engine
   *  ignores it (`stripsPerLayer` stays authoritative); the builder uses it
   *  to restore guided mode on edit. Absent ⇒ manual override. */
  boxLengthCm?: number;
  /** Guided-mode metadata — the product's heat sensitivity. Same contract as
   *  `boxLengthCm`: UI-only, ignored by the engine. */
  heatSensitivity?: HeatSensitivity;
}

/** Layers packed as pallets. The per-layer cost is an explicit input (the
 *  Excel's 2 900 COP is a placeholder — confirm with supplier). */
export interface CapasLayersPallets {
  packaging: "pallets";
  layersPerPallet: number;
  costPerPalletLayerCop: number;
  weightPerPalletLayerKg: number;
}

export type CapasLayers = CapasLayersCajas | CapasLayersPallets;

/** The transported good. A "carrier" is one box (cajas) or one pallet. */
export interface CapasProduct {
  name?: string;
  unitsPerCarrier: number;
  productKgPerCarrier: number;
  valuePerCarrierCop: number;
}

/** Spoilage recovered by the cold layers.
 *  `recoveredFraction = spoilagePct × (coldChainSharePct − residualSharePct)`. */
export interface CapasSpoilage {
  spoilagePct: number;
  coldChainSharePct: number;
  residualSharePct: number;
}

/** Reuse cycle for the layer sets (nacional). Without return logistics the
 *  cycle degrades to single-use (`usesPerLayer = 1`). */
export interface CapasReuse {
  hasReturnLogistics: boolean;
  outboundDays: number;
  /** Return leg length; defaults to `outboundDays` when omitted. */
  returnDaysOverride?: number;
}

export interface CapasNacional {
  market: "nacional";
  reeferTruckCostCop: number;
  reeferPremiumPct: number;
  carriersPerTruck: number;
  tripsPerMonth: number;
  distanceKm: number;
  reeferHoursPerTrip: number;
  reuse: CapasReuse;
}

/** Optional land leg on an export lane — a refrigerated truck run that the
 *  layers can also replace, feeding land savings + reefer CO₂ avoidance. */
export interface CapasExportLandLeg {
  replaceReeferTruck: boolean;
  carriersPerTruck: number;
  reeferTruckCostCop: number;
  reeferPremiumPct: number;
  reeferHoursPerTruck: number;
}

export interface CapasExportacion {
  market: "exportacion";
  airRatePerKgCop: number;
  carriersPerShipment: number;
  shipmentsPerMonth: number;
  airDistanceKm: number;
  landLeg?: CapasExportLandLeg;
}

export type CapasLogistics = CapasNacional | CapasExportacion;

/** Jobs the capas operation creates (re-freeze station, return logistics).
 *  Registered, not calculated — passed straight through to output. */
export interface CapasSocial {
  jobsTotal?: number;
  jobsMen?: number;
  jobsWomen?: number;
}

export interface CapasInput {
  layers: CapasLayers;
  product: CapasProduct;
  spoilage: CapasSpoilage;
  logistics: CapasLogistics;
  social?: CapasSocial;
  assumptions?: Partial<CapasAssumptions>;
}

// ── Output ────────────────────────────────────────────────────────────────

export interface CapasLayersOutput {
  unitsPerCarrier: number;
  costPerCarrier: CapasMoney;
  costPerProductUnit: CapasMoney;
  weightPerCarrierKg: number;
}

export interface CapasReuseOutput {
  cycleDays: number;
  usesPerLayer: number;
  tripsPerMonthPerSet: number;
  setsToBuy: number;
  setCost: CapasMoney;
  investment: CapasMoney;
  amortizedPerTrip: CapasMoney;
  lifeMonths: number;
}

export interface CapasMonetary {
  /** GROSS reefer-replacement savings (option A − non-reefer). Export: land-leg
   *  savings — a zero-flow when the land leg is disabled. */
  transportSavings: CapasFlow;
  recoveredValue: CapasFlow;
  /** Nacional: amortized layer investment per trip. Export: per-shipment layer
   *  investment + extra air freight. */
  nfInvestment: CapasFlow;
  /** Nacional: extra diesel from hauling layer weight. Export: zero-flow (the
   *  extra freight is folded into `nfInvestment`). */
  extraCost: CapasFlow;
  /** transportSavings − nfInvestment + recoveredValue − extraCost. */
  total: CapasFlow;
  /** Nacional: (gross − amortized) / reeferCost (Excel E58). Export: null. */
  savingsPctVsReefer: number | null;
  /** Nacional: total.perHorizon / investment. Export: per-carrier ROI. */
  roi: number;
  /** True when the first event already covers the FULL first purchase
   *  (nacional: full setCost; export: full per-shipment investment) — a
   *  stricter bar than the Excel's amortized view. */
  positiveFromFirstEvent: boolean;
}

export interface CapasEnvironmentalPerEvent {
  avoidedSpoilageKg: number;
  avoidedReeferKg: number;
  penaltyWeightKg: number;
  manufacturingKg: number;
  netKg: number;
}

export interface CapasEnvironmental {
  perEvent: CapasEnvironmentalPerEvent;
  perMonthKg: number;
  annualKg: number;
  annualTons: number;
  perHorizonKg: number | null;
  perHorizonTons: number | null;
}

export interface CapasPerishablesPerEvent {
  kgSaved: number;
  unitsSaved: number;
  valueRecovered: CapasMoney;
}

export interface CapasPerishables {
  perEvent: CapasPerishablesPerEvent;
  perMonthKg: number;
  annualKg: number;
  perHorizonKg: number | null;
  perMonthUnits: number;
  annualUnits: number;
}

export interface CapasSocialOutput {
  jobsTotal: number | null;
  jobsMen: number | null;
  jobsWomen: number | null;
}

export interface CapasDetailsNacional {
  market: "nacional";
  optionAPerTrip: CapasMoney;
  optionBPerTrip: CapasMoney;
  nonReeferCostPerTrip: CapasMoney;
  recoveryTimesPerTrip: number;
  extraFuelLitersPerTrip: number;
}

export interface CapasDetailsExportLandLeg {
  trucksPerShipment: number;
  savingsPerTruck: CapasMoney;
  savingsPerShipment: CapasMoney;
}

export interface CapasDetailsExportPerCarrier {
  investment: CapasMoney;
  recovered: CapasMoney;
  netBenefit: CapasMoney;
  roi: number;
}

export interface CapasDetailsExportacion {
  market: "exportacion";
  freightWithoutPerCarrier: CapasMoney;
  freightWithPerCarrier: CapasMoney;
  extraFreightPerCarrier: CapasMoney;
  freightDeltaPerUnit: CapasMoney;
  freightDeltaPct: number;
  freightPctOfValueWithout: number;
  freightPctOfValueWith: number;
  perCarrier: CapasDetailsExportPerCarrier;
  landLeg: CapasDetailsExportLandLeg | null;
}

export type CapasDetails = CapasDetailsNacional | CapasDetailsExportacion;

export interface CapasOutput {
  modelVersion: 2;
  market: CapasMarket;
  packaging: CapasPackaging;
  eventLabel: "trip" | "shipment";
  eventsPerMonth: number;
  /** Nacional: layerLifeDays/daysPerMonth. Export: null. */
  horizonMonths: number | null;
  assumptions: CapasAssumptions;
  layers: CapasLayersOutput;
  /** Reuse economics — nacional only; null for export (single-use layers). */
  reuse: CapasReuseOutput | null;
  monetary: CapasMonetary;
  environmental: CapasEnvironmental;
  perishables: CapasPerishables;
  social: CapasSocialOutput | null;
  details: CapasDetails;
}
