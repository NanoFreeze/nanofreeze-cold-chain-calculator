"use client";

import { useLocale, useTranslations } from "next-intl";
import type {
  CapasExportacion,
  CapasExportLandLeg,
  CapasInput,
  CapasNacional,
  CapasOutput,
} from "@nanofreeze/coldchain-calc/capas";
import { formatMoney, formatNumber } from "./format";
import { NumberField } from "./NumberField";
import { CheckboxField, DerivedList, StepCard } from "./primitives";

interface Props {
  input: CapasInput;
  output: CapasOutput;
  onChange: (patch: Partial<CapasInput>) => void;
}

/** Step 3 — the trip the layers are replacing.
 *
 *  Two different shapes behind one step. Domestic asks about the reefer truck
 *  (its cost, its premium over a dry truck, how many carriers ride in it) and
 *  about reuse — layers come back and go again, so what you buy is a few SETS,
 *  not one per trip. Export asks about air freight, where the layers fly once and
 *  the only truck in the picture is the optional land leg to the airport. */
export function LogisticsStep({ input, output, onChange }: Props) {
  return input.logistics.market === "nacional" ? (
    <DomesticLogistics logistics={input.logistics} input={input} output={output} onChange={onChange} />
  ) : (
    <ExportLogistics logistics={input.logistics} input={input} output={output} onChange={onChange} />
  );
}

function DomesticLogistics({
  logistics,
  input,
  output,
  onChange,
}: Props & { logistics: CapasNacional }) {
  const t = useTranslations("logistics");
  const locale = useLocale();
  const carriers =
    input.layers.packaging === "cajas" ? t("carriersBoxes") : t("carriersPallets");

  function patch(next: Partial<CapasNacional>) {
    onChange({ logistics: { ...logistics, ...next } });
  }

  const reuse = output.reuse;

  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm text-eui-fg-muted">{t("introDomestic")}</p>

      <StepCard title={t("transportTitle")}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NumberField
            label={t("reeferTruckCost")}
            suffix="COP"
            value={logistics.reeferTruckCostCop}
            onChange={(v) => patch({ reeferTruckCostCop: v ?? 0 })}
            min={0}
            step={10_000}
          />
          {/* Stored as a fraction (0.4), shown as a percent (40). Every percent
              field in the wizard does this — the engine speaks 0..1. */}
          <NumberField
            label={t("reeferPremium")}
            suffix="%"
            value={pctToUi(logistics.reeferPremiumPct)}
            onChange={(v) => patch({ reeferPremiumPct: uiToPct(v) })}
            min={0}
            step={1}
          />
          <NumberField
            label={t("carriersPerTruck", { carriers })}
            value={logistics.carriersPerTruck}
            onChange={(v) => patch({ carriersPerTruck: v ?? 0 })}
            min={0}
            step={1}
            integer
          />
          <NumberField
            label={t("tripsPerMonth")}
            value={logistics.tripsPerMonth}
            onChange={(v) => patch({ tripsPerMonth: v ?? 0 })}
            min={0}
            step={1}
            integer
          />
          <NumberField
            label={t("distance")}
            suffix="km"
            value={logistics.distanceKm}
            onChange={(v) => patch({ distanceKm: v ?? 0 })}
            min={0}
            step={10}
          />
          <NumberField
            label={t("reeferHoursPerTrip")}
            suffix="h"
            value={logistics.reeferHoursPerTrip}
            onChange={(v) => patch({ reeferHoursPerTrip: v ?? 0 })}
            min={0}
            step={0.5}
          />
        </div>
      </StepCard>

      <StepCard title={t("reuseTitle")}>
        <CheckboxField
          label={t("hasReturnLogistics")}
          checked={logistics.reuse.hasReturnLogistics}
          onChange={(checked) =>
            patch({ reuse: { ...logistics.reuse, hasReturnLogistics: checked } })
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NumberField
            label={t("outboundDays")}
            hint={t("outboundDaysHint")}
            value={logistics.reuse.outboundDays}
            onChange={(v) => patch({ reuse: { ...logistics.reuse, outboundDays: v ?? 0 } })}
            min={0}
            step={1}
          />
        </div>

        {reuse ? (
          <DerivedList
            items={[
              { label: t("derivedUsesPerLayer"), value: formatNumber(reuse.usesPerLayer, locale) },
              { label: t("derivedSetsToBuy"), value: formatNumber(reuse.setsToBuy, locale) },
              { label: t("derivedInvestment"), value: formatMoney(reuse.investment.cop, locale) },
              {
                label: t("derivedAmortizedPerTrip"),
                value: formatMoney(reuse.amortizedPerTrip.cop, locale),
              },
            ]}
          />
        ) : null}
      </StepCard>
    </div>
  );
}

