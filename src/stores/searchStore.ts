import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { searchAnime, type Anime } from "@/api/jikanApi";

export const useSearchStore = defineStore("search", () => {
  const query = ref("");
  const results = ref<Anime[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isActive = computed(() => query.value.trim().length >= 2);

  const cache = new Map<string, Anime[]>();
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  function setQuery(q: string) {
    query.value = q;
    if (debounceTimer) clearTimeout(debounceTimer);

    const trimmed = q.trim();
    if (trimmed.length < 2) {
      results.value = [];
      loading.value = false;
      return;
    }

    if (cache.has(trimmed)) {
      results.value = cache.get(trimmed)!;
      return;
    }

    loading.value = true;
    debounceTimer = setTimeout(async () => {
      try {
        const data = await searchAnime(trimmed);
        cache.set(trimmed, data);
        results.value = data;
        error.value = null;
      } catch (e: any) {
        error.value = e.message;
      } finally {
        loading.value = false;
      }
    }, 600);
  }

  function clear() {
    query.value = "";
    results.value = [];
    loading.value = false;
    error.value = null;
    if (debounceTimer) clearTimeout(debounceTimer);
  }

  return { query, results, loading, error, isActive, setQuery, clear };
});
