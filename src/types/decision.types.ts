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
  assumptions: Assumption[];
  alternatives: Alternative[];
  preMortems: PreMortem[];
  events: TimelineEvent[];
  outcome: Outcome | null;
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
  outcome: Outcome;
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
  socraticQuestions: {
    focusArea: string;
    question: string;
    suggestedAction?: string;
  }[];
  detectedBiases: string[];
}

