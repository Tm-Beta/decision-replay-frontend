import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Assumption {
  statement: string;
  metricTarget?: string;
  confidence: number; // 1-100
}

export interface Alternative {
  title: string;
  pros: string;
  cons: string;
}

export interface PreMortem {
  failureScenario: string;
  preventiveAction?: string;
  severityScore: number; // 0-100
}

interface DraftData {
  selectedPlan: string;
  decidedOn: string;
  outcomeKnown: boolean;
  confidenceText: string;
  influences: string[];

  branchKey: string;
  currentStep: number; // 0, 1, 2
  title: string;
  category: string;
  choice: string;
  context: string;
  decisionReason: string;
  beliefRationale: string;
  expectedOutcome: string;
  confidence: number;
  reviewTime: string;
  reviewDate: string;
  assumptions: Assumption[];
  alternatives: Alternative[];
  preMortems: PreMortem[];
}

interface DraftStore extends DraftData {
  switchBranch: (key: string, seed: Partial<DraftData>) => void;
  saved: Record<string, Partial<DraftData>>;
  setField: <K extends keyof DraftData>(key: K, value: DraftData[K]) => void;
  updateField: <K extends keyof DraftData>(key: K, value: DraftData[K]) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetDraft: () => void;

  addAssumption: (a: Assumption) => void;
  removeAssumption: (index: number) => void;
  addAlternative: (alt: Alternative) => void;
  removeAlternative: (index: number) => void;
  addPreMortem: (pm: PreMortem) => void;
  removePreMortem: (index: number) => void;
}

const initialState: DraftData = {
  selectedPlan: "",
  decidedOn: "",
  outcomeKnown: false,
  influences: [],
  confidenceText: "",
  branchKey: "",
  currentStep: 0,
  title: "",
  category: "",
  choice: "",
  context: "",
  decisionReason: "",
  beliefRationale: "",
  expectedOutcome: "",
  confidence: 50,
  reviewDate: "",
  reviewTime: "09:00",
  assumptions: [],
  alternatives: [],
  preMortems: [],
};

export const useDecisionDraftStore = create<DraftStore>()(
  persist(
    (set) => ({
      ...initialState,

      saved: {},
      switchBranch: (key, seed) =>
        set((s) => {
          if (s.branchKey === key) return {};
          const saved = { ...s.saved };
          if (s.branchKey)
            saved[s.branchKey] = Object.fromEntries(
              Object.keys(initialState).map((k) => [
                k,
                s[k as keyof DraftData],
              ]),
            );
          const previous = saved[key];
          delete saved[key];
          return {
            ...initialState,
            ...seed,
            ...previous,
            branchKey: key,
            saved,
          };
        }),
      setField: (key, value) => set({ [key]: value } as Partial<DraftStore>),
      updateField: (key, value) => set({ [key]: value } as Partial<DraftStore>),

      nextStep: () =>
        set((s) => ({ currentStep: Math.min(2, s.currentStep + 1) })),
      prevStep: () =>
        set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
      resetDraft: () => set(initialState),

      addAssumption: (a) =>
        set((s) => ({ assumptions: [...s.assumptions, a] })),
      removeAssumption: (i) =>
        set((s) => ({
          assumptions: s.assumptions.filter((_, idx) => idx !== i),
        })),

      addAlternative: (alt) =>
        set((s) => ({ alternatives: [...s.alternatives, alt] })),
      removeAlternative: (i) =>
        set((s) => ({
          alternatives: s.alternatives.filter((_, idx) => idx !== i),
        })),

      addPreMortem: (pm) => set((s) => ({ preMortems: [...s.preMortems, pm] })),
      removePreMortem: (i) =>
        set((s) => ({
          preMortems: s.preMortems.filter((_, idx) => idx !== i),
        })),
    }),
    { name: "decision-draft" },
  ),
);
