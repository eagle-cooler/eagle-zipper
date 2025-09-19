import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  build: {
    outDir: "./dist",
    sourcemap: false, // Disable source maps for production
    rollupOptions: {
      external: [
        // Node.js built-ins that Eagle provides
        'fs', 'path', 'crypto', 'zlib', 'os',
        // Node modules that Eagle provides
        'adm-zip', '7zip-min'
      ]
    }
  },
  plugins: [react()],
});
