import { useEffect, useState } from "react";
import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { Trophy, Users, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/common/Button";
import { LoadingState } from "@/components/common/LoadingState";
import { MovieCard } from "@/components/movie-night/MovieCard";
import { MovieDetailsModal } from "@/components/movie-night/MovieDetailsModal";
import { VoteControls } from "@/components/movie-night/VoteControls";
import { useRoomByCode, useSession } from "@/context/RoomContext";
import { getRecommendations } from "@/services/api/recommendationService";
import * as roomService from "@/services/api/roomService";
import {
  type BackendVote,
  calculateGroupScores,
  castVote,
  determineGroupWinner,
  finalizeVoting,
  getLocalVotes,
  getRoomVotes,
  setLocalVote,
} from "@/services/api/votingService";
import type { Movie, VoteChoice } from "@/types/movie-night";

export const Route = createFileRoute("/room/$code/voting")({
  component: VotingPage,
});

function VotingPage() {
  const { code } = Route.useParams();
  const [selected, setSelected] = useState<Movie | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<Record<string, VoteChoice>>({});
  const [allVotes, setAllVotes] = useState<BackendVote[]>([]);
  const [finalizing, setFinalizing] = useState(false);

  useEffect(() => {
    setUserVotes(getLocalVotes(code));
  }, [code]);

  const room = useRoomByCode(code);
  const session = useSession();
  const navigate = useNavigate();

  const normalizedCode = code?.trim().toUpperCase() ?? "";

  // Load recommendations
  useEffect(() => {
    if (!normalizedCode) return;
    let active = true;
    setLoading(true);
    void getRecommendations(normalizedCode)
      .then((res) => {
        if (active) {
          setMovies(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [normalizedCode]);

  // Poll all room votes every 3 seconds to sync all group members in real-time
  useEffect(() => {
    if (!normalizedCode) return;
    let mounted = true;

    const fetchVotes = async () => {
      const votes = await getRoomVotes(normalizedCode);
      if (mounted) {
        setAllVotes(votes);
      }
    };

    void fetchVotes();
    const interval = setInterval(fetchVotes, 3000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [normalizedCode]);

  // Navigate when room is finalized
  useEffect(() => {
      if (room?.isFinalized || room?.finalized) {
        void navigate({ to: "/room/$code/result", params: { code: normalizedCode } });
      }
}, [room?.isFinalized, room?.finalized, normalizedCode, navigate]);

if (!room) return null;

const members = room.members || [];
const myMemberId =
  roomService.getMyMemberId(room.code) ||
  members.find((m) => session.user?.name && m.name?.toLowerCase() === session.user.name.toLowerCase())?.id ||
  members[0]?.id;

const hostMember = members.find((m) => m.isHost) || members[0];
const isHost = myMemberId === hostMember?.id;

// Track group participation: which members have cast at least one vote
const membersWhoVoted = new Set(allVotes.map((v) => v.memberId));
const myVotedCount = Object.keys(userVotes).length;
const totalMembers = Math.max(members.length, 1);
const allMembersHaveVoted = membersWhoVoted.size >= totalMembers;

// Group-wide score tallies per movie
const groupScores = calculateGroupScores(movies, allVotes);

const handleVote = async (movie: Movie, choice: VoteChoice) => {
  if (!myMemberId) {
    toast.error("Could not find your member profile in this room.");
    return;
  }

  // Immediate optimistic local update
  setUserVotes((prev) => ({ ...prev, [movie.id]: choice }));
  setLocalVote(normalizedCode, movie.id, choice);

  try {
    await castVote(normalizedCode, movie.id, myMemberId, choice, {
      title: movie.title,
      year: movie.year,
      language: movie.language,
    });

    // Refresh group votes immediately
    const refreshed = await getRoomVotes(normalizedCode);
    setAllVotes(refreshed);
  } catch {
    toast.error("Failed to record vote on the server.");
  }
};

const handleFinalize = async () => {
  if (!movies.length) {
    toast.error("No movies available to finalize.");
    return;
  }

    if (allVotes.length === 0 && myVotedCount === 0) {
      toast.error("At least one member must cast a vote before revealing the winner.");
      return;
    }

    // If some members have not voted yet, require confirmation
    if (!allMembersHaveVoted) {
      const confirmEarly = window.confirm(
        `Only ${membersWhoVoted.size} of ${totalMembers} members have voted so far. Finalize now and pick the winner based on current votes?`
      );
      if (!confirmEarly) return;
    }

      // Determine the true winning movie across ALL group votes
      const winner = determineGroupWinner(movies, allVotes);
      if (!winner) {
        toast.error("Could not calculate a winner from the cast votes.");
        return;
      }

      setFinalizing(true);
      try {
        const hostId = hostMember?.id || myMemberId;
        await finalizeVoting(normalizedCode, hostId, winner.id);
        toast.success(`Winner locked in: ${winner.title}`);
        await navigate({ to: "/room/$code/result", params: { code: normalizedCode } });
      } catch {
        toast.error("Failed to finalize voting. Check host permissions.");
      } finally {
        setFinalizing(false);
      }
    };

    return (
      <div className="space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Group Voting</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Yes = 2 points · Maybe = 1 point · No = 0 points. You voted on {myVotedCount} of{" "}
              {movies.length} titles.
            </p>
          </div>
          <Button size="lg" onClick={() => void handleFinalize()} disabled={finalizing}>
            <Trophy size={16} /> {finalizing ? "Finalizing…" : "Reveal the winner"}
          </Button>
        </header>

        {/* Group readiness banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-center gap-3">
            <Users size={18} className="text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Group voting progress: {membersWhoVoted.size} of {totalMembers} members voted
              </p>
              <p className="text-xs text-muted-foreground">
                {allMembersHaveVoted
                  ? "All group members have submitted their votes! The host can reveal the winner."
                  : "Waiting for everyone in the group to cast their votes so the result reflects the whole group."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {members.map((member) => {
              const hasVoted = membersWhoVoted.has(member.id);
              return (
                <span
                  key={member.id}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium border ${hasVoted
                      ? "border-success/40 bg-success/15 text-success"
                      : "border-border/60 bg-muted/60 text-muted-foreground"
                    }`}
                  title={hasVoted ? `${member.name} has voted` : `${member.name} has not voted yet`}
                >
                  {member.name} {hasVoted ? "✓" : "⏳"}
                </span>
              );
            })}
          </div>
        </div>

        {loading ? (
          <LoadingState label="Loading candidates for voting…" />
        ) : movies.length === 0 ? (
          <div className="rounded-2xl border border-border/70 bg-card p-8 text-center">
            <p className="text-muted-foreground">No recommendations to vote on yet.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {movies.map((movie, index) => {
              const currentChoice = userVotes[movie.id];
              const tally = groupScores[movie.id] || { yes: 0, maybe: 0, no: 0, score: 0 };

              return (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  rank={index + 1}
                  onDetails={setSelected}
                  below={
                    <div className="space-y-2.5">
                      {/* Live collective tally badge across ALL members */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium">
                        <span className="rounded-md bg-success/10 px-2 py-0.5 text-success">
                          {tally.yes} Yes
                        </span>
                        <span className="rounded-md bg-warning/10 px-2 py-0.5 text-warning">
                          {tally.maybe} Maybe
                        </span>
                        <span className="rounded-md bg-destructive/10 px-2 py-0.5 text-destructive">
                          {tally.no} No
                        </span>
                        <span className="ml-auto rounded-md bg-primary/10 px-2 py-0.5 font-bold text-lavender">
                          {tally.score} pts
                        </span>
                      </div>

                      <VoteControls
                        value={currentChoice}
                        onVote={(choice) => void handleVote(movie, choice)}
                      />
                    </div>
                  }
                />
              );
            })}
          </div>
        )}

        <MovieDetailsModal movie={selected} onClose={() => setSelected(null)} />
      </div>
    );
  }
