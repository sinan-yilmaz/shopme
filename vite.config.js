import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const srcDir = (dir) => path.resolve(import.meta.dirname, "src", dir);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      root: srcDir("root"),
      pages: srcDir("pages"),
      features: srcDir("features"),
      ui: srcDir("ui"),
      lib: srcDir("lib"),
      common: srcDir("common"),
      assets: srcDir("assets"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.js"],
  },
});
