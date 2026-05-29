"use client";

import { useLocale, useTranslations } from "next-intl";
import type { CapasMarket, CapasPackaging } from "@nanofreeze/coldchain-calc/capas";
import { capasScenarioLabel } from "@nanofreeze/coldchain-calc/capas/calc";
import { CAPAS_SCENARIOS } from "./presets";

interface Props {
  market: CapasMarket;
  packaging: CapasPackaging;
  onSelect: (next: { market: CapasMarket; packaging: CapasPackaging }) => void;
}

/** Step 1 — how the product moves. ONE combined single-select over the four
 *  market×packaging scenarios (not two separate axes — that read as multi-select
 *  because a market and a packaging were always both highlighted). Picking a card
 *  loads that scenario's worked example, which REPLACES everything typed
 *  downstream; the reset note says so out loud. */
export function ScenarioStep({ market, packaging, onSelect }: Props) {
  const t = useTranslations("scenario");
  const locale = useLocale();

  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm text-eui-fg-muted">{t("intro")}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {CAPAS_SCENARIOS.map((s) => {
          const active = s.market === market && s.packaging === packaging;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => onSelect({ market: s.market, packaging: s.packaging })}
              aria-pressed={active}
              className={`flex min-h-11 flex-col gap-3 rounded-card border p-5 text-left transition-colors ${
                active
                  ? "border-eui-accent bg-eui-accent/10"
                  : "border-eui-border bg-eui-card hover:bg-eui-card-hover"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-bold text-eui-fg">
                  {capasScenarioLabel(s.market, s.packaging, locale === "en" ? "en" : "es")}
                </h2>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                    active ? "bg-eui-accent text-eui-on-accent" : "border border-eui-border text-transparent"
                  }`}
                  aria-hidden="true"
                >
                  ✓
                </span>
              </div>

              <p className="text-sm text-eui-fg-muted">{t(`cards.${s.copyKey}`)}</p>

              <div className="rounded-control border border-eui-border-subtle bg-eui-canvas p-3">
                <p className="eyebrow text-eui-fg-muted">{t("howItWorksLabel")}</p>
                <p className="mt-1 text-xs text-eui-fg-muted">
                  {t(s.howItWorks === "reuse" ? "reuseHint" : "singleUseHint")}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-eui-fg-subtle">{t("resetNote")}</p>
    </div>
  );
}
