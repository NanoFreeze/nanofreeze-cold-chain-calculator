// Inline script string — set the .dark class on <html> BEFORE React hydrates so
// dark-preferring devices don't see a flash of light mode.
//
// Rendered from a Server Component via dangerouslySetInnerHTML (see
// ThemeInitScript.tsx), NOT next/script: that wraps the script in a Client
// Component, and React 19 warns whenever a <script> element re-renders inside
// one — which happens every time NextIntlClientProvider re-renders on a locale
// change.
//
// Vendored from @nanofreeze/theme. The cookie mirror the monorepo keeps here is
// dropped: it exists so server-rendered PDFs/OG images can honour the viewer's
// theme, and this app has no server.
export const themeInitScript = `(function () {
  try {
    var stored = localStorage.getItem("theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var isDark = stored === "dark" || ((stored === "system" || !stored) && prefersDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.style.colorScheme = "light";
    }
  } catch {}
})();`;
