import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "@/services/apiClient";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  hasSeenTour: boolean;
  showAuthModal: boolean;
  showTourModal: boolean;

  // Actions
  loginWithGoogle: (data: { email: string; name: string; avatar?: string }) => Promise<{ isNewUser: boolean }>;
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
      showAuthModal: false,
      showTourModal: false,

      loginWithGoogle: async (data) => {
        try {
          const res = await apiClient<{
            status: string;
            data: { user: UserProfile; token: string; isNewUser: boolean };
          }>("/auth/google", {
            method: "POST",
            body: JSON.stringify(data),
          });

          const { user, token, isNewUser } = res.data;

          set({
            user,
            token,
            isAuthenticated: true,
            showAuthModal: false,
            // If new user or hasn't seen tour, trigger tour
            showTourModal: isNewUser || !get().hasSeenTour,
          });

          return { isNewUser };
        } catch (error) {
          console.error("Login failed:", error);
          throw error;
        }
      },

      logout: () => {
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
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        hasSeenTour: state.hasSeenTour,
      }),
    }
  )
);
