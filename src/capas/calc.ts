import { CAPAS_DEFAULT_ASSUMPTIONS } from "./assumptions.js";
import type {
  CapasAssumptions,
  CapasDetails,
  CapasEnvironmental,
  CapasFlow,
  CapasInput,
  CapasLayers,
  CapasLayersOutput,
  CapasMarket,
  CapasMoney,
  CapasMonetary,
  CapasOutput,
  CapasPackaging,
  CapasPerishables,
  CapasReuseOutput,
  CapasSocialOutput,
} from "./types.js";

/** Clamp to a finite, non-negative number — the same boundary guard the v1
 *  engine uses. Every raw numeric input flows through this so a stray negative
 *  or NaN can never leak into a downstream product or ratio. */
function clampNonNeg(n: number): number {
  return !Number.isFinite(n) || n < 0 ? 0 : n;
}

/** Guarded division: returns 0 when the denominator is 0 (or non-finite)
 *  instead of NaN/Infinity. Used everywhere a denominator can legitimately be
 *  0 (cycle length, investment, trips, unit counts, reefer cost). */
function safeDiv(numerator: number, denominator: number): number {
  return denominator > 0 && Number.isFinite(denominator)
    ? numerator / denominator
    : 0;
}

// ── Scenario label ──────────────────────────────────────────────────────────

/** Human-readable scenario name, e.g. "Nacional · Cajas" / "Export · Pallets". */
export function capasScenarioLabel(
  market: CapasMarket,
  packaging: CapasPackaging,
  locale: "es" | "en",
): string {
  const marketLabel =
    locale === "es"
      ? market === "nacional"
        ? "Nacional"
        : "Exportación"
      : market === "nacional"
        ? "Domestic"
        : "Export";
  const packagingLabel =
    locale === "es"
      ? packaging === "cajas"
        ? "Cajas"
        : "Pallets"
      : packaging === "cajas"
        ? "Boxes"
        : "Pallets";
  return `${marketLabel} · ${packagingLabel}`;
}

// ── Compute ────────────────────────────────────────────────────────────────

/**
 * Run the Capas Frías v2 cost & impact model. Pure: no IO, no globals, no
 * `Date`. Same input → same output.
 *
 * Structure: resolve assumptions + the layer economics (shared), then branch on
 * `market`. Nacional carries a reuse cycle and a 6-month horizon; export is
 * single-use and reports per-shipment/month/year only. Money is always
 * `{cop, usd}` with `usd = cop / copPerUsd`.
 */
