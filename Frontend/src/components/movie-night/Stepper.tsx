import { Link, useRouterState } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Clapperboard, ListChecks, Sparkles, Trophy, Users, Vote } from "lucide-react";

import { cn } from "@/lib/utils";

const STEPS = [
  { key: "lobby", label: "Lobby", icon: Users, to: "/room/$code" },
  { key: "preferences", label: "Preferences", icon: ListChecks, to: "/room/$code/preferences" },
  { key: "analysis", label: "Analysis", icon: Sparkles, to: "/room/$code/analysis" },
  { key: "recommendations", label: "Picks", icon: Clapperboard, to: "/room/$code/recommendations" },
  { key: "voting", label: "Voting", icon: Vote, to: "/room/$code/voting" },
  { key: "result", label: "Result", icon: Trophy, to: "/room/$code/result" },
] as const;

export interface StepperProps {
  code: string;
  className?: string;
}

/** Flow progress bar shared by every room screen. */
export function Stepper({ code, className }: StepperProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const current =
    STEPS.find((step) => step.key !== "lobby" && pathname.endsWith(`/${step.key}`))?.key ?? "lobby";

  return (
    <nav aria-label="Movie night progress" className={cn("mb-8 flex gap-2 overflow-x-auto pb-1 scrollbar-subtle", className)}>
      {STEPS.map((step, index) => {
        const isActive = step.key === current;
        const Icon = step.icon;
        return (
          <Link
            key={step.key}
            to={step.to}
            params={{ code }}
            aria-current={isActive ? "step" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors no-underline",
              isActive
                ? "border-primary/60 bg-primary/15 text-lavender"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full text-[10px] font-bold",
                isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {index + 1}
            </span>
            {step.label}
          </Link>
        );
      })}
    </nav>
  );
}
