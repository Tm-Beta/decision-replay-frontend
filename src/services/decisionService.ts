// ==============================================================================
// RESPONSIBLE MEMBER: Member D (Full-Stack / Analytics Lead)
// FEATURE: Decision & Timeline API Service Layer
//
// TODO: [Member D]
// 1. Connect to backend endpoints defined in `decision-replay-docs/api-contracts/decisions-api.md`.
// 2. Implement createDecision, getDecisionById, appendTimelineEvent, listDecisions.
// ==============================================================================

import { apiClient } from "./apiClient";
import { Decision, TimelineEvent } from "../types/decision.types";

export interface CreateDecisionInput {
  projectId?: string;
  title: string;
  category: string;
  choice: string;
  context: string;
  decisionReason?: string;
  beliefRationale?: string;
  expectedOutcome: string;
  confidence: number;
  reviewDate?: string;
  assumptions: Array<{ statement: string; metricTarget?: string; confidence: number }>;
  alternatives: Array<{ title: string; pros: string; cons: string }>;
  preMortems: Array<{ failureScenario: string; preventiveAction?: string; severityScore?: number }>;
}

export const decisionService = {
  createDecision: async (data: CreateDecisionInput): Promise<Decision> => {
    return apiClient<Decision>("/decisions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getDecisionById: async (id: string): Promise<Decision> => {
    return apiClient<Decision>(`/decisions/${id}`);
  },

  listDecisions: async (filters?: { status?: string; projectId?: string; category?: string }): Promise<{ data: Decision[]; total: number }> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.projectId) params.append("projectId", filters.projectId);
    if (filters?.category) params.append("category", filters.category);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return apiClient<{ data: Decision[]; total: number }>(`/decisions${queryString}`);
  },

  appendTimelineEvent: async (
    decisionId: string,
    event: { eventType: string; title: string; detail: string }
  ): Promise<TimelineEvent> => {
    return apiClient<TimelineEvent>(`/decisions/${decisionId}/events`, {
      method: "POST",
      body: JSON.stringify(event),
    });
  },
};
