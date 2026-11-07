import { CircleHelp, ThumbsDown, ThumbsUp } from "lucide-react";

import { cn } from "@/lib/utils";
import type { VoteChoice } from "@/types/movie-night";

const CHOICES: {
  value: VoteChoice;
  label: string;
  points: string;
  icon: typeof ThumbsUp;
  activeClass: string;
}[] = [
  {
    value: "YES",
    label: "Yes",
    points: "2 pts",
    icon: ThumbsUp,
    activeClass: "border-success bg-success/15 text-success shadow-[0_0_16px_-4px_color-mix(in_oklab,var(--color-success)_60%,transparent)]",
  },
  {
    value: "MAYBE",
    label: "Maybe",
    points: "1 pt",
    icon: CircleHelp,
    activeClass: "border-warning bg-warning/15 text-warning",
  },
  {
    value: "NO",
    label: "No",
    points: "0 pt",
    icon: ThumbsDown,
    activeClass: "border-destructive/70 bg-destructive/10 text-destructive",
  },
];

export interface VoteControlsProps {
  /** Currently selected choice for the current user, if any. */
  value?: VoteChoice | undefined;
  onVote: (choice: VoteChoice) => void;
  className?: string;
}

/** Yes (+2) / Maybe (+1) / No (0) voting controls. */
export function VoteControls({ value, onVote, className }: VoteControlsProps) {
  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {CHOICES.map((choice) => {
        const Icon = choice.icon;
        const isSelected = value === choice.value;
        return (
          <button
            key={choice.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onVote(choice.value)}
            className={cn(
              "flex cursor-pointer flex-col items-center gap-0.5 rounded-xl border px-2 py-2 text-xs font-semibold transition-all active:scale-[0.97]",
              isSelected
                ? choice.activeClass
                : "border-border bg-secondary/60 text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            <Icon size={15} />
            {choice.label}
            <span className="text-[10px] font-medium opacity-80">{choice.points}</span>
          </button>
        );
      })}
    </div>
  );
}
