/**
 * Live Room context for CineBuddies.
 *
 * Connects directly to the Spring Boot backend (/api/rooms) to fetch
 * real-time room metadata, members, and status.
 * Replaces fake in-memory mock stores and simulated bots with live REST queries and polling.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as roomService from "@/services/api/roomService";
import type { Room } from "@/types/movie-night";

export interface SessionUser {
  id?: string;
  name: string;
  email: string | null;
}

export interface SessionState {
  user: SessionUser | null;
  rooms: Record<string, Room>;
  activeRoom: Room | null;
  refreshRoom: (code: string) => Promise<Room | null>;
}

const RoomContext = createContext<SessionState>({
  user: null,
  rooms: {},
  activeRoom: null,
  refreshRoom: async () => null,
});

export function useSession(): SessionState {
  return useContext(RoomContext);
}

export function useRoomByCode(roomCode: string | undefined): Room | undefined {
  const { rooms, activeRoom, refreshRoom } = useSession();
  const [room, setRoom] = useState<Room | undefined>(() => {
    if (!roomCode) return undefined;
    const normalized = roomCode.trim().toUpperCase();
    return rooms[normalized] || (activeRoom?.code === normalized ? activeRoom : undefined);
  });

  const normalized = roomCode?.trim().toUpperCase();

  // Load and poll the room every 3 seconds so new members joining appear live
  useEffect(() => {
    if (!normalized) return;

    let mounted = true;

    const fetchLatest = async () => {
      const data = await roomService.getRoom(normalized);
      if (mounted && data) {
        setRoom(data);
      }
    };

    void fetchLatest();
    const interval = setInterval(() => {
      void fetchLatest();
    }, 3000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [normalized]);

  return room;
}

export function RoomProvider({ children }: { children: React.ReactNode }) {
  // Start with null to guarantee server & client initial render match (avoids React hydration mismatch)
  const [user, setUserState] = useState<SessionUser | null>(null);
  const [rooms, setRooms] = useState<Record<string, Room>>({});
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);

  // Hydrate user from localStorage once mounted on client
  useEffect(() => {
    setUserState(roomService.getUser());

    const handleStorage = () => {
      setUserState(roomService.getUser());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const refreshRoom = useCallback(async (code: string): Promise<Room | null> => {
    const normalized = roomService.normalizeRoomCode(code);
    const room = await roomService.getRoom(normalized);
    if (room) {
      setRooms((prev) => ({ ...prev, [normalized]: room }));
      setActiveRoom(room);
    }
    return room;
  }, []);

  const value: SessionState = {
    user,
    rooms,
    activeRoom,
    refreshRoom,
  };

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}
