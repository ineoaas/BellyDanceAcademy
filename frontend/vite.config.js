import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

// The API is proxied so the browser sees one origin: session and CSRF
// cookies stay first-party and no CORS configuration is needed.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  build: {
    // The Mux video player (~1.1 MB) is its own lazily-loaded chunk, fetched
    // only when a lesson video is actually shown.
    chunkSizeWarningLimit: 1200,
  },
  server: {
    port: 3000,
    proxy: {
      "/api": { target: process.env.API_URL ?? "http://localhost:8080", changeOrigin: false },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.js"],
    css: false,
  },
});
