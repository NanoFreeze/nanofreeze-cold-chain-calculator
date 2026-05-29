"use client";

import { useLocale, useTranslations } from "next-intl";
import type {
  CapasInput,
  CapasLayers,
  CapasLayersCajas,
  CapasLayersPallets,
  CapasLayersOutput,
  CapasOutput,
  CapasProduct,
  HeatSensitivity,
} from "@nanofreeze/coldchain-calc/capas";
import {
  CAPA_STRIP_LENGTH_CM,
  layersForSensitivity,
  stripsPerLayerForBoxLength,
} from "@nanofreeze/coldchain-calc/capas/sizing";
import { formatMoney, formatNumber } from "./format";
import { NumberField } from "./NumberField";
import { CheckboxField, DerivedList, StepCard } from "./primitives";

interface Props {
  input: CapasInput;
  output: CapasOutput;
  onChange: (patch: Partial<CapasInput>) => void;
}

/** Step 2 — what's in the box and how many layers it takes. For boxes the layer
 *  count is GUIDED by default (box length → strips, heat sensitivity → layers),
 *  with a manual override; pallets carry cost/weight per layer directly. */
export function ProductStep({ input, output, onChange }: Props) {
  const t = useTranslations("product");
  const layers = input.layers;
  const carrier = layers.packaging === "cajas" ? t("carrierBox") : t("carrierPallet");

  function patchProduct(next: Partial<CapasProduct>) {
    onChange({ product: { ...input.product, ...next } });
  }
  function patchLayers(next: Partial<CapasLayers>) {
    onChange({ layers: { ...input.layers, ...next } as CapasLayers });
  }

  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm text-eui-fg-muted">{t("intro")}</p>

      <StepCard>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-eui-fg">{t("name")}</span>
            <input
              type="text"
              className="input-sm"
              maxLength={200}
              value={input.product.name ?? ""}
              placeholder={t("namePlaceholder")}
              onChange={(e) => patchProduct({ name: e.target.value })}
            />
          </label>
          <NumberField
            label={t("unitsPerCarrier", { carrier })}
            value={input.product.unitsPerCarrier}
            onChange={(v) => patchProduct({ unitsPerCarrier: v ?? 0 })}
            min={0}
            step={1}
            integer
          />
          <NumberField
            label={t("kgPerCarrier", { carrier })}
            suffix="kg"
            value={input.product.productKgPerCarrier}
            onChange={(v) => patchProduct({ productKgPerCarrier: v ?? 0 })}
            min={0}
            step={0.1}
          />
          <NumberField
            label={t("valuePerCarrier", { carrier })}
            suffix="COP"
            value={input.product.valuePerCarrierCop}
            onChange={(v) => patchProduct({ valuePerCarrierCop: v ?? 0 })}
            min={0}
            step={1000}
          />
        </div>
      </StepCard>

      {layers.packaging === "cajas" ? (
        <CajasLayerCard
          layers={layers}
          output={output.layers}
          carrier={carrier}
          patchLayers={patchLayers}
        />
      ) : (
        <PalletLayerCard
          layers={layers}
          output={output.layers}
          carrier={carrier}
          patchLayers={patchLayers}
        />
      )}
    </div>
  );
}

