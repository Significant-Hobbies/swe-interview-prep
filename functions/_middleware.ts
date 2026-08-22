// CF Pages Functions middleware for learn.significanthobbies.com (SWE Interview Prep):
// - Handles Accept: text/markdown negotiation for pages with .md alternates.
// - Returns agent-friendly markdown 404s for unknown paths (including SPA soft-404s).
// - Serves /openapi.json with the public API spec.
// - Adds Vary: Accept to HTML responses with markdown alternates.
// - Returns JSON errors for unknown /api/* paths.
// - Adds rate-limit headers to API responses.

const SITE_URL = 'https://learn.significanthobbies.com';
const RATE_LIMIT = 120;
const RATE_LIMIT_WINDOW = 60;

// Known SPA route prefixes (first path segment). Paths not matching these
// or a static file are treated as 404 rather than served the SPA shell.
const SPA_ROUTES = new Set([
  'share',
  'login',
  'dashboard',
  'today',
  'onboarding',
  'learn',
  'explore',
  'sweep',
  'practice',
  'playground',
  'progress',
  'concepts',
  'roadmaps',
  'projects',
  'build',
  'labs',
  'drills',
  'learning',
  'sources',
  'session',
  'library',
  'about',
  'privacy',
  'changelog',
  'mock',
  'wars',
  'vibe-learning',
  'curriculum',
  'system-design',
  'notes',
  'review',
  'reviews',
]);

const errorSchema = {
  type: 'object',
  properties: {
    error: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Machine-readable error code' },
        message: { type: 'string', description: 'Human-readable error message' },
        path: { type: 'string', description: 'Request path that caused the error' },
      },
      required: ['code', 'message'],
    },
  },
  required: ['error'],
};

const versionParam = {
  name: 'Api-Version',
  in: 'header',
  description:
    'API version. Current version is 1. Deprecated versions are announced via Sunset response headers.',
  schema: { type: 'string', default: '1' },
};

const errorResponse = (description: string) => ({
  description,
  content: { 'application/json': { schema: errorSchema } },
});

const OPENAPI_SPEC = {
  openapi: '3.1.0',
  info: {
    title: 'SWE Interview Prep public API',
    version: '1.0.0',
    description:
      'SWE Interview Prep is a software engineering learning OS with tracks, concepts, roadmaps, drills, and FSRS review. The public web API exposes read-only agent surfaces: the agent catalog, sitemap, llms.txt, and per-page markdown alternates. The API is versioned via the Api-Version header; the current version is 1. Breaking changes require a new version and are announced via Sunset response headers.',
    contact: { name: 'SWE Interview Prep', url: SITE_URL },
  },
  servers: [{ url: SITE_URL }],
  tags: [{ name: 'agent-surfaces', description: 'Machine-readable public surfaces' }],
  paths: {
    '/api/ai': {
      get: {
        operationId: 'getAgentCatalog',
        tags: ['agent-surfaces'],
        summary: 'Agent catalog',
        description: 'JSON inventory of public agent surfaces.',
        parameters: [versionParam],
        responses: {
          '200': {
            description: 'Agent catalog',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    version: { type: 'string' },
                    url: { type: 'string', format: 'uri' },
                    llms: { type: 'string', format: 'uri' },
                    sitemap: { type: 'string', format: 'uri' },
                    openapi: { type: 'string', format: 'uri' },
                    surfaces: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          url: { type: 'string' },
                          md: { type: 'string' },
                          kind: { type: 'string' },
                        },
                        required: ['id', 'url', 'kind'],
                      },
                    },
                  },
                  required: ['name', 'version', 'url', 'surfaces'],
                },
              },
            },
          },
          '429': errorResponse('Rate limit exceeded'),
        },
      },
    },
    '/llms.txt': {
      get: {
        operationId: 'getLlmsTxt',
        tags: ['agent-surfaces'],
        summary: 'llms.txt index',
        description: 'Markdown index of agent surfaces and product context for LLM consumption.',
        parameters: [versionParam],
        responses: {
          '200': {
            description: 'Markdown index',
            content: {
              'text/plain': {
                schema: { type: 'string', description: 'Markdown-formatted agent index' },
              },
            },
          },
        },
      },
    },
    '/sitemap.xml': {
      get: {
        operationId: 'getSitemap',
        tags: ['agent-surfaces'],
        summary: 'Sitemap',
        description: 'XML sitemap listing all public pages.',
        parameters: [versionParam],
        responses: {
          '200': {
            description: 'XML sitemap',
            content: {
              'application/xml': {
                schema: { type: 'string', description: 'XML sitemap document' },
              },
            },
          },
        },
      },
    },
    '/openapi.json': {
      get: {
        operationId: 'getOpenApiSpec',
        tags: ['agent-surfaces'],
        summary: 'OpenAPI specification',
        description: 'This document — the OpenAPI 3.1 specification for the public API.',
        parameters: [versionParam],
        responses: {
          '200': {
            description: 'OpenAPI 3.1 spec',
            content: {
              'application/json': {
                schema: { type: 'object', description: 'OpenAPI 3.1 specification document' },
              },
            },
          },
        },
      },
    },
  },
};

function wantsMarkdown(request: Request): boolean {
  const accept = (request.headers.get('accept') || '').toLowerCase();
  if (!accept.includes('text/markdown')) return false;
  if (!accept.includes('text/html')) return true;
  return accept.indexOf('text/markdown') < accept.indexOf('text/html');
}

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  const withSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return withSlash.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/';
}

