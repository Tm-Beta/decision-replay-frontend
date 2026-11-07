// ==============================================================================
// RESPONSIBLE MEMBER: Member B (Frontend Lead - Creation Wizard & Snapshot UI)
// FEATURE: Step 3 - Pre-Mortem Analysis & Calibration Commitment
//
// TODO: [Member B]
// 1. Capture prospective failure modes ("Imagine it is 6 months from now and this failed").
// 2. Select review date and set confidence (1-100%).
// ==============================================================================

"use client";

import React, { useState } from "react";
import { useDecisionDraftStore } from "@/store/useDecisionDraftStore";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, AlertTriangle, Calendar, Lock } from "lucide-react";

export function PreMortemStep() {
  const {
    preMortems,
    addPreMortem,
    removePreMortem,
    confidence,
    reviewDate,
    updateField,
  } = useDecisionDraftStore();

  const [failureScenario, setFailureScenario] = useState("");
  const [preventiveAction, setPreventiveAction] = useState("");

  const handleAdd = () => {
    if (!failureScenario.trim()) return;
    addPreMortem({
      failureScenario: failureScenario.trim(),
      preventiveAction: preventiveAction.trim() || undefined,
      severityScore: 70,
    });
    setFailureScenario("");
    setPreventiveAction("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">3. Pre-Mortem & Calibration</h2>
        <p className="text-sm text-muted-foreground">
          Anticipate failure before committing, schedule your review, and state your confidence.
        </p>
      </div>

      {/* Pre-Mortem Failure Mode Entry */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold">Pre-Mortem Failure Modes</h3>
          </div>
          <span className="text-xs px-2 py-0.5 bg-muted rounded-full">{preMortems.length} Scenarios</span>
        </div>

        <div className="space-y-2">
          {preMortems.map((pm, i) => (
            <div key={i} className="flex items-start justify-between gap-3 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-sm">
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-200">{pm.failureScenario}</p>
                {pm.preventiveAction && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Mitigation: {pm.preventiveAction}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:bg-destructive/10 shrink-0"
                onClick={() => removePreMortem(i)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl border border-dashed border-border/80 bg-muted/20 space-y-3">
          <Input
            placeholder="Failure scenario (e.g. AWS connection pool saturation triggers cascading 504 timeouts)"
            value={failureScenario}
            onChange={(e) => setFailureScenario(e.target.value)}
          />
          <Input
            placeholder="Preventive mitigation (e.g. Implement circuit breakers and fallback cache)"
            value={preventiveAction}
            onChange={(e) => setPreventiveAction(e.target.value)}
          />
          <div className="flex justify-end pt-1">
            <Button size="sm" onClick={handleAdd} disabled={!failureScenario.trim()}>
              <Plus className="h-4 w-4 mr-1" /> Add Failure Mode
            </Button>
          </div>
        </div>
      </div>

      {/* Review Date and Calibration Slider */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl border border-border bg-card/60">
        <div>
          <label className="text-sm font-medium flex items-center gap-1.5 mb-1.5">
            <Calendar className="h-4 w-4 text-primary" /> Review Date
          </label>
          <p className="text-xs text-muted-foreground mb-2">When will reality have produced verifiable results?</p>
          <Input
            type="date"
            value={reviewDate}
            onChange={(e) => updateField("reviewDate", e.target.value)}
          />
        </div>

        <div>
          <Slider
            label="Commitment Confidence"
            valueDisplay={`${confidence}%`}
            min={1}
            max={100}
            value={confidence}
            onChange={(e) => updateField("confidence", Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Stated confidence will be checked against empirical Brier calibration on review date.
          </p>
        </div>
      </div>

      {/* Immutability Invariant Notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 text-xs text-muted-foreground">
        <Lock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <p>
          <strong className="text-foreground">Snapshot Immutability Guarantee:</strong> Once you click &quot;Lock Decision Snapshot&quot;, all fields above are cryptographically hashed with SHA-256 and frozen. Later discoveries cannot alter what you believed at this moment.
        </p>
      </div>
    </div>
  );
}