function CajasLayerCard({
  layers,
  output,
  carrier,
  patchLayers,
}: {
  layers: CapasLayersCajas;
  output: CapasLayersOutput;
  carrier: string;
  patchLayers: (next: Partial<CapasLayers>) => void;
}) {
  const t = useTranslations("product");
  const locale = useLocale();
  const guided = layers.boxLengthCm != null && layers.heatSensitivity != null;

  function setManual(manual: boolean) {
    if (manual) {
      // Freeze the currently-derived counts, then drop the guides so the shell
      // stops overwriting them.
      patchLayers({
        boxLengthCm: undefined,
        heatSensitivity: undefined,
        stripsPerLayer: stripsPerLayerForBoxLength(layers.boxLengthCm ?? 0),
        layersPerBox: layersForSensitivity(layers.heatSensitivity ?? "sensible"),
      });
    } else {
      // Re-seed the guides from the manual counts (sensitivity inferred).
      patchLayers({
        boxLengthCm: (layers.stripsPerLayer ?? 1) * CAPA_STRIP_LENGTH_CM,
        heatSensitivity: (layers.layersPerBox ?? 1) >= 2 ? "altamente-sensible" : "sensible",
      });
    }
  }

  const strips = stripsPerLayerForBoxLength(layers.boxLengthCm ?? 0);
  const shared = [
    { label: t("derivedLayerCostPerCarrier", { carrier }), value: formatMoney(output.costPerCarrier.cop, locale) },
    { label: t("derivedLayerCostPerUnit"), value: formatMoney(output.costPerProductUnit.cop, locale) },
    { label: t("derivedExtraWeight", { carrier }), value: `${formatNumber(output.weightPerCarrierKg, locale, 2)} kg` },
  ];

  return (
    <StepCard title={t("layersTitle")}>
      {guided ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              label={t("boxLength")}
              hint={t("boxLengthHint")}
              suffix="cm"
              value={layers.boxLengthCm ?? 0}
              onChange={(v) => patchLayers({ boxLengthCm: v ?? 0 })}
              min={0}
              step={1}
            />
            <fieldset className="flex flex-col gap-2 text-sm">
              <legend className="font-medium text-eui-fg">{t("heatLegend")}</legend>
              <HeatRadio
                value="sensible"
                checked={layers.heatSensitivity === "sensible"}
                label={t("heatSensitive")}
                hint={t("heatSensitiveHint")}
                onSelect={(v) => patchLayers({ heatSensitivity: v })}
              />
              <HeatRadio
                value="altamente-sensible"
                checked={layers.heatSensitivity === "altamente-sensible"}
                label={t("heatHighlySensitive")}
                hint={t("heatHighlySensitiveHint")}
                onSelect={(v) => patchLayers({ heatSensitivity: v })}
              />
            </fieldset>
          </div>

          <p className="text-[11px] text-eui-fg-muted">{t("guidedNote")}</p>

          <DerivedList
            items={[
              {
                label: t("derivedStripsPerLayer"),
                value: t("derivedStripsFmt", {
                  n: formatNumber(strips, locale),
                  cm: formatNumber(strips * CAPA_STRIP_LENGTH_CM, locale),
                }),
              },
              {
                label: t("derivedLayersPerBox"),
                value: formatNumber(
                  layersForSensitivity(layers.heatSensitivity ?? "sensible"),
                  locale,
                ),
              },
              ...shared,
            ]}
          />
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              label={t("stripsPerLayer")}
              hint={t("stripsPerLayerHint")}
              value={layers.stripsPerLayer ?? 0}
              onChange={(v) => patchLayers({ stripsPerLayer: v ?? 0 })}
              min={0}
              step={1}
              integer
            />
            <NumberField
              label={t("layersPerBox")}
              hint={t("layersPerBoxHint")}
              value={layers.layersPerBox ?? 0}
              onChange={(v) => patchLayers({ layersPerBox: v ?? 0 })}
              min={0}
              step={1}
              integer
            />
          </div>
          <DerivedList items={shared} />
        </>
      )}

      <div className="border-t border-eui-border pt-4">
        <CheckboxField label={t("manualToggle")} checked={!guided} onChange={setManual} />
        <p className="mt-1 text-[11px] text-eui-fg-muted">{t("manualToggleHint")}</p>
      </div>
    </StepCard>
  );
}

function PalletLayerCard({
  layers,
  output,
  carrier,
  patchLayers,
}: {
  layers: CapasLayersPallets;
  output: CapasLayersOutput;
  carrier: string;
  patchLayers: (next: Partial<CapasLayers>) => void;
}) {
  const t = useTranslations("product");
  const locale = useLocale();

  return (
    <StepCard title={t("layersTitle")}>
      <div className="grid gap-4 sm:grid-cols-3">
        <NumberField
          label={t("layersPerPallet")}
          value={layers.layersPerPallet}
          onChange={(v) => patchLayers({ layersPerPallet: v ?? 0 })}
          min={0}
          step={1}
          integer
        />
        <NumberField
          label={t("costPerPalletLayer")}
          hint={t("costPerPalletLayerHint")}
          suffix="COP"
          value={layers.costPerPalletLayerCop}
          onChange={(v) => patchLayers({ costPerPalletLayerCop: v ?? 0 })}
          min={0}
          step={1}
        />
        <NumberField
          label={t("weightPerPalletLayer")}
          suffix="kg"
          value={layers.weightPerPalletLayerKg}
          onChange={(v) => patchLayers({ weightPerPalletLayerKg: v ?? 0 })}
          min={0}
          step={0.1}
        />
      </div>
      <DerivedList
        items={[
          { label: t("derivedLayerCostPerCarrier", { carrier }), value: formatMoney(output.costPerCarrier.cop, locale) },
          { label: t("derivedLayerCostPerUnit"), value: formatMoney(output.costPerProductUnit.cop, locale) },
          { label: t("derivedExtraWeight", { carrier }), value: `${formatNumber(output.weightPerCarrierKg, locale, 2)} kg` },
        ]}
      />
    </StepCard>
  );
}

function HeatRadio({
  value,
  checked,
  label,
  hint,
  onSelect,
}: {
  value: HeatSensitivity;
  checked: boolean;
  label: string;
  hint: string;
  onSelect: (v: HeatSensitivity) => void;
}) {
  return (
    <label className="flex items-start gap-2">
      <input
        type="radio"
        name="heatSensitivity"
        className="mt-1 accent-[var(--color-accent)]"
        checked={checked}
        onChange={() => onSelect(value)}
      />
      <span>
        <span className="font-medium text-eui-fg">{label}</span>
        <span className="block text-[11px] text-eui-fg-muted">{hint}</span>
      </span>
    </label>
  );
}
