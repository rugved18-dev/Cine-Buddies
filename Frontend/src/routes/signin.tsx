import { createFileRoute } from "@tanstack/react-router";

import { AppHeader } from "@/components/movie-night/AppHeader";
import { AuthForm } from "@/components/movie-night/AuthForm";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign In with Google · CineBuddies" },
      { name: "description", content: "Sign in with your Google account to host or join a CineBuddies movie night." },
      { property: "og:title", content: "Sign In with Google · CineBuddies" },
      {
        property: "og:description",
        content: "Sign in with your Google account to host or join a CineBuddies movie night.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-md flex-col px-4 pb-16 pt-10 sm:pt-16">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground text-center">
          Sign In to CineBuddies
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground text-center">
          Continue with Google to host a new movie night or rejoin your group.
        </p>
        <div className="mt-6 rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
          <AuthForm />
        </div>
      </main>
    </div>
  );
}
