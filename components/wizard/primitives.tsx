"use client";

import type { ReactNode } from "react";

/** A titled card. Every step is a stack of these. */
export function StepCard({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="card space-y-4 p-5">
      {title ? (
        <h2 className="eyebrow text-eui-fg-muted">{title}</h2>
      ) : null}
      {children}
    </section>
  );
}

/** The read-only figures under a card's inputs — what the engine makes of what
 *  you just typed. They update on every keystroke, which is the whole point: the
 *  model is not a black box you submit to. */
export function DerivedList({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-eui-border pt-4 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="space-y-0.5">
          <dt className="text-[11px] text-eui-fg-muted">{item.label}</dt>
          <dd className="tabular text-sm font-medium text-eui-fg">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

interface ChoiceTileProps {
  label: string;
  hint: string;
  selected: boolean;
  onSelect: () => void;
}

/** A scenario tile. `aria-pressed` rather than a radio group: these are buttons
 *  that reload the whole form from a preset, not a field the form reads. */
export function ChoiceTile({ label, hint, selected, onSelect }: ChoiceTileProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex min-h-11 flex-col gap-1 rounded-card border p-4 text-left transition-colors ${
        selected
          ? "border-eui-accent bg-eui-accent/10 text-eui-fg"
          : "border-eui-border bg-eui-card text-eui-fg hover:bg-eui-card-hover"
      }`}
    >
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-xs text-eui-fg-muted">{hint}</span>
    </button>
  );
}

/** A checkbox row — used for the two toggles that change which fields exist
 *  (return logistics, land leg). */
export function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 items-center gap-3 text-sm text-eui-fg">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[var(--color-accent)]"
      />
      <span>{label}</span>
    </label>
  );
}
