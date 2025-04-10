import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.(jsx|js)$/
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3301',
        changeOrigin: true
      }
    }
  }
});