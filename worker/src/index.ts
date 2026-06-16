export interface Env {
  ANIBINGE_CACHE: KVNamespace;
}

const CACHE_TTL = 60 * 60 * 48; // 48 hours
const JIKAN_PAGE_DELAY = 500;
const INFLIGHT_TTL = 120; // seconds — lock auto-expires if a worker crashes mid-fetch
const POLL_INTERVAL = 1000; // ms between KV checks when waiting on another worker
const POLL_TIMEOUT = 30_000; // ms — give up waiting and fetch ourselves after this

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extra },
  });
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Season helpers ────────────────────────────────────────────────────────────

type Season = "winter" | "spring" | "summer" | "fall";
const SEASON_ORDER: Season[] = ["winter", "spring", "summer", "fall"];

function monthToSeason(month: number): Season {
  if (month <= 3) return "winter";
  if (month <= 6) return "spring";
  if (month <= 9) return "summer";
  return "fall";
}

function currentSeason(): { season: Season; year: number } {
  const now = new Date();
  return { season: monthToSeason(now.getUTCMonth() + 1), year: now.getUTCFullYear() };
}

// Returns the last `count` seasons in reverse-chronological order (newest first)
function recentSeasons(count: number): Array<{ season: Season; year: number }> {
  let { season, year } = currentSeason();
  const result: Array<{ season: Season; year: number }> = [];
  for (let i = 0; i < count; i++) {
    result.push({ season, year });
    const idx = SEASON_ORDER.indexOf(season);
    if (idx === 0) { season = "fall"; year--; }
    else season = SEASON_ORDER[idx - 1];
  }
  return result;
}

// ── Jikan ────────────────────────────────────────────────────────────────────

async function jikanFetch(url: string, attempt = 1): Promise<any> {
  const res = await fetch(url);
  if (res.status === 429) {
    if (attempt >= 3) throw new Error("Jikan rate limit exceeded");
    await delay(1000 * attempt);
    return jikanFetch(url, attempt + 1);
  }
  if (!res.ok) throw new Error(`Jikan error ${res.status}`);
  return res.json();
}

function mapAnime(a: any) {
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
    streaming: [] as Array<{ name: string; url: string }>,
    type: a.type ?? null,
    genres: (a.genres ?? []).map((g: any) => g.name as string),
  };
}

async function fetchJikanSeason(season: string, year: number) {
  const results: ReturnType<typeof mapAnime>[] = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const { data, pagination } = await jikanFetch(
      `https://api.jikan.moe/v4/seasons/${year}/${season}?page=${page}`
    );
    const filtered = data.filter((a: any) => a.type === "TV" || a.type === "ONA");
    results.push(...filtered.map(mapAnime));
    hasNextPage = pagination.has_next_page;
    page++;
    if (hasNextPage) await delay(JIKAN_PAGE_DELAY);
  }

  const seen = new Set<number>();
  return results.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
}

// ── AniList ──────────────────────────────────────────────────────────────────

interface AniListEntry {
  episodes: number | null;
  streaming: Array<{ name: string; url: string }>;
}

const ANILIST_QUERY = `
  query ($season: MediaSeason, $year: Int, $page: Int) {
    Page(page: $page, perPage: 50) {
      pageInfo { hasNextPage }
      media(season: $season, seasonYear: $year, type: ANIME) {
        idMal
        episodes
        externalLinks {
          site
          url
          type
        }
      }
    }
  }
`;

async function fetchAniListData(season: string, year: number): Promise<Map<number, AniListEntry>> {
  const result = new Map<number, AniListEntry>();
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: ANILIST_QUERY,
        variables: { season: season.toUpperCase(), year, page },
      }),
    });
    if (!res.ok) throw new Error("AniList fetch failed");
    const { data } = await res.json() as any;
    hasNextPage = data.Page.pageInfo.hasNextPage;
    page++;
    for (const entry of data.Page.media) {
      if (!entry.idMal) continue;
      result.set(entry.idMal, {
        episodes: entry.episodes ?? null,
        streaming: (entry.externalLinks ?? [])
          .filter((l: any) => l.type === "STREAMING")
          .map((l: any) => ({ name: l.site, url: l.url })),
      });
    }
  }

  return result;
}

// ── Core fetch + cache ────────────────────────────────────────────────────────

