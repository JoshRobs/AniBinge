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

const API_BASE = import.meta.env.VITE_API_URL ?? "";

// Tenrai is schema-compatible with Jikan v4 — same paths, same response shapes —
// so either can serve these calls. Tenrai is primary; Jikan is the fallback.
// Season data does NOT go through here: it's served by the worker, which caches
// in KV and runs its own fallback chain.
const ANIME_API_SOURCES = [
  "https://api.tenrai.org/v1",
  "https://api.jikan.moe/v4",
];

// Returns null when the entry genuinely does not exist (404), which is a
// definitive answer from the first source and not worth retrying elsewhere.
// Throws only when every source failed.
async function apiFetch(path: string): Promise<any | null> {
  let lastError: unknown;

  for (const base of ANIME_API_SOURCES) {
    try {
      const res = await fetch(`${base}${path}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`Upstream error ${res.status}`);
      return await res.json();
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("All anime API sources failed");
}

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
  const json = await apiFetch(`/anime/${animeId}/reviews?preliminary=false`);
  if (!json) return [];
  return (json.data as any[]).map((r: any) => ({
    id: r.mal_id,
    username: r.user?.username ?? "Anonymous",
    date: r.date,
    score: r.score,
    review: r.review,
    // Helpfulness lives under `reactions.overall`; there is no top-level
    // `votes` field on either source.
    votes: r.reactions?.overall ?? 0,
    isSpoiler: r.is_spoiler ?? false,
    isPreliminary: r.is_preliminary ?? false,
  }));
}

export async function searchAnime(query: string): Promise<Anime[]> {
  const json = await apiFetch(
    `/anime?q=${encodeURIComponent(query)}&limit=24&sfw=true`
  );
  if (!json) return [];
  return (json.data as any[]).map(mapJikanAnime);
}

export async function fetchAnimeById(id: number): Promise<Anime | null> {
  try {
    const json = await apiFetch(`/anime/${id}`);
    if (!json) return null;
    return mapJikanAnime(json.data);
  } catch {
    return null;
  }
}

export interface AnimeDetails {
  studios: string[];
  producers: string[];
  trailer: { youtubeId: string } | null;
}

export interface VoiceActor {
  id: number;
  name: string;
  image: string;
  language: string;
}

export interface Character {
  id: number;
  name: string;
  image: string;
  role: string;
  voiceActors: VoiceActor[];
}

export async function fetchAnimeDetails(id: number): Promise<AnimeDetails | null> {
  try {
    const json = await apiFetch(`/anime/${id}`);
    if (!json) return null;
    const { data } = json;
    return {
      studios: (data.studios ?? []).map((s: any) => s.name as string),
      producers: (data.producers ?? []).map((p: any) => p.name as string),
      trailer: data.trailer?.youtube_id ? { youtubeId: data.trailer.youtube_id } : null,
    };
  } catch {
    return null;
  }
}

export interface CharacterInfo {
  nameKanji: string | null;
  nicknames: string[];
  about: string | null;
  largeImage: string | null;
}

export async function fetchCharacterInfo(id: number): Promise<CharacterInfo | null> {
  try {
    const json = await apiFetch(`/characters/${id}`);
    if (!json) return null;
    const { data } = json;
    return {
      nameKanji: data.name_kanji ?? null,
      nicknames: data.nicknames ?? [],
      about: data.about ?? null,
      largeImage: data.images?.jpg?.image_url ?? null,
    };
  } catch {
    return null;
  }
}

export async function fetchAnimeCharacters(id: number): Promise<Character[]> {
  try {
    const json = await apiFetch(`/anime/${id}/characters`);
    if (!json) return [];
    return (json.data as any[]).map((entry: any) => ({
      id: entry.character.mal_id,
      name: entry.character.name,
      image: entry.character.images?.jpg?.image_url ?? "",
      role: entry.role,
      voiceActors: (entry.voice_actors ?? []).map((va: any) => ({
        id: va.person.mal_id,
        name: va.person.name,
        image: va.person.images?.jpg?.image_url ?? "",
        language: va.language,
      })),
    }));
  } catch {
    return [];
  }
}
