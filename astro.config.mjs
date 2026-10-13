import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  output: "static",
  site: "https://paths.significanthobbies.com",
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ["echarts"],
    },
  },
});
