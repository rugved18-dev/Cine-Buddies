import type { ReactNode } from "react";
import { Star } from "lucide-react";

import { PosterPlaceholder } from "@/components/common/PosterPlaceholder";
import { MatchScore } from "@/components/common/MatchScore";
import { cn } from "@/lib/utils";
import { contentTypeLabel } from "@/lib/movie-format";
import type { Movie } from "@/types/movie-night";

export interface MovieCardProps {
  movie: Movie;
  /** Position in the ranked list, rendered as a corner badge. */
  rank?: number;
  onDetails: (movie: Movie) => void;
  /** Extra content rendered under the summary (e.g. vote controls). */
  below?: ReactNode;
  className?: string;
}

/** Recommendation card built around the reusable 2:3 poster placeholder. */
export function MovieCard({ movie, rank, onDetails, below, className }: MovieCardProps) {
  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40",
        movie.featured && "border-primary/50 glow-primary",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onDetails(movie)}
        aria-label={`View details for ${movie.title}`}
        className="relative block w-full cursor-pointer text-left"
      >
        <PosterPlaceholder
          title={movie.title}
          tag={movie.type ? contentTypeLabel(movie.type) : "Movie"}
          posterPath={movie.posterPath}
          icon={movie.type === "MOVIES" ? "film" : "clapperboard"}
        />
        {rank ? (
          <span className="absolute left-2.5 top-2.5 flex size-7 items-center justify-center rounded-full border border-border/70 bg-background/85 text-xs font-bold text-foreground backdrop-blur-sm">
            {rank}
          </span>
        ) : null}
        {movie.featured ? (
          <span className="absolute left-2.5 top-10 rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
            Best match
          </span>
        ) : null}
      </button>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-foreground">{movie.title}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {movie.year} {movie.runtime ? `· ${movie.runtime} ` : ""}· {movie.language}
            </p>
          </div>
          <MatchScore value={movie.groupMatch} size={48} />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="flex items-center gap-1 rounded-md bg-warning/10 px-2 py-0.5 font-semibold text-warning">
            <Star size={11} className="fill-warning" /> {movie.rating ? movie.rating.toFixed(1) : "N/A"}
          </span>
          {movie.genres && movie.genres.length > 0
            ? movie.genres.slice(0, 3).map((genre) => (
                <span key={genre} className="rounded-md border border-border/70 px-2 py-0.5 text-muted-foreground">
                  {genre}
                </span>
              ))
            : null}
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {movie.overview || "Recommended based on your group taste."}
        </p>

        {below}

        <button
          type="button"
          onClick={() => onDetails(movie)}
          className="mt-auto cursor-pointer self-start text-xs font-semibold text-primary underline-offset-4 hover:underline"
        >
          Why this pick? View details
        </button>
      </div>
    </article>
  );
}
