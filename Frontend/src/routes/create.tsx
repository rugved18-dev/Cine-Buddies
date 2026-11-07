import { useEffect, useState } from "react";
import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Lock } from "lucide-react";

import { AppHeader } from "@/components/movie-night/AppHeader";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { LoadingState } from "@/components/common/LoadingState";
import { ChipGroup } from "@/components/movie-night/ChipGroup";
import { AuthForm } from "@/components/movie-night/AuthForm";
import { useSession } from "@/context/RoomContext";
import { CONTENT_TYPE_OPTIONS } from "@/types/movie-night";
import * as roomService from "@/services/api/roomService";
import * as authService from "@/services/api/authService";
import type { ContentType } from "@/types/movie-night";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create a Room · CineBuddies" },
      { name: "description", content: "Name your movie night and get an invitation code for your friends." },
      { property: "og:title", content: "Create a Room · CineBuddies" },
      { property: "og:description", content: "Name your movie night and get an invitation code for your friends." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreateRoomPage,
});

function CreateRoomPage() {
  const session = useSession();
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("");
  const [hostName, setHostName] = useState("");
  const [contentTypes, setContentTypes] = useState<string[]>(["MOVIES"]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const storedUser = mounted && typeof window !== "undefined" ? authService.getStoredUser() : null;
  const token = mounted && typeof window !== "undefined" ? authService.getStoredToken() : null;
  const isAuthenticated = Boolean((session.user?.name || storedUser?.displayName) && token);

  // Prefill the host name once the session has hydrated on the client
  useEffect(() => {
    const currentName = session.user?.name || storedUser?.displayName || "";
    if (currentName) {
      setHostName((prev) => prev || currentName);
    }
  }, [session.user?.name, storedUser?.displayName]);

  const toggleContentType = (value: string) => {
    setContentTypes((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in with Google to create a room.");
      return;
    }
    if (roomName.trim().length < 3) {
      setError("Give your movie night a name with at least 3 characters.");
      return;
    }
    if (contentTypes.length === 0) {
      setError("Pick at least one content type for the room.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const activeHostName = hostName.trim() || session.user?.name || storedUser?.displayName || "Host";
      const room = await roomService.createRoom({
        name: roomName,
        contentTypes: contentTypes as ContentType[],
        hostName: activeHostName,
      });
      toast.success(`Room ${room.code} is live — share the code with your friends!`);
      await navigate({ to: "/room/$code", params: { code: room.code } });
    } finally {
      setSubmitting(false);
    }
  };

        if (!mounted) {
    return (
        <div className="min-h-screen">
          <AppHeader />
          <main className="mx-auto w-full max-w-lg px-4 pb-16 pt-10 sm:pt-14">
            <LoadingState label="Checking authorization…" />
          </main>
        </div>
        );
  }

  if (!isAuthenticated) {
    return (
        <div className="min-h-screen">
          <AppHeader />
          <main className="mx-auto w-full max-w-lg px-4 pb-16 pt-10 sm:pt-14">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Create a room</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sign in with Google to name your movie night and get an invitation code.
            </p>

            <div className="mt-6 space-y-4 rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-primary">
                <Lock size={18} />
                <span>Sign in required</span>
              </div>
              <p className="text-xs text-muted-foreground">
                You must sign in with your Google account to create and host a movie night room.
              </p>
              <AuthForm redirectPath="/create" />
            </div>
          </main>
        </div>
        );
  }

          return (
          <div className="min-h-screen">
            <AppHeader />
            <main className="mx-auto w-full max-w-lg px-4 pb-16 pt-10 sm:pt-14">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Create a room</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Name your movie night — you will get an invitation code to share.
              </p>

              <div className="mt-6 space-y-5 rounded-2xl border border-border/70 bg-card p-6">
                <Input
                  label="Movie night name"
                  value={roomName}
                  onChange={(event) => setRoomName(event.target.value)}
                  placeholder="e.g. Friday Sci-Fi Night"
                  maxLength={40}
                />
                <Input
                  label="Your name (Host)"
                  value={hostName}
                  onChange={(event) => setHostName(event.target.value)}
                  placeholder="Alex"
                  maxLength={24}
                />

                <div>
                  <label className="text-sm font-semibold text-foreground">What kind of content?</label>
                  <p className="mt-0.5 text-xs text-muted-foreground">You can pick more than one.</p>
                  <div className="mt-3">
                    <ChipGroup
                      options={CONTENT_TYPE_OPTIONS}
                      selected={contentTypes}
                      onToggle={toggleContentType}
                      onChange={setContentTypes}
                      ariaLabel="Content types"
                    />
                  </div>
                </div>

                {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

              <Button size="lg" className="w-full" onClick={() => void handleSubmit()} disabled={submitting}>
                {submitting ? "Opening room…" : "Create movie night"}
              </Button>
          </div>
      </main>
    </div>
  );
}
