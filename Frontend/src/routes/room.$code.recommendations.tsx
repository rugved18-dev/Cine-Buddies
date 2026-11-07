import { useEffect, useState } from "react";
import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/common/Button";
import { LoadingState } from "@/components/common/LoadingState";
import { MovieCard } from "@/components/movie-night/MovieCard";
import { MovieDetailsModal } from "@/components/movie-night/MovieDetailsModal";
import { useRoomByCode, useSession } from "@/context/RoomContext";
import { getRecommendations } from "@/services/api/recommendationService";
import * as roomService from "@/services/api/roomService";
import type { Movie } from "@/types/movie-night";

export const Route = createFileRoute("/room/$code/recommendations")({
  component: RecommendationsPage,
});

function RecommendationsPage() {
  const { code } = Route.useParams();
  const room = useRoomByCode(code);
  const session = useSession();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[] | null>(null);
  const [selected, setSelected] = useState<Movie | null>(null);

  useEffect(() => {
    if (!room?.code) return;
    let active = true;
    void getRecommendations(room.code)
      .then((result) => {
        if (active) setMovies(result);
      })
      .catch(() => {
        if (active) setMovies([]);
      });
    return () => {
      active = false;
    };
  }, [room?.code]);

  if (!room) return null;

  const memberList = room.members || [];
  const myMemberId =
    roomService.getMyMemberId(room.code) ||
    memberList.find((member) => session.user?.name && member.name?.toLowerCase() === session.user.name.toLowerCase())?.id;
  const myMember = memberList.find((member) => member.id === myMemberId);
  const members = memberList.map((member) => ({ id: member.id, name: member.name }));

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Recommendations</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Ranked by group match for “{room.name}”. Open any card to see why it made the list.
          </p>
        </div>
        <Button size="lg" onClick={() => void navigate({ to: "/room/$code/voting", params: { code: room.code } })}>
          Start the group vote <ArrowRight size={15} />
        </Button>
      </header>

      {!movies ? (
        <LoadingState label="Generating recommendations from TMDB…" />
      ) : movies.length === 0 ? (
        <div className="rounded-2xl border border-border/70 bg-card p-8 text-center">
          <p className="text-muted-foreground">No recommendations could be generated yet. Ensure preferences have been submitted!</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {movies.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              rank={index + 1}
              onDetails={setSelected}
              below={
                myMember && !myMember.preferencesSubmitted ? (
                  <p className="rounded-lg bg-warning/10 px-2.5 py-1.5 text-[11px] font-medium text-warning">
                    Submit your preferences for sharper matches.
                  </p>
                ) : undefined
              }
            />
          ))}
        </div>
      )}

      <MovieDetailsModal movie={selected} members={members} onClose={() => setSelected(null)} />
    </div>
  );
}
