/// <reference types="vite/client" />

export interface Anime {
  id: number;
  title: string;
  title_english: string | null;
  episodes: number;
  score: number;
  start_date: string;
  end_date: string | null;
  image: string;
  synopsis: string | null;
  streaming: Array<{ name: string; url: string }>;
  type: string | null;
  genres: string[];
}

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8787";

export async function fetchSeasonAnime(season: string, year: number): Promise<Anime[]> {
  const res = await fetch(`${API_BASE}/season/${year}/${season}`);
  if (!res.ok) throw new Error("Failed to fetch season data");
  return res.json();
}

function mapJikanAnime(a: any): Anime {
  return {
    id: a.mal_id,
    title: a.title,
    title_english: a.title_english ?? null,
    episodes: a.episodes ?? 0,
    score: a.score ?? 0,
    start_date: a.aired?.from ?? "",
    end_date: a.aired?.to ?? null,
    image: a.images?.jpg?.large_image_url ?? a.images?.jpg?.image_url ?? "",
    synopsis: a.synopsis ?? null,
    streaming: [],
    type: a.type ?? null,
    genres: (a.genres ?? []).map((g: any) => g.name as string),
  };
}

export interface AnimeReview {
  id: number;
  username: string;
  date: string;
  score: number;
  review: string;
  votes: number;
  isSpoiler: boolean;
  isPreliminary: boolean;
}

export async function fetchAnimeReviews(animeId: number): Promise<AnimeReview[]> {
  const res = await fetch(
    `https://api.jikan.moe/v4/anime/${animeId}/reviews?preliminary=false`
  );
  if (!res.ok) throw new Error("Failed to fetch reviews");
  const { data } = await res.json();
  return (data as any[]).map((r: any) => ({
    id: r.mal_id,
    username: r.user?.username ?? "Anonymous",
    date: r.date,
    score: r.score,
    review: r.review,
    votes: r.votes ?? 0,
    isSpoiler: r.is_spoiler ?? false,
    isPreliminary: r.is_preliminary ?? false,
  }));
}

export async function searchAnime(query: string): Promise<Anime[]> {
  const res = await fetch(
    `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=24&sfw=true`
  );
  if (!res.ok) throw new Error("Search failed");
  const { data } = await res.json();
  return (data as any[]).map(mapJikanAnime);
}
