import { useEffect, useState } from "react";
import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { AppHeader } from "@/components/movie-night/AppHeader";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ChipGroup } from "@/components/movie-night/ChipGroup";
import { useSession } from "@/context/RoomContext";
import { CONTENT_TYPE_OPTIONS } from "@/types/movie-night";
import * as roomService from "@/services/api/roomService";
import type { ContentType } from "@/types/movie-night";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create a Room · Movie Night Planner" },
      { name: "description", content: "Name your movie night and get an invitation code for your friends." },
      { property: "og:title", content: "Create a Room · Movie Night Planner" },
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

  // Prefill the host name once the (mock) session has hydrated on the client.
  useEffect(() => {
    setHostName((current) => current || session.user?.name || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.user?.name]);

  const handleSubmit = async () => {
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
      const room = await roomService.createRoom({
        name: roomName,
        contentTypes: contentTypes as ContentType[],
        hostName: hostName || session.user?.name || "Alex",
      });
      toast.success(`Room ${room.code} is live — share the code with your friends!`);
      await navigate({ to: "/room/$code", params: { code: room.code } });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <AppHeader userName={session.user?.name ?? null} />
      <main className="mx-auto w-full max-w-lg px-4 pb-16 pt-10 sm:pt-14">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Create a room</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Name your movie night — you will get an invitation code to share.
        </p>

        <div className="mt-6 space-y-5 rounded-2xl border border-border/70 bg-card p-6">
          <Input
            label="Room name"
            value={roomName}
            onChange={(event) => setRoomName(event.target.value)}
            placeholder="e.g. Friday Flicks"
            maxLength={40}
          />
          <Input
            label="Your name"
            value={hostName}
            onChange={(event) => setHostName(event.target.value)}
            placeholder="How friends see you"
            maxLength={24}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Content types</label>
            <ChipGroup
              options={CONTENT_TYPE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
              selected={contentTypes}
              onToggle={(value) =>
                setContentTypes((previous) =>
                  previous.includes(value) ? previous.filter((item) => item !== value) : [...previous, value],
                )
              }
            />
          </div>
          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
          <Button size="lg" className="w-full" onClick={() => void handleSubmit()} disabled={submitting}>
            {submitting ? "Creating room…" : "Create room"}
          </Button>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          In this prototype friends are simulated — Rahul and Sam join your lobby automatically.
        </p>
      </main>
    </div>
  );
}
