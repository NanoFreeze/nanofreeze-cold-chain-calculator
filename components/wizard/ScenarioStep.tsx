"use client";

import { useTranslations } from "next-intl";
import type { CapasMarket, CapasPackaging } from "@nanofreeze/coldchain-calc/capas";
import { ChoiceTile, StepCard } from "./primitives";

interface Props {
  market: CapasMarket;
  packaging: CapasPackaging;
  onSelect: (next: { market?: CapasMarket; packaging?: CapasPackaging }) => void;
}

/** Step 1 — how the product moves. Each combination loads a different worked
 *  example, so picking one here REPLACES everything typed downstream. That's
 *  deliberate (a domestic truck case and an air-freight case share no numbers),
 *  and the intro copy says so out loud. */
export function ScenarioStep({ market, packaging, onSelect }: Props) {
  const t = useTranslations("scenario");

  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm text-eui-fg-muted">{t("intro")}</p>

      <StepCard title={t("marketTitle")}>
        <div className="grid gap-3 sm:grid-cols-2">
          <ChoiceTile
            label={t("marketDomestic")}
            hint={t("marketDomesticHint")}
            selected={market === "nacional"}
            onSelect={() => onSelect({ market: "nacional" })}
          />
          <ChoiceTile
            label={t("marketExport")}
            hint={t("marketExportHint")}
            selected={market === "exportacion"}
            onSelect={() => onSelect({ market: "exportacion" })}
          />
        </div>
      </StepCard>

      <StepCard title={t("packagingTitle")}>
        <div className="grid gap-3 sm:grid-cols-2">
          <ChoiceTile
            label={t("packagingBoxes")}
            hint={t("packagingBoxesHint")}
            selected={packaging === "cajas"}
            onSelect={() => onSelect({ packaging: "cajas" })}
          />
          <ChoiceTile
            label={t("packagingPallets")}
            hint={t("packagingPalletsHint")}
            selected={packaging === "pallets"}
            onSelect={() => onSelect({ packaging: "pallets" })}
          />
        </div>
      </StepCard>
    </div>
  );
}
