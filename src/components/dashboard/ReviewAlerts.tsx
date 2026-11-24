"use client";
import { Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient";
import { useAuthStore } from "@/store/useAuthStore";
type Due = { id: string; title: string; project: { name: string } | null; reviewDate: string | null; nextReminder: string | null };
export function ReviewAlerts() {
  const user = useAuthStore((s) => s.user?.id),
    path = usePathname();
  const [rows, setRows] = useState<Due[]>([]),
    [error, setError] = useState("");
  const [available, setAvailable] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  useEffect(() => {
    const supported = window.isSecureContext && "Notification" in window && "serviceWorker" in navigator;
    setAvailable(supported);
    setEnabled(supported && Notification.permission === "granted");
  }, []);
  useEffect(() => {
    if (!user || !enabled || !rows.length) return;
    let active = true;
    async function notify() {
      await navigator.serviceWorker.register("/review-notifications.js");
      const worker = await navigator.serviceWorker.ready;
      if (!active || Notification.permission !== "granted") return;
      for (const row of rows) {
        if (!active) return;
        const key = `review-notified:${user}:${row.id}`;
        const due = row.nextReminder || row.reviewDate || "due";
        if (localStorage.getItem(key) === due) continue;
        await worker.showNotification("Decision review due", {
          body: "Open Decision Replay to record your outcome.",
          tag: key,
          data: { path: "/decisions/" + encodeURIComponent(row.id) + "/replay" },
        });
        localStorage.setItem(key, due);
      }
    }
    void notify().catch(() => { if (active) setNotificationError("Browser notifications could not be shown."); });
    return () => { active = false; };
  }, [user, enabled, rows]);
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
  if (!user || (!rows.length && !error && !(path === "/" && available && !enabled))) return null;
  return (
    <aside
      className="branch-workspace review-alerts mb-4 print:hidden"
      aria-label="Outcome reminders"
    >
      {available && !enabled && <div className="branch-tools">
        <button type="button" className="inline-flex items-center gap-2" onClick={async () => {
          try {
            const permission = await Notification.requestPermission();
            setEnabled(permission === "granted");
            setNotificationError(permission === "denied" ? "Allow notifications in your browser’s site settings." : "");
          } catch {
            setNotificationError("Browser notifications could not be enabled.");
          }
        }}><Bell size={16} /> Enable browser reminders</button>
      </div>}
      {notificationError && <p role="status">{notificationError}</p>}
      {error && <p role="status">{error}</p>}
      {!!rows.length && (
        <details className="review-alert-panel">
          <summary className="cursor-pointer font-semibold">
            {rows.length} outcome{" "}
            {rows.length === 1 ? "review is" : "reviews are"} due
          </summary>
          <ul className="review-alert-list">
          {rows.map((r) => (
            <li className="review-alert-row" key={r.id}>
              <div className="review-alert-label">
                <strong>{r.title}</strong>
                {r.project && <small>{r.project.name}</small>}
              </div>
              <div className="branch-tools review-alert-actions">
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
            </li>
          ))}
          </ul>
        </details>
      )}
    </aside>
  );
}
