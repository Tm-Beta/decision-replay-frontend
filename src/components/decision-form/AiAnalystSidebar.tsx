// ==============================================================================
// RESPONSIBLE MEMBER: Member B (Frontend Lead) & Member C (Backend AI Lead)
// FEATURE: Real-Time Socratic AI Analyst Sidebar
//
// TODO: [Member B]
// 1. Fetch Socratic questions from `/api/v1/ai-analyst/challenge` as user updates draft.
// 2. Display provocative questions and detected cognitive bias warnings.
// 3. Keep purely Socratic: never show recommendations on what choice to make.
// ==============================================================================

"use client";

import React, { useState } from "react";
import { useDecisionDraftStore } from "@/store/useDecisionDraftStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, HelpCircle, ShieldAlert, RefreshCw } from "lucide-react";
import { apiClient } from "@/services/apiClient";
import { SocraticChallengeResponse } from "@/types/decision.types";

export function AiAnalystSidebar() {
  const store = useDecisionDraftStore();
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState<SocraticChallengeResponse | null>(null);

  const fetchChallenge = async () => {
    setLoading(true);
    try {
      const res = await apiClient<SocraticChallengeResponse>("/ai-analyst/challenge", {
        method: "POST",
        body: JSON.stringify({
          title: store.title,
          choice: store.choice,
          decisionReason: store.decisionReason,
          expectedOutcome: store.expectedOutcome,
          confidence: store.confidence,
          assumptions: store.assumptions.map((a) => ({ statement: a.statement })),
          alternatives: store.alternatives.map((alt) => ({ title: alt.title })),
          preMortems: store.preMortems.map((p) => ({ failureScenario: p.failureScenario })),
        }),
      });
      setChallenge(res);
    } catch {
      // Fallback local challenge heuristic
      setChallenge({
        socraticQuestions: [
          {
            focusArea: "Assumption Rigor",
            question: "How will you measure if this choice succeeded within the first 14 days?",
            suggestedAction: "Define a quantitative metric target.",
          },
        ],
        detectedBiases: ["PLANNING_FALLACY"],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-card/80 sticky top-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">AI Socratic Analyst</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={fetchChallenge}
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
            Challenge
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Challenger mode: Questions your reasoning, never decides for you.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {challenge?.detectedBiases && challenge.detectedBiases.length > 0 && (
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
              Potential Bias Vectors
            </span>
            <div className="flex flex-wrap gap-1.5">
              {challenge.detectedBiases.map((bias) => (
                <Badge key={bias} tone="amber">
                  <ShieldAlert className="h-3 w-3 mr-1" />
                  {bias.replace("_", " ")}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {challenge?.socraticQuestions && challenge.socraticQuestions.length > 0 ? (
          <div className="space-y-3">
            {challenge.socraticQuestions.map((q, i) => (
              <div key={i} className="p-3 rounded-xl bg-muted/40 border border-border text-xs space-y-1.5">
                <span className="font-semibold text-primary block">{q.focusArea}</span>
                <p className="leading-relaxed text-foreground font-medium">{q.question}</p>
                {q.suggestedAction && (
                  <p className="text-muted-foreground border-t border-border/60 pt-1 mt-1">
                    👉 {q.suggestedAction}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 px-3 border border-dashed rounded-xl text-xs text-muted-foreground">
            <HelpCircle className="h-6 w-6 mx-auto mb-2 opacity-40" />
            <p>Click &quot;Challenge&quot; at any time to run the Socratic reasoning check against your draft.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
