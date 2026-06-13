import { defineStore } from "pinia";
import { useAnimeStore } from "./animeStore";

export const usePlannerStore = defineStore("planner", {
  state: () => ({
    skipped: [] as number[],
    minScore: 0,
    maxEpisodes: Infinity,
    sortBy: "endDate" as "endDate" | "score" | "episodes",
  }),

  getters: {
    plannedAnime: (state) => {
      const animeStore = useAnimeStore();

      return animeStore.anime
        .filter((a) => !state.skipped.includes(a.id))
        .filter((a) => a.score >= state.minScore)
        .filter((a) => a.episodes <= state.maxEpisodes)
        .map((a) => ({
          ...a,
          estimatedEnd: new Date(
            new Date(a.start_date).getTime() + a.episodes * 7 * 86400000
          ),
        }))
        .sort((a, b) => {
          if (state.sortBy === "score") return b.score - a.score;
          if (state.sortBy === "episodes") return a.episodes - b.episodes;
          return +a.estimatedEnd - +b.estimatedEnd;
        });
    },
  },

  actions: {
    toggleSkip(id: number) {
      this.skipped.includes(id)
        ? (this.skipped = this.skipped.filter((x) => x !== id))
        : this.skipped.push(id);
    },
  },
});
