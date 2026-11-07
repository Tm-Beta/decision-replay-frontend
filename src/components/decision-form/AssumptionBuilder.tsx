// ==============================================================================
// RESPONSIBLE MEMBER: Member B (Frontend Lead - Creation Wizard & Snapshot UI)
// FEATURE: Step 2A - Testable Hypotheses & Assumption Builder
//
// TODO: [Member B]
// 1. Allow adding, editing, and deleting individual assumptions.
// 2. Treat each assumption as an empirical hypothesis with a measurable target metric.
// ==============================================================================

"use client";

import React, { useState } from "react";
import { useDecisionDraftStore } from "@/store/useDecisionDraftStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";

export function AssumptionBuilder() {
  const { assumptions, addAssumption, removeAssumption } = useDecisionDraftStore();
  const [statement, setStatement] = useState("");
  const [metricTarget, setMetricTarget] = useState("");
  const [confidence, setConfidence] = useState(75);

  const handleAdd = () => {
    if (!statement.trim()) return;
    addAssumption({
      statement: statement.trim(),
      metricTarget: metricTarget.trim() || undefined,
      confidence,
    });
    setStatement("");
    setMetricTarget("");
    setConfidence(75);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Testable Assumptions (Hypotheses)</h3>
          <p className="text-xs text-muted-foreground">
            What real-world conditions or performance metrics must hold true?
          </p>
        </div>
        <span className="text-xs font-semibold px-2 py-1 bg-muted rounded-lg">
          {assumptions.length} Added
        </span>
      </div>

      {/* Added assumptions list */}
      <div className="space-y-2">
        {assumptions.map((a, i) => (
          <div
            key={i}
            className="flex items-start justify-between gap-3 p-3 rounded-xl border border-border bg-card/60 text-sm"
          >
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <div>
                <p className="font-medium">{a.statement}</p>
                {a.metricTarget && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Target Metric: <span className="font-mono">{a.metricTarget}</span>
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-semibold text-muted-foreground">{a.confidence}%</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                onClick={() => removeAssumption(i)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add new assumption box */}
      <div className="p-4 rounded-xl border border-dashed border-border/80 bg-muted/20 space-y-3">
        <Input
          placeholder="e.g. DynamoDB read latency over direct VPC gateway remains < 5ms"
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            placeholder="Metric target (e.g. < 5ms latency, $200/mo)"
            value={metricTarget}
            onChange={(e) => setMetricTarget(e.target.value)}
          />
          <Slider
            label="Hypothesis Confidence"
            valueDisplay={`${confidence}%`}
            min={1}
            max={100}
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
          />
        </div>
        <div className="flex justify-end pt-1">
          <Button size="sm" onClick={handleAdd} disabled={!statement.trim()}>
            <Plus className="h-4 w-4 mr-1" /> Add Assumption
          </Button>
        </div>
      </div>
    </div>
  );
}
