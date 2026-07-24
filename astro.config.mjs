import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: "https://paths.significanthobbies.com",
  build: {
    inlineStylesheets: "always",
  },
  vite: {
    ssr: {
      noExternal: ["echarts"],
    },
  },
});
