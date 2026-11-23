"use client";

import React from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { AuthGate } from "@/components/auth/AuthGate";

interface ProtectedGateProps {
  children: React.ReactNode;
}

export function ProtectedGate({ children }: ProtectedGateProps) {
  const { isAuthenticated, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return (
      <div className="py-24 text-center text-xs text-muted-foreground">
        <div className="h-6 w-6 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
        <p>Loading Decision Replay workspace...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthGate />;
  }

  return <>{children}</>;
}

