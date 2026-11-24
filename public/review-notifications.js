self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const path = event.notification.data?.path;
  if (typeof path !== "string" || !/^\/decisions\/[\w-]+\/replay$/.test(path)) return;
  const url = new URL(path, self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const existing = windows.find((client) => client.url === url);
    if (existing) await existing.focus();
    else await self.clients.openWindow(url);
  })());
});

self.addEventListener("push", (event) => {
  let decisionId;
  try { decisionId = event.data?.json()?.decisionId; } catch { return; }
  if (typeof decisionId !== "string" || !/^[\w-]+$/.test(decisionId)) return;
  event.waitUntil(self.registration.showNotification("Decision review due", {
    body: "Open Decision Replay to record your outcome.",
    icon: "/favicon.ico",
    tag: "review:" + decisionId,
    data: { path: "/decisions/" + decisionId + "/replay" },
  }));
});
