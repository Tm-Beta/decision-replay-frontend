// ==============================================================================
// FEATURE: Decision Snapshot & Timeline Inspection View
//
// Fetches the decision, shows the frozen snapshot with the append-only timeline,
// and breaks down assumptions, pre-mortems and alternatives.
// ==============================================================================

"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Decision } from "@/types/decision.types";
import { decisionService } from "@/services/decisionService";
import { SnapshotTimeline } from "@/components/replay/SnapshotTimeline";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitCompare, AlertTriangle, Split, ArrowLeft, Check, X, Circle } from "lucide-react";

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const ms = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(ms / 86400000);
}

export default function DecisionDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [decision, setDecision] = useState<Decision | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const d = await decisionService.getDecisionById(id);
        setDecision(d);
      } catch {
        // Fallback demo decision
        setDecision({
          id,
          title: "Migrate search index from Elasticsearch to Meilisearch",
          category: "INFRASTRUCTURE",
          choice: "Deploy managed Meilisearch instance on production cluster",
          context: "Elasticsearch heap exhaustion causing search downtime once per week.",
          expectedOutcome: "Search latency < 20ms and memory usage reduced by 70%.",
          confidence: 80,
          status: "LOCKED",
          reviewDate: new Date(Date.now() + 86400000 * 10).toISOString(),
          createdAt: new Date().toISOString(),
          lockedAt: new Date().toISOString(),
          snapshotHash: "c4ca4238a0b923820dcc509a6f75849b...",
          isVerified: true,
          assumptions: [
            {
              statement: "Meilisearch typo-tolerance matches Elasticsearch quality",
              confidence: 85,
              metricTarget: "> 95% search relevance score",
              validated: null,
            },
          ],
          alternatives: [
            {
              title: "Upgrade Elasticsearch cluster memory",
              pros: "Zero code changes",
              cons: "Triples AWS monthly infrastructure costs",
            },
          ],
          preMortems: [
            {
              failureScenario: "Large bulk re-indexing locks Meilisearch disk I/O",
              preventiveAction: "Batch re-indexing in chunks of 500 records during low traffic",
              severityScore: 80,
            },
          ],
          events: [
            {
              id: "evt-1",
              decisionId: id,
              eventType: "EVIDENCE_NOTE",
              title: "Snapshot Frozen",
              detail: "Prospective reasoning, confidence, and pre-mortems locked permanently.",
              createdAt: new Date().toISOString(),
            },
          ],
          outcome: null,
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-muted-foreground">
        Loading snapshot & timeline...
      </div>
    );
  }

  if (!decision) {
    return (
      <div className="py-16 text-center text-xs text-muted-foreground">
        Decision not found.
      </div>
    );
  }

  const daysLeft = daysUntil(decision.reviewDate);
  const reviewDue = daysLeft !== null && daysLeft <= 0;

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/decisions">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> All Decisions
          </Button>
        </Link>

        <Link href={`/decisions/${decision.id}/replay`}>
          <Button size="sm" variant={reviewDue || decision.outcome ? "default" : "outline"}>
            <GitCompare className="h-4 w-4 mr-1.5" />
            {decision.outcome ? "View Replay Comparison" : "Record Outcome Replay"}
          </Button>
        </Link>
      </div>

      {/* Time until review */}
      {decision.reviewDate && !decision.outcome && daysLeft !== null && (
        <div
          className={`rounded-xl border px-4 py-2.5 text-sm ${
            reviewDue
              ? "border-amber-500/30 bg-amber-500/10 text-amber-800"
              : "border-border bg-muted/40 text-muted-foreground"
          }`}
        >
          {reviewDue
            ? "Review due: it is time to record what actually happened."
            : `Review in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`}
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        This snapshot is frozen. It shows exactly what you believed on the day you decided,
        and it can never be edited.
      </p>

      {/* Snapshot and Timeline Engine */}
      <SnapshotTimeline
        decision={decision}
        onEventAdded={(newEvent) => {
          setDecision((prev) => (prev ? { ...prev, events: [newEvent, ...prev.events] } : prev));
        }}
      />

      {/* Assumptions, Alternatives, and Pre-Mortems Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Testable Assumptions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Assumptions & Testable Hypotheses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {decision.assumptions?.length === 0 ? (
              <p className="text-xs text-muted-foreground">No explicit assumptions recorded.</p>
            ) : (
            decision.assumptions?.map((a, i) => (
  <div key={i} className="flex items-center gap-4 rounded-xl border border-border p-4">
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-xs font-semibold">
      A{i + 1}
    </span>
    <div className="flex-1">
      <p className="text-sm">{a.statement}</p>
      {a.metricTarget && (
        <p className="mt-0.5 text-xs font-mono text-muted-foreground">Target: {a.metricTarget}</p>
      )}
            </div>
              <span className="text-xs font-semibold">{a.confidence}% confident</span>
              {a.validated === true ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : a.validated === false ? (
                <X className="h-4 w-4 text-red-500" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          ))
            )}
          </CardContent>
        </Card>

        {/* Pre-Mortem Anticipated Failure Modes */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-sm">Pre-Mortem Failure Anticipations</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {decision.preMortems?.length === 0 ? (
              <p className="text-xs text-muted-foreground">No pre-mortem scenarios recorded.</p>
            ) : (
              decision.preMortems?.map((pm, i) => (
                <div key={i} className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs space-y-1">
                  <span className="font-semibold text-amber-900 dark:text-amber-200">
                    {pm.failureScenario}
                  </span>
                  {pm.preventiveAction && (
                    <p className="text-muted-foreground">Mitigation: {pm.preventiveAction}</p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alternatives Weighed */}
      {decision.alternatives && decision.alternatives.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-1.5">
              <Split className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Alternatives Considered at Commitment Time</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
           {decision.alternatives.map((alt, i) => (
                  <div key={i} className="rounded-xl border border-border p-4">
                    <p className="font-medium">{alt.title}</p>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="font-medium text-emerald-600">UPSIDE</p>
                        <p className="mt-1 leading-5 text-muted-foreground">{alt.pros || "Not recorded"}</p>
                      </div>
                      <div>
                        <p className="font-medium text-amber-600">TRADE-OFF</p>
                        <p className="mt-1 leading-5 text-muted-foreground">{alt.cons || "Not recorded"}</p>
                      </div>
                    </div>
                  </div>
                ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}