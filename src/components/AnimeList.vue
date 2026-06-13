<template>
  <div>
    <div v-if="animeStore.loading" class="flex flex-col items-center justify-center py-32 gap-3">
      <div class="spinner w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"></div>
      <span class="text-gray-400 text-sm">Loading season...</span>
    </div>
    <div v-else-if="animeStore.error" class="flex items-center justify-center py-32">
      <p class="text-red-400">{{ animeStore.error }}</p>
    </div>
    <div v-else-if="plannerStore.plannedAnime.length === 0" class="flex items-center justify-center py-32">
      <p class="text-gray-500">No anime found for this season.</p>
    </div>
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
      <AnimeCard v-for="anime in plannerStore.plannedAnime" :key="anime.id" :anime="anime" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import AnimeCard from "./AnimeCard.vue";
import { useAnimeStore } from "@/stores/animeStore";
import { usePlannerStore } from "@/stores/plannerStore";

const animeStore = useAnimeStore();
const plannerStore = usePlannerStore();

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
</style>
