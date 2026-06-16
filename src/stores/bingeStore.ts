import { defineStore } from "pinia";
import { ref, watch } from "vue";
import type { Anime } from "@/api/jikanApi";
import { toPlanned } from "@/utils/anime";

const STORAGE_KEY = "anibinge-binge-list";
const COMPLETED_KEY = "anibinge-completed-ids";

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

  watch(list, (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
  }, { deep: true });

  watch(completedIds, (val) => {
    localStorage.setItem(COMPLETED_KEY, JSON.stringify([...val]));
  });

  function has(id: number): boolean {
    return list.value.some((a) => a.id === id);
  }

  function add(anime: Anime): void {
    if (!has(anime.id)) list.value.push(anime);
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
  }

  function sortByEndDate(): void {
    list.value = [...list.value].sort(
      (a, b) => toPlanned(a).estimatedEnd.getTime() - toPlanned(b).estimatedEnd.getTime()
    );
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

  return { list, has, add, remove, toggle, move, sortByEndDate, isCompleted, toggleComplete };
});
