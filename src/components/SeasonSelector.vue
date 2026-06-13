<template>
  <select v-model="seasonStore.season" @change="animeStore.loadSeason()">
    <option v-for="s in seasons" :key="s">{{ s }}</option>
  </select>
</template>

<script setup lang="ts">
import { useSeasonStore } from "@/stores/seasonStore";
import { useAnimeStore } from "@/stores/animeStore";

const seasons = ["winter", "spring", "summer", "fall"] as const;
const seasonStore = useSeasonStore();
const animeStore = useAnimeStore();
</script>
