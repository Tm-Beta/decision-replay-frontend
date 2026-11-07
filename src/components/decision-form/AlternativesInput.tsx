// ==============================================================================
// RESPONSIBLE MEMBER: Member B (Frontend Lead - Creation Wizard & Snapshot UI)
// FEATURE: Step 2B - Alternatives & Trade-Offs Input
//
// TODO: [Member B]
// 1. Encourage weighing at least 2 distinct counter-alternatives before locking.
// 2. Capture pros (upside) and cons (trade-offs) for each alternative.
// ==============================================================================

"use client";

import React, { useState } from "react";
import { useDecisionDraftStore } from "@/store/useDecisionDraftStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Split } from "lucide-react";

export function AlternativesInput() {
  const { alternatives, addAlternative, removeAlternative } = useDecisionDraftStore();
  const [title, setTitle] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");

  const handleAdd = () => {
    if (!title.trim()) return;
    addAlternative({
      title: title.trim(),
      pros: pros.trim(),
      cons: cons.trim(),
    });
    setTitle("");
    setPros("");
    setCons("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Alternatives Considered</h3>
          <p className="text-xs text-muted-foreground">
            Weighing options prevents tunnel vision and builds Alternative Breadth.
          </p>
        </div>
        <span className="text-xs font-semibold px-2 py-1 bg-muted rounded-lg">
          {alternatives.length} Weighed
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {alternatives.map((alt, i) => (
          <div key={i} className="p-4 rounded-xl border border-border bg-card/60 text-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold flex items-center gap-1.5">
                <Split className="h-4 w-4 text-primary" /> {alt.title}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                onClick={() => removeAlternative(i)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="text-xs space-y-1">
              <p className="text-emerald-600 dark:text-emerald-400 font-medium">Pros: {alt.pros || "None listed"}</p>
              <p className="text-amber-600 dark:text-amber-400 font-medium">Cons: {alt.cons || "None listed"}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add alternative drawer */}
      <div className="p-4 rounded-xl border border-dashed border-border/80 bg-muted/20 space-y-3">
        <Input
          placeholder="Alternative title (e.g. Scale Redis cluster with Redis Sentinel)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Textarea
            rows={2}
            placeholder="Upsides / Pros"
            value={pros}
            onChange={(e) => setPros(e.target.value)}
          />
          <Textarea
            rows={2}
            placeholder="Downsides / Trade-offs"
            value={cons}
            onChange={(e) => setCons(e.target.value)}
          />
        </div>
        <div className="flex justify-end pt-1">
          <Button size="sm" onClick={handleAdd} disabled={!title.trim()}>
            <Plus className="h-4 w-4 mr-1" /> Add Alternative
          </Button>
        </div>
      </div>
    </div>
  );
}
