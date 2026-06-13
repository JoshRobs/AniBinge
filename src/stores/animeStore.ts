import { defineStore } from "pinia";
import { fetchSeasonAnime } from "@/api/malApi";
import { useSeasonStore } from "./seasonStore";

export const useAnimeStore = defineStore("anime", {
  state: () => ({
    anime: [] as any[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async loadSeason() {
      const seasonStore = useSeasonStore();
      this.loading = true;
      this.error = null;

      try {
        this.anime = await fetchSeasonAnime(
          seasonStore.season,
          seasonStore.year
        );
      } catch (e: any) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },
  },
});
