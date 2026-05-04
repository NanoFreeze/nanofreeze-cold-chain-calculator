// Prefix a public/ asset with the deploy base path.
//
// Under GitHub Pages the site lives at /<repo>/, so a bare "/logo.svg" would
// resolve to the domain root and 404. next.config.ts sets basePath from
// BASE_PATH, but next/image's loader does NOT reliably prepend it to a
// root-relative src under static export — so for plain <img> / <link> asset URLs
// we prepend it ourselves. Read at build time (server components + metadata),
// which is the only time env is available in an export.
//
// BASE_PATH is unset for the root-served CloudFront build, so this is a no-op
// there. Keep it in sync with the `basePath` computation in next.config.ts.
const BASE_PATH = (process.env.BASE_PATH ?? "").replace(/\/$/, "");

/** `assetPath("/nanofreeze-logo.svg")` → "/<repo>/nanofreeze-logo.svg" on Pages,
 *  or "/nanofreeze-logo.svg" at a domain root. */
export function assetPath(path: string): string {
  return `${BASE_PATH}${path}`;
}
