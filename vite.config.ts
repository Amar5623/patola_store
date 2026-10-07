// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";

// `vite dev` runs server functions in Node, where only VITE_* variables are
// loaded automatically. Expose the server secrets from .env / .env.local to
// process.env so Razorpay test mode works locally. Never applies to builds;
// deployed Workers read secrets from Cloudflare.
if (!process.argv.includes("build")) {
  for (const [key, value] of Object.entries(loadEnv("development", process.cwd(), ""))) {
    process.env[key] ??= value;
  }
}

// Nitro accepts `wrangler` here; Lovable's typings only declare the first two keys.
const cloudflare = {
  deployConfig: true,
  nodeCompat: true,
  wrangler: {
    name: "pragati-patola-art",
    // Keep vars set in the Cloudflare dashboard across deploys.
    // Secrets (wrangler secret put …) always persist.
    keep_vars: true,
    observability: { enabled: true },
  },
} as { deployConfig?: boolean; nodeCompat?: boolean };

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Deploy target: Cloudflare Workers (free plan allows commercial use).
  // `npm run build` writes .output/ plus a generated wrangler config, then
  // `npm run deploy` publishes it. Inside Lovable's sandbox these options are
  // overridden by Lovable's own Cloudflare settings.
  nitro: {
    preset: "cloudflare-module",
    cloudflare,
  },
});
