// ==============================================================================
// RESPONSIBLE MEMBER: Member D (Full-Stack / Analytics Lead)
// FEATURE: Clean Main Dashboard Page
//
// TODO: [Member D]
// 1. Fetch live metrics from `/dna/profile` and `/decisions`.
// 2. Render AccuracySummaryCard, PendingReviewsList, and BlindSpotAlert.
// 3. Provide clean fallbacks if running offline without active backend.
// ==============================================================================

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AccuracySummaryCard } from "@/components/dashboard/AccuracySummaryCard";
import { PendingReviewsList } from "@/components/dashboard/PendingReviewsList";
import { BlindSpotAlert } from "@/components/dashboard/BlindSpotAlert";
import { Button } from "@/components/ui/button";
import { PlusCircle, Compass } from "lucide-react";
import { Decision } from "@/types/decision.types";
import { decisionService } from "@/services/decisionService";

export default function DashboardPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await decisionService.listDecisions();
        setDecisions(res.data);
      } catch {
        // Fallback demo decisions for local UI presentation
        setDecisions([
          {
            id: "demo-1",
            title: "Migrate database connection pooling to PgBouncer",
            category: "INFRASTRUCTURE",
            choice: "Deploy PgBouncer in front of RDS cluster",
            context: "Postgres running out of client connections during marketing traffic spikes.",
            expectedOutcome: "Zero connection-pool exhaustion errors over 60 days.",
            confidence: 85,
            status: "LOCKED",
            reviewDate: new Date(Date.now() + 86400000 * 5).toISOString(),
            createdAt: new Date().toISOString(),
            lockedAt: new Date().toISOString(),
            snapshotHash: "4f7a23c89...",
            assumptions: [],
            alternatives: [],
            preMortems: [],
            events: [],
            outcome: null,
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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

      {/* Accuracy & Metacognition Summary */}
      <AccuracySummaryCard
        predictionAccuracy={82}
        totalDecisions={decisions.filter((d) => d.status === "REPLAYED").length || 8}
        activeCount={decisions.filter((d) => d.status !== "REPLAYED").length || 3}
        calibrationStatus="Well Calibrated"
      />

      {/* Main Grid: Pending Reviews & Cognitive Blind Spots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PendingReviewsList decisions={decisions} />
        <BlindSpotAlert />
      </div>

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
