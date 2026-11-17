// RESPONSIBLE MEMBER: Member B (Frontend Lead) & Member C (Backend AI Lead)
// FEATURE: Real-Time Socratic AI Analyst Sidebar
//

// 1. Fetch Socratic questions from `/api/v1/ai-analyst/challenge` as user updates draft.
// 2. Display provocative questions and detected cognitive bias warnings.
// 3. Keep purely Socratic: never show recommendations on what choice to make.

"use client";

import React, { useEffect, useRef, useState } from "react";
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

    const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const hasContent = store.title.trim() || store.choice.trim() || store.expectedOutcome.trim();
    if (!hasContent) return;

    const timer = setTimeout(() => {
      fetchChallenge();
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    store.title,
    store.choice,
    store.decisionReason,
    store.expectedOutcome,
    store.confidence,
    store.assumptions,
    store.alternatives,
    store.preMortems,
  ]);

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
      const questions: SocraticChallengeResponse["socraticQuestions"] = [];
      const biases: string[] = [];

      if (store.expectedOutcome.trim() && !/\d/.test(store.expectedOutcome)) {
        questions.push({
          focusArea: "Measurability",
          question: "Your expected outcome has no numbers. How would someone verify it later?",
          suggestedAction: "Add a count, percentage, amount or date.",
        });
      }
      if (store.assumptions.length === 0) {
        questions.push({
          focusArea: "Assumption Rigor",
          question: "Which assumptions must be true for this choice to work?",
        });
      } else if (store.assumptions.some((a) => !a.metricTarget?.trim())) {
        questions.push({
          focusArea: "Assumption Rigor",
          question: "Some assumptions have no measurable target. How will you know if they held?",
        });
      }
      if (store.alternatives.length === 0) {
        questions.push({
          focusArea: "Alternative Breadth",
          question: "What other options did you consider, and why did they lose?",
        });
      }
      if (store.preMortems.length === 0) {
        questions.push({
          focusArea: "Failure Anticipation",
          question: "If this fails in six months, what is the most likely reason?",
        });
      }
      if (store.confidence >= 90) {
        biases.push("OVERCONFIDENCE");
        questions.push({
          focusArea: "Calibration",
          question: `You are ${store.confidence}% confident. What evidence would make you doubt this?`,
        });
      }
      if (questions.length === 0) {
        questions.push({
          focusArea: "Assumption Rigor",
          question: "Which single assumption, if wrong, would hurt this decision the most?",
        });
      }

      setChallenge({ socraticQuestions: questions, detectedBiases: biases });
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
            Updates as you type. Questions your reasoning, never decides for you.       </p>
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
