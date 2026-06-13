import { defineStore } from "pinia";

export const useSeasonStore = defineStore("season", {
  state: () => ({
    year: new Date().getFullYear(),
    season: "fall" as "winter" | "spring" | "summer" | "fall",
  }),
});
