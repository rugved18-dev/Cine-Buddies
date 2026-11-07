import { cn } from "@/lib/utils";

export interface ChipGroupProps {
  options: { value: string; label: string }[];
  selected: string[];
  onToggle?: (value: string) => void;
  onChange?: (selected: string[]) => void;
  /** "select" marks inclusion, "exclude" styles the chip as an exclusion. */
  tone?: "select" | "exclude";
  size?: "sm" | "md";
  className?: string;
  ariaLabel?: string;
}

/** Reusable toggle-chip group used for genres, languages and content types. */
  export function ChipGroup({
    options,
    selected,
    onToggle,
    onChange,
    tone = "select",
    size = "md",
    className,
    ariaLabel,
  }: ChipGroupProps) {
    const handleClick = (value: string) => {
      if (onToggle) {
        onToggle(value);
      }
      if (onChange) {
        const next = selected.includes(value)
          ? selected.filter((item) => item !== value)
          : [...selected, value];
        onChange(next);
      }
    };

    return (
        <div
          role="group"
          aria-label={ariaLabel}
          className={cn("flex flex-wrap gap-2", className)}
        >
          {options.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleClick(option.value)}
                className={cn(
                  "cursor-pointer rounded-full border font-medium transition-all active:scale-[0.97]",
                  size === "md" ? "px-3.5 py-1.5 text-sm" : "px-3 py-1 text-xs",
                  isSelected &&
                  tone === "select" &&
                  "border-primary/70 bg-primary/15 text-lavender shadow-[0_0_16px_-4px_color-mix(in_oklab,var(--color-primary)_55%,transparent)]",
                  isSelected &&
                  tone === "exclude" &&
                  "border-destructive/60 bg-destructive/10 text-destructive line-through",
                  !isSelected &&
                  "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        );
}
