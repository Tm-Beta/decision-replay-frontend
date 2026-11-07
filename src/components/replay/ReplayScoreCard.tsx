// ==============================================================================
// RESPONSIBLE MEMBER: Member D (Full-Stack / Analytics Lead)
// FEATURE: Replay Engine Comparison Score Card
//
// TODO: [Member D]
// 1. Display prediction accuracy score and outcome rating.
// 2. Display confidence calibration delta (e.g. +5% or -12%).
// 3. Render wouldRepeat flag ("Would make this decision again").
// ==============================================================================

"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitCompare, CheckCircle2, RotateCcw } from "lucide-react";

interface ReplayScoreCardProps {
  predictionAccuracy: number;
  outcomeScore: number;
  confidenceDelta: number;
  wouldRepeat: boolean;
}

export function ReplayScoreCard({
  predictionAccuracy,
  outcomeScore,
  confidenceDelta,
  wouldRepeat,
}: ReplayScoreCardProps) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <GitCompare className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tracking-tight">{predictionAccuracy}%</span>
                <Badge tone="blue">Prediction Accuracy</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Outcome Quality: {outcomeScore}/100 • Calibration Delta: {confidenceDelta > 0 ? `+${confidenceDelta}` : confidenceDelta}%
              </p>
            </div>
          </div>

          <div>
            {wouldRepeat ? (
              <Badge tone="green" className="py-1 px-3 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Would Repeat Decision
              </Badge>
            ) : (
              <Badge tone="amber" className="py-1 px-3 text-xs">
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Would Change Course
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
