import { CAMPAIGN_EVENTS, eventTerms } from './game/campaign';
import type { Command, View } from './game/runtime';

export function CampaignPanel({ view, send }: { view: View; send: (command: Command) => void }) {
  const p = view.company.campaign;
  if (!p || view.sandbox || p.phase === 'waiting' || p.phase === 'done') return null;
  const event = CAMPAIGN_EVENTS[p.stage];
  const terms = eventTerms(p.stage, p.approach);
  return (
    <section className="campaign-panel" aria-label="Campaign event">
      <div className="challenge-heading">
        <div>
          <span className="section-label">
            EVENT {p.stage + 1} / 2 ·{' '}
            {p.phase === 'offer' ? 'YOUR CALL' : p.phase === 'review' ? 'RESULT' : 'LIVE'}
          </span>
          <h2>{event.title}</h2>
        </div>
        <a
          href={`/curriculum/concepts/${event.lesson}.html`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Related lesson ↗<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
      {p.phase === 'offer' && (
        <>
          <p>
            {event.detail} Choose when ready. Inspect or build first; use the clock to run
            engineering.
          </p>
          <p>
            Serve at least 14 healthy hours in a 24-hour window. More healthy time earns more of the
            reward. Failures lose customers; retries keep your architecture.
          </p>
          <div className="campaign-choices">
            {(['steady', 'bold'] as const).map((approach) => {
              const option = eventTerms(p.stage, approach);
              return (
                <button
                  className="secondary"
                  key={approach}
                  onClick={() => send({ type: 'event-start', approach })}
                  disabled={view.company.cash <= 0}
                >
                  <strong>{event[approach]}</strong>
                  <span>
                    {option.outage
                      ? `${option.outage}h app outage`
                      : `${option.load}× offered traffic`}{' '}
                    · reward up to ${option.reward}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
      {p.phase === 'active' && (
        <>
          <p>
            {p.mitigated
              ? 'Safer mode: extra load removed or maintenance cancelled; maximum reward reduced to a quarter.'
              : `${terms.load}× traffic · ${terms.outage}h planned app outage · up to $${terms.reward} reward.`}{' '}
            Your tools and Sandbox remain available.
          </p>
          <div className="challenge-milestones">
            <span>{p.elapsed.toFixed(1)} / 24 hours elapsed</span>
            <span>{p.healthyHours.toFixed(1)} / 14 healthy hours needed</span>
            <span>{Math.floor(p.lostUsers)} customers lost this run</span>
          </div>
          <progress
            aria-label="Event healthy service"
            value={Math.min(14, p.healthyHours)}
            max={14}
          />
          {!p.mitigated && (
            <button className="secondary" onClick={() => send({ type: 'event-mitigate' })}>
              {p.stage === 0 ? 'Limit the rollout' : 'Cancel maintenance'} · quarter reward
            </button>
          )}
        </>
      )}
      {p.phase === 'review' && (
        <>
          <h3>{p.passed ? 'You handled it.' : 'A setback, not the end.'}</h3>
          <p>
            {p.healthyHours.toFixed(1)} healthy hours out of 24.{' '}
            {p.passed
              ? `$${p.reward} earned. ${p.mitigated ? 'You traded upside for a safer recovery.' : 'Your architecture absorbed the event.'}`
              : 'No reward this time. Keep your infrastructure, investigate the bottleneck, and retry at either difficulty.'}
          </p>
          <p>
            What limited service? Would a cheaper change have worked? Compare a different approach
            in Sandbox.
          </p>
          <button className="primary" onClick={() => send({ type: 'event-review' })}>
            {p.passed
              ? p.stage === 0
                ? 'Choose the next event'
                : 'Build toward the finish'
              : 'Prepare another attempt'}
          </button>
        </>
      )}
      <div className="campaign-actions">
        <button className="text-button" onClick={() => send({ type: 'sandbox' })}>
          Rehearse in Sandbox
        </button>
      </div>
    </section>
  );
}
