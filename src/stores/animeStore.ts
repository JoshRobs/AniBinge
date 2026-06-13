import { defineStore } from "pinia";
import { fetchSeasonAnime, type Anime } from "@/api/jikanApi";
import { fetchSeasonEpisodes } from "@/api/anilistApi";
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
        const [jikanResult, anilistResult] = await Promise.allSettled([
          fetchSeasonAnime(seasonStore.season, seasonStore.year),
          fetchSeasonEpisodes(seasonStore.season, seasonStore.year),
        ]);

        if (jikanResult.status === "rejected") throw new Error(jikanResult.reason?.message);

        const episodeMap =
          anilistResult.status === "fulfilled" ? anilistResult.value : new Map<number, number>();

        const anime = jikanResult.value.map((a) =>
          a.episodes === 0 && episodeMap.has(a.id)
            ? { ...a, episodes: episodeMap.get(a.id)! }
            : a
        );

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
