import { ArrowLeft, ExternalLink } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

// The learning record is written by external agents over MCP. This page is a
// read-only window onto it; learning never requires visiting it.

type Json = Record<string, any>;
const OVERVIEW_TITLE = 'What you know, and what\u2019s next.';
type View = 'overview' | 'course' | 'session' | 'resource';

function useRecord(view: View, id?: string) {
  const { user } = useAuth();
  const [state, setState] = useState<{ data: Json | null; error: string | null; loading: boolean }>(
    { data: null, error: null, loading: true }
  );
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
        const response = await fetch(`/api/learning-record?${params}`, {
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

function recordHref(kind: string, id: string) {
  return ['', 'record', kind, encodeURIComponent(id)].join('/');
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function Label({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
      {children}
    </span>
  );
}

function Section({
  id,
  title,
  count,
  children,
}: {
  id: string;
  title: string;
  count?: number;
  children: ReactNode;
}) {
  return (
    <section id={id} className="section-rule mt-12 scroll-mt-20 pt-8">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
        {count !== undefined && <span className="font-mono text-xs text-white/40">{count}</span>}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-white/45">{children}</p>;
}

function Pill({
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

const CATEGORY_TONE: Record<string, 'muted' | 'sky' | 'emerald' | 'amber' | 'rose'> = {
  'previously-known': 'emerald',
  'newly-learned': 'sky',
  'needs-depth': 'amber',
  'needs-revision': 'rose',
  'due-for-review': 'amber',
  unassessed: 'muted',
};

function List({ title, items }: { title: string; items?: string[] }) {
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

function Shell({
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

function Status({
  loading,
  error,
  signedIn,
}: {
  loading: boolean;
  error: string | null;
  signedIn: boolean;
}) {
  if (!signedIn) {
    return (
      <p className="mt-8 text-sm text-white/60">
        <Link to="/login" className="text-white underline underline-offset-4">
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

function ProfileSection({ data }: { data: Json }) {
  const profile = data.profile?.profile ?? {};
  return (
    <Section id="profile" title="Profile">
      {Object.keys(profile).length ? (
        <dl className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
          {profile.background && (
            <div className="sm:col-span-2">
              <dt>
                <Label>Background</Label>
              </dt>
              <dd className="mt-1 text-white/75">{profile.background}</dd>
            </div>
          )}
          {(
            [
              'interests',
              'disinterests',
              'careerObjectives',
              'priorities',
              'preferredMethods',
            ] as const
          ).map((key) =>
            profile[key]?.length ? (
              <div key={key}>
                <dt>
                  <Label>{key.replace(/([A-Z])/g, ' $1')}</Label>
                </dt>
                <dd className="mt-1 text-white/75">{profile[key].join(' · ')}</dd>
              </div>
            ) : null
          )}
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

function KnowledgeSection({ data }: { data: Json }) {
  return (
    <Section id="knowledge" title="Knowledge" count={data.knowledge.summary.recordedSubjects}>
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

function CoursesSection({ data }: { data: Json }) {
  return (
    <Section id="courses" title="Courses" count={data.courses.length}>
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

function ResourcesSection({ data }: { data: Json }) {
  const resources: Json[] = data.resources;
  return (
    <Section id="resources" title="Reading" count={resources.length}>
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

function GapsSection({ data }: { data: Json }) {
  return (
    <Section id="gaps" title="Curriculum gaps" count={data.gaps.length}>
      {data.gaps.length ? (
        <ul className="divide-y divide-white/5">
          {data.gaps.map((gap: Json) => (
            <li key={gap.id} id={'gap-' + gap.id} className="py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <span className="text-white">{gap.topic}</span>
                <span className="flex items-center gap-2">
                  <Pill>{gap.gapKind}</Pill>
                  <Pill tone={gap.status === 'resolved' ? 'emerald' : 'amber'}>{gap.status}</Pill>
                  {gap.prUrl && (
                    <a href={gap.prUrl} className="font-mono text-xs text-sky-300 hover:underline">
                      PR
                    </a>
                  )}
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

function Overview() {
  const { data, loading, error, signedIn } = useRecord('overview');
  return (
    <Shell eyebrow="Learning record" title={OVERVIEW_TITLE}>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55">
        Your assistant records courses, sessions, reading and assessment evidence here over MCP.
        Levels change only with assessed evidence; untouched subjects are unassessed, not beginner.
      </p>
      <Status loading={loading} error={error} signedIn={signedIn} />
      {data && (
        <>
          <nav className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-white/50">
            {['profile', 'knowledge', 'courses', 'sessions', 'resources', 'gaps'].map((anchor) => (
              <a key={anchor} href={`#${anchor}`} className="hover:text-white">
                {anchor}
              </a>
            ))}
          </nav>

          <ProfileSection data={data} />

          <KnowledgeSection data={data} />

          <CoursesSection data={data} />

          <Section id="sessions" title="Sessions" count={data.sessions.length}>
            {data.sessions.length ? (
              <SessionList sessions={data.sessions} />
            ) : (
              <Empty>No sessions recorded yet.</Empty>
            )}
          </Section>

          <ResourcesSection data={data} />

          <GapsSection data={data} />
        </>
      )}
    </Shell>
  );
}

function SessionList({ sessions }: { sessions: Json[] }) {
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
  return <Overview />;
}
