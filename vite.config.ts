import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  appType: 'mpa',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        prototype01: resolve(__dirname, 'prototypes/01_steering_profiles.html'),
        prototype03: resolve(__dirname, 'prototypes/03_neo_metropolis_visual.html'),
        prototype04: resolve(__dirname, 'prototypes/04_craft_vfx.html'),
        prototype05: resolve(__dirname, 'prototypes/05_craft_geometry_lab.html')
      },
      output: {
        manualChunks: {
          three: ['three']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
});
