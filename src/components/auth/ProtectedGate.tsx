"use client";

import React from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { AuthGate } from "@/components/auth/AuthGate";
import { DecisionReplayLoader } from "@/components/ui/DecisionReplayLoader";

interface ProtectedGateProps {
  children: React.ReactNode;
}

export function ProtectedGate({ children }: ProtectedGateProps) {
  const { isAuthenticated, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return <DecisionReplayLoader size="fullscreen" />;
  }

  if (!isAuthenticated) {
    return <AuthGate />;
  }

  return <>{children}</>;
}

