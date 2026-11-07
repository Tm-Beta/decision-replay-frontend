// ==============================================================================
// RESPONSIBLE MEMBER: Member D (Full-Stack / Analytics Lead)
// FEATURE: Decision DNA API Service Layer
//
// TODO: [Member D]
// 1. Fetch longitudinal Decision DNA radar scores from `/dna/profile`.
// 2. Fetch specific historical decisions for a metric using evidence IDs.
// ==============================================================================

import { apiClient } from "./apiClient";
import { DecisionDnaProfile } from "../types/decision.types";

export const dnaService = {
  getProfile: async (): Promise<DecisionDnaProfile> => {
    return apiClient<DecisionDnaProfile>("/dna/profile");
  },
};
