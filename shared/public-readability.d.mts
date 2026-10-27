export const identity: {
  name: string;
  url: string;
  summary: string;
  openapi: string;
  sitemap: string;
  trainingAllowed: boolean;
  excludedPaths: string[];
};
export function handlePublicReadability(
  request: Request,
  assets?: { fetch(request: Request): Promise<Response> }
): Promise<Response | null>;
export function advertisePublic(
  request: Request,
  response: Response,
  assets?: { fetch(request: Request): Promise<Response> }
): Promise<Response>;
export function robots(): string;
export function wantsMarkdown(request: Request): boolean;
export function markdownResponse(
  body: string,
  request: Request,
  headers?: Record<string, string>
): Response;
