# NanoFreeze Cold-Chain Calculator

## NanoFreeze

[NanoFreeze](https://nanofreeze.tech) builds passive **cold layers** — *capas* —
that hold a cold chain without a running compressor. Slotted between the boxes or
pallets of a shipment, they keep perishables inside their safe temperature window
through transport and handling, so product that would otherwise be downgraded or
lost to spoilage (*merma*) arrives export-grade.

That does three things at once:

- **Money** — less product lost to spoilage, and less (or none) of the reefer
  trucking or air-freight refrigeration you would otherwise pay for.
- **CO₂** — avoided spoilage decomposition and avoided reefer diesel, net of the
  layers' own weight and manufacturing footprint.
- **Perishables** — kilograms and units of product rescued that would have been
  thrown away.

Those three numbers are the whole argument for switching to cold layers — and
they are specific to each route, product, and shipping pattern. **This calculator
exists so a grower, exporter, or logistics team can put in their own numbers and
see what cold layers would do for them — in money, CO₂, and kilograms — before
buying anything.** It's public and free to use, live at
**[opensource.nanofreeze.tech/cold-chain/calculator](https://opensource.nanofreeze.tech/cold-chain/calculator/)**.

## How the app works

The app is a guided wizard. You describe your shipment step by step, and it
reports what cold layers would save you:

1. **Scenario** — how you move product: domestic or export, in boxes or pallets.
2. **Product & packaging** — the product, its value/units/weight per box or
   pallet, and the cold layers (sizing is guided from box length and how
   heat-sensitive the product is, with a manual override).
3. **Logistics** — transport, frequency, distance, and — for domestic routes —
   the layer reuse cycle.
4. **Spoilage** — how much of your spoilage the cold layers recover.
5. **Results** — the **money saved, CO₂ avoided, and perishables rescued**, each
   broken down per trip, per month, and per year.

Every underlying assumption is editable, and each scenario loads pre-filled with
a worked example, so you get a sensible answer immediately and can then bend the
inputs to your own case. The interface is bilingual (Spanish / English) and
themed to match NanoFreeze (light / dark / system).

## How it's built

This repo is **two things in one**: a pure calculation **engine** published to npm,
and a **Next.js app** that wraps it in the wizard above.

- The **engine** (`src/`, published as `@nanofreeze/coldchain-calc`) is pure and
  framework-free — no IO, no globals, no `Date`, same input → same output — so it
  runs anywhere: Node, the browser, edge. Its only runtime dependency is
  [`zod`](https://zod.dev), for the input schemas. It's derived from NanoFreeze's
  real fruit-export logistics workbooks, and its parity against them is locked in
  tests.
- The **app** imports that engine under its published name — it never
  re-implements the math, so [`src/`](./src) stays the single source of truth. It
  builds to a **static export** (`output: "export"`): no server, no API, every
  calculation runs in the browser. That's what keeps it forkable — `npm run build`
  produces an `out/` directory you can drop on GitHub Pages, Netlify, Vercel, S3,
  or any static host.

```bash
npm install
npm run dev      # dev server on http://localhost:4173
npm run build    # static site → out/
npm start        # serve the built out/ locally on :4173
```

App source: [`app/`](./app) (routes + layout), [`components/`](./components)
(wizard, theme, chrome), [`messages/`](./messages) (ES/EN copy),
[`i18n/`](./i18n), [`styles/`](./styles) (design tokens).

### The engine (npm package)

```bash
npm install @nanofreeze/coldchain-calc
```

The package ships **two complementary models**.

**Cost & impact model (`./capas`)** — the model the app runs. It measures the
cost and impact of using cold layers as a refrigeration replacement across **four
scenarios** — `market` (`nacional` | `exportacion`) × `packaging` (`cajas` |
`pallets`) — and reports money, CO₂, and perishables. Every global assumption
ships with bilingual (ES/EN) explain metadata (`CAPAS_ASSUMPTIONS_META`), so a UI
or PDF can justify — and let the user override — every number.

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
  // assumptions: { copPerUsd: 4100 },  // override any global default (TRM defaults to 3248.87)
});

out.monetary.total.perEvent;        // { cop, usd } saved per trip
out.environmental.annualKg;         // net CO₂ avoided per year
out.perishables.perEvent.kgSaved;   // product rescued per trip
capasScenarioLabel("exportacion", "pallets", "en"); // "Export · Pallets"
```

Money is always `{ cop, usd }` with `usd = cop / copPerUsd`. The full input and
output contracts live in [`src/capas/types.ts`](./src/capas/types.ts); parity
against the source workbook is locked in [`src/capas.test.ts`](./src/capas.test.ts).

**Revenue-uplift model (`.` / `./calc`)** — the original engine. Cold layers
convert local-grade product to export-grade, so revenue per trip rises;
`computeColdChain` reports the per-trip differential, lifetime gain, ROI, and
payback.

```ts
import {
  computeColdChain,
  pickRecommendedScenario,
  paybackTrips,
  COLD_CHAIN_DEFAULTS,
} from "@nanofreeze/coldchain-calc";

const output = computeColdChain({ ...COLD_CHAIN_DEFAULTS /* …override any field */ });
const best = pickRecommendedScenario(output);                    // highest lifetime gain
const trips = best && paybackTrips(best, output.totalCapaCost);  // trips to break even
```

The barrel (`.`) pulls in `zod` via the input schema. To keep a browser bundle
zod-free, import the pure subpaths directly (`/calc`, `/defaults`, `/country`).

### Develop the engine

```bash
npm run build:lib   # emit dist/ (ESM + .d.ts) — the published package
npm run typecheck
npm test            # vitest — engine parity + sizing
```

`dist/` is built from [`tsconfig.build.json`](./tsconfig.build.json) and is what
`npm publish` ships — its only runtime dependency is `zod`. The web toolchain
(Next, React, Tailwind) is a devDependency and never reaches a consumer of the
package.

## License

MIT © NanoFreeze