export function computeCapas(input: CapasInput): CapasOutput {
  const a: CapasAssumptions = {
    ...CAPAS_DEFAULT_ASSUMPTIONS,
    ...(input.assumptions ?? {}),
  };

  // Money helper is closed over the resolved TRM assumption.
  const money = (cop: number): CapasMoney => ({
    cop,
    usd: safeDiv(cop, a.copPerUsd),
  });
  const zeroMoney = money(0);

  // ── Layer economics (shared across markets) ──────────────────────────────
  //
  // A "carrier" is one box (cajas) or one pallet. `layersPerCarrier` is the
  // count of physical layers/strips on it — the manufacturing-footprint and
  // strip-cost multiplier. `costPerStrip` derives from the NF pallet price;
  // `stripWeightKg` from the NF pallet weight (overridable per box).
  const layers: CapasLayers = input.layers;
  const costPerStrip = safeDiv(a.nfPalletCostCop, a.stripsPerNfPallet); // 725
  const stripWeightKg =
    layers.packaging === "cajas" && layers.stripWeightKgOverride !== undefined
      ? clampNonNeg(layers.stripWeightKgOverride)
      : safeDiv(a.nfPalletWeightKg, a.stripsPerNfPallet); // 0.125

  let layersPerCarrier: number;
  let costPerCarrierCop: number;
  let weightPerCarrierKg: number;
  if (layers.packaging === "cajas") {
    layersPerCarrier =
      clampNonNeg(layers.stripsPerLayer) * clampNonNeg(layers.layersPerBox);
    costPerCarrierCop = layersPerCarrier * costPerStrip;
    weightPerCarrierKg = layersPerCarrier * stripWeightKg;
  } else {
    layersPerCarrier = clampNonNeg(layers.layersPerPallet);
    costPerCarrierCop = layersPerCarrier * clampNonNeg(layers.costPerPalletLayerCop);
    weightPerCarrierKg = layersPerCarrier * clampNonNeg(layers.weightPerPalletLayerKg);
  }

  const unitsPerCarrier = clampNonNeg(input.product.unitsPerCarrier);
  const productKgPerCarrier = clampNonNeg(input.product.productKgPerCarrier);
  const valuePerCarrierCop = clampNonNeg(input.product.valuePerCarrierCop);

  const layersOut: CapasLayersOutput = {
    unitsPerCarrier,
    costPerCarrier: money(costPerCarrierCop),
    costPerProductUnit: money(safeDiv(costPerCarrierCop, unitsPerCarrier)),
    weightPerCarrierKg,
  };

  // ── Spoilage recovery (shared) ───────────────────────────────────────────
  //
  // recoveredFraction = spoilage% × (cold-chain share − residual share).
  const recoveredFraction = clampNonNeg(
    clampNonNeg(input.spoilage.spoilagePct) *
      (clampNonNeg(input.spoilage.coldChainSharePct) -
        clampNonNeg(input.spoilage.residualSharePct)),
  );

  // Manufacturing footprint embodied in ONE carrier's layers. Each branch
  // scales it by its carrier count (Excel: franjas totales por camión C46,
  // capas del envío G70×G13). Export subtracts the per-shipment total every
  // shipment (single use); nacional subtracts the per-set total once per
  // purchase cycle over the horizon (the same layers are reused every trip).
  const manufacturingPerCarrierKg =
    layersPerCarrier * clampNonNeg(a.manufacturingKgCo2PerLayer);

  const social: CapasSocialOutput | null = input.social
    ? {
        jobsTotal: input.social.jobsTotal ?? null,
        jobsMen: input.social.jobsMen ?? null,
        jobsWomen: input.social.jobsWomen ?? null,
      }
    : null;

  const co2PerKgSpoiled = clampNonNeg(a.productKgCo2PerKg) + clampNonNeg(a.landfillKgCo2PerKg);

  if (input.logistics.market === "nacional") {
    const log = input.logistics;
    const carriersPerTruck = clampNonNeg(log.carriersPerTruck);
    const tripsPerMonth = clampNonNeg(log.tripsPerMonth);
    const distanceKm = clampNonNeg(log.distanceKm);
    const reeferHoursPerTrip = clampNonNeg(log.reeferHoursPerTrip);
    const reeferCost = clampNonNeg(log.reeferTruckCostCop);
    const premium = clampNonNeg(log.reeferPremiumPct);

    // ── Reuse cycle (§4.2) ────────────────────────────────────────────────
    const freezeDays = safeDiv(a.freezeHours, 24); // 1.5
    const outboundDays = clampNonNeg(log.reuse.outboundDays);
    const returnDays =
      log.reuse.returnDaysOverride !== undefined
        ? clampNonNeg(log.reuse.returnDaysOverride)
        : outboundDays;
    const cycleDays = freezeDays + outboundDays + returnDays;
    // lifeMonths is ALWAYS derived (spec deviation #2 — the Excel hardcodes 6
    // on one sheet). It doubles as the analysis horizon for nacional.
    const lifeMonths = safeDiv(a.layerLifeDays, a.daysPerMonth); // 6
    const usesPerLayer = log.reuse.hasReturnLogistics
      ? Math.floor(safeDiv(a.layerLifeDays, cycleDays))
      : 1;
    const tripsPerMonthPerSet = Math.floor(safeDiv(a.daysPerMonth, cycleDays));
    const setCostCop = carriersPerTruck * costPerCarrierCop;
    // With return logistics: buy enough sets to cover the month's trips. Without
    // it (spec deviation #5, the workbook's degenerate branch): single-use, so
    // buy one set per trip across the whole horizon.
    const setsToBuy = log.reuse.hasReturnLogistics
      ? Math.max(1, tripsPerMonthPerSet > 0 ? Math.ceil(safeDiv(tripsPerMonth, tripsPerMonthPerSet)) : 1)
      : tripsPerMonth * lifeMonths;
    const investmentCop = setsToBuy * setCostCop;
    const amortizedPerTripCop = safeDiv(investmentCop, tripsPerMonth * lifeMonths);

    const reuse: CapasReuseOutput = {
      cycleDays,
      usesPerLayer,
      tripsPerMonthPerSet,
      setsToBuy,
      setCost: money(setCostCop),
      investment: money(investmentCop),
      amortizedPerTrip: money(amortizedPerTripCop),
      lifeMonths,
    };

    // ── Transport savings (§4.3) ──────────────────────────────────────────
    // transportSavings is GROSS (reefer − non-reefer). The Excel's per-trip
    // "ahorro" (option A − option B, net of amortized layers) surfaces via
    // details.optionA/optionB below.
    const nonReeferCost = safeDiv(reeferCost, 1 + premium);
    const grossTransportSavings = reeferCost - nonReeferCost;
    const optionA = reeferCost;
    const optionB = nonReeferCost + amortizedPerTripCop;

    // ── Recovery + fuel penalty (§4.4, §4.5) ──────────────────────────────
    const recoveredValueCop = carriersPerTruck * valuePerCarrierCop * recoveredFraction;
    const kgSaved = carriersPerTruck * productKgPerCarrier * recoveredFraction;
    const unitsSaved = carriersPerTruck * unitsPerCarrier * recoveredFraction;

    const layerWeightPerTruckKg = carriersPerTruck * weightPerCarrierKg;
    const penaltyWeightKg =
      (layerWeightPerTruckKg / 1000) * distanceKm * clampNonNeg(a.truckKgCo2PerTonKm);
    const extraFuelL = safeDiv(penaltyWeightKg, a.dieselKgCo2PerL);
    const extraFuelCostCop = extraFuelL * clampNonNeg(a.dieselPriceCopPerL);

    // ── Nacional temporal flow: perEvent → month (×trips) → year (×12) →
    //    horizon (×lifeMonths). ──────────────────────────────────────────
    const horizonMonths = lifeMonths;
    const nacionalFlow = (perEventCop: number): CapasFlow => {
      const perMonthCop = perEventCop * tripsPerMonth;
      return {
        perEvent: money(perEventCop),
        perMonth: money(perMonthCop),
        annual: money(perMonthCop * 12),
        perHorizon: money(perMonthCop * horizonMonths),
      };
    };

    const totalPerEventCop =
      grossTransportSavings - amortizedPerTripCop + recoveredValueCop - extraFuelCostCop;

    const totalFlow = nacionalFlow(totalPerEventCop);
    const monetary: CapasMonetary = {
      transportSavings: nacionalFlow(grossTransportSavings),
      recoveredValue: nacionalFlow(recoveredValueCop),
      nfInvestment: nacionalFlow(amortizedPerTripCop),
      extraCost: nacionalFlow(extraFuelCostCop),
      total: totalFlow,
      // Excel E58: (gross − amortized) / reeferCost.
      savingsPctVsReefer: safeDiv(grossTransportSavings - amortizedPerTripCop, reeferCost),
      roi: safeDiv(totalFlow.perHorizon?.cop ?? 0, investmentCop),
      // First trip must cover the FULL set purchase (not the amortized share):
      // gross savings + recovered − extra fuel − full setCost ≥ 0.
      positiveFromFirstEvent:
        grossTransportSavings + recoveredValueCop - extraFuelCostCop - setCostCop >= 0,
    };

    // ── Environmental (§4.7) ──────────────────────────────────────────────
    const avoidedSpoilageKg = kgSaved * co2PerKgSpoiled;
    const avoidedReeferKg = reeferHoursPerTrip * clampNonNeg(a.reeferLPerHour) * clampNonNeg(a.dieselKgCo2PerL);
    // netKg EXCLUDES manufacturing for nacional (layers reused → manufactured
    // once, not per event); it is subtracted once over the horizon instead.
    const netKgPerEvent = avoidedSpoilageKg + avoidedReeferKg - penaltyWeightKg;
    // One set = one truck's worth of layers (carriers × layers per carrier).
    const manufacturingPerSetKg = carriersPerTruck * manufacturingPerCarrierKg;
    const manufacturingPerHorizon = setsToBuy * manufacturingPerSetKg;
    const eventsOverHorizon = tripsPerMonth * horizonMonths;
    const perMonthKg = netKgPerEvent * tripsPerMonth;
    // annual: monthly rate × 12 minus manufacturing once per purchase cycle
    // (12/horizonMonths cycles per year).
    const annualKg = perMonthKg * 12 - manufacturingPerHorizon * safeDiv(12, horizonMonths);
    const perHorizonKg = netKgPerEvent * eventsOverHorizon - manufacturingPerHorizon;

    const environmental: CapasEnvironmental = {
      perEvent: {
        avoidedSpoilageKg,
        avoidedReeferKg,
        penaltyWeightKg,
        manufacturingKg: manufacturingPerSetKg,
        netKg: netKgPerEvent,
      },
      perMonthKg,
      annualKg,
      annualTons: annualKg / 1000,
      perHorizonKg,
      perHorizonTons: perHorizonKg / 1000,
    };

    // ── Perishables ───────────────────────────────────────────────────────
    const perishables: CapasPerishables = {
      perEvent: {
        kgSaved,
        unitsSaved,
        valueRecovered: money(recoveredValueCop),
      },
      perMonthKg: kgSaved * tripsPerMonth,
      annualKg: kgSaved * tripsPerMonth * 12,
      perHorizonKg: kgSaved * eventsOverHorizon,
      perMonthUnits: unitsSaved * tripsPerMonth,
      annualUnits: unitsSaved * tripsPerMonth * 12,
    };

    const details: CapasDetails = {
      market: "nacional",
      optionAPerTrip: money(optionA),
      optionBPerTrip: money(optionB),
      nonReeferCostPerTrip: money(nonReeferCost),
      recoveryTimesPerTrip: safeDiv(optionA - optionB, setCostCop),
      extraFuelLitersPerTrip: extraFuelL,
    };

    return {
      modelVersion: 2,
      market: "nacional",
      packaging: layers.packaging,
      eventLabel: "trip",
      eventsPerMonth: tripsPerMonth,
      horizonMonths,
      assumptions: a,
      layers: layersOut,
      reuse,
      monetary,
      environmental,
      perishables,
      social,
      details,
    };
  }

  // ── Export (§4.6) ──────────────────────────────────────────────────────
  const log = input.logistics;
  const carriersPerShipment = clampNonNeg(log.carriersPerShipment);
  const shipmentsPerMonth = clampNonNeg(log.shipmentsPerMonth);
  const airDistanceKm = clampNonNeg(log.airDistanceKm);
  const airRatePerKgCop = clampNonNeg(log.airRatePerKgCop);

  // Per-carrier air freight. The extra freight from the layer weight is the
  // export analogue of the layer investment — it's folded into nfInvestment.
  const freightWithoutCop = airRatePerKgCop * productKgPerCarrier;
  const extraFreightCop = airRatePerKgCop * weightPerCarrierKg;
  const freightWithCop = freightWithoutCop + extraFreightCop;
  const investmentPerCarrierCop = costPerCarrierCop + extraFreightCop;

  const recoveredPerCarrierCop = valuePerCarrierCop * recoveredFraction;
  const netBenefitPerCarrierCop = recoveredPerCarrierCop - investmentPerCarrierCop;
  // ROI is the standard netBenefit/investment (spec deviation #1 — the Excel's
  // G66 double-counts the investment).
  const roiPerCarrier = safeDiv(netBenefitPerCarrierCop, investmentPerCarrierCop);

  const kgSaved = carriersPerShipment * productKgPerCarrier * recoveredFraction;
  const unitsSaved = carriersPerShipment * unitsPerCarrier * recoveredFraction;
  const recoveredValueShipmentCop = recoveredPerCarrierCop * carriersPerShipment;

  // ── Optional land leg — a reefer truck run the layers also replace. ──────
  const landLeg = log.landLeg;
  const replaceReefer = landLeg?.replaceReeferTruck ?? false;
  const landCarriersPerTruck = clampNonNeg(landLeg?.carriersPerTruck ?? 0);
  const trucksPerShipment = landLeg
    ? Math.ceil(safeDiv(carriersPerShipment, landCarriersPerTruck))
    : 0;
  const landReeferCost = clampNonNeg(landLeg?.reeferTruckCostCop ?? 0);
  const landPremium = clampNonNeg(landLeg?.reeferPremiumPct ?? 0);
  const landNonReefer = safeDiv(landReeferCost, 1 + landPremium);
  const savingsPerTruckCop = replaceReefer ? landReeferCost - landNonReefer : 0;
  const landSavingsCop = replaceReefer ? trucksPerShipment * savingsPerTruckCop : 0;

  // ── Export temporal flow: perEvent → month (×shipments) → year (×12).
  //    No horizon (single-use layers). ────────────────────────────────────
  const exportFlow = (perEventCop: number): CapasFlow => {
    const perMonthCop = perEventCop * shipmentsPerMonth;
    return {
      perEvent: money(perEventCop),
      perMonth: money(perMonthCop),
      annual: money(perMonthCop * 12),
      perHorizon: null,
    };
  };
  const exportZeroFlow: CapasFlow = {
    perEvent: zeroMoney,
    perMonth: zeroMoney,
    annual: zeroMoney,
    perHorizon: null,
  };

  const nfInvestmentPerEventCop = investmentPerCarrierCop * carriersPerShipment;
  const totalPerEventCop =
    landSavingsCop - nfInvestmentPerEventCop + recoveredValueShipmentCop; // extraCost = 0
  const totalFlow = exportFlow(totalPerEventCop);

  const monetary: CapasMonetary = {
    // transportSavings = land-leg savings; a zero-flow when the leg is disabled
    // (spec deviation #7 — no reefer replacement ⇒ no monetary saving).
    transportSavings: replaceReefer ? exportFlow(landSavingsCop) : exportZeroFlow,
    recoveredValue: exportFlow(recoveredValueShipmentCop),
    nfInvestment: exportFlow(nfInvestmentPerEventCop),
    extraCost: exportZeroFlow,
    total: totalFlow,
    savingsPctVsReefer: null,
    roi: roiPerCarrier,
    // Export layers are single-use → nfInvestment is already the full first
    // purchase, so this is just: is the first shipment net-positive?
    positiveFromFirstEvent: totalPerEventCop >= 0,
  };

  // ── Environmental (§4.7). Reefer CO₂ is avoided ONLY when the land leg
  //    replaces the reefer truck (spec deviation #7). Manufacturing is
  //    subtracted every shipment (single use). ───────────────────────────
  const avoidedSpoilageKg = kgSaved * co2PerKgSpoiled;
  const avoidedReeferKg = replaceReefer
    ? trucksPerShipment * clampNonNeg(landLeg?.reeferHoursPerTruck ?? 0) * clampNonNeg(a.reeferLPerHour) * clampNonNeg(a.dieselKgCo2PerL)
    : 0;
  const layerWeightPerShipmentKg = carriersPerShipment * weightPerCarrierKg;
  const penaltyWeightKg =
    (layerWeightPerShipmentKg / 1000) * airDistanceKm * clampNonNeg(a.airKgCo2PerTonKm);
  // All the shipment's layers are manufactured for this one use (Excel G92 =
  // carriers × layers/carrier × factor).
  const manufacturingPerShipmentKg = carriersPerShipment * manufacturingPerCarrierKg;
  const netKgPerEvent =
    avoidedSpoilageKg + avoidedReeferKg - penaltyWeightKg - manufacturingPerShipmentKg;
  const perMonthKg = netKgPerEvent * shipmentsPerMonth;

  const environmental: CapasEnvironmental = {
    perEvent: {
      avoidedSpoilageKg,
      avoidedReeferKg,
      penaltyWeightKg,
      manufacturingKg: manufacturingPerShipmentKg,
      netKg: netKgPerEvent,
    },
    perMonthKg,
    annualKg: perMonthKg * 12,
    annualTons: (perMonthKg * 12) / 1000,
    perHorizonKg: null,
    perHorizonTons: null,
  };

  const perishables: CapasPerishables = {
    perEvent: {
      kgSaved,
      unitsSaved,
      valueRecovered: money(recoveredValueShipmentCop),
    },
    perMonthKg: kgSaved * shipmentsPerMonth,
    annualKg: kgSaved * shipmentsPerMonth * 12,
    perHorizonKg: null,
    perMonthUnits: unitsSaved * shipmentsPerMonth,
    annualUnits: unitsSaved * shipmentsPerMonth * 12,
  };

  const details: CapasDetails = {
    market: "exportacion",
    freightWithoutPerCarrier: money(freightWithoutCop),
    freightWithPerCarrier: money(freightWithCop),
    extraFreightPerCarrier: money(extraFreightCop),
    freightDeltaPerUnit: money(safeDiv(extraFreightCop, unitsPerCarrier)),
    freightDeltaPct: safeDiv(extraFreightCop, freightWithoutCop),
    freightPctOfValueWithout: safeDiv(freightWithoutCop, valuePerCarrierCop),
    freightPctOfValueWith: safeDiv(freightWithCop, valuePerCarrierCop),
    perCarrier: {
      investment: money(investmentPerCarrierCop),
      recovered: money(recoveredPerCarrierCop),
      netBenefit: money(netBenefitPerCarrierCop),
      roi: roiPerCarrier,
    },
    landLeg: landLeg
      ? {
          trucksPerShipment,
          savingsPerTruck: money(savingsPerTruckCop),
          savingsPerShipment: money(landSavingsCop),
        }
      : null,
  };

  return {
    modelVersion: 2,
    market: "exportacion",
    packaging: layers.packaging,
    eventLabel: "shipment",
    eventsPerMonth: shipmentsPerMonth,
    horizonMonths: null,
    assumptions: a,
    layers: layersOut,
    reuse: null,
    monetary,
    environmental,
    perishables,
    social,
    details,
  };
}
