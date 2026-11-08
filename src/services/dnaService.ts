// ==============================================================================
// RESPONSIBLE MEMBER: Member D (Full-Stack / Analytics Lead)
// FEATURE: Decision DNA API Service Layer
//
// TODO: [Member D]
// 1. Fetch longitudinal Decision DNA radar scores from `/dna/profile`.
// 2. Fetch specific historical decisions for a metric using evidence IDs.
// ==============================================================================

import { apiClient } from "./apiClient";
import { decisionService } from "./decisionService";
import { Decision, DecisionDnaProfile } from "../types/decision.types";

export const dnaService = {
  getProfile: async (): Promise<DecisionDnaProfile> => {
    return apiClient<DecisionDnaProfile>("/dna/profile");
  },

  /**
   * Loads the historical decisions that prove a DNA score or a pattern.
   * Uses the existing GET /decisions/:id endpoint for every evidence id.
   * A decision that cannot be loaded is skipped, so one bad id never hides the others.
   */
  getEvidenceDecisions: async (evidenceDecisionIds: string[]): Promise<Decision[]> => {
    const uniqueIds = Array.from(new Set(evidenceDecisionIds));
    const results = await Promise.allSettled(
      uniqueIds.map((id) => decisionService.getDecisionById(id))
    );
    return results
      .filter((r): r is PromiseFulfilledResult<Decision> => r.status === "fulfilled")
      .map((r) => r.value);
  },
};
