import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient, setUnauthorizedHandler } from "@/services/apiClient";
import { invalidateDueReviews } from "@/lib/dueReviewsCache";
import type { UserPreferences } from "@/lib/preferences";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  preferences?: Partial<UserPreferences>;
}

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
  loginWithGoogleAccessToken: (accessToken: string) => Promise<{ isNewUser: boolean }>;
  loginWithGoogleCredential: (credential: string) => Promise<{ isNewUser: boolean }>;
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openTourModal: () => void;
  closeTourModal: () => void;
  completeTour: () => void;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
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

      loginWithGoogleAccessToken: async (accessToken: string) => {
        try {
          const res = await apiClient<{
            status: string;
            data: { user: UserProfile; token: string; isNewUser: boolean };
          }>("/auth/google", {
            method: "POST",
            body: JSON.stringify({ accessToken }),
          });

          const { user, token, isNewUser } = res.data;

          set({
            user,
            token,
            isAuthenticated: true,
            showAuthModal: false,
            showTourModal: false,
          });

          return { isNewUser };
        } catch (error) {
          console.error("Google access token login failed:", error);
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
            showTourModal: false,
          });

          return { isNewUser };
        } catch (error) {
          console.error("Google credential login failed:", error);
          throw error;
        }
      },

      logout: () => {
        invalidateDueReviews();
        if (typeof window !== "undefined") {
          localStorage.removeItem("decision-replay-auth");
          localStorage.removeItem("soichose-last-prefs");
          localStorage.removeItem("decision-replay-theme");
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          hasSeenTour: false,
          showAuthModal: false,
          showTourModal: false,
        });
      },

      openAuthModal: () => set({ showAuthModal: true }),
      closeAuthModal: () => set({ showAuthModal: false }),
      openTourModal: () => set({ showTourModal: true }),
      closeTourModal: () => set({ showTourModal: false }),
      completeTour: () => set({ hasSeenTour: true, showTourModal: false }),
      updateUserPreferences: (preferences) =>
        set((state) => ({
          user: state.user ? { ...state.user, preferences } : null,
        })),
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

// Automatically log out if an existing session receives 401 (expired/deleted account)
setUnauthorizedHandler(() => {
  const { isAuthenticated, logout } = useAuthStore.getState();
  if (isAuthenticated) logout();
});
