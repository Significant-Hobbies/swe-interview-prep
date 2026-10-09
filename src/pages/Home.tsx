import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { Link, Navigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import curriculumSummary from '../data/public-curriculum-summary.json';
import { hasLearnerProgress } from '../lib/learnerState';
import { removeLcpShell } from '../lib/lcpShell';

/**
 * `/` — the front door.
 *
 * Returning learners (signed in, or with progress in this browser) go
 * straight to the dashboard, exactly as before. Everyone else gets a real
 * landing: what this is, the loop it runs, and one way in.
 */
export default function Home() {
  const { user } = useAuth();
  if (user || hasLearnerProgress()) return <Navigate to="/dashboard" replace />;
  return <Landing />;
}

const { counts } = curriculumSummary;

const START = '/dashboard';

const LOOP = [
  {
    step: '01',
    label: 'Learn',
    line: 'A mental model, a primary source, and the prerequisites.',
  },
  {
    step: '02',
    label: 'Practise',
    line: 'Code or a diagram in a real workspace, run against tests.',
  },
  {
    step: '03',
    label: 'Explain',
    line: 'Say it back in your own words. The AI asks; it never answers.',
  },
  {
    step: '04',
    label: 'Review',
    line: 'FSRS brings it back right before you would have forgotten it.',
  },
] as const;

function Eyebrow({ children, accent = false }: { children: ReactNode; accent?: boolean }) {
  return (
    <p
      className={`font-mono text-[11px] font-medium uppercase tracking-[0.16em] ${
        accent ? 'text-sky-300/85' : 'text-white/45'
      }`}
    >
      {children}
    </p>
  );
}

function Display({
  as: Tag = 'h2',
  id,
  children,
  className = '',
}: {
  as?: 'h1' | 'h2';
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Tag
      id={id}
      className={`text-balance font-bold leading-[0.98] tracking-[-0.045em] text-white ${className}`}
    >
      {children}
    </Tag>
  );
}

function PrimaryCta({ children }: { children: ReactNode }) {
  return (
    <Link
      to={START}
      className="group inline-flex h-12 items-center gap-2 rounded-full bg-[#ededed] px-6 text-sm font-semibold text-black transition-colors duration-150 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
    </Link>
  );
}

function Illustrative({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 text-center font-mono text-[10px] tracking-[0.08em] text-white/35">
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* The loop visual                                                     */
/* ------------------------------------------------------------------ */

// Node positions on a 400×400 board, clockwise from the top.
const RING = { cx: 200, cy: 200, r: 138 };
const NODES = [
  { x: 200, y: 62, pill: 'left-1/2 top-[15.5%] -translate-x-1/2 -translate-y-1/2' },
  { x: 338, y: 200, pill: 'left-[84.5%] top-1/2 -translate-x-1/2 -translate-y-1/2' },
  { x: 200, y: 338, pill: 'left-1/2 top-[84.5%] -translate-x-1/2 -translate-y-1/2' },
  { x: 62, y: 200, pill: 'left-[15.5%] top-1/2 -translate-x-1/2 -translate-y-1/2' },
] as const;

/** Quarter arc from node i to node i+1, trimmed so the arrow clears the pills. */
function arcPath(index: number) {
  const trim = 0.42; // radians kept clear at each end
  const start = -Math.PI / 2 + index * (Math.PI / 2) + trim;
  const end = -Math.PI / 2 + (index + 1) * (Math.PI / 2) - trim;
  const p = (a: number) =>
    `${(RING.cx + RING.r * Math.cos(a)).toFixed(1)} ${(RING.cy + RING.r * Math.sin(a)).toFixed(1)}`;
  return `M ${p(start)} A ${RING.r} ${RING.r} 0 0 1 ${p(end)}`;
}

function LoopVisual() {
  return (
    <figure className="relative mx-auto w-full max-w-[520px]">
      <div className="relative aspect-square w-full overflow-hidden rounded-[28px] border border-white/[0.08] bg-[radial-gradient(circle_at_50%_45%,rgba(14,165,233,0.10),transparent_62%)]">
        <div className="dot-grid absolute inset-0 opacity-60" aria-hidden="true" />
        <svg
          viewBox="0 0 400 400"
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-labelledby="loop-visual-title"
        >
          <title id="loop-visual-title">
            The learning loop: learn, practise, explain, then FSRS review, which feeds back into
            learning.
          </title>
          <defs>
            <marker
              id="loop-arrow"
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9" fill="none" stroke="#38bdf8" strokeWidth="1.6" />
            </marker>
          </defs>
          <circle
            cx={RING.cx}
            cy={RING.cy}
            r={RING.r + 26}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="2 6"
          />
          <circle
            cx={RING.cx}
            cy={RING.cy}
            r={RING.r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
          />
          {NODES.map((_, index) => (
            <path
              key={index}
              d={arcPath(index)}
              fill="none"
              stroke={index === 3 ? '#38bdf8' : 'rgba(56,189,248,0.55)'}
              strokeWidth={index === 3 ? 1.8 : 1.4}
              markerEnd="url(#loop-arrow)"
            />
          ))}
        </svg>

        {LOOP.map((item, index) => (
          <div
            key={item.label}
            className={`absolute ${NODES[index].pill} flex flex-col items-center rounded-xl border px-3 py-1.5 text-center shadow-[0_10px_30px_rgba(0,0,0,0.6)] ${
              index === 3 ? 'border-sky-400/40 bg-[#04121b]' : 'border-white/[0.12] bg-[#0b0b0b]'
            }`}
          >
            <span className="font-mono text-[9px] tracking-[0.14em] text-white/40">
              {item.step}
            </span>
            <span
              className={`text-[13px] font-semibold tracking-tight sm:text-sm ${
                index === 3 ? 'text-sky-200' : 'text-white'
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}

        {/* The concept travelling through the loop. */}
        <div className="absolute left-1/2 top-1/2 w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/[0.12] bg-black/80 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-sm sm:p-4">
          <p className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-white/40 sm:text-[9.5px]">
            Search &amp; IR · concept
          </p>
          <p className="mt-1.5 text-[15px] font-semibold leading-tight tracking-tight text-white sm:text-lg">
            Tokenization
          </p>
          <div className="mt-2.5 flex gap-1" aria-hidden="true">
            <span className="h-1 flex-1 rounded-full bg-sky-400" />
            <span className="h-1 flex-1 rounded-full bg-sky-400" />
            <span className="h-1 flex-1 rounded-full bg-sky-400/60" />
            <span className="h-1 flex-1 rounded-full bg-white/15" />
          </div>
          <p className="mt-2 text-[10px] leading-snug text-white/50 sm:text-[11px]">
            Explained back. Next review set by FSRS.
          </p>
        </div>
      </div>
      <Illustrative>Illustrative · one concept moving through the loop</Illustrative>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Section panels (illustrative product moments)                      */
/* ------------------------------------------------------------------ */

function Panel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <figure className="mx-auto w-full max-w-[460px]">
      <div className="overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0a0a0a] shadow-[0_30px_80px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.02)]">
        <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-2.5">
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="ml-2 truncate font-mono text-[10px] tracking-[0.08em] text-white/40">
            {label}
          </span>
        </div>
        <div className="p-5">{children}</div>
      </div>
      <Illustrative>Illustrative · simplified from the app</Illustrative>
    </figure>
  );
}

function LearnPanel() {
  const rows = [
    ['Mental model', 'The same analyzer must run at index time and query time.'],
    ['Primary source', 'Introduction to Information Retrieval, §2.2.1'],
    ['Related', 'Inverted index · BM25'],
  ];
  return (
    <Panel label="learn / tokenization">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-sky-300/80">Concept</p>
      <p className="mt-1.5 text-xl font-semibold tracking-tight text-white">Tokenization</p>
      <p className="mt-1 text-[13px] leading-5 text-white/55">
        Splitting text into terms: lowercasing, stemming, stop words, n-grams.
      </p>
      <dl className="mt-4 divide-y divide-white/[0.06] border-t border-white/[0.06]">
        {rows.map(([term, detail]) => (
          <div
            key={term}
            className="grid grid-cols-[6.5rem_1fr] gap-3 py-2.5 text-[12px] leading-5"
          >
            <dt className="font-mono text-[10.5px] text-white/40">{term}</dt>
            <dd className="text-white/70">{detail}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

function PractisePanel() {
  return (
    <Panel label="practice / build-tokenizer.js">
      <p className="text-[13px] font-semibold text-white">Build a search tokenizer</p>
      <p className="mt-1 text-[12px] leading-5 text-white/50">
        Lowercase, split on non-alphanumerics, drop stop words, stem. Same function at index and
        query time.
      </p>
      <pre className="mt-4 overflow-x-auto rounded-lg border border-white/[0.06] bg-black p-3.5 text-[11.5px] leading-[1.65] text-white/75">
        <code>
          <span className="text-sky-300">function</span> tokenize(s) {'{'}
          {'\n'}
          {'  '}
          <span className="text-sky-300">return</span> s.toLowerCase()
          {'\n'}
          {'    '}.split(<span className="text-amber-200/80">/[^a-z0-9]+/</span>){'\n'}
          {'    '}.filter(Boolean)
          {'\n'}
          {'    '}.filter(t =&gt; !STOPS.has(t))
          {'\n'}
          {'    '}.map(stem);
          {'\n'}
          {'}'}
        </code>
      </pre>
      <div className="mt-3 flex items-center gap-2 font-mono text-[11px] text-emerald-300/85">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        tokenize('The Quick Brown Foxes!') → ["quick","brown","fox"]
      </div>
    </Panel>
  );
}

function ExplainPanel() {
  return (
    <Panel label="explain / feynman gate">
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
          Socratic companion
        </p>
        <p className="mt-1.5 text-[13px] leading-5 text-white/80">
          If a document says “Foxes” and the query says “fox”, where in your pipeline do they become
          the same term?
        </p>
      </div>
      <div className="mt-3 rounded-xl border border-sky-400/25 bg-sky-400/[0.04] p-3.5">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-sky-300/80">
          Your explain-back
        </p>
        <p className="mt-1.5 text-[13px] leading-5 text-white/75">
          Both go through the same analyzer, so “foxes” stems to “fox” on both sides. The failure
          mode: stem too hard and “university” collides with “universe”.
        </p>
        <p className="mt-3 text-[11px] text-white/40">One example · one failure mode</p>
      </div>
    </Panel>
  );
}

function ReviewPanel() {
  const queue = [
    { name: 'Tokenization', when: 'Due today', due: true },
    { name: 'Inverted index', when: 'In 3 days', due: false },
    { name: 'BM25 scoring', when: 'In 9 days', due: false },
  ];
  return (
    <Panel label="review / fsrs queue">
      <ul className="divide-y divide-white/[0.06]">
        {queue.map((item) => (
          <li key={item.name} className="flex items-center justify-between gap-3 py-2.5">
            <span className="text-[13px] text-white/85">{item.name}</span>
            <span
              className={`font-mono text-[11px] ${item.due ? 'text-sky-300' : 'text-white/40'}`}
            >
              {item.when}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[12px] leading-5 text-white/55">
        Without looking: why must the tokenizer be identical at index and query time?
      </p>
      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {['Again', 'Hard', 'Good', 'Easy'].map((rating) => (
          <span
            key={rating}
            className={`rounded-md border py-1.5 text-center text-[11px] ${
              rating === 'Good'
                ? 'border-sky-400/40 bg-sky-400/10 text-sky-100'
                : 'border-white/[0.08] text-white/50'
            }`}
          >
            {rating}
          </span>
        ))}
      </div>
    </Panel>
  );
}

const FEATURES = [
  {
    eyebrow: 'Learn',
    title: (
      <>
        Start from
        <br />
        the mechanism.
      </>
    ),
    body: `${counts.concepts} concepts across ${counts.tracks} tracks, each with a short mental model, a primary source, and the prerequisites it rests on. ${counts.roadmaps} roadmaps order them, from a 9-day reset to a 12-month run.`,
    visual: <LearnPanel />,
  },
  {
    eyebrow: 'Practise',
    title: (
      <>
        Make it run,
        <br />
        or draw it.
      </>
    ),
    body: `${counts.drills} drills in a Monaco editor and an Excalidraw canvas. Code runs against tests; system designs become diagrams you can defend.`,
    visual: <PractisePanel />,
  },
  {
    eyebrow: 'Explain',
    title: (
      <>
        Say it back,
        <br />
        without the key.
      </>
    ),
    body: 'The Socratic companion only asks questions; it never hands over a solution. A Feynman explain-back gates the concept: one example, one failure mode, in your own words.',
    visual: <ExplainPanel />,
  },
  {
    eyebrow: 'Review',
    title: (
      <>
        Retrieve it
        <br />
        before it fades.
      </>
    ),
    body: `FSRS schedules the next retrieval from what you actually demonstrated, so strong concepts wait longer and shaky ones come back soon. ${counts.reviewQuestions} review questions keep it honest.`,
    visual: <ReviewPanel />,
  },
];

const ANSWERS = [
  {
    q: 'Do I need an account?',
    a: 'No. Every route works as a guest, and guest progress stays in this browser. Google sign-in only adds progress that follows you across devices.',
  },
  {
    q: 'Does it cost anything?',
    a: 'No. There is no paid tier, subscription, or checkout.',
  },
  {
    q: 'Will the AI just give me the answer?',
    a: 'No, by design. The companion probes your understanding with questions. Working it out is the point.',
  },
  {
    q: 'Is it actively developed?',
    a: 'It is a mature personal learning system, built for its author’s own preparation and now in maintenance-only mode. It is kept working, not chasing features.',
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function Landing() {
  // `/` keeps the pre-React shell up until its real destination commits.
  useEffect(() => {
    removeLcpShell();
    document.title = 'SWE Interview Prep — Build understanding you can demonstrate';
  }, []);

  return (
    <div className="overflow-x-clip">
      {/* Hero */}
      <section className="relative" aria-labelledby="home-hero">
        <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-5 pb-16 pt-14 sm:px-8 md:pt-20 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-14 lg:pb-24 lg:pt-24">
          <div>
            <Eyebrow accent>Personal SWE learning OS · Interview prep</Eyebrow>
            <Display
              as="h1"
              id="home-hero"
              className="mt-6 text-[clamp(2.6rem,4.3vw,3.45rem)] lg:text-wrap"
            >
              Prepare for interviews <br className="hidden lg:block" />
              by building understanding <br className="hidden lg:block" />
              you can <span className="text-sky-300">demonstrate.</span>
            </Display>
            <p className="mt-7 max-w-[34rem] text-[17px] leading-[1.65] text-white/60">
              Learn a mechanism, practise it in code or a diagram, explain it back in your own
              words, and let FSRS bring it back right before you would have forgotten it.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <PrimaryCta>Start learning</PrimaryCta>
              <a
                href="/curriculum/"
                className="inline-flex min-h-11 items-center gap-1 text-sm text-white/55 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white hover:decoration-white/50"
              >
                Browse the curriculum <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
            <p className="mt-5 font-mono text-[11px] tracking-[0.04em] text-white/35">
              Free · no account needed · progress stays in this browser
            </p>
          </div>
          <LoopVisual />
        </div>

        {/* The loop, in one line each */}
        <div className="border-y border-white/[0.07]">
          <ol className="mx-auto grid max-w-[1200px] grid-cols-1 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
            {LOOP.map((item, index) => (
              <li
                key={item.label}
                className={`py-6 sm:pr-6 ${index > 0 ? 'border-t border-white/[0.07] sm:border-t-0' : ''} ${
                  index >= 2 ? 'sm:border-t sm:border-white/[0.07] lg:border-t-0' : ''
                } lg:border-l lg:border-white/[0.07] lg:pl-6 lg:first:border-l-0 lg:first:pl-0`}
              >
                <p className="font-mono text-[11px] text-white/35">
                  {item.step} <span className="ml-1 text-white/80">{item.label}</span>
                </p>
                <p className="mt-2 text-[13px] leading-5 text-white/50">{item.line}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Statement */}
      <section className="border-b border-white/[0.07] bg-[#050505]">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-24 sm:px-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-20 lg:py-32">
          <Display className="text-[clamp(2.2rem,4.6vw,3.9rem)]">
            Reading about a mechanism is not the same as being able to explain it.
          </Display>
          <div className="lg:pt-3">
            <p className="text-lg font-semibold tracking-tight text-white">
              That gap is the interview.
            </p>
            <p className="mt-3 text-[15px] leading-7 text-white/55">
              Every concept here ends in something you made or said: running code, a diagram, a
              decision, an explanation. Mastery is what you demonstrated, not pages you read.
            </p>
          </div>
        </div>
      </section>

      {/* One loop */}
      <section className="border-b border-white/[0.07]" aria-labelledby="home-loop">
        <div className="mx-auto grid max-w-[1200px] gap-6 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:items-end lg:gap-20 lg:py-20">
          <div>
            <Eyebrow>One loop, every concept</Eyebrow>
            <Display id="home-loop" className="mt-4 text-[clamp(2.2rem,5vw,4rem)]">
              Learn. Practise. Explain. Review.
            </Display>
          </div>
          <p className="max-w-md text-[15px] leading-7 text-white/55">
            DSA, system design, backend, AI systems, and behavioural rounds share one mastery model
            instead of five separate tools.
          </p>
        </div>
      </section>

      {FEATURES.map((feature, index) => (
        <section key={feature.eyebrow} className="border-b border-white/[0.07]">
          <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:py-28">
            <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
              <Eyebrow accent>
                0{index + 1} · {feature.eyebrow}
              </Eyebrow>
              <Display className="mt-4 text-[clamp(2.1rem,4.4vw,3.6rem)]">{feature.title}</Display>
              <p className="mt-6 max-w-md text-[15px] leading-7 text-white/55">{feature.body}</p>
            </div>
            <div className={index % 2 === 1 ? 'lg:order-1' : ''}>{feature.visual}</div>
          </div>
        </section>
      ))}

      {/* Coverage */}
      <section className="border-b border-white/[0.07] bg-[#050505]" aria-labelledby="home-tracks">
        <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:py-28">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-end lg:gap-20">
            <div>
              <Eyebrow>What it covers</Eyebrow>
              <Display id="home-tracks" className="mt-4 text-[clamp(2.1rem,4.4vw,3.6rem)]">
                {counts.tracks} tracks. One mastery model.
              </Display>
            </div>
            <p className="max-w-md text-[15px] leading-7 text-white/55">
              From arrays and graphs to inference serving and agent systems, plus the interview
              round that is not about code.
            </p>
          </div>
          <ul className="mt-12 grid grid-cols-2 gap-x-5 border-t border-white/[0.07] sm:gap-x-10 lg:grid-cols-3">
            {curriculumSummary.tracks.map((track) => (
              <li key={track.id} className="border-b border-white/[0.07] py-4">
                <p className="text-[13px] font-medium leading-5 tracking-tight text-white/90 sm:text-[15px]">
                  {track.title}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Fit */}
      <section className="border-b border-white/[0.07]">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:py-28">
          <div>
            <Eyebrow>An honest fit</Eyebrow>
            <Display className="mt-4 text-[clamp(2.1rem,4.4vw,3.6rem)]">
              Interview prep that takes understanding seriously.
            </Display>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <p className="text-[15px] font-semibold text-white">A fit</p>
              <p className="mt-2 text-[15px] leading-7 text-white/55">
                Engineers who want to explain why a B-tree, a rate limiter, or a KV cache behaves
                the way it does, and still remember it in three weeks.
              </p>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-white">Not a fit</p>
              <p className="mt-2 text-[15px] leading-7 text-white/55">
                An answer bank to memorise the night before. Nothing here hands you a solution, and
                progress is earned, not clicked.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Answers */}
      <section className="border-b border-white/[0.07]" aria-labelledby="home-answers">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20 lg:py-28">
          <Display id="home-answers" className="text-[clamp(2.1rem,4.4vw,3.6rem)]">
            A few honest answers.
          </Display>
          <div className="border-t border-white/[0.08]">
            {ANSWERS.map((item) => (
              <details key={item.q} className="group border-b border-white/[0.08]">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-[15px] font-medium text-white/90 marker:hidden [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    aria-hidden="true"
                    className="text-lg leading-none text-white/40 transition-transform duration-150 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="max-w-xl pb-5 text-[14px] leading-6 text-white/55">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Close */}
      <section>
        <div className="mx-auto flex max-w-[1200px] flex-col items-start gap-8 px-5 py-24 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:py-32">
          <div>
            <Eyebrow accent>Start with one concept</Eyebrow>
            <Display className="mt-4 max-w-3xl text-[clamp(2.2rem,5vw,4.2rem)]">
              Pick one mechanism. Prove you understand it.
            </Display>
          </div>
          <PrimaryCta>Start learning</PrimaryCta>
        </div>
      </section>
    </div>
  );
}
