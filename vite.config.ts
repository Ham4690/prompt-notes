import { defineConfig } from "vitest/config";
import preact from "@preact/preset-vite";

export default defineConfig({
  base: "/prompt-notes/",
  plugins: [preact()],
});
