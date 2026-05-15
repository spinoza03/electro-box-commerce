import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Static SPA deployment (Hostinger static hosting): no Node server, fully
// client-rendered. All data is fetched client-side via Supabase, so SSR is
// not required. Build output lands in .output/public with an /_shell.html.
export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    server: { entry: "server" },
    spa: { enabled: true },
  },
});
