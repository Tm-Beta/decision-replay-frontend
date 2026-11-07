// ==============================================================================
// RESPONSIBLE MEMBER: Member D (Full-Stack / Analytics Lead)
// FEATURE: Replay Assumption Diff Comparison Table
//
// TODO: [Member D]
// 1. Render side-by-side comparison of Target Metric vs Actual Metric.
// 2. Render hypothesis validation status (Checkmark for true, X for false).
// ==============================================================================

"use client";

import React from "react";
import { Check, X, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AssumptionDiffItem {
  statement: string;
  metricTarget?: string;
  metricActual?: string | null;
  validated?: boolean | null;
  confidence: number;
}

export function AssumptionDiffTable({
  assumptions = [],
}: {
  assumptions: AssumptionDiffItem[];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-left text-xs">
        <thead className="bg-muted/50 uppercase tracking-wider text-[10px] text-muted-foreground border-b border-border">
          <tr>
            <th className="py-3 px-4">Hypothesis (Assumption)</th>
            <th className="py-3 px-4">Expected Target</th>
            <th className="py-3 px-4">Actual Result</th>
            <th className="py-3 px-4 text-center">Confidence</th>
            <th className="py-3 px-4 text-center">Result</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60 bg-card">
          {assumptions.map((a, i) => (
            <tr key={i} className="hover:bg-muted/20 transition-colors">
              <td className="py-3 px-4 font-medium text-foreground max-w-xs">{a.statement}</td>
              <td className="py-3 px-4 font-mono text-muted-foreground">
                {a.metricTarget || "Qualitative"}
              </td>
              <td className="py-3 px-4 font-mono text-foreground font-semibold">
                {a.metricActual || "Not reported"}
              </td>
              <td className="py-3 px-4 text-center text-muted-foreground font-semibold">
                {a.confidence}%
              </td>
              <td className="py-3 px-4 text-center">
                {a.validated === true ? (
                  <Badge tone="green">
                    <Check className="h-3 w-3 mr-1" /> Validated
                  </Badge>
                ) : a.validated === false ? (
                  <Badge tone="red">
                    <X className="h-3 w-3 mr-1" /> Falsified
                  </Badge>
                ) : (
                  <Badge tone="default">
                    <HelpCircle className="h-3 w-3 mr-1" /> Pending
                  </Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
