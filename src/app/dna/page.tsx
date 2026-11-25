"use client";

import { BackLink } from "@/components/navigation/BackLink";
import { FloatingDetails, JournalArt } from "@/components/illustrations/JournalArt";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUp, MessageCircle, Sparkles, FolderOpen, Award, ShieldAlert, History, MessageSquarePlus, Trash2, X, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ProtectedGate } from "@/components/auth/ProtectedGate";
import { apiClient, ApiError } from "@/services/apiClient";
import { dnaService } from "@/services/dnaService";
import { DecisionDnaProfile, DnaDimension } from "@/types/decision.types";
import { DnaRadarChart } from "@/components/dna/DnaRadarChart";
import { MetricEvidenceModal } from "@/components/dna/MetricEvidenceModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { useAuthStore } from "@/store/useAuthStore";
import { useTheme } from "@/components/theme/ThemeProvider";

type Project = { id: string; name: string; status: string };
type Message = { id: string; role: "user" | "assistant"; content: string };
type ChatSessionItem = {
  id: string;
  title: string;
  projectId: string | null;
  updatedAt: string;
  _count?: { messages: number };
};
type HistoryResponse = {
  sessionId?: string | null;
  sessionTitle?: string | null;
  messages: Message[];
  remaining: number;
  limit: number;
};

