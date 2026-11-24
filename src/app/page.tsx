"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AccuracySummaryCard } from "@/components/dashboard/AccuracySummaryCard";
import { PendingReviewsList } from "@/components/dashboard/PendingReviewsList";
import { BlindSpotAlert } from "@/components/dashboard/BlindSpotAlert";
import { Button } from "@/components/ui/button";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { DecisionLoopIllustration } from "@/components/illustrations/DecisionIllustrations";
import { Decision, PatternSummary } from "@/types/decision.types";
import { decisionService } from "@/services/decisionService";
import { replayService } from "@/services/replayService";
import { ApiError } from "@/services/apiClient";
import { useAuthStore } from "@/store/useAuthStore";
import { DecisionReplayLoader } from "@/components/ui/DecisionReplayLoader";
import { AuthGate } from "@/components/auth/AuthGate";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  const { isAuthenticated, isHydrated, user } = useAuthStore();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [summary, setSummary] = useState<PatternSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

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
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  // If zustand hasn't rehydrated from localStorage yet, render unique brand loader
  if (!isHydrated) {
    return <DecisionReplayLoader size="fullscreen" />;
  }

  // If unauthenticated, present the Auth Gate (Google Sign-In Wall)
  if (!isAuthenticated) {
    return <AuthGate />;
  }

  const activeCount = decisions.filter(
    (d) => d.status === "LOCKED" || d.status === "REVIEW_PENDING"
  ).length;
  const replayedInList = decisions.filter((d) => d.status === "REPLAYED").length;
  const replayCount = summary?.totalDecisionsEvaluated ?? replayedInList;
  const predictionAccuracy = summary?.overallPredictionAccuracy ?? null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 sm:space-y-8"
    >
      {/* Hero Header with Authenticated User Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-primary">
              Welcome back, {user?.name?.split(" ")[0] || "Leader"}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-spring-500" />
            <span className="text-[11px] text-muted-foreground font-mono">{user?.email}</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Prospective Decision Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Record beliefs and testable hypotheses before reality unfolds; compare expectation with outcome when review day arrives.
          </p>
        </div>

        <Link href="/decisions/new">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
            <Button className="h-10 rounded-xl bg-spring-500 text-plum-950 font-bold shadow-spring hover:bg-spring-400">
              <Plus className="h-4 w-4 mr-1.5 stroke-[3]" />
              Record New Decision
            </Button>
          </motion.div>
        </Link>
      </div>

      {/* Offline / Error Banner */}
      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-soft">
          <p className="text-foreground font-medium">{error}</p>
          <Button size="sm" variant="outline" onClick={loadData}>
            Try again
          </Button>
        </div>
      )}

      {loading ? (
        <DecisionReplayLoader size="md" />
      ) : (
        <>
          {/* Top Metric Cards */}
          <AccuracySummaryCard
            activeCount={activeCount}
            totalDecisions={replayCount}
            predictionAccuracy={predictionAccuracy}
            calibrationBias={summary?.calibrationBias}
          />

          {/* Decisions Pending Review + Reasoning Patterns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <PendingReviewsList decisions={decisions} />
            <BlindSpotAlert patterns={summary?.detectedPatterns ?? []} />
          </div>

          {/* Prospective Cycle Explainer Infographic */}
          <DecisionLoopIllustration />
        </>
      )}
    </motion.div>
  );
}
