<template>
  <div
    class="relative cursor-pointer"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @click="
      plannerStore.selectedAnimeId =
        plannerStore.selectedAnimeId === anime.id ? null : anime.id
    "
  >
    <div
      class="relative overflow-hidden rounded-lg image-container"
      :style="{
        aspectRatio: '3/4',
        boxShadow: bingeStore.has(anime.id)
          ? `0 0 30px 6px ${popupBorderColor}${hovered ? '55' : '00'}, 0 0 0 2px ${popupBorderColor}, 0 0 18px 3px ${popupBorderColor}99`
          : `0 0 30px 6px ${popupBorderColor}${hovered ? '55' : '00'}`,
      }"
    >
      <img
        v-if="anime.image"
        :src="anime.image"
        :alt="anime.title"
        class="w-full h-full object-cover transition-transform duration-300"
        :class="{ 'scale-105': hovered }"
        loading="lazy"
      />
      <div
        v-else
        class="no-image w-full h-full flex items-center justify-center"
      >
        <span class="text-gray-600 text-xs">No Image</span>
      </div>
      <div
        v-if="anime.score"
        class="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded px-2 py-1 text-sm font-bold"
        :class="scoreColor(anime.score)"
      >
        ★ {{ anime.score.toFixed(1) }}
      </div>

      <button
        class="binge-btn"
        :class="
          bingeStore.has(anime.id) ? 'binge-btn--added' : 'binge-btn--idle'
        "
        @click.stop="bingeStore.toggle(anime)"
        :aria-label="
          bingeStore.has(anime.id)
            ? 'Remove from binge list'
            : 'Add to binge list'
        "
      >
        <svg
          v-if="bingeStore.has(anime.id)"
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
    <div class="mt-2.5 px-0.5">
      <h3
        class="card-title text-md font-medium leading-snug line-clamp-2 transition-colors duration-150"
      >
        {{ anime.title_english ?? anime.title }}
      </h3>
      <p
        v-if="anime.title_english && anime.title_english !== anime.title"
        class="mt-0.5 text-xs text-gray-500 leading-snug line-clamp-1"
      >
        {{ anime.title }}
      </p>
    </div>

    <Transition name="popup">
      <div
        v-show="hovered"
        class="popup"
        :style="{
          borderColor: popupBorderColor,
          boxShadow: `0 8px 32px rgba(0,0,0,0.6), inset 0 0 18px -6px ${popupBorderColor}60`,
        }"
      >
        <p class="popup-ends-label">
          {{
            isFinished(anime)
              ? "Ended"
              : anime.end_date
                ? "Ends"
                : "Ends (est.)"
          }}
        </p>
        <p class="popup-ends-date" :style="{ color: endDateColor }">
          {{
            anime.end_date
              ? formatDate(anime.estimatedEnd)
              : `~ ${formatDate(anime.estimatedEnd)}`
          }}
        </p>
        <div class="popup-divider"></div>
        <div class="popup-row">
          <span class="popup-label">Type</span>
          <span class="popup-value">{{ anime.type ?? "Unknown" }}</span>
        </div>
        <div class="popup-row">
          <span class="popup-label">Episodes</span>
          <span class="popup-value">{{
            anime.episodesKnown ? anime.episodes : "Unknown"
          }}</span>
        </div>
        <div class="popup-row">
          <span class="popup-label">{{
            isStarted(anime) ? "Started" : "Starts"
          }}</span>
          <span class="popup-value">{{
            formatDate(new Date(anime.start_date))
          }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { usePlannerStore } from "@/stores/plannerStore";
import { useBingeStore } from "@/stores/bingeStore";
import { isFinished, isStarted, scoreColor, formatDate } from "@/utils/anime";
import type { PlannedAnime } from "@/utils/anime";

const plannerStore = usePlannerStore();
const bingeStore = useBingeStore();
const props = defineProps<{ anime: PlannedAnime }>();

const hovered = ref(false);

const popupBorderColor = computed(() => {
  const now = Date.now();
  const start = props.anime.start_date
    ? new Date(props.anime.start_date).getTime()
    : Infinity;
  if (start > now) return "#6b7280";
  if (isFinished(props.anime)) return "#22c55e";
  return "#f59e0b";
});

const endDateColor = computed(() => {
  const now = Date.now();
  const start = props.anime.start_date
    ? new Date(props.anime.start_date).getTime()
    : Infinity;
  if (start > now) return "#e5e7eb";
  if (isFinished(props.anime)) return "#86efac";
  return "#fcd34d";
});
</script>

<style scoped>
.card-title {
  color: #f3f4f6;
}
.no-image {
  background-color: var(--bg-card);
}
.image-container {
  transition: box-shadow 0.3s ease;
}

.binge-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.2s ease,
    transform 0.15s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}
.binge-btn:hover {
  transform: scale(1.15);
}
.binge-btn--idle {
  background: rgba(0, 0, 0, 0.65);
  color: rgba(255, 255, 255, 0.7);
}
.binge-btn--idle:hover {
  background: rgba(0, 0, 0, 0.8);
  color: white;
}
.binge-btn--added {
  background: var(--accent);
  color: white;
}

.popup {
  position: absolute;
  top: 0;
  left: calc(100% + 12px);
  width: 210px;
  background-color: var(--bg-header);
  border: 1px solid var(--border-input);
  border-radius: 12px;
  padding: 14px;
  z-index: 50;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  pointer-events: none;
}

.popup-ends-label {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 2px;
}
.popup-ends-date {
  font-size: 22px;
  font-weight: 700;
  color: #f3f4f6;
  line-height: 1.1;
  margin-bottom: 12px;
}
.popup-divider {
  height: 1px;
  background-color: var(--border);
  margin-bottom: 10px;
}
.popup-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12px;
}
.popup-row:last-child {
  margin-bottom: 0;
}
.popup-label {
  color: #6b7280;
}
.popup-value {
  color: #e5e7eb;
  font-weight: 600;
}

.popup-enter-active,
.popup-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.popup-enter-from,
.popup-leave-to {
  opacity: 0;
  transform: translateX(-6px);
}
</style>
