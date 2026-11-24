"use client";
import Link from "next/link";
import { Plus, Settings2, GitBranch, CalendarDays, BarChart3, Route } from "lucide-react";
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
type Action = "editDecision" | "deleteDecision" | "plan" | "change" | "rename" | "delete" | "archive" | null;

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
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [fullScreen, setFullScreen] = useState(false);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(timer); }, []);
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const drag = useRef<{x:number;y:number;left:number;top:number}|null>(null);

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
  const visibleIds = new Set(nodes.map(node => node.id));
  for (const node of nodes) {
    const parent = node.parent && visibleIds.has(node.parent) ? node.parent : null;
    const siblings = children.get(parent);
    if (siblings) siblings.push(node);
    else children.set(parent, [node]);
  }
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
        <article className={"tree-node " + (entry?.outcome ? "done" : n.planned ? "planned" : "waiting")}>
          <button className="tree-node-title" onClick={() => setActiveNode(activeNode === n.id ? null : n.id)} aria-expanded={activeNode === n.id}>{n.title}</button>
          {entry && !entry.outcome && <small>{entry.nextReminder || entry.reviewDate ? (() => { const minutes = Math.ceil((new Date(entry.nextReminder || entry.reviewDate!).getTime() - now) / 60000); return minutes <= 0 ? "Outcome due" : minutes < 60 ? `Due in ${minutes} min` : minutes < 1440 ? `Due in ${Math.ceil(minutes / 60)} hr` : `Due in ${Math.ceil(minutes / 1440)} days`; })() : "Awaiting outcome · no reminder"}</small>}
          {entry?.outcome && <small>Outcome recorded</small>}
          {plan && !entry && <small>Planned · {plan.status.toLowerCase()}</small>}
          <button className="tree-add" aria-label={planned ? "Plan a next step from " + n.title : "Add a decision after " + n.title} onClick={() => planned ? open("plan", n.id) : entry && startWorksheet(entry.id)}>+</button>
          {activeNode === n.id && <div className="tree-details">
            <p>{n.summary || "No details recorded yet."}</p>
            {entry && <Link href={"/decisions/" + entry.id}>Open worksheet</Link>}
            {entry && <button onClick={()=>open("editDecision",entry.id)}>Edit decision</button>}
            {entry && <button onClick={()=>open("deleteDecision",entry.id)}>Delete decision</button>}
            {entry && !entry.outcome && <Link href={"/decisions/" + entry.id + "/replay"}>Record what happened</Link>}
            {entry && <button onClick={() => open("change", entry.id)}>Add a progress note</button>}
            {entry && <button onClick={() => open("plan", n.id)}>Plan a possible next step</button>}
            {plan && plan.status === "OPEN" && !entry && plannedParent && <button onClick={() => startWorksheet(plannedParent, plan)}>Record this decision</button>}
            {plan && !entry && <select aria-label={"Status of " + plan.title} value={plan.status} onChange={async e => { try { await apiClient(endpoint + "/plans/" + plan.id, {method:"PATCH",body:JSON.stringify({status:e.target.value})}); setGroup(await apiClient<Group>(endpoint)); } catch(err) { setError((err as Error).message); } }}><option value="OPEN">Open</option><option value="DEFERRED">Deferred</option><option value="DROPPED">Dropped</option></select>}
            {descendants && <button onClick={() => setFoldOverrides(prev => ({...prev, [n.id]: !folded}))}>{folded ? "Show branches" : "Hide branches"}</button>}
          </div>}
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
            <Plus size={15} /> New decision
          </Link>
        )}
        <details className="project-settings"><summary><Settings2 size={15} /> Project settings</summary>
        <button onClick={() => open("rename")}>Rename</button>
        {group.status === "ARCHIVED" ? (
          <button onClick={handleRestore} disabled={busy}>
            Restore group
          </button>
        ) : (
          <button onClick={() => open("archive")}>Archive group</button>
        )}
        <button onClick={() => open("delete")}>Delete project</button></details>
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
            {v === "Actual tree" ? <GitBranch size={15} /> : v === "Planned tree" ? <Route size={15} /> : v === "Timeline" ? <CalendarDays size={15} /> : <BarChart3 size={15} />}
            {v === "Actual tree" ? "Tree" : v === "Planned tree" ? "Plans" : v}
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
            <h2>Group report</h2><div className="report-stats"><div><strong>{decisions.length}</strong><span>Decisions</span></div><div><strong>{decisions.filter(d => d.outcome).length}</strong><span>Outcomes recorded</span></div><div><strong>{decisions.filter(d => !d.outcome).length}</strong><span>Awaiting outcome</span></div><div><strong>{plans.filter(p => p.status === "OPEN" && !recorded.has(p.id)).length}</strong><span>Open plans</span></div></div><div className="report-bar" role="img" aria-label={`${decisions.filter(d => d.outcome).length} of ${decisions.length} outcomes recorded`}><span style={{width: decisions.length ? `${100 * decisions.filter(d => d.outcome).length / decisions.length}%` : "0%"}} /></div>
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
                  <strong>Current expectation</strong>
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
        <section className={"tree-canvas " + (fullScreen ? "tree-fullscreen" : "")}>
          <div className="tree-canvas-head"><span>{planned ? "Your possible next steps" : "Your decisions"}</span><div className="sheet-controls"><button onClick={() => sheet.current?.scrollTo({top:0,behavior:"smooth"})}>↑ Newest branches</button><button onClick={() => sheet.current?.scrollTo({top:sheet.current.scrollHeight,behavior:"smooth"})}>↓ Starting decisions</button><button onClick={() => setFullScreen(!fullScreen)}>{fullScreen ? "Exit full screen" : "Full screen"}</button></div></div>
          {nodes.length ? (
            <>
              <p>
                {planned
                  ? "Original expectations and possible next steps"
                  : "Recorded choices and outcomes"}{" "}
                · Read from the bottom up
              </p>
              <div className="tree-scroll" ref={sheet} onPointerDown={e=>{if(e.button!==0 || (e.target as HTMLElement).closest("button,a,select,input,textarea")) return; drag.current={x:e.clientX,y:e.clientY,left:e.currentTarget.scrollLeft,top:e.currentTarget.scrollTop};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{if(!drag.current)return;e.currentTarget.scrollLeft=drag.current.left-(e.clientX-drag.current.x);e.currentTarget.scrollTop=drag.current.top-(e.clientY-drag.current.y);}} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>
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
                if(action === "editDecision") await apiClient("/decisions/"+selected+"/details",{method:"PATCH",body:JSON.stringify({title:value("name"),choice:value("choice"),expectedOutcome:value("expectedOutcome"),decisionReason:value("decisionReason"),beliefRationale:value("beliefRationale"),confidence:value("confidence") ? Number(value("confidence")) : null,reviewDate:value("reviewDate") ? new Date(value("reviewDate")).toISOString() : null})});
                if(action === "deleteDecision") await apiClient("/decisions/"+selected,{method:"DELETE"});
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
                  editDecision: "Edit decision",
                  deleteDecision: "Delete decision?",
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
            {(action === "plan" || action === "rename" || action === "editDecision") && (
              <label>
                {action === "plan" ? "Planned choice" : action === "editDecision" ? "Decision name" : "Group name"}
                <input
                  autoFocus
                  required
                  name="name"
                  defaultValue={action === "rename" ? group.name : action === "editDecision" ? byId.get(selected)?.title : ""}
                />
              </label>
            )}
            {action === "editDecision" && (()=>{const d=byId.get(selected);if(!d)return null;const date=d.reviewDate?new Date(new Date(d.reviewDate).getTime()-new Date(d.reviewDate).getTimezoneOffset()*60000).toISOString().slice(0,16):"";return <><p>The original record stays in the history. Your changes will be dated.</p><label>What did you decide?<textarea name="choice" required defaultValue={d.choice}/></label><label>Expected outcome<textarea name="expectedOutcome" defaultValue={d.expectedOutcome}/></label><label>Why did you decide this?<textarea name="decisionReason" defaultValue={d.decisionReason||""}/></label><label>What supports this choice?<textarea name="beliefRationale" defaultValue={d.beliefRationale||""}/></label><label>Confidence (optional)<input name="confidence" type="number" min="1" max="100" defaultValue={d.confidence??""}/></label><label>Outcome reminder (optional)<input name="reviewDate" type="datetime-local" defaultValue={date}/></label></>})()}
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
            {action === "deleteDecision" && <p>This permanently deletes this decision and its outcome and notes. Its next decisions will connect to {byId.get(selected)?.parentId ? "its parent decision" : "the group as independent starting decisions"}.</p>}
            {action === "delete" && (
              <p>
                This permanently deletes this group, its {decisions.length} decisions, {plans.length} planned steps, outcomes and reminders.
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
                  busy
                }
              >
                {action === "deleteDecision" ? "Delete decision" : action === "delete"
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
