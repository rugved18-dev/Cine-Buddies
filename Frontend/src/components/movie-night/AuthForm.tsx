import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import * as authService from "@/services/api/authService";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string; select_by?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              logo_alignment?: "left" | "center";
              width?: number | string;
              locale?: string;
            },
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export interface AuthFormProps {
  mode?: "signin" | "signup";
}

export function GoogleIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

const GOOGLE_CLIENT_ID =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) ||
  "610110362365-k86f6tacfpeuv220vk3e42hno621q22s.apps.googleusercontent.com";

/**
 * Clean, end-to-end Google Authentication component.
 * Exclusively renders Google's official Sign-In button and handles ID token
 * verification against the Spring Boot backend.
 */
export function AuthForm({}: AuthFormProps = {}) {
  const navigate = useNavigate();
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Google Identity Services script if not already present
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }

    const scriptSrc = "https://accounts.google.com/gsi/client";
    const existing = document.querySelector(`script[src="${scriptSrc}"]`);

    if (!existing) {
      const script = document.createElement("script");
      script.src = scriptSrc;
      script.async = true;
      script.defer = true;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => setError("Failed to load Google Sign-In SDK. Check your network connection.");
      document.head.appendChild(script);
    } else {
      existing.addEventListener("load", () => setScriptLoaded(true));
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          setScriptLoaded(true);
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, []);

  // Initialize Google Identity Services and render button once SDK is ready
  useEffect(() => {
    if (!scriptLoaded || !window.google?.accounts?.id || !buttonContainerRef.current) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (credentialResponse) => {
          const idToken = credentialResponse?.credential;
          if (!idToken) {
            setError("Google did not return an ID token. Please try again.");
            return;
          }

          setSubmitting(true);
          setError(null);

          try {
            const authResult = await authService.authenticateWithGoogle(idToken);
            toast.success(`Welcome to CineBuddies, ${authResult.displayName}!`);
            await navigate({ to: "/create" });
          } catch (err: unknown) {
            const message =
              err instanceof Error
                ? err.message
                : "Unable to complete sign in with the backend server.";
            setError(message);
            toast.error(message);
          } finally {
            setSubmitting(false);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Clear any previous child nodes in container
      buttonContainerRef.current.innerHTML = "";

      // Render the official Google Sign-In Button
      window.google.accounts.id.renderButton(buttonContainerRef.current, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        text: "continue_with",
        shape: "pill",
        logo_alignment: "left",
        width: 320,
      });

      // Also trigger Google One Tap if eligible
      window.google.accounts.id.prompt();
    } catch (initErr) {
      console.error("[CineBuddies] Google Identity Services init error:", initErr);
    }
  }, [scriptLoaded, navigate]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center justify-center min-h-[50px] w-full pt-1">
        {submitting ? (
          <div className="flex items-center justify-center gap-2.5 py-4 text-sm text-primary font-medium">
            <Loader2 className="size-5 animate-spin" />
            <span>Verifying with backend…</span>
          </div>
        ) : (
          <div
            ref={buttonContainerRef}
            className="flex items-center justify-center w-full min-h-[44px]"
          />
        )}

        {!scriptLoaded && !submitting && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span>Connecting to Google Identity Services…</span>
          </div>
        )}
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive text-center justify-center">
          <AlertCircle className="size-4 shrink-0" />
          <p className="font-semibold">{error}</p>
        </div>
      ) : null}

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground border-t border-border/40 pt-4">
        <ShieldCheck className="size-3.5 text-emerald-500" />
        <span>End-to-End verified via Spring Boot backend & Supabase DB</span>
      </div>
    </div>
  );
}
