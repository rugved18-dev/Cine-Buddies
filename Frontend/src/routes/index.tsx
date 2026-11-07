import { Link, createFileRoute } from "@tanstack/react-router";
import { ListChecks, Sparkles, Users, Vote, Wand2 } from "lucide-react";

import { AppHeader } from "@/components/movie-night/AppHeader";
import { buttonVariants } from "@/components/common/Button";
import { useSession } from "@/context/RoomContext";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CineBuddies — Pick the perfect movie together" },
      {
        name: "description",
        content:
          "Create a movie night room, invite your friends, compare preferences and vote on the film everyone will love.",
      },
      { property: "og:title", content: "CineBuddies — Pick the perfect movie together" },
      {
        property: "og:description",
        content:
          "Create a movie night room, invite your friends, compare preferences and vote on the film everyone will love.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const FEATURES = [
  {
    icon: Wand2,
    title: "Smart matching",
    description:
      "Everyone shares genres, languages and minimum ratings — the planner scores every candidate against the whole group.",
  },
  {
    icon: Users,
    title: "One shared room",
    description:
      "A short invitation code brings your friends into the same lobby, live, from any device.",
  },
  {
    icon: Vote,
    title: "Fair group voting",
    description:
      "Yes counts 2 points, Maybe 1 and No 0 — the highest-scoring title wins with no arguments.",
  },
];

const STEPS = [
  { icon: Users, title: "Open a room", description: "Name your movie night and get an invitation code." },
  { icon: ListChecks, title: "Share preferences", description: "Each friend picks genres, languages and minimums." },
  { icon: Sparkles, title: "Review the analysis", description: "See common interests, conflicts and group insights." },
  { icon: Vote, title: "Vote and watch", description: "Rank the shortlist together and reveal the winner." },
];

function LandingPage() {
  const session = useSession();

  return (
    <div className="min-h-screen">
      <AppHeader userName={session.user?.name ?? null} />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 55% at 50% 0%, color-mix(in oklab, var(--color-primary) 20%, transparent), transparent 70%)",
            }}
          />
          <div className="relative mx-auto max-w-5xl px-4 pb-20 pt-16 text-center sm:px-6 sm:pt-24">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-lavender">
              <Sparkles size={13} /> Movie night, minus the endless scrolling
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-6xl">
              One movie night.
              <span className="block bg-gradient-to-r from-primary to-lavender bg-clip-text text-transparent">
                Zero arguments.
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Create a room, invite your friends with a code, and let CineBuddies turn everyone's
              taste into a shortlist you vote on together.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/create" className={cn(buttonVariants({ variant: "primary", size: "lg" }), "no-underline")}>
                Create a room
              </Link>
              <Link to="/join" className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "no-underline")}>
                Join with a code
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border/70 bg-card p-6 transition-colors hover:border-primary/40"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <feature.icon size={20} strokeWidth={1.9} />
                </span>
                <h2 className="mt-4 text-base font-bold text-foreground">{feature.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">How it works</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            From "what should we watch?" to pressing play in four steps.
          </p>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative rounded-2xl border border-border/70 bg-card p-5">
                <span className="absolute right-4 top-4 font-mono text-3xl font-bold text-foreground/8">
                  {index + 1}
                </span>
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <step.icon size={18} strokeWidth={1.9} />
                </span>
                <h3 className="mt-3.5 text-sm font-bold text-foreground">{step.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{step.description}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t border-border/60 py-8">
        <p className="mx-auto max-w-5xl px-4 text-center text-xs text-muted-foreground sm:px-6">
          CineBuddies — Powered by Spring Boot, Supabase PostgreSQL, and TMDB.
        </p>
      </footer>
    </div>
  );
}
