<script setup lang="ts">
import { usePlannerStore } from "@/stores/plannerStore";

const planner = usePlannerStore();
</script>

<template>
  <ol>
    <li v-for="anime in planner.plannedAnime" :key="anime.id">
      {{ anime.title }} – ends {{ anime.estimatedEnd.toDateString() }}
    </li>
  </ol>
</template>
