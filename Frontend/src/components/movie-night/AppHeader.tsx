import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Popcorn, LogOut } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { GoogleIcon } from "@/components/movie-night/AuthForm";
import * as authService from "@/services/api/authService";
import { useSession } from "@/context/RoomContext";

export interface AppHeaderProps {
  /** Signed-in user name shown as a chip on the right. */
  userName?: string | null | undefined;
  subtitle?: string | undefined;
  className?: string;
}

export function AppHeader({ userName: propUserName, subtitle, className }: AppHeaderProps) {
  const session = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch by waiting for client mount before rendering authenticated state
  const userName = mounted
    ? propUserName !== undefined
      ? propUserName
      : session.user?.name
    : null;

  const handleSignOut = async () => {
    await authService.signOut();
    toast.success("Signed out successfully");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md",
        className,
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_20px_-8px_color-mix(in_oklab,var(--color-primary)_70%,transparent)]">
            <Popcorn size={18} strokeWidth={2} />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight text-foreground">Movie Night Planner</span>
            {subtitle ? (
              <span className="max-w-[45vw] truncate text-xs text-muted-foreground">{subtitle}</span>
            ) : null}
          </span>
        </Link>
        {userName ? (
          <div className="flex items-center gap-2">
            <span className="max-w-[35vw] truncate rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground">
              {userName}
            </span>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
              title="Sign out"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center">
            <Link
              to="/signin"
              className="flex items-center gap-2 rounded-xl border border-border/80 bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-sm transition-all hover:border-primary/50 hover:bg-card/80 no-underline"
            >
              <GoogleIcon className="size-4 shrink-0" />
              <span>Sign in with Google</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
