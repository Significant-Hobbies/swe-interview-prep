import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { localAi } from './vite-plugin-local-ai.js';

export default defineConfig({
  plugins: [react(), tailwindcss(), localAi()],
  assetsInclude: ['**/*.wasm'],
  optimizeDeps: {
    // Excalidraw imports this CommonJS-only font-loader dependency as a
    // default export. Vite 8 needs explicit interop or the diagram canvas
    // crashes while loading fonts in development.
    needsInterop: ['es6-promise-pool'],
  },
  resolve: {
    // Langium 3 re-exports these internals, while vscode-jsonrpc 9 only
    // exposes the same symbols through its public package entry point.
    alias: {
      'vscode-jsonrpc/lib/common/cancellation.js': 'vscode-jsonrpc',
      'vscode-jsonrpc/lib/common/events.js': 'vscode-jsonrpc',
    },
  },
  server: {
    fs: { allow: ['..'] },
  },
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      drafts: { customMedia: true },
    },
  },
  build: {
    modulePreload: { polyfill: false },
    // Initial bundle is ~430 KB. The chunks Vite warns about are all lazy:
    // Mermaid core, useCodeExecution (Go WASM runtime), and per-repo library
    // content.json files behind AmbientLibrary clicks. Bump to silence the
    // false positive rather than chasing unsplitable third-party blobs.
    chunkSizeWarningLimit: 2000,
    cssMinify: 'lightningcss',
    rollupOptions: {
      output: {
        // Split stable vendor code into its own chunk so app-code changes
        // don't invalidate the browser cache for React/router/lucide.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (
            id.includes('/react-router') ||
            id.includes('/react-dom') ||
            id.match(/[\\/]react[\\/]index|react[\\/]cjs/)
          ) {
            return 'vendor-react';
          }
          if (id.includes('/lucide-react')) return 'vendor-lucide';
        },
      },
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}', 'shared/**/*.test.{mjs,js}', 'handlers/**/*.test.{mjs,js}'],
  },
});
