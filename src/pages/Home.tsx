import publicCopy from '../data/public-copy/home.json';
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
  if (user || hasLearnerProgress()) return <Navigate to={publicCopy.links[0]} replace />;
  return <Landing />;
}

const { counts } = curriculumSummary;

const START = '/learn';

const LOOP = publicCopy.loop;

function Eyebrow({ children, accent = false }: { children: ReactNode; accent?: boolean }) {
  return (
    <p
      className={`font-mono text-[11px] font-medium uppercase tracking-[0.16em] ${
        accent ? 'text-sky-300/85' : 'text-white/55'
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
    <p className="mt-3 text-center font-mono text-[10px] tracking-[0.08em] text-white/55">
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
          <title id="loop-visual-title">{publicCopy.blocks.LoopVisual[0]}</title>
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
            <span className="font-mono text-[9px] tracking-[0.14em] text-white/55">
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
          <p className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-white/55 sm:text-[9.5px]">
            {publicCopy.blocks.LoopVisual[1]}
          </p>
          <p className="mt-1.5 text-[15px] font-semibold leading-tight tracking-tight text-white sm:text-lg">
            {publicCopy.blocks.LoopVisual[2]}
          </p>
          <div className="mt-2.5 flex gap-1" aria-hidden="true">
            <span className="h-1 flex-1 rounded-full bg-sky-400" />
            <span className="h-1 flex-1 rounded-full bg-sky-400" />
            <span className="h-1 flex-1 rounded-full bg-sky-400/60" />
            <span className="h-1 flex-1 rounded-full bg-white/15" />
          </div>
          <p className="mt-2 text-[10px] leading-snug text-white/50 sm:text-[11px]">
            {publicCopy.blocks.LoopVisual[3]}
          </p>
        </div>
      </div>
      <Illustrative>{publicCopy.blocks.LoopVisual[4]}</Illustrative>
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
          <span className="ml-2 truncate font-mono text-[10px] tracking-[0.08em] text-white/55">
            {label}
          </span>
        </div>
        <div className="p-5">{children}</div>
      </div>
      <Illustrative>{publicCopy.blocks.Panel[0]}</Illustrative>
    </figure>
  );
}

function LearnPanel() {
  const rows = publicCopy.learnRows;
  return (
    <Panel label="learn / tokenization">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-sky-300/80">
        {publicCopy.blocks.LearnPanel[0]}
      </p>
      <p className="mt-1.5 text-xl font-semibold tracking-tight text-white">
        {publicCopy.blocks.LearnPanel[1]}
      </p>
      <p className="mt-1 text-[13px] leading-5 text-white/55">{publicCopy.blocks.LearnPanel[2]}</p>
      <dl className="mt-4 divide-y divide-white/[0.06] border-t border-white/[0.06]">
        {rows.map(([term, detail]) => (
          <div
            key={term}
            className="grid grid-cols-[6.5rem_1fr] gap-3 py-2.5 text-[12px] leading-5"
          >
            <dt className="font-mono text-[10.5px] text-white/55">{term}</dt>
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
      <p className="text-[13px] font-semibold text-white">{publicCopy.blocks.PractisePanel[0]}</p>
      <p className="mt-1 text-[12px] leading-5 text-white/50">
        {publicCopy.blocks.PractisePanel[1]}
      </p>
      <pre className="mt-4 overflow-x-auto rounded-lg border border-white/[0.06] bg-black p-3.5 text-[11.5px] leading-[1.65] text-white/75">
        <code>
          <span className="text-sky-300">{publicCopy.blocks.PractisePanel[2]}</span>
          {publicCopy.blocks.PractisePanel[3]}
          {'{'}
          {'\n'}
          {'  '}
          <span className="text-sky-300">{publicCopy.blocks.PractisePanel[4]}</span>
          {publicCopy.blocks.PractisePanel[5]}
          {'\n'}
          {'    '}
          {publicCopy.blocks.PractisePanel[6]}
          <span className="text-amber-200/80">{publicCopy.blocks.PractisePanel[7]}</span>
          {publicCopy.blocks.PractisePanel[8]}
          {'\n'}
          {'    '}
          {publicCopy.blocks.PractisePanel[9]}
          {'\n'}
          {'    '}
          {publicCopy.blocks.PractisePanel[10]}
          {'\n'}
          {'    '}
          {publicCopy.blocks.PractisePanel[11]}
          {'\n'}
          {'}'}
        </code>
      </pre>
      <div className="mt-3 flex items-center gap-2 font-mono text-[11px] text-emerald-300/85">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        {publicCopy.blocks.PractisePanel[12]}
      </div>
    </Panel>
  );
}

function ExplainPanel() {
  return (
    <Panel label="explain / feynman gate">
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/55">
          {publicCopy.blocks.ExplainPanel[0]}
        </p>
        <p className="mt-1.5 text-[13px] leading-5 text-white/80">
          {publicCopy.blocks.ExplainPanel[1]}
        </p>
      </div>
      <div className="mt-3 rounded-xl border border-sky-400/25 bg-sky-400/[0.04] p-3.5">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-sky-300/80">
          {publicCopy.blocks.ExplainPanel[2]}
        </p>
        <p className="mt-1.5 text-[13px] leading-5 text-white/75">
          {publicCopy.blocks.ExplainPanel[3]}
        </p>
        <p className="mt-3 text-[11px] text-white/55">{publicCopy.blocks.ExplainPanel[4]}</p>
      </div>
    </Panel>
  );
}

function ReviewPanel() {
  const queue = publicCopy.reviewQueue;
  return (
    <Panel label="review / fsrs queue">
      <ul className="divide-y divide-white/[0.06]">
        {queue.map((item) => (
          <li key={item.name} className="flex items-center justify-between gap-3 py-2.5">
            <span className="text-[13px] text-white/85">{item.name}</span>
            <span
              className={`font-mono text-[11px] ${item.due ? 'text-sky-300' : 'text-white/55'}`}
            >
              {item.when}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[12px] leading-5 text-white/55">{publicCopy.blocks.ReviewPanel[0]}</p>
      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {publicCopy.ratings.map((rating) => (
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

const formatPublicCopy = (text: string) =>
  text.replace(/\{\{counts\.(\w+)\}\}/g, (_, key: string) =>
    String(counts[key as keyof typeof counts])
  );

const FEATURES = [
  {
    eyebrow: publicCopy.features[0].eyebrow,
    title: (
      <>
        {publicCopy.blocks.featureTitle0[0]}
        <br />
        {publicCopy.blocks.featureTitle0[1]}
      </>
    ),
    body: formatPublicCopy(publicCopy.features[0].body),
    visual: <LearnPanel />,
  },
  {
    eyebrow: publicCopy.features[1].eyebrow,
    title: (
      <>
        {publicCopy.blocks.featureTitle1[0]}
        <br />
        {publicCopy.blocks.featureTitle1[1]}
      </>
    ),
    body: formatPublicCopy(publicCopy.features[1].body),
    visual: <PractisePanel />,
  },
  {
    eyebrow: publicCopy.features[2].eyebrow,
    title: (
      <>
        {publicCopy.blocks.featureTitle2[0]}
        <br />
        {publicCopy.blocks.featureTitle2[1]}
      </>
    ),
    body: formatPublicCopy(publicCopy.features[2].body),
    visual: <ExplainPanel />,
  },
  {
    eyebrow: publicCopy.features[3].eyebrow,
    title: (
      <>
        {publicCopy.blocks.featureTitle3[0]}
        <br />
        {publicCopy.blocks.featureTitle3[1]}
      </>
    ),
    body: formatPublicCopy(publicCopy.features[3].body),
    visual: <ReviewPanel />,
  },
];

const ANSWERS = publicCopy.answers;

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="relative" aria-labelledby="home-hero">
      <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-5 pb-16 pt-14 sm:px-8 md:pt-20 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-14 lg:pb-24 lg:pt-24">
        <div>
          <Eyebrow accent>{publicCopy.blocks.Hero[0]}</Eyebrow>
          <Display
            as="h1"
            id="home-hero"
            className="mt-6 text-[clamp(2.6rem,4.3vw,3.45rem)] lg:text-wrap"
          >
            {publicCopy.blocks.Hero[1]}
            <br className="hidden lg:block" />
            {publicCopy.blocks.Hero[2]}
            <br className="hidden lg:block" />
            {publicCopy.blocks.Hero[3]}
            <span className="text-sky-300">{publicCopy.blocks.Hero[4]}</span>
          </Display>
          <p className="mt-7 max-w-[34rem] text-[17px] leading-[1.65] text-white/60">
            {publicCopy.blocks.Hero[5]}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            <PrimaryCta>{publicCopy.blocks.Hero[6]}</PrimaryCta>
            <a
              href={publicCopy.links[1]}
              className="inline-flex min-h-11 items-center gap-1 text-sm text-white/55 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white hover:decoration-white/50"
            >
              {publicCopy.blocks.Hero[7]}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
          <p className="mt-5 font-mono text-[11px] tracking-[0.04em] text-white/55">
            {publicCopy.blocks.Hero[8]}
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
              <p className="font-mono text-[11px] text-white/55">
                {item.step} <span className="ml-1 text-white/80">{item.label}</span>
              </p>
              <p className="mt-2 text-[13px] leading-5 text-white/50">{item.line}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Statement() {
  return (
    <section className="border-b border-white/[0.07] bg-[#050505]">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-24 sm:px-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-20 lg:py-32">
        <Display className="text-[clamp(2.2rem,4.6vw,3.9rem)]">
          {publicCopy.blocks.Statement[0]}
        </Display>
        <div className="lg:pt-3">
          <p className="text-lg font-semibold tracking-tight text-white">
            {publicCopy.blocks.Statement[1]}
          </p>
          <p className="mt-3 text-[15px] leading-7 text-white/55">
            {publicCopy.blocks.Statement[2]}
          </p>
        </div>
      </div>
    </section>
  );
}

function LoopIntro() {
  return (
    <section className="border-b border-white/[0.07]" aria-labelledby="home-loop">
      <div className="mx-auto grid max-w-[1200px] gap-6 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:items-end lg:gap-20 lg:py-20">
        <div>
          <Eyebrow>{publicCopy.blocks.LoopIntro[0]}</Eyebrow>
          <Display id="home-loop" className="mt-4 text-[clamp(2.2rem,5vw,4rem)]">
            {publicCopy.blocks.LoopIntro[1]}
          </Display>
        </div>
        <p className="max-w-md text-[15px] leading-7 text-white/55">
          {publicCopy.blocks.LoopIntro[2]}
        </p>
      </div>
    </section>
  );
}

function Features() {
  return (
    <>
      {FEATURES.map((feature, index) => (
        <section key={feature.eyebrow} className="border-b border-white/[0.07]">
          <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:py-28">
            <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
              <Eyebrow accent>
                {publicCopy.blocks.Features[0]}
                {index + 1}
                {publicCopy.blocks.Features[1]}
                {feature.eyebrow}
              </Eyebrow>
              <Display className="mt-4 text-[clamp(2.1rem,4.4vw,3.6rem)]">{feature.title}</Display>
              <p className="mt-6 max-w-md text-[15px] leading-7 text-white/55">{feature.body}</p>
            </div>
            <div className={index % 2 === 1 ? 'lg:order-1' : ''}>{feature.visual}</div>
          </div>
        </section>
      ))}
    </>
  );
}

function Coverage() {
  return (
    <section className="border-b border-white/[0.07] bg-[#050505]" aria-labelledby="home-tracks">
      <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end lg:gap-20">
          <div>
            <Eyebrow>{publicCopy.blocks.Coverage[0]}</Eyebrow>
            <Display id="home-tracks" className="mt-4 text-[clamp(2.1rem,4.4vw,3.6rem)]">
              {counts.tracks}
              {publicCopy.blocks.Coverage[1]}
            </Display>
          </div>
          <p className="max-w-md text-[15px] leading-7 text-white/55">
            {publicCopy.blocks.Coverage[2]}
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
  );
}

function Fit() {
  return (
    <section className="border-b border-white/[0.07]">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:py-28">
        <div>
          <Eyebrow>{publicCopy.blocks.Fit[0]}</Eyebrow>
          <Display className="mt-4 text-[clamp(2.1rem,4.4vw,3.6rem)]">
            {publicCopy.blocks.Fit[1]}
          </Display>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
          <div>
            <p className="text-[15px] font-semibold text-white">{publicCopy.blocks.Fit[2]}</p>
            <p className="mt-2 text-[15px] leading-7 text-white/55">{publicCopy.blocks.Fit[3]}</p>
          </div>
          <div>
            <p className="text-[15px] font-semibold text-white">{publicCopy.blocks.Fit[4]}</p>
            <p className="mt-2 text-[15px] leading-7 text-white/55">{publicCopy.blocks.Fit[5]}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Answers() {
  return (
    <section className="border-b border-white/[0.07]" aria-labelledby="home-answers">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20 lg:py-28">
        <Display id="home-answers" className="text-[clamp(2.1rem,4.4vw,3.6rem)]">
          {publicCopy.blocks.Answers[0]}
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
                  {publicCopy.blocks.Answers[1]}
                </span>
              </summary>
              <p className="max-w-xl pb-5 text-[14px] leading-6 text-white/55">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Close() {
  return (
    <section>
      <div className="mx-auto flex max-w-[1200px] flex-col items-start gap-8 px-5 py-24 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:py-32">
        <div>
          <Eyebrow accent>{publicCopy.blocks.Close[0]}</Eyebrow>
          <Display className="mt-4 max-w-3xl text-[clamp(2.2rem,5vw,4.2rem)]">
            {publicCopy.blocks.Close[1]}
          </Display>
        </div>
        <PrimaryCta>{publicCopy.blocks.Close[2]}</PrimaryCta>
      </div>
    </section>
  );
}

function Landing() {
  // `/` keeps the pre-React shell up until its real destination commits.
  useEffect(() => {
    removeLcpShell();
    document.title = 'SWE Interview Prep — Build understanding you can demonstrate';
  }, []);

  return (
    <div className="overflow-x-clip">
      <Hero />
      <Statement />
      <LoopIntro />
      <Features />
      <Coverage />
      <Fit />
      <Answers />
      <Close />
    </div>
  );
}
