/**
 * Recommendation and Analysis service communicating directly with Spring Boot
 * (GET /api/rooms/{code}/recommendations, GET /api/rooms/{code}/analysis).
 */

import { request } from "@/services/api/apiClient";
import { normalizeRoomCode } from "@/services/api/roomService";
import type { GroupAnalysis, Movie } from "@/types/movie-night";

interface BackendRecommendation {
  movieId: string;
  title: string;
  overview: string;
  posterPath: string;
  releaseYear: number;
  rating: number;
  language: string;
  groupMatchPercentage: number;
}

export async function getRecommendations(roomCode: string): Promise<Movie[]> {
  const code = normalizeRoomCode(roomCode);
  const results = await request<BackendRecommendation[]>(`/rooms/${code}/recommendations`);

  return results.map((r) => ({
    id: r.movieId,
    title: r.title,
    year: r.releaseYear,
    language: r.language,
    rating: r.rating,
    overview: r.overview,
    posterPath: r.posterPath,
    groupMatch: Math.round(r.groupMatchPercentage),
  }));
}

export async function getGroupAnalysis(roomCode: string): Promise<GroupAnalysis> {
  const code = normalizeRoomCode(roomCode);
  return await request<GroupAnalysis>(`/rooms/${code}/analysis`);
}
