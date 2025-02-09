import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  esbuild: {
    // Configuring esbuild to treat both .js and .jsx files as JSX
    loader: 'jsx', // This will treat .js files with JSX correctly
    include: /src\/.*\.(jsx|js)$/ // Target both JS and JSX files in the src directory
  },
});
