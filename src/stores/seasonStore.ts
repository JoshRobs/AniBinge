import { defineStore } from "pinia";

type Season = "winter" | "spring" | "summer" | "fall";

function currentSeason(): { season: Season; year: number } {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();

  if (month <= 3) return { season: "winter", year };
  if (month <= 6) return { season: "spring", year };
  if (month <= 9) return { season: "summer", year };
  return { season: "fall", year };
}

export const useSeasonStore = defineStore("season", {
  state: () => ({
    ...currentSeason(),
  }),
});
