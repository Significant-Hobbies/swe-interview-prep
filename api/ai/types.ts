import type { IncomingMessage, ServerResponse } from 'node:http';

export type ApiRequest<Body> = IncomingMessage & { body: Body };

export type ApiResponse = ServerResponse & {
  status(code: number): ApiResponse;
  json(body: unknown): ApiResponse;
};
