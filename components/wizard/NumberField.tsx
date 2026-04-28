"use client";

import type { InputHTMLAttributes } from "react";

interface Props
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "type"> {
  label: string;
  hint?: string;
  suffix?: string;
  /** Current numeric value. `null` renders empty; the user can clear the field. */
  value: number | null;
  onChange: (value: number | null) => void;
  /** Parse as an integer (rejects decimals). */
  integer?: boolean;
}

/** The numeric field used throughout the wizard. Keeps the input controlled while
 *  letting the user temporarily clear it — we don't fight the keyboard with eager
 *  re-formatting, which is why `value` is nullable rather than coerced to 0 on
 *  every keystroke. */
export function NumberField({
  label,
  hint,
  suffix,
  value,
  onChange,
  integer = false,
  min,
  max,
  step,
  ...rest
}: Props) {
  const displayValue = value === null || !Number.isFinite(value) ? "" : String(value);

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-eui-fg">{label}</span>
      <div className="relative">
        <input
          type="number"
          inputMode={integer ? "numeric" : "decimal"}
          className="input-sm tabular w-full pr-12"
          value={displayValue}
          min={min}
          max={max}
          step={step ?? (integer ? 1 : "any")}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") return onChange(null);
            const parsed = integer ? parseInt(raw, 10) : Number(raw);
            if (Number.isNaN(parsed)) return;
            onChange(parsed);
          }}
          {...rest}
        />
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-eui-fg-muted">
            {suffix}
          </span>
        ) : null}
      </div>
      {hint ? <span className="text-[11px] text-eui-fg-muted">{hint}</span> : null}
    </label>
  );
}
