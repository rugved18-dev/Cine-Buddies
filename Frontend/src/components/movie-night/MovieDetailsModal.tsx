import { Sparkles, Star } from "lucide-react";

import { Modal } from "@/components/common/Modal";
import { MatchScore } from "@/components/common/MatchScore";
import { PosterPlaceholder } from "@/components/common/PosterPlaceholder";
import { contentTypeLabel } from "@/lib/movie-format";
import type { Movie } from "@/types/movie-night";

export interface MovieDetailsModalProps {
  movie: Movie | null;
  onClose: () => void;
  /** Room members used to label the individual satisfaction scores. */
  members?: { id: string; name: string }[];
}

/** "Why recommended" details modal for a recommendation. */
export function MovieDetailsModal({ movie, onClose, members = [] }: MovieDetailsModalProps) {
  if (!movie) return null;

  return (
    <Modal open={Boolean(movie)} onOpenChange={(open) => !open && onClose()} title={movie.title} className="sm:max-w-xl">
      <div className="grid gap-5 sm:grid-cols-[minmax(0,150px)_1fr]">
        <PosterPlaceholder
          title={movie.title}
          tag={movie.type ? contentTypeLabel(movie.type) : "Movie"}
          posterPath={movie.posterPath}
          icon={movie.type === "MOVIES" ? "film" : "clapperboard"}
        />
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 rounded-md bg-warning/10 px-2 py-0.5 font-semibold text-warning">
              <Star size={11} className="fill-warning" /> {movie.rating ? movie.rating.toFixed(1) : "N/A"}
            </span>
            <span>{movie.year}</span>
            {movie.runtime ? (
              <>
                <span>·</span>
                <span>{movie.runtime}</span>
              </>
            ) : null}
            <span>·</span>
            <span>{movie.language}</span>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">{movie.overview}</p>
          <div className="flex items-center gap-3">
            <MatchScore value={movie.groupMatch} size={56} label="Group match" />
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4 rounded-xl border border-border/70 bg-secondary/60 p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-lavender">
          <Sparkles size={15} /> Why this works for your group
        </p>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            Scores {movie.groupMatch}% compatibility with the group's preferred genres and ratings.
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            Matched in language: {movie.language}.
          </li>
        </ul>
      </div>
    </Modal>
  );
}
