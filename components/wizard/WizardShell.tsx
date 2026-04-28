"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

export interface StepDef {
  id: string;
  label: string;
  description?: string;
}

interface Props {
  steps: StepDef[];
  currentIndex: number;
  maxReachableIndex: number;
  onStepClick: (index: number) => void;
  metricsBar: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}

/** The wizard chrome — title, sticky metrics band, step rail, body, nav footer.
 *  Ported from @nanofreeze/cold-chain-ui's ColdChainWizardShell so the two stay
 *  recognisably the same surface. */
export function WizardShell({
  steps,
  currentIndex,
  maxReachableIndex,
  onStepClick,
  metricsBar,
  footer,
  children,
}: Props) {
  const t = useTranslations("shell");
  const current = steps[currentIndex];

  return (
    <div className="bg-eui-canvas">
      <header className="mx-auto max-w-6xl px-4 pb-4 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow text-eui-accent">{t("breadcrumb")}</p>
            <h1 className="mt-1 text-2xl font-bold text-eui-fg sm:text-3xl">
              {current?.label ?? ""}
            </h1>
            {current?.description ? (
              <p className="mt-1 max-w-2xl text-sm text-eui-fg-muted">{current.description}</p>
            ) : null}
          </div>
          <p className="text-xs text-eui-fg-muted">
            {t("progress", { current: currentIndex + 1, total: steps.length })}
          </p>
        </div>
      </header>

      <div className="sticky top-0 z-20 border-y border-eui-border bg-eui-card/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">{metricsBar}</div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
        {/* min-w-0: a grid item's automatic minimum size is its content's
            min-content width, and the step pills are whitespace-nowrap below lg —
            without this the nav (and with it the page) grows to the pills' total
            width instead of letting the <ol> scroll. */}
        <nav
          aria-label={t("stepsAria")}
          className="no-print min-w-0 max-w-full lg:sticky lg:top-28 lg:self-start"
        >
          <ol className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {steps.map((step, i) => {
              const reachable = i <= maxReachableIndex;
              const active = i === currentIndex;
              const done = i < currentIndex;
              return (
                <li key={step.id} className="lg:w-full">
                  <button
                    type="button"
                    onClick={() => reachable && onStepClick(i)}
                    disabled={!reachable}
                    aria-current={active ? "step" : undefined}
                    className={`flex w-full min-h-11 items-center gap-3 rounded-card border px-3 py-2 text-left text-sm transition ${
                      active
                        ? "border-eui-accent bg-eui-accent/10 text-eui-fg"
                        : done
                          ? "border-eui-border bg-eui-card text-eui-fg hover:bg-eui-card-hover"
                          : reachable
                            ? "border-dashed border-eui-border bg-eui-card/60 text-eui-fg-muted"
                            : "cursor-not-allowed border-dashed border-eui-border-subtle bg-eui-card/40 text-eui-fg-subtle"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        done || active
                          ? "bg-eui-accent text-eui-on-accent"
                          : "bg-eui-card-hover text-eui-fg-muted"
                      }`}
                      aria-hidden="true"
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    <span className="font-semibold whitespace-nowrap lg:whitespace-normal">
                      {step.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <main className="min-w-0">
          {children}
          <div className="no-print mt-8 border-t border-eui-border pt-4">{footer}</div>
        </main>
      </div>
    </div>
  );
}
