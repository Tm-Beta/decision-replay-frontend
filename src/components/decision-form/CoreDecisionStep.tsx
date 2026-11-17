"use client";

import { useState } from "react";
import { useDecisionDraftStore } from "@/store/useDecisionDraftStore";
import {
  validateTitle,
  validateChoice,
  validateExpectedOutcome,
  expectedOutcomeHint,
} from "@/lib/validation";

const CATEGORIES = [
  "Career",
  "Product",
  "Finance",
  "Hiring",
  "Technology",
  "Strategy",
  "Personal",
  "Other",
];

const baseInput =
  "w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm " +
  "placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 transition-all";
const okInput = "border-border focus:ring-primary/30 focus:border-primary";
const badInput = "border-destructive/60 focus:ring-destructive/20 focus:border-destructive";

const labelClass = "block text-sm font-semibold text-foreground mb-1.5";
const hintClass = "text-xs text-muted-foreground mb-2";

export function CoreDecisionStep({ showErrors = false }: { showErrors?: boolean }) {
  const {
    title,
    category,
    choice,
    decisionReason,
    beliefRationale,
    expectedOutcome,
    confidence,
    setField,
  } = useDecisionDraftStore();

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (name: string) => setTouched((t) => ({ ...t, [name]: true }));
  const visible = (name: string) => showErrors || touched[name];

  const titleError = visible("title") ? validateTitle(title) : "";
  const choiceError = visible("choice") ? validateChoice(choice) : "";
  const outcomeError = visible("expectedOutcome") ? validateExpectedOutcome(expectedOutcome) : "";
  const outcomeHint = expectedOutcomeHint(expectedOutcome);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-foreground">The Choice</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Record what you decided and what you expect, before you know how it ends.
        </p>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className={labelClass}>
          Decision title <span className="text-destructive">*</span>
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setField("title", e.target.value)}
          onBlur={() => touch("title")}
          placeholder="e.g. Launch the app in March"
          className={`${baseInput} ${titleError ? badInput : okInput}`}
        />
        {titleError && <p className="text-xs text-destructive mt-1">{titleError}</p>}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className={labelClass}>
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setField("category", e.target.value)}
          className={`${baseInput} ${okInput}`}
        >
          <option value="">Select a category...</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Choice */}
      <div>
        <label htmlFor="choice" className={labelClass}>
          What did you choose? <span className="text-destructive">*</span>
        </label>
        <p className={hintClass}>State the option you are going with, in one or two sentences.</p>
        <textarea
          id="choice"
          value={choice}
          onChange={(e) => setField("choice", e.target.value)}
          onBlur={() => touch("choice")}
          rows={3}
          className={`${baseInput} ${choiceError ? badInput : okInput}`}
        />
        {choiceError && <p className="text-xs text-destructive mt-1">{choiceError}</p>}
      </div>

      {/* Decision reason */}
      <div>
        <label htmlFor="decisionReason" className={labelClass}>
          Why this choice?
        </label>
        <p className={hintClass}>The main reasons that tipped the decision.</p>
        <textarea
          id="decisionReason"
          value={decisionReason}
          onChange={(e) => setField("decisionReason", e.target.value)}
          rows={3}
          className={`${baseInput} ${okInput}`}
        />
      </div>

      {/* Belief rationale */}
      <div>
        <label htmlFor="beliefRationale" className={labelClass}>
          What do you believe that makes this the right call?
        </label>
        <p className={hintClass}>
          The underlying beliefs or evidence you are relying on right now.
        </p>
        <textarea
          id="beliefRationale"
          value={beliefRationale}
          onChange={(e) => setField("beliefRationale", e.target.value)}
          rows={3}
          className={`${baseInput} ${okInput}`}
        />
      </div>

      {/* Expected outcome */}
      <div>
        <label htmlFor="expectedOutcome" className={labelClass}>
          What do you expect to happen? <span className="text-destructive">*</span>
        </label>
        <p className={hintClass}>Be specific so it can be checked later.</p>
        <textarea
          id="expectedOutcome"
          value={expectedOutcome}
          onChange={(e) => setField("expectedOutcome", e.target.value)}
          onBlur={() => touch("expectedOutcome")}
          rows={3}
          className={`${baseInput} ${outcomeError ? badInput : okInput}`}
        />
        {outcomeError && <p className="text-xs text-destructive mt-1">{outcomeError}</p>}
        {!outcomeError && outcomeHint && (
          <p className="text-xs text-amber-700 mt-1">{outcomeHint}</p>
        )}
      </div>

      {/* Confidence slider */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="confidence" className="text-sm font-semibold text-foreground">
            How confident are you?
          </label>
          <span className="text-sm font-semibold text-primary tabular-nums">{confidence}%</span>
        </div>
        <input
          id="confidence"
          type="range"
          min={0}
          max={100}
          step={1}
          value={confidence}
          onChange={(e) => setField("confidence", Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Unsure</span>
          <span>Certain</span>
        </div>
      </div>
    </div>
  );
}