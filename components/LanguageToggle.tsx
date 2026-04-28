"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

/**
 * Globe button showing the current language; clicking swaps to the other locale
 * via the locale-aware router. Same shape as the os/partners/marketing navbars
 * (globe icon + code, .btn-secondary-sm).
 */
export function LanguageToggle() {
  const t = useTranslations("language");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const next: Locale = locale === "es" ? "en" : "es";

  function switchTo(target: Locale) {
    startTransition(() => {
      router.replace(pathname, { locale: target });
    });
  }

  return (
    <button
      type="button"
      onClick={() => switchTo(next)}
      className="btn-secondary-sm tap-target"
      aria-label={t("switchTo")}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 010 18a15 15 0 010-18z" />
      </svg>
      <span className="font-medium">{locale.toUpperCase()}</span>
    </button>
  );
}
