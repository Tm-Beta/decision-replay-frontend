"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export function GoogleOAuthListener() {
  const { loginWithGoogleAccessToken, loginWithGoogleCredential, isAuthenticated } = useAuthStore();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Check if returning from standard OAuth 2.0 redirect (#access_token=...)
    if (window.location.hash && window.location.hash.includes("access_token")) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");

      if (accessToken) {
        window.history.replaceState(null, "", window.location.pathname);
        loginWithGoogleAccessToken(accessToken).catch((err) => {
          console.error("Failed to authenticate with OAuth redirect token:", err);
        });
        return;
      }
    }

    // 2. Initialize ambient Google One-Tap prompt if not authenticated
    if (clientId && !isAuthenticated) {
      const checkGsi = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkGsi);

          try {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: async (response) => {
                if (response.credential) {
                  await loginWithGoogleCredential(response.credential);
                }
              },
              auto_select: false,
            });

            // Prompt One-Tap popup in supported browsers
            window.google.accounts.id.prompt();
          } catch (err) {
            console.warn("Google One-Tap initialization error:", err);
          }
        }
      }, 200);

      const timeout = setTimeout(() => clearInterval(checkGsi), 4000);
      return () => {
        clearInterval(checkGsi);
        clearTimeout(timeout);
      };
    }
  }, [clientId, isAuthenticated, loginWithGoogleAccessToken, loginWithGoogleCredential]);

  return null;
}
