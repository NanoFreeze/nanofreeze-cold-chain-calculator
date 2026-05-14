import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Base path, env-driven — because this app is served from a SUBPATH on both of
// its hosts, and Next emits absolute /_next/… asset URLs that 404 without it:
//   • production: opensource.nanofreeze.tech/cold-chain/calculator/
//                 → BASE_PATH=/cold-chain/calculator   (scripts/deploy-opensource.sh)
//   • GitHub Pages: <owner>.github.io/<repo>/
//                 → BASE_PATH=/<repo>                  (.github/workflows/deploy-pages.yml)
// Local dev leaves it empty (served at /). basePath and assetPrefix must move
// together. Trailing slash stripped so we never emit a double slash.
const basePath = (process.env.BASE_PATH ?? "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  // Static export, and it has to stay that way. The public demo is served from
  // a private S3 bucket behind CloudFront on the *.nanofreeze.tech perimeter,
  // where a server-side surface would sit inside the session-cookie domain —
  // the monorepo's opensource-stack.ts says so in as many words. Static export
  // is also what keeps this repo forkable: `npm run build` gives anyone an
  // out/ they can drop on Pages, Netlify, Vercel, or any bucket.
  //
  // Consequences of `export` you will trip over if you forget: no middleware
  // (so next-intl gets `localePrefix: "always"` and public/index.html does the
  // root redirect), no headers()/redirects() (the CDN owns those), no route
  // handlers, no server actions. None of it is a loss — the calculator runs
  // entirely in the browser and has no server to talk to.
  output: "export",

  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,

  // Trailing slashes so `out/es/index.html` resolves at `/es/` on plain static
  // hosts (S3 + CloudFront serve a directory index; without this they 404).
  trailingSlash: true,

  // Static export can't run the image optimizer (there's no server), so the
  // <Image> for the wordmark is served as-is from public/. Required for `export`.
  images: { unoptimized: true },

  poweredByHeader: false,

  // The engine in src/ is native ESM: it imports siblings as "./calc.js" so the
  // compiled dist/ runs unflagged in Node. Webpack needs to be told that a
  // ".js" specifier may resolve to the ".ts" source when it bundles from src/.
  // (This is also why dev + build run with --webpack: Turbopack has no
  //  extensionAlias equivalent.)
  webpack(config) {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
};

export default withNextIntl(nextConfig);
