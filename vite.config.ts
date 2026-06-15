import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [vue(), tailwindcss(), vueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: true, // or '0.0.0.0'
    fs: {
      allow: [".."], // allow serving files from parent folder
    },
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // optionally remove /api if backend doesn’t expect it
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});