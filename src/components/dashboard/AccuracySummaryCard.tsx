// ==============================================================================
// RESPONSIBLE MEMBER: Member D (Full-Stack / Analytics Lead)
// FEATURE: Dashboard Prediction Accuracy & Overview Summary Card
//
// TODO: [Member D]
// 1. Display overall prediction accuracy %, total replayed decisions, and active decision count.
// 2. Render confidence calibration status (e.g. Well Calibrated vs Overconfident).
// ==============================================================================

"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Activity, ShieldCheck, Flame } from "lucide-react";

interface AccuracySummaryCardProps {
  predictionAccuracy: number;
  totalDecisions: number;
  activeCount: number;
  calibrationStatus?: string;
}

export function AccuracySummaryCard({
  predictionAccuracy = 78,
  totalDecisions = 14,
  activeCount = 5,
  calibrationStatus = "Well Calibrated",
}: AccuracySummaryCardProps) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge tone="green">
                <ShieldCheck className="h-3 w-3 mr-1" />
                {calibrationStatus}
              </Badge>
              <span className="text-xs text-muted-foreground">Longitudinal Metacognition</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {predictionAccuracy}% <span className="text-base font-normal text-muted-foreground">Prediction Accuracy</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Calculated across {totalDecisions} completed replay reviews.
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

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center min-w-[90px]">
              <Flame className="h-4 w-4 text-amber-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">8.4d</div>
              <div className="text-[10px] text-muted-foreground uppercase font-medium">Review Cyc</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
