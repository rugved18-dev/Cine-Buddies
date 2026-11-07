import { createFileRoute } from "@tanstack/react-router";

import { AppHeader } from "@/components/movie-night/AppHeader";
import { AuthForm } from "@/components/movie-night/AuthForm";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Get Started · CineBuddies" },
      { name: "description", content: "Sign in with your Google account to host or join a CineBuddies movie night." },
      { property: "og:title", content: "Get Started · CineBuddies" },
      {
        property: "og:description",
        content: "Sign in with your Google account to host or join a CineBuddies movie night.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-md flex-col px-4 pb-16 pt-10 sm:pt-16">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground text-center">
          Get Started with CineBuddies
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground text-center">
          Continue with Google to create your profile and start planning movie nights.
        </p>
        <div className="mt-6 rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
          <AuthForm />
        </div>
      </main>
    </div>
  );
}