// landLeg is optional on the engine type — a caller can omit the land leg
// entirely. Every preset ships one, but the fallback keeps the component honest
// against the type and gives the "replace the reefer truck" toggle something to
// turn on if it were ever absent.
const DEFAULT_LAND_LEG: CapasExportLandLeg = {
  replaceReeferTruck: false,
  carriersPerTruck: 0,
  reeferTruckCostCop: 0,
  reeferPremiumPct: 0,
  reeferHoursPerTruck: 0,
};

function ExportLogistics({
  logistics,
  input,
  onChange,
}: Props & { logistics: CapasExportacion }) {
  const t = useTranslations("logistics");
  const carriers =
    input.layers.packaging === "cajas" ? t("carriersBoxes") : t("carriersPallets");
  const landLeg = logistics.landLeg ?? DEFAULT_LAND_LEG;

  function patch(next: Partial<CapasExportacion>) {
    onChange({ logistics: { ...logistics, ...next } });
  }
  function patchLandLeg(next: Partial<CapasExportLandLeg>) {
    onChange({ logistics: { ...logistics, landLeg: { ...landLeg, ...next } } });
  }

  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm text-eui-fg-muted">{t("introExport")}</p>

      <StepCard title={t("airTitle")}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NumberField
            label={t("airRate")}
            suffix="COP/kg"
            value={logistics.airRatePerKgCop}
            onChange={(v) => patch({ airRatePerKgCop: v ?? 0 })}
            min={0}
            step={100}
          />
          <NumberField
            label={t("carriersPerShipment", { carriers })}
            value={logistics.carriersPerShipment}
            onChange={(v) => patch({ carriersPerShipment: v ?? 0 })}
            min={0}
            step={1}
            integer
          />
          <NumberField
            label={t("shipmentsPerMonth")}
            value={logistics.shipmentsPerMonth}
            onChange={(v) => patch({ shipmentsPerMonth: v ?? 0 })}
            min={0}
            step={1}
            integer
          />
          <NumberField
            label={t("airDistance")}
            suffix="km"
            value={logistics.airDistanceKm}
            onChange={(v) => patch({ airDistanceKm: v ?? 0 })}
            min={0}
            step={100}
          />
        </div>
      </StepCard>

      <StepCard title={t("landLegTitle")}>
        <CheckboxField
          label={t("replaceReeferTruck")}
          checked={landLeg.replaceReeferTruck}
          onChange={(checked) => patchLandLeg({ replaceReeferTruck: checked })}
        />

        {/* Unchecked, there is no reefer to replace on the ground — the engine
            zero-flows transport savings and the fields below would be inert. */}
        {landLeg.replaceReeferTruck ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <NumberField
              label={t("carriersPerTruck", { carriers })}
              value={landLeg.carriersPerTruck}
              onChange={(v) => patchLandLeg({ carriersPerTruck: v ?? 0 })}
              min={0}
              step={1}
              integer
            />
            <NumberField
              label={t("reeferTruckCost")}
              suffix="COP"
              value={landLeg.reeferTruckCostCop}
              onChange={(v) => patchLandLeg({ reeferTruckCostCop: v ?? 0 })}
              min={0}
              step={10_000}
            />
            <NumberField
              label={t("reeferPremium")}
              suffix="%"
              value={pctToUi(landLeg.reeferPremiumPct)}
              onChange={(v) => patchLandLeg({ reeferPremiumPct: uiToPct(v) })}
              min={0}
              step={1}
            />
            <NumberField
              label={t("reeferHoursPerTruck")}
              suffix="h"
              value={landLeg.reeferHoursPerTruck}
              onChange={(v) => patchLandLeg({ reeferHoursPerTruck: v ?? 0 })}
              min={0}
              step={0.5}
            />
          </div>
        ) : null}
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
