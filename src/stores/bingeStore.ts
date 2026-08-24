import { defineStore } from "pinia";
import { ref, watch } from "vue";
import type { Anime } from "@/api/jikanApi";
import { toPlanned, isFinished } from "@/utils/anime";
import { useToastStore } from "./toastStore";

const STORAGE_KEY = "anibinge-binge-list";
const COMPLETED_KEY = "anibinge-completed-ids";
const SORT_KEY = "anibinge-binge-sort";

export type BingeSortBy = "endDate" | "score" | "episodes" | "custom";

function loadFromStorage(): Anime[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    // Guard against old format that stored plain IDs (numbers)
    if (Array.isArray(raw) && (raw.length === 0 || typeof raw[0] === "object")) {
      return raw;
    }
    return [];
  } catch {
    return [];
  }
}

function loadCompletedFromStorage(): Set<number> {
  try {
    const raw = JSON.parse(localStorage.getItem(COMPLETED_KEY) ?? "[]");
    if (Array.isArray(raw)) return new Set(raw);
    return new Set();
  } catch {
    return new Set();
  }
}

export const useBingeStore = defineStore("binge", () => {
  const list = ref<Anime[]>(loadFromStorage());
  const completedIds = ref<Set<number>>(loadCompletedFromStorage());
  const bingeSortBy = ref<BingeSortBy>(
    (localStorage.getItem(SORT_KEY) as BingeSortBy | null) ?? "endDate"
  );

  watch(list, (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
  }, { deep: true });

  watch(completedIds, (val) => {
    localStorage.setItem(COMPLETED_KEY, JSON.stringify([...val]));
  });

  watch(bingeSortBy, (val) => {
    localStorage.setItem(SORT_KEY, val);
  });

  function has(id: number): boolean {
    return list.value.some((a) => a.id === id);
  }

  function add(anime: Anime): void {
    if (!has(anime.id)) {
      list.value.push(anime);
      const planned = toPlanned(anime);
      const now = Date.now();
      const started = anime.start_date ? new Date(anime.start_date).getTime() <= now : false;
      const titleColor = !started ? "#e5e7eb" : isFinished(planned) ? "#86efac" : "#fcd34d";
      useToastStore().show("added to your Binge List", {
        title: anime.title_english ?? anime.title,
        titleColor,
        showAction: true,
      });
    }
  }

  function remove(id: number): void {
    list.value = list.value.filter((a) => a.id !== id);
    if (completedIds.value.has(id)) {
      const next = new Set(completedIds.value);
      next.delete(id);
      completedIds.value = next;
    }
  }

  function toggle(anime: Anime): void {
    has(anime.id) ? remove(anime.id) : add(anime);
  }

  function move(fromIndex: number, toIndex: number): void {
    const removed = list.value.splice(fromIndex, 1);
    if (removed[0]) list.value.splice(toIndex, 0, removed[0]);
    bingeSortBy.value = "custom";
  }

  function sortByEndDate(): void {
    bingeSortBy.value = "endDate";
    list.value = [...list.value].sort(
      (a, b) => toPlanned(a).estimatedEnd.getTime() - toPlanned(b).estimatedEnd.getTime()
    );
  }

  function sortByScore(): void {
    bingeSortBy.value = "score";
    list.value = [...list.value].sort((a, b) => {
      if (!a.score && b.score) return 1;
      if (a.score && !b.score) return -1;
      return b.score - a.score;
    });
  }

  function sortByEpisodes(): void {
    bingeSortBy.value = "episodes";
    list.value = [...list.value].sort((a, b) => {
      if (!a.episodes && b.episodes) return 1;
      if (a.episodes && !b.episodes) return -1;
      return a.episodes - b.episodes;
    });
  }

  function isCompleted(id: number): boolean {
    return completedIds.value.has(id);
  }

  function toggleComplete(id: number): void {
    const next = new Set(completedIds.value);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    completedIds.value = next;
  }

  function clearAll(): void {
    list.value = [];
    completedIds.value = new Set();
  }

  function replaceAll(items: Anime[]): void {
    list.value = [...items];
    completedIds.value = new Set();
  }

  return {
    list, bingeSortBy,
    has, add, remove, toggle, move,
    sortByEndDate, sortByScore, sortByEpisodes,
    isCompleted, toggleComplete, clearAll, replaceAll,
  };
});
