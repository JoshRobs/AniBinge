<template>
  <div
    class="min-h-screen flex flex-col text-white"
    :class="{ 'binge-mode': plannerStore.mode === 'binge' }"
    style="background-color: var(--bg-deep)"
  >
    <Toolbar />
    <FilterPanel />
    <div class="flex flex-1 items-start">
      <div class="flex-1 min-w-0 py-8">
        <div class="@container max-w-350 mx-auto px-6">
          <AnimeList v-if="plannerStore.mode === 'explore'" />
          <BingeTimeline v-else />
        </div>
      </div>
      <Transition name="panel">
        <AnimeDetailPanel v-if="plannerStore.selectedAnimeId" />
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import Toolbar from "@/components/Toolbar.vue";
import FilterPanel from "@/components/FilterPanel.vue";
import AnimeList from "@/components/AnimeList.vue";
import BingeTimeline from "@/components/BingeTimeline.vue";
import AnimeDetailPanel from "@/components/AnimeDetailPanel.vue";
import { usePlannerStore } from "@/stores/plannerStore";

const plannerStore = usePlannerStore();
</script>

<style scoped>
.panel-enter-active,
.panel-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateX(24px);
}
</style>
