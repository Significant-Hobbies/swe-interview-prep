import { useEffect } from 'react';

const repository = 'https://github.com/Significant-Hobbies/swe-interview-prep';
const releases = [
  {
    date: '2026-07-25',
    title: 'A public curriculum anyone can inspect',
    outcomes: [
      'The complete curriculum became readable without JavaScript or sign-in across track, roadmap, and concept pages.',
      'Every generated page carries unique metadata, substantive learning content, internal navigation, and sitemap coverage.',
    ],
  },
  {
    date: '2026-07-25',
    title: 'Eleven more learning domains',
    outcomes: [
      'The curriculum expanded to 18 tracks and 222 concepts spanning systems, AI, developer tools, applications, and multimodal work.',
      'Each added concept includes a sequenced path, drill, review prompt, canonical source, and synthesis artifact.',
    ],
  },
  {
    date: '2026-07-25',
    title: 'A more honest learning loop',
    outcomes: [
      'Failed reviews can no longer appear mastered, and roadmap selection now persists through the canonical profile.',
      'Drills and artifacts are graded by evidence strength, with prerequisites and matching library sections visible.',
    ],
  },
  {
    date: '2026-07-13',
    title: 'Reader and High Signal joined daily learning',
    outcomes: [
      'Owner sessions can study current briefing items and private saved reading without copying source bodies into the static catalog.',
      'External items can be reviewed with FSRS, saved to notes, or opened as a focused Playground exercise.',
    ],
  },
] as const;

export default function Changelog() {
  useEffect(() => {
    document.title = 'Changelog · SWE Prep';
  }, []);

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12 text-white sm:px-8 sm:py-16">
      <header className="max-w-3xl">
        <p className="font-mono text-xs font-semibold text-cyan-300">PRODUCT HISTORY</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-6xl">Changelog</h1>
        <p className="mt-5 max-w-[65ch] text-base leading-7 text-white/55">
          Meaningful improvements to the curriculum, practice loop, and personal learning system.
        </p>
        <nav className="mt-6 flex flex-wrap gap-5 text-sm" aria-label="Project links">
          <a className="text-cyan-300 hover:text-cyan-200" href={`${repository}/issues`}>
            Roadmap
          </a>
          <a className="text-cyan-300 hover:text-cyan-200" href={repository}>
            Source
          </a>
        </nav>
      </header>

      <ol className="mt-12 space-y-4">
        {releases.map((release) => (
          <li key={`${release.date}-${release.title}`}>
            <article className="rounded-xl bg-white/[0.04] p-5 ring-1 ring-white/[0.08] sm:p-7">
              <time
                className="font-mono text-xs font-semibold text-white/35"
                dateTime={release.date}
              >
                {new Date(`${release.date}T00:00:00`).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                {release.title}
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-white/55">
                {release.outcomes.map((outcome) => (
                  <li key={outcome}>{outcome}</li>
                ))}
              </ul>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
