"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BarChart3, Folder, Plus } from "lucide-react";
import { AuthGate } from "@/components/auth/AuthGate";
import { FloatingDetails, JournalArt } from "@/components/illustrations/JournalArt";
import { DecisionReplayLoader } from "@/components/ui/DecisionReplayLoader";
import { apiClient } from "@/services/apiClient";
import { decisionService } from "@/services/decisionService";
import { useAuthStore } from "@/store/useAuthStore";
import type { Decision } from "@/types/decision.types";

type Project = { id: string; name: string; createdAt: string; _count: { decisions: number } };
type DashboardData = { projects: Project[]; decisions: Decision[] };

export default function DashboardPage() {
  const { isAuthenticated, isHydrated, user } = useAuthStore();
  const [data, setData] = useState<DashboardData>();
  const [error, setError] = useState("");

  const load = useCallback(async (signal?: AbortSignal) => {
    setError("");
    try {
      const [projects, journal] = await Promise.all([
        apiClient<Project[]>("/groups", { signal }),
        decisionService.listDecisions(),
      ]);
      if (!signal?.aborted) setData({ projects, decisions: journal.data });
    } catch (error) {
      if (!signal?.aborted) setError((error as Error).message);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) { setData(undefined); return; }
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [isAuthenticated, load]);

  if (!isHydrated) return <DecisionReplayLoader size="fullscreen" />;
  if (!isAuthenticated) return <AuthGate />;

  const decisions = data?.decisions ?? [];
  const individual = decisions.filter(decision => !decision.projectId);
  const completed = decisions.filter(decision => decision.outcome).length;
  const pendingDecisions = decisions.filter(decision =>
    !decision.outcome && ["LOCKED", "REVIEW_PENDING"].includes(decision.status),
  );
  const pending = pendingDecisions.length;
  const nextPending = pendingDecisions[0];
  const tracked = pending + completed;
  const projectActivity = new Map<string, number>();
  const byProject = new Map<string, number>();
  for (const decision of decisions) {
    if (decision.projectId) {
      const activity = new Date(decision.outcome?.recordedAt ?? decision.createdAt).getTime();
      projectActivity.set(decision.projectId, Math.max(projectActivity.get(decision.projectId) ?? 0, activity));
    }
    if (decision.projectId && decision.outcome)
      byProject.set(decision.projectId, (byProject.get(decision.projectId) ?? 0) + 1);
  }

  const recentProjects = [...(data?.projects ?? [])].sort((a, b) =>
    (projectActivity.get(b.id) ?? new Date(b.createdAt).getTime()) -
    (projectActivity.get(a.id) ?? new Date(a.createdAt).getTime()),
  );

  return (
    <div className="journal-dashboard branch-workspace illustrated-area"><FloatingDetails kind="journal" />
      <div className="journal-heading">
        <div>
          <h1>{user?.name ? `${user.name.split(" ")[0]}’s journal` : "Your decision journal"}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Every choice you lock in today becomes wisdom tomorrow.
          </p>
        </div>
        <Link className="branch-primary inline-flex items-center gap-2" href="/decisions/new">
          <Plus size={17} /> New decision
        </Link>
      </div>
      {error && <div className="branch-tools" role="alert"><p>{error}</p><button onClick={() => void load()}>Try again</button></div>}
      {!data && !error && <DecisionReplayLoader size="md" />}
      {data && <>
        {nextPending && (
          <div className="mb-4 rounded-2xl border border-spring-500/30 bg-spring-500/5 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-spring-500">
                Ready for reflection · {pending} awaiting outcome
              </p>
              <p className="text-sm font-medium text-foreground truncate">
                How did “{nextPending.title}” turn out?
              </p>
            </div>
            <Link
              href={`/decisions/${nextPending.id}/replay`}
              className="branch-primary !py-1.5 !px-3.5 !text-xs shrink-0 inline-flex items-center gap-1.5"
            >
              Record what happened <ArrowUpRight size={14} />
            </Link>
          </div>
        )}
        <section className="journal-overview branch-report" aria-label="Decision activity">
          <JournalArt kind="journal" reaction={tracked > 0 && completed === tracked ? "celebrating" : pending > 0 ? "due" : "idle"} />
          <div className="journal-metrics">
            <div><strong>{data.projects.length}</strong><span>Collections</span></div>
            <div><strong>{pending}</strong><span>Awaiting outcome</span></div>
            <div><strong>{completed}</strong><span>Outcomes recorded</span></div>
          </div>
          <div className="journal-progress">
            <Link href="/dna?tab=insights"><BarChart3 size={16} /> Decision insights</Link>
            {tracked > 0 && <><progress max={tracked} value={completed} aria-label="Outcomes recorded" /><small>{completed} of {tracked} outcomes recorded</small></>}
          </div>
        </section>
        <div className="journal-columns">
          <section className="branch-report">
            <div className="journal-section-heading"><h2>Recent collections</h2><Link href="/decisions">All collections <ArrowUpRight size={14} /></Link></div>
            {data.projects.length === 0 && <p>No collections yet.</p>}
            {recentProjects.slice(0, 4).map(project => <Link className="journal-row" key={project.id} href={"/decisions/groups/" + project.id}>
              <Folder size={18} /><div><strong>{project.name}</strong><small>{project._count.decisions} decisions · {byProject.get(project.id) ?? 0} {byProject.get(project.id) === 1 ? "outcome" : "outcomes"}</small></div><ArrowUpRight size={15} />
            </Link>)}
          </section>
          <section className="branch-report">
            <div className="journal-section-heading"><h2>Individual decisions</h2><Link href="/decisions/ledger">Journal <ArrowUpRight size={14} /></Link></div>
            {individual.length === 0 && <Link className="journal-row" href="/decisions/new"><Plus size={17} /> Add a decision without a collection</Link>}
            {individual.slice(0, 4).map(decision => <Link className="journal-row" key={decision.id} href={"/decisions/" + decision.id}>
              <div><strong>{decision.title}</strong><small>{decision.outcome ? "Outcome recorded" : "Awaiting outcome"}</small></div><ArrowUpRight size={15} />
            </Link>)}
          </section>
        </div>
      </>}
    </div>
  );
}
