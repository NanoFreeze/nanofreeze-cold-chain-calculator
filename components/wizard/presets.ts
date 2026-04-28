import type {
  CapasInput,
  CapasMarket,
  CapasPackaging,
} from "@nanofreeze/coldchain-calc/capas";

/**
 * One worked example per scenario — the four fixtures the engine's parity tests
 * are built from (reverse-derived from the "Business Case - Capas Frias"
 * workbook). Selecting a scenario loads its preset wholesale, so the form is
 * never empty and every number on screen starts from a case that was validated
 * against the spreadsheet.
 *
 * Mirrors CAPAS_SCENARIO_PRESETS in @nanofreeze/cold-chain-ui. Keep them in
 * step: if a fixture moves in the engine's tests, it moves here too.
 */

export type ScenarioKey = `${CapasMarket}-${CapasPackaging}`;

const PRESETS: Record<ScenarioKey, CapasInput> = {
  "nacional-cajas": {
    layers: {
      packaging: "cajas",
      stripsPerLayer: 7,
      layersPerBox: 1,
      boxLengthCm: 105,
      heatSensitivity: "sensible",
    },
    product: {
      name: "",
      unitsPerCarrier: 150,
      productKgPerCarrier: 16,
      valuePerCarrierCop: 360_000,
    },
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
  },

  "nacional-pallets": {
    layers: {
      packaging: "pallets",
      layersPerPallet: 8,
      costPerPalletLayerCop: 2_900,
      weightPerPalletLayerKg: 1.5,
    },
    product: {
      name: "",
      unitsPerCarrier: 3_000,
      productKgPerCarrier: 320,
      valuePerCarrierCop: 7_200_000,
    },
    spoilage: { spoilagePct: 0.15, coldChainSharePct: 0.5, residualSharePct: 0 },
    logistics: {
      market: "nacional",
      reeferTruckCostCop: 3_500_000,
      reeferPremiumPct: 0.4,
      carriersPerTruck: 10,
      tripsPerMonth: 8,
      distanceKm: 500,
      reeferHoursPerTrip: 10,
      reuse: { hasReturnLogistics: true, outboundDays: 1 },
    },
  },

  "exportacion-cajas": {
    layers: {
      packaging: "cajas",
      stripsPerLayer: 7,
      layersPerBox: 1,
      boxLengthCm: 105,
      heatSensitivity: "sensible",
    },
    product: {
      name: "",
      unitsPerCarrier: 150,
      productKgPerCarrier: 16,
      valuePerCarrierCop: 360_000,
    },
    // Export spoilage runs double the domestic figure — longer chain, more
    // handoffs. Straight from the workbook.
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
  },

  "exportacion-pallets": {
    layers: {
      packaging: "pallets",
      layersPerPallet: 8,
      costPerPalletLayerCop: 2_900,
      weightPerPalletLayerKg: 1.5,
    },
    product: {
      name: "",
      unitsPerCarrier: 3_000,
      productKgPerCarrier: 320,
      valuePerCarrierCop: 7_200_000,
    },
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
  },
};

/** A fresh, independently-mutable copy — the caller owns it and edits it in
 *  place through setState, so handing out the shared literal would let one
 *  session's typing leak into the next scenario switch. */
export function presetFor(market: CapasMarket, packaging: CapasPackaging): CapasInput {
  return structuredClone(PRESETS[`${market}-${packaging}`]);
}
