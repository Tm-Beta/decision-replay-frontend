// ==============================================================================
// RESPONSIBLE MEMBER: Member D (Full-Stack / Analytics Lead) & Member A
// FEATURE: Canonical TypeScript Type Definitions
//
// TODO: [Member D]
// 1. Maintain alignment with `decision-replay-docs/api-contracts/*`.
// 2. Export strict interfaces for Decisions, Snapshots, Outcomes, Replay, and DNA dimensions.
// ==============================================================================

export type DecisionStatus = "DRAFT" | "LOCKED" | "REVIEW_PENDING" | "REPLAYED" | "ARCHIVED";

export interface Alternative {
  id?: string;
  title: string;
  pros: string;
  cons: string;
  selected?: boolean;
}

export interface Assumption {
  id?: string;
  statement: string;
  metricTarget?: string;
  metricActual?: string | null;
  confidence: number;
  validated?: boolean | null;
}

export interface PreMortem {
  id?: string;
  failureScenario: string;
  preventiveAction?: string;
  severityScore?: number;
  occurredInReality?: boolean | null;
}

export interface TimelineEvent {
  id: string;
  decisionId: string;
  eventType: "EVIDENCE_NOTE" | "ASSUMPTION_UPDATE" | "CONTEXT_SHIFT" | "BLOCKER_LOG";
  title: string;
  detail: string;
  metadataJson?: string;
  createdAt: string;
}

export interface Outcome {
  id: string;
  decisionId: string;
  actualOutcome: string;
  outcomeScore: number;
  predictionAccuracy?: number | null;
  reflection: string;
  wouldRepeat: boolean;
  unexpectedFactors?: string;
  recordedAt: string;
}

export interface Snapshot {
  id: string;
  decisionId: string;
  contentHash: string;
  payloadJson: string;
  lockedAt: string;
  isVerified?: boolean;
}

export interface SnapshotSummary {
  contentHash: string;
  isVerified?: boolean;
  lockedAt: string;
}

export interface Decision {
  id: string;
  title: string;
  category: string;
  projectId?: string | null;
  choice: string;
  context: string;
  decisionReason?: string;
  beliefRationale?: string;
  expectedOutcome: string;
  confidence: number;
  status: DecisionStatus;
  reviewDate: string | null;
  createdAt: string;
  lockedAt: string | null;
  snapshotHash?: string | null;
  isVerified?: boolean;
  /** Contract shape: `snapshot { contentHash, isVerified, lockedAt }` returned by GET /decisions/:id */
  snapshot?: SnapshotSummary | null;
  /** Present on list items: GET /decisions */
  hasOutcome?: boolean;
  assumptions: Assumption[];
  alternatives: Alternative[];
  preMortems: PreMortem[];
  events: TimelineEvent[];
  outcome: Outcome | null;
}

/** Outcome as returned inside GET /replay/:decisionId (no id / decisionId in the contract). */
export interface ReplayOutcome {
  recordedAt: string;
  actualOutcome: string;
  outcomeScore: number;
  reflection: string;
  wouldRepeat: boolean;
  unexpectedFactors?: string;
}

export interface ReplayComparison {
  decisionId: string;
  title: string;
  initialSnapshot: {
    lockedAt: string | null;
    confidence: number;
    expectedOutcome: string;
    decisionReason?: string;
  };
  outcome: ReplayOutcome;
  metrics: {
    predictionAccuracy: number;
    confidenceCalibrationDelta: number;
    assumptionsValidatedRatio: string;
  };
  assumptionDiffs: Array<{
    statement: string;
    metricTarget?: string;
    metricActual?: string | null;
    validated?: boolean | null;
    confidence: number;
  }>;
  preMortems: PreMortem[];
}

export interface DnaDimension {
  name: string;
  score: number;
  label: string;
  description: string;
  evidenceDecisionIds: string[];
}

export interface DecisionDnaProfile {
  totalDecisions: number;
  overallDnaScore: number;
  dimensions: DnaDimension[];
}

export interface SocraticQuestion {
  focusArea: string;
  question: string;
  suggestedAction: string;
}

export interface SocraticChallengeResponse {
  socraticQuestions: SocraticQuestion[];
  detectedBiases: string[];
}

// ---------- API response shapes (decision-replay-docs/api-contracts) ----------

/** POST /decisions -> 201 Created */
export interface CreateDecisionResponse {
  id: string;
  title: string;
  status: DecisionStatus;
  confidence: number;
  reviewDate: string | null;
  lockedAt: string | null;
  snapshotHash: string;
  assumptionsCount?: number;
  alternativesCount?: number;
  preMortemsCount?: number;
  createdAt: string;
}

/** GET /decisions */
export interface DecisionListResponse {
  data: Decision[];
  total: number;
  page?: number;
  limit?: number;
}

/** POST /replay/:decisionId/outcome -> 201 Created */
export interface RecordOutcomeResponse {
  outcomeId: string;
  decisionId: string;
  predictionAccuracy: number;
  outcomeScore: number;
  confidenceVariance: number;
  assumptionAccuracyRate: number;
  preMortemMatched?: boolean;
  replaySummary?: {
    expected: string;
    actual: string;
    status: string;
  };
  recordedAt: string;
}

/** GET /replay/patterns/summary */
export interface DetectedPattern {
  patternKey: string;
  title: string;
  description: string;
  evidenceDecisionIds?: string[];
  severity: string;
}

export interface PatternSummary {
  totalDecisionsEvaluated: number;
  overallPredictionAccuracy: number;
  calibrationBias: string;
  detectedPatterns: DetectedPattern[];
}
