"use client";

import { useLocale, useTranslations } from "next-intl";
import type { CapasFlow, CapasOutput } from "@nanofreeze/coldchain-calc/capas";
import { NANOFREEZE_URL } from "@/lib/links";
import { formatMoney, formatNumber, formatPercent, formatRoi, formatUsd } from "./format";
import { DerivedList, StepCard } from "./primitives";

interface Props {
  output: CapasOutput;
}

/** Step 5 — the case. A summary, then the full flow table so nothing is taken on
 *  trust: every row of the total is on screen, per event / per month / per year. */
export function ResultsStep({ output }: Props) {
  const t = useTranslations("results");
  const locale = useLocale();

  const m = output.monetary;
  const event = output.eventLabel === "trip" ? t("trip") : t("shipment");

  // Domestic buys reusable SETS of layers, so the investment is the set cost;
  // export buys them per shipment and throws them at the destination.
  const investment = output.reuse ? output.reuse.investment : m.nfInvestment.perEvent;

  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm text-eui-fg-muted">
        {t("intro", {
          count: Math.round(output.eventsPerMonth),
          eventKind: output.eventLabel,
        })}
      </p>

      <StepCard title={t("summaryTitle")}>
        <DerivedList
          items={[
            {
              label: t("benefitPerEvent", { event }),
              value: formatMoney(m.total.perEvent.cop, locale),
            },
            {
              label: t("annualBenefit"),
              value: `${formatMoney(m.total.annual.cop, locale)} · ${formatUsd(m.total.annual.usd)}`,
            },
            { label: t("layerInvestment"), value: formatMoney(investment.cop, locale) },
            {
              label: t("return"),
              value: `${formatRoi(m.roi, locale)} — ${
                m.positiveFromFirstEvent
                  ? t("positiveFromFirst", { event })
                  : t("notYetPositive", { event })
              }`,
            },
            {
              label: t("co2Avoided"),
              value: `${formatNumber(output.environmental.annualTons, locale, 1)} t`,
            },
            {
              label: t("perishablesRescued"),
              value: `${formatNumber(output.perishables.annualKg, locale)} kg · ${formatNumber(
                output.perishables.annualUnits,
                locale,
              )} ${t("units")}`,
            },
          ]}
        />
      </StepCard>

      <StepCard title={t("detailTitle")}>
        <FlowTable output={output} />
        <p className="text-[11px] text-eui-fg-muted">
          {t("assumptionsNote", {
            trm: formatMoney(output.assumptions.copPerUsd, locale),
            savings:
              m.savingsPctVsReefer !== null
                ? t("savingsVsReefer", { pct: formatPercent(m.savingsPctVsReefer, locale) })
                : "",
          })}
        </p>
      </StepCard>

      <div className="no-print flex flex-wrap gap-3">
        <button type="button" className="btn-primary tap-target" onClick={() => window.print()}>
          {t("downloadCase")}
        </button>
        <a
          href={NANOFREEZE_URL}
          target="_blank"
          rel="noopener"
          className="btn-secondary tap-target"
        >
          {t("visitNanoFreeze")}
        </a>
      </div>
    </div>
  );
}

/** The flow table. Two things here are not obvious:
 *
 *  1. Cost rows are NEGATED for display. The engine already subtracts them from
 *     the total; showing them positive would make the column not add up.
 *  2. The horizon column only exists domestically. Export layers are single-use —
 *     there is no layer life to project over — so `perHorizon` is null on every
 *     flow and the column is dropped rather than filled with dashes. */
function FlowTable({ output }: { output: CapasOutput }) {
  const t = useTranslations("results");
  const locale = useLocale();
  const m = output.monetary;

  const hasHorizon = output.horizonMonths !== null;

  const rows: { label: string; flow: CapasFlow; negate?: boolean; total?: boolean }[] = [
    { label: t("rowTransportSavings"), flow: m.transportSavings },
    { label: t("rowRecoveredValue"), flow: m.recoveredValue },
    { label: t("rowLayerInvestment"), flow: m.nfInvestment, negate: true },
    { label: t("rowExtraCost"), flow: m.extraCost, negate: true },
    { label: t("rowTotal"), flow: m.total, total: true },
  ];

  return (
    <div className="table-responsive">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-eui-border text-left">
            <th className="py-2 pr-3 font-medium text-eui-fg-muted">{t("colItem")}</th>
            <th className="py-2 pr-3 text-right font-medium text-eui-fg-muted">
              {t("colPerEvent", {
                event: output.eventLabel === "trip" ? t("trip") : t("shipment"),
              })}
            </th>
            <th className="py-2 pr-3 text-right font-medium text-eui-fg-muted">
              {t("colPerMonth")}
            </th>
            <th className="py-2 pr-3 text-right font-medium text-eui-fg-muted">
              {t("colAnnual")}
            </th>
            {hasHorizon ? (
              <th className="py-2 text-right font-medium text-eui-fg-muted">
                {t("colHorizon", {
                  months: formatNumber(output.horizonMonths ?? 0, locale, 1),
                })}
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.label}
              className={`border-b border-eui-border/60 ${
                row.total ? "bg-eui-accent/10 font-semibold" : ""
              }`}
            >
              <td className="py-2 pr-3 text-eui-fg">{row.label}</td>
              <Cell cop={row.flow.perEvent.cop} negate={row.negate} locale={locale} />
              <Cell cop={row.flow.perMonth.cop} negate={row.negate} locale={locale} />
              <Cell cop={row.flow.annual.cop} negate={row.negate} locale={locale} />
              {hasHorizon ? (
                <Cell
                  cop={row.flow.perHorizon ? row.flow.perHorizon.cop : null}
                  negate={row.negate}
                  locale={locale}
                />
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Cell({
  cop,
  negate,
  locale,
}: {
  cop: number | null;
  negate?: boolean;
  locale: string;
}) {
  if (cop === null) {
    return <td className="py-2 pr-3 text-right text-eui-fg-subtle">—</td>;
  }
  const value = negate ? -cop : cop;
  return (
    <td
      className={`tabular py-2 pr-3 text-right ${value < 0 ? "text-eui-danger" : "text-eui-fg"}`}
    >
      {formatMoney(value, locale)}
    </td>
  );
}
