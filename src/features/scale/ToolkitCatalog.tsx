import { ToolLearning } from './LearningLinks';
import { DECISIONS, available, cost, upgrade } from './game/model';
import { complexity, prerequisite, projectHours } from './game/toolkit';
import type { Command, View } from './game/runtime';

export function ToolkitCatalog({ view, send }: { view: View; send: (c: Command) => void }) {
  const a = view.architecture;
  const groups = ['Compute', 'Data', 'Edge', 'Messaging', 'Reliability'];
  const groupOf = (id: string, group?: string) =>
    group ?? (['app', 'horizontal'].includes(id) ? 'Compute' : id === 'cache' ? 'Edge' : 'Data');
  return (
    <div className="toolkit-catalog">
      <p>
        All {DECISIONS.length} options are available to explore. Complexity {complexity(a)} adds{' '}
        {complexity(a)}% to new engineering projects. Expand a category to compare costs and
        consequences.
      </p>
      {groups.map((group) => (
        <details key={group} className="toolkit-group">
          <summary>
            {group}
            <span>{DECISIONS.filter((d) => groupOf(d.id, d.group) === group).length} options</span>
          </summary>
          <div className="project-catalog">
            {DECISIONS.filter((d) => groupOf(d.id, d.group) === group).map((d) => {
              const reason = prerequisite(a, d.id);
              const enabled = available(a, d.id);
              const stopped =
                !view.sandbox &&
                (view.company.cash <= 0 ||
                  (view.company.run?.completedAt !== undefined && !view.company.run.continued));
              return (
                <article key={d.id}>
                  <div>
                    <h3>{d.title}</h3>
                    <p>{d.benefit}</p>
                    <small>{d.tradeoff}</small>
                    <ToolLearning tool={d.id} />
                  </div>
                  <div>
                    <span>
                      {!enabled && !reason
                        ? 'Installed / at maximum capacity'
                        : `${projectHours(a, d)}h · $${d.upfront} setup · +$${Math.round(cost(upgrade(a, d.id)) - cost(a))}/mo`}
                    </span>
                    <button
                      className="secondary"
                      disabled={
                        !enabled ||
                        stopped ||
                        (!view.sandbox && (!!view.company.project || view.company.cash < d.upfront))
                      }
                      onClick={() =>
                        send({ type: view.sandbox ? 'experiment' : 'project', kind: d.id })
                      }
                    >
                      {reason
                        ? 'Prerequisite needed'
                        : !enabled
                          ? 'At limit / implemented'
                          : view.sandbox
                            ? 'Test in sandbox'
                            : 'Start project'}
                    </button>
                    <small>
                      {reason ??
                        (stopped
                          ? 'Continue or restart the completed run first.'
                          : !view.sandbox && view.company.project
                            ? 'Your engineering team is busy.'
                            : !view.sandbox && view.company.cash < d.upfront
                              ? `Need $${Math.ceil(d.upfront - view.company.cash)} more cash.`
                              : view.sandbox
                                ? 'No cost or engineering wait in Sandbox.'
                                : 'Engineering costs $600/mo while active.')}
                    </small>
                  </div>
                </article>
              );
            })}
          </div>
        </details>
      ))}
    </div>
  );
}
