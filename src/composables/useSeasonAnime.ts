import { ref, watch } from "vue";
import { fetchSeasonAnime } from "@/api/malApi";

export function useSeasonAnime(season: any) {
  const anime = ref([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function load() {
    loading.value = true;
    try {
      anime.value = await fetchSeasonAnime(
        season.value.name,
        season.value.year
      );
    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  watch(season, load, { immediate: true });

  return { anime, loading, error };
}
