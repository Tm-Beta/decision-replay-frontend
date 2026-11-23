// FEATURE: Replay Engine Comparison Score Card

"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { motion } from "framer-motion";

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
    <Card className="border-border/80 bg-gradient-to-br from-card via-card to-plum-50/40 dark:to-plum-950/20 shadow-soft">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-spring-500 text-plum-950 shadow-spring">
              <AnimatedIcon name="replay" size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-display text-3xl font-extrabold text-foreground tracking-tight">
                  <span className="text-spring-600 dark:text-spring-400">{predictionAccuracy}%</span>
                </span>
                <Badge tone="spring">Prediction Accuracy</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Outcome Quality: <strong className="text-foreground">{outcomeScore}/100</strong> • Calibration Delta:{" "}
                <strong className={confidenceDelta > 0 ? "text-amber-600" : "text-spring-600 dark:text-spring-400"}>
                  {confidenceDelta > 0 ? `+${confidenceDelta}` : confidenceDelta}%
                </strong>
              </p>
            </div>
          </div>

          <div>
            {wouldRepeat ? (
              <Badge tone="spring" className="py-1 px-3 text-xs">
                <AnimatedIcon name="check-circle" size={13} className="mr-1.5" /> Would Repeat Choice
              </Badge>
            ) : (
              <Badge tone="amber" className="py-1 px-3 text-xs">
                <AnimatedIcon name="repeat" size={13} className="mr-1.5" /> Would Change Course
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
