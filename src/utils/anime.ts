import type { Anime } from "@/api/jikanApi";

export type PlannedAnime = Anime & {
  estimatedEnd: Date;
  episodesKnown: boolean;
  endDateKnown: boolean;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const SHORT_COUR_EPISODES = 12;
const LONG_COUR_EPISODES = 24;
const LONG_COUR_THRESHOLD_WEEKS = 13;

export function formatDate(date: Date): string {
  if (!date || isNaN(date.getTime())) return "TBA";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function scoreColor(score: number): string {
  if (score >= 8) return "text-green-400";
  if (score <= 5) return "text-red-400";
  return "text-yellow-300";
}

export function isStarted(anime: PlannedAnime): boolean {
  const start = anime.start_date ? new Date(anime.start_date).getTime() : Infinity;
  return start <= Date.now();
}

export function isFinished(anime: PlannedAnime): boolean {
  const now = Date.now();
  const start = anime.start_date ? new Date(anime.start_date).getTime() : Infinity;
  return start <= now && anime.endDateKnown && anime.estimatedEnd.getTime() < now;
}

function fallbackEpisodes(startDate: string): number {
  if (!startDate) return SHORT_COUR_EPISODES;
  const weeksAiring = (Date.now() - new Date(startDate).getTime()) / WEEK_MS;
  return weeksAiring > LONG_COUR_THRESHOLD_WEEKS ? LONG_COUR_EPISODES : SHORT_COUR_EPISODES;
}

export function toPlanned(a: Anime): PlannedAnime {
  const episodesKnown = a.episodes > 0;
  const endDateKnown = !!a.end_date || episodesKnown;
  const episodes = episodesKnown ? a.episodes : fallbackEpisodes(a.start_date);
  const estimatedEnd = a.end_date
    ? new Date(a.end_date)
    : new Date(new Date(a.start_date).getTime() + (episodes - 1) * WEEK_MS);
  return { ...a, episodesKnown, endDateKnown, estimatedEnd };
}
