//FEATURE: Decision DNA Interactive Radar Chart & Dimension Cards
// Draws an SVG radar of the 6 Decision DNA dimensions: rings at 25, 50, 75 and 100, one axis per dimension and a shape showing the scores.
// Lets the user click a radar node or a dimension card (the keyboard works too) to inspect the historical evidence behind that score.

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

// Short axis names so the labels fit around the chart.
const SHORT_LABELS: Record<string, string> = {
  Calibration: "Calibration",
  PredictionAccuracy: "Prediction",
  AssumptionRigor: "Rigor",
  RiskForesight: "Foresight",
  EstimationAccuracy: "Estimation",
  AlternativeBreadth: "Breadth",
};

const SIZE = 400;
const CENTER = SIZE / 2;
const RADIUS = 120; // distance from the centre to the 100-point ring
const LABEL_RADIUS = 150;
const RINGS = [25, 50, 75, 100];

// Position of axis `index` (out of `total`) at a given distance from the centre. Axis 0 points up.
function polar(index: number, total: number, radius: number): [number, number] {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / total;
  const round = (value: number) => Math.round(value * 100) / 100; // 2 decimals keeps the SVG tidy
  return [round(CENTER + radius * Math.cos(angle)), round(CENTER + radius * Math.sin(angle))];
}

export function DnaRadarChart({ dimensions = [], onSelectDimension }: DnaRadarChartProps) {
  const total = dimensions.length;
  const scorePoints = dimensions.map((dim, i) =>
    polar(i, total, (Math.min(100, Math.max(0, dim.score)) / 100) * RADIUS)
  );
  const scorePolygon = scorePoints.map(([x, y]) => `${x},${y}`).join(" ");

  return (
    <div className="space-y-6">
      {/* Radar chart: needs at least 3 axes to form a shape */}
      {total >= 3 && (
        <Card className="p-4">
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="w-full max-w-md mx-auto"
            role="img"
            aria-label="Radar chart of the Decision DNA dimensions"
          >
            {/* Background rings at 25, 50, 75 and 100 */}
            {RINGS.map((ring) => (
              <polygon
                key={ring}
                points={dimensions
                  .map((_, i) => polar(i, total, (ring / 100) * RADIUS).join(","))
                  .join(" ")}
                style={{ fill: "none", stroke: "hsl(var(--border))" }}
                strokeWidth={1}
              />
            ))}

            {/* One axis line per dimension */}
            {dimensions.map((dim, i) => {
              const [x, y] = polar(i, total, RADIUS);
              return (
                <line
                  key={dim.name}
                  x1={CENTER}
                  y1={CENTER}
                  x2={x}
                  y2={y}
                  style={{ stroke: "hsl(var(--border))" }}
                  strokeWidth={1}
                />
              );
            })}

            {/* The score shape */}
            <polygon
              points={scorePolygon}
              style={{ fill: "hsl(var(--primary) / 0.2)", stroke: "hsl(var(--primary))" }}
              strokeWidth={2}
            />

            {/* Clickable nodes with labels */}
            {dimensions.map((dim, i) => {
              const [nx, ny] = scorePoints[i];
              const [lx, ly] = polar(i, total, LABEL_RADIUS);
              const anchor = lx < CENTER - 5 ? "end" : lx > CENTER + 5 ? "start" : "middle";
              return (
                <g
                  key={dim.name}
                  role="button"
                  tabIndex={0}
                  aria-label={`${dim.label}: ${dim.score} out of 100. Inspect evidence`}
                  className="cursor-pointer focus:outline-none"
                  onClick={() => onSelectDimension(dim)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectDimension(dim);
                    }
                  }}
                >
                  <circle
                    cx={nx}
                    cy={ny}
                    r={7}
                    style={{ fill: "hsl(var(--primary))", stroke: "hsl(var(--background))" }}
                    strokeWidth={2}
                  />
                  <text
                    x={lx}
                    y={ly}
                    textAnchor={anchor}
                    dominantBaseline="middle"
                    className="text-[11px] font-semibold"
                    style={{ fill: "hsl(var(--foreground))" }}
                  >
                    {SHORT_LABELS[dim.name] ?? dim.label}
                  </text>
                  <text
                    x={lx}
                    y={ly + 14}
                    textAnchor={anchor}
                    dominantBaseline="middle"
                    className="text-[10px] font-mono"
                    style={{ fill: "hsl(var(--muted-foreground))" }}
                  >
                    {dim.score}
                  </text>
                </g>
              );
            })}
          </svg>
        </Card>
      )}
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
              <Progress value={dim.score} className="h-1.5" />
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
