import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: "static",
  adapter: cloudflare(),
  site: "https://success-by-26.pages.dev",
  vite: {
    ssr: {
      noExternal: ["echarts"],
    },
  },
});
