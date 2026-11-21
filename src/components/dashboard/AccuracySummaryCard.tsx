//Displays overall prediction accuracy %, total replayed decisions and the active decision count (a dash is shown when nothing has been replayed yet).
//Shows the confidence calibration status (Well Calibrated, Overconfident, Underconfident or Not enough data yet) from the calibration bias it receives.

"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Activity, ShieldCheck } from "lucide-react";

interface AccuracySummaryCardProps {
  predictionAccuracy: number | null;  // null when decision has been not replayed yet
  totalDecisions: number;
  activeCount: number;
  calibrationBias?: string;
}

function calibrationBadge(bias?: string): { label: string; tone: "green" | "amber" | "blue" } {
  if (bias === "WELL_CALIBRATED") return { label: "Well Calibrated", tone: "green" };
  if (bias?.startsWith("OVERCONFIDENT")) return { label: "Overconfident", tone: "amber" };
  if (bias?.startsWith("UNDERCONFIDENT")) return { label: "Underconfident", tone: "amber" };
  return { label: "Not enough data yet", tone: "blue" };
}

export function AccuracySummaryCard({
  predictionAccuracy,
  totalDecisions,
  activeCount,
  calibrationBias,
}: AccuracySummaryCardProps) {
  const calibration = calibrationBadge(calibrationBias);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge tone={calibration.tone}>
                <ShieldCheck className="h-3 w-3 mr-1" />
                {calibration.label}
              </Badge>
              <span className="text-xs text-muted-foreground">Longitudinal Metacognition</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {predictionAccuracy === null ? "—" : `${predictionAccuracy}%`}{" "}
              <span className="text-base font-normal text-muted-foreground">Prediction Accuracy</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              {predictionAccuracy === null
                ? "No replays yet. Record an outcome to see your accuracy."
                : `Calculated across ${totalDecisions} completed replay reviews.`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-center min-w-[90px]">
              <Target className="h-4 w-4 text-primary mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">{totalDecisions}</div>
              <div className="text-[10px] text-muted-foreground uppercase font-medium">Replays</div>
            </div>

            <div className="p-3 rounded-xl bg-muted/60 border border-border text-center min-w-[90px]">
              <Activity className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">{activeCount}</div>
              <div className="text-[10px] text-muted-foreground uppercase font-medium">Active</div>           
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
