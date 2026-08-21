import type { DecisionLabId } from './learningEvidence';
import { loadLocal, saveLocal, STORE_KEYS } from './userStore';

export interface DecisionLabDraftV1 {
  schemaVersion: 1;
  labId: DecisionLabId;
  definitionVersion: number;
  values: Record<string, number>;
  prediction: string;
  derived: Record<string, number | string | boolean> | null;
  conclusion: string;
  mitigation: string;
  counterfactual: string;
  verificationMetric: string;
  updatedAt: string;
}

export type StudyFocusKind = 'concept' | 'inference-node' | 'paper';
export type StudyStage = 'learn' | 'retrieve' | 'apply' | 'explain';

export interface FocusedStudyDraftV1 {
  schemaVersion: 1;
  focusKind: StudyFocusKind;
  focusId: string;
  stage: StudyStage;
  retrieval: string;
  application: string;
  explanation: string;
  completedAt: string | null;
  updatedAt: string;
}

interface LearningContinuityStoreV1 {
  schemaVersion: 1;
  accounts: Record<
    string,
    {
      decisionLabDrafts: Partial<Record<DecisionLabId, DecisionLabDraftV1>>;
      studyDrafts: Record<string, FocusedStudyDraftV1>;
    }
  >;
}

const EMPTY_STORE: LearningContinuityStoreV1 = { schemaVersion: 1, accounts: {} };

function loadStore(): LearningContinuityStoreV1 {
  const loaded = loadLocal<LearningContinuityStoreV1>(STORE_KEYS.learningContinuity, EMPTY_STORE);
  return loaded.schemaVersion === 1 ? loaded : EMPTY_STORE;
}

function accountState(store: LearningContinuityStoreV1, accountScope: string) {
  return (
    store.accounts[accountScope] ?? {
      decisionLabDrafts: {},
      studyDrafts: {},
    }
  );
}

export function loadDecisionLabDraft(
  accountScope: string,
  labId: DecisionLabId,
  definitionVersion: number
): DecisionLabDraftV1 | null {
  const draft = loadStore().accounts[accountScope]?.decisionLabDrafts[labId];
  return draft?.definitionVersion === definitionVersion ? draft : null;
}

export function saveDecisionLabDraft(accountScope: string, draft: DecisionLabDraftV1): void {
  const store = loadStore();
  const account = accountState(store, accountScope);
  store.accounts[accountScope] = {
    ...account,
    decisionLabDrafts: { ...account.decisionLabDrafts, [draft.labId]: draft },
  };
  saveLocal(STORE_KEYS.learningContinuity, store);
}

export function clearDecisionLabDraft(accountScope: string, labId: DecisionLabId): void {
  const store = loadStore();
  const account = store.accounts[accountScope];
  if (!account?.decisionLabDrafts[labId]) return;
  const decisionLabDrafts = { ...account.decisionLabDrafts };
  delete decisionLabDrafts[labId];
  store.accounts[accountScope] = { ...account, decisionLabDrafts };
  saveLocal(STORE_KEYS.learningContinuity, store);
}

function studyKey(focusKind: StudyFocusKind, focusId: string): string {
  return `${focusKind}:${focusId}`;
}

export function loadFocusedStudyDraft(
  accountScope: string,
  focusKind: StudyFocusKind,
  focusId: string
): FocusedStudyDraftV1 | null {
  return loadStore().accounts[accountScope]?.studyDrafts[studyKey(focusKind, focusId)] ?? null;
}

export function loadFocusedStudyDrafts(accountScope: string): FocusedStudyDraftV1[] {
  return Object.values(loadStore().accounts[accountScope]?.studyDrafts ?? {});
}

export function saveFocusedStudyDraft(accountScope: string, draft: FocusedStudyDraftV1): void {
  const store = loadStore();
  const account = accountState(store, accountScope);
  store.accounts[accountScope] = {
    ...account,
    studyDrafts: {
      ...account.studyDrafts,
      [studyKey(draft.focusKind, draft.focusId)]: draft,
    },
  };
  saveLocal(STORE_KEYS.learningContinuity, store);
}
