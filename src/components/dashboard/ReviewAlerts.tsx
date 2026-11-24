"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient";
import { useAuthStore } from "@/store/useAuthStore";
type Due = { id: string; title: string; project: { name: string } | null };
export function ReviewAlerts() {
  const user = useAuthStore((s) => s.user?.id),
    path = usePathname();
  const [rows, setRows] = useState<Due[]>([]),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true,
      request = 0;
    setRows([]);
    setError("");
    if (!user) return;
    async function refresh() {
      const current = ++request;
      try {
        const data = await apiClient<Due[]>("/decisions/due-reviews");
        if (active && current === request) {
          setRows(data);
          setError("");
        }
      } catch {
        if (active && current === request)
          setError("Could not check review reminders.");
      }
    }
    void refresh();
    const interval = setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    window.addEventListener("reviews-changed", refresh);
    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("reviews-changed", refresh);
    };
  }, [user, path]);
  if (!user || (!rows.length && !error)) return null;
  return (
    <aside
      className="branch-workspace mb-4 print:hidden"
      aria-label="Outcome reminders"
    >
      {error && <p role="status">{error}</p>}
      {!!rows.length && (
        <details className="branch-report">
          <summary className="cursor-pointer font-semibold">
            {rows.length} outcome{" "}
            {rows.length === 1 ? "review is" : "reviews are"} due
          </summary>
          {rows.map((r) => (
            <div className="branch-tools" key={r.id}>
              <strong>{r.title}</strong>
              <span>{r.project?.name}</span>
              <Link
                className="branch-primary"
                href={"/decisions/" + r.id + "/replay"}
              >
                Record outcome
              </Link>
              <button
                onClick={async () => {
                  const next = new Date();
                  next.setDate(next.getDate() + 7);
                  next.setSeconds(0, 0);
                  try {
                    await apiClient("/decisions/" + r.id + "/reminder", {
                      method: "PATCH",
                      body: JSON.stringify({
                        nextReminder: next.toISOString(),
                      }),
                    });
                    setRows((prev) => prev.filter((x) => x.id !== r.id));
                    window.dispatchEvent(new Event("reviews-changed"));
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              >
                Remind me in a week
              </button>
            </div>
          ))}
        </details>
      )}
    </aside>
  );
}
