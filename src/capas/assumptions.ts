import type { CapasAssumptions } from "./types.js";

/**
 * Capas Frías v2 default assumptions — the Excel "Supuestos" sheet.
 *
 * Every field is override-able per input (`CapasInput.assumptions`). The
 * metadata table below (`CAPAS_ASSUMPTIONS_META`) carries bilingual label /
 * unit / explanation / source for each one so the builder's "Ver supuestos"
 * drawer and the PDF can explain — and let the user edit — every number.
 */
export const CAPAS_DEFAULT_ASSUMPTIONS: CapasAssumptions = {
  stripsPerNfPallet: 24,
  nfPalletCostCop: 17_400,
  nfPalletWeightKg: 3,
  copPerUsd: 3_248.87,
  layerLifeDays: 180,
  freezeHours: 36,
  daysPerMonth: 30,
  dieselKgCo2PerL: 2.68,
  reeferLPerHour: 3.8,
  airKgCo2PerTonKm: 0.6,
  truckKgCo2PerTonKm: 0.1,
  productKgCo2PerKg: 2,
  landfillKgCo2PerKg: 0.7,
  manufacturingKgCo2PerLayer: 0,
  dieselPriceCopPerL: 10_000,
};

/** Bilingual explain metadata for one assumption. */
export interface CapasAssumptionMeta {
  key: keyof CapasAssumptions;
  labelEs: string;
  labelEn: string;
  unitEs: string;
  unitEn: string;
  explainEs: string;
  explainEn: string;
  /** Provenance note — present when the value needs external confirmation. */
  source?: string;
}

/** One entry per assumption, in the same order as the Excel "Supuestos" sheet.
 *  Copy is authored from the spec §3 table (bilingual). */
