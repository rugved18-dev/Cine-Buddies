/**
 * Voting service communicating directly with Spring Boot
 * (POST /api/rooms/{code}/members/{memberId}/votes, POST /api/rooms/{code}/finalize, GET /api/rooms/{code}/votes).
 */

import { request } from "@/services/api/apiClient";
import { normalizeRoomCode } from "@/services/api/roomService";
import type { Movie, VoteChoice, VoteTally } from "@/types/movie-night";

export const VOTE_POINTS: Record<VoteChoice, number> = { YES: 2, MAYBE: 1, NO: 0 };

export interface BackendVote {
  id: string;
  roomCode: string;
  movieId: string;
  memberId: string;
  choice: VoteChoice;
}

const VOTES_CACHE_PREFIX = "cinebuddies_votes_";

export function getLocalVotes(roomCode: string): Record<string, VoteChoice> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(`${VOTES_CACHE_PREFIX}${normalizeRoomCode(roomCode)}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setLocalVote(roomCode: string, movieId: string, choice: VoteChoice): void {
  if (typeof window === "undefined") return;
  const current = getLocalVotes(roomCode);
  current[movieId] = choice;
  localStorage.setItem(`${VOTES_CACHE_PREFIX}${normalizeRoomCode(roomCode)}`, JSON.stringify(current));
}

export async function getRoomVotes(roomCode: string): Promise<BackendVote[]> {
  const code = normalizeRoomCode(roomCode);
  try {
    return await request<BackendVote[]>(`/rooms/${code}/votes`);
  } catch {
    return [];
  }
}

export async function castVote(
  roomCode: string,
  movieId: string,
  memberId: string,
  choice: VoteChoice,
  movieMeta?: { title?: string; year?: number; language?: string }
): Promise<void> {
  const code = normalizeRoomCode(roomCode);

  await request(`/rooms/${code}/members/${memberId}/votes`, {
    method: "POST",
    body: JSON.stringify({
      movieId,
      movieTitle: movieMeta?.title || "Movie " + movieId,
      releaseYear: movieMeta?.year || 2024,
      language: movieMeta?.language || "English",
      choice,
    }),
  });

  // Track the local user's vote for instant UI feedback
  setLocalVote(code, movieId, choice);
}

export async function finalizeVoting(
  roomCode: string,
  hostId: string,
  winnerMovieId: string
): Promise<void> {
  const code = normalizeRoomCode(roomCode);

  await request(`/rooms/${code}/finalize?hostId=${hostId}`, {
    method: "POST",
    body: JSON.stringify({ winnerMovieId }),
  });
}

  /**
   * Calculates aggregate scores across ALL votes submitted by ALL group members.
   */
  export function calculateGroupScores(
    movies: Movie[],
  allVotes: BackendVote[]
): Record < string, { yes: number; maybe: number; no: number; score: number } > {
    const result: Record<string, { yes: number; maybe: number; no: number; score: number }> = { };

  for (const movie of movies) {
    const movieVotes = allVotes.filter((v) => v.movieId === movie.id);
    const yes = movieVotes.filter((v) => v.choice === "YES").length;
    const maybe = movieVotes.filter((v) => v.choice === "MAYBE").length;
    const no = movieVotes.filter((v) => v.choice === "NO").length;
    const score = yes * VOTE_POINTS.YES + maybe * VOTE_POINTS.MAYBE;
    result[movie.id] = { yes, maybe, no, score };
  }

  return result;
}

  /**
   * Determines the winning movie based on the highest total score across ALL group members.
   * Ties are broken by the highest groupMatch percentage.
   */
  export function determineGroupWinner(
    movies: Movie[],
    allVotes: BackendVote[]
  ): Movie | null {
    if (!movies.length) return null;

    const tallies = calculateGroupScores(movies, allVotes);

    let bestMovie = movies[0];
    let highestScore = -1;

    for (const movie of movies) {
      const tally = tallies[movie.id] || { score: 0 };
      if (
        tally.score > highestScore ||
        (tally.score === highestScore && (movie.groupMatch ?? 0) > (bestMovie.groupMatch ?? 0))
      ) {
        highestScore = tally.score;
        bestMovie = movie;
      }
    }

    return bestMovie;
  }
