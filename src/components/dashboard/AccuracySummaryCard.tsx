"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { motion } from "framer-motion";

interface AccuracySummaryCardProps {
  predictionAccuracy: number | null;
  totalDecisions: number;
  activeCount: number;
  calibrationBias?: string;
}

function calibrationBadge(bias?: string): { label: string; tone: "spring" | "amber" | "plum" | "default" } {
  if (bias === "WELL_CALIBRATED") return { label: "Well Calibrated", tone: "spring" };
  if (bias?.startsWith("OVERCONFIDENT")) return { label: "Overconfident", tone: "amber" };
  if (bias?.startsWith("UNDERCONFIDENT")) return { label: "Underconfident", tone: "amber" };
  return { label: "Calibrating Metacognition", tone: "plum" };
}

export function AccuracySummaryCard({
  predictionAccuracy,
  totalDecisions,
  activeCount,
  calibrationBias,
}: AccuracySummaryCardProps) {
  const calibration = calibrationBadge(calibrationBias);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="relative overflow-hidden border-border/80 bg-gradient-to-br from-card via-card to-plum-50/50 dark:to-plum-950/30 shadow-soft">
        {/* Subtle Ambient Spring Glow on Top-Right Corner */}
        <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-spring-500/10 blur-2xl pointer-events-none" />

        <CardContent className="p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2.5">
                <Badge tone={calibration.tone}>
                  <AnimatedIcon name="shield" size={13} className="mr-1.5 text-current" />
                  {calibration.label}
                </Badge>
                <span className="text-xs font-medium text-muted-foreground">
                  Zero Hindsight Bias
                </span>
              </div>

              <div>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                  {predictionAccuracy === null ? (
                    <span className="text-muted-foreground font-light">—</span>
                  ) : (
                    <span className="text-spring-600 dark:text-spring-400">
                      {predictionAccuracy}%
                    </span>
                  )}{" "}
                  <span className="text-lg sm:text-xl font-normal text-muted-foreground">
                    Prediction Accuracy
                  </span>
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {predictionAccuracy === null
                    ? "No replayed outcomes yet. Lock a decision snapshot, then review reality when due."
                    : `Empirically measured across ${totalDecisions} completed prospective reviews.`}
                </p>
              </div>
            </div>

            {/* Quick Metrics Pills */}
            <div className="flex items-center gap-3 shrink-0">
              <motion.div
                whileHover={{ y: -2 }}
                className="p-3.5 rounded-2xl bg-card border border-border text-center min-w-[100px] shadow-sm"
              >
                <div className="grid h-7 w-7 mx-auto mb-1 place-items-center rounded-lg bg-plum-100 dark:bg-plum-900/60 text-primary">
                  <AnimatedIcon name="target" size={16} />
                </div>
                <div className="font-display text-xl font-bold text-foreground">
                  {totalDecisions}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Replays
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                className="p-3.5 rounded-2xl bg-card border border-border text-center min-w-[100px] shadow-sm"
              >
                <div className="grid h-7 w-7 mx-auto mb-1 place-items-center rounded-lg bg-spring-500/15 text-spring-600 dark:text-spring-400">
                  <AnimatedIcon name="trending-up" size={16} />
                </div>
                <div className="font-display text-xl font-bold text-foreground">
                  {activeCount}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Active
                </div>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
