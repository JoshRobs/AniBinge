export interface Env {
  ANIME_CACHE: KVNamespace;
}

const CACHE_TTL = 60 * 60 * 24; // 24 hours
const JIKAN_PAGE_DELAY = 500;

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
    const filtered = data.filter((a: any) => (a.type === "TV" || a.type === "ONA") && a.score);
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

const ANILIST_QUERY = `
  query ($season: MediaSeason, $year: Int, $page: Int) {
    Page(page: $page, perPage: 50) {
      pageInfo { hasNextPage }
      media(season: $season, seasonYear: $year, type: ANIME) {
        idMal
        episodes
      }
    }
  }
`;

async function fetchAniListEpisodes(season: string, year: number): Promise<Map<number, number>> {
  const result = new Map<number, number>();
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
    const { data } = await res.json();
    hasNextPage = data.Page.pageInfo.hasNextPage;
    page++;
    for (const entry of data.Page.media) {
      if (entry.idMal && entry.episodes) result.set(entry.idMal, entry.episodes);
    }
  }

  return result;
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

    const cached = await env.ANIME_CACHE.get(cacheKey);
    if (cached) {
      return new Response(cached, {
        headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "HIT" },
      });
    }

    try {
      const [jikanResult, anilistResult] = await Promise.allSettled([
        fetchJikanSeason(season, year),
        fetchAniListEpisodes(season, year),
      ]);

      if (jikanResult.status === "rejected") throw new Error(jikanResult.reason?.message);

      const episodeMap =
        anilistResult.status === "fulfilled" ? anilistResult.value : new Map<number, number>();

      const anime = jikanResult.value.map((a) =>
        a.episodes === 0 && episodeMap.has(a.id) ? { ...a, episodes: episodeMap.get(a.id) } : a
      );

      const body = JSON.stringify(anime);
      await env.ANIME_CACHE.put(cacheKey, body, { expirationTtl: CACHE_TTL });

      return new Response(body, {
        headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "MISS" },
      });
    } catch (e: any) {
      return json({ error: e.message }, 500);
    }
  },
};
