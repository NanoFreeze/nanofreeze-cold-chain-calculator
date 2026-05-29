"use client";

import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { CapasAssumptions } from "@nanofreeze/coldchain-calc/capas";
import {
  CAPAS_ASSUMPTIONS_META,
  CAPAS_DEFAULT_ASSUMPTIONS,
} from "@nanofreeze/coldchain-calc/capas/assumptions";

interface Props {
  open: boolean;
  onClose: () => void;
  overrides: Partial<CapasAssumptions>;
  onChange: (overrides: Partial<CapasAssumptions>) => void;
}

/**
 * Every number the model takes for granted, with its explanation, editable.
 *
 * The rows are generated from CAPAS_ASSUMPTIONS_META — the engine ships its own
 * labels, units, explanations and provenance, in both languages — so this drawer
 * has no copy of its own to drift out of sync. Add an assumption to the engine
 * and it shows up here.
 *
 * An override is stored only when it exists: a key absent from `overrides` means
 * "use the default", which is exactly what computeCapas merges. So resetting a
 * row deletes the key rather than writing the default back — otherwise a later
 * change to a default would silently not reach anyone who had opened this drawer.
 */
export function AssumptionsDrawer({ open, onClose, overrides, onChange }: Props) {
  const t = useTranslations("assumptions");
  const locale = useLocale();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    // Lock the page behind the drawer — a scrolling backdrop under a modal is a
    // reliable way to lose your place on a phone.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const overriddenKeys = Object.keys(overrides) as (keyof CapasAssumptions)[];

  function setOverride(key: keyof CapasAssumptions, value: number) {
    onChange({ ...overrides, [key]: value });
  }

  function resetOne(key: keyof CapasAssumptions) {
    const next = { ...overrides };
    delete next[key];
    onChange(next);
  }

  return (
    <div className="no-print">
      <button
        type="button"
        aria-label={t("close")}
        className="fixed inset-0 z-40 bg-overlay"
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="assumptions-title"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[560px] flex-col border-l border-border bg-surface"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border p-6">
          <div>
            <h2 id="assumptions-title" className="heading-section">
              {t("title")}
            </h2>
            <p className="mt-1 text-sm text-fg-muted">{t("intro")}</p>
          </div>
          <button ref={closeRef} type="button" className="btn-secondary-sm tap-target" onClick={onClose}>
            {t("close")}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6">
          {CAPAS_ASSUMPTIONS_META.map((meta) => {
            const key = meta.key as keyof CapasAssumptions;
            const overridden = Object.prototype.hasOwnProperty.call(overrides, key);
            const value = overridden ? overrides[key] : CAPAS_DEFAULT_ASSUMPTIONS[key];
            const label = locale === "en" ? meta.labelEn : meta.labelEs;
            const unit = locale === "en" ? meta.unitEn : meta.unitEs;
            const explain = locale === "en" ? meta.explainEn : meta.explainEs;

            return (
              <div key={meta.key} className="border-b border-border py-4 last:border-b-0">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="heading-card">{label}</h3>
                  <span className="text-[11px] text-fg-subtle">{unit}</span>
                </div>
                <p className="mt-1 text-xs text-fg-muted">{explain}</p>

                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    step="any"
                    className="input-sm tabular"
                    aria-label={`${label} (${unit})`}
                    value={value}
                    onChange={(e) => setOverride(key, Number(e.target.value))}
                  />
                  {overridden ? (
                    <>
                      <span className="badge-accent shrink-0">{t("edited")}</span>
                      <button
                        type="button"
                        className="btn-ghost shrink-0"
                        onClick={() => resetOne(key)}
                      >
                        {t("resetOne")}
                      </button>
                    </>
                  ) : null}
                </div>

                {overridden ? (
                  <p className="mt-1 text-[11px] text-fg-subtle">
                    {t("default", { value: CAPAS_DEFAULT_ASSUMPTIONS[key] })}
                  </p>
                ) : null}

                {meta.source ? (
                  <p className="mt-2 text-[11px] italic text-fg-subtle">
                    {t("source", { source: meta.source })}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>

        <footer className="border-t border-border p-4">
          <button
            type="button"
            className="btn-secondary tap-target"
            disabled={overriddenKeys.length === 0}
            onClick={() => onChange({})}
          >
            {t("resetAll")}
          </button>
        </footer>
      </aside>
    </div>
  );
}
