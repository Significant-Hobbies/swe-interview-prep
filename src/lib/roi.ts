/**
 * Where the next hour is worth the most.
 *
 * The app could not answer this before, for one structural reason:
 * `weakConcepts()` in recommend.ts filters on `mastery[c.id] && …`, so a
 * concept you have NEVER touched can never be reported as a gap. Every
 * downstream surface inherited that blind spot — the app could say you were
 * shaky on something you had studied, but never that you had not opened
 * distributed systems at all.
 *
 * Sweep fixes the input: after a triage pass, "not known" is observable rather
 * than absent. This module turns that into a ranking.
 *
 * Deliberately no model and no LLM — it is set intersection over
 * `concept-packs.json` and your own sweep state, so nothing inferred is ever
 * written back into the catalog.
 */
import type { Concept } from '../data/learning-os';
import hubData from '../data/source-hubs.json';
import { isThinConcept, MIN_DOMAIN_SIZE, type SweepRating } from './sweep';

export interface SourceHub {
  id: string;
  label: string;
  url: string;
  conceptIds: string[];
}

export const SOURCE_HUBS: SourceHub[] = hubData.hubs as SourceHub[];

/**
 * A hub has to close a real part of the gap to be worth naming.
 *
 * Both floors are load-bearing. At an absolute floor of 2, whichever source
 * happened to overlap won by default: the distributed-systems row recommended
 * "MDN Web Docs" on two incidental concepts, and vector-db recommended the
 * Elasticsearch docs. Requiring a share as well makes the ranking able to say
 * "no hub", which is the truthful answer for a domain the catalog has not
 * wired to any single source — and is itself useful, since it points at
 * content debt rather than hiding it behind a bad suggestion.
 */
export const MIN_HUB_COVERAGE = 3;
export const MIN_HUB_SHARE = 0.2;

/**
 * The count floor has to bend for a nearly-finished domain.
 *
 * A flat `covers >= 3` looks right on an untriaged 20-concept domain and is
 * exactly wrong on one with three gaps left: measured across the real catalog,
 * eligible hubs fell 32 -> 28 -> 22 -> 9 as 0/25/50/70% of each domain was
 * marked Known, because the overlap count shrinks faster than the share rises.
 * The app went quiet precisely when "you have four gaps left, this closes
 * three of them" is the most useful thing it could say.
 *
 * Never below 2 — recommending a whole book to close one concept is worse than
 * the concept's own reading list, which the page already shows.
 */
export function hubCoverageFloor(gapCount: number): number {
  return Math.min(MIN_HUB_COVERAGE, Math.max(2, gapCount));
}

export interface HubMatch {
  label: string;
  url: string;
  /** How many of this domain's unknown concepts the hub covers. */
  covers: number;
}

export interface DomainRoi {
  tag: string;
  total: number;
  /** Concepts triaged in this domain, and that as a 0-100 percentage. */
  rated: number;
  percent: number;
  /** Concepts not rated Known — untouched counts as unknown, which is the point. */
  unknown: number;
  /** Unknown concepts whose mental model is too thin to learn from in-app. */
  thin: number;
  /** Unknown minus thin: gaps this app can actually close today. */
  score: number;
  /** False until at least one concept here has been triaged. */
  swept: boolean;
  /** The single outside source covering the most of these gaps, if any. */
  hub?: HubMatch;
}

/** A concept counts as a gap unless it was explicitly rated Known. */
export function isUnknown(conceptId: string, rated: Record<string, SweepRating>): boolean {
  return rated[conceptId] !== 'known';
}

export function bestHubFor(
  unknownIds: string[],
  hubs: SourceHub[] = SOURCE_HUBS
): HubMatch | undefined {
  const gaps = new Set(unknownIds);
  if (!gaps.size) return undefined;
  const floor = hubCoverageFloor(gaps.size);
  let best: HubMatch | undefined;
  for (const hub of hubs) {
    let covers = 0;
    for (const id of hub.conceptIds) if (gaps.has(id)) covers += 1;
    if (covers < floor) continue;
    if (covers / gaps.size < MIN_HUB_SHARE) continue;
    if (!best || covers > best.covers) best = { label: hub.label, url: hub.url, covers };
  }
  return best;
}

export interface RankOptions {
  rated: Record<string, SweepRating>;
  /** Tags the learner has muted — dropped from the ranking entirely. */
  muted?: string[];
  /** Tags smaller than this are facets, not domains. */
  minSize?: number;
  hubs?: SourceHub[];
}

export function rankDomains(concepts: Concept[], options: RankOptions): DomainRoi[] {
  const { rated, muted = [], minSize = MIN_DOMAIN_SIZE, hubs = SOURCE_HUBS } = options;
  const mutedSet = new Set(muted);

  const byTag = new Map<string, Concept[]>();
  for (const concept of concepts) {
    for (const tag of concept.tags ?? []) {
      if (mutedSet.has(tag)) continue;
      const list = byTag.get(tag);
      if (list) list.push(concept);
      else byTag.set(tag, [concept]);
    }
  }

  const rows: DomainRoi[] = [];
  for (const [tag, list] of byTag) {
    if (list.length < minSize) continue;
    const unknownConcepts = list.filter((c) => isUnknown(c.id, rated));
    const thin = unknownConcepts.filter(isThinConcept).length;
    // Counted here rather than by a second `sweepDomains` pass over the whole
    // catalog — the caller needs both numbers for the same row.
    const triaged = list.filter((c) => rated[c.id]).length;
    rows.push({
      tag,
      total: list.length,
      rated: triaged,
      percent: list.length ? Math.round((triaged / list.length) * 100) : 0,
      unknown: unknownConcepts.length,
      thin,
      score: unknownConcepts.length - thin,
      swept: triaged > 0,
      hub: bestHubFor(
        unknownConcepts.map((c) => c.id),
        hubs
      ),
    });
  }

  // Callers take rows[0] for the headline. Before any sweep every concept is
  // unknown, so that degenerates to "biggest domain first" — honest, but not
  // personal, which is what `swept` lets the UI say out loud.
  return rows.sort((a, b) => b.score - a.score || a.tag.localeCompare(b.tag));
}
