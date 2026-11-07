import { useEffect, useState } from "react";
import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { useRoomByCode } from "@/context/RoomContext";
import { contentTypeLabel, releasePeriodLabel } from "@/lib/movie-format";
import { getGroupAnalysis } from "@/services/api/recommendationService";
import type { GroupAnalysis } from "@/types/movie-night";

export const Route = createFileRoute("/room/$code/analysis")({
  component: AnalysisPage,
});

function AnalysisPage() {
  const { code } = Route.useParams();
  const room = useRoomByCode(code);
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<GroupAnalysis | null>(null);

  useEffect(() => {
    if (!room) return;
    let active = true;
    void getGroupAnalysis(room.code).then((result) => {
      if (active) setAnalysis(result);
    });
    return () => {
      active = false;
    };
  }, [room?.code]);

  if (!room) return null;
  if (!analysis) return <LoadingState label="Comparing everyone's preferences…" />;

  const totalTypeVotes = analysis.contentTypeDistribution.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Group Analysis</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            What “{room.name}” has in common — and where tastes diverge.
          </p>
        </div>
        <Button onClick={() => void navigate({ to: "/room/$code/recommendations", params: { code: room.code } })}>
          View recommendations <ArrowRight size={15} />
        </Button>
      </header>

      {analysis.memberSummaries.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No preferences yet"
          description="Nobody has submitted preferences in this room, so there is nothing to compare."
          action={
            <Button onClick={() => void navigate({ to: "/room/$code", params: { code: room.code } })}>
              Back to lobby
            </Button>
          }
        />
      ) : (
        <>
          <div className="rounded-2xl border border-primary/40 bg-card p-6 glow-primary">
            <p className="flex items-center gap-2 text-sm font-bold text-lavender">
              <Sparkles size={16} /> Group insight
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground/90">{analysis.insight}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-card p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Common genres</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {analysis.commonGenres.length ? (
                  analysis.commonGenres.map((genre) => (
                    <span key={genre} className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-lavender">
                      {genre}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No genre overlaps — the matching will weigh ratings and languages.</p>
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Shared languages</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {analysis.commonLanguages.length ? (
                  analysis.commonLanguages.map((language) => (
                    <span key={language} className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-lavender">
                      {language}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">Subtitles will bridge the group's languages.</p>
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-card p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Average minimum rating</h2>
              <p className="mt-2 text-3xl font-bold text-lavender">{analysis.averageMinRating.toFixed(1)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Group quality bar, averaged across members.</p>
            </div>
          </div>

          <section className="rounded-2xl border border-border/70 bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground">Content interest</h2>
            <p className="mt-1 text-xs text-muted-foreground">How many members included each content type.</p>
            <div className="mt-4 space-y-3">
              {analysis.contentTypeDistribution.map((entry) => (
                <div key={entry.type} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-xs text-muted-foreground">{contentTypeLabel(entry.type)}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${totalTypeVotes ? Math.round((entry.count / totalTypeVotes) * 100) : 0}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-xs font-semibold text-foreground">
                    {entry.count} member{entry.count === 1 ? "" : "s"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {analysis.genreConflicts.length > 0 ? (
            <div className="flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-5">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warning" />
              <div>
                <p className="text-sm font-semibold text-warning">Taste conflicts detected</p>
                <p className="mt-1 text-xs leading-relaxed text-foreground/80">
                  Someone excluded {analysis.genreConflicts.join(", ")} while another member listed it as a
                  favourite. Those genres are down-weighted in the recommendations.
                </p>
              </div>
            </div>
          ) : null}

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Member summaries</h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {analysis.memberSummaries.map((summary) => (
                <div key={summary.memberId} className="rounded-2xl border border-border/70 bg-card p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-bold text-foreground">{summary.displayName || summary.name}</p>
                    {summary.isHost ? (
                      <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-lavender">Host</span>
                    ) : null}
                  </div>
                  <dl className="mt-3 space-y-2 text-xs">
                    <div>
                      <dt className="font-semibold text-foreground">Genres</dt>
                      <dd className="text-muted-foreground">{summary.genres?.join(", ") || "Not specified"}</dd>
                    </div>
                    {summary.languages && summary.languages.length > 0 ? (
                      <div>
                        <dt className="font-semibold text-foreground">Languages</dt>
                        <dd className="text-muted-foreground">{summary.languages.join(", ")}</dd>
                      </div>
                    ) : null}
                    {summary.minRating != null ? (
                      <div>
                        <dt className="font-semibold text-foreground">Minimum rating</dt>
                        <dd className="text-muted-foreground">{summary.minRating.toFixed(1)}+</dd>
                      </div>
                    ) : null}
                    {summary.releasePeriod ? (
                      <div>
                        <dt className="font-semibold text-foreground">Release period</dt>
                        <dd className="text-muted-foreground">{releasePeriodLabel(summary.releasePeriod)}</dd>
                      </div>
                    ) : null}
                    {summary.excludedGenres && summary.excludedGenres.length > 0 ? (
                      <div>
                        <dt className="font-semibold text-foreground">Excludes</dt>
                        <dd className="text-destructive">{summary.excludedGenres.join(", ")}</dd>
                      </div>
                    ) : null}
                  </dl>
                </div>
              ))}
            </div>
          </section>

          <div className="flex justify-end">
            <Button size="lg" onClick={() => void navigate({ to: "/room/$code/recommendations", params: { code: room.code } })}>
              View recommendations <ArrowRight size={15} />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
