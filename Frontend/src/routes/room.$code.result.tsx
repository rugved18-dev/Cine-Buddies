import { useEffect, useState } from "react";
import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { RefreshCw, Trophy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { MatchScore } from "@/components/common/MatchScore";
import { PosterPlaceholder } from "@/components/common/PosterPlaceholder";
import { useRoomByCode } from "@/context/RoomContext";
import { getRecommendations } from "@/services/api/recommendationService";
import { getRoomVotes, type BackendVote } from "@/services/api/votingService";
import type { Movie } from "@/types/movie-night";

export const Route = createFileRoute("/room/$code/result")({
  component: ResultPage,
});

function ResultPage() {
  const { code } = Route.useParams();
  const room = useRoomByCode(code);
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [allVotes, setAllVotes] = useState<BackendVote[]>([]);
  const [loading, setLoading] = useState(true);

  const normalizedCode = code?.trim().toUpperCase() ?? "";

  // Guard: Step 6 (Result) can ONLY be accessed after Step 5 (Voting) is finalized
  useEffect(() => {
    if (!room) return;
    const isFinalized = Boolean(room.isFinalized || room.finalized || room.winnerMovieId);
    if (!isFinalized) {
      toast.error("The group vote has not been finalized yet. Cast your votes first!");
      void navigate({ to: "/room/$code/voting", params: { code: room.code } });
    }
  }, [room?.isFinalized, room?.finalized, room?.winnerMovieId, room?.code, navigate]);

  useEffect(() => {
    if (!normalizedCode) return;
    let active = true;
    setLoading(true);

    Promise.all([
      getRecommendations(normalizedCode).catch(() => []),
      getRoomVotes(normalizedCode).catch(() => []),
    ]).then(([recMovies, votes]) => {
      if (active) {
        setMovies(recMovies);
        setAllVotes(votes);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [normalizedCode]);

  if (!room) return null;

  if (loading) {
    return <LoadingState label="Finding the winning title…" />;
  }

  // Find winner: either room.winnerMovieId, or if room is finalized, first recommendation
  const winner =
    (room.winnerMovieId ? movies.find((m) => m.id === room.winnerMovieId) : null) ||
  ((room.isFinalized || room.finalized) && movies.length > 0 ? movies[0] : null);

  if (!winner) {
    return (
      <EmptyState
        icon={Trophy}
        title="No winner yet"
        description="The vote has not been finalized yet. Head back to the voting screen to cast your votes and reveal the group's pick."
        action={
          <Button onClick={() => void navigate({ to: "/room/$code/voting", params: { code: room.code } })}>
            Go to voting
          </Button>
        }
      />
    );
  }

  const winnerVotes = allVotes.filter((v) => v.movieId === winner.id);
  const yesCount = winnerVotes.filter((v) => v.choice === "YES").length;
  const maybeCount = winnerVotes.filter((v) => v.choice === "MAYBE").length;
  const noCount = winnerVotes.filter((v) => v.choice === "NO").length;
  const totalScore = yesCount * 2 + maybeCount * 1;

  const members = room.members || [];

  const startAnother = () => {
    toast.success("Ready for the next movie night!");
    void navigate({ to: "/create" });
  };

  return (
    <div className="space-y-8">
      <header className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-warning/40 bg-warning/10 px-4 py-1.5 text-xs font-semibold text-warning">
          <Trophy size={13} /> Group winner
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Tonight you're watching…
        </h1>
      </header>

      <div className="grid items-start gap-6 rounded-3xl border border-primary/40 bg-card p-6 glow-primary sm:grid-cols-[minmax(0,240px)_1fr] sm:p-8">
        <PosterPlaceholder
          title={winner.title}
          tag="Movie"
          posterPath={winner.posterPath}
          icon="film"
          className="mx-auto w-48 sm:w-full"
        />
        <div className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{winner.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {winner.year} · {winner.language} · rated {winner.rating ? winner.rating.toFixed(1) : "N/A"}/10
            </p>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">{winner.overview}</p>

          <div className="flex flex-wrap items-center gap-6">
            <MatchScore value={winner.groupMatch ?? 85} size={92} label="Group match" />
            <div className="space-y-1.5 text-sm">
              <p className="flex items-center gap-2">
                <span className="inline-flex min-w-9 justify-center rounded-md bg-success/15 px-2 py-0.5 text-xs font-bold text-success">
                  {yesCount} Yes
                </span>
                <span className="text-muted-foreground">+{yesCount * 2} pts</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="inline-flex min-w-9 justify-center rounded-md bg-warning/15 px-2 py-0.5 text-xs font-bold text-warning">
                  {maybeCount} Maybe
                </span>
                <span className="text-muted-foreground">+{maybeCount * 1} pt{maybeCount === 1 ? "" : "s"}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="inline-flex min-w-9 justify-center rounded-md bg-destructive/15 px-2 py-0.5 text-xs font-bold text-destructive">
                  {noCount} No
                </span>
                <span className="text-muted-foreground">+0 pts</span>
              </p>
              <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-lavender">
                Total group score: {totalScore} pts
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-secondary/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Why it won</p>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                Highest combined vote score across all group members.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                Strongest alignment with the group's preferred genres and language.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                Rated {winner.rating ? winner.rating.toFixed(1) : "high"} by global audiences on TMDB.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-border/70 bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Group Participation</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {members.map((member) => {
            const memberVotes = allVotes.filter((v) => v.memberId === member.id);
            return (
              <li
                key={member.id}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/50 px-4 py-2.5 text-sm"
              >
                <span className="text-foreground">{member.name}</span>
                <span className="text-xs text-muted-foreground">
                  {memberVotes.length > 0
                    ? `voted on ${memberVotes.length} title${memberVotes.length === 1 ? "" : "s"}`
                    : "no votes cast"}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={() => startAnother()}>
          <RefreshCw size={15} /> Start another movie night
        </Button>
        <Button variant="secondary" size="lg" onClick={() => void navigate({ to: "/" })}>
          Back to home
        </Button>
      </div>
    </div>
  );
}
