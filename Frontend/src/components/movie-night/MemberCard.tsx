import { Check, Clock, ListChecks, CircleDashed } from "lucide-react";

import { cn } from "@/lib/utils";
import { initialsOf } from "@/lib/movie-format";
import type { Member } from "@/types/movie-night";

export interface MemberCardProps {
  member: Member;
  isCurrentUser?: boolean;
  className?: string;
}

/** Room member card: avatar, host badge and join / preference status. */
export function MemberCard({ member, isCurrentUser, className }: MemberCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-4 transition-colors",
        isCurrentUser ? "border-primary/50 glow-primary" : "border-border/70",
        !member.joined && "opacity-75",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-full border text-sm font-bold",
            isCurrentUser
              ? "border-primary/50 bg-primary/20 text-lavender"
              : "border-border bg-secondary text-foreground",
          )}
        >
          {initialsOf(member.name)}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-2 truncate text-sm font-semibold text-foreground">
            {member.name}
            {isCurrentUser ? <span className="text-xs font-normal text-muted-foreground">(you)</span> : null}
            {member.isHost ? (
              <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-lavender">
                Host
              </span>
            ) : null}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            {member.joined ? (
              <>
                <Check size={13} className="text-success" /> In the room
              </>
            ) : (
              <>
                <Clock size={13} /> Waiting to join
              </>
            )}
          </p>
        </div>
      </div>
      <div
        className={cn(
          "mt-3 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium",
          member.preferencesSubmitted
            ? "bg-success/10 text-success"
            : "bg-warning/10 text-warning",
        )}
      >
        {member.preferencesSubmitted ? <ListChecks size={13} /> : <CircleDashed size={13} />}
        {member.preferencesSubmitted ? "Preferences submitted" : "Preferences pending"}
      </div>
    </div>
  );
}
