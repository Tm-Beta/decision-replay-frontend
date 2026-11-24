"use client";

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [project, setProject] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const scroll = useRef<HTMLDivElement>(null);

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
        body: JSON.stringify({ message, projectId: project || null }),
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
      <header className="insights-header">
        <div>
          <div className="insights-eyebrow">
            <Sparkles size={16} /> YOUR THINKING SPACE
          </div>
          <h1>Think it through.</h1>
          <p>Explore your decisions, understand what happened, and find your next step.</p>
        </div>
        <div className="insights-credits">
          <span>DAILY CREDITS</span>
          <strong>
            {remaining === null ? "—" : remaining} <small>left</small>
          </strong>
          <p>Refreshes each day</p>
        </div>
      </header>

      <div className="insights-chat">
        <div className="insights-chatbar">
          <div className="insights-chat-title">
            <span>
              <MessageCircle size={18} />
            </span>
            <div>
              <strong>Your conversation</strong>
              <p>Based on your recorded decisions</p>
            </div>
          </div>
          <label>
            <FolderOpen size={16} />
            <span className="sr-only">Choose project context</span>
            <select
              value={project}
              disabled={sending}
              onChange={(e) => setProject(e.target.value)}
            >
              <option value="">All projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.status === "ARCHIVED" ? " (archived)" : ""}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div ref={scroll} className="insights-messages" aria-live="polite">
          {loading ? (
            <p className="insights-loading">Loading your conversation…</p>
          ) : messages.length === 0 ? (
            <div className="insights-empty">
              <div className="insights-orb">
                <Sparkles size={26} />
              </div>
              <h2>A little clarity starts here.</h2>
              <p>Ask a question about your projects, decisions, or what you want to do next.</p>
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
                if (e.key === "Enter" && !e.shiftKey) {
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

  const lowestDimension =
    profile && profile.totalDecisions > 0 && profile.dimensions?.length > 0
      ? profile.dimensions.reduce((lowest, d) => (d.score < lowest.score ? d : lowest))
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-plum-900 text-cream-50 dark:bg-primary dark:text-plum-950">
              <AnimatedIcon name="dna" size={17} />
            </div>
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
              Cognitive DNA Dimensions
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
            Mathematical breakdown of your estimation variance, cognitive foresight, and calibration.
          </p>
        </div>

        {profile && (
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="px-4 py-2 rounded-2xl bg-card border border-border/80 shadow-soft flex items-center gap-2.5">
              <Award className="h-5 w-5 text-spring-500" />
              <div>
                <div className="font-display text-lg font-extrabold leading-none text-foreground">
                  {profile.overallDnaScore}/100
                </div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  DNA Index
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {loadError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-soft">
          <p className="text-foreground font-medium">{loadError}</p>
          <Button size="sm" variant="outline" onClick={loadData}>
            Try again
          </Button>
        </div>
      )}

      {profile && profile.totalDecisions === 0 && (
        <Card className="text-center py-16 px-6 border-dashed border-border/80 bg-card/60 rounded-3xl shadow-soft">
          <div className="max-w-md mx-auto space-y-3">
            <div className="grid h-12 w-12 mx-auto place-items-center rounded-2xl bg-plum-100 dark:bg-plum-900/40 text-primary">
              <AnimatedIcon name="dna" size={24} />
            </div>
            <h3 className="font-display text-base font-bold text-foreground">
              No Replay Data Recorded Yet
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your Decision DNA profile synthesizes calibration, estimation accuracy, risk foresight, and alternative breadth once you record real outcomes on completed decisions.
            </p>
          </div>
        </Card>
      )}

      {profile && profile.totalDecisions > 0 && (
        <DnaRadarChart
          dimensions={profile.dimensions}
          onSelectDimension={(dim) => setSelectedDimension(dim)}
        />
      )}

      {lowestDimension && (
        <Card className="border-amber-500/30 bg-amber-500/5 p-5 rounded-2xl shadow-soft">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h4 className="font-display font-bold text-amber-900 dark:text-amber-200 text-sm">
                Cognitive Calibration Insight
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                Your lowest scoring dimension is{" "}
                <strong className="text-foreground">
                  {lowestDimension.label} ({lowestDimension.score}/100)
                </strong>
                . {lowestDimension.description}
              </p>
            </div>
          </div>
        </Card>
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

  return (
    <ProtectedGate>
      <div className="max-w-5xl mx-auto space-y-6">
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
            Thinking Space (AI Copilot)
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
            Decision DNA Profile
          </button>
        </div>

        {activeTab === "chat" ? <ThinkingSpace /> : <DnaProfileView />}
      </div>
    </ProtectedGate>
  );
}
