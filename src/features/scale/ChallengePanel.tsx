import { FailureLearning } from './LearningLinks';
import {
  challengeComplete,
  challengeStopped,
  debrief,
  diagnosis,
  monthlyProfit,
  targetUsers,
} from './game/challenge';
import type { Command, View } from './game/runtime';

function downloadReport(view: View) {
  const url = URL.createObjectURL(
    new Blob([debrief(view.company, view.snapshot)], { type: 'text/markdown' })
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = `scale-${view.company.scenario ?? 'saas'}-debrief.md`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ChallengePanel({
  view,
  send,
  restart,
}: {
  view: View;
  send: (command: Exclude<Command, { type: 'init' }>) => void;
  restart: () => void;
}) {
  const c = view.company;
  const completed = challengeComplete(c) && c.cash > 0;
  const failed = c.cash <= 0;
  const stable = c.run?.stableHours ?? 0;
  return (
    <section className="challenge-panel" aria-label="Company challenge">
      <div role="status" className="sr-only">
        {failed
          ? 'Runway exhausted. Review your debrief or restart this project.'
          : completed
            ? 'Challenge completed. Review your debrief or keep growing.'
            : 'Challenge in progress.'}
      </div>
      <div className="challenge-heading">
        <div>
          <span className="section-label">
            {completed ? 'CHALLENGE COMPLETE' : failed ? 'RUN ENDED' : 'LAUNCH → GROW → STABILIZE'}
          </span>
          <h2>
            {completed
              ? 'You built a sustainable company.'
              : failed
                ? 'Your company ran out of cash.'
                : 'Grow to 5×. Make it sustainable.'}
          </h2>
        </div>
        <button className="text-button" onClick={() => downloadReport(view)}>
          Download debrief
        </button>
      </div>
      {!completed && !failed && (
        <>
          <p>
            {c.campaign && 'Clear both campaign events, then finish sustainably. '}
            Launch, reach {targetUsers(c).toLocaleString()} users, then hold profitable service for
            24 continuous company hours. Keep p99 below 500 ms and errors below 2%. Background work
            must stay under 5 seconds behind, with no expired stream messages and fewer than 2%
            stale reads.
          </p>
          <div className="challenge-milestones">
            <span>{c.launched ? '✓ Launched' : 'Launch pending'}</span>
            {c.campaign && (
              <span>
                {c.campaign.stage} / 2 events cleared · ${c.campaign.earned} earned
              </span>
            )}
            <span>
              {Math.floor(c.users).toLocaleString()} / {targetUsers(c).toLocaleString()} users
            </span>
            <span>
              ${Math.round(monthlyProfit(c, view.snapshot.system)).toLocaleString()}/mo profit
            </span>
            <span>{stable.toFixed(1)} / 24 stable hours</span>
          </div>
          <progress aria-label="Sustained healthy and profitable service" max={24} value={stable} />
          <p className="challenge-diagnosis">
            {diagnosis(c, view.snapshot)} Stability restarts when a target is missed. You can hold
            growth while stabilizing.
          </p>
        </>
      )}
      {(completed || failed) && (
        <p>
          {completed
            ? `Completed at hour ${c.run?.completedAt?.toFixed(1)}. You sustained healthy, profitable service for a full company day. Review your decisions, or keep growing and find the next limit.`
            : 'Infrastructure and engineering spend exhausted your runway. Your architecture is preserved: investigate it in Sandbox, review your debrief, then restart with a different approach.'}
        </p>
      )}
      {completed && c.campaign && (
        <p>
          Both events cleared in {c.campaign.attempts} attempts. ${c.campaign.earned} earned;{' '}
          {Math.floor(c.campaign.lostUsers)} customers lost and a company worth keeping.
        </p>
      )}
      <FailureLearning view={view} />
      <div className="challenge-actions">
        {!c.launched && !failed && (
          <button
            className="primary"
            disabled={c.cash < 100}
            onClick={() => send({ type: 'launch' })}
          >
            Launch your product · $100
          </button>
        )}
        {challengeStopped(c) && (
          <button className="primary" onClick={() => send({ type: 'continue' })}>
            Keep growing
          </button>
        )}
        <button className="secondary" onClick={() => send({ type: 'sandbox' })}>
          Explore in Sandbox
        </button>
        {(failed || completed) && (
          <button className="text-button" onClick={restart}>
            Restart this project
          </button>
        )}
      </div>
    </section>
  );
}
