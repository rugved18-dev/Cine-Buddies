/**
 * Room service communicating directly with Spring Boot (/api/rooms).
 */

import { ApiError, request } from "@/services/api/apiClient";
import type { ContentType, Room } from "@/types/movie-night";

export class RoomNotFoundError extends Error {
  constructor() {
    super("No room was found for that invitation code.");
    this.name = "RoomNotFoundError";
  }
}

export function normalizeRoomCode(code: string): string {
  return code.trim().toUpperCase();
}

const MEMBER_STORAGE_PREFIX = "cinebuddies_member_";

export function getMyMemberId(roomCode: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`${MEMBER_STORAGE_PREFIX}${normalizeRoomCode(roomCode)}`);
}

export function setMyMemberId(roomCode: string, memberId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${MEMBER_STORAGE_PREFIX}${normalizeRoomCode(roomCode)}`, memberId);
}

export async function createRoom(input: {
  name: string;
  contentTypes: ContentType[];
  hostName: string;
}): Promise<Room> {
  const room = await request<Room>("/rooms", {
    method: "POST",
    body: JSON.stringify({
      name: input.name.trim(),
      contentTypes: input.contentTypes,
      hostName: input.hostName.trim() || "Host",
    }),
  });

  // Automatically remember the host's member ID for this room
  if (room.members && room.members.length > 0) {
    const hostMember = room.members.find((m) => m.isHost) || room.members[0];
    if (hostMember) {
      setMyMemberId(room.code, hostMember.id);
    }
  }

  return room;
}

export async function joinRoom(input: { code: string; displayName: string }): Promise<Room> {
  const code = normalizeRoomCode(input.code);
  const name = input.displayName.trim() || "Guest";

  try {
    const room = await request<Room>(`/rooms/${code}/join`, {
      method: "POST",
      body: JSON.stringify({ displayName: name }),
    });

        // Remember the joining participant's member ID for this room
        if (room.members && room.members.length > 0) {
          const myMember = room.members.find((m) => m.name.toLowerCase() === name.toLowerCase()) || room.members[room.members.length - 1];
          if (myMember) {
            setMyMemberId(room.code, myMember.id);
          }
        }

        return room;
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.status === 404 || err.message.toLowerCase().includes("not found")) {
            throw new RoomNotFoundError();
          }
        }
        throw err;
      }
    }

    export async function getRoom(code: string): Promise<Room | null> {
      try {
        return await request<Room>(`/rooms/${normalizeRoomCode(code)}`);
      } catch {
        return null;
      }
    }

    export async function setUser(user: { name: string; email: string | null }): Promise<void> {
      if (typeof window === "undefined") return;
      localStorage.setItem("cinebuddies_user", JSON.stringify(user));
    }

    export function getUser(): { name: string; email: string | null } | null {
      if (typeof window === "undefined") return null;
      try {
        const data = localStorage.getItem("cinebuddies_user");
        return data ? JSON.parse(data) : null;
      } catch {
        return null;
      }
    }

    export async function clearSession(): Promise<void> {
      if (typeof window === "undefined") return;
      localStorage.removeItem("cinebuddies_jwt");
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("cinebuddies_user");
    }
