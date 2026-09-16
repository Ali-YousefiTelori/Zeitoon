/// <reference types="vitest" />
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const pwaBuildVersion = () => ({
  name: "pwa-build-version",
  closeBundle() {
    const serviceWorkerPath = path.resolve(__dirname, "build", "sw.js");
    if (!fs.existsSync(serviceWorkerPath)) return;

    const serviceWorker = fs
      .readFileSync(serviceWorkerPath, "utf8")
      .replace("__BUILD_ID__", String(Date.now()));
    fs.writeFileSync(serviceWorkerPath, serviceWorker);
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react(), pwaBuildVersion()],
  server: {
    watch: {
      ignored: ["**/.vs/**", "**/dist/**", "**/android/**", "**/build/**"],
    },
  },
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["src/setupTests.ts"],
  },
  build: {
    outDir: "./build",
  },
});
