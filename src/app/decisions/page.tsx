"use client";
import { JournalArt } from "@/components/illustrations/JournalArt";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderTree, ArrowUpRight } from "lucide-react";
import { ProtectedGate } from "@/components/auth/ProtectedGate";
import { apiClient } from "@/services/apiClient";

type Group = { id: string; name: string; _count: { decisions: number } };
function Groups() {
  const [groups, setGroups] = useState<Group[]>();
  const [viewTab, setViewTab] = useState<"active" | "archived">("active");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setGroups(undefined);
    setError("");
    apiClient<Group[]>(viewTab === "archived" ? "/groups?archived=true" : "/groups")
      .then(setGroups)
      .catch((e) => setError(e.message));
  }, [viewTab]);
  return (
    <main className="branch-workspace">
      <header>
        <JournalArt kind="projects" />
        <h1>Projects</h1>

      </header>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          type="button"
          onClick={() => setViewTab("active")}
          style={{
            background: viewTab === "active" ? "hsl(var(--accent))" : "hsl(var(--muted))",
            color: viewTab === "active" ? "hsl(var(--accent-foreground))" : "inherit",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.4rem 0.85rem",
            fontWeight: 600,
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
        >
          Active groups
        </button>
        <button
          type="button"
          onClick={() => setViewTab("archived")}
          style={{
            background: viewTab === "archived" ? "hsl(var(--accent))" : "hsl(var(--muted))",
            color: viewTab === "archived" ? "hsl(var(--accent-foreground))" : "inherit",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.4rem 0.85rem",
            fontWeight: 600,
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
        >
          Archived groups
        </button>
      </div>
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
            New group
            <input
              required
              placeholder="e.g. Studio launch"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <button className="branch-primary" disabled={busy}>
            Create group
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
            : "No archived groups found."}
        </p>
      )}
      <Link href="/decisions/ledger">Search all decisions →</Link>
    </main>
  );
}
export default function Page() {
  return (
    <ProtectedGate>
      <Groups />
    </ProtectedGate>
  );
}
