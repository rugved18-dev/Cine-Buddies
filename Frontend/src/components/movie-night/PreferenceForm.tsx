import { useState } from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ChipGroup } from "@/components/movie-night/ChipGroup";
import {
  CONTENT_TYPE_OPTIONS,
  GENRE_OPTIONS,
  LANGUAGE_OPTIONS,
  RELEASE_PERIOD_OPTIONS,
  WATCHED_SUGGESTIONS,
} from "@/types/movie-night";
import { cn } from "@/lib/utils";
import type { ContentType, Preferences, ReleasePeriod } from "@/types/movie-night";

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export interface PreferenceFormProps {
  initial: Preferences;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (preferences: Preferences) => void;
  className?: string;
}

/** Full preference-collection form used on the Preference Collection screen. */
export function PreferenceForm({
  initial,
  submitting,
  submitLabel = "Submit preferences",
  onSubmit,
  className,
}: PreferenceFormProps) {
  const [contentTypes, setContentTypes] = useState<string[]>(initial.contentTypes);
  const [genres, setGenres] = useState<string[]>(initial.genres);
  const [languages, setLanguages] = useState<string[]>(initial.languages);
  const [excludedGenres, setExcludedGenres] = useState<string[]>(initial.excludedGenres);
  const [minRating, setMinRating] = useState(initial.minRating);
  const [releasePeriod, setReleasePeriod] = useState<string>(initial.releasePeriod);
  const [watchedTitles, setWatchedTitles] = useState<string[]>(initial.watchedTitles);
  const [watchedInput, setWatchedInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const addWatched = (title: string) => {
    const clean = title.trim();
    if (!clean) return;
    if (watchedTitles.some((item) => item.toLowerCase() === clean.toLowerCase())) {
      setWatchedInput("");
      return;
    }
    setWatchedTitles((previous) => [...previous, clean].slice(0, 12));
    setWatchedInput("");
  };

  const handleSubmit = () => {
    if (contentTypes.length === 0) {
      setError("Pick at least one content type so we know what to suggest.");
      return;
    }
    if (genres.length === 0) {
      setError("Choose at least one genre you enjoy.");
      return;
    }
    setError(null);
    onSubmit({
      contentTypes: contentTypes as ContentType[],
      genres,
      languages,
      minRating,
      releasePeriod: releasePeriod as ReleasePeriod,
      excludedGenres,
      watchedTitles,
    });
  };

  return (
    <div className={cn("space-y-7", className)}>
      <section>
        <h3 className="text-sm font-semibold text-foreground">What should we look for?</h3>
        <p className="mb-3 mt-1 text-xs text-muted-foreground">Select every content type you would watch tonight.</p>
        <ChipGroup
          options={CONTENT_TYPE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
          selected={contentTypes}
          onToggle={(value) => setContentTypes((previous) => toggleValue(previous, value))}
        />
      </section>

      <section>
        <h3 className="text-sm font-semibold text-foreground">Favourite genres</h3>
        <p className="mb-3 mt-1 text-xs text-muted-foreground">The more you pick, the smarter the matching gets.</p>
        <ChipGroup
          options={GENRE_OPTIONS.map((genre) => ({ value: genre, label: genre }))}
          selected={genres}
          onToggle={(value) => setGenres((previous) => toggleValue(previous, value))}
        />
      </section>

      <section>
        <h3 className="text-sm font-semibold text-foreground">Languages you watch</h3>
        <p className="mb-3 mt-1 text-xs text-muted-foreground">Subtitles are always an option — pick freely.</p>
        <ChipGroup
          options={LANGUAGE_OPTIONS.map((language) => ({ value: language, label: language }))}
          selected={languages}
          onToggle={(value) => setLanguages((previous) => toggleValue(previous, value))}
        />
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Minimum rating</h3>
          <p className="mb-3 mt-1 text-xs text-muted-foreground">Ignore anything rated below this.</p>
          <div className="rounded-xl border border-border/70 bg-card p-4">
            <div className="mb-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-lavender">{minRating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">out of 10</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              step={0.5}
              value={minRating}
              onChange={(event) => setMinRating(Number(event.target.value))}
              aria-label="Minimum rating"
              className="w-full accent-[var(--color-primary)] cursor-pointer"
            />
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>Any rating</span>
              <span>Masterpiece only</span>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Release period</h3>
          <p className="mb-3 mt-1 text-xs text-muted-foreground">How new should the picks be?</p>
          <ChipGroup
            options={RELEASE_PERIOD_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
            selected={[releasePeriod]}
            onToggle={setReleasePeriod}
          />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-foreground">Anything to exclude?</h3>
        <p className="mb-3 mt-1 text-xs text-muted-foreground">Genres you are absolutely not in the mood for.</p>
        <ChipGroup
          tone="exclude"
          options={GENRE_OPTIONS.map((genre) => ({ value: genre, label: genre }))}
          selected={excludedGenres}
          onToggle={(value) => setExcludedGenres((previous) => toggleValue(previous, value))}
        />
      </section>

      <section>
        <h3 className="text-sm font-semibold text-foreground">Already seen</h3>
        <p className="mb-3 mt-1 text-xs text-muted-foreground">Add titles you have watched so they are skipped.</p>
        <div className="flex gap-2">
          <Input
            value={watchedInput}
            onChange={(event) => setWatchedInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addWatched(watchedInput);
              }
            }}
            placeholder="Type a title and press Enter"
            aria-label="Add a watched title"
          />
          <Button variant="secondary" size="icon" className="h-11 w-11 shrink-0" onClick={() => addWatched(watchedInput)} aria-label="Add title">
            <Plus size={16} />
          </Button>
        </div>
        {watchedInput.trim() === "" && watchedTitles.length === 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {WATCHED_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addWatched(suggestion)}
                className="cursor-pointer rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        ) : null}
        {watchedTitles.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {watchedTitles.map((title) => (
              <span
                key={title}
                className="flex items-center gap-1.5 rounded-full border border-border bg-card py-1 pl-3 pr-1.5 text-xs text-foreground"
              >
                {title}
                <button
                  type="button"
                  onClick={() => setWatchedTitles((previous) => previous.filter((item) => item !== title))}
                  aria-label={`Remove ${title}`}
                  className="cursor-pointer rounded-full p-0.5 text-muted-foreground hover:text-foreground"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        ) : null}
      </section>

      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

      <Button size="lg" className="w-full" onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Submitting…" : submitLabel}
      </Button>
    </div>
  );
}
