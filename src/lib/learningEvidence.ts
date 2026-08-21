import { loadLocal, saveLocal, STORE_KEYS } from './userStore';

export type DecisionLabId =
  | 'inference-capacity'
  | 'capacity-planning'
  | 'evaluation-confidence'
  | 'model-routing'
  | 'rag-readiness'
  | 'inference-benchmarking';

export interface DecisionReceiptV1 {
  schemaVersion: 1;
  id: string;
  accountScope: string;
  labId: DecisionLabId;
  definitionVersion: number;
  conceptIds: string[];
  inputs: Record<string, number | string>;
  derived: Record<string, number | string | boolean>;
  prediction: string;
  conclusion: string;
  mitigation: string;
  counterfactual: string;
  verificationMetric: string;
  evidenceState: 'receipt-complete' | 'explanation-pending' | 'verified';
  masteryStatus: 'pending' | 'applied';
  createdAt: string;
}

export interface PaperLearningAttemptV1 {
  schemaVersion: 1;
  id: string;
  accountScope: string;
  paperId: string;
  definitionVersion: number;
  conceptIds: string[];
  retrievalResponse: string;
  followUpEvidence: string;
  evidenceState: 'opened' | 'retrieved' | 'explanation-pending' | 'verified';
  masteryStatus: 'pending' | 'applied';
  createdAt: string;
}

export interface LearningEvidenceStoreV1 {
  schemaVersion: 1;
  accounts: Record<
    string,
    {
      decisionReceipts: DecisionReceiptV1[];
      paperAttempts: PaperLearningAttemptV1[];
    }
  >;
}

const EMPTY_STORE: LearningEvidenceStoreV1 = { schemaVersion: 1, accounts: {} };
export const LEARNING_EVIDENCE_EVENT = 'swe-os:learning-evidence-updated';

function announceUpdate(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(LEARNING_EVIDENCE_EVENT));
}

function loadStore(): LearningEvidenceStoreV1 {
  const loaded = loadLocal<LearningEvidenceStoreV1>(STORE_KEYS.learningEvidence, EMPTY_STORE);
  return loaded.schemaVersion === 1 ? loaded : EMPTY_STORE;
}

export function loadLearningEvidence(accountScope: string) {
  const account = loadStore().accounts[accountScope];
  return {
    decisionReceipts: account?.decisionReceipts ?? [],
    paperAttempts: account?.paperAttempts ?? [],
  };
}

export function appendDecisionReceipt(receipt: DecisionReceiptV1): DecisionReceiptV1[] {
  const store = loadStore();
  const account = store.accounts[receipt.accountScope] ?? {
    decisionReceipts: [],
    paperAttempts: [],
  };
  if (account.decisionReceipts.some((candidate) => candidate.id === receipt.id)) {
    throw new Error('Decision receipts are immutable. Start a new attempt instead.');
  }
  const next = [receipt, ...account.decisionReceipts];
  store.accounts[receipt.accountScope] = { ...account, decisionReceipts: next };
  saveLocal(STORE_KEYS.learningEvidence, store);
  announceUpdate();
  return next;
}

export function appendPaperAttempt(attempt: PaperLearningAttemptV1): PaperLearningAttemptV1[] {
  const store = loadStore();
  const account = store.accounts[attempt.accountScope] ?? {
    decisionReceipts: [],
    paperAttempts: [],
  };
  if (account.paperAttempts.some((candidate) => candidate.id === attempt.id)) {
    throw new Error('Paper attempts are immutable. Start a new attempt instead.');
  }
  const next = [attempt, ...account.paperAttempts];
  store.accounts[attempt.accountScope] = { ...account, paperAttempts: next };
  saveLocal(STORE_KEYS.learningEvidence, store);
  announceUpdate();
  return next;
}
