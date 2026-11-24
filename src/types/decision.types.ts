// FEATURE: Canonical TypeScript Type Definitions
//Keeps the frontend types aligned with `decision-replay-docs/api-contracts/*` (decisions, replay engine and AI analyst response shapes).
//Exports the interfaces for Decisions, Snapshots, Outcomes, Replay comparison, Pattern summary and DNA dimensions. The DNA types follow the backend response, because `/dna/profile` has no contract document yet.


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
  outcomeScore: number|null;
  predictionAccuracy?: number | null;
  reflection: string;
  wouldRepeat: boolean|null;
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
  nextReminder?:string|null;
  choice: string;
  context: string;
  decisionReason?: string;
  beliefRationale?: string;
  expectedOutcome: string;
  confidence: number|null;
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
  outcomeScore: number|null;
  reflection: string;
  wouldRepeat: boolean|null;
  unexpectedFactors?: string;
}

export interface ReplayComparison {
  decisionId: string;
  title: string;
  initialSnapshot: {
    lockedAt: string | null;
    confidence: number|null;
    expectedOutcome: string;
    decisionReason?: string;
  };
  outcome: ReplayOutcome;
  metrics: {
    predictionAccuracy: number|null;
    confidenceCalibrationDelta: number|null;
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
  socraticQuestions: {
    focusArea: string;
    question: string;
    suggestedAction?: string;
  }[];
  detectedBiases: string[];
}

//API response shapes (decision-replay-docs/api-contracts)

/** POST /decisions - 201 Created */
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

/** POST /replay/:decisionId/outcome - 201 Created */
export interface RecordOutcomeResponse {
  outcomeId: string;
  decisionId: string;
  predictionAccuracy: number|null;
  outcomeScore: number|null;
  confidenceVariance: number|null;
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

/** POST /ai-analyst/replay-analysis response */
export interface ReplayAnalysis {
  varianceExplanation: string;
  reasoningPatternIdentified: string;
  socraticTakeaway: string;
  repeatabilityAssessment: string;
}
