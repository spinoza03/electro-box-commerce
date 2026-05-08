import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Vercel deployment: Disable Cloudflare plugin so Nitro can automatically detect and build for Vercel.
export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    server: { entry: "server" },
  },
});
