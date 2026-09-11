import {
  FAILURE_LEARNING,
  LESSONS,
  TOOL_LEARNING,
  lessonHref,
  observedFailures,
  type Lesson,
} from './game/learning';
import type { Upgrade } from './game/model';
import type { View } from './game/runtime';

function LessonLink({ id }: { id: Lesson }) {
  return (
    <a href={lessonHref(id)} target="_blank" rel="noopener noreferrer">
      {LESSONS[id][1]} ↗<span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function ToolLearning({ tool }: { tool: Upgrade }) {
  const item = TOOL_LEARNING[tool];
  return (
    <details className="scale-learning">
      <summary>Learn the mechanism &amp; failure modes</summary>
      <p>
        Learn the mechanism: <LessonLink id={item.mechanism} />
      </p>
      <p>
        When it fails: <LessonLink id={item.failure} />
      </p>
      <p>{item.question}</p>
      <small>
        Optional reading opens separately. Pause to study. Lessons go beyond this model.
      </small>
    </details>
  );
}

export function FailureLearning({ view }: { view: View }) {
  const failures = observedFailures({ ...view.company, workload: view.workload }, view.snapshot);
  if (!failures.length) return null;
  return (
    <details className="scale-learning failure-learning">
      <summary>Learn from these signals · {failures.length}</summary>
      {failures.map((id) => {
        const item = FAILURE_LEARNING[id];
        return (
          <div key={id}>
            <strong>{item.title}</strong>
            <p>
              {item.question} <LessonLink id={item.lesson} />
            </p>
          </div>
        );
      })}
      <small>Signals are clues, not proof. Reading opens separately; pause to study.</small>
    </details>
  );
}
