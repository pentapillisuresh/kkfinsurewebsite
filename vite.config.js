import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // target: 'http://localhost:3000',
        target: 'https://service.kkfinsure.org',
        changeOrigin: true,
      },
      '/uploads': {
        // target: 'http://localhost:3000',
        target: 'https://service.kkfinsure.org',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});