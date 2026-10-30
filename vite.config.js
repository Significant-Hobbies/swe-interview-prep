import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { localAi } from './vite-plugin-local-ai.js';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    localAi(),
    {
      name: 'preload-learning-entry',
      apply: 'build',
      transformIndexHtml: {
        order: 'post',
        handler(html, { bundle }) {
          const entry = Object.values(bundle ?? {}).find(
            (file) => file.type === 'chunk' && file.facadeModuleId?.endsWith('/src/bootstrap.tsx')
          );
          if (!entry) throw new Error('Learning bootstrap entry was not emitted');
          const scripts = new Set();
          const styles = new Set();
          const visit = (file) => {
            if (!file || file.type !== 'chunk' || scripts.has(file.fileName)) return;
            scripts.add(file.fileName);
            for (const stylesheet of file.viteMetadata?.importedCss ?? []) styles.add(stylesheet);
            for (const dependency of file.imports) visit(bundle[dependency]);
          };
          visit(entry);
          const home = Object.values(bundle).find(
            (file) => file.type === 'chunk' && file.facadeModuleId?.endsWith('/src/pages/Home.tsx')
          );
          const homeScripts = home
            ? [home.fileName, ...home.imports].filter(
                (href) => !scripts.has(href) && !html.includes(href)
              )
            : [];
          // Keep the same entry CSS in the document, without making the
          // dynamic React bootstrap wait for another stylesheet request.
          let inlined = 0;
          const styledHtml = html.replace(
            /<link rel="stylesheet" crossorigin href="\/([^"/]+\/[^"/]+\.css)">/g,
            (_link, href) => {
              const css = bundle[href];
              if (
                css?.type !== 'asset' ||
                typeof css.source !== 'string' ||
                /<\/style/i.test(css.source)
              ) {
                throw new Error('Invalid learning entry stylesheet');
              }
              inlined += 1;
              return `<style>${css.source}</style>`;
            }
          );
          if (inlined !== 1) throw new Error('Expected one learning entry stylesheet');
          return {
            html: styledHtml,
            tags: [
              {
                tag: 'script',
                children: `if(location.pathname==='/'){for(const href of ${JSON.stringify(homeScripts)}){const link=document.createElement('link');link.rel='modulepreload';link.crossOrigin='anonymous';link.href='/'+href;document.head.append(link)}}`,
              },
              ...[...styles].map((href) => ({
                tag: 'link',
                attrs: { rel: 'stylesheet', href: `/${href}` },
              })),
              ...[...scripts]
                .filter((href) => !html.includes(href))
                .map((href) => ({
                  tag: 'link',
                  attrs: { rel: 'modulepreload', crossorigin: true, href: `/${href}` },
                })),
            ].map((tag) => ({ ...tag, injectTo: 'head' })),
          };
        },
      },
    },
  ],
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
        // Keep the shared renderer stable. Let the bundler place icons with
        // their actual consumers so lazy learning tools do not add icons to
        // the public landing's initial download.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (
            id.includes('/react-router') ||
            id.includes('/react-dom') ||
            id.match(/[\\/]react[\\/]index|react[\\/]cjs/)
          ) {
            return 'vendor-react';
          }
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
