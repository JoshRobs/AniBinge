<template>
  <div
    class="min-h-screen text-white"
    :class="{ 'binge-mode': plannerStore.mode === 'binge' }"
    style="background-color: var(--bg-deep)"
  >
    <Toolbar />
    <FilterPanel />
    <main class="max-w-[1400px] mx-auto px-6 py-8">
      <AnimeList v-if="plannerStore.mode === 'explore'" />
      <BingeTimeline v-else />
    </main>
  </div>
</template>

<script setup lang="ts">
import Toolbar from "@/components/Toolbar.vue";
import FilterPanel from "@/components/FilterPanel.vue";
import AnimeList from "@/components/AnimeList.vue";
import BingeTimeline from "@/components/BingeTimeline.vue";
import { usePlannerStore } from "@/stores/plannerStore";

const plannerStore = usePlannerStore();
</script>
