import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

// next-intl's request handler — picks the messages bundle for the resolved
// locale. Wired into next.config.ts via createNextIntlPlugin. Under `output:
// "export"` this runs at build time, once per locale in generateStaticParams.
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
