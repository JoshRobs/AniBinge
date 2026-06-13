import { defineStore } from "pinia";
import { useAnimeStore } from "./animeStore";
import type { Anime } from "@/api/jikanApi";

export type PlannedAnime = Anime & { estimatedEnd: Date; episodesKnown: boolean; endDateKnown: boolean };

export const usePlannerStore = defineStore("planner", {
  state: () => ({
    mode: "explore" as "explore" | "binge",
    skipped: [] as number[],
    minScore: 0,
    maxEpisodes: Infinity,
    sortBy: "endDate" as "endDate" | "score" | "episodes",
  }),

  getters: {
    plannedAnime: (state): PlannedAnime[] => {
      const animeStore = useAnimeStore();

      return animeStore.anime
        .filter((a) => !state.skipped.includes(a.id))
        .filter((a) => a.score >= state.minScore)
        .filter((a) => a.episodes <= state.maxEpisodes)
        .map((a) => {
          const episodesKnown = a.episodes > 0;
          const endDateKnown = !!a.end_date || episodesKnown;
          const estimatedEnd = a.end_date
            ? new Date(a.end_date)
            : new Date(
                new Date(a.start_date).getTime() +
                  ((episodesKnown ? a.episodes : 12) - 1) * 7 * 86400000
              );
          return { ...a, episodesKnown, endDateKnown, estimatedEnd };
        })
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
