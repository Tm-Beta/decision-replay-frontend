"use client";

import { useAuthStore } from "@/store/useAuthStore";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              width?: number;
              logo_alignment?: "left" | "center";
            }
          ) => void;
          prompt: () => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token?: string;
              error?: string;
              error_description?: string;
            }) => void;
            error_callback?: (err: unknown) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

/**
 * Triggers genuine Google OAuth 2.0 authentication.
 * Opens Google's native account chooser popup window, or redirects to accounts.google.com.
 */
export async function launchGoogleSignIn(onSuccess?: () => void, onError?: (msg: string) => void) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    const msg = "Google Client ID is not configured.";
    onError?.(msg);
    return;
  }

  // 1. If Google GIS OAuth2 token client is available, open native Google popup window
  if (typeof window !== "undefined" && window.google?.accounts?.oauth2) {
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "openid email profile",
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            console.error("Google OAuth error:", tokenResponse.error);
            onError?.(tokenResponse.error_description || "Google sign-in was cancelled.");
            return;
          }

          if (tokenResponse.access_token) {
            try {
              await useAuthStore.getState().loginWithGoogleAccessToken(tokenResponse.access_token);
              onSuccess?.();
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : "Authentication failed with backend.";
              onError?.(message);
            }
          }
        },
        error_callback: (err) => {
          console.error("Google token client error:", err);
          onError?.("Failed to launch Google sign-in window.");
        },
      });

      client.requestAccessToken({ prompt: "" });
      return;
    } catch (e) {
      console.warn("Error using GIS token client, falling back to direct OAuth redirect:", e);
    }
  }

  // 2. Direct Fallback: Native OAuth 2.0 redirect to accounts.google.com
  if (typeof window !== "undefined") {
    const redirectUri = window.location.origin;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token&scope=${encodeURIComponent(
      "openid email profile"
    )}&include_granted_scopes=true`;

    window.location.href = authUrl;
  }
}

