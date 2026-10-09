import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Crucial for direct GitHub Pages deployment from subfolder
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
