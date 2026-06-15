<template>
  <div>
    <!-- Search results -->
    <template v-if="searchStore.isActive">
      <p class="search-header">
        <template v-if="searchStore.loading">Searching…</template>
        <template v-else>
          <span class="search-count">{{ searchStore.results.length }}</span>
          results for <span class="search-query">"{{ searchStore.query }}"</span>
        </template>
      </p>
      <div v-if="searchStore.loading" class="flex flex-col items-center justify-center py-32 gap-3">
        <div class="spinner w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" />
        <span class="text-gray-400 text-sm">Searching…</span>
      </div>
      <div v-else-if="searchStore.error" class="flex items-center justify-center py-32">
        <p class="text-red-400">{{ searchStore.error }}</p>
      </div>
      <div v-else-if="searchStore.results.length === 0" class="flex items-center justify-center py-32">
        <p class="text-gray-500">No results found.</p>
      </div>
      <div
        v-else
        class="grid grid-cols-2 @[500px]:grid-cols-3 @[700px]:grid-cols-4 @[950px]:grid-cols-5 @[1200px]:grid-cols-6 gap-5"
      >
        <AnimeCard v-for="anime in searchPlanned" :key="anime.id" :anime="anime" />
      </div>
    </template>

    <!-- Season browse -->
    <template v-else>
      <div v-if="animeStore.loading" class="flex flex-col items-center justify-center py-32 gap-3">
        <div class="spinner w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" />
        <span class="text-gray-400 text-sm">Loading season…</span>
      </div>
      <div v-else-if="animeStore.error" class="flex items-center justify-center py-32">
        <p class="text-red-400">{{ animeStore.error }}</p>
      </div>
      <div v-else-if="plannerStore.plannedAnime.length === 0" class="flex items-center justify-center py-32">
        <p class="text-gray-500">No anime found for this season.</p>
      </div>
      <div
        v-else
        class="grid grid-cols-2 @[500px]:grid-cols-3 @[700px]:grid-cols-4 @[950px]:grid-cols-5 @[1200px]:grid-cols-6 gap-5"
      >
        <AnimeCard v-for="anime in plannerStore.plannedAnime" :key="anime.id" :anime="anime" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import AnimeCard from "./AnimeCard.vue";
import { useAnimeStore } from "@/stores/animeStore";
import { usePlannerStore } from "@/stores/plannerStore";
import { useSearchStore } from "@/stores/searchStore";
import type { PlannedAnime } from "@/stores/plannerStore";

const animeStore = useAnimeStore();
const plannerStore = usePlannerStore();
const searchStore = useSearchStore();

const searchPlanned = computed<PlannedAnime[]>(() =>
  searchStore.results.map((a) => {
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
);

onMounted(() => {
  animeStore.loadSeason();
});
</script>

<style scoped>
.spinner {
  border-color: var(--accent);
  border-top-color: transparent;
  transition: border-color 0.4s ease;
}
.search-header {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 20px;
}
.search-count {
  color: #e5e7eb;
  font-weight: 600;
}
.search-query {
  color: #e5e7eb;
  font-weight: 600;
}
</style>
