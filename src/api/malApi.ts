export async function fetchSeasonAnime(season: string, year: number) {
  const res = await fetch(
    `https://api.myanimelist.net/v2/anime/season/${year}/${season}`
  );
if (!res.ok) throw new Error("Failed to fetch season data");
  return res.json();
}
