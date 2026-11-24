"use client";
import { BackLink } from "@/components/navigation/BackLink";
import { FloatingDetails, JournalArt } from "@/components/illustrations/JournalArt";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FolderTree, ArrowUpRight, NotebookPen, Plus } from "lucide-react";
import { ProtectedGate } from "@/components/auth/ProtectedGate";
import type { Decision } from "@/types/decision.types";
import { decisionService } from "@/services/decisionService";
import { apiClient } from "@/services/apiClient";

type Group = { id: string; name: string; _count: { decisions: number } };
function Groups() {
  const [groups, setGroups] = useState<Group[]>();
  const view = useSearchParams().get("view");
  const viewTab = view === "individual" || view === "archived" ? view : "active";
  const [individual, setIndividual] = useState<Decision[]>();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setGroups(undefined);
    setError("");
    setIndividual(undefined);
    let active = true;
    const request = viewTab === "individual"
      ? decisionService.listDecisions().then(result => {
          if (active) setIndividual(result.data.filter(decision => !decision.projectId));
        })
      : apiClient<Group[]>(viewTab === "archived" ? "/groups?archived=true" : "/groups")
          .then(result => { if (active) setGroups(result); });
    request.catch((error: Error) => { if (active) setError(error.message); });
    return () => { active = false; };
  }, [viewTab]);
  return (
    <div className="branch-workspace illustrated-area"><FloatingDetails kind="projects" />
      <BackLink href="/">Home</BackLink>
      <header className="collection-heading">
        <h1>Collections</h1>
        <JournalArt kind="projects" reaction={busy ? "thinking" : name.trim() || viewTab === "archived" ? "sorting" : "idle"} />

      </header>
      <nav className="branch-tabs collection-views" aria-label="Decision views">
        <Link href="/decisions" aria-current={viewTab === "active" ? "page" : undefined}>Collections</Link>
        <Link href="/decisions?view=individual" aria-current={viewTab === "individual" ? "page" : undefined}>Individual decisions</Link>
        <Link href="/decisions?view=archived" aria-current={viewTab === "archived" ? "page" : undefined}>Archived</Link>
      </nav>
      {viewTab === "individual" && (
        <section className="branch-report">
          <div className="journal-section-heading">
            <h2>Individual decisions</h2>
            <Link href="/decisions/new?from=individual"><Plus size={16} /> New decision</Link>
          </div>
          {!individual && !error && <p role="status">Loading decisions…</p>}
          {individual?.length === 0 && <p>No individual decisions yet.</p>}
          {individual?.map(decision => (
            <Link className="journal-row" key={decision.id} href={"/decisions/" + decision.id}>
              <NotebookPen size={17} />
              <div><strong>{decision.title}</strong><small>{decision.outcome ? "Outcome recorded" : "Awaiting outcome"}</small></div>
              <ArrowUpRight size={15} />
            </Link>
          ))}
        </section>
      )}
      {viewTab === "active" && (
        <form
          className="branch-toolbar"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!name.trim() || busy) return;
            setBusy(true);
            setError("");
            try {
              const group = await apiClient<Group>("/groups", {
                method: "POST",
                body: JSON.stringify({ name }),
              });
              router.push("/decisions/groups/" + group.id);
            } catch (e) {
              setError((e as Error).message);
              setBusy(false);
            }
          }}
        >
          <label>
            New collection
            <input
              required
              placeholder="e.g. Studio launch"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <button className="branch-primary" disabled={busy}>
            Create collection
          </button>
        </form>
      )}
      {error && <p role="alert">{error}</p>}
      <div className="group-grid">
        {groups?.map((g) => (
          <Link
            className="group-tile"
            key={g.id}
            href={"/decisions/groups/" + g.id}
          >
            <FolderTree size={20} />
            <h2>{g.name}</h2>
            <span>{g._count.decisions} decisions</span>
            <ArrowUpRight size={16} />
          </Link>
        ))}
      </div>
      {groups?.length === 0 && (
        <p>
          {viewTab === "active"
            ? "Create your first group above to start a decision tree."
            : "No archived collections found."}
        </p>
      )}
      <Link href="/decisions/ledger">Search all decisions →</Link>
    </div>
  );
}
export default function Page() {
  return (
    <ProtectedGate>
      <Suspense fallback={<p role="status">Loading decisions…</p>}><Groups /></Suspense>
    </ProtectedGate>
  );
}
