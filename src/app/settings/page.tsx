"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Palette,
  RotateCcw,
  Smile,
  Shuffle,
  Sun,
  Moon,
  HelpCircle,
  ShieldCheck,
  Wand2,
  AlertTriangle,
  Download,
  Upload,
  Trash2,
  MessageSquareOff,
  X,
  UserCircle2,
  GraduationCap,
  Rocket,
  PenTool,
  Compass,
  Briefcase,
  Flame,
  CalendarCheck,
  Target,
  ChevronRight,
  Home,
  Cpu,
  Heart,
  MoreHorizontal,
  BookOpen,
  Wallet,
  Feather,
} from "lucide-react";
import { ProtectedGate } from "@/components/auth/ProtectedGate";
import { BackLink } from "@/components/navigation/BackLink";
import { JournalArt } from "@/components/illustrations/JournalArt";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAuthStore } from "@/store/useAuthStore";
import {
  apiClient,
  downloadProtectedFile,
  uploadProtectedBinary,
} from "@/services/apiClient";
import {
  CHARACTER_CATALOG,
  createRandomStyle,
  DEFAULT_PREFERENCES,
  recommendPreferencesFromPersona,
  THEME_PRESETS,
  type AgeGroup,
  type CharacterAccessory,
  type CharacterEnergy,
  type CharacterEyes,
  type CharacterId,
  type CharacterShape,
  type CharacterTone,
  type CharacterChattiness,
  type UserGoal,
  type UserRole,
} from "@/lib/preferences";

type SettingsTab = "appearance" | "companion" | "profile" | "data";
type PreviewReaction =
  | "idle"
  | "listening"
  | "thinking"
  | "celebrating"
  | "proud"
  | "curious"
  | "due"
  | "resting";

const TABS: { id: SettingsTab; label: string; hint: string; icon: React.ReactNode }[] = [
  { id: "appearance", label: "Appearance", hint: "Theme & colors", icon: <Palette size={16} /> },
  { id: "companion", label: "Companion", hint: "Character & voice", icon: <Smile size={16} /> },
  { id: "profile", label: "You & Habits", hint: "Profile & rhythm", icon: <UserCircle2 size={16} /> },
  { id: "data", label: "Data & Danger", hint: "Backup & account", icon: <AlertTriangle size={16} /> },
];

const SHAPES: { id: CharacterShape; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "chubby", label: "Round" },
  { id: "tall", label: "Tall" },
  { id: "drop", label: "Drop" },
];

const EYE_STYLES: { id: CharacterEyes; label: string }[] = [
  { id: "dots", label: "Dots" },
  { id: "starry", label: "Starry" },
  { id: "calm", label: "Calm" },
];

const ACCESSORIES: { id: CharacterAccessory; label: string }[] = [
  { id: "none", label: "None" },
  { id: "leaf", label: "Leaf" },
  { id: "halo", label: "Halo" },
  { id: "glasses", label: "Glasses" },
  { id: "crown", label: "Crown" },
  { id: "bowtie", label: "Bowtie" },
];

const TONES: { id: CharacterTone; label: string }[] = [
  { id: "warm", label: "Warm" },
  { id: "direct", label: "Direct" },
  { id: "socratic", label: "Socratic" },
  { id: "playful", label: "Playful" },
];

const ENERGIES: { id: CharacterEnergy; label: string }[] = [
  { id: "lively", label: "Lively" },
  { id: "calm", label: "Calm" },
  { id: "minimal", label: "Still" },
];

const LENGTHS: { id: CharacterChattiness; label: string }[] = [
  { id: "concise", label: "Concise" },
  { id: "balanced", label: "Balanced" },
  { id: "detailed", label: "Detailed" },
];

const ROLES: { id: UserRole; label: string; icon: React.ReactNode }[] = [
  { id: "student", label: "Student", icon: <GraduationCap size={14} /> },
  { id: "professional", label: "Working Pro", icon: <Briefcase size={14} /> },
  { id: "founder", label: "Founder / Builder", icon: <Rocket size={14} /> },
  { id: "creator", label: "Creator", icon: <PenTool size={14} /> },
  { id: "parent", label: "Parent / Family", icon: <Home size={14} /> },
  { id: "researcher", label: "Engineer / Analyst", icon: <Cpu size={14} /> },
  { id: "explorer", label: "Life Explorer", icon: <Compass size={14} /> },
  { id: "mindful", label: "Mindful Thinker", icon: <Heart size={14} /> },
  { id: "other", label: "Other", icon: <MoreHorizontal size={14} /> },
];

const AGE_GROUPS: { id: AgeGroup; label: string }[] = [
  { id: "under_20", label: "Under 20" },
  { id: "20_26", label: "20 – 26" },
  { id: "27_35", label: "27 – 35" },
  { id: "36_45", label: "36 – 45" },
  { id: "46_plus", label: "46+" },
];

