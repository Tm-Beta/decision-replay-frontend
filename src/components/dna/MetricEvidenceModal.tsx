// FEATURE: Metric Evidence Audit Modal
//Loads the real decisions behind a DNA score and shows each one's title, lock date, confidence and outcome, with links to its snapshot and its replay.
//Shows only decisions that exist: nothing is claimed that is not checked, and any record that cannot be loaded is counted and reported instead of hidden.

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Decision, DnaDimension } from "@/types/decision.types";
import { dnaService } from "@/services/dnaService";
import { formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, FileCheck } from "lucide-react";

interface MetricEvidenceModalProps {
  dimension: DnaDimension | null;
  onClose: () => void;
}

export function MetricEvidenceModal({ dimension, onClose }: MetricEvidenceModalProps) {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  // One key per set of evidence ids, so we know whether the loaded list belongs to this score.
  const evidenceKey = dimension ? dimension.evidenceDecisionIds.join(",") : "";

  // Load the real decisions behind the selected score (hooks must run before the early return below).
  useEffect(() => {
    if (!dimension || dimension.evidenceDecisionIds.length === 0) {
      setDecisions([]);
      setLoadedKey(null);
      return;
    }
    let cancelled = false;
    dnaService.getEvidenceDecisions(dimension.evidenceDecisionIds).then((result) => {
      if (!cancelled) {
        setDecisions(result);
        setLoadedKey(evidenceKey);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [dimension, evidenceKey]);

  if (!dimension) return null;

  // Still loading until the list that arrived belongs to this score.
  const loading = dimension.evidenceDecisionIds.length > 0 && loadedKey !== evidenceKey;

  // Records referenced by the score that could not be loaded (deleted, or the server failed for them).
  const referencedCount = new Set(dimension.evidenceDecisionIds).size;
  const missingCount = loading ? 0 : Math.max(0, referencedCount - decisions.length);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{dimension.label} Evidence</CardTitle>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-lg">
                Score: {dimension.score}/100
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Historical decisions contributing to this metric.
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-4 space-y-3 overflow-y-auto flex-1">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {dimension.description}
          </p>

          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Audit Trail ({dimension.evidenceDecisionIds.length} Records)
            </span>

            {dimension.evidenceDecisionIds.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No past replayed decisions recorded for this dimension yet.
              </p>
            ) : loading ? (
              <p className="text-xs text-muted-foreground py-4 text-center">Loading evidence...</p>
            ) : (
              <>
                {decisions.map((d) => (
                  <div
                    key={d.id}
                    className="p-3 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors text-xs space-y-2"
                  >
                    <div className="flex items-start gap-2">
                      <FileCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-semibold text-foreground">{d.title}</span>
                        <p className="text-[11px] text-muted-foreground">
                          Locked {formatDate(d.lockedAt)} · Confidence {d.confidence==null?"Unspecified":d.confidence+"%"}
                          {d.outcome ? ` · Outcome ${d.outcome.outcomeScore}/100` : " · Not replayed yet"}
                          {typeof d.outcome?.predictionAccuracy === "number"
                            ? ` · Accuracy ${d.outcome.predictionAccuracy}%`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/decisions/${d.id}`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          View Snapshot <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                      {d.outcome && (
                        <Link href={`/decisions/${d.id}/replay`}>
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            View Replay <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
                {missingCount > 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    {missingCount} record{missingCount === 1 ? "" : "s"} could not be loaded.
                  </p>
                )}
              </>
            )}
          </div>
        </CardContent>

        <div className="p-3 border-t border-border flex justify-end bg-muted/20">
          <Button size="sm" variant="ghost" onClick={onClose}>
            Close Evidence Audit
          </Button>
        </div>
      </Card>
    </div>
  );
}
