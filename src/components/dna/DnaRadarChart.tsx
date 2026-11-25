// FEATURE: Decision DNA Interactive Radar Chart & Dimension Cards

"use client";

import React from "react";
import { DnaDimension } from "@/types/decision.types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

interface DnaRadarChartProps {
  dimensions: DnaDimension[];
  onSelectDimension: (dimension: DnaDimension) => void;
}

const SHORT_LABELS: Record<string, string> = {
  Calibration: "Confidence Match",
  PredictionAccuracy: "Predictions",
  AssumptionRigor: "Assumptions",
  RiskForesight: "Risk Prep",
  EstimationAccuracy: "Time & Cost",
  AlternativeBreadth: "Options Weighed",
};

const FRIENDLY_NAMES: Record<string, string> = {
  Calibration: "Confidence Match",
  PredictionAccuracy: "Expectation Accuracy",
  AssumptionRigor: "Assumptions Held",
  RiskForesight: "Risk Preparedness",
  EstimationAccuracy: "Time & Cost Accuracy",
  AlternativeBreadth: "Options Considered",
};

const SIZE = 400;
const CENTER = SIZE / 2;
const RADIUS = 125;
const LABEL_RADIUS = 155;
const RINGS = [25, 50, 75, 100];

function polar(index: number, total: number, radius: number): [number, number] {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / total;
  const round = (value: number) => Math.round(value * 100) / 100;
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
      {/* Radar chart container */}
      {total >= 3 && (
        <Card className="p-6 border-border/80 bg-card/80 shadow-soft backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-3">
            <div>
              <h3 className="font-display text-sm font-bold text-foreground">
                Your Decision Balance
              </h3>
              <p className="text-xs text-muted-foreground">
                Click any point to inspect the decisions behind it.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-spring-500/15 border border-spring-500/30 px-2.5 py-0.5 text-[11px] font-bold text-spring-700 dark:text-spring-400">
              <span className="h-1.5 w-1.5 rounded-full bg-spring-500" />
              Live Insights
            </div>
          </div>

          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="w-full max-w-sm sm:max-w-md mx-auto overflow-visible"
            role="img"
            aria-label="Radar chart of the Decision DNA dimensions"
          >
            {/* Background concentric rings */}
            {RINGS.map((ring) => (
              <polygon
                key={ring}
                points={dimensions
                  .map((_, i) => polar(i, total, (ring / 100) * RADIUS).join(","))
                  .join(" ")}
                style={{ fill: ring === 100 ? "hsl(var(--muted) / 0.25)" : "none", stroke: "hsl(var(--border))" }}
                strokeWidth={1}
                strokeDasharray={ring < 100 ? "3 3" : undefined}
              />
            ))}

            {/* Axis lines */}
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

            {/* Score Polygon with Plum Fill & Spring Green Stroke */}
            <polygon
              points={scorePolygon}
              className="fill-primary/20 stroke-primary dark:stroke-spring-400"
              strokeWidth={2.5}
            />

            {/* Clickable Radar Nodes */}
            {dimensions.map((dim, i) => {
              const [nx, ny] = scorePoints[i];
              const [lx, ly] = polar(i, total, LABEL_RADIUS);
              const anchor = lx < CENTER - 5 ? "end" : lx > CENTER + 5 ? "start" : "middle";
              return (
                <g
                  key={dim.name}
                  role="button"
                  tabIndex={0}
                  aria-label={`${dim.label}: ${dim.score} out of 100. View records`}
                  className="cursor-pointer group focus:outline-none"
                  onClick={() => onSelectDimension(dim)}
                >
                  {/* Glowing Node */}
                  <circle
                    cx={nx}
                    cy={ny}
                    r={8}
                    className="fill-spring-500 stroke-background transition-transform group-hover:scale-125"
                    strokeWidth={2.5}
                  />
                  <text
                    x={lx}
                    y={ly}
                    textAnchor={anchor}
                    dominantBaseline="middle"
                    className="font-display text-[11px] font-bold fill-foreground group-hover:fill-primary transition-colors"
                  >
                    {SHORT_LABELS[dim.name] ?? dim.label}
                  </text>
                  <text
                    x={lx}
                    y={ly + 13}
                    textAnchor={anchor}
                    dominantBaseline="middle"
                    className="font-mono text-[10px] font-semibold fill-spring-600 dark:fill-spring-400"
                  >
                    {dim.score}/100
                  </text>
                </g>
              );
            })}
          </svg>
        </Card>
      )}

      {/* Dimension Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dimensions.map((dim) => (
          <motion.div
            key={dim.name}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className="hover:border-primary/50 transition-all cursor-pointer group bg-card border-border/80 shadow-soft"
              onClick={() => onSelectDimension(dim)}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    {FRIENDLY_NAMES[dim.name] ?? dim.label}
                  </CardTitle>
                  <span className="text-base font-extrabold font-mono text-spring-600 dark:text-spring-400">
                    {dim.score}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <Progress value={dim.score} className="h-1.5 bg-muted" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {dim.description}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                  <span className="font-mono">{dim.evidenceDecisionIds.length} decisions</span>
                  <span className="flex items-center gap-1 font-semibold text-primary group-hover:underline">
                    View records <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
