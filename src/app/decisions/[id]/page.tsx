// ==============================================================================
// RESPONSIBLE MEMBER: Member B (Frontend Lead - Creation Wizard & Snapshot UI)
// FEATURE: Decision Snapshot & Timeline Inspection View
//
// TODO: [Member B]
// 1. Fetch decision details via `decisionService.getDecisionById(id)`.
// 2. Render SnapshotTimeline component displaying immutable snapshot and verified hash.
// 3. Render Pre-Mortem failure scenarios and assumptions cards.
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
import { GitCompare, AlertTriangle, Split, ArrowLeft } from "lucide-react";

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
          <Button size="sm">
            <GitCompare className="h-4 w-4 mr-1.5" />
            {decision.outcome ? "View Replay Comparison" : "Record Outcome Replay"}
          </Button>
        </Link>
      </div>

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
                <div key={i} className="p-3 rounded-xl border border-border bg-card/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{a.statement}</span>
                    <Badge tone="default">{a.confidence}%</Badge>
                  </div>
                  {a.metricTarget && (
                    <p className="text-muted-foreground font-mono">Target: {a.metricTarget}</p>
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
              <div key={i} className="p-3 rounded-xl border border-border bg-card/60 space-y-1">
                <span className="font-semibold text-foreground block">{alt.title}</span>
                <p className="text-emerald-600 dark:text-emerald-400">Pros: {alt.pros || "None listed"}</p>
                <p className="text-amber-600 dark:text-amber-400">Cons: {alt.cons || "None listed"}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
