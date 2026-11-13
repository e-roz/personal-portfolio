// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  vite: {
    // Tailwind runs as a Vite plugin: it scans your files during
    // `astro dev` / `astro build` and generates only the CSS you use.
    plugins: [tailwindcss()],
  },
});
