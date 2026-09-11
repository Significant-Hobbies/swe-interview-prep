import { ArrowRight, Clock3, Network, Swords, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader, PageShell } from '../components/ui';

const experiences = [
  {
    title: 'Scale',
    time: 'Persistent · saved on this device',
    to: '/play/scale',
    icon: Network,
    description:
      'Grow a tiny software company. Diagnose the bottleneck, try a change in the sandbox, and live with the tradeoff.',
    action: 'Open your company',
  },
  {
    title: 'Blitz',
    time: '1 minute',
    to: '/wars/blitz',
    icon: Zap,
    description: 'A short recall round. Find out what you can retrieve when the clock is running.',
    action: 'Play Blitz',
  },
  {
    title: 'Engineering Match',
    time: 'About 30 minutes',
    to: '/wars/tradeoff',
    icon: Swords,
    description:
      'Defend an engineering decision against constraints. Work through the tradeoffs and compare your reasoning.',
    action: 'Start a match',
  },
];

export default function Play() {
  return (
    <PageShell wide>
      <PageHeader
        eyebrow="Play"
        title="Put your judgment to work."
        subtitle="A company that keeps growing, a quick recall round, or a considered decision. Choose what to practise."
      />
      <div className="divide-y divide-white/10 border-y border-white/10">
        {experiences.map(({ title, time, to, icon: Icon, description, action }) => (
          <Link
            key={to}
            to={to}
            className="group grid gap-5 px-2 py-8 transition-colors hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 sm:grid-cols-[48px_1fr_auto] sm:items-center sm:px-5"
          >
            <Icon className="h-7 w-7 text-sky-300" aria-hidden="true" />
            <div>
              <span className="flex items-center gap-2 font-mono text-xs text-white/55">
                <Clock3 className="h-3 w-3" />
                {time}
              </span>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">{title}</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">{description}</p>
            </div>
            <span className="flex min-h-11 items-center gap-3 text-sm text-white/80">
              {action}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap justify-between gap-4 text-sm text-white/55">
        <Link className="inline-flex min-h-11 items-center gap-2 hover:text-white" to="/labs">
          Prefer a focused experiment? Systems Labs <ArrowRight className="h-4 w-4" />
        </Link>
        <Link className="inline-flex min-h-11 items-center hover:text-white" to="/wars">
          Match history & challenges
        </Link>
      </div>
    </PageShell>
  );
}
