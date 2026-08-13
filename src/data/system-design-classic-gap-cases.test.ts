import { describe, expect, it } from 'vitest';

import conceptsData from './concepts.json';
import drillsData from './drills.json';
import { CLASSIC_GAP_SYSTEM_DESIGN_CASES } from './system-design-classic-gap-cases';
import { validateSystemDesignCatalog } from './system-design-case-schema';

const EXPECTED_IDS = [
  'distributed-unique-id-generator',
  'proximity-search-service',
  'nearby-friends-service',
  'maps-routing-platform',
  'distributed-message-queue',
  'metrics-monitoring-platform',
  'ad-click-aggregation-system',
  'hotel-reservation-system',
  'distributed-email-service',
  'object-storage-service',
  'gaming-leaderboard',
  'digital-wallet-system',
  'stock-exchange',
] as const;

describe('classic system-design gap batch', () => {
  it('contains exactly the thirteen audited gap cases', () => {
    expect(CLASSIC_GAP_SYSTEM_DESIGN_CASES.map((caseDefinition) => caseDefinition.id)).toEqual(
      EXPECTED_IDS
    );
  });

  it('passes the canonical schema with valid Learn and Practice remediation', () => {
    const conceptIds = new Set(conceptsData.concepts.map((concept) => concept.id));
    const drillIds = new Set(drillsData.drills.map((drill) => drill.id));
    expect(
      validateSystemDesignCatalog(CLASSIC_GAP_SYSTEM_DESIGN_CASES, { conceptIds, drillIds })
    ).toEqual([]);
  });

  it('keeps the authored teaching payload substantive and source backed', () => {
    for (const caseDefinition of CLASSIC_GAP_SYSTEM_DESIGN_CASES) {
      expect(caseDefinition.calculationAnchors.length).toBeGreaterThanOrEqual(2);
      expect(caseDefinition.conceptIds.length).toBeGreaterThanOrEqual(5);
      expect(caseDefinition.drillIds.length).toBeGreaterThanOrEqual(4);
      expect(caseDefinition.strongerAnswer.length).toBeGreaterThanOrEqual(500);
      expect(caseDefinition.sources.length).toBeGreaterThanOrEqual(2);
      expect(caseDefinition.sources.every((source) => source.url.startsWith('https://'))).toBe(
        true
      );
      expect(caseDefinition.publication.state).toBe('practice-only');
      expect(caseDefinition.failureInjections[0]?.expectedSignals.length).toBeGreaterThanOrEqual(5);
    }
  });

  it('distinguishes adjacent products by their reusable invariant', () => {
    const byId = Object.fromEntries(
      CLASSIC_GAP_SYSTEM_DESIGN_CASES.map((caseDefinition) => [caseDefinition.id, caseDefinition])
    );
    expect(new Set(CLASSIC_GAP_SYSTEM_DESIGN_CASES.map((item) => item.pattern)).size).toBe(13);
    expect(byId['proximity-search-service'].pattern).not.toBe(
      byId['nearby-friends-service'].pattern
    );
    expect(byId['distributed-message-queue'].criticalPath).not.toBe(
      byId['distributed-email-service'].criticalPath
    );
    expect(byId['digital-wallet-system'].criticalPath).not.toBe(
      'create one payment intent and post a processor-backed ledger transition'
    );
  });
});
