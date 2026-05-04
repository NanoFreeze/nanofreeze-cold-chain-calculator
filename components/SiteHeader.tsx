import { getTranslations } from "next-intl/server";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { assetPath } from "@/lib/assets";
import { NANOFREEZE_URL, SOURCE_URL } from "@/lib/links";

/** Top bar: wordmark → nanofreeze.tech, language + theme toggles, source link.
 *  Server component — only the two toggles are client. */
export async function SiteHeader() {
  const t = await getTranslations("header");

  return (
    <header className="no-print border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <a href={NANOFREEZE_URL} target="_blank" rel="noopener" aria-label={t("homeAria")}>
          {/* Plain <img>, not next/image: it's a static SVG wordmark (no
              optimization to gain, and images are unoptimized under export
              anyway), and next/image's loader doesn't reliably prepend basePath
              to a root-relative src — assetPath() does it deterministically. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={assetPath("/nanofreeze-logo.svg")}
            alt="NanoFreeze"
            width={112}
            height={49}
            className="wordmark h-10 w-auto"
          />
        </a>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <a
            href={SOURCE_URL}
            target="_blank"
            rel="noopener"
            className="btn-secondary-sm tap-target"
            aria-label={t("sourceAria")}
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            <span className="font-medium">MIT</span>
          </a>
        </div>
      </div>
    </header>
  );
}
