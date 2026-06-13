<template>
  <div
    class="relative cursor-pointer"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <div class="relative overflow-hidden rounded-lg" style="aspect-ratio: 3/4">
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
    </div>
    <div class="mt-2.5 px-0.5">
      <h3
        class="card-title text-sm font-medium leading-snug line-clamp-2 transition-colors duration-150"
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
      <div v-show="hovered" class="popup">
        <p class="popup-ends-label">Ends</p>
        <p class="popup-ends-date">{{ anime.endDateKnown ? formatDate(anime.estimatedEnd) : "Unknown" }}</p>
        <div class="popup-divider"></div>
        <div class="popup-row">
          <span class="popup-label">Score</span>
          <span class="popup-value" :class="scoreColor(anime.score)">
            {{ anime.score ? `★ ${anime.score.toFixed(1)}` : "N/A" }}
          </span>
        </div>
        <div class="popup-row">
          <span class="popup-label">Episodes</span>
          <span class="popup-value">{{ anime.episodesKnown ? anime.episodes : "Unknown" }}</span>
        </div>
        <div class="popup-row">
          <span class="popup-label">Starts</span>
          <span class="popup-value">{{
            formatDate(new Date(anime.start_date))
          }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { PlannedAnime } from "@/stores/plannerStore";

defineProps<{ anime: PlannedAnime }>();

const hovered = ref(false);

function scoreColor(score: number): string {
  if (score >= 8) return "text-green-400";
  if (score <= 5) return "text-red-400";
  return "text-yellow-300";
}

function formatDate(date: Date): string {
  if (!date || isNaN(date.getTime())) return "TBA";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
</script>

<style scoped>
.card-title {
  color: #f3f4f6;
}
.no-image {
  background-color: var(--bg-card);
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
