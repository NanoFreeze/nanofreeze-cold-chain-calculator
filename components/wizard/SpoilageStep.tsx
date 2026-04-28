"use client";

import { useLocale, useTranslations } from "next-intl";
import type { CapasInput, CapasOutput, CapasSpoilage } from "@nanofreeze/coldchain-calc/capas";
import { formatMoney, formatNumber, formatPercent } from "./format";
import { NumberField } from "./NumberField";
import { DerivedList, StepCard } from "./primitives";

interface Props {
  input: CapasInput;
  output: CapasOutput;
  onChange: (patch: Partial<CapasInput>) => void;
}

/** Step 4 — spoilage recovery. Three percentages (shown 0–100, stored 0..1) whose
 *  product is the fraction of cargo the layers actually rescue: of everything you
 *  lose, the share the cold chain is to blame for, minus what you'd still lose
 *  even with layers. */
export function SpoilageStep({ input, output, onChange }: Props) {
  const t = useTranslations("spoilage");
  const locale = useLocale();
  const sp = input.spoilage;

  function patch(next: Partial<CapasSpoilage>) {
    onChange({ spoilage: { ...sp, ...next } });
  }

  const recoveredFraction = Math.max(
    0,
    sp.spoilagePct * (sp.coldChainSharePct - sp.residualSharePct),
  );
  const eventLabel = output.eventLabel === "trip" ? t("perTrip") : t("perShipment");

  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm text-eui-fg-muted">{t("intro")}</p>

      <StepCard>
        <div className="grid gap-4 sm:grid-cols-3">
          <NumberField
            label={t("spoilagePct")}
            hint={t("spoilagePctHint")}
            suffix="%"
            value={pctToUi(sp.spoilagePct)}
            onChange={(v) => patch({ spoilagePct: uiToPct(v) })}
            min={0}
            max={100}
            step={0.5}
          />
          <NumberField
            label={t("coldChainSharePct")}
            hint={t("coldChainSharePctHint")}
            suffix="%"
            value={pctToUi(sp.coldChainSharePct)}
            onChange={(v) => patch({ coldChainSharePct: uiToPct(v) })}
            min={0}
            max={100}
            step={0.5}
          />
          <NumberField
            label={t("residualSharePct")}
            hint={t("residualSharePctHint")}
            suffix="%"
            value={pctToUi(sp.residualSharePct)}
            onChange={(v) => patch({ residualSharePct: uiToPct(v) })}
            min={0}
            max={100}
            step={0.5}
          />
        </div>

        <DerivedList
          items={[
            {
              label: t("derivedRecoveredFraction"),
              value: formatPercent(recoveredFraction, locale),
            },
            {
              label: t("derivedRecoveredValue", { event: eventLabel }),
              value: formatMoney(output.monetary.recoveredValue.perEvent.cop, locale),
            },
            {
              label: t("derivedPerishablesRescued"),
              value: `${formatNumber(output.perishables.annualKg, locale)} kg`,
            },
          ]}
        />
      </StepCard>
    </div>
  );
}

function pctToUi(fraction: number): number {
  return Math.round(fraction * 1000) / 10;
}
function uiToPct(ui: number | null): number {
  return (ui ?? 0) / 100;
}
