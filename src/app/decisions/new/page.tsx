"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import GroupPage from "../page";
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
  decisions: { id: string; title: string }[];
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
  const projectId = params.get("group"),
    parentId = params.get("parent") || undefined,
    planId = params.get("plan") || undefined;
  const key = JSON.stringify([user, projectId, parentId, planId]);
  const [group, setGroup] = useState<Group>(),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!projectId) return;
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
  if (!projectId) return <GroupPage />;
  if (!group || d.branchKey !== key)
    return <p>{error || "Loading worksheet…"}</p>;
  const field = d.setField;
  async function save() {
    if (!d.choice.trim() || busy || !projectId) return;
    const reminder = d.reviewDate ? new Date(d.reviewDate + "T" + (d.reviewTime || "09:00")) : null;
    if (reminder && (!Number.isFinite(reminder.getTime()) || reminder.getTime() < Math.floor(Date.now()/60000)*60000)) {
      setError("Choose the current time or a later time for your reminder.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await decisionService.createDecision({
        projectId,
        parentId,
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
      router.push("/decisions/groups/" + projectId);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <section className="branch-workspace">
      <Link href={"/decisions/groups/" + projectId}>← {group.name}</Link>
      <header>
        <h1>Decision worksheet</h1>
        {parentId && (
          <p>
            Following {group.decisions.find((x) => x.id === parentId)?.title}
          </p>
        )}
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
        <details>
          <summary>Add details</summary>
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
            {group.decisions.some((x) => x.id !== parentId) && (
              <details>
                <summary>Other decisions that influenced this</summary>
                {group.decisions
                  .filter((x) => x.id !== parentId)
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
            <AssumptionBuilder />
            <AlternativesInput />
            <PreMortemStep />
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
          onClick={save}
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
