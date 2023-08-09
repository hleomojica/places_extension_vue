import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import fg from "fast-glob";
import fs from "fs-extra";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    vue(),
    {
      name: "copy-plugin",
      async generateBundle() {
        const files = await fg("manifest.json");
        for (const file of files) {
          await this.emitFile({
            type: "asset",
            fileName: "manifest.json",
            source: await fs.promises.readFile(file),
          });
        }
      },
    },
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: "./index.html",
        contentScript: "./contentScript.js",
      },
      output: {
        inlineDynamicImports: false,
        dir: "dist",
        entryFileNames: "[name].js",
        format: "es", // or 'cjs'
      },
    },
  },
});
