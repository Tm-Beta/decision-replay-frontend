"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { apiClient } from "@/services/apiClient";
import { useAuthStore } from "@/store/useAuthStore";
import {
  applyPreferencesToDom,
  DEFAULT_PREFERENCES,
  mergePreferences,
  type ThemeMode,
  type UserPreferences,
} from "@/lib/preferences";

type PreferencesPatch = Omit<Partial<UserPreferences>, "character" | "persona"> & {
  character?: Partial<UserPreferences["character"]>;
  persona?: Partial<NonNullable<UserPreferences["persona"]>>;
};

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  preferences: UserPreferences;
  updatePreferences: (patch: PreferencesPatch, syncRemote?: boolean) => void;
  resetPreferences: () => Promise<void>;
  savingPreferences: boolean;
  preferencesSavedAt: number | null;
  accountPrefsReady: boolean;
}

const userStorageKey = (userId: string) => `soichose-prefs-user:${userId}`;

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, updateUserPreferences } = useAuthStore();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [preferencesSavedAt, setPreferencesSavedAt] = useState<number | null>(null);
  const [accountPrefsReady, setAccountPrefsReady] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncedUserId = useRef<string | null>(null);

  // 1. Keep public sign-in screen strictly on DEFAULT_PREFERENCES until an account is signed in
  useEffect(() => {
    applyPreferencesToDom(DEFAULT_PREFERENCES);
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
    };
  }, []);

  // 2. Multi-account safe sync: never bleed Account A settings into login screen or Account B!
  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
      syncedUserId.current = null;
      setAccountPrefsReady(false);
      setPreferences(DEFAULT_PREFERENCES);
      applyPreferencesToDom(DEFAULT_PREFERENCES);
      return;
    }
    if (syncedUserId.current === user.id) return;

    // Switching account: cancel any stale debounced save from previous user
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    syncedUserId.current = user.id;
    setAccountPrefsReady(false);

    const applyForUser = (prefs: UserPreferences) => {
      setPreferences(prefs);
      applyPreferencesToDom(prefs);
      try {
        localStorage.setItem(userStorageKey(user.id), JSON.stringify(prefs));
      } catch {}
    };

    if (user.preferences && Object.keys(user.preferences).length > 0) {
      applyForUser(mergePreferences(user.preferences));
      setAccountPrefsReady(true);
      return;
    }

    // Check backend for authoritative user preferences first
    let active = true;
    apiClient<{ status: string; data?: { preferences?: Partial<UserPreferences> } }>("/auth/me")
      .then((res) => {
        if (!active || syncedUserId.current !== user.id) return;
        const serverPrefs = res?.data?.preferences;
        if (serverPrefs && Object.keys(serverPrefs).length > 0) {
          const merged = mergePreferences(serverPrefs);
          applyForUser(merged);
          updateUserPreferences(merged);
        } else {
          // Fallback to this specific user's local cache, or clean DEFAULT_PREFERENCES
          let fallback = DEFAULT_PREFERENCES;
          try {
            const perUser = localStorage.getItem(userStorageKey(user.id));
            if (perUser) fallback = mergePreferences(JSON.parse(perUser));
          } catch {}
          applyForUser(fallback);
        }
        setAccountPrefsReady(true);
      })
      .catch(() => {
        if (!active || syncedUserId.current !== user.id) return;
        let fallback = DEFAULT_PREFERENCES;
        try {
          const perUser = localStorage.getItem(userStorageKey(user.id));
          if (perUser) fallback = mergePreferences(JSON.parse(perUser));
        } catch {}
        applyForUser(fallback);
        setAccountPrefsReady(true);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, user, updateUserPreferences]);

  const persistRemote = useCallback(
    (next: UserPreferences, targetUserId?: string) => {
      if (!isAuthenticated || !targetUserId) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      setSavingPreferences(true);
      saveTimer.current = setTimeout(async () => {
        if (syncedUserId.current !== targetUserId) return;
        try {
          await apiClient("/auth/preferences", {
            method: "PATCH",
            body: JSON.stringify(next),
          });
          if (syncedUserId.current === targetUserId) {
            updateUserPreferences(next);
            setPreferencesSavedAt(Date.now());
          }
        } catch {
          // Keep local changes applied even if network is temporarily offline
        } finally {
          setSavingPreferences(false);
        }
      }, 320);
    },
    [isAuthenticated, updateUserPreferences],
  );

  const updatePreferences = useCallback(
    (patch: PreferencesPatch, syncRemote = true) => {
      const currentUid = user?.id;
      if (!isAuthenticated || !currentUid) return;
      setPreferences((prev) => {
        const next: UserPreferences = {
          ...prev,
          ...patch,
          persona: patch.persona
            ? { ...(prev.persona || {}), ...patch.persona }
            : prev.persona,
          character: {
            ...prev.character,
            ...(patch.character || {}),
          },
        };
        applyPreferencesToDom(next);
        try {
          if (currentUid) {
            localStorage.setItem(userStorageKey(currentUid), JSON.stringify(next));
          }
        } catch {}
        if (syncRemote && currentUid) persistRemote(next, currentUid);
        return next;
      });
    },
    [isAuthenticated, persistRemote, user?.id],
  );

  const resetPreferences = useCallback(async () => {
    const cleanReset: UserPreferences = {
      ...DEFAULT_PREFERENCES,
      onboardingCompleted: preferences.onboardingCompleted,
      persona: preferences.persona,
    };
    setPreferences(cleanReset);
    applyPreferencesToDom(cleanReset);
    try {
      if (user?.id) {
        localStorage.setItem(userStorageKey(user.id), JSON.stringify(cleanReset));
      }
    } catch {}
    if (isAuthenticated && user?.id) {
      setSavingPreferences(true);
      try {
        await apiClient("/auth/preferences", {
          method: "PATCH",
          body: JSON.stringify(cleanReset),
        });
        updateUserPreferences(cleanReset);
        setPreferencesSavedAt(Date.now());
      } catch {}
      setSavingPreferences(false);
    }
  }, [isAuthenticated, user?.id, preferences.onboardingCompleted, preferences.persona, updateUserPreferences]);

  const setTheme = useCallback(
    (newTheme: ThemeMode) => {
      updatePreferences({ themeMode: newTheme });
    },
    [updatePreferences],
  );

  const toggleTheme = useCallback(() => {
    updatePreferences({
      themeMode: preferences.themeMode === "dark" ? "light" : "dark",
    });
  }, [preferences.themeMode, updatePreferences]);

  return (
    <ThemeContext.Provider
      value={{
        theme: preferences.themeMode,
        toggleTheme,
        setTheme,
        preferences,
        updatePreferences,
        resetPreferences,
        savingPreferences,
        preferencesSavedAt,
        accountPrefsReady,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
