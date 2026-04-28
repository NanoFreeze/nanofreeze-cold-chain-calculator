import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

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

  // Trailing slashes so `out/es/index.html` resolves at `/es/` on plain static
  // hosts (S3 + CloudFront serve a directory index; without this they 404).
  trailingSlash: true,

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