function ThinkingSpace() {
  const { preferences } = useTheme();
  const [composerFocused, setComposerFocused] = useState(false);
  const [decisionId,setDecisionId]=useState<string>();
  useEffect(()=>{setDecisionId(new URLSearchParams(window.location.search).get("decision") || undefined)},[]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [project, setProject] = useState("");
  const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [chatSearch, setChatSearch] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const scroll = useRef<HTMLDivElement>(null);
  const [projectMenu,setProjectMenu]=useState(false);

  const refreshSessions = useCallback(() => {
    apiClient<ChatSessionItem[]>("/chat/sessions")
      .then((rows) => { if (Array.isArray(rows)) setSessions(rows); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    apiClient<Project[]>("/groups")
      .then(setProjects)
      .catch((e) => setError(e.message));
    refreshSessions();
  }, [refreshSessions]);

  const loadChat = useCallback((opts?: { sessionId?: string | null; projectId?: string }) => {
    setLoading(true);
    setError("");
    const qs = new URLSearchParams();
    if (opts?.sessionId) qs.set("sessionId", opts.sessionId);
    else if (opts?.projectId) qs.set("projectId", opts.projectId);
    const queryStr = qs.toString();
    apiClient<HistoryResponse>("/chat" + (queryStr ? "?" + queryStr : ""))
      .then((data) => {
        setMessages(data.messages);
        setRemaining(data.remaining);
        setActiveSessionId(data.sessionId ?? null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadChat({ projectId: project });
  }, [project, loadChat]);

  useEffect(() => {
    scroll.current?.scrollTo({ top: scroll.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  function startNewChat() {
    setActiveSessionId(null);
    setMessages([]);
    setHistoryOpen(false);
    setError("");
  }

  async function deleteSession(id: string) {
    try {
      await apiClient("/chat/sessions/" + id, { method: "DELETE" });
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSessionId === id) {
        setActiveSessionId(null);
        setMessages([]);
      }
    } catch {}
  }

  async function send(value = text) {
    const message = value.trim();
    if (!message || sending || loading || remaining === 0) return;
    setSending(true);
    setError("");
    setText("");
    const temp: Message = { id: "pending", role: "user", content: message };
    setMessages((prev) => [...prev, temp]);
    try {
      const result = await apiClient<{
        answer: string;
        remaining: number;
        sessionId?: string;
      }>("/chat", {
        method: "POST",
        body: JSON.stringify({
          message,
          decisionId,
          projectId: project || null,
          sessionId: activeSessionId,
        }),
      });
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== "pending"),
        { ...temp, id: crypto.randomUUID() },
        { id: crypto.randomUUID(), role: "assistant", content: result.answer },
      ]);
      if (result.sessionId) setActiveSessionId(result.sessionId);
      setRemaining(result.remaining);
      refreshSessions();
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== "pending"));
      setText(message);
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="insights-page">
      <div className="insights-chat">
        <div className="insights-chatbar">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setHistoryOpen((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                historyOpen
                  ? "border-accent bg-accent/15 text-foreground"
                  : "border-border bg-card/70 text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <History size={14} />
              <span>Previous chats</span>
              {sessions.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-secondary text-[10px] font-bold">
                  {sessions.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={startNewChat}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
            >
              <MessageSquarePlus size={14} />
              <span>New chat</span>
            </button>
            <span className="chat-credit-count">{remaining === null ? "—" : remaining} credits left today</span>
            {decisionId && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/30 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                Focused on 1 decision
                <button
                  type="button"
                  onClick={() => setDecisionId(undefined)}
                  aria-label="Clear decision filter"
                  className="hover:text-foreground"
                >
                  ×
                </button>
              </span>
            )}
          </div>
          <div className="chat-project-picker">
            <button type="button" className="chat-project-trigger" disabled={sending} aria-expanded={projectMenu} aria-label="Choose a collection" onClick={()=>setProjectMenu(!projectMenu)}><FolderOpen size={16}/>{projects.find(p=>p.id===project)?.name || (decisionId ? "Selected decision" : "All decisions")}<span>⌄</span></button>
            {projectMenu && <div className="chat-project-menu"><button type="button" onClick={()=>{setDecisionId(undefined);setProject("");setProjectMenu(false)}}>All decisions {project===""?"✓":""}</button>{projects.map(p=><button key={p.id} type="button" onClick={()=>{setDecisionId(undefined);setProject(p.id);setProjectMenu(false)}}>{p.name}{project===p.id?" ✓":""}</button>)}{projects.length===0&&<Link href="/decisions">Create a collection ↗</Link>}</div>}
          </div>
        </div>

        <AnimatePresence>
          {historyOpen && (
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Previous chats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              onClick={() => setHistoryOpen(false)}
              className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg rounded-3xl border border-border/80 bg-card p-5 shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <History size={17} className="text-accent" />
                    <h2 className="font-display text-lg font-bold">Previous chats</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={startNewChat}
                      className="h-8 px-3 rounded-xl bg-accent/15 border border-accent/35 text-accent text-xs font-bold inline-flex items-center gap-1.5 hover:bg-accent/25 transition"
                    >
                      <MessageSquarePlus size={13} /> New chat
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryOpen(false)}
                      aria-label="Close"
                      className="p-1.5 rounded-xl text-muted-foreground hover:bg-muted transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {sessions.length > 3 && (
                  <label className="flex items-center gap-2 px-3 h-9 rounded-xl border border-border bg-background/60 text-muted-foreground">
                    <Search size={14} className="shrink-0" />
                    <input
                      type="search"
                      value={chatSearch}
                      onChange={(e) => setChatSearch(e.target.value)}
                      placeholder="Search previous chats…"
                      className="w-full !bg-transparent !border-0 !p-0 text-xs text-foreground focus:outline-none"
                    />
                  </label>
                )}

                {(() => {
                  const q = chatSearch.trim().toLowerCase();
                  const filtered = q
                    ? sessions.filter((s) => s.title.toLowerCase().includes(q))
                    : sessions;
                  if (filtered.length === 0) {
                    return (
                      <p className="text-xs text-muted-foreground py-6 text-center">
                        {sessions.length === 0
                          ? "No previous chats yet. Start a conversation!"
                          : "No matching chats found."}
                      </p>
                    );
                  }
                  return (
                    <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                      {filtered.map((s) => {
                        const active = activeSessionId === s.id;
                        return (
                          <div
                            key={s.id}
                            className={`group flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl border text-xs transition ${
                              active
                                ? "border-accent bg-accent/15 text-foreground"
                                : "border-border/60 bg-background/50 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setHistoryOpen(false);
                                if ((s.projectId || "") !== project) {
                                  setProject(s.projectId || "");
                                }
                                loadChat({ sessionId: s.id });
                              }}
                              className="flex-1 min-w-0 text-left"
                            >
                              <strong className="block font-semibold truncate text-sm">
                                {s.title}
                              </strong>
                              <small className="text-[11px] opacity-75">
                                {new Date(s.updatedAt).toLocaleDateString()} ·{" "}
                                {s._count?.messages ?? 0} msgs
                              </small>
                            </button>
                            <button
                              type="button"
                              onClick={() => void deleteSession(s.id)}
                              title="Delete chat"
                              aria-label="Delete chat"
                              className="p-1.5 rounded-xl opacity-60 hover:opacity-100 hover:text-destructive transition shrink-0"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={scroll} className="insights-messages illustrated-area" aria-live="polite">
          {!messages.length && <FloatingDetails kind="chat" />}
          {loading ? (
            <p className="insights-loading">Loading your conversation…</p>
          ) : messages.length === 0 ? (
            <div className="insights-empty">
              <JournalArt kind="chat" reaction={composerFocused || text.trim() ? "listening" : "idle"} />
              <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
                {preferences.character.name || "Sprout"}
              </span>
              <h2>What’s on your mind?</h2>
              
              <div className="insights-suggestions">
                {[
                  "What patterns do you see in my decisions?",
                  "Help me think through my next step",
                  "What can I learn from what happened?",
                ].map((q) => (
                  <button key={q} onClick={() => send(q)}>
                    {q} <span>↗</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={"insights-message " + m.role}>
                {m.role === "assistant" && (
                  <JournalArt kind="chat" reaction="celebrating" compact />
                )}
                <div>
                  <span className="insights-message-label">
                    {m.role === "user" ? "YOU" : "REFLECTION"}
                  </span>
                  <p>{m.content}</p>
                </div>
              </div>
            ))
          )}
          {sending && (
            <div className="insights-message assistant">
              <JournalArt kind="chat" reaction="thinking" compact />
              <div>
                <span className="insights-message-label">REFLECTION</span>
                <p>Thinking through your question…</p>
              </div>
            </div>
          )}
        </div>

        <div className="insights-compose">
          {error && (
            <p role="alert" className="insights-error">
              {error}
            </p>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <textarea
              aria-label="Your message"
              onFocus={() => setComposerFocused(true)}
              onBlur={() => setComposerFocused(false)}
              placeholder="What's on your mind? (Press Enter to send)"
              rows={2}
              maxLength={4000}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <button
              aria-label="Send message"
              disabled={!text.trim() || sending || loading || remaining === 0}
            >
              <ArrowUp size={20} />
            </button>
          </form>
          <p>
            Uses the records in your selected collections to help you reflect.{" "}
            <Link href="/decisions">Browse collections ↗</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

function DnaProfileView({ onAskAi }: { onAskAi?: () => void }) {
  const { isAuthenticated } = useAuthStore();
  const [profile, setProfile] = useState<DecisionDnaProfile | null>(null);
  const [selectedDimension, setSelectedDimension] = useState<DnaDimension | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await dnaService.getProfile();
      setProfile(res);
    } catch (err) {
      setProfile(null);
      setLoadError(
        err instanceof ApiError ? err.message : "Something went wrong while loading your Decision DNA."
      );
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  const measured = profile?.dimensions.filter(d => (d as DnaDimension & {hasData?:boolean}).hasData && Number.isFinite(d.score)) || [];


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-plum-900 text-cream-50 dark:bg-primary dark:text-plum-950">
              <AnimatedIcon name="dna" size={17} />
            </div>
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
              Decision insights
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
            Review the evidence from your recorded decisions and outcomes.
          </p>
        </div>

        <JournalArt kind="insights" reaction={measured.length ? "celebrating" : "idle"} />
      </div>

      {loading && <p role="status">Loading your insights…</p>}
      {loadError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-soft">
          <p className="text-foreground font-medium">{loadError}</p>
          <Button size="sm" variant="outline" onClick={loadData}>
            Try again
          </Button>
        </div>
      )}

      {profile && measured.length === 0 && (
        <Card className="text-center py-16 px-6 border-dashed border-border/80 bg-card/60 rounded-3xl shadow-soft">
          <div className="max-w-md mx-auto space-y-3">
            <div className="grid h-12 w-12 mx-auto place-items-center rounded-2xl bg-plum-100 dark:bg-plum-900/40 text-primary">
              <AnimatedIcon name="dna" size={24} />
            </div>
            <h3 className="font-display text-base font-bold text-foreground">
              No insights yet
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Record an outcome to get started.
            </p>
          </div>
        </Card>
      )}

      {profile && measured.length > 0 && (() => {
        const sorted = [...measured].sort((a, b) => b.score - a.score);
        const strongest = sorted[0];
        const growth = sorted[sorted.length - 1];
        const score = profile.overallDnaScore;
        const stage =
          score >= 75 ? "Strong & Well-Calibrated" : score >= 55 ? "Growing Consistency" : "Building Foundations";
        return (
          <div className="space-y-6">
            {/* Top 3-Card Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border border-border/80 bg-card/90 shadow-soft flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Overall Insight Score
                  </span>
                  <Award size={18} className="text-primary" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <strong className="font-display text-3xl font-extrabold text-foreground">
                      {score}
                    </strong>
                    <span className="text-sm text-muted-foreground">/ 100</span>
                  </div>
                  <p className="text-xs text-spring-500 font-semibold mt-1">{stage}</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-border/80 bg-card/90 shadow-soft flex flex-col justify-between gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Your Habits ({profile.totalDecisions} Reviewed)
                </span>
                <div className="space-y-1.5 text-xs">
                  {strongest && (
                    <p className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Strongest:</span>
                      <strong className="text-emerald-400">{strongest.label} ({strongest.score})</strong>
                    </p>
                  )}
                  {growth && growth.name !== strongest?.name && (
                    <p className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Focus next:</span>
                      <strong className="text-amber-400">{growth.label} ({growth.score})</strong>
                    </p>
                  )}
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-primary/25 bg-primary/5 shadow-soft flex flex-col justify-between gap-3">
                <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                  <Sparkles size={15} /> Personal Reflection
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Want help understanding why certain outcomes surprised you?
                </p>
                {onAskAi && (
                  <button
                    type="button"
                    onClick={onAskAi}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent text-accent-foreground px-3.5 py-2 text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    <MessageCircle size={14} /> Discuss my insights in Chat
                  </button>
                )}
              </div>
            </div>

            {/* Patterns Strip (1 col if single, 2 col if multiple so never lopsided) */}
            {profile.patterns && profile.patterns.length > 0 && (
              <div
                className={
                  "grid gap-3 " +
                  (profile.patterns.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")
                }
              >
                {profile.patterns.map((p) => (
                  <div
                    key={p.patternKey}
                    className="p-4 rounded-2xl border border-border/80 bg-card/85 flex flex-wrap items-center justify-between gap-3 shadow-soft"
                  >
                    <div className="flex items-start gap-3">
                      <ShieldAlert
                        size={18}
                        className={
                          p.severity === "POSITIVE"
                            ? "text-emerald-500 shrink-0 mt-0.5"
                            : p.severity === "HIGH"
                              ? "text-destructive shrink-0 mt-0.5"
                              : "text-amber-500 shrink-0 mt-0.5"
                        }
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-bold">{p.title}</strong>
                          {p.evidenceDecisionIds && p.evidenceDecisionIds.length > 0 && (
                            <span className="text-[11px] text-muted-foreground">
                              ({p.evidenceDecisionIds.length} decisions)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {p.description}
                        </p>
                      </div>
                    </div>
                    {p.evidenceDecisionIds && p.evidenceDecisionIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedDimension({
                            name: p.patternKey,
                            label: p.title,
                            score: score,
                            description: p.description,
                            evidenceDecisionIds: p.evidenceDecisionIds ?? [],
                          })
                        }
                        className="text-xs font-semibold text-primary hover:underline px-2 py-1"
                      >
                        See decisions →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <DnaRadarChart
              dimensions={measured}
              onSelectDimension={(dim) => setSelectedDimension(dim)}
            />
          </div>
        );
      })()}

      {selectedDimension && (
        <MetricEvidenceModal
          dimension={selectedDimension}
          onClose={() => setSelectedDimension(null)}
        />
      )}
    </div>
  );
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<"chat" | "dna">("chat");
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("tab") === "insights") setActiveTab("dna");
  }, []);


  return (
    <ProtectedGate>
      <div className={"dna-workspace " + (activeTab === "chat" ? "chat-mode" : "")}>
      <BackLink href="/">Home</BackLink>
        {/* Navigation Mode Selector */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-card border border-border/80 shadow-dock w-fit">
          <button
            type="button"
            aria-pressed={activeTab === "chat"}
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "chat"
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles size={14} className={activeTab === "chat" ? "text-primary-foreground" : "text-primary"} />
            Chat
          </button>
          <button
            type="button"
            aria-pressed={activeTab === "dna"}
            onClick={() => setActiveTab("dna")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "dna"
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <AnimatedIcon name="dna" size={14} />
            Decision insights
          </button>
        </div>

        <div className="chat-tab-panel" hidden={activeTab !== "chat"}>
          <ThinkingSpace />
        </div>
        {activeTab === "dna" && <DnaProfileView onAskAi={() => setActiveTab("chat")} />}
      </div>
    </ProtectedGate>
  );
}
