"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Briefcase,
  Compass,
  Flame,
  PenTool,
  Rocket,
  CalendarCheck,
  Target,
  ArrowRight,
  ArrowLeft,
  Check,
  Shuffle,
  Home,
  Cpu,
  Heart,
  MoreHorizontal,
  BookOpen,
  Wallet,
  Feather,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useTheme } from "@/components/theme/ThemeProvider";
import { JournalArt } from "@/components/illustrations/JournalArt";
import {
  CHARACTER_CATALOG,
  createRandomStyle,
  recommendPreferencesFromPersona,
  THEME_PRESETS,
  type AgeGroup,
  type CharacterId,
  type UserGoal,
  type UserPreferences,
  type UserRole,
} from "@/lib/preferences";

const ROLES: { id: UserRole; label: string; icon: React.ReactNode }[] = [
  { id: "student", label: "Student", icon: <GraduationCap size={16} /> },
  { id: "professional", label: "Working Pro", icon: <Briefcase size={16} /> },
  { id: "founder", label: "Founder / Builder", icon: <Rocket size={16} /> },
  { id: "creator", label: "Creator", icon: <PenTool size={16} /> },
  { id: "parent", label: "Parent / Family", icon: <Home size={16} /> },
  { id: "researcher", label: "Engineer / Analyst", icon: <Cpu size={16} /> },
  { id: "explorer", label: "Life Explorer", icon: <Compass size={16} /> },
  { id: "mindful", label: "Mindful Thinker", icon: <Heart size={16} /> },
  { id: "other", label: "Other", icon: <MoreHorizontal size={16} /> },
];

const AGE_GROUPS: { id: AgeGroup; label: string }[] = [
  { id: "under_20", label: "Under 20" },
  { id: "20_26", label: "20 – 26" },
  { id: "27_35", label: "27 – 35" },
  { id: "36_45", label: "36 – 45" },
  { id: "46_plus", label: "46+" },
];

const GOALS: { id: UserGoal; label: string; icon: React.ReactNode }[] = [
  { id: "life_career", label: "Life & career moves", icon: <Compass size={15} /> },
  { id: "ideas_projects", label: "Ideas & projects", icon: <Flame size={15} /> },
  { id: "daily_habits", label: "Daily clarity", icon: <CalendarCheck size={15} /> },
  { id: "tough_calls", label: "Tough decisions", icon: <Target size={15} /> },
  { id: "studies_skills", label: "Studies & skills", icon: <BookOpen size={15} /> },
  { id: "money_investing", label: "Money & finance", icon: <Wallet size={15} /> },
  { id: "relationships", label: "Relationships", icon: <Heart size={15} /> },
  { id: "creative_growth", label: "Creative growth", icon: <Feather size={15} /> },
  { id: "other", label: "Other", icon: <MoreHorizontal size={15} /> },
];

