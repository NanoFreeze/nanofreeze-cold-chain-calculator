"use client";

import { useLocale, useTranslations } from "next-intl";
import type {
  CapasInput,
  CapasLayers,
  CapasOutput,
  CapasProduct,
  HeatSensitivity,
} from "@nanofreeze/coldchain-calc/capas";
import {
  layersForSensitivity,
  stripsPerLayerForBoxLength,
} from "@nanofreeze/coldchain-calc/capas/sizing";
import { formatMoney, formatNumber } from "./format";
import { NumberField } from "./NumberField";
import { DerivedList, StepCard } from "./primitives";

interface Props {
  input: CapasInput;
  output: CapasOutput;
  onChange: (patch: Partial<CapasInput>) => void;
}

/** Step 2 — what's in the box, and how many layers it takes.
 *
 *  For boxes the layer count is GUIDED, not typed: you give the box length and
 *  how heat-sensitive the product is, and the cut guide derives strips-per-layer
 *  (a strip is 15 cm, rounded up) and layers-per-box. The engine ignores
 *  boxLengthCm/heatSensitivity entirely — stripsPerLayer stays its authoritative
 *  input — so the derivation happens on the way into the engine (see
 *  withDerivedSizing in CalculatorShell), and this step just shows its work.
 *  Pallets skip all of that: cost and weight are per-layer properties of the
 *  pallet product itself. */
export function ProductStep({ input, output, onChange }: Props) {
  const t = useTranslations("product");
  const locale = useLocale();

  const carrier = input.layers.packaging === "cajas" ? t("carrierBox") : t("carrierPallet");

  function patchProduct(next: Partial<CapasProduct>) {
    onChange({ product: { ...input.product, ...next } });
  }
  function patchLayers(next: Partial<CapasLayers>) {
    onChange({ layers: { ...input.layers, ...next } as CapasLayers });
  }

  // Shared across both packagings — what a carrier's worth of layers costs and
  // weighs, straight off the engine.
  const shared = [
    {
      label: t("derivedLayerCostPerCarrier", { carrier }),
      value: formatMoney(output.layers.costPerCarrier.cop, locale),
    },
    {
      label: t("derivedLayerCostPerUnit"),
      value: formatMoney(output.layers.costPerProductUnit.cop, locale),
    },
    {
      label: t("derivedExtraWeight", { carrier }),
      value: `${formatNumber(output.layers.weightPerCarrierKg, locale, 2)} kg`,
    },
  ];

  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm text-eui-fg-muted">{t("intro", { carrier })}</p>

      <StepCard>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-eui-fg">{t("name")}</span>
            <input
              type="text"
              className="input-sm"
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

      {input.layers.packaging === "cajas" ? (
        <StepCard title={t("layersTitle")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              label={t("boxLength")}
              hint={t("boxLengthHint")}
              suffix="cm"
              value={input.layers.boxLengthCm ?? 0}
              onChange={(v) => patchLayers({ boxLengthCm: v ?? 0 })}
              min={0}
              step={1}
            />
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-eui-fg">{t("heatSensitivity")}</span>
              <select
                className="input-sm"
                value={input.layers.heatSensitivity ?? "sensible"}
                onChange={(e) =>
                  patchLayers({ heatSensitivity: e.target.value as HeatSensitivity })
                }
              >
                <option value="sensible">{t("heatSensitive")}</option>
                <option value="altamente-sensible">{t("heatHighlySensitive")}</option>
              </select>
            </label>
          </div>

          <DerivedList
            items={[
              {
                label: t("derivedStripsPerLayer"),
                value: formatNumber(
                  stripsPerLayerForBoxLength(input.layers.boxLengthCm ?? 0),
                  locale,
                ),
              },
              {
                label: t("derivedLayersPerBox"),
                value: formatNumber(
                  layersForSensitivity(input.layers.heatSensitivity ?? "sensible"),
                  locale,
                ),
              },
              ...shared,
            ]}
          />
        </StepCard>
      ) : (
        <StepCard title={t("layersTitle")}>
          <div className="grid gap-4 sm:grid-cols-3">
            <NumberField
              label={t("layersPerPallet")}
              value={input.layers.layersPerPallet}
              onChange={(v) => patchLayers({ layersPerPallet: v ?? 0 })}
              min={0}
              step={1}
              integer
            />
            <NumberField
              label={t("costPerPalletLayer")}
              hint={t("costPerPalletLayerHint")}
              suffix="COP"
              value={input.layers.costPerPalletLayerCop}
              onChange={(v) => patchLayers({ costPerPalletLayerCop: v ?? 0 })}
              min={0}
              step={1}
            />
            <NumberField
              label={t("weightPerPalletLayer")}
              suffix="kg"
              value={input.layers.weightPerPalletLayerKg}
              onChange={(v) => patchLayers({ weightPerPalletLayerKg: v ?? 0 })}
              min={0}
              step={0.1}
            />
          </div>

          <DerivedList items={shared} />
        </StepCard>
      )}
    </div>
  );
}