const GOALS: { id: UserGoal; label: string; icon: React.ReactNode }[] = [
  { id: "life_career", label: "Life & career moves", icon: <Compass size={14} /> },
  { id: "ideas_projects", label: "Ideas & projects", icon: <Flame size={14} /> },
  { id: "daily_habits", label: "Daily clarity", icon: <CalendarCheck size={14} /> },
  { id: "tough_calls", label: "Tough decisions", icon: <Target size={14} /> },
  { id: "studies_skills", label: "Studies & skills", icon: <BookOpen size={14} /> },
  { id: "money_investing", label: "Money & finance", icon: <Wallet size={14} /> },
  { id: "relationships", label: "Relationships", icon: <Heart size={14} /> },
  { id: "creative_growth", label: "Creative growth", icon: <Feather size={14} /> },
  { id: "other", label: "Other", icon: <MoreHorizontal size={14} /> },
];

const REVIEW_DAYS = [3, 7, 14, 30];

function SettingsStudio() {
  const router = useRouter();
  const {
    preferences,
    updatePreferences,
    resetPreferences,
    savingPreferences,
    preferencesSavedAt,
  } = useTheme();
  const { user, openTourModal, logout } = useAuthStore();

  const [tab, setTab] = useState<SettingsTab>("appearance");
  const [previewReaction, setPreviewReaction] = useState<PreviewReaction>("idle");
  const [dangerModal, setDangerModal] = useState<null | "clearChat" | "clearJournal" | "deleteAccount">(null);
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [dangerBusy, setDangerBusy] = useState(false);
  const [dangerStatus, setDangerStatus] = useState("");
  const [dangerError, setDangerError] = useState("");
  const [importDraft, setImportDraft] = useState<{
    fileName: string;
    file: File;
    exportedAt: string | null;
    projectsCount: number;
    decisionsCount: number;
    chatsCount: number;
    hasPrefs: boolean;
  } | null>(null);
  const [restorePrefsOnImport, setRestorePrefsOnImport] = useState(true);
  const [importInspecting, setImportInspecting] = useState(false);
  const [importBusy, setImportBusy] = useState(false);

  const handleSelectImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setDangerError("");
    setDangerStatus("");

    if (!file.name.toLowerCase().endsWith(".soichose")) {
      setDangerError("Only encrypted .soichose backup files can be imported.");
      return;
    }
    if (file.size <= 56 || file.size > 4 * 1024 * 1024) {
      setDangerError("Invalid .soichose backup file size (max 4 MB).");
      return;
    }

    try {
      // Quick binary magic-header check before server cryptographic verification
      const headerBytes = new Uint8Array(await file.slice(0, 10).arrayBuffer());
      const magicExpected = [0x53, 0x4f, 0x49, 0x43, 0x48, 0x4f, 0x53, 0x45, 0x00, 0x01];
      const matchesMagic = magicExpected.every((b, idx) => headerBytes[idx] === b);
      if (!matchesMagic) {
        setDangerError("Only genuine .soichose vaults exported from So I Chose can be imported.");
        return;
      }

      setImportInspecting(true);
      const res = await uploadProtectedBinary<{
        status: string;
        data: {
          verified: boolean;
          exportedAt: string | null;
          projectsCount: number;
          decisionsCount: number;
          chatsCount: number;
          hasPrefs: boolean;
        };
      }>("/auth/import/inspect", file);

      setImportDraft({
        fileName: file.name,
        file,
        exportedAt: res.data.exportedAt,
        projectsCount: res.data.projectsCount,
        decisionsCount: res.data.decisionsCount,
        chatsCount: res.data.chatsCount,
        hasPrefs: res.data.hasPrefs,
      });
    } catch (err) {
      setDangerError((err as Error).message || "Could not verify this .soichose backup file.");
    } finally {
      setImportInspecting(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!importDraft || importBusy) return;
    setImportBusy(true);
    setDangerError("");
    try {
      const res = await uploadProtectedBinary<{
        status: string;
        data: {
          importedProjects: number;
          importedDecisions: number;
          importedChats: number;
          restoredPreferences?: Record<string, unknown>;
        };
      }>(
        `/auth/import?restorePreferences=${restorePrefsOnImport ? "true" : "false"}`,
        importDraft.file,
      );
      if (restorePrefsOnImport && res.data.restoredPreferences) {
        updatePreferences(res.data.restoredPreferences, false);
      }
      const d = res.data;
      setDangerStatus(
        `Imported ${d.importedProjects} collections, ${d.importedDecisions} decisions & ${d.importedChats} chat msgs.`,
      );
      setImportDraft(null);
    } catch (err) {
      setDangerError((err as Error).message || "Import failed.");
    } finally {
      setImportBusy(false);
    }
  };

  const char = preferences.character;
  const charMeta = CHARACTER_CATALOG[char.id] ?? CHARACTER_CATALOG.sprout;
  const persona = preferences.persona ?? {};

  const handleSurpriseMe = () => {
    updatePreferences(createRandomStyle());
  };

  const handleMatchPersona = (
    r = persona.role || "explorer",
    a = persona.ageGroup || "20_26",
    g = persona.goal || "life_career",
  ) => {
    const matched = recommendPreferencesFromPersona(r, a, g);
    updatePreferences(matched);
  };

  const handleExportBackup = async () => {
    setDangerError("");
    try {
      const { blob, fileName } = await downloadProtectedFile("/auth/export");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || `soichose-backup-${new Date().toISOString().slice(0, 10)}.soichose`;
      a.click();
      URL.revokeObjectURL(url);
      setDangerStatus("Encrypted .soichose backup downloaded.");
    } catch (err) {
      setDangerError((err as Error).message || "Could not export backup.");
    }
  };

  const openDanger = (mode: "clearChat" | "clearJournal" | "deleteAccount") => {
    setConfirmPhrase("");
    setConfirmChecked(false);
    setDangerError("");
    setDangerModal(mode);
  };

  const handleConfirmDanger = async () => {
    if (!dangerModal || dangerBusy) return;
    setDangerBusy(true);
    setDangerError("");
    try {
      if (dangerModal === "clearChat") {
        await apiClient("/auth/chat-history", { method: "DELETE" });
        setDangerStatus("Chat history cleared.");
        setDangerModal(null);
      } else if (dangerModal === "clearJournal") {
        await apiClient("/auth/clear-journal", {
          method: "POST",
          body: JSON.stringify({ confirmation: confirmPhrase.trim() }),
        });
        setDangerStatus("All decisions and collections cleared.");
        setDangerModal(null);
      } else if (dangerModal === "deleteAccount") {
        await apiClient("/auth/account", {
          method: "DELETE",
          body: JSON.stringify({ confirmation: confirmPhrase.trim() }),
        });
        if (typeof window !== "undefined") {
          if (user?.id) {
            localStorage.removeItem(`soichose-prefs-user:${user.id}`);
            localStorage.removeItem(`review-push-enabled:${user.id}`);
          }
          localStorage.removeItem("soichose-last-prefs");
          localStorage.removeItem("soichose-preferences");
          localStorage.removeItem("decision-replay-theme");
        }
        setDangerModal(null);
        logout();
        router.push("/");
      }
    } catch (err) {
      setDangerError((err as Error).message || "Action failed.");
    } finally {
      setDangerBusy(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6 pb-12">
      <BackLink href="/">Home</BackLink>

      {/* Highlighted Hero Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            Your app is <span className="text-accent">yours.</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Personalize your space, companion, and profile.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border bg-card/70 text-muted-foreground">
            <ShieldCheck size={13} className="text-accent" />
            {savingPreferences ? "Saving…" : preferencesSavedAt ? "Saved" : "Synced"}
          </span>
          <button
            type="button"
            onClick={handleSurpriseMe}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-accent/15 text-accent border border-accent/35 hover:bg-accent/25 transition"
          >
            <Shuffle size={13} /> Surprise me
          </button>
          <button
            type="button"
            onClick={() => void resetPreferences()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-border hover:bg-muted transition"
          >
            <RotateCcw size={13} /> Reset all
          </button>
        </div>
      </header>

      {/* Left Vertical Tabs Sidebar + Main Content Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[232px_minmax(0,1fr)] gap-6 items-start">
        <aside className="lg:sticky lg:top-6">
          <nav
            aria-label="Settings sections"
            className="grid grid-cols-2 lg:grid-cols-1 gap-2 p-2.5 rounded-2xl border border-border/80 bg-card/85 backdrop-blur-xl shadow-sm"
          >
            {TABS.map((t) => {
              const active = tab === t.id;
              const isDanger = t.id === "data";
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t.id)}
                  className={`relative cursor-pointer flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-left border transition-all ${
                    active
                      ? isDanger
                        ? "text-rose-400 border-transparent"
                        : "text-foreground border-transparent"
                      : "text-muted-foreground border-border/40 bg-background/35 hover:text-foreground hover:border-border hover:bg-muted/55"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="settings-active-tab"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      className={`absolute inset-0 rounded-xl border ${
                        isDanger
                          ? "bg-rose-500/15 border-rose-500/45"
                          : "bg-accent/15 border-accent/50 shadow-sm"
                      }`}
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-2.5 min-w-0">
                    <span
                      className={`shrink-0 ${
                        active ? (isDanger ? "text-rose-400" : "text-accent") : ""
                      }`}
                    >
                      {t.icon}
                    </span>
                    <div className="min-w-0">
                      <strong className="block text-xs font-bold truncate">{t.label}</strong>
                      <small className="hidden lg:block text-[10px] text-muted-foreground truncate">
                        {t.hint}
                      </small>
                    </div>
                  </div>
                  <ChevronRight
                    size={14}
                    className={`relative z-10 shrink-0 hidden lg:block transition-transform ${
                      active
                        ? isDanger
                          ? "text-rose-400 translate-x-0.5"
                          : "text-accent translate-x-0.5"
                        : "opacity-45"
                    }`}
                  />
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >

      {/* TAB 1: APPEARANCE */}
      {tab === "appearance" && (
        <section className="rounded-3xl border border-border/80 bg-card/85 p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold">Theme &amp; Colors</h2>
            <button
              type="button"
              onClick={() =>
                updatePreferences({
                  themeMode: DEFAULT_PREFERENCES.themeMode,
                  presetId: DEFAULT_PREFERENCES.presetId,
                  primaryColor: DEFAULT_PREFERENCES.primaryColor,
                  accentColor: DEFAULT_PREFERENCES.accentColor,
                  vortexIntensity: DEFAULT_PREFERENCES.vortexIntensity,
                  showFloatingArt: DEFAULT_PREFERENCES.showFloatingArt,
                })
              }
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition"
            >
              <RotateCcw size={12} /> Reset default
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => updatePreferences({ themeMode: "dark" })}
              className={`h-10 flex items-center justify-center gap-2 rounded-xl border text-xs font-bold transition ${
                preferences.themeMode === "dark"
                  ? "border-accent bg-accent/15 text-foreground"
                  : "border-border bg-background/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              <Moon size={15} /> Dark Mode
            </button>
            <button
              type="button"
              onClick={() => updatePreferences({ themeMode: "light" })}
              className={`h-10 flex items-center justify-center gap-2 rounded-xl border text-xs font-bold transition ${
                preferences.themeMode === "light"
                  ? "border-accent bg-accent/15 text-foreground"
                  : "border-border bg-background/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              <Sun size={15} /> Light Mode
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {THEME_PRESETS.map((preset) => {
              const active = preferences.presetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() =>
                    updatePreferences({
                      presetId: preset.id,
                      themeMode: preset.themeMode,
                      primaryColor: preset.primaryColor,
                      accentColor: preset.accentColor,
                    })
                  }
                  className={`flex items-center justify-between gap-2 px-3.5 py-3 rounded-xl border text-left transition ${
                    active
                      ? "border-accent bg-accent/10"
                      : "border-border bg-background/40 hover:bg-muted/60"
                  }`}
                >
                  <strong className="text-xs font-bold truncate">{preset.name}</strong>
                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: preset.primaryColor }}
                    />
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: preset.accentColor }}
                    />
                    {active && <Check size={12} className="text-accent ml-0.5" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-border bg-background/50 cursor-pointer">
              <div>
                <span className="block text-xs font-bold">Primary Color</span>
                <small className="text-[11px] font-mono text-muted-foreground uppercase">
                  {preferences.primaryColor}
                </small>
              </div>
              <input
                type="color"
                value={preferences.primaryColor}
                onChange={(e) =>
                  updatePreferences({
                    presetId: "custom",
                    primaryColor: e.target.value,
                  })
                }
                className="h-8 w-10 rounded border-0 bg-transparent cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-border bg-background/50 cursor-pointer">
              <div>
                <span className="block text-xs font-bold">Accent Color</span>
                <small className="text-[11px] font-mono text-muted-foreground uppercase">
                  {preferences.accentColor}
                </small>
              </div>
              <input
                type="color"
                value={preferences.accentColor}
                onChange={(e) =>
                  updatePreferences({
                    presetId: "custom",
                    accentColor: e.target.value,
                  })
                }
                className="h-8 w-10 rounded border-0 bg-transparent cursor-pointer"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <label className="flex-1 min-w-[200px] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold">Background Glow</span>
                <span className="text-muted-foreground font-mono">
                  {preferences.vortexIntensity}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={preferences.vortexIntensity}
                onChange={(e) =>
                  updatePreferences({ vortexIntensity: Number(e.target.value) })
                }
                className="w-full accent-primary cursor-pointer"
              />
            </label>

            <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer px-3.5 h-10 rounded-xl border border-border bg-background/50">
              <input
                type="checkbox"
                checked={preferences.showFloatingArt}
                onChange={(e) =>
                  updatePreferences({ showFloatingArt: e.target.checked })
                }
                className="accent-primary"
              />
              Floating details
            </label>
          </div>
        </section>
      )}

      {/* TAB 2: COMPANION */}
      {tab === "companion" && (
        <div className="space-y-5">
          {/* Live Preview */}
          <section className="rounded-3xl border border-border/80 bg-card/85 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl border border-border/60 bg-background/60 px-4 py-2 shrink-0">
                <JournalArt kind="chat" reaction={previewReaction} />
              </div>
              <div>
                <strong className="font-display text-lg block">
                  {char.name || charMeta.defaultName}
                </strong>
                <span className="text-xs text-muted-foreground block capitalize">
                  {charMeta.title} · {char.tone}
                </span>
                <Link
                  href="/dna"
                  className="inline-block mt-1.5 text-xs font-bold text-primary hover:underline"
                >
                  Open Chat →
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  "idle",
                  "listening",
                  "thinking",
                  "celebrating",
                  "proud",
                  "curious",
                  "due",
                  "resting",
                ] as PreviewReaction[]
              ).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setPreviewReaction(r)}
                  className={`h-9 px-3 rounded-xl text-xs font-semibold capitalize border transition ${
                    previewReaction === r
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border bg-background/60 hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-border/80 bg-card/85 p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold">Character &amp; Personality</h2>
              <div className="flex items-center gap-2">
                {persona.role && (
                  <button
                    type="button"
                    onClick={() => handleMatchPersona()}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border border-primary/40 text-primary hover:bg-primary/10 transition"
                  >
                    <Wand2 size={12} /> Auto-match
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    updatePreferences({
                      character: { ...DEFAULT_PREFERENCES.character },
                    })
                  }
                  className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition"
                >
                  <RotateCcw size={12} /> Reset default
                </button>
              </div>
            </div>

            {/* 6 Characters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5">
              {(Object.keys(CHARACTER_CATALOG) as CharacterId[]).map((cid) => {
                const item = CHARACTER_CATALOG[cid];
                const isSelected = char.id === cid;
                return (
                  <button
                    key={cid}
                    type="button"
                    onClick={() =>
                      updatePreferences({
                        character: {
                          id: cid,
                          name:
                            char.name === charMeta.defaultName
                              ? item.defaultName
                              : char.name,
                          accessory: item.defaultAccessory,
                        },
                      })
                    }
                    className={`flex flex-col items-center py-2.5 px-2 rounded-2xl border transition ${
                      isSelected
                        ? "border-accent bg-accent/10 shadow-sm"
                        : "border-border bg-background/40 hover:bg-muted/60"
                    }`}
                  >
                    <div className="h-[4.6rem] w-full flex items-center justify-center pointer-events-none">
                      <JournalArt
                        kind="chat"
                        miniScene
                        characterOverride={{
                          ...char,
                          id: cid,
                          accessory: isSelected ? char.accessory : item.defaultAccessory,
                          color: isSelected ? char.color : "auto",
                        }}
                      />
                    </div>
                    <strong className="text-xs font-bold mt-1">{item.defaultName}</strong>
                  </button>
                );
              })}
            </div>

            {/* Name & Color */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <span className="text-xs font-bold block mb-1.5">Name</span>
                <input
                  type="text"
                  maxLength={24}
                  value={char.name}
                  onChange={(e) =>
                    updatePreferences({ character: { name: e.target.value } })
                  }
                  placeholder={charMeta.defaultName}
                  className="!h-10 !py-0 w-full rounded-xl border border-border bg-background/70 px-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <span className="text-xs font-bold block mb-1.5">Color</span>
                <div className="flex items-center gap-2 h-10">
                  <button
                    type="button"
                    onClick={() => updatePreferences({ character: { color: "auto" } })}
                    className={`h-10 flex-1 px-3 rounded-xl border text-xs font-bold transition ${
                      char.color === "auto"
                        ? "border-accent bg-accent/15 text-foreground"
                        : "border-border bg-background/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Default
                  </button>
                  <input
                    type="color"
                    aria-label="Custom character color"
                    value={char.color === "auto" ? preferences.accentColor : char.color}
                    onChange={(e) =>
                      updatePreferences({ character: { color: e.target.value } })
                    }
                    className="!h-10 !w-11 !p-1 shrink-0 rounded-xl border border-border bg-background/50 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Shape & Eyes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-xs font-bold block mb-1.5">Shape</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {SHAPES.map((sh) => (
                    <button
                      key={sh.id}
                      type="button"
                      onClick={() => updatePreferences({ character: { shape: sh.id } })}
                      className={`h-9 px-2 rounded-xl border text-xs font-semibold transition ${
                        (char.shape || "classic") === sh.id
                          ? "border-accent bg-accent/15 text-foreground"
                          : "border-border bg-background/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {sh.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold block mb-1.5">Eyes</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {EYE_STYLES.map((ey) => (
                    <button
                      key={ey.id}
                      type="button"
                      onClick={() => updatePreferences({ character: { eyes: ey.id } })}
                      className={`h-9 px-2 rounded-xl border text-xs font-semibold transition ${
                        (char.eyes || "dots") === ey.id
                          ? "border-accent bg-accent/15 text-foreground"
                          : "border-border bg-background/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {ey.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Accessory */}
            <div>
              <span className="text-xs font-bold block mb-1.5">Accessory</span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {ACCESSORIES.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => updatePreferences({ character: { accessory: acc.id } })}
                    className={`h-9 px-2 rounded-xl border text-xs font-semibold transition ${
                      char.accessory === acc.id
                        ? "border-accent bg-accent/15 text-foreground"
                        : "border-border bg-background/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice, Depth & Motion */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-xs font-bold block mb-1.5">Voice</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {TONES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => updatePreferences({ character: { tone: t.id } })}
                      className={`h-9 px-2 rounded-xl border text-xs font-semibold transition ${
                        char.tone === t.id
                          ? "border-primary bg-primary/15 text-foreground"
                          : "border-border bg-background/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold block mb-1.5">Depth</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {LENGTHS.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => updatePreferences({ character: { chattiness: l.id } })}
                      className={`h-9 px-2 rounded-xl border text-xs font-semibold transition ${
                        char.chattiness === l.id
                          ? "border-accent bg-accent/15 text-foreground"
                          : "border-border bg-background/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold block mb-1.5">Motion</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {ENERGIES.map((en) => (
                    <button
                      key={en.id}
                      type="button"
                      onClick={() => updatePreferences({ character: { energy: en.id } })}
                      className={`h-9 px-2 rounded-xl border text-xs font-semibold transition ${
                        char.energy === en.id
                          ? "border-accent bg-accent/15 text-foreground"
                          : "border-border bg-background/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {en.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: YOU & HABITS (Editable Onboarding Persona + Workspace Rhythm) */}
      {tab === "profile" && (
        <div className="space-y-5">
          {/* Account Info */}
          <section className="rounded-3xl border border-border/80 bg-card/85 p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || "User"}
                  referrerPolicy="no-referrer"
                  className="h-12 w-12 rounded-full border border-border object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-secondary grid place-items-center font-bold">
                  {user?.name?.slice(0, 2).toUpperCase() || "U"}
                </div>
              )}
              <div>
                <strong className="font-display text-base block">{user?.name}</strong>
                <span className="text-xs font-mono text-muted-foreground">{user?.email}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={openTourModal}
              className="h-9 px-3.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted inline-flex items-center gap-1.5 transition"
            >
              <HelpCircle size={14} /> Replay Tour
            </button>
          </section>

          {/* Onboarding Profile (Editable) */}
          <section className="rounded-3xl border border-border/80 bg-card/85 p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold">Your Profile</h2>
              <button
                type="button"
                onClick={() => handleMatchPersona()}
                className="h-9 px-3.5 rounded-xl border border-accent/40 bg-accent/10 text-accent text-xs font-bold hover:bg-accent/20 inline-flex items-center gap-1.5 transition"
              >
                <Wand2 size={13} /> Apply matched theme &amp; companion
              </button>
            </div>

            <div>
              <span className="text-xs font-bold block mb-2">Who you are</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ROLES.map((r) => {
                  const active = persona.role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => updatePreferences({ persona: { role: r.id } })}
                      className={`h-10 px-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
                        active
                          ? "border-accent bg-accent/15 text-foreground"
                          : "border-border bg-background/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {r.icon}
                      <span className="truncate">{r.label}</span>
                    </button>
                  );
                })}
              </div>
              {persona.role === "other" && (
                <input
                  type="text"
                  maxLength={32}
                  value={persona.customRole || ""}
                  onChange={(e) =>
                    updatePreferences({ persona: { customRole: e.target.value } })
                  }
                  placeholder="Describe your role briefly (optional)…"
                  className="!h-10 mt-2.5 w-full sm:w-72 rounded-xl border border-accent/40 bg-background/70 px-3.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent"
                />
              )}
            </div>

            <div>
              <span className="text-xs font-bold block mb-2">Age group</span>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {AGE_GROUPS.map((ag) => (
                  <button
                    key={ag.id}
                    type="button"
                    onClick={() => updatePreferences({ persona: { ageGroup: ag.id } })}
                    className={`h-9 px-3 rounded-xl border text-xs font-semibold transition ${
                      persona.ageGroup === ag.id
                        ? "border-accent bg-accent/15 text-foreground"
                        : "border-border bg-background/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {ag.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold block mb-2">Main focus</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {GOALS.map((g) => {
                  const active = persona.goal === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => updatePreferences({ persona: { goal: g.id } })}
                      className={`h-10 px-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
                        active
                          ? "border-primary bg-primary/15 text-foreground"
                          : "border-border bg-background/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="text-primary shrink-0">{g.icon}</span>
                      <span className="truncate">{g.label}</span>
                    </button>
                  );
                })}
              </div>
              {persona.goal === "other" && (
                <input
                  type="text"
                  maxLength={40}
                  value={persona.customGoal || ""}
                  onChange={(e) =>
                    updatePreferences({ persona: { customGoal: e.target.value } })
                  }
                  placeholder="Describe your main focus (optional)…"
                  className="!h-10 mt-2.5 w-full sm:w-80 rounded-xl border border-primary/40 bg-background/70 px-3.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
            </div>
          </section>

          {/* Default Review Window */}
          <section className="rounded-3xl border border-border/80 bg-card/85 p-5 sm:p-6">
            <div>
              <span className="text-xs font-bold block mb-2">Default Review Window</span>
              <div className="grid grid-cols-4 gap-2 max-w-md">
                {REVIEW_DAYS.map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => updatePreferences({ defaultReviewDays: days })}
                    className={`h-9 px-2 rounded-xl border text-xs font-semibold transition ${
                      (preferences.defaultReviewDays ?? 7) === days
                        ? "border-accent bg-accent/15 text-foreground"
                        : "border-border bg-background/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {days} days
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 4: DATA & DANGER ZONE */}
      {tab === "data" && (
        <div className="space-y-5">
          <section className="rounded-3xl border border-border/80 bg-card/85 p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-bold">Encrypted Vault Backup</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Export or restore your private So I Chose data using signed <code className="text-foreground/90 font-semibold">.soichose</code> vault files only.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => void handleExportBackup()}
                  className="h-10 px-4 rounded-xl border border-border bg-background/60 hover:bg-muted text-xs font-bold inline-flex items-center gap-2 transition"
                >
                  <Download size={15} /> Export backup (.soichose)
                </button>
                <label className="h-10 px-4 rounded-xl bg-accent/15 border border-accent/40 text-accent hover:bg-accent/25 text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition">
                  <Upload size={15} /> {importInspecting ? "Verifying vault…" : "Import backup (.soichose)"}
                  <input
                    type="file"
                    accept=".soichose"
                    disabled={importInspecting}
                    onChange={(e) => void handleSelectImportFile(e)}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
            {dangerError && !dangerModal && !importDraft && (
              <p className="text-xs font-semibold text-rose-400" role="alert">
                {dangerError}
              </p>
            )}
          </section>

          <section className="rounded-3xl border border-destructive/35 bg-destructive/5 p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="h-8 w-8 rounded-xl bg-destructive/15 text-destructive grid place-items-center shrink-0">
                  <AlertTriangle size={16} />
                </span>
                <h2 className="font-display text-lg font-bold text-destructive">Danger Zone</h2>
              </div>
              {dangerStatus && (
                <span className="text-xs font-semibold text-accent">{dangerStatus}</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => openDanger("clearChat")}
                className="h-11 px-4 rounded-xl border border-border bg-card/90 hover:border-rose-400/60 hover:text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <MessageSquareOff size={15} /> Clear chat history
              </button>

              <button
                type="button"
                onClick={() => openDanger("clearJournal")}
                className="h-11 px-4 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Trash2 size={15} /> Clear all decisions
              </button>

              <button
                type="button"
                onClick={() => openDanger("deleteAccount")}
                className="h-11 px-4 rounded-xl bg-destructive text-destructive-foreground hover:opacity-90 text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <Trash2 size={15} /> Delete account
              </button>
            </div>
          </section>
        </div>
      )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Import Backup Confirmation Modal */}
      <AnimatePresence>
        {importDraft && (
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={() => !importBusy && setImportDraft(null)}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 rounded-2xl bg-accent/15 border border-accent/35 text-accent grid place-items-center shrink-0">
                    <Upload size={18} />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg font-bold">Import .soichose vault</h3>
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 border border-accent/30 px-2 py-0.5 text-[10px] font-bold text-accent">
                        <ShieldCheck size={11} /> Verified
                      </span>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground truncate max-w-[240px]">
                      {importDraft.fileName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setImportDraft(null)}
                  aria-label="Close"
                  className="p-1.5 rounded-xl text-muted-foreground hover:bg-muted transition"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl border border-border/70 bg-background/50 p-3">
                  <strong className="block text-lg font-bold text-foreground">
                    {importDraft.projectsCount}
                  </strong>
                  <span className="text-[11px] text-muted-foreground">Collections</span>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/50 p-3">
                  <strong className="block text-lg font-bold text-foreground">
                    {importDraft.decisionsCount}
                  </strong>
                  <span className="text-[11px] text-muted-foreground">Decisions</span>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/50 p-3">
                  <strong className="block text-lg font-bold text-foreground">
                    {importDraft.chatsCount}
                  </strong>
                  <span className="text-[11px] text-muted-foreground">Messages</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Imported items are safely added with fresh IDs alongside your existing journal — nothing current will be overwritten.
              </p>

              {importDraft.hasPrefs && (
                <label className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={restorePrefsOnImport}
                    onChange={(e) => setRestorePrefsOnImport(e.target.checked)}
                    className="h-4 w-4 rounded accent-accent shrink-0"
                  />
                  <span>Also restore theme &amp; companion settings</span>
                </label>
              )}

              {dangerError && (
                <p className="text-xs font-semibold text-rose-400" role="alert">
                  {dangerError}
                </p>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setImportDraft(null)}
                  className="h-10 px-4 rounded-xl border border-border bg-background/50 text-xs font-semibold hover:bg-muted transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={importBusy}
                  onClick={() => void handleConfirmImport()}
                  className="h-10 px-4 rounded-xl bg-accent text-accent-foreground text-xs font-bold disabled:opacity-40 hover:opacity-95 transition"
                >
                  {importBusy ? "Importing…" : "Import into account"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Safe Confirmation Modal */}
      <AnimatePresence>
        {dangerModal && (
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={() => !dangerBusy && setDangerModal(null)}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 grid place-items-center shrink-0">
                    <AlertTriangle size={18} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold leading-tight">
                      {dangerModal === "deleteAccount"
                        ? "Delete your account?"
                        : dangerModal === "clearJournal"
                          ? "Clear all decisions?"
                          : "Clear chat history?"}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      This action is permanent.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDangerModal(null)}
                  aria-label="Close"
                  className="p-1.5 rounded-xl text-muted-foreground hover:bg-muted transition"
                >
                  <X size={16} />
                </button>
              </div>

              {dangerModal === "deleteAccount" && (
                <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4 text-xs space-y-2.5">
                  <p className="text-foreground leading-relaxed">
                    Removes <strong>{user?.email}</strong>, your collections, decisions, outcomes, chats, and custom companion from our database. Next sign-in starts fresh.
                  </p>
                  <button
                    type="button"
                    onClick={() => void handleExportBackup()}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
                  >
                    <Download size={13} /> Download .soichose backup first
                  </button>
                </div>
              )}

              {dangerModal === "clearJournal" && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Deletes all decisions, collections, outcomes, plans, and chats while keeping your account and companion settings.
                </p>
              )}

              {dangerModal !== "clearChat" && (
                <div className="space-y-3.5">
                  <label className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={confirmChecked}
                      onChange={(e) => setConfirmChecked(e.target.checked)}
                      className="h-4 w-4 rounded accent-rose-500 shrink-0"
                    />
                    <span>I understand this cannot be undone.</span>
                  </label>

                  <div className="space-y-1.5">
                    <span className="text-xs text-muted-foreground block">
                      Type{" "}
                      <code className="px-1.5 py-0.5 rounded-md bg-muted font-mono font-bold text-foreground">
                        {dangerModal === "deleteAccount" ? "DELETE MY ACCOUNT" : "CLEAR JOURNAL"}
                      </code>{" "}
                      below:
                    </span>
                    <input
                      type="text"
                      value={confirmPhrase}
                      onChange={(e) => setConfirmPhrase(e.target.value)}
                      placeholder={
                        dangerModal === "deleteAccount" ? "DELETE MY ACCOUNT" : "CLEAR JOURNAL"
                      }
                      className="!h-10 w-full rounded-xl border border-border bg-background/75 px-3.5 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/60"
                    />
                  </div>
                </div>
              )}

              {dangerError && (
                <p className="text-xs font-semibold text-rose-400" role="alert">
                  {dangerError}
                </p>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setDangerModal(null)}
                  className="h-10 px-4 rounded-xl border border-border bg-background/50 text-xs font-semibold hover:bg-muted transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={
                    dangerBusy ||
                    (dangerModal === "deleteAccount" &&
                      (!confirmChecked || confirmPhrase.trim() !== "DELETE MY ACCOUNT")) ||
                    (dangerModal === "clearJournal" &&
                      (!confirmChecked || confirmPhrase.trim() !== "CLEAR JOURNAL"))
                  }
                  onClick={() => void handleConfirmDanger()}
                  className="h-10 px-4 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold disabled:opacity-40 hover:opacity-90 transition"
                >
                  {dangerBusy
                    ? "Deleting…"
                    : dangerModal === "deleteAccount"
                      ? "Delete account"
                      : dangerModal === "clearJournal"
                        ? "Clear decisions"
                        : "Clear chat history"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedGate>
      <SettingsStudio />
    </ProtectedGate>
  );
}
