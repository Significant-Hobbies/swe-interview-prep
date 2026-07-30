export const CHANGELOG_REPOSITORY = 'https://github.com/Significant-Hobbies/swe-interview-prep';

export const CHANGELOG_RELEASES = [
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
