
// FEATURE: Replay Engine Comparison Diff & Outcome Submission View

//If the outcome is pending, shows the outcome recording form, including a held-true / did-not-hold check for each assumption (hypothesis validation).
//If the outcome is completed, shows ReplayScoreCard and the side-by-side.Then vs Now comparison with the assumption diff table.
//Mounts the post-replay variance audit from `/ai-analyst/replay-analysis`.If the AI is unavailable, it says so and the comparison still works.
//If the server is offline, shows an error message with a "Try again" button.

"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Assumption, ReplayAnalysis, ReplayComparison } from "@/types/decision.types";
import { replayService } from "@/services/replayService";
import { decisionService } from "@/services/decisionService";
import { ApiError } from "@/services/apiClient";
import { ReplayScoreCard } from "@/components/replay/ReplayScoreCard";
import { AssumptionDiffTable } from "@/components/replay/AssumptionDiffTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ProtectedGate } from "@/components/auth/ProtectedGate";
import { GitCompare, ArrowLeft, CheckCircle2, XCircle, RotateCcw, Sparkles } from "lucide-react";

export default function ReplayComparisonPage() {
  const params = useParams();
  const id = params?.id as string;

  const [replay, setReplay] = useState<ReplayComparison | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states for outcome recording if pending
  const [actualOutcome, setActualOutcome] = useState("");
  const [outcomeScore, setOutcomeScore] = useState(75);
  const [reflection, setReflection] = useState("");
  const [wouldRepeat, setWouldRepeat] = useState(true);
  const [unexpectedFactors, setUnexpectedFactors] = useState("");
  const [evaluations, setEvaluations] = useState<Record<string, { actual: string; validated: boolean }>>({});
  const [submitting, setSubmitting] = useState(false);
  const [assumptions, setAssumptions] = useState<Assumption[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ReplayAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisFailed, setAnalysisFailed] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await replayService.getReplayComparison(id);
      setReplay(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        // 404 means no outcome has been recorded yet: load the decision to build the form.
        try {
          const d = await decisionService.getDecisionById(id);
          const decisionAssumptions = d.assumptions ?? [];
          setAssumptions(decisionAssumptions);
          const initialEvals: Record<string, { actual: string; validated: boolean }> = {};
          decisionAssumptions.forEach((a) => {
            if (a.id) initialEvals[a.id] = { actual: "", validated: true };
          });
          setEvaluations(initialEvals);
        } catch (decisionErr) {
          setLoadError(
            decisionErr instanceof ApiError ? decisionErr.message : "Could not load this decision."
          );
        }
      } else {
        setLoadError(err instanceof ApiError ? err.message : "Could not load the replay.");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Once a replay exists, ask the AI analyst for a neutral variance audit.
  useEffect(() => {
    if (!replay) return;
    let cancelled = false;
    setAnalysisLoading(true);
    setAnalysisFailed(false);
    replayService
      .getReplayAnalysis({
        decisionId: id,
        expectedOutcome: replay.initialSnapshot.expectedOutcome,
        actualOutcome: replay.outcome.actualOutcome,
        confidence: replay.initialSnapshot.confidence,
        outcomeScore: replay.outcome.outcomeScore,
        assumptions: replay.assumptionDiffs.map((a) => ({
          statement: a.statement,
          validated: a.validated ?? null,
        })),
      })
      .then((result) => {
        if (!cancelled) setAnalysis(result);
      })
      .catch(() => {
        if (!cancelled) setAnalysisFailed(true);
      })
      .finally(() => {
        if (!cancelled) setAnalysisLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [replay, id]);

  const handleSubmitOutcome = async () => {
    if (actualOutcome.trim().length < 5 || reflection.trim().length < 5) {
      setSubmitError("Please describe what happened and what you learned (at least 5 characters each).");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const assumptionEvals = Object.entries(evaluations).map(([assumptionId, val]) => ({
        assumptionId,
        metricActual: val.actual,
        validated: val.validated,
      }));

      await replayService.recordOutcome(id, {
        actualOutcome,
        outcomeScore,
        reflection,
        wouldRepeat,
        unexpectedFactors,
        assumptionEvaluations: assumptionEvals,
      });

      // Reload replay comparison
      const freshReplay = await replayService.getReplayComparison(id);
      setReplay(freshReplay);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : "Could not save the outcome. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-xs text-muted-foreground">Loading Replay Engine...</div>;
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-foreground">{loadError}</p>
        <Button size="sm" variant="outline" onClick={loadData}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <ProtectedGate>
      <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link href={`/decisions/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Snapshot
          </Button>
        </Link>
        <Badge tone="blue">
          <GitCompare className="h-3 w-3 mr-1" /> Replay Engine
        </Badge>
      </div>

      {replay ? (
        /* COMPLETED REPLAY VIEW: SIDE-BY-SIDE DIFF */
        <div className="space-y-6">
          <ReplayScoreCard
            predictionAccuracy={replay.metrics.predictionAccuracy}
            outcomeScore={replay.outcome.outcomeScore}
            confidenceDelta={replay.metrics.confidenceCalibrationDelta}
            wouldRepeat={replay.outcome.wouldRepeat}
          />

          {/* Side-by-side comparison: Then vs Now */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* THEN (Frozen Snapshot) */}
            <Card className="border-border">
              <CardHeader className="pb-3 border-b border-border/80">
                <div className="flex items-center justify-between">
                  <Badge tone="violet">THEN · PROSPECTIVE BELIEF</Badge>
                  <span className="text-xs text-muted-foreground font-semibold">
                    {replay.initialSnapshot.confidence}% Confidence
                  </span>
                </div>
                <CardTitle className="text-base mt-2">What Was Expected</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Locked on {formatDate(replay.initialSnapshot.lockedAt)}
                </p>
              </CardHeader>
              <CardContent className="p-5 space-y-4 text-xs">
                <div>
                  <span className="font-semibold text-muted-foreground uppercase block mb-1">
                    Expected Outcome
                  </span>
                  <p className="leading-relaxed text-foreground font-medium text-sm">
                    {replay.initialSnapshot.expectedOutcome}
                  </p>
                </div>
                {replay.initialSnapshot.decisionReason && (
                  <div>
                    <span className="font-semibold text-muted-foreground uppercase block mb-1">
                      Underlying Rationale
                    </span>
                    <p className="leading-relaxed text-muted-foreground">
                      {replay.initialSnapshot.decisionReason}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* NOW (Actual Reality) */}
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-3 border-b border-primary/20">
                <div className="flex items-center justify-between">
                  <Badge tone="green">NOW · OBSERVED REALITY</Badge>
                  <span className="text-xs text-foreground font-semibold">
                    {replay.outcome.outcomeScore}/100 Rating
                  </span>
                </div>
                <CardTitle className="text-base mt-2">What Actually Transpired</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Recorded on {formatDate(replay.outcome.recordedAt)}
                </p>
              </CardHeader>
              <CardContent className="p-5 space-y-4 text-xs">
                <div>
                  <span className="font-semibold text-muted-foreground uppercase block mb-1">
                    Actual Outcome
                  </span>
                  <p className="leading-relaxed text-foreground font-medium text-sm">
                    {replay.outcome.actualOutcome}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground uppercase block mb-1">
                    Metacognitive Reflection & Learning
                  </span>
                  <p className="leading-relaxed text-muted-foreground">
                    {replay.outcome.reflection}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assumption Hypothesis Testing Diff Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Hypothesis Testing Results (Assumption Diffs)</h3>
            <AssumptionDiffTable assumptions={replay.assumptionDiffs} />
          </div>

          {/* AI Post-Mortem Variance Audit */}
          <Card className="p-5 border-dashed border-primary/40 bg-card">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="space-y-2 text-xs">
                <h4 className="font-semibold text-sm text-foreground">AI Post-Mortem Variance Audit</h4>
                {analysisLoading && <p className="text-muted-foreground">Analysing variance...</p>}
                {analysisFailed && (
                  <p className="text-muted-foreground">
                    The AI audit is not available right now. The comparison above is not affected.
                  </p>
                )}
                {analysis && (
                  <>
                    <p className="text-muted-foreground leading-relaxed">{analysis.varianceExplanation}</p>
                    <p className="text-muted-foreground leading-relaxed">
                      Pattern identified: {analysis.reasoningPatternIdentified}
                    </p>
                    <p className="text-muted-foreground leading-relaxed">{analysis.repeatabilityAssessment}</p>
                    <div className="pt-1 text-[11px] font-mono text-primary">
                      Takeaway: {analysis.socraticTakeaway}
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>
      ) : (
        /* PENDING OUTCOME ENTRY FORM */
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-lg">Close the Loop: Record Reality</CardTitle>
            <p className="text-xs text-muted-foreground">
              Compare your locked beliefs with what actually happened to calculate your prediction accuracy.
            </p>
          </CardHeader>

          <CardContent className="space-y-5">
            <div>
              <label className="text-xs font-semibold block mb-1.5">What actually happened?</label>
              <Textarea
                rows={3}
                placeholder="Describe the real-world outcome with observable metrics..."
                value={actualOutcome}
                onChange={(e) => setActualOutcome(e.target.value)}
              />
            </div>

            <div>
              <Slider
                label="Outcome Quality Score (How well did this turn out?)"
                valueDisplay={`${outcomeScore}/100`}
                min={0}
                max={100}
                value={outcomeScore}
                onChange={(e) => setOutcomeScore(Number(e.target.value))}
              />
            </div>

            {assumptions.some((a) => a.id) && (
              <div className="space-y-3">
                <label className="text-xs font-semibold block">Were your assumptions correct?</label>
                {assumptions
                  .filter((a) => a.id)
                  .map((a) => {
                    const key = a.id as string;
                    const ev = evaluations[key] ?? { actual: "", validated: true };
                    return (
                      <div key={key} className="rounded-xl border border-border p-3 space-y-2 text-xs">
                        <p className="font-medium text-foreground">{a.statement}</p>
                        {a.metricTarget && <p className="text-muted-foreground">Target: {a.metricTarget}</p>}
                        <Input
                          placeholder="Actual result (optional)"
                          value={ev.actual}
                          onChange={(e) =>
                            setEvaluations((prev) => ({ ...prev, [key]: { ...(prev[key] ?? ev), actual: e.target.value } }))
                          }
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={ev.validated ? "default" : "outline"}
                            onClick={() =>
                              setEvaluations((prev) => ({ ...prev, [key]: { ...(prev[key] ?? ev), validated: true } }))
                            }
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Held true
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={!ev.validated ? "destructive" : "outline"}
                            onClick={() =>
                              setEvaluations((prev) => ({ ...prev, [key]: { ...(prev[key] ?? ev), validated: false } }))
                            }
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1.5" /> Did not hold
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold block mb-1.5">
                What did you learn about your reasoning?
              </label>
              <Textarea
                rows={3}
                placeholder="Which assumption held? What unexpected factor surprised you?"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1.5">Anything unexpected? (optional)</label>
              <Textarea
                rows={2}
                placeholder="Factors you did not anticipate..."
                value={unexpectedFactors}
                onChange={(e) => setUnexpectedFactors(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold block mb-2">
                Would you repeat this decision with the same prior reasoning?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={wouldRepeat ? "default" : "outline"}
                  onClick={() => setWouldRepeat(true)}
                  className="text-xs"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Yes, would repeat
                </Button>
                <Button
                  type="button"
                  variant={!wouldRepeat ? "destructive" : "outline"}
                  onClick={() => setWouldRepeat(false)}
                  className="text-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> No, course correct
                </Button>
              </div>
            </div>

            {submitError && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-foreground">
                {submitError}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-border">
              <Button onClick={handleSubmitOutcome} disabled={submitting || !actualOutcome.trim()}>
                {submitting ? "Computing Accuracy..." : "Complete Replay & Calculate Accuracy"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </ProtectedGate>
  );
}