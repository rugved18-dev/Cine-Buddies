/**
 * Production API client for CineBuddies Spring Boot REST Backend.
 */

const env = import.meta.env as Record<string, string | undefined>;

export function getApiBaseUrl(): string {
  const envUrl = env["VITE_API_BASE_URL"];
  if (typeof window !== "undefined") {
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (!isLocalhost && envUrl && (envUrl.includes("localhost") || envUrl.includes("127.0.0.1"))) {
      console.warn(
        `[CineBuddies] WARNING: Client is running in production (${window.location.origin}) but VITE_API_BASE_URL points to localhost (${envUrl}). Cloud users will not be able to connect to localhost.`,
      );
    }
  }
  return envUrl || "http://localhost:8081/api";
}

export const API_BASE_URL: string = getApiBaseUrl();

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
 * Includes a 35-second timeout to handle cloud backend cold-starts (e.g. Render free tier).
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

  const effectiveBaseUrl = getApiBaseUrl();
  const url = `${effectiveBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  // 60-second timeout to accommodate Render cloud backend cold-starts
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(new Error(`Request to ${url} timed out after 60s.`));
  }, 60000);

  const signal = init.signal
    ? anySignal([init.signal, controller.signal])
    : controller.signal;

  try {
    const response = await fetch(url, {
      ...init,
      headers,
      signal,
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

    console.error(`[CineBuddies API Error] Failed request to: ${url}`, err);

    const isLocalhostMisconfig =
      typeof window !== "undefined" &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1" &&
      (effectiveBaseUrl.includes("localhost") || effectiveBaseUrl.includes("127.0.0.1"));

    if (isLocalhostMisconfig) {
      throw new ApiError(
        `Configuration error: Site is running on Vercel (${window.location.hostname}) but trying to connect to ${url}. Add VITE_API_BASE_URL=<your-render-url>/api in Vercel project environment variables and redeploy.`,
        0,
      );
    }

    const isTimeout =
      (err instanceof DOMException && err.name === "AbortError") ||
      (err instanceof Error && (err.name === "AbortError" || err.message.includes("timed out"))) ||
      controller.signal.aborted;

    if (isTimeout) {
      throw new ApiError(
        `Connection timed out. Please check your network connection and try again.`,
        0,
      );
    }

    throw new ApiError(
      err instanceof Error ? err.message : `Failed to connect to backend at ${url}`,
      0,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Combine multiple abort signals */
function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }
    signal.addEventListener("abort", () => controller.abort(signal.reason), { once: true });
  }
  return controller.signal;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
