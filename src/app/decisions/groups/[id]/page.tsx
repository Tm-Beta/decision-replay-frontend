"use client";
import { BackLink } from "@/components/navigation/BackLink";
import Link from "next/link";
import { ProjectAnalysis } from "@/components/reports/ProjectAnalysis";
import {
  DecisionGraphCanvas,
  DecisionSymbol,
  OutcomeSymbol,
} from "@/components/graph/DecisionGraphCanvas";
import type { GraphEdge, GraphNode } from "@/components/graph/graphLayout";
import {
  Plus,
  Settings2,
  GitBranch,
  CalendarDays,
  BarChart3,
  Route,
  Link2,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedGate } from "@/components/auth/ProtectedGate";
import { ApiError, apiClient } from "@/services/apiClient";
import { decisionService } from "@/services/decisionService";
import type { Decision, GraphLink, OutcomeBranch } from "@/types/decision.types";

type Entry = Decision & {
  influences: string;
  decidedOn: string | null;
  outcomeKnown: boolean | null;
  parentId: string | null;
  planId: string | null;
  outcomeBranches?: OutcomeBranch[];
};

type Plan = {
  status: string;
  nodeType?: "DECISION" | "OUTCOME";
  joinRule?: "ANY" | "ALL";
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
  outcomeBranches?: OutcomeBranch[];
  graphLinks?: GraphLink[];
};

type Action =
  | "addOutcome"
  | "editOutcome"
  | "deleteOutcome"
  | "promoteOutcome"
  | "editPlan"
  | "deletePlan"
  | "editDecision"
  | "deleteDecision"
  | "plan"
  | "change"
  | "rename"
  | "delete"
  | "archive"
  | null;

