import { apiClient } from "@/services/apiClient";

export type DueReviewItem = {
  id: string;
  title: string;
  project: { name: string } | null;
  reviewDate: string | null;
  nextReminder: string | null;
};

let cachedUserId: string | null = null;
let cachedAt = 0;
let cachedRows: DueReviewItem[] | null = null;
let inFlight: Promise<DueReviewItem[]> | null = null;
let inFlightUserId: string | null = null;
const TTL_MS = 8000;

export function invalidateDueReviews() {
  cachedAt = 0;
  cachedRows = null;
  inFlight = null;
  inFlightUserId = null;
}

/**
 * Deduplicates simultaneous `/decisions/due-reviews` calls from Navbar, MobileNav,
 * and ReviewAlerts for the same authenticated user.
 */
export async function getDueReviews(userId: string, force = false): Promise<DueReviewItem[]> {
  if (!userId) return [];

  if (cachedUserId !== userId) {
    cachedUserId = userId;
    invalidateDueReviews();
  }

  const now = Date.now();
  if (!force && cachedRows && now - cachedAt < TTL_MS) {
    return cachedRows;
  }

  if (inFlight && inFlightUserId === userId) {
    return inFlight;
  }

  inFlightUserId = userId;
  inFlight = apiClient<DueReviewItem[]>("/decisions/due-reviews")
    .then((rows) => {
      const normalized = Array.isArray(rows) ? rows : [];
      if (cachedUserId === userId) {
        cachedRows = normalized;
        cachedAt = Date.now();
      }
      return normalized;
    })
    .finally(() => {
      if (inFlightUserId === userId) {
        inFlight = null;
        inFlightUserId = null;
      }
    });

  return inFlight;
}

