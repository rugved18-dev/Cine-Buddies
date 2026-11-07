import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { Home } from "lucide-react";

import { AppHeader } from "@/components/movie-night/AppHeader";
import { Stepper } from "@/components/movie-night/Stepper";
import { EmptyState } from "@/components/common/EmptyState";
import { useRoomByCode, useSession } from "@/context/RoomContext";

export const Route = createFileRoute("/room/$code")({
  head: ({ params }) => ({
    meta: [
      { title: `Room ${params.code.toUpperCase()} · Movie Night Planner` },
      { name: "description", content: "Live movie night room: lobby, preferences, recommendations and group voting." },
      { property: "og:title", content: `Room ${params.code.toUpperCase()} · Movie Night Planner` },
      {
        property: "og:description",
        content: "Live movie night room: lobby, preferences, recommendations and group voting.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoomLayout,
});

function RoomLayout() {
  const { code } = Route.useParams();
  const session = useSession();
  const room = useRoomByCode(code);

  return (
    <div className="min-h-screen">
      <AppHeader subtitle={room ? room.name : undefined} />
      <main className="mx-auto w-full max-w-5xl px-4 pb-20 pt-6 sm:px-6">
        {room ? (
          <>
            <Stepper code={room.code} />
            <Outlet />
          </>
        ) : (
          <EmptyState
            icon={Home}
            title="Room not found"
            description={`No room with the code “${code.toUpperCase()}” was found. Check the invitation code with the host or create a new room.`}
            action={
              <Link to="/" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 no-underline">
                Back to home
              </Link>
            }
          />
        )}
      </main>
    </div>
  );
}
