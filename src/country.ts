/**
 * Country / currency / locale catalog for the cold-chain wizard.
 *
 * Cold-chain ships with a tighter country list than the energy-efficiency
 * `@nanofreeze/business-case/country` table — we only target fruit-
 * export markets in Latin America + the US. Extending is cheap: add a row
 * and the picker shows it.
 *
 * Every country picks the format pattern via `Intl.NumberFormat` keyed on
 * `locale + currency`. We never hardcode a prefix string — that's how the
 * Caribbean-Exotics seed used to read "COP 487.200"; now the same money
 * value reads "US$ 487,200" or "R$ 487.200" depending on the picked
 * country, with zero callsite changes.
 *
 * Default-export `COLD_CHAIN_DEFAULT_COUNTRY` is the Caribbean Exotics
 * country (Colombia) so the wizard pre-loads with familiar values.
 */

export interface ColdChainCountry {
  /** ISO 3166-1 alpha-2 code. Used as the persisted value on
   *  `cold_chain_proposals.country_code` and as the lookup key. */
  code: string;
  /** ISO 4217 currency code. Drives the formatter currency style and
   *  the symbol displayed in the wizard. */
  currency: string;
  /** BCP 47 locale tag. Drives the formatter's grouping (1.000 vs 1,000)
   *  and the wizard's chrome (Spanish vs English vs Portuguese). */
  locale: string;
  /** Human-readable name in the locale's own language. */
  displayName: string;
  /** Phone-dial code prefix — used by the wizard's optional phone field
   *  to hint the expected shape. */
  phonePrefix: string;
  /** Per-country price defaults (in the country's local currency).
   *  Applied when the wizard's CountryPicker switches countries — the
   *  alternative is showing a Mexican prospect 17,400 *MXN* per capa
   *  (10× the actual price) because the seed was COP-denominated.
   *  Numbers are sales-team-tunable; sourcing notes live in the seed
   *  itself. */
  defaultCostPerCapa: number;
  defaultExportPricePerKg: number;
  defaultLocalPricePerKg: number;
}

export const COLD_CHAIN_COUNTRIES: ColdChainCountry[] = [
  // Colombia — Caribbean Exotics seed (the canonical reference).
  {
    code: "CO",
    currency: "COP",
    locale: "es-CO",
    displayName: "Colombia",
    phonePrefix: "+57",
    defaultCostPerCapa: 17_400,
    defaultExportPricePerKg: 12_000,
    defaultLocalPricePerKg: 4_500,
  },
  // México — ~$4.50 USD per capa at MXN 17/USD; mango export to US at
  // ~$4-5/kg, local-market mango at ~$1.50/kg.
  {
    code: "MX",
    currency: "MXN",
    locale: "es-MX",
    displayName: "México",
    phonePrefix: "+52",
    defaultCostPerCapa: 80,
    defaultExportPricePerKg: 80,
    defaultLocalPricePerKg: 30,
  },
  // Perú — avocado export ~$5/kg, local ~$1.50/kg.
  {
    code: "PE",
    currency: "PEN",
    locale: "es-PE",
    displayName: "Perú",
    phonePrefix: "+51",
    defaultCostPerCapa: 17,
    defaultExportPricePerKg: 18,
    defaultLocalPricePerKg: 5,
  },
  // Ecuador (USD).
  {
    code: "EC",
    currency: "USD",
    locale: "es-EC",
    displayName: "Ecuador",
    phonePrefix: "+593",
    defaultCostPerCapa: 4.5,
    defaultExportPricePerKg: 3,
    defaultLocalPricePerKg: 1,
  },
  // Brasil — BRL ~5/USD; mango export ~R$ 20/kg, local ~R$ 7/kg.
  {
    code: "BR",
    currency: "BRL",
    locale: "pt-BR",
    displayName: "Brasil",
    phonePrefix: "+55",
    defaultCostPerCapa: 23,
    defaultExportPricePerKg: 20,
    defaultLocalPricePerKg: 7,
  },
  // Chile — CLP ~950/USD; blueberry export ~$8/kg, local ~$2/kg.
  {
    code: "CL",
    currency: "CLP",
    locale: "es-CL",
    displayName: "Chile",
    phonePrefix: "+56",
    defaultCostPerCapa: 4_300,
    defaultExportPricePerKg: 7_500,
    defaultLocalPricePerKg: 1_800,
  },
  // Argentina — ARS volatile; rough quote at ARS 1,000/USD parity.
  {
    code: "AR",
    currency: "ARS",
    locale: "es-AR",
    displayName: "Argentina",
    phonePrefix: "+54",
    defaultCostPerCapa: 4_500,
    defaultExportPricePerKg: 4_000,
    defaultLocalPricePerKg: 1_500,
  },
  // United States — domestic fruit logistics.
  {
    code: "US",
    currency: "USD",
    locale: "en-US",
    displayName: "United States",
    phonePrefix: "+1",
    defaultCostPerCapa: 4.5,
    defaultExportPricePerKg: 4,
    defaultLocalPricePerKg: 1.5,
  },
];

export const COLD_CHAIN_DEFAULT_COUNTRY: ColdChainCountry =
  COLD_CHAIN_COUNTRIES[0]!;

/** Look up a country by ISO code. Unknown codes fall back to the default
 *  (Colombia) — the wizard should never crash on a stale `country_code`
 *  even if the catalog shrinks. */
export function getColdChainCountry(code: string | null | undefined): ColdChainCountry {
  if (!code) return COLD_CHAIN_DEFAULT_COUNTRY;
  const upper = code.toUpperCase();
  return (
    COLD_CHAIN_COUNTRIES.find((c) => c.code === upper) ??
    COLD_CHAIN_DEFAULT_COUNTRY
  );
}

/** Render the proposal's shipping scope as a human label —
 *    - international with destination → "Colombia → United States"
 *    - international without destination yet → "Colombia"
 *    - domestic → "Colombia"
 *
 *  Used everywhere we previously printed just `country.displayName` so
 *  the chrome (detail page, list, PDF, share view) consistently shows
 *  origin → destination when known. */
export function formatShippingScope(args: {
  originCode: string | null | undefined;
  shipMode: "domestic" | "international" | null | undefined;
  destinationCode: string | null | undefined;
}): string {
  const origin = getColdChainCountry(args.originCode);
  if (args.shipMode === "international" && args.destinationCode) {
    const dest = getColdChainCountry(args.destinationCode);
    return `${origin.displayName} → ${dest.displayName}`;
  }
  return origin.displayName;
}
