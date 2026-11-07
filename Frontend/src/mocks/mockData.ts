/**
 * Fallback exports to prevent cached bundle runtime errors.
 */
export const CURRENT_MEMBER_ID = "00000000-0000-0000-0000-000000000001";
export const DEMO_ROOM_CODE = "DEMO42";
export const PERSONA_IDS: Record<string, string> = {
  RAHUL: "00000000-0000-0000-0000-000000000002",
  SAM: "00000000-0000-0000-0000-000000000003",
};
export const PERSONA_VOTES: Record<string, any> = {};
export const RECOMMENDATIONS: any[] = [];
export const DEFAULT_PREFERENCES = {
  contentTypes: ["MOVIES"],
  genres: ["Action", "Sci-Fi"],
  languages: ["English"],
  minRating: 7.0,
  releasePeriod: "ANY_YEAR" as const,
  excludedGenres: [],
  watchedTitles: [],
};
