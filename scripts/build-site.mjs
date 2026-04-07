// Assemble the deployable demo site.
//
// The demo pages import the built engine as `./dist/...`, so the HTML and the
// compiled JS have to sit side by side. That layout is what gets uploaded, and
// `npm run demo` serves the very same folder — one artifact, served identically
// in local dev and in production, so a path that works here works there.
//
// Output (gitignored):
//   site/index.html          ← demo/index.html          (capas v2 calculator)
//   site/revenue-uplift.html ← demo/revenue-uplift.html (v1 model)
//   site/dist/**.js          ← dist/**.js               (the engine, ESM)

import { cp, mkdir, rm, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const site = join(root, "site");

await rm(site, { recursive: true, force: true });
await mkdir(site, { recursive: true });

// Pages, flattened to the site root.
await cp(join(root, "demo"), site, { recursive: true });

// The engine. Only the ESM the browser actually loads — no .d.ts, no source
// maps (they'd point at TypeScript files we don't upload).
await cp(join(root, "dist"), join(site, "dist"), {
  recursive: true,
  filter: (src) => !src.endsWith(".d.ts") && !src.endsWith(".map"),
});

const pages = (await readdir(site)).filter((f) => f.endsWith(".html"));
console.log(`site/ ready — ${pages.length} pages: ${pages.join(", ")}`);
