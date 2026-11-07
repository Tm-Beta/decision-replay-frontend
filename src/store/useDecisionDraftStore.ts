// ==============================================================================
// RESPONSIBLE MEMBER: Member B (Frontend Lead - Creation Wizard & Snapshot UI)
// FEATURE: Client State Management for Multi-Step Decision Creation Wizard
//
// TODO: [Member B]
// 1. Maintain form drafts across steps (Choice, Reasoning, Hypotheses, Pre-Mortem).
// 2. Add local storage persistence so users don't lose drafts on accidental refresh.
// 3. Connect real-time state changes to the Socratic challenger sidebar.
// ==============================================================================

import { create } from "zustand";
import { Alternative, Assumption, PreMortem } from "../types/decision.types";

interface DecisionDraftState {
  currentStep: number;
  title: string;
  category: string;
  projectId: string;
  choice: string;
  context: string;
  decisionReason: string;
  beliefRationale: string;
  expectedOutcome: string;
  confidence: number;
  reviewDate: string;
  assumptions: Assumption[];
  alternatives: Alternative[];
  preMortems: PreMortem[];

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateField: (field: string, value: unknown) => void;
  addAssumption: (assumption: Assumption) => void;
  removeAssumption: (index: number) => void;
  addAlternative: (alternative: Alternative) => void;
  removeAlternative: (index: number) => void;
  addPreMortem: (preMortem: PreMortem) => void;
  removePreMortem: (index: number) => void;
  resetDraft: () => void;
}

const initialDraft = {
  currentStep: 0,
  title: "",
  category: "ENGINEERING",
  projectId: "",
  choice: "",
  context: "",
  decisionReason: "",
  beliefRationale: "",
  expectedOutcome: "",
  confidence: 70,
  reviewDate: "",
  assumptions: [],
  alternatives: [],
  preMortems: [],
};

export const useDecisionDraftStore = create<DecisionDraftState>((set) => ({
  ...initialDraft,

  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(2, state.currentStep + 1) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),

  updateField: (field, value) =>
    set((state) => ({
      ...state,
      [field]: value,
    })),

  addAssumption: (assumption) =>
    set((state) => ({
      assumptions: [...state.assumptions, assumption],
    })),

  removeAssumption: (index) =>
    set((state) => ({
      assumptions: state.assumptions.filter((_, i) => i !== index),
    })),

  addAlternative: (alternative) =>
    set((state) => ({
      alternatives: [...state.alternatives, alternative],
    })),

  removeAlternative: (index) =>
    set((state) => ({
      alternatives: state.alternatives.filter((_, i) => i !== index),
    })),

  addPreMortem: (preMortem) =>
    set((state) => ({
      preMortems: [...state.preMortems, preMortem],
    })),

  removePreMortem: (index) =>
    set((state) => ({
      preMortems: state.preMortems.filter((_, i) => i !== index),
    })),

  resetDraft: () => set({ ...initialDraft }),
}));
