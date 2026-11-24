// RESPONSIBLE MEMBER: Member B (Frontend Lead) & Member C (Backend AI Lead)
// FEATURE: Real-Time Socratic AI Analyst Sidebar

"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDecisionDraftStore } from "@/store/useDecisionDraftStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { apiClient } from "@/services/apiClient";
import { SocraticChallengeResponse } from "@/types/decision.types";
import { motion } from "framer-motion";
import { RefreshCw, HelpCircle } from "lucide-react";

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
          title: store.title || store.choice,
          choice: store.choice,
          decisionReason: store.decisionReason,
          expectedOutcome: store.expectedOutcome,
          confidence: store.confidenceText ? Number(store.confidenceText) : undefined,
          assumptions: store.assumptions,
          alternatives: store.alternatives,
          preMortems: store.preMortems,
        }),
      });
      setChallenge(res);
    } catch {
      // Graceful offline fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/80 bg-card/90 shadow-soft sticky top-20">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-plum-100 dark:bg-plum-900/60 text-primary">
              <AnimatedIcon name="sparkles" size={15} />
            </div>
            <div>
              <CardTitle className="font-display text-sm font-bold text-foreground">
                Socratic Mirror
              </CardTitle>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs font-semibold text-primary hover:bg-muted"
            onClick={fetchChallenge}
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin text-spring-500" : ""}`} />
            Challenge
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          Analyzes your reasoning in real time. Never dictates; questions blind spots.
        </p>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {challenge?.detectedBiases && challenge.detectedBiases.length > 0 && (
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
              Detected Cognitive Vectors
            </span>
            <div className="flex flex-wrap gap-1.5">
              {challenge.detectedBiases.map((bias) => (
                <Badge key={bias} tone="amber">
                  <AnimatedIcon name="shield-alert" size={11} className="mr-1" />
                  {bias.replace("_", " ")}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {challenge?.socraticQuestions && challenge.socraticQuestions.length > 0 ? (
          <div className="space-y-3">
            {challenge.socraticQuestions.map((q, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-3 rounded-xl bg-muted/40 border border-border/80 text-xs space-y-1.5"
              >
                <span className="font-semibold text-primary block">{q.focusArea}</span>
                <p className="leading-relaxed text-foreground font-medium">{q.question}</p>
                {q.suggestedAction && (
                  <p className="text-muted-foreground border-t border-border/60 pt-1.5 mt-1 text-[11px]">
                    👉 {q.suggestedAction}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 px-3 border border-dashed border-border rounded-2xl text-xs text-muted-foreground space-y-2">
            <HelpCircle className="h-6 w-6 mx-auto opacity-40 text-muted-foreground" />
            <p className="font-medium">Socratic mirror is standing by.</p>
            <p className="text-[11px]">
              Type your choice or click &quot;Challenge&quot; to test your belief assumptions against cognitive bias patterns.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
