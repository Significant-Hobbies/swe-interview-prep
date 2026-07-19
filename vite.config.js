import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { localAi } from './vite-plugin-local-ai.js';

/** Load extracted app CSS without blocking first paint — index.html carries the LCP shell. */
function deferAppCss() {
  return {
    name: 'defer-app-css',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        let out = html.replace(
          /<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+\.css)">/g,
          [
            '<link rel="preload" href="$1" as="style" onload="this.onload=null;this.rel=\'stylesheet\'">',
            '<noscript><link rel="stylesheet" href="$1"></noscript>',
          ].join('\n    ')
        );
        const jsTag = out.match(
          /<script type="module" crossorigin src="(\/assets\/index-[^"]+\.js)"><\/script>/
        );
        if (jsTag) {
          out = out.replace(jsTag[0], '');
          out = out.replace(
            /<\/body>/,
            `    <script type="module" crossorigin src="${jsTag[1]}"></script>\n  </body>`
          );
        }
        return out;
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), deferAppCss(), localAi()],
  assetsInclude: ['**/*.wasm'],
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
