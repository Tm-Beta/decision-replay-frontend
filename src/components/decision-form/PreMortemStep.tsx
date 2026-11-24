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
import { validateReviewDate } from "@/lib/validation";

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
  const dateError = reviewDate ? validateReviewDate(reviewDate) : "";

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
        <h2 className="text-lg font-semibold tracking-tight">Risks</h2>
        <p className="text-sm text-muted-foreground">
          What might go wrong?
        </p>
      </div>

      {/* Pre-Mortem Failure Mode Entry */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold">Possible problems</h3>
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
            placeholder="e.g. Overtime cuts into my study time"
            value={failureScenario}
            onChange={(e) => setFailureScenario(e.target.value)}
          />
          <Input
            placeholder="e.g. Set aside Saturday mornings"
            value={preventiveAction}
            onChange={(e) => setPreventiveAction(e.target.value)}
          />
          <div className="flex justify-end pt-1">
            <Button size="sm" onClick={handleAdd} disabled={!failureScenario.trim()}>
              <Plus className="h-4 w-4 mr-1" /> Add risk
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}
