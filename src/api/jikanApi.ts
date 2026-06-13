export interface Anime {
  id: number;
  title: string;
  title_english: string | null;
  episodes: number;
  score: number;
  start_date: string;
  end_date: string | null;
  image: string;
}

function mapAnime(a: any): Anime {
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

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchPage(url: string, attempt = 1): Promise<any> {
  const res = await fetch(url);
  if (res.status === 429) {
    if (attempt >= 3) throw new Error("Jikan rate limit exceeded — try again in a moment");
    await delay(1000 * attempt);
    return fetchPage(url, attempt + 1);
  }
  if (!res.ok) throw new Error("Failed to fetch season data");
  return res.json();
}

export async function fetchSeasonAnime(season: string, year: number): Promise<Anime[]> {
  const results: Anime[] = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const { data, pagination } = await fetchPage(
      `https://api.jikan.moe/v4/seasons/${year}/${season}?page=${page}`
    );

    const filtered = data.filter((a: any) => (a.type === "TV" || a.type === "ONA") && a.score);
    results.push(...filtered.map(mapAnime));
    hasNextPage = pagination.has_next_page;
    page++;

    if (hasNextPage) await delay(500);
  }

  const seen = new Set<number>();
  return results.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
}
