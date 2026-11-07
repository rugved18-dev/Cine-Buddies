import { Link, useRouterState } from "@tanstack/react-router";
import { Clapperboard, ListChecks, Lock, Sparkles, Trophy, Users, Vote, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { useRoomByCode, useSession } from "@/context/RoomContext";
import * as roomService from "@/services/api/roomService";
import type { Room } from "@/types/movie-night";

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
  room?: Room;
  className?: string;
}

  /** Flow progress bar with sequential step-unlocking and access gating. */
  export function Stepper({ code, room: propRoom, className }: StepperProps) {
    const contextRoom = useRoomByCode(code);
    const room = propRoom || contextRoom;
    const session = useSession();
    const pathname = useRouterState({ select: (state) => state.location.pathname });

    const current =
      STEPS.find((step) => step.key !== "lobby" && pathname.endsWith(`/${step.key}`))?.key ?? "lobby";

    const currentIndex = STEPS.findIndex((s) => s.key === current);

    const members = room?.members || [];
    const joined = members.filter((m) => m.joined);
    const myMemberId =
      (room?.code ? roomService.getMyMemberId(room.code) : null) ||
      members.find((m) => session.user?.name && m.name?.toLowerCase() === session.user.name.toLowerCase())?.id;
    const isJoined = Boolean(myMemberId);

    const readyCount = joined.filter((m) => m.preferencesSubmitted).length;
    const allReady = joined.length > 0 && readyCount === joined.length;
    const isFinalized = Boolean(room?.isFinalized || room?.finalized || room?.winnerMovieId);

    // Sequential step gating logic:
    // 1. Lobby: always unlocked
    // 2. Preferences: unlocked only after joining the room lobby
    // 3. Analysis: unlocked when members submit preferences (readyCount > 0)
    // 4. Picks: unlocked when preferences/analysis are ready (readyCount > 0)
    // 5. Voting: unlocked when picks are available (readyCount > 0)
    // 6. Result: unlocked ONLY after the group vote is finalized
    const isStepUnlocked = (key: string): boolean => {
      switch (key) {
        case "lobby":
          return true;
        case "preferences":
          return isJoined;
        case "analysis":
          return isJoined && (allReady || readyCount > 0);
        case "recommendations":
          return isJoined && (allReady || readyCount > 0);
        case "voting":
          return isJoined && (allReady || readyCount > 0);
        case "result":
          return isFinalized;
        default:
          return false;
      }
    };

    return (
      <nav aria-label="Movie night progress" className={cn("mb-8 flex gap-2 overflow-x-auto pb-1 scrollbar-subtle", className)}>
        {STEPS.map((step, index) => {
          const isActive = step.key === current;
          const unlocked = isStepUnlocked(step.key);
          const isPast = index < currentIndex && unlocked;

          if (!unlocked) {
            return (
              <div
                key={step.key}
                aria-disabled="true"
                title={`Step locked: Complete previous steps to unlock ${step.label}`}
                className="flex shrink-0 items-center gap-2 rounded-full border border-border/40 bg-muted/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground/60 cursor-not-allowed select-none"
              >
                <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] text-muted-foreground/50">
                  <Lock size={10} />
                </span>
                <span>{step.label}</span>
              </div>
            );
          }

          return (
            <Link
              key={step.key}
              to={step.to}
              params={{ code }}
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all no-underline",
                isActive
                ? "border-primary/60 bg-primary/15 text-lavender shadow-sm"
                : isPast
                  ? "border-emerald-500/30 bg-card text-emerald-400 hover:border-emerald-500/50"
                  : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-border/80"
            )
        }
          >
          <span
            className={cn(
              "flex size-5 items-center justify-center rounded-full text-[10px] font-bold",
              isActive
                ? "bg-primary text-primary-foreground"
                : isPast
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-muted text-muted-foreground"
            )}
          >
            {isPast ? <Check size={11} strokeWidth={3} /> : index + 1}
          </span>
            { step.label }
          </Link>
    );
  })
}
    </nav >
  );
}
