import { Clapperboard, Film } from "lucide-react";

import { cn } from "@/lib/utils";

export interface PosterPlaceholderProps {
  /** Optional title rendered on a bottom strip. */
  title?: string;
  /** Small badge in the top-right corner (e.g. content type). */
  tag?: string;
  /**
   * Future TMDB integration: when a poster path is provided it is rendered
   * instead of the placeholder. The card layout never changes.
   */
  posterPath?: string | undefined;
  icon?: "film" | "clapperboard";
  className?: string;
}

/**
 * Reusable 2:3 poster container. Polished without any external image: a
 * subtly shaded surface, a centred icon and faint metadata placeholder lines.
 */
export function PosterPlaceholder({ title, tag, posterPath, icon = "clapperboard", className }: PosterPlaceholderProps) {
  const Icon = icon === "film" ? Film : Clapperboard;

  return (
    <div
      className={cn(
        "relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-border/70 bg-gradient-to-b from-secondary via-card to-background",
        className,
      )}
    >
      {posterPath ? (
        <img src={posterPath} alt={title ?? "Poster"} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <>
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 75% at 50% 0%, color-mix(in oklab, var(--color-primary) 16%, transparent), transparent 62%)",
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4">
            <span className="flex size-14 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary">
              <Icon size={26} strokeWidth={1.8} />
            </span>
            <div aria-hidden className="flex flex-col items-center gap-1.5">
              <span className="h-1.5 w-16 rounded-full bg-foreground/10" />
              <span className="h-1.5 w-10 rounded-full bg-foreground/10" />
            </div>
          </div>
        </>
      )}

      {tag ? (
        <span className="absolute right-2.5 top-2.5 rounded-md border border-border/70 bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm">
          {tag}
        </span>
      ) : null}

      {title && !posterPath ? (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent px-3 pb-2.5 pt-6">
          <p className="truncate text-xs font-medium text-foreground/90">{title}</p>
        </div>
      ) : null}
    </div>
  );
}
