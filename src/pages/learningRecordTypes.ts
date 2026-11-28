import type { ReactNode } from 'react';

// Shapes for the read-only learning record page (kept apart from the
// components so the page stays simple to read).
export type Json = Record<string, any>;
export type Page = { items: Json[]; nextCursor: string | null };
export const PAGED_SECTIONS = ['knowledge', 'courses', 'sessions', 'resources', 'gaps'] as const;
export type PagedSection = (typeof PAGED_SECTIONS)[number];
export type PageMap = Partial<Record<PagedSection, Page>>;
export type ErrorMap = Partial<Record<PagedSection, string>>;
export type SectionProps = { data: Json; more?: ReactNode };
export type MoreButtonProps = { onClick: () => void; busy: boolean; error?: string };
export type LoadingMap = Partial<Record<PagedSection, boolean>>;

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function pagedOf(pages: PageMap, data: Json | null, key: PagedSection): Page | undefined {
  return pages[key] ?? data?.[key];
}
export type RecordState = { data: Json | null; error: string | null; loading: boolean };
export const INITIAL_RECORD_STATE: RecordState = { data: null, error: null, loading: true };
