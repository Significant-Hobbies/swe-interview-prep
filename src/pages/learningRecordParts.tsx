import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { type Json, profileRows, type SectionProps } from './learningRecordTypes';

// Building blocks for the read-only learning record pages.

export function recordHref(kind: string, id: string) {
  return ['', 'record', kind, encodeURIComponent(id)].join('/');
}

export function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
      {children}
    </span>
  );
}

export function Section({
  id,
  title,
  count,
  children,
  footer,
}: {
  id: string;
  title: string;
  count?: number | string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section id={id} className="section-rule mt-12 scroll-mt-20 pt-8">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
        {count !== undefined && <span className="font-mono text-xs text-white/40">{count}</span>}
      </div>
      <div className="mt-5">{children}</div>
      {footer}
    </section>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-white/45">{children}</p>;
}

export function Pill({
  children,
  tone = 'muted',
}: {
  children: ReactNode;
  tone?: 'muted' | 'sky' | 'emerald' | 'amber' | 'rose';
}) {
  const tones = {
    muted: 'border-white/10 text-white/55',
    sky: 'border-sky-400/30 text-sky-300',
    emerald: 'border-emerald-400/30 text-emerald-300',
    amber: 'border-amber-400/30 text-amber-300',
    rose: 'border-rose-400/30 text-rose-300',
  };
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export const CATEGORY_TONE: Record<string, 'muted' | 'sky' | 'emerald' | 'amber' | 'rose'> = {
  'previously-known': 'emerald',
  'newly-learned': 'sky',
  'needs-depth': 'amber',
  'needs-revision': 'rose',
  'due-for-review': 'amber',
  unassessed: 'muted',
};

export function List({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="mt-6">
      <Label>{title}</Label>
      <ul className="mt-2 space-y-1.5 text-sm leading-6 text-white/75">
        {items.map((item) => (
          <li key={item} className="border-l border-white/10 pl-3">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Shell({
  title,
  eyebrow,
  children,
  back,
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
  back?: boolean;
}) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 md:px-6 md:py-14">
      {back && (
        <Link
          to="/record"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-white/50 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Learning record
        </Link>
      )}
      <header className={back ? 'mt-6' : ''}>
        <Label>{eyebrow}</Label>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
      </header>
      {children}
    </main>
  );
}

export function Status({
  loading,
  error,
  signedIn,
}: {
  loading: boolean;
  error: string | null;
  signedIn: boolean;
}) {
  const location = useLocation();
  if (!signedIn) {
    const loginHref = ['/login', new URLSearchParams({ next: location.pathname }).toString()].join(
      '?'
    );
    return (
      <p className="mt-8 text-sm text-white/60">
        <Link to={loginHref} className="text-white underline underline-offset-4">
          Sign in
        </Link>{' '}
        to see the learning record your assistant keeps.
      </p>
    );
  }
  if (loading)
    return (
      <p className="mt-8 animate-pulse text-sm text-white/40" aria-busy="true">
        Loading…
      </p>
    );
  if (error)
    return (
      <p className="mt-8 text-sm text-rose-300" role="alert">
        {error}
      </p>
    );
  return null;
}

export function ProfileSection({ data }: { data: Json }) {
  const profile = data.profile?.profile ?? {};
  const rows = profileRows(profile);
  const hasContent = Boolean(profile.background || profile.availableTime || rows.length);
  return (
    <Section id="profile" title="Profile">
      {hasContent ? (
        <dl className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
          {profile.background && (
            <div className="sm:col-span-2">
              <dt>
                <Label>Background</Label>
              </dt>
              <dd className="mt-1 text-white/75">{profile.background}</dd>
            </div>
          )}
          {rows.map((row) => (
            <div key={row.key}>
              <dt>
                <Label>{row.label}</Label>
              </dt>
              <dd className="mt-1 text-white/75">{row.value}</dd>
            </div>
          ))}
          {profile.availableTime && (
            <div>
              <dt>
                <Label>Available time</Label>
              </dt>
              <dd className="mt-1 text-white/75">
                {profile.availableTime.minutesPerDay ??
                  profile.availableTime.minutesPerSession ??
                  '—'}{' '}
                min
                {profile.availableTime.daysPerWeek
                  ? ` · ${profile.availableTime.daysPerWeek} days a week`
                  : ''}
              </dd>
            </div>
          )}
        </dl>
      ) : (
        <Empty>No profile yet. Tell your assistant about your background and goals.</Empty>
      )}
    </Section>
  );
}

export function KnowledgeSection({ data, more }: SectionProps) {
  return (
    <Section
      id="knowledge"
      title="Knowledge"
      count={data.knowledge.summary.recordedSubjects}
      footer={more}
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {Object.entries(data.knowledge.summary.byCategory as Record<string, number>).map(
          ([category, count]) => (
            <Pill key={category} tone={CATEGORY_TONE[category]}>
              {category} {count}
            </Pill>
          )
        )}
      </div>
      {data.knowledge.items.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-white/40">
              <tr className="border-b border-white/10">
                {['Subject', 'Assessed', 'Self-reported', 'Target', 'Status', 'Last assessed'].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="py-2 pr-4 font-mono text-[10px] font-medium uppercase tracking-wider"
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {data.knowledge.items.map((item: Json) => (
                <tr key={item.subject.key} className="border-b border-white/5">
                  <td className="py-2.5 pr-4 text-white">
                    {item.subject.url ? (
                      <a href={item.subject.url} className="hover:underline">
                        {item.subject.label}
                      </a>
                    ) : (
                      item.subject.label
                    )}
                    {item.subject.kind === 'topic' && (
                      <span className="ml-2 font-mono text-[10px] text-white/35">topic</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4 text-white/75">{item.level}</td>
                  <td className="py-2.5 pr-4 text-white/50">{item.selfReportedLevel ?? '—'}</td>
                  <td className="py-2.5 pr-4 text-white/50">{item.targetLevel ?? '—'}</td>
                  <td className="py-2.5 pr-4">
                    <Pill tone={CATEGORY_TONE[item.category]}>{item.category}</Pill>
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-xs text-white/45">
                    {formatDate(item.lastAssessedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>Nothing assessed yet.</Empty>
      )}
    </Section>
  );
}

export function CoursesSection({ data, more }: SectionProps) {
  return (
    <Section id="courses" title="Courses" count={data.coursesCount} footer={more}>
      {data.courses.length ? (
        <ul className="divide-y divide-white/5">
          {data.courses.map((course: Json) => (
            <li key={course.id} className="py-3">
              <Link
                to={recordHref('courses', course.id)}
                className="group flex flex-wrap items-baseline justify-between gap-3"
              >
                <span className="text-white group-hover:underline">{course.title}</span>
                <span className="flex items-center gap-2">
                  {course.isPrimary && <Pill tone="sky">primary</Pill>}
                  <Pill>{course.status}</Pill>
                  <span className="font-mono text-xs text-white/40">
                    {course.completedLessons}/{course.lessonCount} lessons
                  </span>
                </span>
              </Link>
              {course.nextLesson && (
                <p className="mt-1 text-xs text-white/45">Next: {course.nextLesson.title}</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <Empty>No courses yet.</Empty>
      )}
    </Section>
  );
}

function ResourceRow({ resource }: { resource: Json }) {
  const statusTone = resource.status === 'completed' ? 'emerald' : 'muted';
  return (
    <li className="flex flex-wrap items-baseline justify-between gap-3 py-3">
      <Link to={recordHref('resources', resource.id)} className="text-white hover:underline">
        {resource.title}
      </Link>
      <span className="flex items-center gap-2">
        <Pill>{resource.kind}</Pill>
        <Pill tone={statusTone}>{resource.status}</Pill>
      </span>
    </li>
  );
}

export function ResourcesSection({ data, more }: SectionProps) {
  const resources: Json[] = data.resources;
  return (
    <Section id="resources" title="Reading" count={data.resourcesCount} footer={more}>
      {resources.length ? (
        <ul className="divide-y divide-white/5">
          {resources.map((resource) => (
            <ResourceRow key={resource.id} resource={resource} />
          ))}
        </ul>
      ) : (
        <Empty>Share an article or paper with your assistant and it will appear here.</Empty>
      )}
    </Section>
  );
}

export function GapsSection({ data, more }: SectionProps) {
  return (
    <Section id="gaps" title="Curriculum gaps" count={data.gapsCount} footer={more}>
      {data.gaps.length ? (
        <ul className="divide-y divide-white/5">
          {data.gaps.map((gap: Json) => (
            <li key={gap.id} className="py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <Link to={recordHref('gaps', gap.id)} className="text-white hover:underline">
                  {gap.topic}
                </Link>
                <span className="flex items-center gap-2">
                  <Pill>{gap.gapKind}</Pill>
                  <Pill tone={gap.status === 'resolved' ? 'emerald' : 'amber'}>{gap.status}</Pill>
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-white/50">{gap.description}</p>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>No gaps reported.</Empty>
      )}
    </Section>
  );
}

export function SessionList({ sessions }: { sessions: Json[] }) {
  return (
    <ul className="divide-y divide-white/5">
      {sessions.map((session) => (
        <li key={session.id} className="py-3">
          <Link
            to={recordHref('sessions', session.id)}
            className="group flex flex-wrap items-baseline justify-between gap-3"
          >
            <span className="text-white group-hover:underline">{session.title}</span>
            <span className="flex items-center gap-2">
              <Pill>{session.kind}</Pill>
              <span className="font-mono text-xs text-white/40">
                {formatDate(session.startedAt)}
              </span>
            </span>
          </Link>
          {session.summary && (
            <p className="mt-1 text-xs leading-5 text-white/50">{session.summary}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
