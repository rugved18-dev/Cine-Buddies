/**
 * Production API client for CineBuddies Spring Boot REST Backend.
 */

const env = import.meta.env as Record<string, string | undefined>;
export const API_BASE_URL: string = env["VITE_API_BASE_URL"] || "http://localhost:8081/api";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Executes a typed REST request against the Spring Boot backend.
 * Automatically injects the JWT Bearer authorization header if present.
 */
export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("jwt_token") || localStorage.getItem("cinebuddies_jwt")
      : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((init.headers as Record<string, string>) ?? {}),
  };

  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  try {
    const response = await fetch(url, {
      ...init,
      headers,
    });

    if (!response.ok) {
      let errMessage = `Request to ${path} failed with status ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson.error) errMessage = errorJson.error;
        else if (errorJson.message) errMessage = errorJson.message;
      } catch {
        const text = await response.text().catch(() => "");
        if (text) errMessage = text;
      }
      throw new ApiError(errMessage, response.status);
    }

    // Handle 204 No Content or empty bodies
    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    return JSON.parse(text) as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      err instanceof Error ? err.message : `Failed to connect to backend at ${API_BASE_URL}`,
      0,
    );
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
