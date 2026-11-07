import type { ContentType, ReleasePeriod } from "@/types/movie-night";

export function contentTypeLabel(type: ContentType): string {
  switch (type) {
    case "MOVIES":
      return "Movie";
    case "TV_SERIES":
      return "TV Series";
    case "WEB_SERIES":
      return "Web Series";
  }
}

export function releasePeriodLabel(period: ReleasePeriod): string {
  switch (period) {
    case "ANY_YEAR":
      return "Any year";
    case "LAST_5_YEARS":
      return "Last 5 years";
    case "LAST_10_YEARS":
      return "Last 10 years";
    case "CLASSIC":
      return "Classic content";
  }
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
