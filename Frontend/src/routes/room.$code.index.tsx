import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/common/Button";
import { MemberCard } from "@/components/movie-night/MemberCard";
import { RoomCodeCard } from "@/components/movie-night/RoomCodeCard";
import { useRoomByCode, useSession } from "@/context/RoomContext";
import { contentTypeLabel } from "@/lib/movie-format";
import * as roomService from "@/services/api/roomService";
import type { ContentType } from "@/types/movie-night";

export const Route = createFileRoute("/room/$code/")({
  component: LobbyPage,
});

function LobbyPage() {
  const { code } = Route.useParams();
  const room = useRoomByCode(code);
  const session = useSession();
  const navigate = useNavigate();

  if (!room) return null;

  const members = room.members || [];
  const myMemberId = roomService.getMyMemberId(room.code);
  const me =
    members.find((member) => member.id === myMemberId) ||
    members.find((member) => session.user?.name && member.name?.toLowerCase() === session.user.name.toLowerCase()) ||
    members[0];

  const joined = members.filter((member) => member.joined);
  const ready = joined.filter((member) => member.preferencesSubmitted).length;
  const allReady = joined.length > 0 && ready === joined.length;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Room Lobby</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          “{room.name}” · {room.contentTypes.map((type) => contentTypeLabel(type as ContentType)).join(" · ")}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Members ({joined.length} here · {members.length} total)
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {members.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  isCurrentUser={member.id === me?.id}
                />
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border/70 bg-card p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-sm font-semibold text-foreground">Group readiness</h2>
              <span className="text-xs text-muted-foreground">
                {ready} of {joined.length} preferences submitted
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${joined.length ? Math.round((ready / joined.length) * 100) : 0}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Share the room code with your friends. Once all joined members submit their preferences,
              the group analysis unlocks!
            </p>
          </section>
        </div>

        <div className="space-y-5">
          <RoomCodeCard code={room.code} roomName={room.name} />

          {me ? (
            me.preferencesSubmitted ? (
              <div className="rounded-2xl border border-success/40 bg-success/10 p-5 text-sm text-success">
                Your preferences are in — waiting for the rest of the group.
              </div>
            ) : (
              <div className="rounded-2xl border border-primary/40 bg-card p-5 glow-primary">
                <h2 className="text-sm font-bold text-foreground">Your turn</h2>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Tell the planner what you feel like watching and it will find the overlap.
                </p>
                <Button
                  className="mt-4 w-full"
                  onClick={() => void navigate({ to: "/room/$code/preferences", params: { code: room.code } })}
                >
                  Add your preferences <ArrowRight size={15} />
                </Button>
              </div>
            )
          ) : (
            <div className="rounded-2xl border border-border/70 bg-card p-5">
              <h2 className="text-sm font-bold text-foreground">You are viewing as a guest</h2>
              <p className="mt-1.5 text-xs text-muted-foreground">Join the room to submit preferences and vote.</p>
              <Button
                className="mt-4 w-full"
                onClick={() =>
                  void roomService.joinRoom({ code: room.code, displayName: session.user?.name ?? "You" }).then(() => {
                    toast.success("You joined the room");
                  })
                }
              >
                Join this room
              </Button>
            </div>
          )}

          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Sparkles size={15} className="text-primary" /> Next step
            </h2>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {allReady
                ? "Everyone's preferences are in. Generate the group analysis."
                : "Waiting for every joined member to submit preferences before the analysis unlocks."}
            </p>
            <Button
              variant="secondary"
              className="mt-4 w-full"
              disabled={!allReady}
              onClick={() => void navigate({ to: "/room/$code/analysis", params: { code: room.code } })}
            >
              Generate group analysis <ArrowRight size={15} />
            </Button>
            {!allReady ? (
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                Unlocks once all members have submitted
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
