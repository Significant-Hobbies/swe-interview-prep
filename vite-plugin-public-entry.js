import react from '@vitejs/plugin-react';
import { createServer } from 'vite';

/** Build the real public route with existing React/Vite, without mounting API middleware. */
export function publicEntry() {
  let root;
  let developmentServer;
  return {
    name: 'public-entry',
    configResolved(config) {
      root = config.root;
    },
    configureServer(server) {
      developmentServer = server;
    },
    transformIndexHtml: {
      order: 'post',
      async handler(html, { bundle }) {
        const owned = !developmentServer;
        const server =
          developmentServer ??
          (await createServer({
            root,
            configFile: false,
            envFile: false,
            plugins: [react()],
            server: { middlewareMode: true, hmr: false, watch: null },
            optimizeDeps: { noDiscovery: true, include: [] },
          }));
        try {
          const policy = await server.ssrLoadModule('/src/lib/learnerState.ts');
          const build = Boolean(bundle);
          const script = policy.initialEntryScript(build);
          if (script.includes('</script')) throw new Error('Invalid public entry script');
          if (html.split('<!-- public-entry:policy -->').length !== 2)
            throw new Error('Expected one public entry policy slot');
          let result = html.replace('<!-- public-entry:policy -->', `<script>${script}</script>`);
          if (build) {
            const entry = await server.ssrLoadModule('/src/entry-prerender.tsx');
            const markup = await entry.renderPublicLanding();
            if (result.split('<div id="root"></div>').length !== 2)
              throw new Error('Expected one empty application root');
            result = result.replace(
              '<div id="root"></div>',
              `<div id="root" data-public-prerender>${markup}</div>`
            );
          }
          return result;
        } finally {
          if (owned) await server.close();
        }
      },
    },
  };
}
