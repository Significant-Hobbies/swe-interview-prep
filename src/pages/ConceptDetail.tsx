import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Copy,
  ExternalLink,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  Badge,
  Button,
  Card,
  color,
  DIFFICULTY_COLOR,
  PageShell,
  SectionTitle,
  STATUS_META,
} from '../components/ui';
import {
  artifactsForConcept,
  CONCEPT_BY_ID,
  drillsForConcept,
  groupForTag,
  PROJECT_BY_ID,
  reviewQuestionsForConcept,
} from '../data/learning-os';
import { useConceptMastery } from '../hooks/useConcepts';
import { confidence1to5, deriveConceptStatus } from '../lib/conceptState';
import { ConceptNotes } from './partials/ConceptNotes';

const RATINGS: { id: 'again' | 'hard' | 'good' | 'easy'; label: string; tone: string }[] = [
  { id: 'again', label: 'Again', tone: 'rose' },
  { id: 'hard', label: 'Hard', tone: 'amber' },
  { id: 'good', label: 'Good', tone: 'blue' },
  { id: 'easy', label: 'Easy', tone: 'emerald' },
];

export default function ConceptDetail() {
  const { id } = useParams();
  const concept = id ? CONCEPT_BY_ID[id] : undefined;
  const { mastery, review } = useConceptMastery();
  const [copied, setCopied] = useState(false);

  if (!concept) {
    return (
      <PageShell>
        <Card className="p-8 text-center">
          <p className="text-sm text-slate-400">Concept not found.</p>
          <Link to="/learn" className="mt-2 inline-block text-sm text-sky-400">← Back to concepts</Link>
        </Card>
      </PageShell>
    );
  }

  const m = mastery[concept.id];
  const status = deriveConceptStatus(m);
  const meta = STATUS_META[status];
  const drills = drillsForConcept(concept.id);
  const artifacts = artifactsForConcept(concept.id);
  const questions = reviewQuestionsForConcept(concept.id);

  async function copyAiPrompt() {
    try {
      await navigator.clipboard?.writeText(buildExpanderPrompt(concept!));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — no-op.
    }
  }

  return (
    <PageShell>
      <Link to="/learn" className="mb-4 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300">
        <ArrowLeft className="h-3.5 w-3.5" /> Concepts
      </Link>

      {/* Header — tags row + difficulty + status. First tag is the primary group. */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">{concept.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          {concept.tags.map(tag => {
            const grp = groupForTag(tag);
            return (
              <span key={tag} className="inline-flex items-center gap-1.5 rounded-md border border-slate-700/70 px-1.5 py-0.5">
                {grp && <span className={`h-1.5 w-1.5 rounded-full ${color(grp.color).solid}`} />}
                {grp ? grp.short : tag}
              </span>
            );
          })}
          <span className="text-slate-600">·</span>
          <Badge tone={DIFFICULTY_COLOR[concept.difficulty] === 'emerald' ? 'success' : DIFFICULTY_COLOR[concept.difficulty] === 'amber' ? 'warning' : 'danger'}>
            {concept.difficulty}
          </Badge>
          <span className="text-slate-600">·</span>
          <span>{meta.label}</span>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-slate-300">{concept.description}</p>
      </div>

      {/* Confidence + rating */}
      <Card className="mb-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-medium text-slate-500">Your confidence</div>
          <div className="mt-1 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(n => (
              <span key={n} className={`h-2.5 w-6 rounded-sm ${n <= confidence1to5(m) ? color(meta.color).solid : 'bg-slate-800'}`} />
            ))}
            <span className="ml-2 text-xs text-slate-500">{m ? `${confidence1to5(m)}/5` : 'untouched'}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs text-slate-500">Log a self-review:</span>
          {RATINGS.map(r => (
            <button
              key={r.id}
              onClick={() => review(concept.id, r.id)}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium ${color(r.tone).bg} ${color(r.tone).border} ${color(r.tone).text}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Mental model */}
          <section>
            <SectionTitle
              action={
                <Button tone="ghost" onClick={() => void copyAiPrompt()}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'AI expand'}
                </Button>
              }
            >
              Mental model
            </SectionTitle>
            {concept.mentalModel ? (
              <Card className="p-4">
                <p className="text-sm leading-relaxed text-slate-300">{concept.mentalModel}</p>
              </Card>
            ) : (
              <Card className="flex items-start gap-3 p-4">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <p className="text-sm text-slate-400">
                  No mental model written yet. Use <span className="text-sky-300">AI expand</span> to draft one,
                  then edit it in your notes — the rule is AI drafts, you approve.
                </p>
              </Card>
            )}
          </section>

          {/* Learn it — curated external sources are the primary content */}
          <section>
            <SectionTitle>Learn it</SectionTitle>
            {concept.resources && concept.resources.length > 0 ? (
              <div className="space-y-2">
                {concept.resources.map(res => (
                  <a
                    key={res.url}
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-3 transition-colors duration-150 hover:border-slate-700 hover:bg-slate-900/70"
                  >
                    <BookOpen className="h-4 w-4 shrink-0 text-sky-400" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-100">{res.title}</div>
                      <div className="text-xs text-slate-500">{res.type}</div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                  </a>
                ))}
              </div>
            ) : (
              <Card className="p-4">
                <p className="text-sm text-slate-400">
                  No curated source yet for this concept. Add the link you trust in your notes below.
                </p>
              </Card>
            )}
          </section>

          {/* Common mistakes */}
          {concept.commonMistakes && concept.commonMistakes.length > 0 && (
            <section>
              <SectionTitle>Common mistakes</SectionTitle>
              <Card className="p-4">
                <ul className="space-y-2">
                  {concept.commonMistakes.map((m2, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                      {m2}
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          )}

          {/* Real-world usage */}
          {concept.realWorldUsage && (
            <section>
              <SectionTitle>Real-world systems</SectionTitle>
              <Card className="p-4"><p className="text-sm text-slate-300">{concept.realWorldUsage}</p></Card>
            </section>
          )}

          {/* Drills */}
          <section>
            <SectionTitle>Drills</SectionTitle>
            {drills.length ? (
              <div className="space-y-2">
                {drills.map(d => (
                  <Card key={d.id} as="link" to={`/drills/${d.id}`} className="flex items-center justify-between gap-3 p-3">
                    <div>
                      <div className="text-sm font-medium text-white">{d.title}</div>
                      <div className="text-xs text-slate-500">{d.type} · {d.difficulty}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-500" />
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No drills mapped yet.</p>
            )}
          </section>

          {/* Artifacts */}
          <section>
            <SectionTitle>Artifacts to build</SectionTitle>
            {artifacts.length ? (
              <div className="space-y-2">
                {artifacts.map(a => (
                  <Card key={a.id} as="link" to="/playground" className="flex items-center justify-between gap-3 p-3">
                    <div>
                      <div className="text-sm font-medium text-white">{a.title}</div>
                      <div className="text-xs text-slate-500">{a.type}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-500" />
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No artifacts mapped yet.</p>
            )}
          </section>

          {/* Review questions */}
          {questions.length > 0 && (
            <section>
              <SectionTitle>Review questions</SectionTitle>
              <div className="space-y-2">
                {questions.map(q => <ReviewQA key={q.id} question={q.question} answer={q.answer} />)}
              </div>
            </section>
          )}

          {/* Notes */}
          <section>
            <SectionTitle>Your notes</SectionTitle>
            <ConceptNotes conceptId={concept.id} />
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {concept.prerequisites.length > 0 && (
            <SidebarList title="Prerequisites" ids={concept.prerequisites} />
          )}
          {concept.related.length > 0 && <SidebarList title="Related concepts" ids={concept.related} />}

          {concept.projectApplications && concept.projectApplications.length > 0 && (
            <div>
              <SectionTitle>Project applications</SectionTitle>
              <div className="space-y-2">
                {concept.projectApplications.map(p => {
                  const proj = PROJECT_BY_ID[p];
                  return (
                    <Card key={p} as="link" to={`/projects/${p}`} className="p-3">
                      <div className="text-sm font-medium text-white">{proj?.name || p}</div>
                      {proj && <div className="text-xs text-slate-500">{proj.lane}</div>}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function SidebarList({ title, ids }: { title: string; ids: string[] }) {
  return (
    <div>
      <SectionTitle>{title}</SectionTitle>
      <div className="flex flex-wrap gap-1.5">
        {ids.map(cid => {
          const c = CONCEPT_BY_ID[cid];
          if (!c) return null;
          return (
            <Link
              key={cid}
              to={`/concepts/${cid}`}
              className="rounded-md border border-slate-800 bg-slate-900/40 px-2 py-1 text-xs text-slate-300 hover:border-slate-700 hover:text-white"
            >
              {c.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function ReviewQA({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Card as="button" onClick={() => setOpen(o => !o)} className="w-full p-3">
      <div className="text-sm font-medium text-slate-200">{question}</div>
      {open ? (
        <div className="mt-2 text-sm text-slate-400">{answer}</div>
      ) : (
        <div className="mt-1 text-xs text-sky-400">Tap to reveal answer</div>
      )}
    </Card>
  );
}

function buildExpanderPrompt(concept: { name: string; tags: string[]; description: string }): string {
  const primary = concept.tags[0] ?? '';
  return [
    `You are helping me learn the concept "${concept.name}" (tags: ${concept.tags.join(', ')}; primary group: ${primary}).`,
    `Current one-line description: ${concept.description}`,
    '',
    'Produce, concisely:',
    '1. A mental model (2-3 sentences).',
    '2. 3-4 common mistakes.',
    '3. Where this is used in real systems.',
    '4. One concrete implementation task.',
    '5. 3 recall questions with answers.',
    '',
    'Keep it tight and practical. I will edit and approve before saving.',
  ].join('\n');
}
