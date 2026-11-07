/**
 * Preference service communicating directly with Spring Boot
 * (PUT /api/rooms/{code}/members/{memberId}/preferences).
 */

import { request } from "@/services/api/apiClient";
import { normalizeRoomCode } from "@/services/api/roomService";
import { DEFAULT_PREFERENCES, type Preferences } from "@/types/movie-night";

const PREF_STORAGE_PREFIX = "cinebuddies_pref_";

export async function submitPreferences(
  roomCode: string,
  memberId: string,
  preferences: Preferences,
): Promise<Preferences> {
  const code = normalizeRoomCode(roomCode);

  await request(`/rooms/${code}/members/${memberId}/preferences`, {
    method: "PUT",
    body: JSON.stringify({
      genres: preferences.genres,
      excludedGenres: preferences.excludedGenres,
      languages: preferences.languages,
      watchedTitles: preferences.watchedTitles,
      minRating: preferences.minRating,
      releasePeriod: preferences.releasePeriod,
    }),
  });

  // Cache user's submitted preferences locally for this room
  if (typeof window !== "undefined") {
    localStorage.setItem(`${PREF_STORAGE_PREFIX}${code}`, JSON.stringify(preferences));
  }

  return preferences;
}

export function getPreferences(roomCode: string): Preferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(`${PREF_STORAGE_PREFIX}${normalizeRoomCode(roomCode)}`);
    return raw ? JSON.parse(raw) : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}
