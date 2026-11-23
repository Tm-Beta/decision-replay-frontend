import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "@/services/apiClient";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
}

export interface GoogleAccountOption {
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export const GOOGLE_TEAM_ACCOUNTS: GoogleAccountOption[] = [
  {
    name: "Chamath Adithya",
    email: "achamath1@gmail.com",
    role: "Team Lead & System Architect",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Chamath%20Adithya",
  },
  {
    name: "Dilu Gamage",
    email: "diluimasha13@gmail.com",
    role: "Frontend Engineer (Member B)",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Dilu%20Gamage",
  },
  {
    name: "Divyanjali Kawshalya",
    email: "divyanjalimeethalawa@gmail.com",
    role: "Backend Engines Lead (Member C)",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Divyanjali%20Kawshalya",
  },
  {
    name: "HJSR Sewwandi",
    email: "ict24929@fot.sjp.ac.lk",
    role: "Analytics & Services (Member D)",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=HJSR%20Sewwandi",
  },
];

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  hasSeenTour: boolean;
  isHydrated: boolean;
  showAuthModal: boolean;
  showTourModal: boolean;

  // Actions
  setHasHydrated: (state: boolean) => void;
  loginWithGoogle: (data?: { email: string; name: string; avatar?: string; credential?: string }) => Promise<{ isNewUser: boolean }>;
  loginWithGoogleCredential: (credential: string) => Promise<{ isNewUser: boolean }>;
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openTourModal: () => void;
  closeTourModal: () => void;
  completeTour: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hasSeenTour: false,
      isHydrated: false,
      showAuthModal: false,
      showTourModal: false,

      setHasHydrated: (state: boolean) => set({ isHydrated: state }),

      loginWithGoogle: async (data) => {
        const payload = data || {
          email: GOOGLE_TEAM_ACCOUNTS[0].email,
          name: GOOGLE_TEAM_ACCOUNTS[0].name,
          avatar: GOOGLE_TEAM_ACCOUNTS[0].avatar,
        };

        try {
          const res = await apiClient<{
            status: string;
            data: { user: UserProfile; token: string; isNewUser: boolean };
          }>("/auth/google", {
            method: "POST",
            body: JSON.stringify(payload),
          });

          const { user, token, isNewUser } = res.data;

          set({
            user,
            token,
            isAuthenticated: true,
            showAuthModal: false,
            // If new user or hasn't completed tour yet, launch tour
            showTourModal: isNewUser || !get().hasSeenTour,
          });

          return { isNewUser };
        } catch (error) {
          console.error("Google authentication failed:", error);
          throw error;
        }
      },

      loginWithGoogleCredential: async (credential: string) => {
        try {
          const res = await apiClient<{
            status: string;
            data: { user: UserProfile; token: string; isNewUser: boolean };
          }>("/auth/google", {
            method: "POST",
            body: JSON.stringify({ credential }),
          });

          const { user, token, isNewUser } = res.data;

          set({
            user,
            token,
            isAuthenticated: true,
            showAuthModal: false,
            showTourModal: isNewUser || !get().hasSeenTour,
          });

          return { isNewUser };
        } catch (error) {
          console.error("Google credential login failed:", error);
          throw error;
        }
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("decision-replay-auth");
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          showAuthModal: false,
          showTourModal: false,
        });
      },

      openAuthModal: () => set({ showAuthModal: true }),
      closeAuthModal: () => set({ showAuthModal: false }),
      openTourModal: () => set({ showTourModal: true }),
      closeTourModal: () => set({ showTourModal: false }),
      completeTour: () => set({ hasSeenTour: true, showTourModal: false }),
    }),
    {
      name: "decision-replay-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        hasSeenTour: state.hasSeenTour,
      }),
    }
  )
);
