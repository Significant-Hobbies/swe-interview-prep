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

const PROFILE_TEXT_LISTS: Array<[string, string]> = [
  ['interests', 'Interests'],
  ['disinterests', 'Disinterests'],
  ['careerObjectives', 'Career objectives'],
  ['priorities', 'Priorities'],
  ['preferredMethods', 'Preferred methods'],
];

function experienceLine(item: Json) {
  const where = item.organization ? ` at ${item.organization}` : '';
  const years = item.years ? ` · ${item.years} yrs` : '';
  return `${item.role}${where}${years}`;
}

function skillLine(item: Json) {
  return item.level ? `${item.name} (${item.level}, self-reported)` : item.name;
}

function depthLine(item: Json) {
  return `${item.domain}: ${item.targetLevel}`;
}

export type ProfileRow = { key: string; label: string; value: string };

/** Every displayable profile field as a label and one line of text. */
export function profileRows(profile: Json): ProfileRow[] {
  const rows: ProfileRow[] = PROFILE_TEXT_LISTS.filter(([key]) => profile[key]?.length).map(
    ([key, label]) => ({ key, label, value: profile[key].join(' · ') })
  );
  const objectLists: Array<[string, string, (item: Json) => string]> = [
    ['experience', 'Experience', experienceLine],
    ['skills', 'Skills', skillLine],
    ['desiredDepth', 'Desired depth', depthLine],
  ];
  for (const [key, label, line] of objectLists) {
    if (profile[key]?.length) rows.push({ key, label, value: profile[key].map(line).join(' · ') });
  }
  if (profile.timezone) rows.push({ key: 'timezone', label: 'Timezone', value: profile.timezone });
  return rows;
}
