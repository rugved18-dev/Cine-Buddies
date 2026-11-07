/**
 * Authentication service for CineBuddies.
 *
 * Communicates end-to-end with Spring Boot (POST /api/auth/google) to verify
 * Google OAuth ID tokens, retrieve custom JWTs, and maintain session state.
 */

import { request } from "@/services/api/apiClient";
import * as roomService from "@/services/api/roomService";

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  displayName: string;
}

const AUTH_STORAGE_KEY = "cinebuddies_jwt";
const USER_STORAGE_KEY = "cinebuddies_user";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_STORAGE_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(AUTH_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function getStoredUser(): { id: string; email: string; displayName: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(USER_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: { id: string; email: string; displayName: string } | null): void {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
}

/**
 * Sends Google ID token to the Spring Boot backend (/api/auth/google).
 * The backend verifies the token using GoogleIdTokenVerifier, upserts the user
 * in Supabase PostgreSQL, and returns a signed CineBuddies JWT.
 */
export async function authenticateWithGoogle(idToken: string): Promise<AuthResponse> {
  if (!idToken || !idToken.trim()) {
    throw new Error("No Google ID token was received from Google.");
  }

  const response = await request<AuthResponse>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });

  setStoredToken(response.token);
  setStoredUser({
    id: response.userId,
    email: response.email,
    displayName: response.displayName,
  });

  await roomService.setUser({
    name: response.displayName,
    email: response.email,
  });

  return response;
}

export async function signOut(): Promise<void> {
  setStoredToken(null);
  setStoredUser(null);
  await roomService.clearSession();
}
