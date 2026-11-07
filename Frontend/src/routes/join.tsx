import { useState } from "react";
import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { AppHeader } from "@/components/movie-night/AppHeader";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { useSession } from "@/context/RoomContext";
import { ApiError } from "@/services/api/apiClient";
import { RoomNotFoundError, joinRoom } from "@/services/api/roomService";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Join a Room · CineBuddies" },
      { name: "description", content: "Enter an invitation code to join your friends' movie night room." },
      { property: "og:title", content: "Join a Room · CineBuddies" },
      { property: "og:description", content: "Enter an invitation code to join your friends' movie night room." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JoinRoomPage,
});

function JoinRoomPage() {
  const session = useSession();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (code.trim().length < 4) {
      setError("Invitation codes are at least 4 characters.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const room = await joinRoom({ code, displayName: displayName || session.user?.name || "You" });
      toast.success(`You joined “${room.name}”!`);
      await navigate({ to: "/room/$code", params: { code: room.code } });
    } catch (caught) {
      setError(
        caught instanceof RoomNotFoundError
          ? "No room was found for that invitation code. Double-check it with the host."
          : caught instanceof ApiError
            ? caught.message
            : "Something went wrong joining that room. Please check the code and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <AppHeader userName={session.user?.name ?? null} />
      <main className="mx-auto w-full max-w-lg px-4 pb-16 pt-10 sm:pt-14">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Join a room</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Got a code from the host? Drop it in and pick the name your friends will see.
        </p>

        <div className="mt-6 space-y-5 rounded-2xl border border-border/70 bg-card p-6">
          <Input
            label="Invitation code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="e.g. MOVIE42"
            maxLength={8}
            className="font-mono text-lg font-bold tracking-[0.3em] uppercase"
          />
          <Input
            label="Display name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder={session.user?.name || "How friends see you"}
            maxLength={24}
          />
          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
          <Button size="lg" className="w-full" onClick={() => void handleSubmit()} disabled={submitting}>
            {submitting ? "Joining…" : "Join room"}
          </Button>
        </div>
      </main>
    </div>
  );
}
