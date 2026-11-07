// ==============================================================================
// RESPONSIBLE MEMBER: Member D (Full-Stack / Analytics Lead)
// FEATURE: Metric Evidence Audit Modal
//
// TODO: [Member D]
// 1. Display the past decision snapshots and replay records justifying a DNA dimension score.
// 2. Prevent opaque AI diagnoses by ensuring all metrics link to real user decisions.
// ==============================================================================

"use client";

import React from "react";
import Link from "next/link";
import { DnaDimension } from "@/types/decision.types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, FileCheck } from "lucide-react";

interface MetricEvidenceModalProps {
  dimension: DnaDimension | null;
  onClose: () => void;
}

export function MetricEvidenceModal({ dimension, onClose }: MetricEvidenceModalProps) {
  if (!dimension) return null;

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
            ) : (
              dimension.evidenceDecisionIds.map((id) => (
                <div
                  key={id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <span className="font-semibold text-foreground">Decision #{id.slice(-6)}</span>
                      <p className="text-[11px] text-muted-foreground">Snapshot verified and replayed</p>
                    </div>
                  </div>
                  <Link href={`/decisions/${id}`}>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      View Snapshot <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              ))
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
