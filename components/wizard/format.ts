/**
 * Locale-aware formatters for the wizard. Vendored from
 * @nanofreeze/cold-chain-ui/format, trimmed to what a COP-only calculator needs
 * (the monorepo's version threads a currency code through because proposals are
 * persisted per country; here the engine is COP-denominated and USD is
 * presentation-only, derived from the copPerUsd assumption).
 *
 * Two conventions worth keeping: a non-finite input renders as "—" (or "∞" for
 * ROI) rather than "NaN", and the locale is always a parameter — never a module
 * global — so a locale switch can't leave a stale formatter behind.
 */

/** Intl locale for a UI locale. COP amounts read in Colombian Spanish; English
 *  users get en-US grouping. */
export function intlLocale(locale: string): string {
  return locale === "en" ? "en-US" : "es-CO";
}

export function formatMoney(n: number, locale: string): string {
  if (!Number.isFinite(n)) return "—";
  // COP renders with 0 decimals: Intl's CLDR default still adds 2 for it.
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

/** USD is always en-US — it's a reference figure, not a local price. */
export function formatUsd(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatNumber(n: number, locale: string, fractionDigits = 0): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(intlLocale(locale), {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatPercent(frac: number, locale: string, fractionDigits = 1): string {
  if (!Number.isFinite(frac)) return "—";
  return `${(frac * 100).toLocaleString(intlLocale(locale), {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}%`;
}

/** ROI is a multiplier ("332×"), never a percentage. Drops the decimal once it's
 *  big enough that a tenth is noise. */
export function formatRoi(roi: number, locale: string): string {
  if (!Number.isFinite(roi)) return "∞";
  return `${formatNumber(roi, locale, roi >= 10 ? 0 : 1)}×`;
}
