import { defineRouting } from "next-intl/routing";

// Locale lives in the URL so each language is independently indexable, same as
// the marketing site. Default is Spanish (Bogotá-based team, Colombia-first
// audience).
//
// `localePrefix: "always"` — NOT "as-needed" like marketing. A static export has
// no middleware, so nothing can detect the browser language and rewrite `/` to
// the default locale at request time; every locale therefore needs a real
// prefixed directory in out/. `public/index.html` does the detect-and-redirect
// at `/` instead, in the browser.
export const routing = defineRouting({
  locales: ["es", "en"] as const,
  defaultLocale: "es",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