function Workspace({ id }: { id: string }) {
  const endpoint = "/groups/" + id;
  const [group, setGroup] = useState<Group>();
  const [error, setError] = useState("");
  const [view, setView] = useState("Actual tree");
  const [action, setAction] = useState<Action>(null);
  const [selected, setSelected] = useState("");
  const [planNodeType, setPlanNodeType] = useState<"DECISION" | "OUTCOME">("DECISION");
  const [planParents, setPlanParents] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [selectedGraphKey, setSelectedGraphKey] = useState<string | null>(null);
  const [connectFromKey, setConnectFromKey] = useState<string | null>(null);
  const [fullScreen, setFullScreen] = useState(false);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);

  const refreshGroup = async () => {
    setGroup(await apiClient<Group>(endpoint));
  };

  const handleRestore = async () => {
    setBusy(true);
    setError("");
    try {
      await apiClient(endpoint + "/restore", { method: "POST" });
      await refreshGroup();
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

  if (!group) return <p role="status">{error || "Loading collection…"}</p>;

  const decisions = group.decisions;
  const plans = group.plans;
  const outcomeBranches = group.outcomeBranches ?? [];
  const rawLinks = group.graphLinks ?? [];

  const recorded = new Map(decisions.filter((d) => d.planId).map((d) => [d.planId!, d]));
  const recordedOutcomes = new Map(outcomeBranches.filter((ob) => ob.planId).map((ob) => [ob.planId!, ob]));
  const plansById = new Map(plans.map((p) => [p.id, p]));
  const byId = new Map(decisions.map((d) => [d.id, d]));
  const outcomeById = new Map(outcomeBranches.map((o) => [o.id, o]));
  const planned = view === "Planned tree";

  function open(next: Action, key = "", defaultParents: string[] = [], defaultType: "DECISION" | "OUTCOME" = "DECISION") {
    setAction(next);
    setSelected(key);
    setPlanParents(defaultParents);
    setPlanNodeType(defaultType);
    setError("");
  }

  const newUrl = "/decisions/new?group=" + id;
  function startWorksheet(opts?: { parent?: string; outcome?: string; plan?: Plan }) {
    const query = new URLSearchParams({ group: id });
    if (opts?.parent) query.set("parent", opts.parent);
    if (opts?.outcome) query.set("outcome", opts.outcome);
    if (opts?.plan) query.set("plan", opts.plan.id);
    router.push("/decisions/new?" + query);
  }

  function findStartingDecision(plan: Plan): string | undefined {
    const visited = new Set<string>();
    let current: Plan | undefined = plan;
    while (current && !visited.has(current.id)) {
      visited.add(current.id);
      if (current.originId && byId.has(current.originId)) return current.originId;
      if (!current.parentPlanId) break;
      const parentDecision = recorded.get(current.parentPlanId);
      if (parentDecision) return parentDecision.id;
      current = plansById.get(current.parentPlanId);
    }
    return undefined;
  }

  function formatDue(d: Entry) {
    if (d.outcome || d.outcomeBranches?.length) return "Outcome recorded";
    if (!d.nextReminder && !d.reviewDate) return "Awaiting outcome";
    const minutes = Math.ceil((new Date(d.nextReminder || d.reviewDate!).getTime() - now) / 60000);
    if (minutes <= 0) return "Outcome due";
    if (minutes < 60) return `Due in ${minutes} min`;
    if (minutes < 1440) return `Due in ${Math.ceil(minutes / 60)} hr`;
    return `Due in ${Math.ceil(minutes / 1440)} days`;
  }

  function isDue(d: Entry) {
    if (d.outcome || d.outcomeBranches?.length || (!d.nextReminder && !d.reviewDate)) return false;
    return new Date(d.nextReminder || d.reviewDate!).getTime() <= now;
  }

  // ---- Build Nodes & Edges for Graph Canvas ----
  const graphNodes: GraphNode[] = [];
  const graphEdges: GraphEdge[] = [];

  // Map promoted planId -> real DECISION or OUTCOME key for unified Plans graph rendering
  const resolvePlanKey = (planId: string) => {
    const rec = recorded.get(planId);
    if (rec) return `DECISION:${rec.id}`;
    const ob = recordedOutcomes.get(planId);
    if (ob) return `OUTCOME:${ob.id}`;
    return `PLAN:${planId}`;
  };

  if (!planned) {
    // ACTUAL TREE: Decisions + Real Outcome Branches
    for (const d of decisions) {
      const due = isDue(d);
      const hasOutcome = Boolean(d.outcome || d.outcomeBranches?.length);
      graphNodes.push({
        key: `DECISION:${d.id}`,
        id: d.id,
        rawType: "DECISION",
        kind: "DECISION",
        planned: false,
        joinRule: d.joinRule ?? "ANY",
        title: d.title,
        subtitle: d.expectedOutcome || d.choice,
        statusLabel: formatDue(d),
        tone: hasOutcome ? "done" : due ? "due" : "waiting",
      });
    }
    for (const ob of outcomeBranches) {
      graphNodes.push({
        key: `OUTCOME:${ob.id}`,
        id: ob.id,
        rawType: "OUTCOME",
        kind: "OUTCOME",
        planned: false,
        title: ob.title,
        subtitle: ob.detail && ob.detail !== ob.title ? ob.detail : "",
        statusLabel: ob.isPrimary ? "Outcome" : "Observed outcome",
        tone: "outcome",
      });
    }

    const edgeSet = new Set<string>();
    const pushEdge = (edge: GraphEdge) => {
      const k = `${edge.fromKey}->${edge.toKey}`;
      if (edgeSet.has(k)) return;
      edgeSet.add(k);
      graphEdges.push(edge);
    };

    for (const link of rawLinks) {
      if (link.fromType === "PLAN" || link.toType === "PLAN") continue;
      pushEdge({
        id: link.id,
        fromKey: `${link.fromType}:${link.fromId}`,
        toKey: `${link.toType}:${link.toId}`,
        planned: false,
        kind: link.toType === "OUTCOME" ? "outcome" : "decision",
      });
    }
    // Legacy fallback if GraphLink doesn't cover parentId/influences/outcomeBranches
    for (const ob of outcomeBranches) {
      pushEdge({
        fromKey: `DECISION:${ob.decisionId}`,
        toKey: `OUTCOME:${ob.id}`,
        planned: false,
        kind: "outcome",
      });
    }
    for (const d of decisions) {
      const hasExplicitIncoming = rawLinks.some(
        (l) => l.toType === "DECISION" && l.toId === d.id && l.fromType !== "PLAN",
      );
      if (!hasExplicitIncoming && d.parentId && byId.has(d.parentId)) {
        pushEdge({
          fromKey: `DECISION:${d.parentId}`,
          toKey: `DECISION:${d.id}`,
          planned: false,
          kind: "decision",
        });
      }
      try {
        const infs = JSON.parse(d.influences || "[]");
        if (Array.isArray(infs)) {
          for (const inf of infs) {
            if (byId.has(inf)) {
              pushEdge({
                fromKey: `DECISION:${inf}`,
                toKey: `DECISION:${d.id}`,
                planned: false,
                kind: "decision",
              });
            }
          }
        }
      } catch {}
    }
  } else {
    // PLANS VIEW: Show Decisions + Real Outcomes + Unrecorded Planned Decisions & Planned Outcomes
    for (const d of decisions) {
      graphNodes.push({
        key: `DECISION:${d.id}`,
        id: d.id,
        rawType: "DECISION",
        kind: "DECISION",
        planned: false,
        joinRule: d.joinRule ?? "ANY",
        title: d.title,
        subtitle: d.expectedOutcome || d.choice,
        statusLabel: "Recorded",
        tone: d.outcome || d.outcomeBranches?.length ? "done" : "waiting",
      });
    }
    for (const ob of outcomeBranches) {
      graphNodes.push({
        key: `OUTCOME:${ob.id}`,
        id: ob.id,
        rawType: "OUTCOME",
        kind: "OUTCOME",
        planned: false,
        title: ob.title,
        subtitle: ob.detail && ob.detail !== ob.title ? ob.detail : "",
        statusLabel: "Recorded outcome",
        tone: "outcome",
      });
    }
    for (const p of plans) {
      if (recorded.has(p.id) || recordedOutcomes.has(p.id)) continue; // Represented by recorded Decision or Outcome
      const isOut = (p.nodeType ?? "DECISION") === "OUTCOME";
      graphNodes.push({
        key: `PLAN:${p.id}`,
        id: p.id,
        rawType: "PLAN",
        kind: isOut ? "OUTCOME" : "DECISION",
        planned: true,
        joinRule: p.joinRule ?? "ANY",
        title: p.title,
        subtitle: p.expectedOutcome,
        statusLabel: isOut
          ? p.status === "OPEN"
            ? "Possible outcome"
            : `Outcome · ${p.status.toLowerCase()}`
          : `Planned · ${p.status.toLowerCase()}`,
        tone: isOut ? "outcome-planned" : "planned",
      });
    }

    const edgeSet = new Set<string>();
    const pushEdge = (edge: GraphEdge) => {
      if (edge.fromKey === edge.toKey) return;
      const k = `${edge.fromKey}->${edge.toKey}`;
      if (edgeSet.has(k)) return;
      edgeSet.add(k);
      graphEdges.push(edge);
    };

    for (const link of rawLinks) {
      const fromKey =
        link.fromType === "PLAN"
          ? resolvePlanKey(link.fromId)
          : `${link.fromType}:${link.fromId}`;
      const toKey =
        link.toType === "PLAN"
          ? resolvePlanKey(link.toId)
          : `${link.toType}:${link.toId}`;
      const toNode = graphNodes.find((n) => n.key === toKey);
      pushEdge({
        id: link.id,
        fromKey,
        toKey,
        planned: link.fromType === "PLAN" || link.toType === "PLAN",
        kind: toNode?.kind === "OUTCOME" ? "outcome" : "decision",
      });
    }
    for (const ob of outcomeBranches) {
      pushEdge({
        fromKey: `DECISION:${ob.decisionId}`,
        toKey: `OUTCOME:${ob.id}`,
        planned: false,
        kind: "outcome",
      });
    }
    for (const p of plans) {
      if (recorded.has(p.id)) continue;
      const toKey = `PLAN:${p.id}`;
      const hasLink = rawLinks.some((l) => l.toType === "PLAN" && l.toId === p.id);
      if (!hasLink) {
        if (p.parentPlanId) {
          pushEdge({
            fromKey: resolvePlanKey(p.parentPlanId),
            toKey,
            planned: true,
            kind: (p.nodeType ?? "DECISION") === "OUTCOME" ? "outcome" : "decision",
          });
        } else if (p.originId && byId.has(p.originId)) {
          pushEdge({
            fromKey: `DECISION:${p.originId}`,
            toKey,
            planned: true,
            kind: (p.nodeType ?? "DECISION") === "OUTCOME" ? "outcome" : "decision",
          });
        }
      }
    }
  }

  const nodeTitleByKey = new Map(graphNodes.map((n) => [n.key, n.title]));

  async function handleCompleteConnect(fromKey: string, toKey: string) {
    const [fromType, ...fromRest] = fromKey.split(":");
    const [toType, ...toRest] = toKey.split(":");
    setConnectFromKey(null);
    setError("");
    try {
      await apiClient(endpoint + "/links", {
        method: "POST",
        body: JSON.stringify({
          fromType,
          fromId: fromRest.join(":"),
          toType,
          toId: toRest.join(":"),
        }),
      });
      await refreshGroup();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleRemoveEdge(edge: GraphEdge) {
    setError("");
    try {
      if (edge.id) {
        await apiClient(endpoint + "/links/" + edge.id, { method: "DELETE" });
      } else {
        const [fromType, ...fromRest] = edge.fromKey.split(":");
        const [toType, ...toRest] = edge.toKey.split(":");
        await apiClient(endpoint + "/unlink", {
          method: "POST",
          body: JSON.stringify({
            fromType,
            fromId: fromRest.join(":"),
            toType,
            toId: toRest.join(":"),
          }),
        });
      }
      await refreshGroup();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function handleDeleteNode(node: GraphNode) {
    if (node.rawType === "DECISION") open("deleteDecision", node.id);
    else if (node.rawType === "OUTCOME") {
      const ob = outcomeById.get(node.id);
      if (ob && !ob.isPrimary) open("deleteOutcome", node.id);
    } else if (node.rawType === "PLAN") {
      open("deletePlan", node.id);
    }
  }

  async function handleToggleJoinRule(node: GraphNode) {
    if (node.rawType !== "DECISION" && node.rawType !== "PLAN") return;
    const nextRule = node.joinRule === "ALL" ? "ANY" : "ALL";
    setError("");
    try {
      await apiClient(`${endpoint}/nodes/${node.rawType}/${node.id}/join-rule`, {
        method: "PATCH",
        body: JSON.stringify({ joinRule: nextRule }),
      });
      await refreshGroup();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function handleQuickAddDecisionFromNode(node: GraphNode) {
    if (!planned) {
      if (node.rawType === "DECISION") {
        startWorksheet({ parent: node.id });
      } else if (node.rawType === "OUTCOME") {
        startWorksheet({ outcome: node.id });
      }
    } else {
      open("plan", node.key, [node.key], "DECISION");
    }
  }

  function handleQuickAddOutcomeFromNode(node: GraphNode) {
    if (!planned) {
      if (node.rawType === "DECISION") {
        open("addOutcome", node.id);
      }
    } else {
      open("plan", node.key, [node.key], "OUTCOME");
    }
  }

  // ---- Node Inspector Content ----
  function renderInspector(node: GraphNode) {
    const incoming = graphEdges.filter((e) => e.toKey === node.key);
    const outgoing = graphEdges.filter((e) => e.fromKey === node.key);

    const decision = node.rawType === "DECISION" ? byId.get(node.id) : undefined;
    const outcomeBranch = node.rawType === "OUTCOME" ? outcomeById.get(node.id) : undefined;
    const plan = node.rawType === "PLAN" ? plansById.get(node.id) : undefined;

    return (
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-bold">{node.title}</h3>
          {node.subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{node.subtitle}</p>
          )}
        </div>

        {incoming.length > 0 && (
          <div className="graph-inspector-links">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Comes from ({incoming.length})
            </span>
            {incoming.map((e) => (
              <div className="graph-link-chip" key={e.fromKey}>
                <button
                  type="button"
                  onClick={() => setSelectedGraphKey(e.fromKey)}
                  className="text-left truncate flex-1 !p-0 !text-foreground"
                >
                  {nodeTitleByKey.get(e.fromKey) || "Previous step"}
                </button>
                <button
                  type="button"
                  title="Remove connection"
                  aria-label="Remove connection"
                  onClick={() => void handleRemoveEdge(e)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {outgoing.length > 0 && (
          <div className="graph-inspector-links">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Leads to ({outgoing.length})
            </span>
            {outgoing.map((e) => (
              <div className="graph-link-chip" key={e.toKey}>
                <button
                  type="button"
                  onClick={() => setSelectedGraphKey(e.toKey)}
                  className="text-left truncate flex-1 !p-0 !text-foreground"
                >
                  {nodeTitleByKey.get(e.toKey) || "Next step"}
                </button>
                <button
                  type="button"
                  title="Remove connection"
                  aria-label="Remove connection"
                  onClick={() => void handleRemoveEdge(e)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {incoming.length >= 2 && node.kind === "DECISION" && (
          <div className="p-2.5 rounded-xl border border-border/60 bg-background/40 space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground block">
              Convergence rule ({incoming.length} paths)
            </span>
            <button
              type="button"
              onClick={() => void handleToggleJoinRule(node)}
              className="w-full text-left text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border bg-secondary/40 hover:bg-secondary/70 transition flex items-center justify-between"
            >
              <span>
                {node.joinRule === "ALL"
                  ? "ALL paths required (AND)"
                  : "ANY single path works (OR)"}
              </span>
              <span className="text-[10px] text-primary">Switch</span>
            </button>
          </div>
        )}

        <div className="graph-inspector-actions">
          {/* ACTUAL DECISION ACTIONS */}
          {decision && (
            <>
              {!decision.outcome && (
                <Link
                  className={decision.outcomeBranches?.length ? "" : "primary-action"}
                  href={`/decisions/${decision.id}/replay`}
                >
                  <ArrowRight size={14} />{" "}
                  {decision.outcomeBranches?.length
                    ? "Complete full replay reflection"
                    : "Record full outcome"}
                </Link>
              )}
              <button type="button" onClick={() => open("addOutcome", decision.id)}>
                <Plus size={14} /> Add outcome to graph
              </button>
              <button type="button" onClick={() => startWorksheet({ parent: decision.id })}>
                <Plus size={14} /> Add next decision
              </button>
              <button
                type="button"
                onClick={() => {
                  setConnectFromKey(node.key);
                }}
              >
                <Link2 size={14} /> Connect to another node
              </button>
              <Link href={"/decisions/" + decision.id}>Open worksheet</Link>
              <Link href={"/dna?decision=" + encodeURIComponent(decision.id)}>Ask AI about this</Link>
              {decision.outcome && (
                <Link href={`/decisions/${decision.id}/replay`}>View replay comparison</Link>
              )}
              <button type="button" onClick={() => open("change", decision.id)}>
                Add progress note
              </button>
              <button type="button" onClick={() => open("editDecision", decision.id)}>
                Edit decision
              </button>
              <button type="button" onClick={() => open("deleteDecision", decision.id)}>
                <Trash2 size={14} /> Delete decision
              </button>
            </>
          )}

          {/* ACTUAL OUTCOME BRANCH ACTIONS */}
          {outcomeBranch && (
            <>
              <button
                type="button"
                className="primary-action"
                onClick={() => startWorksheet({ outcome: outcomeBranch.id })}
              >
                <Plus size={14} /> Add decision from this outcome
              </button>
              <button
                type="button"
                onClick={() => setConnectFromKey(node.key)}
              >
                <Link2 size={14} /> Connect to existing decision
              </button>
              <button type="button" onClick={() => open("editOutcome", outcomeBranch.id)}>
                Edit outcome
              </button>
              {!outcomeBranch.isPrimary ? (
                <button type="button" onClick={() => open("deleteOutcome", outcomeBranch.id)}>
                  <Trash2 size={14} /> Delete outcome
                </button>
              ) : (
                <Link href={`/decisions/${outcomeBranch.decisionId}/replay`}>
                  View full outcome replay
                </Link>
              )}
            </>
          )}

          {/* PLANNED NODE ACTIONS (Decision or Possible Outcome) */}
          {plan && (
            <>
              {(plan.nodeType ?? "DECISION") === "DECISION" ? (
                <>
                  {plan.status === "OPEN" && (
                    <button
                      type="button"
                      className="primary-action"
                      onClick={() =>
                        startWorksheet({ parent: findStartingDecision(plan), plan })
                      }
                    >
                      <ArrowRight size={14} /> Move to Tree (Record decision)
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => open("plan", node.key, [node.key], "OUTCOME")}
                  >
                    <Plus size={14} /> Add possible outcome
                  </button>
                  <button
                    type="button"
                    onClick={() => open("plan", node.key, [node.key], "DECISION")}
                  >
                    <Plus size={14} /> Plan next decision
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="primary-action"
                    onClick={() => open("plan", node.key, [node.key], "DECISION")}
                  >
                    <Plus size={14} /> Plan decision if this happens
                  </button>
                  {decisions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => open("promoteOutcome", plan.id)}
                    >
                      <ArrowRight size={14} /> Move to Tree (Happened)
                    </button>
                  )}
                </>
              )}

              <button type="button" onClick={() => setConnectFromKey(node.key)}>
                <Link2 size={14} /> Connect to another node
              </button>

              <select
                aria-label={"Status of " + plan.title}
                value={plan.status}
                onChange={async (e) => {
                  try {
                    await apiClient(endpoint + "/plans/" + plan.id, {
                      method: "PATCH",
                      body: JSON.stringify({ status: e.target.value }),
                    });
                    await refreshGroup();
                  } catch (err) {
                    setError((err as Error).message);
                  }
                }}
              >
                <option value="OPEN">Status: Open</option>
                <option value="DEFERRED">Status: Deferred</option>
                <option value="DROPPED">Status: Dropped</option>
              </select>

              <button type="button" onClick={() => open("editPlan", plan.id)}>
                Edit
              </button>
              <button type="button" onClick={() => open("deletePlan", plan.id)}>
                <Trash2 size={14} /> Delete
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Available parents when creating a Plan or Outcome inside modal
  const allPlanParents = [
    ...decisions.map((d) => ({ key: `DECISION:${d.id}`, title: d.title, kind: "Decision" })),
    ...outcomeBranches.map((o) => ({ key: `OUTCOME:${o.id}`, title: o.title, kind: "Outcome" })),
    ...plans
      .filter((p) => !recorded.has(p.id))
      .map((p) => ({
        key: `PLAN:${p.id}`,
        title: p.title,
        kind: (p.nodeType ?? "DECISION") === "OUTCOME" ? "Possible outcome" : "Planned decision",
      })),
  ];

  return (
    <section className="branch-workspace">
      <BackLink href="/decisions">Collections</BackLink>
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
          {decisions.length} decisions · {outcomeBranches.length} outcomes ·{" "}
          {plans.filter((p) => !recorded.has(p.id)).length} planned items
          {group.status === "ARCHIVED" && " · Archived"}
        </p>
      </header>

      <div className="branch-tools">
        {group.status !== "ARCHIVED" && (
          <Link className="branch-primary" href={newUrl}>
            <Plus size={15} /> New decision
          </Link>
        )}
        <details className="project-settings">
          <summary>
            <Settings2 size={15} /> Collection settings
          </summary>
          <button onClick={() => open("rename")}>Rename</button>
          {group.status === "ARCHIVED" ? (
            <button onClick={handleRestore} disabled={busy}>
              Restore collection
            </button>
          ) : (
            <button onClick={() => open("archive")}>Archive collection</button>
          )}
          <button onClick={() => open("delete")}>Delete collection</button>
        </details>
      </div>

      <nav className="branch-tabs" aria-label="Collection views">
        {["Actual tree", "Planned tree", "Timeline", "Report"].map((v) => (
          <button
            key={v}
            aria-pressed={view === v}
            onClick={() => {
              setView(v);
              setAction(null);
              setSelectedGraphKey(null);
              setConnectFromKey(null);
            }}
          >
            {v === "Actual tree" ? (
              <GitBranch size={15} />
            ) : v === "Planned tree" ? (
              <Route size={15} />
            ) : v === "Timeline" ? (
              <CalendarDays size={15} />
            ) : (
              <BarChart3 size={15} />
            )}
            {v === "Actual tree" ? "Tree" : v === "Planned tree" ? "Plans" : v}
          </button>
        ))}
      </nav>

      {view === "Timeline" ? (
        <section className="branch-report">
          <h2>Decision timeline</h2>
          {!decisions.length && <p>Your recorded decisions will appear here.</p>}
          {decisions.map((d) => (
            <article key={d.id}>
              <small>{new Date(d.createdAt).toLocaleString()}</small>
              <h3>
                <Link href={"/decisions/" + d.id}>{d.title}</Link>
              </h3>
              <p>{d.outcome?.actualOutcome || d.choice}</p>
              {(d.outcomeBranches?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {d.outcomeBranches!.map((ob) => (
                    <span key={ob.id} className="legend-pill outcome">
                      <OutcomeSymbol /> {ob.title}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </section>
      ) : view === "Report" ? (
        <section className="branch-report">
          <div className="branch-tools">
            <h2>Collection report</h2>
            <button onClick={() => window.print()}>Print / save PDF</button>
          </div>
          <ProjectAnalysis
            decisions={decisions}
            now={now}
            openPlans={plans.filter((p) => p.status === "OPEN" && !recorded.has(p.id)).length}
            totalOutcomes={outcomeBranches.length}
          />
          {!!decisions.length && <h3>Decision records</h3>}
          {decisions.map((d) => {
            const incomingLinks = rawLinks.filter(
              (l) => l.toType === "DECISION" && l.toId === d.id,
            );
            const fromLabels = incomingLinks
              .map((l) =>
                l.fromType === "DECISION"
                  ? byId.get(l.fromId)?.title
                  : l.fromType === "OUTCOME"
                    ? `Outcome: ${outcomeById.get(l.fromId)?.title}`
                    : undefined,
              )
              .filter(Boolean);

            return (
              <article key={d.id}>
                <small>
                  {new Date(d.createdAt).toLocaleDateString()} ·{" "}
                  {d.confidence != null
                    ? d.confidence + "% initial confidence"
                    : "Confidence not recorded"}
                </small>
                <h3>{d.title}</h3>
                {fromLabels.length > 0 ? (
                  <p>From: {fromLabels.join(" + ")}</p>
                ) : (
                  d.parentId && <p>From {byId.get(d.parentId)?.title}</p>
                )}
                <div className="report-columns">
                  <div>
                    <strong>Expected</strong>
                    <p>{d.expectedOutcome || "No expectation recorded"}</p>
                  </div>
                  <div>
                    <strong>Actual outcome(s)</strong>
                    {d.outcomeBranches?.length ? (
                      <ul className="list-disc pl-4 space-y-1">
                        {d.outcomeBranches.map((ob) => (
                          <li key={ob.id}>
                            <strong>{ob.title}</strong>
                            {ob.detail && ob.detail !== ob.title ? ` — ${ob.detail}` : ""}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>{d.outcome?.actualOutcome || "Awaiting review"}</p>
                    )}
                  </div>
                </div>
                {d.outcome?.outcomeScore != null && (
                  <p>Outcome rating · {d.outcome.outcomeScore}/100</p>
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
            );
          })}
          {plans.length > 0 && (
            <>
              <h3>Planned decisions & scenarios</h3>
              {plans.map((p) => (
                <p key={p.id}>
                  <strong>
                    {(p.nodeType ?? "DECISION") === "OUTCOME" ? "🔶 Outcome: " : "🟩 Decision: "}
                    {p.title}
                  </strong>{" "}
                  {p.expectedOutcome ? `· ${p.expectedOutcome} ` : ""}·{" "}
                  {recorded.has(p.id) ? "Moved to Tree" : p.status.toLowerCase()}
                </p>
              ))}
            </>
          )}
          {!decisions.length && <p>Your first decision will start this report.</p>}
        </section>
      ) : (
        <DecisionGraphCanvas
          title={planned ? "Scenario Plans" : "Decision & Outcome Flow"}
          subtitle={
            planned
              ? "Plan decisions and possible outcomes (If X happens → do Y). Drag cards to arrange, scroll to zoom."
              : "Your real decisions and outcomes growing bottom-up. Drag cards to arrange, scroll to zoom."
          }
          storageKey={`graph-pos:${id}:${planned ? "plans" : "tree"}`}
          nodes={graphNodes}
          edges={graphEdges}
          planned={planned}
          fullScreen={fullScreen}
          onToggleFullScreen={() => setFullScreen(!fullScreen)}
          selectedKey={selectedGraphKey}
          onSelectNode={setSelectedGraphKey}
          connectFromKey={connectFromKey}
          onStartConnect={setConnectFromKey}
          onCompleteConnect={handleCompleteConnect}
          onRemoveEdge={handleRemoveEdge}
          onDeleteNode={handleDeleteNode}
          onToggleJoinRule={handleToggleJoinRule}
          onQuickAddDecisionFromNode={handleQuickAddDecisionFromNode}
          onQuickAddOutcomeFromNode={handleQuickAddOutcomeFromNode}
          onAddRootDecision={() =>
            planned
              ? open("plan", "", [], "DECISION")
              : router.push(newUrl)
          }
          onAddOutcomeQuick={() =>
            planned
              ? open("plan", "", selectedGraphKey ? [selectedGraphKey] : [], "OUTCOME")
              : open(
                  "addOutcome",
                  selectedGraphKey?.startsWith("DECISION:")
                    ? selectedGraphKey.replace("DECISION:", "")
                    : decisions[decisions.length - 1]?.id || "",
                )
          }
          renderInspector={renderInspector}
          emptyState={
            <div className="tree-empty">
              <h2>{planned ? "Start planning scenarios" : "Start your decision flow"}</h2>
              <p>
                {planned
                  ? "Map out a decision and its possible outcomes before you act."
                  : "Record your first decision and track its outcomes."}
              </p>
              {planned ? (
                <button
                  type="button"
                  className="branch-primary"
                  onClick={() => open("plan", "", [], "DECISION")}
                >
                  Plan first decision
                </button>
              ) : (
                <Link className="branch-primary" href={newUrl}>
                  Record first decision
                </Link>
              )}
            </div>
          }
        />
      )}

      {error && !action && <p role="alert">{error}</p>}

      {action && (
        <dialog
          ref={dialog}
          onCancel={() => open(null)}
          className="branch-dialog"
          aria-label="Collection action"
        >
          <form
            key={action + selected + planNodeType}
            onSubmit={async (e) => {
              e.preventDefault();
              if (busy) return;
              setBusy(true);
              setError("");
              const data = new FormData(e.currentTarget);
              const value = (k: string) => String(data.get(k) || "").trim();
              try {
                if (action === "addOutcome") {
                  await apiClient(endpoint + "/outcomes", {
                    method: "POST",
                    body: JSON.stringify({
                      decisionId: value("decisionId") || selected,
                      title: value("name"),
                      detail: value("detail"),
                    }),
                  });
                }
                if (action === "editOutcome") {
                  await apiClient(endpoint + "/outcomes/" + selected, {
                    method: "PATCH",
                    body: JSON.stringify({
                      title: value("name"),
                      detail: value("detail"),
                    }),
                  });
                }
                if (action === "deleteOutcome") {
                  await apiClient(endpoint + "/outcomes/" + selected, { method: "DELETE" });
                  setSelectedGraphKey(null);
                }
                if (action === "promoteOutcome") {
                  const p = plansById.get(selected);
                  if (p) {
                    await apiClient(endpoint + "/plans/" + p.id + "/promote-outcome", {
                      method: "POST",
                      body: JSON.stringify({
                        decisionId: value("decisionId"),
                      }),
                    });
                  }
                }
                if (action === "editPlan") {
                  await apiClient(endpoint + "/plans/" + selected, {
                    method: "PATCH",
                    body: JSON.stringify({
                      title: value("name"),
                      expectedOutcome: value("detail"),
                    }),
                  });
                }
                if (action === "deletePlan") {
                  await apiClient(endpoint + "/plans/" + selected, { method: "DELETE" });
                  setSelectedGraphKey(null);
                }
                if (action === "editDecision") {
                  await apiClient("/decisions/" + selected + "/details", {
                    method: "PATCH",
                    body: JSON.stringify({
                      title: value("name"),
                      choice: value("choice"),
                      expectedOutcome: value("expectedOutcome"),
                      decisionReason: value("decisionReason"),
                      beliefRationale: value("beliefRationale"),
                      confidence: value("confidence") ? Number(value("confidence")) : null,
                      reviewDate: value("reviewDate")
                        ? new Date(value("reviewDate")).toISOString()
                        : null,
                    }),
                  });
                }
                if (action === "deleteDecision") {
                  try {
                    await apiClient("/decisions/" + selected, { method: "DELETE" });
                    setSelectedGraphKey(null);
                  } catch (err) {
                    if (!(err instanceof ApiError) || err.status !== 404) throw err;
                  }
                }
                if (action === "delete") {
                  await apiClient(endpoint, { method: "DELETE" });
                  router.push("/decisions");
                  return;
                }
                if (action === "archive") {
                  await apiClient(endpoint + "/archive", { method: "POST" });
                }
                if (action === "change") {
                  await decisionService.appendTimelineEvent(selected, {
                    eventType: value("kind") === "change" ? "CONTEXT_SHIFT" : "EVIDENCE_NOTE",
                    title: value("kind") === "change" ? "Expectation changed" : "Progress update",
                    detail: value("detail"),
                  });
                }
                if (action === "rename") {
                  await apiClient(endpoint, {
                    method: "PATCH",
                    body: JSON.stringify({ name: value("name") }),
                  });
                }
                if (action === "plan") {
                  const parentNodes = planParents.map((k) => {
                    const [type, ...rest] = k.split(":");
                    return { type, id: rest.join(":") };
                  });
                  await apiClient(endpoint + "/plans", {
                    method: "POST",
                    body: JSON.stringify({
                      nodeType: planNodeType,
                      title: value("name"),
                      expectedOutcome: value("detail"),
                      parentNodes,
                    }),
                  });
                }
                await refreshGroup();
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
                  addOutcome: "Add outcome to decision",
                  editOutcome: "Edit outcome",
                  deleteOutcome: "Delete outcome?",
                  promoteOutcome: "Record planned outcome in Tree",
                  editPlan: "Edit planned item",
                  deletePlan: "Delete planned item?",
                  editDecision: "Edit decision",
                  deleteDecision: "Delete decision?",
                  plan:
                    planNodeType === "OUTCOME"
                      ? "Add possible outcome"
                      : "Plan a decision",
                  rename: "Rename collection",
                  archive: "Archive collection?",
                  delete: "Delete collection?",
                  change: "Add an update",
                }[action]
              }
            </h2>

            {action === "plan" && (
              <div className="branch-tabs" role="group" aria-label="Node type">
                <button
                  type="button"
                  aria-pressed={planNodeType === "DECISION"}
                  onClick={() => setPlanNodeType("DECISION")}
                >
                  <DecisionSymbol planned /> Planned Decision
                </button>
                <button
                  type="button"
                  aria-pressed={planNodeType === "OUTCOME"}
                  onClick={() => setPlanNodeType("OUTCOME")}
                >
                  <OutcomeSymbol planned /> Possible Outcome
                </button>
              </div>
            )}

            {action === "addOutcome" && (
              <>
                {!decisions.length ? (
                  <p>Record a decision first before adding outcomes.</p>
                ) : (
                  <>
                    <label>
                      Decision
                      <select name="decisionId" defaultValue={selected || decisions[0]?.id}>
                        {decisions.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      What happened? (short label)
                      <input
                        autoFocus
                        required
                        name="name"
                        placeholder="e.g. Got A/B grades, or Sales doubled"
                      />
                    </label>
                    <label>
                      Details (optional)
                      <textarea
                        name="detail"
                        placeholder="Any notes about this result..."
                      />
                    </label>
                  </>
                )}
              </>
            )}

            {action === "editOutcome" && (
              <>
                <label>
                  Outcome
                  <input
                    autoFocus
                    required
                    name="name"
                    defaultValue={outcomeById.get(selected)?.title}
                  />
                </label>
                <label>
                  Details (optional)
                  <textarea
                    name="detail"
                    defaultValue={outcomeById.get(selected)?.detail}
                  />
                </label>
              </>
            )}

            {action === "promoteOutcome" && (() => {
              const planObj = plansById.get(selected);
              const linkedDecisionId =
                rawLinks.find(
                  (l) =>
                    l.toType === "PLAN" &&
                    l.toId === selected &&
                    l.fromType === "DECISION",
                )?.fromId ||
                (planObj ? findStartingDecision(planObj) : undefined) ||
                decisions[0]?.id;
              return (
                <label>
                  Which decision in the Tree produced “{planObj?.title}”?
                  <select name="decisionId" defaultValue={linkedDecisionId}>
                    {decisions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title}
                      </option>
                    ))}
                  </select>
                </label>
              );
            })()}

            {(action === "plan" || action === "rename" || action === "editDecision") && (
              <label>
                {action === "plan"
                  ? planNodeType === "OUTCOME"
                    ? "Possible outcome (e.g. Grade A/B, Grade C)"
                    : "Planned decision (e.g. Apply to Top Uni)"
                  : action === "editDecision"
                    ? "Decision name"
                    : "Collection name"}
                <input
                  autoFocus
                  required
                  name="name"
                  defaultValue={
                    action === "rename"
                      ? group.name
                      : action === "editDecision"
                        ? byId.get(selected)?.title
                        : ""
                  }
                />
              </label>
            )}

            {action === "plan" && (
              <>
                <label>
                  {planNodeType === "OUTCOME" ? "Notes (optional)" : "What do you expect? (optional)"}
                  <textarea name="detail" rows={2} />
                </label>
                {allPlanParents.length > 0 && (
                  <details open={planParents.length > 0}>
                    <summary>
                      Follows from ({planParents.length || "Independent start"})
                    </summary>
                    <div className="parent-chip-list">
                      {allPlanParents.map((item) => (
                        <label className="parent-chip-item" key={item.key}>
                          <input
                            type="checkbox"
                            checked={planParents.includes(item.key)}
                            onChange={() =>
                              setPlanParents((prev) =>
                                prev.includes(item.key)
                                  ? prev.filter((k) => k !== item.key)
                                  : [...prev, item.key],
                              )
                            }
                          />
                          <span>
                            <strong>{item.title}</strong>{" "}
                            <small>({item.kind})</small>
                          </span>
                        </label>
                      ))}
                    </div>
                  </details>
                )}
              </>
            )}

            {action === "editDecision" &&
              (() => {
                const d = byId.get(selected);
                if (!d) return null;
                const date = d.reviewDate
                  ? new Date(
                      new Date(d.reviewDate).getTime() -
                        new Date(d.reviewDate).getTimezoneOffset() * 60000,
                    )
                      .toISOString()
                      .slice(0, 16)
                  : "";
                return (
                  <>
                    <p>Original record stays in history. Your edits will be dated.</p>
                    <label>
                      What did you decide?
                      <textarea name="choice" required defaultValue={d.choice} />
                    </label>
                    <label>
                      Expected outcome
                      <textarea name="expectedOutcome" defaultValue={d.expectedOutcome} />
                    </label>
                    <label>
                      Why now?
                      <textarea name="decisionReason" defaultValue={d.decisionReason || ""} />
                    </label>
                    <label>
                      Confidence (optional)
                      <input
                        name="confidence"
                        type="number"
                        min="1"
                        max="100"
                        defaultValue={d.confidence ?? ""}
                      />
                    </label>
                    <label>
                      Outcome reminder (optional)
                      <input name="reviewDate" type="datetime-local" defaultValue={date} />
                    </label>
                  </>
                );
              })()}

            {action === "change" && (
              <>
                <label>
                  Update type
                  <select name="kind">
                    <option value="progress">Progress note</option>
                    <option value="change">Changed expectation</option>
                  </select>
                </label>
                <label>
                  What changed, and why?
                  <textarea required minLength={3} name="detail" />
                </label>
              </>
            )}

            {action === "archive" && (
              <div style={{ display: "grid", gap: "0.5rem" }}>
                <p>
                  Archiving removes this collection from your active list while keeping all decision graphs and history safe.
                </p>
                {group.pendingRemindersCount && group.pendingRemindersCount > 0 ? (
                  <p style={{ color: "#f59e0b", fontWeight: 600 }}>
                    ⚠️ This collection has {group.pendingRemindersCount} pending outcome reminder(s).
                  </p>
                ) : null}
              </div>
            )}

            {action === "editPlan" && (
              <>
                <label>
                  Title
                  <input
                    name="name"
                    required
                    defaultValue={plans.find((p) => p.id === selected)?.title}
                  />
                </label>
                <label>
                  Expectation / Notes
                  <textarea
                    name="detail"
                    defaultValue={plans.find((p) => p.id === selected)?.expectedOutcome}
                  />
                </label>
              </>
            )}

            {action === "deleteOutcome" && (
              <p>This permanently deletes this outcome node and its graph connections.</p>
            )}
            {action === "deletePlan" && (
              <p>This permanently deletes this planned item from your scenario map.</p>
            )}
            {action === "deleteDecision" && (
              <p>This permanently deletes this decision, its outcome, and notes.</p>
            )}
            {action === "delete" && (
              <p>
                This permanently deletes this collection, its {decisions.length} decisions, and{" "}
                {plans.length} planned items.
              </p>
            )}

            {error && <p role="alert">{error}</p>}
            <div className="branch-tools">
              <button type="button" onClick={() => open(null)}>
                Cancel
              </button>
              <button
                className="branch-primary"
                disabled={busy || (action === "addOutcome" && !decisions.length)}
              >
                {action === "deletePlan" ||
                action === "deleteDecision" ||
                action === "deleteOutcome" ||
                action === "delete"
                  ? "Delete"
                  : action === "archive"
                    ? "Archive"
                    : action === "promoteOutcome"
                      ? "Move to Tree"
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
