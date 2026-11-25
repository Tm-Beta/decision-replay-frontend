"use client";
import { BackLink } from "@/components/navigation/BackLink";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProtectedGate } from "@/components/auth/ProtectedGate";
import { AssumptionBuilder } from "@/components/decision-form/AssumptionBuilder";
import { AlternativesInput } from "@/components/decision-form/AlternativesInput";
import { PreMortemStep } from "@/components/decision-form/PreMortemStep";
import { AiAnalystSidebar } from "@/components/decision-form/AiAnalystSidebar";
import { DecisionSymbol, OutcomeSymbol } from "@/components/graph/DecisionGraphCanvas";
import { useDecisionDraftStore } from "@/store/useDecisionDraftStore";
import { useAuthStore } from "@/store/useAuthStore";
import { apiClient } from "@/services/apiClient";
import { decisionService } from "@/services/decisionService";
import type { OutcomeBranch } from "@/types/decision.types";

type Group = {
  name: string;
  decisions: { id: string; title: string; parentId?: string | null }[];
  outcomeBranches?: OutcomeBranch[];
  plans: {
    id: string;
    title: string;
    expectedOutcome: string;
    status: string;
    nodeType?: string;
  }[];
};

function localDate(days = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

function Worksheet() {
  const params = useSearchParams(),
    router = useRouter(),
    d = useDecisionDraftStore();
  const user = useAuthStore((s) => s.user?.id);
  const journalUrl = params.get("from") === "individual" ? "/decisions?view=individual" : "/decisions/ledger";
  const projectId = params.get("group"),
    parentId = (projectId && params.get("parent")) || undefined,
    outcomeParamId = (projectId && params.get("outcome")) || undefined,
    planId = (projectId && params.get("plan")) || undefined;

  const key = JSON.stringify([user, projectId, parentId, outcomeParamId, planId]);
  const [group, setGroup] = useState<Group>(),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);

  // Multi-parent selection: keys like "DECISION:id" or "OUTCOME:id"
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [sourcesInitializedKey, setSourcesInitializedKey] = useState<string>("");

  useEffect(() => {
    if (!projectId) {
      useDecisionDraftStore.getState().switchBranch(key, { reviewDate: "" });
      setGroup({ name: "Decision journal", decisions: [], outcomeBranches: [], plans: [] });
      return;
    }
    let active = true;
    apiClient<Group>("/groups/" + projectId)
      .then((g) => {
        if (!active) return;
        const plan = g.plans.find((p) => p.id === planId);
        if (
          (parentId && !g.decisions.some((x) => x.id === parentId)) ||
          (outcomeParamId && !g.outcomeBranches?.some((o) => o.id === outcomeParamId)) ||
          (planId && (!plan || plan.status !== "OPEN"))
        ) {
          router.replace("/decisions/groups/" + projectId);
          return;
        }
        useDecisionDraftStore.getState().switchBranch(key, {
          reviewDate: localDate(7),
          title: plan?.title || "",
          choice: plan?.title || "",
          expectedOutcome: plan?.expectedOutcome || "",
        });
        setGroup(g);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [key, projectId, parentId, outcomeParamId, planId, router]);

  useEffect(() => {
    if (sourcesInitializedKey === key) return;
    const initial: string[] = [];
    if (parentId) initial.push("DECISION:" + parentId);
    if (outcomeParamId) initial.push("OUTCOME:" + outcomeParamId);
    setSelectedSources(initial);
    setSourcesInitializedKey(key);
  }, [key, parentId, outcomeParamId, sourcesInitializedKey]);

  if (!group || d.branchKey !== key)
    return <p>{error || "Loading worksheet…"}</p>;

  const field = d.setField;

  const toggleSource = (sourceKey: string) => {
    setSelectedSources((prev) =>
      prev.includes(sourceKey) ? prev.filter((k) => k !== sourceKey) : [...prev, sourceKey],
    );
  };

  async function save() {
    const decisionText = (d.choice || d.title).trim();
    if (!decisionText || busy) return;
    const reminder = d.reviewDate ? new Date(d.reviewDate + "T" + (d.reviewTime || "09:00")) : null;
    if (reminder && (!Number.isFinite(reminder.getTime()) || reminder.getTime() < Math.floor(Date.now() / 60000) * 60000)) {
      setError("Choose the current time or a later time for your reminder.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const sourceLinks = selectedSources.map((s) => {
        const [type, ...rest] = s.split(":");
        return { type: type as "DECISION" | "OUTCOME" | "PLAN", id: rest.join(":") };
      });
      const firstDecisionSource = sourceLinks.find((s) => s.type === "DECISION")?.id;
      const decisionInfluences = sourceLinks
        .filter((s) => s.type === "DECISION" && s.id !== firstDecisionSource)
        .map((s) => s.id);

      await decisionService.createDecision({
        projectId: projectId ?? undefined,
        parentId: firstDecisionSource,
        planId: planId || d.selectedPlan || undefined,
        sourceLinks,
        influences: decisionInfluences,
        title: d.title.trim() || decisionText.slice(0, 100),
        choice: decisionText,
        context: "",
        decisionReason: d.decisionReason,
        beliefRationale: d.beliefRationale,
        expectedOutcome: d.expectedOutcome.trim(),
        confidence: d.confidenceText ? Number(d.confidenceText) : null,
        reviewDate: reminder?.toISOString(),
        decidedOn: d.decidedOn || undefined,
        outcomeKnown: d.decidedOn ? d.outcomeKnown : undefined,
        assumptions: d.assumptions,
        alternatives: d.alternatives,
        preMortems: d.preMortems,
      });
      d.resetDraft();
      window.dispatchEvent(new Event("reviews-changed"));
      router.push(projectId ? "/decisions/groups/" + projectId : journalUrl);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  const availableOutcomes = group.outcomeBranches ?? [];
  const decisionPlans = group.plans.filter(
    (p) =>
      p.status === "OPEN" &&
      (p.nodeType ?? "DECISION") === "DECISION" &&
      !group.decisions.some((x) => (x as { planId?: string }).planId === p.id),
  );

  return (
    <section className="branch-workspace decision-simple">
      <BackLink href={projectId ? "/decisions/groups/" + projectId : journalUrl}>
        {projectId ? group.name : "Journal"}
      </BackLink>
      <header>
        <h1>New decision</h1>
        <p>Keep it short and clear so it reads well in your flow and AI insights.</p>
      </header>
      <div className="branch-report">
        <label>
          What did you decide?
          <textarea
            autoFocus
            rows={2}
            placeholder="e.g. Start an English course after uni"
            value={d.choice}
            onChange={(e) => {
              field("choice", e.target.value);
              if (!d.title || d.title === d.choice.slice(0, 100)) {
                field("title", e.target.value.slice(0, 100));
              }
            }}
          />
        </label>

        <label>
          What do you expect to happen? (optional)
          <textarea
            rows={2}
            placeholder="e.g. Improve speaking fluency in 3 months and pass interviews easily"
            value={d.expectedOutcome}
            onChange={(e) => field("expectedOutcome", e.target.value)}
          />
        </label>

        <label>
          How confident are you? (optional, 1–100%)
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="number"
              min="1"
              max="100"
              placeholder="e.g. 75"
              className="w-28"
              value={d.confidenceText}
              onChange={(e) => field("confidenceText", e.target.value)}
            />
            {[
              ["Unsure (35%)", "35"],
              ["Likely (65%)", "65"],
              ["Confident (85%)", "85"],
            ].map(([label, val]) => (
              <button
                key={val}
                type="button"
                className="graph-action-btn"
                onClick={() => field("confidenceText", val)}
              >
                {label}
              </button>
            ))}
          </div>
        </label>

        {projectId && (group.decisions.length > 0 || availableOutcomes.length > 0) && (
          <details open={selectedSources.length > 0}>
            <summary>
              Connected from · {selectedSources.length ? `${selectedSources.length} selected` : "Independent start"}
            </summary>
            <div className="grid gap-3 pt-3">
              <p className="text-xs text-muted-foreground">
                Pick one or more previous decisions or outcomes that led to this choice, or leave empty to start an independent branch.
              </p>
              {availableOutcomes.length > 0 && (
                <div className="grid gap-1.5">
                  <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1.5">
                    <OutcomeSymbol /> From recorded outcomes
                  </span>
                  <div className="parent-chip-list">
                    {availableOutcomes.map((ob) => {
                      const k = "OUTCOME:" + ob.id;
                      const parentTitle = group.decisions.find((dec) => dec.id === ob.decisionId)?.title;
                      return (
                        <label className="parent-chip-item" key={k}>
                          <input
                            type="checkbox"
                            checked={selectedSources.includes(k)}
                            onChange={() => toggleSource(k)}
                          />
                          <span>
                            <strong>{ob.title}</strong>
                            {parentTitle && <small className="block">from {parentTitle}</small>}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {group.decisions.length > 0 && (
                <div className="grid gap-1.5">
                  <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                    <DecisionSymbol /> From previous decisions
                  </span>
                  <div className="parent-chip-list">
                    {group.decisions.map((dec) => {
                      const k = "DECISION:" + dec.id;
                      return (
                        <label className="parent-chip-item" key={k}>
                          <input
                            type="checkbox"
                            checked={selectedSources.includes(k)}
                            onChange={() => toggleSource(k)}
                          />
                          <span>{dec.title}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </details>
        )}

        <details>
          <summary>Outcome reminder · {d.reviewDate || "Off"}</summary>
          <div className="grid gap-3 pt-3">
            <label>
              Remind me to record what happened
              <input
                type="date"
                min={localDate()}
                value={d.reviewDate}
                onChange={(e) => field("reviewDate", e.target.value)}
              />
            </label>
            {d.reviewDate && (
              <label>
                Reminder time ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                <input
                  type="time"
                  required
                  value={d.reviewTime || "09:00"}
                  onChange={(e) => field("reviewTime", e.target.value)}
                />
              </label>
            )}
            <div className="branch-tools">
              {[
                ["Today", 0],
                ["In a week", 7],
                ["In a month", 30],
                ["No reminder", -1],
              ].map(([name, days]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    field("reviewDate", Number(days) < 0 ? "" : localDate(Number(days)));
                    if (Number(days) === 0) {
                      const now = new Date();
                      const current = [now.getHours(), now.getMinutes()]
                        .map((n) => String(n).padStart(2, "0"))
                        .join(":");
                      if ((d.reviewTime || "09:00") < current) field("reviewTime", current);
                    }
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </details>

        <details>
          <summary>More details (optional)</summary>
          <div className="grid gap-4 py-4">
            <label>
              Short card label (optional)
              <input
                placeholder="Defaults to your decision text"
                value={d.title}
                onChange={(e) => field("title", e.target.value)}
              />
            </label>
            {!planId && decisionPlans.length > 0 && (
              <label>
                Follows a planned step
                <select
                  value={d.selectedPlan}
                  onChange={(e) => field("selectedPlan", e.target.value)}
                >
                  <option value="">New decision (not from a plan)</option>
                  {decisionPlans.map((p) => (
                    <option value={p.id} key={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label>
              Why take this decision now?
              <textarea
                rows={2}
                placeholder="e.g. My semester starts next month and I want to prepare early"
                value={d.decisionReason}
                onChange={(e) => field("decisionReason", e.target.value)}
              />
            </label>
            <label>
              Made this decision earlier? Enter its date
              <input
                type="date"
                max={localDate()}
                value={d.decidedOn}
                onChange={(e) => field("decidedOn", e.target.value)}
              />
            </label>
            {d.decidedOn && (
              <label>
                <span>
                  <input
                    type="checkbox"
                    checked={d.outcomeKnown}
                    onChange={(e) => field("outcomeKnown", e.target.checked)}
                  />{" "}
                  I already knew the outcome before recording this
                </span>
              </label>
            )}
            <details>
              <summary>Key assumptions (helps insights)</summary>
              <AssumptionBuilder />
            </details>
            <details>
              <summary>Other options considered</summary>
              <AlternativesInput />
            </details>
            <details>
              <summary>Risks & what could go wrong</summary>
              <PreMortemStep />
            </details>
            <details>
              <summary>Thinking prompts</summary>
              <AiAnalystSidebar />
            </details>
          </div>
        </details>

        {error && <p role="alert">{error}</p>}
        <button
          className="branch-primary"
          disabled={
            busy ||
            !d.choice.trim() ||
            !!(d.reviewDate && d.reviewDate < localDate()) ||
            !!(d.decidedOn && d.decidedOn > localDate()) ||
            !!(
              d.confidenceText &&
              (+d.confidenceText < 1 || +d.confidenceText > 100)
            )
          }
          onClick={() => void save()}
        >
          {busy ? "Saving…" : "Save decision"}
        </button>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <ProtectedGate>
      <Suspense>
        <Worksheet />
      </Suspense>
    </ProtectedGate>
  );
}
