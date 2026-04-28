"use client";
import { useCallback, useSyncExternalStore } from "react";

// Light/dark theme primitive, vendored from @nanofreeze/theme.
//
// Library-free by policy (the monorepo's CLAUDE.md: "Do not add next-themes").
// `useSyncExternalStore` subscribes to the two sources of truth — the .dark class
// on <html>, and the prefers-color-scheme media query — so it is SSR-safe without
// a setState-in-effect. Preference persists in localStorage["theme"]; the inline
// script in theme-init.ts applies it before hydration.

export type Theme = "light" | "dark";
export type ThemePreference = "light" | "dark" | "system";

export interface UseThemeResult {
  /** Resolved theme — what the page actually renders as. */
  readonly theme: Theme;
  readonly isDark: boolean;
  /** User preference — may be "system" (= follow OS). */
  readonly preference: ThemePreference;
  readonly setPreference: (pref: ThemePreference) => void;
  /** Cycle: light → dark → system → light. */
  readonly cycle: () => void;
}

const STORAGE_KEY = "theme";

function getResolvedSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getPreferenceSnapshot(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // private mode / storage disabled — fall through to "system"
  }
  return "system";
}

function getServerSnapshot(): Theme {
  return "light";
}

function getServerPreference(): ThemePreference {
  return "system";
}

function subscribeResolved(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  mql.addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    mql.removeEventListener("change", onChange);
  };
}

function subscribePreference(onChange: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", handler);
  window.addEventListener("themechange", onChange);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("themechange", onChange);
  };
}

function applyPreference(pref: ThemePreference) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved: Theme = pref === "system" ? (prefersDark ? "dark" : "light") : pref;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
  try {
    if (pref === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, pref);
  } catch {
    // quota / private mode — the class still flipped, only persistence is lost
  }
  window.dispatchEvent(new Event("themechange"));
}

export function useTheme(): UseThemeResult {
  const theme = useSyncExternalStore(subscribeResolved, getResolvedSnapshot, getServerSnapshot);
  const preference = useSyncExternalStore(
    subscribePreference,
    getPreferenceSnapshot,
    getServerPreference,
  );
  const setPreference = useCallback((pref: ThemePreference) => {
    applyPreference(pref);
  }, []);
  const cycle = useCallback(() => {
    const next: ThemePreference =
      preference === "light" ? "dark" : preference === "dark" ? "system" : "light";
    applyPreference(next);
  }, [preference]);
  return { theme, isDark: theme === "dark", preference, setPreference, cycle } as const;
}
