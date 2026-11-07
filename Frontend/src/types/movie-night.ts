/**
 * Domain types and UI options for Movie Night Planner (CineBuddies).
 */

export type ContentType = "MOVIES" | "TV_SERIES" | "WEB_SERIES";

export type VoteChoice = "YES" | "MAYBE" | "NO";

export type ReleasePeriod = "ANY_YEAR" | "LAST_5_YEARS" | "LAST_10_YEARS" | "CLASSIC";

export interface Member {
  id: string;
  name: string;
  isHost: boolean;
  joined: boolean;
  preferencesSubmitted: boolean;
}

export interface Room {
  code: string;
  name: string;
  contentTypes: ContentType[];
  createdAt: number | string;
  isFinalized?: boolean;
  winnerMovieId?: string | null;
  members: Member[];
}

export interface Preferences {
  contentTypes: ContentType[];
  genres: string[];
  languages: string[];
  minRating: number;
  releasePeriod: ReleasePeriod;
  excludedGenres: string[];
  watchedTitles: string[];
}

export interface Movie {
  id: string;
  title: string;
  year: number;
  type?: ContentType;
  genres?: string[];
  language: string;
  rating: number;
  runtime?: string;
  overview: string;
  posterPath?: string;
  groupMatch: number;
  featured?: boolean;
}

export interface MemberSummary {
  memberId: string;
  displayName: string;
  genres: string[];
  excludedGenres: string[];
}

export interface ContentTypeDistribution {
  type: ContentType;
  count: number;
}

export interface GroupAnalysis {
  memberSummaries: MemberSummary[];
  commonGenres: string[];
  commonLanguages: string[];
  averageMinRating: number;
  contentTypeDistribution: ContentTypeDistribution[];
  genreConflicts: string[];
  insight: string;
}

export interface VoteTally {
  movieId: string;
  yes: number;
  maybe: number;
  no: number;
  score: number;
}

export interface RoomResult {
  movie: Movie;
  tally: VoteTally;
  groupMatch: number;
  participation: { memberId: string; name: string; votesCast: number }[];
}

export const CONTENT_TYPE_OPTIONS: { value: ContentType; label: string; description: string }[] = [
  { value: "MOVIES", label: "Movies", description: "Feature films from every era" },
  { value: "TV_SERIES", label: "TV Series", description: "Binge-worthy episodic shows" },
  { value: "WEB_SERIES", label: "Web Series", description: "Streaming originals and indies" },
];

export const GENRE_OPTIONS = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Science Fiction",
  "Thriller",
];

export const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "Marathi",
  "Tamil",
  "Telugu",
  "Korean",
  "Japanese",
  "Spanish",
  "Other",
];

export const RELEASE_PERIOD_OPTIONS: { value: ReleasePeriod; label: string }[] = [
  { value: "ANY_YEAR", label: "Any year" },
  { value: "LAST_5_YEARS", label: "Last 5 years" },
  { value: "LAST_10_YEARS", label: "Last 10 years" },
  { value: "CLASSIC", label: "Classic content" },
];

export const WATCHED_SUGGESTIONS = [
  "Inception",
  "The Dark Knight",
  "Interstellar",
  "Stranger Things",
  "Squid Game",
  "Dune",
  "Parasite",
  "The Bear",
];

export const DEFAULT_PREFERENCES: Preferences = {
  contentTypes: ["MOVIES"],
  genres: ["Action", "Science Fiction"],
  languages: ["English"],
  minRating: 7.0,
  releasePeriod: "LAST_10_YEARS",
  excludedGenres: [],
  watchedTitles: [],
};
