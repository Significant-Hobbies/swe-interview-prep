import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:3456',
    },
  },
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      drafts: { customMedia: true },
    },
  },
  build: {
    // Initial bundle is ~430 KB. The chunks Vite warns about are all lazy:
    // Mermaid core, useCodeExecution (Go WASM runtime), and per-repo library
    // content.json files behind AmbientLibrary clicks. Bump to silence the
    // false positive rather than chasing unsplitable third-party blobs.
    chunkSizeWarningLimit: 2000,
    cssMinify: 'lightningcss',
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}', 'shared/**/*.test.{mjs,js}', 'handlers/**/*.test.{mjs,js}'],
  },
})
