"use client";

import { useLocale, useTranslations } from "next-intl";
import type { CapasOutput } from "@nanofreeze/coldchain-calc/capas";
import { formatMoney, formatNumber, formatRoi } from "./format";

interface Props {
  output: CapasOutput;
  /** Whether the user has reached Results at least once. */
  revealed: boolean;
  onOpenAssumptions: () => void;
}

/**
 * The four headline numbers, sticky under the header.
 *
 * They stay blank (—) until the user first reaches Results. The form is never
 * empty — every scenario seeds a worked example — so a live rail would be showing
 * the EXAMPLE's savings next to the user's half-finished inputs and inviting them
 * to read it as their own. Once they've been through the steps, it tracks every
 * keystroke.
 */
export function MetricsBar({ output, revealed, onOpenAssumptions }: Props) {
  const t = useTranslations("metrics");
  const locale = useLocale();

  const metrics = [
    {
      label: t("annualSavings"),
      value: formatMoney(output.monetary.total.annual.cop, locale),
      accent: true,
    },
    {
      label: t("co2Avoided"),
      value: formatNumber(output.environmental.annualTons, locale, 1),
    },
    {
      label: t("perishables"),
      value: formatNumber(output.perishables.annualKg, locale),
    },
    {
      label: t("roi"),
      value: formatRoi(output.monetary.roi, locale),
    },
  ];

  return (
    <div className="space-y-2">
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={`rounded-card border p-3 ${
              revealed && metric.accent
                ? "border-eui-accent/30 bg-eui-accent/10"
                : "border-eui-border bg-eui-card"
            }`}
          >
            <dt className="eyebrow text-eui-fg-muted">{metric.label}</dt>
            <dd
              className={`tabular mt-1 text-lg font-semibold ${
                !revealed
                  ? "text-eui-fg-subtle"
                  : metric.accent
                    ? "text-eui-accent"
                    : "text-eui-fg"
              }`}
            >
              {revealed ? metric.value : "—"}
            </dd>
          </div>
        ))}
      </dl>

      <div className="no-print flex items-center justify-between gap-3">
        <p className="text-[11px] text-eui-fg-muted">{revealed ? "" : t("hint")}</p>
        <button type="button" className="btn-ghost" onClick={onOpenAssumptions}>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8h.01M11 12h1v4h1" strokeLinecap="round" />
          </svg>
          {t("viewAssumptions")}
        </button>
      </div>
    </div>
  );
}
