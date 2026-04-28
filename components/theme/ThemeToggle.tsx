"use client";
import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { useTheme, type ThemePreference } from "./useTheme";

// Theme cycle button, vendored from @nanofreeze/theme (the package takes its
// labels as props so it can be used without an i18n library; here we read them
// from next-intl directly, since there's exactly one app consuming it).
//
// It shows the CURRENT preference, not the next one. A sun glyph on a dark
// screen reads as "you are light" in the OS apps and would read as "go light"
// here — same button, opposite meaning. Current-state wins.

const ICONS: Record<ThemePreference, React.ReactElement> = {
  dark: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  ),
  light: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  ),
  system: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
    </svg>
  ),
};

const NOOP = () => () => {};

export function ThemeToggle() {
  const t = useTranslations("theme");
  const { preference, cycle } = useTheme();
  // `preference` comes from localStorage (client only) — hold a placeholder
  // until mounted so SSR can't hydrate-mismatch. useSyncExternalStore is the
  // SSR-safe idiom; setState-in-effect trips the react-hooks lint.
  const mounted = useSyncExternalStore(NOOP, () => true, () => false);

  if (!mounted) {
    // Reserve the settled size so the navbar doesn't jump on hydration.
    return <div className="w-24 h-9" aria-hidden="true" />;
  }

  const label = t(preference);
  return (
    <button type="button" onClick={cycle} aria-label={label} title={label} className="btn-secondary-sm tap-target">
      {ICONS[preference]}
      <span className="font-medium">{label}</span>
    </button>
  );
}
