"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type {
  CapasAssumptions,
  CapasInput,
  CapasMarket,
  CapasPackaging,
} from "@nanofreeze/coldchain-calc/capas";
import { computeCapas } from "@nanofreeze/coldchain-calc/capas/calc";
import {
  layersForSensitivity,
  stripsPerLayerForBoxLength,
} from "@nanofreeze/coldchain-calc/capas/sizing";
import { AssumptionsDrawer } from "./AssumptionsDrawer";
import { LogisticsStep } from "./LogisticsStep";
import { MetricsBar } from "./MetricsBar";
import { presetFor } from "./presets";
import { ProductStep } from "./ProductStep";
import { ResultsStep } from "./ResultsStep";
import { ScenarioStep } from "./ScenarioStep";
import { SpoilageStep } from "./SpoilageStep";
import { WizardShell, type StepDef } from "./WizardShell";

/**
 * The wizard orchestrator. Holds all of the state, calls the engine, and hands
 * each step the slice it edits.
 *
 * State is plain useState + useMemo — no reducer, no context, no store — which is
 * the same shape as CapasBuilder in the monorepo. There are five values and one
 * pure function; anything heavier would be scaffolding around a calculator.
 *
 * Nothing is persisted. The calculation is a scratchpad, not a document: no
 * localStorage draft, no URL state, no server. (The monorepo's builder persists a
 * draft because it leads to a signup; this one has nowhere to lead.)
 */
export function CalculatorShell() {
  const t = useTranslations("shell");
  const tSteps = useTranslations("steps");

  const [stepIndex, setStepIndex] = useState(0);
  // Gates the rail: you can jump back to anything you've seen, but not skip ahead.
  const [maxReached, setMaxReached] = useState(0);
  // The KPI rail stays blank until Results is reached once — see MetricsBar.
  const [revealed, setRevealed] = useState(false);
  const [assumptionsOpen, setAssumptionsOpen] = useState(false);
  const [input, setInput] = useState<CapasInput>(() => presetFor("nacional", "cajas"));

  const output = useMemo(() => computeCapas(withDerivedSizing(input)), [input]);

  const steps: StepDef[] = useMemo(
    () => [
      { id: "scenario", label: tSteps("scenario"), description: tSteps("scenarioDesc") },
      { id: "product", label: tSteps("product"), description: tSteps("productDesc") },
      { id: "logistics", label: tSteps("logistics"), description: tSteps("logisticsDesc") },
      { id: "spoilage", label: tSteps("spoilage"), description: tSteps("spoilageDesc") },
      { id: "results", label: tSteps("results"), description: tSteps("resultsDesc") },
    ],
    [tSteps],
  );

  function go(index: number) {
    const target = Math.max(0, Math.min(steps.length - 1, index));
    setStepIndex(target);
    setMaxReached((prev) => Math.max(prev, target));
    if (target === steps.length - 1) setRevealed(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function patchInput(patch: Partial<CapasInput>) {
    setInput((prev) => ({ ...prev, ...patch }));
  }

  /** Switching scenario RELOADS the worked example — everything typed is
   *  replaced. A domestic-truck case and an air-freight case have no fields in
   *  common worth carrying across, and a half-migrated form would quietly mix two
   *  examples' numbers. Reset the reveal too: the new numbers aren't the user's
   *  yet. */
  function selectScenario(next: { market?: CapasMarket; packaging?: CapasPackaging }) {
    const market = next.market ?? input.logistics.market;
    const packaging = next.packaging ?? input.layers.packaging;
    setInput(presetFor(market, packaging));
    setRevealed(false);
    setMaxReached(0);
    setStepIndex(0);
  }

  function setAssumptions(overrides: Partial<CapasAssumptions>) {
    // An empty override map is the absence of overrides — drop the key entirely
    // so computeCapas falls back to the defaults wholesale.
    setInput((prev) => {
      if (Object.keys(overrides).length === 0) {
        const { assumptions: _dropped, ...rest } = prev;
        return rest;
      }
      return { ...prev, assumptions: overrides };
    });
  }

  const isLast = stepIndex === steps.length - 1;

  return (
    <>
      <WizardShell
        steps={steps}
        currentIndex={stepIndex}
        maxReachableIndex={maxReached}
        onStepClick={go}
        metricsBar={
          <MetricsBar
            output={output}
            revealed={revealed}
            onOpenAssumptions={() => setAssumptionsOpen(true)}
          />
        }
        footer={
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="btn-secondary tap-target"
              disabled={stepIndex === 0}
              onClick={() => go(stepIndex - 1)}
            >
              {t("back")}
            </button>
            {isLast ? null : (
              <button type="button" className="btn-primary tap-target" onClick={() => go(stepIndex + 1)}>
                {tSteps(`cta.${steps[stepIndex]?.id ?? "scenario"}`)}
              </button>
            )}
          </div>
        }
      >
        {stepIndex === 0 ? (
          <ScenarioStep
            market={input.logistics.market}
            packaging={input.layers.packaging}
            onSelect={selectScenario}
          />
        ) : null}
        {stepIndex === 1 ? (
          <ProductStep input={input} output={output} onChange={patchInput} />
        ) : null}
        {stepIndex === 2 ? (
          <LogisticsStep input={input} output={output} onChange={patchInput} />
        ) : null}
        {stepIndex === 3 ? (
          <SpoilageStep input={input} output={output} onChange={patchInput} />
        ) : null}
        {stepIndex === 4 ? <ResultsStep output={output} /> : null}
      </WizardShell>

      <AssumptionsDrawer
        open={assumptionsOpen}
        onClose={() => setAssumptionsOpen(false)}
        overrides={input.assumptions ?? {}}
        onChange={setAssumptions}
      />
    </>
  );
}

/**
 * Apply the cut guide on the way into the engine.
 *
 * For boxes, the user gives a box length and a heat sensitivity; the engine wants
 * strips-per-layer and layers-per-box and ignores the other two (they're UI-only
 * metadata on the input type). Deriving here — rather than writing the derived
 * values back into state on every keystroke — keeps one source of truth: what the
 * user said. The engine gets what it needs, and state never holds a number nobody
 * typed.
 */
function withDerivedSizing(input: CapasInput): CapasInput {
  if (input.layers.packaging !== "cajas") return input;
  return {
    ...input,
    layers: {
      ...input.layers,
      stripsPerLayer: stripsPerLayerForBoxLength(input.layers.boxLengthCm ?? 0),
      layersPerBox: layersForSensitivity(input.layers.heatSensitivity ?? "sensible"),
    },
  };
}