function addRateLimitHeaders(headers: Headers): void {
  headers.set('RateLimit-Limit', String(RATE_LIMIT));
  headers.set('RateLimit-Remaining', String(RATE_LIMIT - 1));
  headers.set('RateLimit-Reset', String(RATE_LIMIT_WINDOW));
}

function markdown404(pathname: string, method: string): Response {
  const path = normalizePath(pathname);
  const body = `# 404 — Not Found

\`${path}\` does not exist on learn.significanthobbies.com.

## Where to look next

- [Home](${SITE_URL}/)
- [Sitemap](${SITE_URL}/sitemap.xml)
- [Agent index](${SITE_URL}/llms.txt)
- [Agent catalog (JSON)](${SITE_URL}/api/ai)
- [OpenAPI spec](${SITE_URL}/openapi.json)
`;
  return new Response(method === 'HEAD' ? null : body, {
    status: 404,
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}

function html404(): Response {
  const body = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>404 — Not Found</title></head><body><h1>404 — Not Found</h1><p>The page you requested does not exist.</p></body></html>`;
  return new Response(body, {
    status: 404,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      vary: 'Accept, Accept-Encoding',
    },
  });
}

function jsonError(status: number, code: string, message: string, path: string): Response {
  return new Response(JSON.stringify({ error: { code, message, path } }), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
      'RateLimit-Limit': String(RATE_LIMIT),
      'RateLimit-Remaining': String(RATE_LIMIT - 1),
      'RateLimit-Reset': String(RATE_LIMIT_WINDOW),
    },
  });
}

function isKnownRoute(pathname: string): boolean {
  if (pathname === '/') return true;
  const segment = pathname.replace(/^\/+/, '').split('/')[0];
  return SPA_ROUTES.has(segment);
}

function isAssetPath(pathname: string): boolean {
  return (
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/_astro/') ||
    (pathname.includes('.') && !pathname.endsWith('.md'))
  );
}

function openApiResponse(): Response {
  const headers = new Headers({
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'cache-control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
  });
  addRateLimitHeaders(headers);
  return new Response(JSON.stringify(OPENAPI_SPEC, null, 2), { headers });
}

async function markdownAlternate(
  context: Parameters<PagesFunction>[0],
  url: URL,
  pathname: string
): Promise<Response | null> {
  const { request } = context;
  if (!wantsMarkdown(request) || pathname.endsWith('.md') || pathname.startsWith('/api/')) {
    return null;
  }
  if (!context.env.ASSETS) return null;

  const mdUrl = new URL(url);
  mdUrl.pathname = pathname === '/' ? '/index.md' : `${pathname.replace(/\/$/, '')}.md`;
  const mdResponse = await context.env.ASSETS.fetch(new Request(mdUrl.toString(), request));
  if (mdResponse.status !== 200) return null;

  const headers = new Headers(mdResponse.headers);
  headers.set('content-type', 'text/markdown; charset=utf-8');
  headers.set('vary', 'Accept, Accept-Encoding');
  headers.set('x-content-type-options', 'nosniff');
  return new Response(request.method === 'HEAD' ? null : mdResponse.body, {
    status: 200,
    headers,
  });
}

async function soft404Response(
  context: Parameters<PagesFunction>[0],
  url: URL,
  pathname: string
): Promise<Response | null> {
  if (pathname.startsWith('/api/') || isKnownRoute(pathname) || !context.env.ASSETS) return null;

  const checkUrl = new URL(url);
  checkUrl.pathname = pathname.endsWith('/') ? `${pathname}index.html` : `${pathname}/index.html`;
  const checkResponse = await context.env.ASSETS.fetch(new Request(checkUrl.toString()));
  if (checkResponse.status === 200) return null;

  return wantsMarkdown(context.request) ? markdown404(pathname, context.request.method) : html404();
}

function normalizePageResponse(response: Response, request: Request, pathname: string): Response {
  if (response.status === 404 && !pathname.startsWith('/api/')) {
    return wantsMarkdown(request) ? markdown404(pathname, request.method) : html404();
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (response.status !== 200 || !contentType.includes('text/html')) return response;

  const headers = new Headers(response.headers);
  const existingVary = headers.get('vary');
  headers.set('vary', existingVary ? `${existingVary}, Accept` : 'Accept, Accept-Encoding');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export const onRequest: PagesFunction = async (context) => {
  const { request } = context;

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return context.next();
  }

  const url = new URL(request.url);
  const pathname = url.pathname;

  // /openapi.json — serve the spec directly.
  if (pathname === '/openapi.json' || pathname === '/openapi.yaml') {
    return openApiResponse();
  }

  // JSON errors for unknown /api/* paths (excluding the catch-all API route).
  // The [[path]].js in functions/api/ handles real API routes; unknown ones
  // get a JSON error from that handler. This middleware only catches paths
  // that don't match any Pages Function.
  if (pathname.startsWith('/api/') && pathname !== '/api/ai') {
    // Let the existing API catch-all handle it — it returns its own JSON errors.
    return context.next();
  }

  // Skip asset paths — let Pages handle directly.
  if (isAssetPath(pathname)) {
    return context.next();
  }

  // Accept: text/markdown negotiation for HTML pages that have a .md alternate.
  const alternate = await markdownAlternate(context, url, pathname);
  if (alternate) return alternate;

  // SPA soft-404 detection: if the path is not a known SPA route and not a
  // static file, return 404 instead of serving the SPA shell with 200.
  const soft404 = await soft404Response(context, url, pathname);
  if (soft404) return soft404;

  const response = await context.next();
  return normalizePageResponse(response, request, pathname);
};
