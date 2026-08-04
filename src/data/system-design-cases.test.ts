import { describe, expect, it } from 'vitest';

import conceptsData from './concepts.json';
import drillsData from './drills.json';
import { SYSTEM_DESIGN_CASES } from './system-design-cases';
import { SYSTEM_DESIGN_STAGE_IDS, validateSystemDesignCatalog } from './system-design-case-schema';

const conceptIds = new Set(conceptsData.concepts.map((concept) => concept.id));
const drillIds = new Set(drillsData.drills.map((drill) => drill.id));

describe('system-design case catalog', () => {
  it('ships the original eight followed by twelve popular practice cases', () => {
    expect(SYSTEM_DESIGN_CASES.map((caseDefinition) => caseDefinition.id)).toEqual([
      'llm-inference-10k-rps',
      'production-rag',
      'multi-tenant-llm-gateway',
      'real-time-recommendations',
      'url-shortener',
      'distributed-rate-limiter',
      'real-time-chat',
      'ranked-news-feed',
      'video-streaming-platform',
      'photo-sharing-platform',
      'collaborative-document-editor',
      'notification-delivery-service',
      'web-crawler',
      'distributed-cache',
      'search-autocomplete',
      'cloud-file-storage',
      'distributed-key-value-store',
      'ride-sharing-platform',
      'ticket-booking-platform',
      'payment-processing-system',
    ]);
  });

  it('has no schema or cross-catalog integrity errors', () => {
    expect(validateSystemDesignCatalog(SYSTEM_DESIGN_CASES, { conceptIds, drillIds })).toEqual([]);
  });

  it('uses unique versions, patterns, categories, and deterministic branch targets', () => {
    const identities = SYSTEM_DESIGN_CASES.map(
      (caseDefinition) => `${caseDefinition.id}@${caseDefinition.version}`
    );
    expect(new Set(identities).size).toBe(identities.length);
    expect(new Set(SYSTEM_DESIGN_CASES.map((caseDefinition) => caseDefinition.pattern)).size).toBe(
      SYSTEM_DESIGN_CASES.length
    );
    for (const caseDefinition of SYSTEM_DESIGN_CASES) {
      expect(caseDefinition.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(caseDefinition.stages.map((stage) => stage.id)).toEqual(SYSTEM_DESIGN_STAGE_IDS);
      expect(caseDefinition.followUps.every((branch) => branch.stageId === 'deep-dive')).toBe(true);
    }
  });

  it('publishes only the seven source-reviewed guides', () => {
    const approved = SYSTEM_DESIGN_CASES.filter(
      (caseDefinition) => caseDefinition.publication.state === 'approved'
    );
    expect(approved.map((caseDefinition) => caseDefinition.id)).toEqual([
      'llm-inference-10k-rps',
      'video-streaming-platform',
      'notification-delivery-service',
      'web-crawler',
      'cloud-file-storage',
      'ride-sharing-platform',
      'ticket-booking-platform',
    ]);
    for (const caseDefinition of approved) {
      expect(caseDefinition.publication.guide?.sections.length).toBeGreaterThanOrEqual(8);
      expect(caseDefinition.sources.length).toBeGreaterThanOrEqual(3);
      const sectionWords =
        caseDefinition.publication.guide?.sections
          .map((section) => section.body)
          .join(' ')
          .split(/\s+/)
          .filter(Boolean).length ?? 0;
      expect(sectionWords).toBeGreaterThanOrEqual(1200);
    }
  });
});
