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

  // Guard: Step 5 (Voting) requires preferences & recommendations before voting begins
  useEffect(() => {
    if (!room) return;
    const members = room.members || [];
    const readyCount = members.filter((m) => m.preferencesSubmitted).length;
    if (readyCount === 0) {
      toast.error("Submit preferences first before starting group voting.");
      void navigate({ to: "/room/$code", params: { code: room.code } });
    }
  }, [room, navigate]);

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
const joinedMembers = members.filter((m) => m.joined);
const totalJoined = Math.max(joinedMembers.length, 1);

const myMemberId =
  roomService.getMyMemberId(room.code) ||
  members.find((m) => session.user?.name && m.name?.toLowerCase() === session.user.name.toLowerCase())?.id;

const hostMember = members.find((m) => m.isHost) || members[0];
const isHost = myMemberId === hostMember?.id;

// Count how many candidate movies each member has voted on
const candidateCount = movies.length;
const memberVoteCounts = new Map<string, number>();
for (const vote of allVotes) {
  memberVoteCounts.set(vote.memberId, (memberVoteCounts.get(vote.memberId) || 0) + 1);
}

// A member is completely done when they have voted on all candidate movies
const completedMembers = joinedMembers.filter((m) => {
  const count = memberVoteCounts.get(m.id) || 0;
  return candidateCount > 0 ? count >= candidateCount : count > 0;
});

// STRICT GATE: Winner can only be revealed when ALL joined members have completed voting
const allMembersHaveVoted = candidateCount > 0 && completedMembers.length >= totalJoined;
const myVotedCount = Object.keys(userVotes).length;

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
  if (!isHost) {
    toast.error("Only the room host can reveal the group winner.");
    return;
  }
  if (!movies.length) {
    toast.error("No movies available to finalize.");
    return;
  }

  // Require ALL members to have completed voting
  if (!allMembersHaveVoted) {
    const remaining = joinedMembers.filter((m) => !completedMembers.some((c) => c.id === m.id));
    const remainingNames = remaining.map((r) => r.name).join(", ");
    toast.error(
      `Cannot reveal winner yet: waiting for ${remainingNames} to finish voting (${completedMembers.length} of ${totalJoined} members finished).`
    );
    return;
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
          {candidateCount} titles.
        </p>
      </div>
      {isHost ? (
        <Button
          size="lg"
          onClick={() => void handleFinalize()}
          disabled={finalizing || !allMembersHaveVoted}
          title={
            !allMembersHaveVoted
              ? `Waiting for all members to finish voting (${completedMembers.length} of ${totalJoined} ready)`
              : "Reveal the group winner"
          }
        >
          <Trophy size={16} /> {finalizing ? "Finalizing…" : "Reveal the winner"}
        </Button>
      ) : (
        <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-secondary/50 px-3.5 py-2 text-xs font-medium text-muted-foreground">
          <Users size={14} className="text-primary" />
          <span>Waiting for host to reveal winner once all members finish voting</span>
        </div>
      )}
    </header>

    {/* Group readiness banner with per-member ballot count */}
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4">
      <div className="flex items-center gap-3">
        <Users size={18} className="text-primary" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Group voting progress: {completedMembers.length} of {totalJoined} members completed
          </p>
          <p className="text-xs text-muted-foreground">
            {allMembersHaveVoted
              ? "All group members have completed voting! The host can now reveal the group winner."
              : "All members must cast their votes on all titles so the winner accurately reflects everyone's tastes."}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {joinedMembers.map((member) => {
          const count = memberVoteCounts.get(member.id) || 0;
          const isDone = candidateCount > 0 ? count >= candidateCount : count > 0;
          return (
            <span
              key={member.id}
              className={`rounded-full px-2.5 py-1 text-xs font-medium border flex items-center gap-1.5 ${
                isDone
                  ? "border-success/40 bg-success/15 text-success font-semibold"
                  : "border-border/60 bg-muted/60 text-muted-foreground"
              }`}
              title={
                isDone
                  ? `${member.name} has completed voting (${count}/${candidateCount})`
                  : `${member.name} is still voting (${count}/${candidateCount})`
              }
            >
              <span>{member.name}</span>
              <span className="text-[10px] font-mono">
                ({count}/{candidateCount})
              </span>
              {isDone ? "✓" : "⏳"}
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
