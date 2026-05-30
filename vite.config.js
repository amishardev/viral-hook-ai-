import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// Tailwind CSS is handled via PostCSS (postcss.config.js) — avoids lightningcss native binary issues on Linux
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    minify: 'esbuild',
  },
});
