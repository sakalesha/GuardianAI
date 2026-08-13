import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    // HMR can be disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify — file watching is disabled to prevent flickering during agent edits.
    hmr: process.env.DISABLE_HMR !== "true",
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-motion": ["motion"],
          "vendor-leaflet": ["leaflet", "react-leaflet"],
          "vendor-charts": ["recharts"],
          "vendor-router": ["react-router-dom"],
        },
      },
    },
  },
});