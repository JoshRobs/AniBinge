import { defineStore } from "pinia";
import { fetchSeasonAnime, type Anime } from "@/api/jikanApi";
import { useSeasonStore } from "./seasonStore";

export const useAnimeStore = defineStore("anime", {
  state: () => ({
    anime: [] as Anime[],
    loading: false,
    error: null as string | null,
    _cache: new Map<string, Anime[]>(),
  }),

  actions: {
    async loadSeason() {
      const seasonStore = useSeasonStore();
      const key = `${seasonStore.year}-${seasonStore.season}`;

      if (this._cache.has(key)) {
        this.anime = this._cache.get(key)!;
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        const anime = await fetchSeasonAnime(seasonStore.season, seasonStore.year);
        this._cache.set(key, anime);
        this.anime = anime;
      } catch (e: any) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },
  },
});
