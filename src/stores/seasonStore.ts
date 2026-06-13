import { defineStore } from "pinia";

type Season = "winter" | "spring" | "summer" | "fall";

function lastFinishedSeason(): { season: Season; year: number } {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();

  // Seasons end: Winter=Mar, Spring=Jun, Summer=Sep, Fall=Dec
  if (month <= 3) return { season: "fall", year: year - 1 };
  if (month <= 6) return { season: "winter", year };
  if (month <= 9) return { season: "spring", year };
  return { season: "summer", year };
}

export const useSeasonStore = defineStore("season", {
  state: () => ({
    ...lastFinishedSeason(),
  }),
});
