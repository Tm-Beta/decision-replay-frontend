// FEATURE: Replay Engine API Service Layer
// Connect to endpoints in `decision-replay-docs/api-contracts/replay-engine-api.md`.
// Implement recordOutcome, getReplayComparison, getPatternSummary.


import { apiClient } from "./apiClient";
import {
  PatternSummary,
  RecordOutcomeResponse,
  ReplayAnalysis,
  ReplayComparison,
} from "../types/decision.types";

export interface RecordOutcomeInput {
  actualOutcome: string;
  outcomeScore: number|null;
  reflection: string;
  wouldRepeat: boolean|null;
  unexpectedFactors?: string;
  assumptionEvaluations: Array<{
    assumptionId: string;
    metricActual?: string;
    validated?: boolean;
  }>;
}

export interface ReplayAnalysisInput {
  decisionId: string;
  expectedOutcome: string;
  actualOutcome: string;
  confidence: number;
  outcomeScore: number;
  assumptions: Array<{ statement: string; validated: boolean | null }>;
}

export const replayService = {
  recordOutcome: async (
    decisionId: string,
    data: RecordOutcomeInput
  ): Promise<RecordOutcomeResponse> => {
    return apiClient<RecordOutcomeResponse>(`/replay/${decisionId}/outcome`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getReplayComparison: async (decisionId: string): Promise<ReplayComparison> => {
    return apiClient<ReplayComparison>(`/replay/${decisionId}`);
  },

  getReplayAnalysis: async (payload: ReplayAnalysisInput): Promise<ReplayAnalysis> => {
    return apiClient<ReplayAnalysis>("/ai-analyst/replay-analysis", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getPatternSummary: async (): Promise<PatternSummary> => {
    return apiClient<PatternSummary>("/replay/patterns/summary");
  },
};
