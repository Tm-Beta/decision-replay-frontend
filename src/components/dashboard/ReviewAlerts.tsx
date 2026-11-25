"use client";
import { BackLink } from "@/components/navigation/BackLink";
import { FloatingDetails, JournalArt } from "@/components/illustrations/JournalArt";
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
  const isInbox = path === "/notifications";
  const [loaded, setLoaded] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const subscriptionKey = user ? "review-push-enabled:" + user : "";
  const [changingPermission, setChangingPermission] = useState(false);

  useEffect(() => {
    const supported = window.isSecureContext && "Notification" in window &&
      "serviceWorker" in navigator;
    setAvailable(supported);
    const syncPermission = () => setEnabled(Boolean(
      supported && user && Notification.permission === "granted" &&
      localStorage.getItem(subscriptionKey),
    ));
    syncPermission();
    window.addEventListener("focus", syncPermission);
    return () => window.removeEventListener("focus", syncPermission);
  }, [subscriptionKey, user]);

  // Fallback in-app notification delivery when browser permission is granted (works even if PushManager service is blocked locally)
  useEffect(() => {
    if (!user || !enabled || !rows.length || Notification.permission !== "granted") return;
    let active = true;
    async function showLocal() {
      try {
        await navigator.serviceWorker.register("/review-notifications.js");
        const reg = await navigator.serviceWorker.ready;
        for (const r of rows) {
          if (!active) return;
          const seenKey = `review-notified:${user}:${r.id}`;
          const marker = r.nextReminder || r.reviewDate || "due";
          if (localStorage.getItem(seenKey) === marker) continue;
          await reg.showNotification("Decision review due", {
            body: r.title,
            icon: "/favicon.ico",
            tag: seenKey,
            data: { path: "/decisions/" + encodeURIComponent(r.id) + "/replay" },
          });
          localStorage.setItem(seenKey, marker);
        }
      } catch {}
    }
    void showLocal();
    return () => { active = false; };
  }, [user, enabled, rows]);

  async function changeBrowserReminders() {
    if (!available || !user || changingPermission) return;
    setChangingPermission(true);
    setNotificationError("");
    try {
      if (!enabled && await Notification.requestPermission() !== "granted") {
        setNotificationError(Notification.permission === "denied"
          ? "Allow notifications in your browser’s site settings."
          : "Choose Allow to receive reminders.");
        return;
      }
      await navigator.serviceWorker.register("/review-notifications.js");
      const registration = await navigator.serviceWorker.ready;
      const canPush = "PushManager" in window && Boolean(registration.pushManager);
      const current = canPush ? await registration.pushManager.getSubscription() : null;
      if (enabled) {
        if (current) {
          await apiClient("/review-push/subscription", {
            method: "DELETE", body: JSON.stringify({ endpoint: current.endpoint }),
          }).catch(() => {});
          await current.unsubscribe().catch(() => {});
        }
        localStorage.removeItem(subscriptionKey);
        setEnabled(false);
        return;
      }
      if (canPush) {
        try {
          const { publicKey } = await apiClient<{ publicKey: string }>("/review-push/key");
          const key = Uint8Array.from(atob(publicKey.replace(/-/g, "+").replace(/_/g, "/")), char => char.charCodeAt(0));
          const subscription = current ?? await registration.pushManager.subscribe({
            userVisibleOnly: true, applicationServerKey: key,
          });
          await apiClient("/review-push/subscription", { method: "POST", body: JSON.stringify(subscription.toJSON()) });
        } catch {
          // Local browser notifications still remain active when tab is open
        }
      }
      localStorage.setItem(subscriptionKey, "true");
      setEnabled(true);
    } catch (error) {
      setNotificationError(error instanceof Error ? error.message : "Could not update browser reminders.");
    } finally {
      setChangingPermission(false);
    }
  }

  useEffect(() => {
    let active = true,
      request = 0;
    setRows([]);
    setLoaded(false);
    setError("");
    if (!user) return;
    async function refresh() {
      const current = ++request;
      try {
        const data = await apiClient<Due[]>("/decisions/due-reviews");
        if (active && current === request) {
          setRows(data);
          setLoaded(true);
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
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("reviews-changed", refresh);
    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("reviews-changed", refresh);
    };
  }, [user]);
  if (!user || (!isInbox && (path !== "/" || (!rows.length && !error)))) return null;
  return (
    <aside
      className="branch-workspace review-alerts mb-4 print:hidden illustrated-area"
      aria-label="Outcome reminders"
    >
      {isInbox && <FloatingDetails kind="notifications" />}
      {isInbox && <BackLink href="/">Home</BackLink>}
      {isInbox && <header className="collection-heading"><h1>Notifications</h1><JournalArt kind="notifications" reaction={rows.length ? "due" : "resting"} /></header>}
      {isInbox && !available && <p>Browser reminders are unavailable here. Due reviews still appear below.</p>}
      {isInbox && available && <div className="branch-tools">
        <button type="button" className="inline-flex items-center gap-2"
          disabled={changingPermission} onClick={changeBrowserReminders}>
          <Bell size={16} /> {changingPermission ? "Updating…" : enabled ? "Turn off browser reminders" : "Enable browser reminders"}
        </button>
        {enabled && <span role="status">Browser reminders are on</span>}
      </div>}
      {notificationError && <p role="status">{notificationError}</p>}
      {error && <p role="status">{error}</p>}
      {(isInbox || !!rows.length) && (
        <details className="review-alert-panel" open={isInbox || undefined}>
          <summary className="cursor-pointer font-semibold">
            {isInbox && !loaded ? "Outcome reviews" : <>{rows.length} outcome{" "}
            {rows.length === 1 ? "review is" : "reviews are"} due</>}
          </summary>
          {!rows.length && !error && <p className="mt-2 text-sm">{loaded ? "No reviews are due." : "Checking reminders…"}</p>}
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
