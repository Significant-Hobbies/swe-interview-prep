import { ArrowLeft, ExternalLink } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import {
  CATEGORY_TONE,
  CoursesSection,
  Empty,
  GapsSection,
  KnowledgeSection,
  Label,
  List,
  Pill,
  ProfileSection,
  ResourcesSection,
  Section,
  SessionList,
  Shell,
  Status,
  formatDate,
  recordHref,
} from './learningRecordParts';
import {
  type ErrorMap,
  type LoadingMap,
  type Json,
  type MoreButtonProps,
  PAGED_SECTIONS,
  type Page,
  type PageMap,
  type PagedSection,
  type SectionProps,
  INITIAL_RECORD_STATE,
  errorMessage,
  pagedOf,
} from './learningRecordTypes';

// The learning record is written by external agents over MCP. This page is a
// read-only window onto it; learning never requires visiting it.

const OVERVIEW_TITLE = 'What you know, and what\u2019s next.';
type View = 'overview' | 'course' | 'session' | 'resource' | 'gap';

function useRecord(view: View, id?: string) {
  const { user } = useAuth();
  const [state, setState] = useState(INITIAL_RECORD_STATE);
  useEffect(() => {
    if (!user) {
      setState({ data: null, error: null, loading: false });
      return;
    }
    const controller = new AbortController();
    const params = new URLSearchParams(id ? { view, id } : { view });
    setState((previous) => ({ ...previous, loading: true }));
    const load = async () => {
      try {
        const response = await fetch(['/api/learning-record', params.toString()].join('?'), {
          credentials: 'include',
          signal: controller.signal,
        });
        let body: Json = {};
        try {
          body = await response.json();
        } catch {
          body = {};
        }
        if (!response.ok) throw new Error(body.error || 'Could not load the learning record.');
        setState({ data: body, error: null, loading: false });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setState({ data: null, error: (error as Error).message, loading: false });
        }
      }
    };
    void load();
    return () => controller.abort();
  }, [user, view, id]);
  return { ...state, signedIn: Boolean(user) };
}

const itemKey = (item: Json) => String(item.id ?? item.subject?.key ?? JSON.stringify(item));

/** Recency-ordered lists can shift while paging; never show an entry twice. */
function appendUnique(existing: Json[], incoming: Json[]) {
  const seen = new Set(existing.map(itemKey));
  return [...existing, ...incoming.filter((item) => !seen.has(itemKey(item)))];
}

