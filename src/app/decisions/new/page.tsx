"use client";
import { BackLink } from "@/components/navigation/BackLink";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ProtectedGate } from "@/components/auth/ProtectedGate";
import { AssumptionBuilder } from "@/components/decision-form/AssumptionBuilder";
import { AlternativesInput } from "@/components/decision-form/AlternativesInput";
import { PreMortemStep } from "@/components/decision-form/PreMortemStep";
import { AiAnalystSidebar } from "@/components/decision-form/AiAnalystSidebar";
import { useDecisionDraftStore } from "@/store/useDecisionDraftStore";
import { useAuthStore } from "@/store/useAuthStore";
import { apiClient } from "@/services/apiClient";
import { decisionService } from "@/services/decisionService";

type Group = {
  name: string;
  decisions: { id: string; title: string; parentId?: string | null }[];
  plans: {
    id: string;
    title: string;
    expectedOutcome: string;
    status: string;
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
    planId = (projectId && params.get("plan")) || undefined;
  const [placementKey, setPlacementKey] = useState<string>();
  const [parentOverride, setParentOverride] = useState<{ key: string; id: string }>();
  const key = JSON.stringify([user, projectId, parentId, planId]);
  const targetParent = parentOverride?.key === key ? parentOverride.id || undefined : parentId;
  const [group, setGroup] = useState<Group>(),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!projectId) {
      useDecisionDraftStore.getState().switchBranch(key, { reviewDate: "" });
      setGroup({ name: "Decision journal", decisions: [], plans: [] });
      return;
    }
    let active = true;
    apiClient<Group>("/groups/" + projectId)
      .then((g) => {
        if (!active) return;
        const plan = g.plans.find((p) => p.id === planId);
        if (
          (parentId && !g.decisions.some((x) => x.id === parentId)) ||
          (planId && (!plan || plan.status !== "OPEN"))
        ) {
          router.replace("/decisions/groups/" + projectId);
          return;
        }
        useDecisionDraftStore
          .getState()
          .switchBranch(key, {
            reviewDate: localDate(7),
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
  }, [key, projectId, parentId, planId, router]);
  if (!group || d.branchKey !== key)
    return <p>{error || "Loading worksheet…"}</p>;
  const field = d.setField;
  async function save() {
    if (!d.choice.trim() || busy) return;
    const reminder = d.reviewDate ? new Date(d.reviewDate + "T" + (d.reviewTime || "09:00")) : null;
    if (reminder && (!Number.isFinite(reminder.getTime()) || reminder.getTime() < Math.floor(Date.now()/60000)*60000)) {
      setError("Choose the current time or a later time for your reminder.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await decisionService.createDecision({
        projectId: projectId ?? undefined,
        parentId: targetParent,
        planId: planId || d.selectedPlan || undefined,
        title: d.title.trim() || d.choice.trim().slice(0, 100),
        choice: d.choice.trim(),
        context: "",
        decisionReason: d.decisionReason,
        beliefRationale: d.beliefRationale,
        expectedOutcome: d.expectedOutcome.trim(),
        confidence: d.confidenceText ? Number(d.confidenceText) : null,
        reviewDate: reminder?.toISOString(),
        decidedOn: d.decidedOn || undefined,
        outcomeKnown: d.decidedOn ? d.outcomeKnown : undefined,
        influences: d.influences,
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
  const needsPlacement = Boolean(projectId && group.decisions.length);
  if (needsPlacement && placementKey === key) {
    const ids = new Set(group.decisions.map(decision => decision.id));
    const branches = new Map<string | null, Group["decisions"]>();
    for (const decision of group.decisions) {
      const parent = decision.parentId && ids.has(decision.parentId) ? decision.parentId : null;
      const siblings = branches.get(parent);
      if (siblings) siblings.push(decision);
      else branches.set(parent, [decision]);
    }
    function renderBranch(decision: Group["decisions"][number]): React.ReactNode {
      const children = branches.get(decision.id);
      return <li key={decision.id}>
        {children && <ul>{children.map(renderBranch)}</ul>}
        <button type="button" aria-pressed={targetParent === decision.id}
          className="placement-node"
          onClick={() => setParentOverride({ key, id: decision.id })}>{decision.title}</button>
      </li>;
    }

    return <section className="branch-workspace">
      <div className="branch-tools">
        <BackLink disabled={busy} onClick={() => setPlacementKey(undefined)}>Decision details</BackLink>
      </div>
      <header><h1>Place in tree</h1><p>Choose the decision this follows.</p></header>
      <div className="tree-canvas">
        <div className="tree-scroll placement-scroll" tabIndex={0} aria-label="Choose a branch in the project tree">
          <ul className="branch-tree">{branches.get(null)?.map(renderBranch)}</ul>
        </div>
      </div>
      <div className="branch-tools">
        <button type="button" aria-pressed={!targetParent}
          onClick={() => setParentOverride({ key, id: "" })}>Start a separate branch</button>
        <span aria-live="polite">{targetParent ? "After " + group.decisions.find(decision => decision.id === targetParent)?.title : "Separate branch"}</span>
        <button type="button" className="branch-primary" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save decision"}</button>
      </div>
      {error && <p role="alert">{error}</p>}
    </section>;
  }
  return (
    <section className="branch-workspace decision-simple">
      <BackLink href={projectId ? "/decisions/groups/" + projectId : journalUrl}>{projectId ? group.name : "Journal"}</BackLink>
      <header>
        <h1>New decision</h1>
      </header>
      <div className="branch-report">
        <label>
          What did you decide?
          <textarea
            autoFocus
            value={d.choice}
            onChange={(e) => field("choice", e.target.value)}
          />
        </label>
        <label>
          What do you expect? (optional)
          <textarea
            value={d.expectedOutcome}
            onChange={(e) => field("expectedOutcome", e.target.value)}
          />
        </label>
        <details>
          <summary>Outcome reminder · {d.reviewDate || "Off"}</summary>
          <div className="grid gap-3 pt-3">
        <label>
          Remind me to record the outcome
          <input
            type="date"
            min={localDate()}
            value={d.reviewDate}
            onChange={(e) => field("reviewDate", e.target.value)}
          />
        </label>
        {d.reviewDate && <label>Reminder time ({Intl.DateTimeFormat().resolvedOptions().timeZone})
          <input type="time" required value={d.reviewTime || "09:00"} onChange={e=>field("reviewTime", e.target.value)}/>
        </label>}
        <div className="branch-tools">
          {[
            ["Today", 0],
            ["In a week", 7],
            ["No reminder", -1],
          ].map(([name, days]) => (
            <button
              key={name}
              onClick={() => {
                field("reviewDate", Number(days)<0 ? "" : localDate(Number(days)));
                if (Number(days)===0) {
                  const now = new Date();
                  const current = [now.getHours(),now.getMinutes()].map(n=>String(n).padStart(2,"0")).join(":");
                  if ((d.reviewTime || "09:00") < current) field("reviewTime",current);
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
          <summary>More options</summary>
          <div className="grid gap-4 py-4">
            {!planId &&
              group.plans.some(
                (p) =>
                  p.status === "OPEN" &&
                  !group.decisions.some(
                    (x) => (x as { planId?: string }).planId === p.id,
                  ),
              ) && (
                <label>
                  Follows an earlier plan
                  <select
                    value={d.selectedPlan}
                    onChange={(e) => field("selectedPlan", e.target.value)}
                  >
                    <option value="">New direction</option>
                    {group.plans
                      .filter(
                        (p) =>
                          p.status === "OPEN" &&
                          !group.decisions.some(
                            (x) => (x as { planId?: string }).planId === p.id,
                          ),
                      )
                      .map((p) => (
                        <option value={p.id} key={p.id}>
                          {p.title}
                        </option>
                      ))}
                  </select>
                </label>
              )}
            <label>
              Why now?
              <textarea
                value={d.decisionReason}
                onChange={(e) => field("decisionReason", e.target.value)}
              />
            </label>
            <label>
              Confidence (optional, 1–100)
              <input
                type="number"
                min="1"
                max="100"
                value={d.confidenceText}
                onChange={(e) => field("confidenceText", e.target.value)}
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
                  I already know the outcome
                </span>
              </label>
            )}
            {group.decisions.some((x) => x.id !== targetParent) && (
              <details>
                <summary>Other decisions that influenced this</summary>
                {group.decisions
                  .filter((x) => x.id !== targetParent)
                  .map((x) => (
                    <label key={x.id}>
                      <span>
                        <input
                          type="checkbox"
                          checked={d.influences.includes(x.id)}
                          onChange={(e) =>
                            field(
                              "influences",
                              e.target.checked
                                ? [...d.influences, x.id]
                                : d.influences.filter((i) => i !== x.id),
                            )
                          }
                        />{" "}
                        {x.title}
                      </span>
                    </label>
                  ))}
              </details>
            )}
            <details><summary>Assumptions</summary><AssumptionBuilder /></details>
            <details><summary>Other options</summary><AlternativesInput /></details>
            <details><summary>Risks</summary><PreMortemStep /></details>
            <details>
              <summary>Reflection prompts</summary>
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
          onClick={() => {
            if (needsPlacement) { setError(""); setPlacementKey(key); window.scrollTo(0, 0); }
            else void save();
          }}
        >
          {busy ? "Saving…" : needsPlacement ? "Next →" : "Save decision"}
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
