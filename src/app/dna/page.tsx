"use client";

import { JournalArt } from "@/components/illustrations/JournalArt";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUp, MessageCircle, Sparkles, FolderOpen, Award, ShieldAlert } from "lucide-react";
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

type Project = { id: string; name: string; status: string };
type Message = { id: string; role: "user" | "assistant"; content: string };
type History = { messages: Message[]; remaining: number; limit: number };

function ThinkingSpace() {
  const [decisionId,setDecisionId]=useState<string>();
  useEffect(()=>{setDecisionId(new URLSearchParams(window.location.search).get("decision") || undefined)},[]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [project, setProject] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const scroll = useRef<HTMLDivElement>(null);
  const [projectMenu,setProjectMenu]=useState(false);

  useEffect(() => {
    apiClient<Project[]>("/groups")
      .then(setProjects)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    apiClient<History>("/chat" + (project ? "?projectId=" + encodeURIComponent(project) : ""))
      .then((data) => {
        if (active) {
          setMessages(data.messages);
          setRemaining(data.remaining);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [project]);

  useEffect(() => {
    scroll.current?.scrollTo({ top: scroll.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function send(value = text) {
    const message = value.trim();
    if (!message || sending || loading || remaining === 0) return;
    setSending(true);
    setError("");
    setText("");
    const temp: Message = { id: "pending", role: "user", content: message };
    setMessages((prev) => [...prev, temp]);
    try {
      const result = await apiClient<{ answer: string; remaining: number }>("/chat", {
        method: "POST",
        body: JSON.stringify({ message, decisionId, projectId: project || null }),
      });
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== "pending"),
        { ...temp, id: crypto.randomUUID() },
        { id: crypto.randomUUID(), role: "assistant", content: result.answer },
      ]);
      setRemaining(result.remaining);
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
          <span className="chat-credit-count">{remaining === null ? "—" : remaining} credits left today</span>
          <div className="chat-project-picker">
            <button type="button" className="chat-project-trigger" disabled={sending} aria-expanded={projectMenu} aria-label="Choose project context" onClick={()=>setProjectMenu(!projectMenu)}><FolderOpen size={16}/>{projects.find(p=>p.id===project)?.name || (decisionId ? "Selected decision" : "All decisions")}<span>⌄</span></button>
            {projectMenu && <div className="chat-project-menu"><button type="button" onClick={()=>{setDecisionId(undefined);setProject("");setProjectMenu(false)}}>All decisions {project===""?"✓":""}</button>{projects.map(p=><button key={p.id} type="button" onClick={()=>{setDecisionId(undefined);setProject(p.id);setProjectMenu(false)}}>{p.name}{project===p.id?" ✓":""}</button>)}{projects.length===0&&<Link href="/decisions">Create a project ↗</Link>}</div>}
          </div>
        </div>

        <div ref={scroll} className="insights-messages" aria-live="polite">
          {loading ? (
            <p className="insights-loading">Loading your conversation…</p>
          ) : messages.length === 0 ? (
            <div className="insights-empty">
              <JournalArt kind="chat" />
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
                  <span className="insights-avatar">
                    <Sparkles size={15} />
                  </span>
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
              <span className="insights-avatar">
                <Sparkles size={15} />
              </span>
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
            Uses the records in your selected projects to help you reflect.{" "}
            <Link href="/decisions">Open your projects ↗</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

function DnaProfileView() {
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

        <JournalArt kind="insights" />
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

      {profile && measured.length > 0 && (
        <DnaRadarChart
          dimensions={measured}
          onSelectDimension={(dim) => setSelectedDimension(dim)}
        />
      )}

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
        {/* Navigation Mode Selector */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-card border border-border/80 shadow-dock w-fit">
          <button
            type="button"
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

        {activeTab === "chat" ? <ThinkingSpace /> : <DnaProfileView />}
      </div>
    </ProtectedGate>
  );
}