/** Overview lists start with the first page and append later pages on request. */
function usePagedSections(data: Json | null) {
  const [pages, setPages] = useState({} as PageMap);
  // Per section, so one section finishing never re-enables another's button.
  const [loadingMore, setLoadingMore] = useState({} as LoadingMap);
  const inFlight = useRef(new Set([] as PagedSection[]));
  const [errors, setErrors] = useState({} as ErrorMap);
  useEffect(() => {
    if (!data) return;
    setPages(Object.fromEntries(PAGED_SECTIONS.map((key) => [key, data[key]])));
  }, [data]);
  const fetchPage = async (key: PagedSection, cursor: string) => {
    const params = new URLSearchParams({ view: 'list', section: key, cursor });
    const response = await fetch(['/api/learning-record', params.toString()].join('?'), {
      credentials: 'include',
    });
    if (response.status === 401)
      throw new Error('Your session expired. Sign in again to load more.');
    if (!response.ok) throw new Error('Could not load more entries. Try again.');
    const page: Page = await response.json();
    return page;
  };
  const loadMore = async (key: PagedSection) => {
    const cursor = pages[key]?.nextCursor;
    if (!cursor || inFlight.current.has(key)) return;
    inFlight.current.add(key);
    setLoadingMore((current) => ({ ...current, [key]: true }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    try {
      const next = await fetchPage(key, cursor);
      setPages((current) => ({
        ...current,
        [key]: { ...next, items: appendUnique(current[key]?.items ?? [], next.items) },
      }));
    } catch (error) {
      setErrors((current) => ({ ...current, [key]: errorMessage(error) }));
    } finally {
      inFlight.current.delete(key);
      setLoadingMore((current) => ({ ...current, [key]: false }));
    }
  };
  return { pages, loadMore, loadingMore, errors };
}

function MoreButton({ onClick, busy, error }: MoreButtonProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="rounded border border-white/15 px-3 py-1.5 font-mono text-xs text-white/70 hover:border-white/30 hover:text-white disabled:opacity-50"
      >
        {busy ? 'Loading…' : error ? 'Try again' : 'Show more'}
      </button>
      {error && (
        <span role="alert" className="text-xs text-rose-300">
          {error}
        </span>
      )}
    </div>
  );
}

const RECORD_SECTIONS = new Set(['profile', 'knowledge', ...PAGED_SECTIONS]);

/** Scroll to a linked section (#profile, #knowledge) once the record has loaded. */
function useSectionAnchor(ready: boolean) {
  const { hash } = useLocation();
  useEffect(() => {
    const id = hash.slice(1);
    if (!ready || !RECORD_SECTIONS.has(id)) return;
    document.getElementById(id)?.scrollIntoView();
  }, [ready, hash]);
}

function Overview() {
  const { data, loading, error, signedIn } = useRecord('overview');
  const { pages, loadMore, loadingMore, errors } = usePagedSections(data);
  useSectionAnchor(Boolean(data));
  const pageOf = (key: PagedSection) => pagedOf(pages, data, key);
  const countOf = (key: PagedSection) => {
    const page = pageOf(key);
    return `${page?.items?.length ?? 0}${page?.nextCursor ? '+' : ''}`;
  };
  const view: Json | null = data
    ? {
        ...data,
        knowledge: { ...data.knowledge, items: pageOf('knowledge')?.items ?? [] },
        ...Object.fromEntries(
          PAGED_SECTIONS.filter((key) => key !== 'knowledge').flatMap((key) => [
            [key, pageOf(key)?.items ?? []],
            [`${key}Count`, countOf(key)],
          ])
        ),
      }
    : null;
  const more = (key: PagedSection) =>
    pageOf(key)?.nextCursor ? (
      <MoreButton
        onClick={() => void loadMore(key)}
        busy={loadingMore[key] === true}
        error={errors[key]}
      />
    ) : undefined;
  const footers = Object.fromEntries(PAGED_SECTIONS.map((key) => [key, more(key)]));
  return (
    <Shell eyebrow="Learning record" title={OVERVIEW_TITLE}>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55">
        Your assistant records courses, sessions, reading and assessment evidence here over MCP.
        Levels change only with assessed evidence; untouched subjects are unassessed, not beginner.
      </p>
      <Status loading={loading} error={error} signedIn={signedIn} />
      {view && (
        <>
          <nav className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-white/50">
            {['profile', 'knowledge', 'courses', 'sessions', 'resources', 'gaps'].map((anchor) => (
              <a key={anchor} href={'#' + anchor} className="hover:text-white">
                {anchor}
              </a>
            ))}
          </nav>
          <ProfileSection data={view} />
          <KnowledgeSection data={view} more={footers.knowledge} />
          <CoursesSection data={view} more={footers.courses} />
          <Section
            id="sessions"
            title="Sessions"
            count={view.sessionsCount}
            footer={footers.sessions}
          >
            {view.sessions.length ? (
              <SessionList sessions={view.sessions} />
            ) : (
              <Empty>No sessions recorded yet.</Empty>
            )}
          </Section>
          <ResourcesSection data={view} more={footers.resources} />
          <GapsSection data={view} more={footers.gaps} />
        </>
      )}
    </Shell>
  );
}

function GapDetail({ id }: { id: string }) {
  const { data, loading, error, signedIn } = useRecord('gap', id);
  const gap = data?.gap;
  return (
    <Shell back eyebrow="Curriculum gap" title={gap?.topic ?? 'Curriculum gap'}>
      <Status loading={loading} error={error} signedIn={signedIn} />
      {gap && (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Pill>{gap.gapKind}</Pill>
            <Pill tone={gap.status === 'resolved' ? 'emerald' : 'amber'}>{gap.status}</Pill>
            {gap.prUrl && (
              <a href={gap.prUrl} className="font-mono text-xs text-sky-300 hover:underline">
                Pull request
              </a>
            )}
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-white/70">{gap.description}</p>
          <List title="Learning objectives" items={gap.learningObjectives} />
          <List title="Evidence" items={gap.evidence} />
          <List
            title="Related concepts"
            items={[...gap.prerequisiteConceptIds, ...gap.relatedConceptIds]}
          />
        </>
      )}
    </Shell>
  );
}

function CourseDetail({ id }: { id: string }) {
  const { data, loading, error, signedIn } = useRecord('course', id);
  const course = data?.course;
  return (
    <Shell back eyebrow="Course" title={course?.title ?? 'Course'}>
      <Status loading={loading} error={error} signedIn={signedIn} />
      {course && (
        <>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/60">{course.objective}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {course.isPrimary && <Pill tone="sky">primary</Pill>}
            <Pill>{course.status}</Pill>
            {course.targetLevel && <Pill>target {course.targetLevel}</Pill>}
            <Pill tone="emerald">{course.progress.evidence.atOrAboveTarget} at target</Pill>
            <Pill tone="muted">{course.progress.evidence.unassessed} unassessed</Pill>
          </div>
          <Section id="lessons" title="Lessons" count={course.lessons.length}>
            <ol className="space-y-4">
              {course.lessons.map((lesson: Json, index: number) => (
                <li key={lesson.id} className="border-l border-white/10 pl-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <span className="text-white">
                      <span className="mr-2 font-mono text-xs text-white/35">{index + 1}</span>
                      {lesson.title}
                      {course.nextLessonId === lesson.id && (
                        <span className="ml-2">
                          <Pill tone="sky">next</Pill>
                        </span>
                      )}
                    </span>
                    <Pill tone={lesson.status === 'completed' ? 'emerald' : 'muted'}>
                      {lesson.status}
                    </Pill>
                  </div>
                  {lesson.objective && (
                    <p className="mt-1 text-xs leading-5 text-white/50">{lesson.objective}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {lesson.concepts.map((concept: Json) => (
                      <a
                        key={concept.id}
                        href={concept.url}
                        className="text-xs text-white/65 hover:text-white"
                      >
                        {concept.name}{' '}
                        <span className="text-white/35">· {concept.knowledge.level}</span>
                      </a>
                    ))}
                    {lesson.topics.map((topic: string) => (
                      <span key={topic} className="text-xs text-white/45">
                        {topic} <span className="text-white/30">· topic</span>
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          </Section>
          <List title="Supplemental objectives" items={course.supplementalObjectives} />
          <Section id="sessions" title="Recent sessions" count={course.recentSessions.length}>
            {course.recentSessions.length ? (
              <SessionList sessions={course.recentSessions} />
            ) : (
              <Empty>No sessions yet.</Empty>
            )}
          </Section>
        </>
      )}
    </Shell>
  );
}

function SessionDetail({ id }: { id: string }) {
  const { data, loading, error, signedIn } = useRecord('session', id);
  const session = data?.session;
  return (
    <Shell back eyebrow="Session" title={session?.title ?? 'Session'}>
      <Status loading={loading} error={error} signedIn={signedIn} />
      {session && (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Pill>{session.kind}</Pill>
            <Pill tone={session.status === 'completed' ? 'emerald' : 'sky'}>{session.status}</Pill>
            <span className="font-mono text-xs text-white/45">
              {formatDate(session.startedAt)}
              {session.durationMinutes ? ` · ${session.durationMinutes} min` : ''}
            </span>
            {session.course && (
              <Link
                to={recordHref('courses', session.course.id)}
                className="font-mono text-xs text-sky-300 hover:underline"
              >
                {session.course.title}
                {session.lesson ? ` · ${session.lesson.title}` : ''}
              </Link>
            )}
          </div>
          {session.summary && (
            <p className="mt-5 max-w-2xl text-sm leading-6 text-white/70">{session.summary}</p>
          )}
          {session.resources.length > 0 && (
            <div className="mt-6">
              <Label>Resources</Label>
              <ul className="mt-2 space-y-1.5 text-sm">
                {session.resources.map((resource: Json) => (
                  <li key={resource.id}>
                    <a
                      href={resource.url}
                      className="inline-flex items-center gap-1.5 text-white/80 hover:text-white"
                    >
                      {resource.title} <ExternalLink className="h-3 w-3" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <List title="Objectives" items={session.objectives} />
          <List
            title="Topics"
            items={[...session.concepts.map((concept: Json) => concept.name), ...session.topics]}
          />
          <List title="Questions" items={session.questions} />
          <List title="Insights" items={session.insights} />
          <List title="Misconceptions" items={session.misconceptions} />
          <List title="Unresolved questions" items={session.unresolvedQuestions} />
          <List
            title="Exercises"
            items={session.exercises.map(
              (exercise: Json) =>
                `${exercise.description}${exercise.result ? ` — ${exercise.result}` : ''}`
            )}
          />
          <List title="Next steps" items={session.nextSteps} />
          {session.assessments.length > 0 && (
            <Section id="assessments" title="Assessments" count={session.assessments.length}>
              <ul className="space-y-4">
                {session.assessments.map((assessment: Json) => (
                  <li key={assessment.id} className="border-l border-white/10 pl-4 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-white">
                        {assessment.subject.label ?? assessment.subject.key}
                      </span>
                      <Pill>{assessment.method}</Pill>
                      <Pill tone={CATEGORY_TONE[assessment.outcome] ?? 'muted'}>
                        {assessment.outcome}
                      </Pill>
                      <span className="font-mono text-xs text-white/45">
                        {assessment.demonstratedLevel}
                      </span>
                    </div>
                    {assessment.question && (
                      <p className="mt-2 text-white/60">Q: {assessment.question}</p>
                    )}
                    <p className="mt-1 text-white/75">{assessment.evaluation}</p>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </>
      )}
    </Shell>
  );
}

function ResourceDetail({ id }: { id: string }) {
  const { data, loading, error, signedIn } = useRecord('resource', id);
  const resource = data?.resource;
  return (
    <Shell back eyebrow="Reading" title={resource?.title ?? 'Resource'}>
      <Status loading={loading} error={error} signedIn={signedIn} />
      {resource && (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Pill>{resource.kind}</Pill>
            <Pill>{resource.status}</Pill>
            <a
              href={resource.url}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-sky-300 hover:underline"
            >
              Open source <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
          </div>
          {resource.summary && (
            <p className="mt-5 max-w-2xl text-sm leading-6 text-white/70">{resource.summary}</p>
          )}
          <List title="Topics" items={[...resource.conceptIds, ...resource.topics]} />
          <Section id="sessions" title="Discussions" count={data.sessions.length}>
            {data.sessions.length ? (
              <SessionList sessions={data.sessions} />
            ) : (
              <Empty>Not discussed yet.</Empty>
            )}
          </Section>
        </>
      )}
    </Shell>
  );
}

export default function LearningRecord() {
  const { kind, id } = useParams();
  if (kind === 'courses' && id) return <CourseDetail id={id} />;
  if (kind === 'sessions' && id) return <SessionDetail id={id} />;
  if (kind === 'resources' && id) return <ResourceDetail id={id} />;
  if (kind === 'gaps' && id) return <GapDetail id={id} />;
  return <Overview />;
}
