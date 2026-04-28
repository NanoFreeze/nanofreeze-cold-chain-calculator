import { getTranslations } from "next-intl/server";
import {
  INSTAGRAM_URL,
  LINKEDIN_URL,
  NANOFREEZE_URL,
  SOURCE_URL,
  YOUTUBE_URL,
} from "@/lib/links";

/** Footer: what this is, where the source lives, and the disclaimer. The
 *  disclaimer is the load-bearing part — the numbers above it are estimates from
 *  the user's own assumptions, not a quote. */
export async function SiteFooter() {
  const t = await getTranslations("footer");

  return (
    <footer className="no-print mt-16 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="space-y-3">
          <h2 className="heading-card">{t("aboutTitle")}</h2>
          <p className="text-sm text-fg-muted">{t("aboutBody")}</p>
          <p className="text-xs text-fg-subtle">{t("disclaimer")}</p>
        </div>

        <div className="space-y-3">
          <h2 className="heading-card">{t("linksTitle")}</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={NANOFREEZE_URL} target="_blank" rel="noopener" className="text-fg-muted hover:text-fg">
                nanofreeze.tech
              </a>
            </li>
            <li>
              <a href={SOURCE_URL} target="_blank" rel="noopener" className="text-fg-muted hover:text-fg">
                {t("source")}
              </a>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="heading-card">{t("followTitle")}</h2>
          <div className="flex items-center gap-2">
            <a href={LINKEDIN_URL} target="_blank" rel="noopener" className="btn-icon tap-target" aria-label="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-.95 1.83-1.95 3.76-1.95 4.02 0 4.76 2.5 4.76 5.76V21h-4v-5.6c0-1.34-.03-3.06-1.9-3.06-1.9 0-2.19 1.45-2.19 2.96V21h-4V9Z" />
              </svg>
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener" className="btn-icon tap-target" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href={YOUTUBE_URL} target="_blank" rel="noopener" className="btn-icon tap-target" aria-label="YouTube">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M23 12s0-3.4-.43-5.03a2.62 2.62 0 0 0-1.84-1.85C19.1 4.7 12 4.7 12 4.7s-7.1 0-8.73.42A2.62 2.62 0 0 0 1.43 6.97C1 8.6 1 12 1 12s0 3.4.43 5.03c.24.9.94 1.6 1.84 1.85 1.63.42 8.73.42 8.73.42s7.1 0 8.73-.42a2.62 2.62 0 0 0 1.84-1.85C23 15.4 23 12 23 12ZM9.75 15.27V8.73L15.5 12l-5.75 3.27Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-fg-subtle sm:px-6 lg:px-8">
          <span>{t("copyright")}</span>
          <span>{t("privacy")}</span>
        </div>
      </div>
    </footer>
  );
}
