<template>
  <div class="anime-list">
    <div v-if="animeStore.loading">Loading...</div>
    <div v-else-if="animeStore.error">{{ animeStore.error }}</div>
    <AnimeCard v-for="anime in animeStore.anime" :key="anime.id" :anime="anime" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import AnimeCard from "./AnimeCard.vue";
import { useAnimeStore } from "@/stores/animeStore";

const animeStore = useAnimeStore();

onMounted(() => {
  animeStore.loadSeason();
});
</script>
