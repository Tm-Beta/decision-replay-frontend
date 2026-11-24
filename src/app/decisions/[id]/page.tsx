// ==============================================================================
// FEATURE: Decision Snapshot & Timeline Inspection View
//
// Fetches the decision, shows the frozen snapshot with the append-only timeline,
// and breaks down assumptions, pre-mortems and alternatives.
// ==============================================================================

"use client";
import { BackLink } from "@/components/navigation/BackLink";
import { formatReminder } from "@/lib/utils";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Decision } from "@/types/decision.types";
import { decisionService } from "@/services/decisionService";
import { SnapshotTimeline } from "@/components/replay/SnapshotTimeline";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProtectedGate } from "@/components/auth/ProtectedGate";
import { DecisionReplayLoader } from "@/components/ui/DecisionReplayLoader";
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
        setDecision(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return <DecisionReplayLoader size="fullscreen" />;
  }

  if (!decision) {
    return (
      <div className="py-16 text-center text-xs text-muted-foreground">
        Decision not found.
      </div>
    );
  }

  const daysLeft = daysUntil(decision.nextReminder || decision.reviewDate);
  const reviewDue = daysLeft !== null && daysLeft <= 0;

  return (
    <ProtectedGate>
      <div className="decision-worksheet space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-wrap items-center gap-2">
        <BackLink href={decision.projectId ? "/decisions/groups/" + decision.projectId : "/decisions?view=individual"}>{decision.projectId ? "Project tree" : "Individual decisions"}</BackLink>
        <Link className="ml-auto rounded-xl px-3 py-2 text-sm font-semibold text-primary hover:bg-muted" href={"/dna?decision="+encodeURIComponent(decision.id)}>Ask AI</Link>
        <Button size="sm" variant="ghost" onClick={() => window.print()}>Print</Button>
        <Link href={`/decisions/${decision.id}/replay`}>
          <Button size="sm" variant={reviewDue || decision.outcome ? "default" : "outline"}>
            <GitCompare className="h-4 w-4 mr-1.5" />
            {decision.outcome ? "View outcome" : "Record outcome"}
          </Button>
        </Link>
      </div>

      {/* Time until review */}
      {(decision.nextReminder || decision.reviewDate) && !decision.outcome && daysLeft !== null && (
        <div
          className={`rounded-xl border px-4 py-2.5 text-sm ${
            reviewDue
              ? "border-amber-500/30 bg-amber-500/10 text-amber-800"
              : "border-border bg-muted/40 text-muted-foreground"
          }`}
        >
          {reviewDue
            ? "Review due: it is time to record what actually happened."
            : `Review scheduled for ${formatReminder(decision.nextReminder || decision.reviewDate)}.`}
        </div>
      )}

      {/* Snapshot and Timeline Engine */}
      <SnapshotTimeline
        decision={decision}
        onEventAdded={(newEvent) => {
          setDecision((prev) => (prev ? { ...prev, events: [newEvent, ...prev.events] } : prev));
        }}
      />

      {/* Assumptions, Alternatives, and Pre-Mortems Breakdown */}
      {(!!decision.assumptions?.length || !!decision.preMortems?.length) && <details><summary>Assumptions and risks</summary><div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Testable Assumptions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Assumptions</CardTitle>
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
              <CardTitle className="text-sm">Risks</CardTitle>
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
      </div></details>}

      {/* Alternatives Weighed */}
      {decision.alternatives && decision.alternatives.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-1.5">
              <Split className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Other options</CardTitle>
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
    </ProtectedGate>
  );
}