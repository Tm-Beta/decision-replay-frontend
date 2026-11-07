// ==============================================================================
// RESPONSIBLE MEMBER: Member B (Frontend Lead - Creation Wizard & Snapshot UI)
// FEATURE: Step 1 - Core Choice & Reasoning Form
//
// TODO: [Member B]
// 1. Capture title, choice, decision reason, belief rationale, and expected outcome.
// 2. Validate inputs before permitting progression to Step 2.
// ==============================================================================

"use client";

import React from "react";
import { useDecisionDraftStore } from "@/store/useDecisionDraftStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CoreDecisionStep() {
  const {
    title,
    choice,
    decisionReason,
    beliefRationale,
    expectedOutcome,
    updateField,
  } = useDecisionDraftStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">1. Core Choice & Reasoning</h2>
        <p className="text-sm text-muted-foreground">
          Define what you are committing to and why you believe it will work.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Decision Title</label>
          <p className="text-xs text-muted-foreground mb-1">What concrete question or fork are you addressing?</p>
          <Input
            placeholder="e.g. Migrate primary caching tier to DynamoDB"
            value={title}
            onChange={(e) => updateField("title", e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Your Selected Choice</label>
          <p className="text-xs text-muted-foreground mb-1">What exact course of action are you committing to?</p>
          <Textarea
            rows={2}
            placeholder="e.g. Fully replace the self-hosted Redis cluster with managed DynamoDB on AWS."
            value={choice}
            onChange={(e) => updateField("choice", e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Why This Decision Now?</label>
          <p className="text-xs text-muted-foreground mb-1">The trigger, crisis, or strategic opportunity behind it.</p>
          <Textarea
            rows={2}
            placeholder="e.g. Current Redis nodes are running at 85% memory capacity during traffic spikes."
            value={decisionReason}
            onChange={(e) => updateField("decisionReason", e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Belief & Empirical Rationale</label>
          <p className="text-xs text-muted-foreground mb-1">Why do you believe this will succeed? What facts support it?</p>
          <Textarea
            rows={2}
            placeholder="e.g. Internal benchmark showed consistent 4ms read latency under 10k QPS."
            value={beliefRationale}
            onChange={(e) => updateField("beliefRationale", e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Expected Observable Outcome</label>
          <p className="text-xs text-muted-foreground mb-1">A quantifiable result you can objectively check on review day.</p>
          <Textarea
            rows={2}
            placeholder="e.g. Zero memory-related outages over 60 days, monthly AWS bill remains under $250."
            value={expectedOutcome}
            onChange={(e) => updateField("expectedOutcome", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