export function PersonalizeOnboardingModal() {
  const { isAuthenticated, isHydrated, user } = useAuthStore();
  const { preferences, updatePreferences, accountPrefsReady } = useTheme();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<UserRole>("explorer");
  const [customRole, setCustomRole] = useState("");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("20_26");
  const [goal, setGoal] = useState<UserGoal>("life_career");
  const [customGoal, setCustomGoal] = useState("");
  const [customDraft, setCustomDraft] = useState<UserPreferences | null>(null);
  const [customName, setCustomName] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isHydrated || !isAuthenticated || !user || !accountPrefsReady) return null;
  if (preferences.onboardingCompleted) return null;

  const baseRecommended = recommendPreferencesFromPersona(role, ageGroup, goal);
  const activePreview = customDraft ?? baseRecommended;
  const charMeta = CHARACTER_CATALOG[activePreview.character.id];
  const presetMeta = THEME_PRESETS.find((p) => p.id === activePreview.presetId);
  const displayName = customName.trim() || activePreview.character.name;

  const previewThemeLive = (next: UserPreferences) => {
    setCustomDraft(next);
    updatePreferences({ ...next, onboardingCompleted: false }, false);
  };

  const handleEnterStep3 = () => {
    const rec = recommendPreferencesFromPersona(role, ageGroup, goal);
    previewThemeLive(rec);
    setStep(3);
  };

  const handleShuffle = () => {
    const rand = createRandomStyle();
    const merged: UserPreferences = {
      ...activePreview,
      ...rand,
      persona: { role, ageGroup, goal },
      character: {
        ...activePreview.character,
        ...(rand.character || {}),
      },
    };
    setCustomName("");
    previewThemeLive(merged);
  };

  const handleFinish = () => {
    setSaving(true);
    updatePreferences({
      ...activePreview,
      onboardingCompleted: true,
      persona: {
        role,
        customRole: role === "other" && customRole.trim() ? customRole.trim() : undefined,
        ageGroup,
        goal,
        customGoal: goal === "other" && customGoal.trim() ? customGoal.trim() : undefined,
      },
      character: {
        ...activePreview.character,
        name: displayName,
      },
    });
    setSaving(false);
  };

  const handleSkip = () => {
    updatePreferences({ onboardingCompleted: true });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Personalize So I Chose"
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-6 my-auto"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
            So I Chose · {step}/3
          </span>
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs text-muted-foreground hover:text-foreground transition"
          >
            Skip
          </button>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Hi{user.name ? `, ${user.name.split(" ")[0]}` : ""}! What describes you best?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {ROLES.map((item) => {
                const active = role === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id)}
                    className={`h-12 flex items-center gap-3 px-3.5 rounded-2xl border text-left transition ${
                      active
                        ? "border-accent bg-accent/15 shadow-sm text-foreground"
                        : "border-border bg-background/50 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span
                      className={`h-8 w-8 rounded-xl grid place-items-center shrink-0 ${
                        active ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <strong className="text-xs sm:text-[13px] font-bold leading-tight">{item.label}</strong>
                  </button>
                );
              })}
            </div>

            {role === "other" && (
              <input
                type="text"
                maxLength={32}
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="Tell us briefly (optional, e.g. Doctor, Freelancer)…"
                className="!h-10 w-full rounded-xl border border-accent/40 bg-background/70 px-3.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent"
              />
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-bold hover:opacity-95 transition"
              >
                Next <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Your age &amp; focus
            </h2>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Age
              </span>
              <div className="flex flex-wrap gap-2">
                {AGE_GROUPS.map((ag) => (
                  <button
                    key={ag.id}
                    type="button"
                    onClick={() => setAgeGroup(ag.id)}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition ${
                      ageGroup === ag.id
                        ? "border-accent bg-accent/15 text-foreground"
                        : "border-border bg-background/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {ag.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Focus
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {GOALS.map((g) => {
                  const active = goal === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGoal(g.id)}
                      className={`h-11 flex items-center gap-2.5 px-3.5 rounded-2xl border text-left transition ${
                        active
                          ? "border-primary bg-primary/15 text-foreground"
                          : "border-border bg-background/50 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="text-primary shrink-0">{g.icon}</span>
                      <strong className="text-xs sm:text-[13px] font-bold leading-tight">{g.label}</strong>
                    </button>
                  );
                })}
              </div>
              {goal === "other" && (
                <input
                  type="text"
                  maxLength={40}
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="What are you hoping to get clarity on? (optional)…"
                  className="!h-10 mt-2 w-full rounded-xl border border-primary/40 bg-background/70 px-3.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft size={15} /> Back
              </button>
              <button
                type="button"
                onClick={handleEnterStep3}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-bold hover:opacity-95 transition"
              >
                Meet companion <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-2xl font-bold tracking-tight">
                Your app is <span className="text-accent">yours.</span>
              </h2>
              <button
                type="button"
                onClick={handleShuffle}
                className="h-9 inline-flex items-center gap-1.5 px-3.5 rounded-xl border border-accent/40 bg-accent/10 text-accent text-xs font-bold hover:bg-accent/20 transition"
              >
                <Shuffle size={14} /> Surprise me
              </button>
            </div>

            {/* Clean Centered Showcase */}
            <div
              className="rounded-2xl border p-5 flex flex-col sm:flex-row items-center justify-between gap-5 transition-colors"
              style={{
                borderColor: activePreview.accentColor + "55",
                background:
                  activePreview.themeMode === "light"
                    ? "rgba(255, 252, 245, 0.92)"
                    : "rgba(18, 12, 24, 0.55)",
              }}
            >
              <div className="flex items-center gap-4">
                <JournalArt
                  kind="chat"
                  reaction="celebrating"
                  characterOverride={{ ...activePreview.character, name: displayName }}
                />
                <div>
                  <h3 className="font-display text-xl font-bold">{displayName}</h3>
                  <span className="text-xs text-muted-foreground capitalize block mt-0.5">
                    {presetMeta?.name || "Custom"} · {activePreview.character.tone} voice
                  </span>
                </div>
              </div>

              <input
                type="text"
                maxLength={24}
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={`Name (${charMeta.defaultName})…`}
                className="!h-10 w-full sm:w-48 rounded-xl border border-border bg-background/80 px-3.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Clean Stacked Selectors */}
            <div className="space-y-3.5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  Companion
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(Object.keys(CHARACTER_CATALOG) as CharacterId[]).map((cid) => (
                    <button
                      key={cid}
                      type="button"
                      onClick={() => {
                        setCustomName("");
                        previewThemeLive({
                          ...activePreview,
                          character: {
                            ...activePreview.character,
                            id: cid,
                            name: CHARACTER_CATALOG[cid].defaultName,
                            accessory: CHARACTER_CATALOG[cid].defaultAccessory,
                          },
                        });
                      }}
                      className={`h-9 px-2 rounded-xl border text-xs font-bold transition ${
                        activePreview.character.id === cid
                          ? "border-accent bg-accent/15 text-foreground"
                          : "border-border bg-background/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {CHARACTER_CATALOG[cid].defaultName}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  Theme Palette
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {THEME_PRESETS.map((p) => {
                    const active = activePreview.presetId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          previewThemeLive({
                            ...activePreview,
                            presetId: p.id,
                            themeMode: p.themeMode,
                            primaryColor: p.primaryColor,
                            accentColor: p.accentColor,
                          })
                        }
                        className={`h-10 px-3 rounded-xl border flex items-center justify-between gap-2 text-xs font-semibold transition ${
                          active
                            ? "border-accent bg-accent/15 text-foreground"
                            : "border-border bg-background/50 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <span>{p.name}</span>
                        <span className="flex items-center gap-1 shrink-0">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: p.primaryColor }} />
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: p.accentColor }} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="h-10 px-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft size={15} /> Back
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleFinish}
                className="h-10 inline-flex items-center gap-2 px-6 rounded-xl bg-accent text-accent-foreground text-sm font-bold hover:opacity-95 transition"
              >
                <Check size={16} /> Start
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
