//Clean Main Dashboard Page
//Fetches the decisions list (`/decisions`) and the pattern summary (`/replay/patterns/summary`) at the same time.
//Renders AccuracySummaryCard, PendingReviewsList and BlindSpotAlert with that data.
//If the backend is offline, shows a clear error message with a "Try again" button instead of fake data.

"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AccuracySummaryCard } from "@/components/dashboard/AccuracySummaryCard";
import { PendingReviewsList } from "@/components/dashboard/PendingReviewsList";
import { BlindSpotAlert } from "@/components/dashboard/BlindSpotAlert";
import { Button } from "@/components/ui/button";
import { PlusCircle, Compass } from "lucide-react";
import { Decision, PatternSummary } from "@/types/decision.types";
import { decisionService } from "@/services/decisionService";
import { replayService } from "@/services/replayService";
import { ApiError } from "@/services/apiClient";

export default function DashboardPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [summary, setSummary] = useState<PatternSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // The two requests are independent. If one fails, the other still shows its data.
    const [decisionsResult, summaryResult] = await Promise.allSettled([
      decisionService.listDecisions({ limit: 100 }),
      replayService.getPatternSummary(),
    ]);

    setDecisions(decisionsResult.status === "fulfilled" ? decisionsResult.value.data : []);
    setSummary(summaryResult.status === "fulfilled" ? summaryResult.value : null);

    const failure = [decisionsResult, summaryResult].find(
      (r): r is PromiseRejectedResult => r.status === "rejected"
    );
    if (failure) {
      setError(
        failure.reason instanceof ApiError
          ? failure.reason.message
          : "Something went wrong while loading the dashboard."
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open decisions are the ones still waiting for their outcome.
  const activeCount = decisions.filter(
    (d) => d.status === "LOCKED" || d.status === "REVIEW_PENDING"
  ).length;
  const replayedInList = decisions.filter((d) => d.status === "REPLAYED").length;
  const replayCount = summary?.totalDecisionsEvaluated ?? replayedInList;
  const predictionAccuracy =
    summary && summary.totalDecisionsEvaluated > 0
      ? Math.round(summary.overallPredictionAccuracy)
      : null;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Decision Intelligence Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Capture prospective beliefs before reality unfolds; compare expectation with outcome.
          </p>
        </div>

        <Link href="/decisions/new">
          <Button className="shadow-soft">
            <PlusCircle className="h-4 w-4 mr-2" /> Record New Decision
          </Button>
        </Link>
      </div>
      
      {/* Offline / error fallback */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-foreground">{error}</p>
          <Button size="sm" variant="outline" onClick={loadData}>
            Try again
          </Button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      ) : (
        <>
          {/* Accuracy & Metacognition Summary */}
          <AccuracySummaryCard
            predictionAccuracy={predictionAccuracy}
            totalDecisions={replayCount}
            activeCount={activeCount}
            calibrationBias={summary?.calibrationBias}
          />

          {/* Main Grid: Pending Reviews & Cognitive Blind Spots */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PendingReviewsList decisions={decisions} />
            <BlindSpotAlert patterns={summary?.detectedPatterns ?? []} />
          </div>
        </>
      )}

      {/* Explanatory Philosophy Card */}
      <div className="rounded-2xl border border-dashed border-border p-6 bg-card/40 flex items-start gap-4">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-muted-foreground shrink-0">
          <Compass className="h-5 w-5" />
        </div>
        <div className="text-xs space-y-1">
          <h4 className="font-semibold text-foreground text-sm">Prospective vs Retrospective Decision Making</h4>
          <p className="text-muted-foreground leading-relaxed">
            Human memory rewrites history after an outcome is known (hindsight bias). Decision Replay freezes your exact reasons, assumptions, and confidence at the moment of commitment. When review day arrives, you learn what actually happened without self-deception.
          </p>
        </div>
      </div>
    </div>
  );
}
