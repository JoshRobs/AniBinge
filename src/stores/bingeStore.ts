import { defineStore } from "pinia";
import { ref, watch } from "vue";
import type { Anime } from "@/api/jikanApi";
import { toPlanned } from "@/utils/anime";

const STORAGE_KEY = "anibinge-binge-list";

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

export const useBingeStore = defineStore("binge", () => {
  const list = ref<Anime[]>(loadFromStorage());

  watch(list, (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
  }, { deep: true });

  function has(id: number): boolean {
    return list.value.some((a) => a.id === id);
  }

  function add(anime: Anime): void {
    if (!has(anime.id)) list.value.push(anime);
  }

  function remove(id: number): void {
    list.value = list.value.filter((a) => a.id !== id);
  }

  function toggle(anime: Anime): void {
    has(anime.id) ? remove(anime.id) : add(anime);
  }

  function move(fromIndex: number, toIndex: number): void {
    const [item] = list.value.splice(fromIndex, 1);
    list.value.splice(toIndex, 0, item);
  }

  function sortByEndDate(): void {
    list.value = [...list.value].sort(
      (a, b) => toPlanned(a).estimatedEnd.getTime() - toPlanned(b).estimatedEnd.getTime()
    );
  }

  return { list, has, add, remove, toggle, move, sortByEndDate };
});
