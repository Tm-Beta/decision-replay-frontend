// ==============================================================================
// RESPONSIBLE MEMBER: Member D (Full-Stack / Analytics Lead)
// FEATURE: Decision & Timeline API Service Layer
//
// TODO: [Member D]
// 1. Connect to backend endpoints defined in `decision-replay-docs/api-contracts/decisions-api.md`.
// 2. Implement createDecision, getDecisionById, appendTimelineEvent, listDecisions.
// ==============================================================================

import { apiClient } from "./apiClient";
import {
  CreateDecisionResponse,
  Decision,
  DecisionListResponse,
  TimelineEvent,
} from "../types/decision.types";

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
  createDecision: async (data: CreateDecisionInput): Promise<CreateDecisionResponse> => {
    return apiClient<CreateDecisionResponse>("/decisions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getDecisionById: async (id: string): Promise<Decision> => {
    return apiClient<Decision>(`/decisions/${id}`);
  },

  listDecisions: async (filters?: {
    status?: string;
    projectId?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<DecisionListResponse> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.projectId) params.append("projectId", filters.projectId);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.page !== undefined) params.append("page", String(filters.page));
    if (filters?.limit !== undefined) params.append("limit", String(filters.limit));

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return apiClient<DecisionListResponse>(`/decisions${queryString}`);
  },

  appendTimelineEvent: async (
    decisionId: string,
    event: { eventType: TimelineEvent["eventType"]; title: string; detail: string }
  ): Promise<TimelineEvent> => {
    return apiClient<TimelineEvent>(`/decisions/${decisionId}/events`, {
      method: "POST",
      body: JSON.stringify(event),
    });
  },
};
