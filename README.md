# @nanofreeze/coldchain-calc

Two pure, dependency-light **cold-chain models** for
[NanoFreeze](https://nanofreeze.tech) cold layers (*capas*):

1. **Revenue-uplift model** (`.` / `./calc`) — how much more money a route earns
   when cold layers convert local-grade product to export-grade, cutting waste
   (*merma*). Reports per-trip differential, lifetime gain, ROI, and payback.
   Documented below.
2. **Cost & impact model** (`./capas`, v2) — the *capas* module: reefer
   replacement + spoilage recovery + CO₂ + perishables across four logistics
   scenarios. Documented in [its own section](#cost--impact-model-v2--capas-module).

Both are **pure and framework-free** — no IO, no globals, no `Date`, same input
→ same output — so they run anywhere: Node, the browser, edge. The only optional
dependency is [`zod`](https://zod.dev) (the runtime input schemas).

> Derived from real fruit-export logistics spreadsheets; MIT licensed.

## Install

```bash
npm install @nanofreeze/coldchain-calc
```

## Revenue-uplift model (v1)

The original engine — cold layers convert local-grade product to export-grade,
so revenue per trip rises. `computeColdChain` reports the per-trip differential,
lifetime gain, ROI, and payback.

```ts
import {
  computeColdChain,
  pickRecommendedScenario,
  paybackTrips,
  COLD_CHAIN_DEFAULTS,
} from "@nanofreeze/coldchain-calc";

const output = computeColdChain({
  ...COLD_CHAIN_DEFAULTS,
  // ...override any field
});

const best = pickRecommendedScenario(output);          // highest lifetime gain
const trips = best && paybackTrips(best, output.totalCapaCost); // trips to break even
```

### Browser / zero-zod imports

The barrel (`.`) pulls in `zod` via the input schema. To keep a browser bundle
zod-free, import the pure subpaths directly:

```ts
import { computeColdChain } from "@nanofreeze/coldchain-calc/calc";
import { COLD_CHAIN_DEFAULTS } from "@nanofreeze/coldchain-calc/defaults";
import { getColdChainCountry } from "@nanofreeze/coldchain-calc/country";
```

## The model (in one breath)

`totalTruckKg = kgPerCanastilla × canastillasPerTruck`. One *capa* per tower of
baskets (`capasPerTruck = ceil(canastillasPerTruck / canastillasPerTorre)`), so
`totalCapaCost = costPerCapa × capasPerTruck`, depreciated across
`monthsLifespan × tripsPerMonth` trips. Each scenario reallocates the load
between export/local/waste; the **differential** vs. the baseline scenario,
minus per-trip capa depreciation, is the net gain. Waste is informational (it
never reached sale). See `calc.ts` — it's ~160 lines and heavily commented.

## Cost & impact model (v2 — capas module)

The `./capas` subpath is a second, complementary model. Where v1 measures a
*revenue uplift*, v2 measures the **cost and impact of using cold layers as a
refrigeration replacement**, and reports three first-class outcomes:

- **Money** — reefer-truck (or air-lane) replacement savings net of the layer
  investment, plus recovered cargo value, normalised per event / month / year
  (and per layer-life horizon for domestic lanes).
- **CO₂** — avoided spoilage decomposition + avoided reefer diesel, minus the
  penalty of hauling the extra layer weight and the layers' embodied
  manufacturing footprint.
- **Perishables** — kg and units of product rescued from spoilage.

It spans **four scenarios** — `market` (`nacional` | `exportacion`) ×
`packaging` (`cajas` | `pallets`): domestic reefer-truck replacement with
reusable layer sets, and export air freight with an optional refrigerated land
leg. `capasScenarioLabel(market, packaging, locale)` renders the picker copy
("Nacional · Cajas", "Export · Pallets").

Every global assumption ships **bilingual (ES/EN) explain metadata** —
`CAPAS_ASSUMPTIONS_META` carries a label, unit, explanation, and provenance for
each field in `CAPAS_DEFAULT_ASSUMPTIONS`, so a UI or PDF can justify (and let
the user override) every number.

```ts
import {
  computeCapas,
  capasScenarioLabel,
  CAPAS_DEFAULT_ASSUMPTIONS,
} from "@nanofreeze/coldchain-calc/capas";

const out = computeCapas({
  layers: { packaging: "cajas", stripsPerLayer: 7, layersPerBox: 1 },
  product: { unitsPerCarrier: 16, productKgPerCarrier: 16, valuePerCarrierCop: 360_000 },
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
  // assumptions: { copPerUsd: 4000 },  // override any global default
});

out.monetary.total.perEvent;        // { cop, usd } saved per trip
out.environmental.annualKg;         // net CO₂ avoided per year
out.perishables.perEvent.kgSaved;   // product rescued per trip
capasScenarioLabel("exportacion", "pallets", "en"); // "Export · Pallets"
```

Money is always `{ cop, usd }` with `usd = cop / copPerUsd`. The full input and
output contracts live in [`src/capas/types.ts`](./src/capas/types.ts); parity
against the source workbook is locked in [`src/capas.test.ts`](./src/capas.test.ts).

## Demo

A self-contained calculator page lives in [`demo/`](./demo). Build the package,
then serve it:

```bash
npm install && npm run build && npm run demo
```

## Develop

```bash
npm run build      # emit dist/ (ESM + .d.ts)
npm run typecheck
npm test           # vitest
```

## License

MIT © NanoFreeze
