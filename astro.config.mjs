import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { readFile, writeFile } from "node:fs/promises";

export default defineConfig({
  output: "static",
  site: "https://paths.significanthobbies.com",
  integrations: [react(), {
    name: "inline-homepage-styles",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        // Inline only the landing page's emitted CSS, not thousands of profiles.
        const homepage = new URL("index.html", dir);
        let html = await readFile(homepage, "utf8");
        const stylesheets = [...html.matchAll(/<link rel="stylesheet" href="(\/_astro\/[^"/]+\.css)">/g)];
        if (!stylesheets.length) throw new Error("Missing homepage stylesheet");
        for (const [link, href] of stylesheets) {
          const css = await readFile(new URL(href.slice(1), dir), "utf8");
          if (/<\/style/i.test(css)) throw new Error("Unsafe inline stylesheet");
          const urls = [...css.matchAll(/url\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/g)];
          if (urls.some(([, double, single, bare]) => !/^(\/|data:|https?:)/.test((double ?? single ?? bare).trim()))) {
            throw new Error("Homepage CSS requires stylesheet-relative URLs");
          }
          html = html.replace(link, () => `<style>${css}</style>`);
        }
        await writeFile(homepage, html);
      },
    },
  }],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ["echarts"],
    },
  },
});
