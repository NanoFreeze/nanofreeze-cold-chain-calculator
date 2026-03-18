// @nanofreeze/coldchain-calc — public API barrel.
//
// The pure savings model (`calc`, `types`, `country`, `defaults`) is
// framework-free and browser-safe. `input-schema` additionally pulls in
// `zod` for runtime validation — import it directly (`.../input-schema`) if
// you want to avoid the zod dependency in a browser bundle.
export * from "./calc.js";
export * from "./types.js";
export * from "./country.js";
export * from "./defaults.js";
export * from "./input-schema.js";

// Capas Frías v2 — the cost & impact model (reefer replacement + spoilage
// recovery + CO₂ + perishables). Namespaced under `./capas` for a zod-free
// pull; also re-exported here for convenience.
export * from "./capas/index.js";
