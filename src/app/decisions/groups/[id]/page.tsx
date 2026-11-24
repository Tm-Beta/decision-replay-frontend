"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedGate } from "@/components/auth/ProtectedGate";
import { apiClient } from "@/services/apiClient";
import { decisionService } from "@/services/decisionService";
import type { Decision } from "@/types/decision.types";

type Entry = Decision & {
  influences: string;
  decidedOn: string | null;
  outcomeKnown: boolean | null;
  parentId: string | null;
  planId: string | null;
};
type Plan = {
  status: string;
  id: string;
  originId: string | null;
  parentPlanId: string | null;
  title: string;
  expectedOutcome: string;
};
type Group = {
  id?: string;
  name: string;
  status?: string;
  pendingRemindersCount?: number;
  decisions: Entry[];
  plans: Plan[];
};
type Node = {
  id: string;
  parent: string | null;
  title: string;
  summary: string;
  planned: boolean;
};
type Action = "plan" | "change" | "rename" | "delete" | "archive" | null;

function Workspace({ id }: { id: string }) {
  const endpoint = "/groups/" + id;
  const [group, setGroup] = useState<Group>();
  const [error, setError] = useState("");
  const [view, setView] = useState("Actual tree");
  const [action, setAction] = useState<Action>(null);
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [foldOverrides, setFoldOverrides] = useState<Record<string, boolean>>(
    {},
  );
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);

  const handleRestore = async () => {
    setBusy(true);
    setError("");
    try {
      await apiClient(endpoint + "/restore", { method: "POST" });
      setGroup(await apiClient<Group>(endpoint));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    if (action && !dialog.current?.open) dialog.current?.showModal();
  }, [action]);
  useEffect(() => {
    let active = true;
    apiClient<Group>(endpoint)
      .then((g) => {
        if (active) setGroup(g);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [endpoint]);
  if (!group) return <p role="status">{error || "Loading group…"}</p>;
  const { decisions, plans } = group;
  const recorded = new Map(
    decisions.filter((d) => d.planId).map((d) => [d.planId, d]),
  );
  const byId = new Map(decisions.map((d) => [d.id, d]));
  const planned = view === "Planned tree";
  // Keep the recorded path to each planning point, including historical roots.
  const anchors = new Set(
    decisions.filter((d) => !d.parentId).map((d) => d.id),
  );
  for (const plan of plans) {
    let origin = byId.get(plan.originId || "");
    while (origin && !origin.planId && !anchors.has(origin.id)) {
      anchors.add(origin.id);
      origin = byId.get(origin.parentId || "");
    }
  }
  const nodes: Node[] = decisions
    .filter((d) => !planned || (!d.planId && anchors.has(d.id)))
    .map((d) => ({
      id: d.id,
      parent:
        planned && d.parentId
          ? byId.get(d.parentId)?.planId || d.parentId
          : d.parentId,
      title: d.title,
      summary: planned
        ? d.expectedOutcome
        : d.outcome?.actualOutcome || d.choice,
      planned: false,
    }));
  if (planned)
    for (const p of plans)
      nodes.push({
        id: p.id,
        parent:
          p.parentPlanId || byId.get(p.originId || "")?.planId || p.originId,
        title: p.title,
        summary: p.expectedOutcome,
        planned: true,
      });
  const children = new Map<string | null, Node[]>();
  for (const node of nodes)
    children.set(node.parent, [...(children.get(node.parent) || []), node]);
  function open(next: Action, key = "") {
    setAction(next);
    setSelected(key);
    setError("");
  }
  const newUrl = "/decisions/new?group=" + id;
  function startWorksheet(parent: string, plan?: Plan) {
    const query = new URLSearchParams({ group: id, parent });
    if (plan) query.set("plan", plan.id);
    router.push("/decisions/new?" + query);
  }
  function renderNode(n: Node, depth = 0): React.ReactNode {
    const folded = foldOverrides[n.id] ?? depth >= 5;
    const entry = n.planned ? recorded.get(n.id) : byId.get(n.id);
    const plan = n.planned ? plans.find((p) => p.id === n.id) : undefined;
    const plannedParent =
      plan?.originId || recorded.get(plan?.parentPlanId || "")?.id;
    const descendants = children.get(n.id);
    return (
      <li key={n.id}>
        {descendants && !folded && (
          <ul>{descendants.map((child) => renderNode(child, depth + 1))}</ul>
        )}
        <article>
          <small>
            {entry ? (
              entry.outcome ? (
                <span style={{ color: "hsl(var(--accent))", fontWeight: 600 }}>● Outcome recorded</span>
              ) : (
                <span style={{ color: "#f59e0b", fontWeight: 600 }}>◐ Awaiting outcome</span>
              )
            ) : (
              <span style={{ color: "#a855f7", fontWeight: 600 }}>
                ○ Planned{plan?.status && plan.status !== "OPEN" ? ` · ${plan.status.toLowerCase()}` : ""}
              </span>
            )}
          </small>
          <h3>
            {entry ? (
              <Link href={"/decisions/" + entry.id}>{n.title}</Link>
            ) : (
              n.title
            )}
          </h3>
          <p>{n.summary}</p>
          {!planned && entry && entry.events.length > 0 && (
            <small>
              Latest update ·{" "}
              {entry.events[entry.events.length - 1].detail}
            </small>
          )}
          <div className="node-actions">
            {descendants && (
              <button
                onClick={() =>
                  setFoldOverrides((prev) => ({ ...prev, [n.id]: !folded }))
                }
              >
                {folded ? "Show branches" : "Fold branches"}
              </button>
            )}
            {entry && (
              <button onClick={() => startWorksheet(entry.id)}>
                + Decision
              </button>
            )}
            {plan && plan.status === "OPEN" && !entry && plannedParent && (
              <button onClick={() => startWorksheet(plannedParent, plan)}>
                Take this step
              </button>
            )}
            <button onClick={() => open("plan", n.id)}>+ Plan</button>
            {plan && !entry && (
              <select
                aria-label={"Status of " + plan.title}
                value={plan.status}
                onChange={async (e) => {
                  try {
                    await apiClient(endpoint + "/plans/" + plan.id, {
                      method: "PATCH",
                      body: JSON.stringify({ status: e.target.value }),
                    });
                    setGroup(await apiClient<Group>(endpoint));
                  } catch (err) {
                    setError((err as Error).message);
                  }
                }}
              >
                <option value="OPEN">Open</option>
                <option value="DEFERRED">Deferred</option>
                <option value="DROPPED">Dropped</option>
              </select>
            )}
            {entry && !entry.outcome && (
              <Link href={"/decisions/" + entry.id + "/replay"}>
                Record outcome
              </Link>
            )}
            {entry && (
              <button onClick={() => open("change", entry.id)}>
                Add update
              </button>
            )}
          </div>
        </article>
      </li>
    );
  }
  return (
    <section className="branch-workspace">
      <Link href="/decisions">← Decision groups</Link>
      <header>
        <h1>
          {group.name}
          {group.status === "ARCHIVED" && (
            <span style={{ fontSize: "0.9rem", marginLeft: "0.75rem", opacity: 0.7, fontWeight: 500 }}>
              (Archived)
            </span>
          )}
        </h1>
        <p>
          {decisions.length} recorded decisions · {plans.length} planned steps
          {group.status === "ARCHIVED" && " · Archived"}
        </p>
      </header>
      <div className="branch-tools">
        {decisions.length > 0 && group.status !== "ARCHIVED" && (
          <Link className="branch-primary" href={newUrl}>
            Start independent decision
          </Link>
        )}
        <button onClick={() => open("rename")}>Rename group</button>
        {group.status === "ARCHIVED" ? (
          <button onClick={handleRestore} disabled={busy}>
            Restore group
          </button>
        ) : (
          <button onClick={() => open("archive")}>Archive group</button>
        )}
        <button onClick={() => open("delete")}>Delete group</button>
      </div>
      <nav className="branch-tabs" aria-label="Group views">
        {["Actual tree", "Planned tree", "Timeline", "Report"].map((v) => (
          <button
            key={v}
            aria-pressed={view === v}
            onClick={() => {
              setView(v);
              setAction(null);
            }}
          >
            {v}
          </button>
        ))}
      </nav>
      {view === "Timeline" ? (
        <section className="branch-report">
          <h2>Decision timeline</h2>
          {!decisions.length && (
            <p>Your recorded decisions will appear here.</p>
          )}
          {decisions.map((d) => (
            <article key={d.id}>
              <small>{new Date(d.createdAt).toLocaleString()}</small>
              <h3>
                <Link href={"/decisions/" + d.id}>{d.title}</Link>
              </h3>
              <p>{d.outcome?.actualOutcome || d.choice}</p>
            </article>
          ))}
        </section>
      ) : view === "Report" ? (
        <section className="branch-report">
          <div className="branch-tools">
            <h2>Group report</h2>
            <button onClick={() => window.print()}>Print / save PDF</button>
          </div>
          {decisions.map((d) => (
            <article key={d.id}>
              <small>
                {new Date(d.createdAt).toLocaleDateString()} ·{" "}
                {d.confidence != null
                  ? d.confidence + "% initial confidence"
                  : "Confidence not recorded"}
              </small>
              <h3>{d.title}</h3>
              {d.parentId && <p>From {byId.get(d.parentId)?.title}</p>}
              {d.decidedOn && (
                <p>
                  Decided {d.decidedOn} · Recorded{" "}
                  {new Date(d.createdAt).toLocaleDateString()}
                  {d.outcomeKnown ? " after learning the outcome" : ""}
                </p>
              )}
              {JSON.parse(d.influences || "[]").map((key: string) => (
                <p key={key}>Also influenced by {byId.get(key)?.title}</p>
              ))}
              {d.planId &&
                (() => {
                  const plan = plans.find((p) => p.id === d.planId);
                  if (!plan) return null;
                  const origin =
                    byId.get(plan.originId || "")?.title ||
                    plans.find((p) => p.id === plan.parentPlanId)?.title;
                  return (
                    <p>
                      Planned from {origin} · {plan.title}. Taken from{" "}
                      {byId.get(d.parentId || "")?.title ||
                        "an independent start"}
                      .
                    </p>
                  );
                })()}
              <div className="report-columns">
                <div>
                  <strong>Expected</strong>
                  <p>{d.expectedOutcome || "No expectation recorded"}</p>
                </div>
                <div>
                  <strong>Actual</strong>
                  <p>{d.outcome?.actualOutcome || "Awaiting review"}</p>
                </div>
              </div>
              {d.outcome?.outcomeScore != null && (
                <p>Personal rating · {d.outcome.outcomeScore}/100</p>
              )}
              {d.assumptions
                .filter((a) => a.metricTarget)
                .map((a) => (
                  <p key={a.id}>
                    {a.statement} · Target {a.metricTarget} · Observed{" "}
                    {a.metricActual || "Awaiting measurement"}
                  </p>
                ))}
              {d.events.map((e) => (
                <p key={e.id}>
                  <strong>
                    {new Date(e.createdAt).toLocaleDateString()} · {e.title}
                  </strong>{" "}
                  — {e.detail}
                </p>
              ))}
              <Link href={"/decisions/" + d.id}>Open decision worksheet →</Link>
            </article>
          ))}
          {plans.length > 0 && (
            <>
              <h3>Planned steps</h3>
              {plans.map((p) => (
                <p key={p.id}>
                  <strong>{p.title}</strong> · {p.expectedOutcome} ·{" "}
                  {recorded.has(p.id) ? "Taken" : p.status.toLowerCase()}
                </p>
              ))}
            </>
          )}
          {!decisions.length && (
            <p>Your first decision will start this report.</p>
          )}
        </section>
      ) : (
        <section className="tree-canvas">
          {nodes.length ? (
            <>
              <p>
                {planned
                  ? "Original expectations and possible next steps"
                  : "Recorded choices and outcomes"}{" "}
                · Read from the bottom up
              </p>
              <div className="tree-scroll">
                <ul className="branch-tree">
                  {children.get(null)?.map((root) => renderNode(root))}
                </ul>
              </div>
            </>
          ) : (
            <div className="tree-empty">
              <h2>Start your tree</h2>
              <p>Record the first choice and what you expect to happen.</p>
              <Link className="branch-primary" href={newUrl}>
                Record first decision
              </Link>
            </div>
          )}
        </section>
      )}
      {error && !action && <p role="alert">{error}</p>}
      {action && (
        <dialog
          ref={dialog}
          onCancel={() => open(null)}
          className="branch-dialog"
          aria-label="Group action"
        >
          <form
            key={action + selected}
            onSubmit={async (e) => {
              e.preventDefault();
              if (busy) return;
              setBusy(true);
              setError("");
              const data = new FormData(e.currentTarget);
              const value = (k: string) => String(data.get(k) || "").trim();
              try {
                if (action === "delete") {
                  await apiClient(endpoint, { method: "DELETE" });
                  router.push("/decisions");
                  return;
                }
                if (action === "archive") {
                  await apiClient(endpoint + "/archive", { method: "POST" });
                }
                if (action === "change")
                  await decisionService.appendTimelineEvent(selected, {
                    eventType: value("kind")==="change"?"CONTEXT_SHIFT":"EVIDENCE_NOTE",
                    title: value("kind")==="change"?"Expectation changed":"Progress update",
                    detail: value("detail"),
                  });
                if (action === "rename")
                  await apiClient(endpoint, {
                    method: "PATCH",
                    body: JSON.stringify({ name: value("name") }),
                  });
                if (action === "plan")
                  await apiClient(endpoint + "/plans", {
                    method: "POST",
                    body: JSON.stringify({
                      title: value("name"),
                      expectedOutcome: value("detail"),
                      ...(plans.some((p) => p.id === selected)
                        ? { parentPlanId: selected }
                        : { originId: selected }),
                    }),
                  });
                setGroup(await apiClient<Group>(endpoint));
                setAction(null);
              } catch (err) {
                setError((err as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <h2>
              {
                {
                  plan: "Plan a branch",
                  rename: "Rename group",
                  archive: "Archive group?",
                  delete: "Delete group?",
                  change: "Add an update",
                }[action]
              }
            </h2>
            {selected && (
              <p>
                From{" "}
                {byId.get(selected)?.title ||
                  plans.find((p) => p.id === selected)?.title}
              </p>
            )}
            {(action === "plan" || action === "rename") && (
              <label>
                {action === "plan" ? "Planned choice" : "Group name"}
                <input
                  autoFocus
                  required
                  name="name"
                  defaultValue={action === "rename" ? group.name : ""}
                />
              </label>
            )}
            {action==="change" && <label>Update type<select name="kind"><option value="progress">Progress note</option><option value="change">Changed expectation</option></select></label>}
            {(action === "plan" || action === "change") && (
              <label>
                {action === "plan"
                  ? "Expected outcome"
                  : "What changed, and why?"}
                <textarea required minLength={3} name="detail" />
              </label>
            )}
            {action === "archive" && (
              <div style={{ display: "grid", gap: "0.5rem" }}>
                <p>
                  Archiving this group removes it from your active list while keeping all decision trees and history safe.
                </p>
                {group.pendingRemindersCount && group.pendingRemindersCount > 0 ? (
                  <p style={{ color: "#f59e0b", fontWeight: 600 }}>
                    ⚠️ This group has {group.pendingRemindersCount} pending outcome reminder(s). They will remain active and continue to notify you when due.
                  </p>
                ) : (
                  <p style={{ color: "hsl(var(--muted-foreground))" }}>
                    No pending outcome reviews in this group. You can restore this group anytime.
                  </p>
                )}
              </div>
            )}
            {action === "delete" && (
              <p>
                {decisions.length || plans.length
                  ? "This group contains history. Only empty groups can be deleted."
                  : "This empty group will be permanently deleted."}
              </p>
            )}
            {error && <p role="alert">{error}</p>}
            <div className="branch-tools">
              <button type="button" onClick={() => open(null)}>
                Cancel
              </button>
              <button
                className="branch-primary"
                disabled={
                  busy ||
                  (action === "delete" && !!(decisions.length || plans.length))
                }
              >
                {action === "delete"
                  ? "Delete group"
                  : action === "archive"
                  ? "Archive group"
                  : "Save"}
              </button>
            </div>
          </form>
        </dialog>
      )}
    </section>
  );
}
export default function Page({ params }: { params: { id: string } }) {
  return (
    <ProtectedGate>
      <Workspace key={params.id} id={params.id} />
    </ProtectedGate>
  );
}
