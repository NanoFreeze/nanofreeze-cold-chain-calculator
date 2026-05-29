"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { CapasInput, CapasOutput, CapasSocial } from "@nanofreeze/coldchain-calc/capas";
import { NANOFREEZE_URL } from "@/lib/links";
import { formatMoney, formatNumber, formatPercent, formatRoi, formatUsd } from "./format";
import { NumberField } from "./NumberField";
import { StepCard } from "./primitives";

interface Props {
  output: CapasOutput;
  input: CapasInput;
  onChange: (patch: Partial<CapasInput>) => void;
}

/** Step 5 — the case, at full detail: a savings hero, the per-event breakdown,
 *  the environmental components, perishables rescued, and an optional social
 *  (jobs) record. Mirrors the monorepo's results surface. */
export function ResultsStep({ output, input, onChange }: Props) {
  const t = useTranslations("results");
  const locale = useLocale();

  const m = output.monetary;
  const env = output.environmental;
  const p = output.perishables;
  const perEventLabel = output.eventLabel === "trip" ? t("perEventTrip") : t("perEventShipment");
  const eventWord = output.eventLabel === "trip" ? t("trip") : t("shipment");

  return (
    <div className="space-y-6">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <StepCard>
        <p className="eyebrow text-eui-accent">{t("heroEyebrow")}</p>
        <div className="mt-1">
          <p className="text-sm text-eui-fg-muted">{t("heroAnnualLabel")}</p>
          <p className="tabular text-3xl font-bold text-eui-fg sm:text-4xl">
            {formatMoney(m.total.annual.cop, locale)}
          </p>
          <p className="tabular text-sm text-eui-fg-muted">
            {t("usdSubline", { usd: formatUsd(m.total.annual.usd) })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip label={perEventLabel} value={formatMoney(m.total.perEvent.cop, locale)} />
          <Chip label={t("chipPerMonth")} value={formatMoney(m.total.perMonth.cop, locale)} />
          {output.horizonMonths !== null && m.total.perHorizon ? (
            <Chip
              label={t("chipPerHorizon", {
                months: formatNumber(output.horizonMonths, locale, 1),
              })}
              value={formatMoney(m.total.perHorizon.cop, locale)}
            />
          ) : null}
        </div>
      </StepCard>

      {/* ── Savings breakdown ────────────────────────────────────────── */}
      <StepCard title={t("savingsTitle")}>
        <dl className="divide-y divide-eui-border">
          <SignedRow label={t("savingsTransport")} cop={m.transportSavings.perEvent.cop} sign={1} locale={locale} />
          <SignedRow label={t("savingsInvestment")} cop={m.nfInvestment.perEvent.cop} sign={-1} locale={locale} />
          <SignedRow label={t("savingsRecovered")} cop={m.recoveredValue.perEvent.cop} sign={1} locale={locale} />
          <SignedRow label={t("savingsExtraCost")} cop={m.extraCost.perEvent.cop} sign={-1} locale={locale} />
          <SignedRow label={t("savingsTotal")} cop={m.total.perEvent.cop} sign={1} locale={locale} total />
        </dl>
        <div className="flex flex-wrap gap-2">
          {m.savingsPctVsReefer !== null ? (
            <Badge>{t("badgeSavingsPct", { pct: formatPercent(m.savingsPctVsReefer, locale) })}</Badge>
          ) : null}
          <Badge>{t("badgeRoi", { roi: formatRoi(m.roi, locale) })}</Badge>
          {m.positiveFromFirstEvent ? (
            <Badge accent>
              {output.eventLabel === "trip"
                ? t("badgePositiveFirstTrip")
                : t("badgePositiveFirstShipment")}
            </Badge>
          ) : null}
        </div>
      </StepCard>

      {/* ── Environmental ────────────────────────────────────────────── */}
      <StepCard title={t("envTitle")}>
        <div className="space-y-2">
          <EnvRow label={t("envAvoidedSpoilage")} kg={env.perEvent.avoidedSpoilageKg} sign={1} max={envMax(output)} locale={locale} />
          <EnvRow label={t("envAvoidedReefer")} kg={env.perEvent.avoidedReeferKg} sign={1} max={envMax(output)} locale={locale} />
          <EnvRow label={t("envPenaltyWeight")} kg={env.perEvent.penaltyWeightKg} sign={-1} max={envMax(output)} locale={locale} />
          <EnvRow label={t("envManufacturing")} kg={env.perEvent.manufacturingKg} sign={-1} max={envMax(output)} locale={locale} />
        </div>
        <dl className="grid grid-cols-3 gap-4 border-t border-eui-border pt-4">
          <MiniStat label={t("envPerEvent")} value={`${formatNumber(env.perEvent.netKg, locale, 1)} kg`} accent />
          <MiniStat label={t("envPerMonth")} value={`${formatNumber(env.perMonthKg, locale, 1)} kg`} />
          <MiniStat label={t("envAnnual")} value={t("envAnnualTons", { tons: formatNumber(env.annualTons, locale, 1) })} />
        </dl>
      </StepCard>

      {/* ── Perishables ──────────────────────────────────────────────── */}
      <StepCard title={t("perishablesTitle")}>
        <div className="table-responsive">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-eui-border text-left">
                <th className="py-2 pr-3 font-medium text-eui-fg-muted" />
                <th className="py-2 pr-3 text-right font-medium text-eui-fg-muted">
                  {t("colPerEvent", { event: eventWord })}
                </th>
                <th className="py-2 pr-3 text-right font-medium text-eui-fg-muted">{t("colPerMonth")}</th>
                <th className="py-2 text-right font-medium text-eui-fg-muted">{t("colAnnual")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-eui-border/60">
                <td className="py-2 pr-3 text-eui-fg">{t("perishablesKg")}</td>
                <td className="tabular py-2 pr-3 text-right text-eui-fg">{formatNumber(p.perEvent.kgSaved, locale)}</td>
                <td className="tabular py-2 pr-3 text-right text-eui-fg">{formatNumber(p.perMonthKg, locale)}</td>
                <td className="tabular py-2 text-right text-eui-fg">{formatNumber(p.annualKg, locale)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 text-eui-fg">{t("perishablesUnits")}</td>
                <td className="tabular py-2 pr-3 text-right text-eui-fg">{formatNumber(p.perEvent.unitsSaved, locale)}</td>
                <td className="tabular py-2 pr-3 text-right text-eui-fg">{formatNumber(p.perMonthUnits, locale)}</td>
                <td className="tabular py-2 text-right text-eui-fg">{formatNumber(p.annualUnits, locale)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <dl className="border-t border-eui-border pt-4">
          <MiniStat label={t("perishablesValue")} value={formatMoney(p.perEvent.valueRecovered.cop, locale)} accent />
        </dl>
      </StepCard>

      {/* ── Social (recorded, optional) ──────────────────────────────── */}
      <SocialCard social={input.social} onChange={(social) => onChange({ social })} />

      <p className="text-[11px] text-eui-fg-muted">
        {t("assumptionsNote", { trm: formatMoney(output.assumptions.copPerUsd, locale) })}
      </p>

      <div className="no-print flex flex-wrap gap-3">
        <button type="button" className="btn-primary tap-target" onClick={() => window.print()}>
          {t("downloadCase")}
        </button>
        <a href={NANOFREEZE_URL} target="_blank" rel="noopener" className="btn-secondary tap-target">
          {t("visitNanoFreeze")}
        </a>
      </div>
    </div>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-control border border-eui-border bg-eui-canvas px-3 py-2">
      <span className="tabular text-sm font-semibold text-eui-fg">{value}</span>
      <span className="ml-1 text-xs text-eui-fg-muted">{label}</span>
    </div>
  );
}

function Badge({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        accent
          ? "bg-eui-success-soft text-eui-success"
          : "bg-eui-accent/10 text-eui-accent"
      }`}
    >
      {children}
    </span>
  );
}

function SignedRow({
  label,
  cop,
  sign,
  locale,
  total,
}: {
  label: string;
  cop: number;
  sign: 1 | -1;
  locale: string;
  total?: boolean;
}) {
  const raw = sign * cop;
  const value = Object.is(raw, -0) ? 0 : raw;
  return (
    <div className={`flex items-center justify-between py-2 ${total ? "font-semibold" : ""}`}>
      <dt className="text-sm text-eui-fg">{label}</dt>
      <dd className={`tabular text-sm ${value < 0 ? "text-eui-danger" : total ? "text-eui-accent" : "text-eui-fg"}`}>
        {value > 0 && !total ? "+" : ""}
        {formatMoney(value, locale)}
      </dd>
    </div>
  );
}

/** Max absolute per-event kg across the four components — the scale for the bars. */
function envMax(output: CapasOutput): number {
  const e = output.environmental.perEvent;
  return Math.max(
    Math.abs(e.avoidedSpoilageKg),
    Math.abs(e.avoidedReeferKg),
    Math.abs(e.penaltyWeightKg),
    Math.abs(e.manufacturingKg),
    1,
  );
}

function EnvRow({
  label,
  kg,
  sign,
  max,
  locale,
}: {
  label: string;
  kg: number;
  sign: 1 | -1;
  max: number;
  locale: string;
}) {
  const raw = sign * kg;
  const value = Object.is(raw, -0) ? 0 : raw;
  const pct = Math.min(100, (Math.abs(kg) / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-eui-fg">{label}</span>
        <span className={`tabular ${value < 0 ? "text-eui-danger" : "text-eui-fg"}`}>
          {value > 0 ? "+" : ""}
          {formatNumber(value, locale, 1)} kg
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-eui-canvas">
        <div
          className={`h-full ${value < 0 ? "bg-eui-danger" : "bg-eui-accent"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-[11px] text-eui-fg-muted">{label}</dt>
      <dd className={`tabular text-sm font-medium ${accent ? "text-eui-accent" : "text-eui-fg"}`}>{value}</dd>
    </div>
  );
}

function SocialCard({
  social,
  onChange,
}: {
  social: CapasSocial | undefined;
  onChange: (social: CapasSocial) => void;
}) {
  const t = useTranslations("results");
  const hasData = social != null && (social.jobsTotal != null || social.jobsMen != null || social.jobsWomen != null);
  const [open, setOpen] = useState(hasData);

  function patch(next: Partial<CapasSocial>) {
    onChange({ ...social, ...next });
  }

  return (
    <StepCard title={t("socialTitle")}>
      <button
        type="button"
        className="btn-ghost self-start"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? t("socialToggleHide") : t("socialToggleShow")}
      </button>

      {open ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <NumberField
              label={t("socialJobsTotal")}
              value={social?.jobsTotal ?? null}
              onChange={(v) => patch({ jobsTotal: v ?? undefined })}
              min={0}
              step={1}
              integer
            />
            <NumberField
              label={t("socialJobsMen")}
              value={social?.jobsMen ?? null}
              onChange={(v) => patch({ jobsMen: v ?? undefined })}
              min={0}
              step={1}
              integer
            />
            <NumberField
              label={t("socialJobsWomen")}
              value={social?.jobsWomen ?? null}
              onChange={(v) => patch({ jobsWomen: v ?? undefined })}
              min={0}
              step={1}
              integer
            />
          </div>
          <p className="text-[11px] text-eui-fg-muted">{t("socialNote")}</p>
        </>
      ) : null}
    </StepCard>
  );
}