export const CAPAS_ASSUMPTIONS_META: readonly CapasAssumptionMeta[] = [
  {
    key: "stripsPerNfPallet",
    labelEs: "Franjas por pallet NF",
    labelEn: "Strips per NF pallet",
    unitEs: "franjas/pallet",
    unitEn: "strips/pallet",
    explainEs:
      "Presentación comercial del pallet de capas NanoFreeze. Determina el costo por franja (precio del pallet ÷ franjas).",
    explainEn:
      "Commercial presentation of the NanoFreeze layer pallet. Sets the cost per strip (pallet price ÷ strips).",
  },
  {
    key: "nfPalletCostCop",
    labelEs: "Costo del pallet NF",
    labelEn: "NF pallet cost",
    unitEs: "COP (sin IVA)",
    unitEn: "COP (ex-VAT)",
    explainEs:
      "Lista de precios NanoFreeze. Con 24 franjas/pallet ⇒ 725 COP por franja.",
    explainEn:
      "NanoFreeze price list. At 24 strips/pallet ⇒ 725 COP per strip.",
  },
  {
    key: "nfPalletWeightKg",
    labelEs: "Peso del pallet NF",
    labelEn: "NF pallet weight",
    unitEs: "kg",
    unitEn: "kg",
    explainEs:
      "Peso del pallet de capas ⇒ 0.125 kg por franja (derivado, override-able por caja).",
    explainEn:
      "Weight of the layer pallet ⇒ 0.125 kg per strip (derived, overridable per box).",
  },
  {
    key: "copPerUsd",
    labelEs: "TRM de referencia",
    labelEn: "Reference FX rate",
    unitEs: "COP/USD",
    unitEn: "COP/USD",
    explainEs:
      "Tasa fija sólo para presentar montos en USD. No es un tipo de cambio en vivo.",
    explainEn:
      "Fixed rate used only to present USD amounts. Not a live exchange rate.",
  },
  {
    key: "layerLifeDays",
    labelEs: "Vida útil de una capa",
    labelEn: "Layer useful life",
    unitEs: "días",
    unitEn: "days",
    explainEs:
      "Vida útil de una capa con logística de regreso. Define el horizonte de análisis nacional.",
    explainEn:
      "Useful life of a layer with return logistics. Sets the domestic analysis horizon.",
  },
  {
    key: "freezeHours",
    labelEs: "Recongelado",
    labelEn: "Re-freeze time",
    unitEs: "h",
    unitEn: "h",
    explainEs:
      "Horas para recongelar / recargar una capa antes de reusarla. Suma al ciclo de reúso.",
    explainEn:
      "Hours to re-freeze / recharge a layer before reuse. Added to the reuse cycle.",
  },
  {
    key: "daysPerMonth",
    labelEs: "Días por mes",
    labelEn: "Days per month",
    unitEs: "días",
    unitEn: "days",
    explainEs: "Constante de normalización mensual.",
    explainEn: "Monthly normalisation constant.",
  },
  {
    key: "dieselKgCo2PerL",
    labelEs: "Factor de emisión del diésel",
    labelEn: "Diesel emission factor",
    unitEs: "kg CO₂/L",
    unitEn: "kg CO₂/L",
    explainEs: "Factor de emisión estándar del diésel.",
    explainEn: "Standard diesel emission factor.",
  },
  {
    key: "reeferLPerHour",
    labelEs: "Consumo del reefer",
    labelEn: "Reefer fuel burn",
    unitEs: "L/h",
    unitEn: "L/h",
    explainEs: "Consumo del equipo reefer del camión.",
    explainEn: "Fuel burn of the truck's reefer unit.",
  },
  {
    key: "airKgCo2PerTonKm",
    labelEs: "Factor flete aéreo",
    labelEn: "Air-freight factor",
    unitEs: "kg CO₂e/t·km",
    unitEn: "kg CO₂e/t·km",
    explainEs: "Factor modal de emisiones del flete aéreo.",
    explainEn: "Modal emission factor for air freight.",
  },
  {
    key: "truckKgCo2PerTonKm",
    labelEs: "Factor flete terrestre",
    labelEn: "Road-freight factor",
    unitEs: "kg CO₂e/t·km",
    unitEn: "kg CO₂e/t·km",
    explainEs: "Factor modal de emisiones del flete terrestre.",
    explainEn: "Modal emission factor for road freight.",
  },
  {
    key: "productKgCo2PerKg",
    labelEs: "Huella del producto",
    labelEn: "Product footprint",
    unitEs: "kg CO₂e/kg",
    unitEn: "kg CO₂e/kg",
    explainEs: "Huella de carbono embebida del producto perecedero.",
    explainEn: "Embedded carbon footprint of the perishable product.",
  },
  {
    key: "landfillKgCo2PerKg",
    labelEs: "Descomposición evitada",
    labelEn: "Avoided decomposition",
    unitEs: "kg CO₂e/kg",
    unitEn: "kg CO₂e/kg",
    explainEs:
      "Emisiones de descomposición en relleno sanitario que se evitan al salvar producto.",
    explainEn:
      "Landfill decomposition emissions avoided by rescuing spoiled product.",
  },
  {
    key: "manufacturingKgCo2PerLayer",
    labelEs: "Fabricación de la capa",
    labelEn: "Layer manufacturing",
    unitEs: "kg CO₂e/capa",
    unitEn: "kg CO₂e/layer",
    explainEs:
      "Huella de fabricación de una capa. Placeholder en 0 — confirmar con proveedor.",
    explainEn:
      "Manufacturing footprint of one layer. Placeholder at 0 — confirm with supplier.",
    source: "Placeholder — confirmar con proveedor / confirm with supplier",
  },
  {
    key: "dieselPriceCopPerL",
    labelEs: "Precio del diésel",
    labelEn: "Diesel price",
    unitEs: "COP/L",
    unitEn: "COP/L",
    explainEs: "Precio del diésel para costear el peso extra de las capas.",
    explainEn: "Diesel price used to cost the extra layer weight.",
  },
];

/**
 * Note on the pallet layer cost (`CapasLayersPallets.costPerPalletLayerCop`):
 * it is a per-input field, not a global assumption, so it has no entry here.
 * The Excel's 2 900 COP is a placeholder — surface it in the UI with the same
 * "confirmar con proveedor / confirm with supplier" caveat as the layer
 * manufacturing footprint above.
 */