async function warmSeason(season: string, year: number, env: Env): Promise<void> {
  const [jikanResult, anilistResult] = await Promise.allSettled([
    fetchJikanSeason(season, year),
    fetchAniListData(season, year),
  ]);

  if (jikanResult.status === "rejected") throw new Error(jikanResult.reason?.message);

  const anilistMap =
    anilistResult.status === "fulfilled" ? anilistResult.value : new Map<number, AniListEntry>();

  const anime = jikanResult.value.map((a) => {
    const al = anilistMap.get(a.id);
    return {
      ...a,
      episodes: a.episodes === 0 && al?.episodes ? al.episodes : a.episodes,
      streaming: al?.streaming ?? [],
    };
  });

  await env.ANIBINGE_CACHE.put(
    `season:${year}:${season}`,
    JSON.stringify(anime),
    { expirationTtl: CACHE_TTL }
  );
}

// ── Inflight deduplication ────────────────────────────────────────────────────
// KV has no atomic CAS, so two workers can slip through the lock check in the
// same millisecond. This is acceptable: it reduces N concurrent Jikan fetches
// down to ~2 rather than guaranteeing exactly 1.

async function tryAcquireLock(env: Env, cacheKey: string): Promise<boolean> {
  const held = await env.ANIBINGE_CACHE.get(`inflight:${cacheKey}`);
  if (held) return false;
  await env.ANIBINGE_CACHE.put(`inflight:${cacheKey}`, "1", { expirationTtl: INFLIGHT_TTL });
  return true;
}

async function releaseLock(env: Env, cacheKey: string): Promise<void> {
  await env.ANIBINGE_CACHE.delete(`inflight:${cacheKey}`);
}

// Poll until the fetching worker writes the data or drops the lock (on failure)
async function waitForCachedData(env: Env, cacheKey: string): Promise<string | null> {
  const deadline = Date.now() + POLL_TIMEOUT;
  while (Date.now() < deadline) {
    await delay(POLL_INTERVAL);
    const data = await env.ANIBINGE_CACHE.get(cacheKey);
    if (data) return data;
    const stillInflight = await env.ANIBINGE_CACHE.get(`inflight:${cacheKey}`);
    if (!stillInflight) return null; // other worker failed — we'll take over
  }
  return null; // timed out — fall through and fetch ourselves
}

// ── Worker ───────────────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const { pathname } = new URL(request.url);
    const match = pathname.match(/^\/season\/(\d{4})\/(winter|spring|summer|fall)$/);
    if (!match) return new Response("Not found", { status: 404, headers: corsHeaders });

    const year = parseInt(match[1]);
    const season = match[2];
    const cacheKey = `season:${year}:${season}`;

    try {
      // Fast path: already cached
      const cached = await env.ANIBINGE_CACHE.get(cacheKey);
      if (cached) {
        return new Response(cached, {
          headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "HIT" },
        });
      }

      // Try to become the one worker that fetches this season
      const locked = await tryAcquireLock(env, cacheKey);
      if (!locked) {
        // Another worker is already fetching — wait for it to finish
        const data = await waitForCachedData(env, cacheKey);
        if (data) {
          return new Response(data, {
            headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "DEDUP" },
          });
        }
        // Other worker failed or we timed out — fall through and fetch ourselves
      }

      try {
        await warmSeason(season, year, env);
      } finally {
        await releaseLock(env, cacheKey);
      }

      const body = await env.ANIBINGE_CACHE.get(cacheKey);
      return new Response(body ?? "[]", {
        headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "MISS" },
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return json({ error: msg }, 500);
    }
  },

  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    // Pre-warm the last 3 years of seasons (12 total) sequentially so we don't
    // flood Jikan with concurrent requests from the cron itself. Skip seasons
    // that already have fresh data in KV.
    ctx.waitUntil(
      (async () => {
        for (const { season, year } of recentSeasons(12)) {
          const cacheKey = `season:${year}:${season}`;
          const existing = await env.ANIBINGE_CACHE.get(cacheKey);
          if (existing) continue;
          try {
            await warmSeason(season, year, env);
          } catch (e) {
            console.error(`Failed to warm ${season} ${year}:`, e);
          }
          await delay(5000); // breathing room between seasons for Jikan
        }
      })()
    );
  },
};
