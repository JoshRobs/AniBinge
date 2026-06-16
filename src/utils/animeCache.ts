import type { Anime } from "@/api/jikanApi";

const CACHE_KEY = "anibinge-anime-cache";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

type CacheEntry = { data: Anime; cachedAt: number };
type Cache = Record<string, CacheEntry>;

function load(): Cache {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function save(cache: Cache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage full — silently ignore
  }
}

export function getCachedAnime(id: number): Anime | null {
  const entry = load()[id];
  if (!entry || Date.now() - entry.cachedAt > TTL_MS) return null;
  return entry.data;
}

export function setCachedAnime(anime: Anime): void {
  const cache = load();
  cache[anime.id] = { data: anime, cachedAt: Date.now() };
  save(cache);
}
