// ==============================================================================
// RESPONSIBLE MEMBER: Member D (Full-Stack / Analytics Lead)
// FEATURE: Replay Engine API Service Layer
//
// TODO: [Member D]
// 1. Connect to endpoints in `decision-replay-docs/api-contracts/replay-engine-api.md`.
// 2. Implement recordOutcome, getReplayComparison, getPatternSummary.
// ==============================================================================

import { apiClient } from "./apiClient";
import { ReplayComparison } from "../types/decision.types";

export interface RecordOutcomeInput {
  actualOutcome: string;
  outcomeScore: number;
  reflection: string;
  wouldRepeat: boolean;
  unexpectedFactors?: string;
  assumptionEvaluations: Array<{
    assumptionId: string;
    metricActual?: string;
    validated: boolean;
  }>;
}

export const replayService = {
  recordOutcome: async (decisionId: string, data: RecordOutcomeInput) => {
    return apiClient(`/replay/${decisionId}/outcome`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getReplayComparison: async (decisionId: string): Promise<ReplayComparison> => {
    return apiClient<ReplayComparison>(`/replay/${decisionId}`);
  },

  getPatternSummary: async () => {
    return apiClient<{
      totalDecisionsEvaluated: number;
      overallPredictionAccuracy: number;
      calibrationBias: string;
      detectedPatterns: Array<{
        patternKey: string;
        title: string;
        description: string;
        severity: string;
      }>;
    }>("/replay/patterns/summary");
  },
};
