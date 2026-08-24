import { defineStore } from "pinia";
import { ref, watch } from "vue";
import type { Anime } from "@/api/jikanApi";

export interface SavedList {
  id: string;
  name: string;
  createdAt: number;
  items: Anime[];
}

const STORAGE_KEY = "anibinge-saved-lists";

function loadFromStorage(): SavedList[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export const useSavedListsStore = defineStore("savedLists", () => {
  const lists = ref<SavedList[]>(loadFromStorage());

  watch(lists, (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
  }, { deep: true });

  function save(name: string, items: Anime[]): void {
    lists.value = [
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        createdAt: Date.now(),
        items: [...items],
      },
      ...lists.value,
    ];
  }

  function remove(id: string): void {
    lists.value = lists.value.filter((l) => l.id !== id);
  }

  return { lists, save, remove };
});
