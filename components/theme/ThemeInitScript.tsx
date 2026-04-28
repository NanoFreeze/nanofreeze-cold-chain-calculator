import { themeInitScript } from "./theme-init";

/** Renders the anti-FOUC theme script. Must be the first child of <body>: the
 *  browser executes it before parsing the rest of the document, so the .dark
 *  class is on <html> before anything paints. */
export function ThemeInitScript({ id = "theme-init" }: { id?: string }) {
  return (
    <script
      id={id}
      // Inline init script is the documented React pattern for SSR-only inline
      // scripts — it must run before paint to avoid a dark-mode flash. See
      // theme-init.ts for why this beats next/script.
      dangerouslySetInnerHTML={{ __html: themeInitScript }}
    />
  );
}
