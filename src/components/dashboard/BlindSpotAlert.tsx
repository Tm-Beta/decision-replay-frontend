// ==============================================================================
// RESPONSIBLE MEMBER: Member D (Full-Stack / Analytics Lead)
// FEATURE: Dashboard Cognitive Blind Spot Alerts Component
//
// TODO: [Member D]
// 1. Render patterns identified by the Replay & Pattern Engine.
// 2. Show severity tones (High, Medium, Positive).
// 3. Link to `/dna` for deeper longitudinal analysis.
// ==============================================================================

"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, TrendingUp, Sparkles, ArrowRight } from "lucide-react";

export interface BlindSpotItem {
  patternKey: string;
  title: string;
  description: string;
  severity: "HIGH" | "MEDIUM" | "POSITIVE" | string;
}

export function BlindSpotAlert({
  patterns = [
    {
      patternKey: "SCHEDULE_OPTIMISM",
      title: "Schedule Optimism Detected",
      description: "In 65% of technical migration decisions, actual timeline exceeded original estimate.",
      severity: "HIGH",
    },
    {
      patternKey: "PRE_MORTEM_ACCURACY",
      title: "High Risk Anticipation",
      description: "Pre-mortems correctly foresaw 75% of production bottlenecks before release.",
      severity: "POSITIVE",
    },
  ],
}: {
  patterns?: BlindSpotItem[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Reasoning Patterns & Blind Spots</CardTitle>
        </div>
        <Link href="/dna">
          <Button variant="ghost" size="sm" className="h-8 text-xs">
            View DNA <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="space-y-3">
        {patterns.map((p, i) => (
          <div
            key={i}
            className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
              p.severity === "HIGH"
                ? "border-destructive/30 bg-destructive/5"
                : p.severity === "POSITIVE"
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-amber-500/30 bg-amber-500/5"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                {p.severity === "POSITIVE" ? (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                )}
                {p.title}
              </span>
              <Badge
                tone={
                  p.severity === "HIGH" ? "red" : p.severity === "POSITIVE" ? "green" : "amber"
                }
              >
                {p.severity}
              </Badge>
            </div>
            <p className="text-muted-foreground leading-relaxed">{p.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
