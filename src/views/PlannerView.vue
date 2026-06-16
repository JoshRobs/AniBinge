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

    <Teleport to="body">
      <Transition name="backdrop">
        <div
          v-if="plannerStore.selectedAnimeId"
          class="mobile-backdrop"
          @click="plannerStore.selectedAnimeId = null"
        />
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import Toolbar from "@/components/Toolbar.vue";
import FilterPanel from "@/components/FilterPanel.vue";
import AnimeList from "@/components/AnimeList.vue";
import BingeTimeline from "@/components/BingeTimeline.vue";
import AnimeDetailPanel from "@/components/AnimeDetailPanel.vue";
import { usePlannerStore } from "@/stores/plannerStore";
import { useRoute, useRouter } from "vue-router";
import { onMounted, watch } from "vue";

const plannerStore = usePlannerStore();
const route = useRoute();
const router = useRouter();

onMounted(() => {
  if (route.query.mode === "binge") {
    plannerStore.mode = "binge";
    router.replace({ query: {} });
  }
});

watch(
  () => plannerStore.selectedAnimeId,
  (id) => {
    document.body.style.overflow = id ? "hidden" : "";
  },
);
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

.mobile-backdrop {
  display: none;
}

.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .mobile-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    z-index: 99;
    touch-action: none;
  }

  .panel-enter-from,
  .panel-leave-to {
    opacity: 1;
    transform: translateY(100%);
  }
}
</style>
