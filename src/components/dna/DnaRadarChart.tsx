// ==============================================================================
// RESPONSIBLE MEMBER: Member D (Full-Stack / Analytics Lead)
// FEATURE: Decision DNA Interactive Radar Chart & Dimension Cards
//
// TODO: [Member D]
// 1. Render radar visualization representing the 6 core Decision DNA dimensions.
// 2. Allow user to click any dimension card or radar node to inspect historical evidence.
// ==============================================================================

"use client";

import React from "react";
import { DnaDimension } from "@/types/decision.types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dna, ExternalLink } from "lucide-react";

interface DnaRadarChartProps {
  dimensions: DnaDimension[];
  onSelectDimension: (dimension: DnaDimension) => void;
}

export function DnaRadarChart({ dimensions = [], onSelectDimension }: DnaRadarChartProps) {
  return (
    <div className="space-y-6">
      {/* Visual Dimension Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dimensions.map((dim) => (
          <Card
            key={dim.name}
            className="hover:border-primary/50 transition-all cursor-pointer group bg-card/70"
            onClick={() => onSelectDimension(dim)}
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors">
                  {dim.label}
                </CardTitle>
                <span className="text-lg font-bold font-mono">{dim.score}</span>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <Progress value={dim.score} max={100} className="h-1.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {dim.description}
              </p>
              <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
                <span>{dim.evidenceDecisionIds.length} historical decisions</span>
                <span className="flex items-center gap-1 text-primary group-hover:underline">
                  Inspect evidence <ExternalLink className="h-3 w-3" />
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Profile Overview Banner */}
      <Card className="p-5 border-primary/20 bg-primary/5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Dna className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">Evidence-Based Metacognition</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Decision DNA does not label your personality; it measures empirical consistency between what you anticipated and what transpired. Click any dimension above to audit the exact decisions backing the score.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
