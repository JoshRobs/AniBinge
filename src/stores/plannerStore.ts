import { defineStore } from "pinia";
import { useAnimeStore } from "./animeStore";
import { toPlanned, isFinished } from "@/utils/anime";

export type { PlannedAnime } from "@/utils/anime";

export const usePlannerStore = defineStore("planner", {
  state: () => ({
    mode: "explore" as "explore" | "binge",
    selectedAnimeId: null as number | null,
    skipped: [] as number[],
    minScore: 0,
    maxEpisodes: Infinity,
    sortBy: "endDate" as "endDate" | "score" | "episodes",
    hideUnscored: true,
    hideSingleEpisode: true,
    hideAiring: false,
  }),

  getters: {
    plannedAnime: (state) => {
      const animeStore = useAnimeStore();

      return animeStore.anime
        .filter((a) => !state.skipped.includes(a.id))
        .filter((a) => a.score === 0 || a.score >= state.minScore)
        .filter((a) => !state.hideUnscored || a.score > 0)
        .filter((a) => !state.hideSingleEpisode || a.episodes !== 1)
        .filter((a) => a.episodes <= state.maxEpisodes)
        .map(toPlanned)
        .filter((a) => !state.hideAiring || isFinished(a))
        .sort((a, b) => {
          if (!a.score && b.score) return 1;
          if (a.score && !b.score) return -1;
          if (state.sortBy === "score") return b.score - a.score;
          if (state.sortBy === "episodes") {
            if (!a.episodesKnown && b.episodesKnown) return 1;
            if (a.episodesKnown && !b.episodesKnown) return -1;
            return a.episodes - b.episodes;
          }
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
