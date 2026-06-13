const ANILIST_URL = "https://graphql.anilist.co";

const SEASON_EPISODES_QUERY = `
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

export async function fetchSeasonEpisodes(
  season: string,
  year: number
): Promise<Map<number, number>> {
  const anilistSeason = season.toUpperCase();
  const result = new Map<number, number>();

  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const res = await fetch(ANILIST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: SEASON_EPISODES_QUERY,
        variables: { season: anilistSeason, year, page },
      }),
    });

    if (!res.ok) throw new Error("AniList fetch failed");

    const { data } = await res.json();
    hasNextPage = data.Page.pageInfo.hasNextPage;
    page++;

    for (const entry of data.Page.media) {
      if (entry.idMal && entry.episodes) {
        result.set(entry.idMal, entry.episodes);
      }
    }
  }

  return result;
}
