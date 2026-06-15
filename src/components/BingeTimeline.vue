<template>
  <div id="binge-timeline" class="binge-list">
    <!-- Empty state -->
    <div v-if="!bingeItems.length" class="empty-state">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-10 h-10 mb-4 opacity-30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
      <p class="text-gray-400 font-medium">Your binge list is empty</p>
      <p class="text-gray-600 text-sm mt-1">
        Switch to <strong class="text-gray-400">Explore</strong> and hit
        <strong class="text-gray-400">+</strong> on anime to add them here
      </p>
    </div>

    <template v-else>
      <!-- Binging Now -->
      <p class="section-label">Binging Now</p>
      <div
        class="binge-row binge-row--now"
        :class="{ 'drag-over': dropIndex === 0 }"
        :style="rowStyle(firstItem, 0)"
        draggable="true"
        @click="
          plannerStore.selectedAnimeId =
            plannerStore.selectedAnimeId === firstItem.id
              ? null
              : firstItem.id
        "
        @mouseenter="hoveredIndex = 0"
        @mouseleave="hoveredIndex = null"
        @dragstart="onDragStart($event, 0)"
        @dragover.prevent="onDragOver(0)"
        @drop.prevent="onDrop(0)"
        @dragend="onDragEnd"
      >
        <div class="drag-handle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-8 h-8"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <circle cx="9" cy="6" r="1.5" />
            <circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" />
            <circle cx="15" cy="18" r="1.5" />
          </svg>
        </div>
        <img
          v-if="firstItem.image"
          :src="firstItem.image"
          :alt="firstItem.title"
          class="row-cover row-cover--now"
        />
        <div class="row-info">
          <h3 class="row-title row-title--now">
            {{ firstItem.title_english ?? firstItem.title }}
          </h3>
          <p
            v-if="
              firstItem.title_english &&
              firstItem.title_english !== firstItem.title
            "
            class="row-subtitle"
          >
            {{ firstItem.title }}
          </p>
          <div v-if="firstItem.genres?.length" class="genre-tags">
            <span
              v-for="g in firstItem.genres"
              :key="g"
              class="genre-tag"
              >{{ g }}</span
            >
          </div>
        </div>
        <div class="row-stats">
          <p class="stats-label">
            {{ isFinished(firstItem) ? "Ended" : firstItem.end_date ? "Ends" : "Ends (est.)" }}
          </p>
          <p
            class="stats-date stats-date--now"
            :class="endClass(firstItem)"
          >
            {{
              firstItem.end_date
                ? formatDate(firstItem.estimatedEnd)
                : `~ ${formatDate(firstItem.estimatedEnd)}`
            }}
          </p>
          <p class="stats-eps">
            {{
              firstItem.episodesKnown
                ? `${firstItem.episodes} episodes`
                : "Episodes unknown"
            }}
          </p>
        </div>
        <button
          class="row-remove"
          @click.stop="bingeStore.remove(firstItem.id)"
          aria-label="Remove"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Up Next -->
      <template v-if="bingeItems.length > 1">
        <p class="section-label section-label--next">Up Next</p>
        <div
          v-for="(anime, i) in bingeItems.slice(1)"
          :key="anime.id"
          class="binge-row"
          :class="{ 'drag-over': dropIndex === i + 1 }"
          :style="rowStyle(anime, i + 1)"
          draggable="true"
          @click="
            plannerStore.selectedAnimeId =
              plannerStore.selectedAnimeId === anime.id ? null : anime.id
          "
          @mouseenter="hoveredIndex = i + 1"
          @mouseleave="hoveredIndex = null"
          @dragstart="onDragStart($event, i + 1)"
          @dragover.prevent="onDragOver(i + 1)"
          @drop.prevent="onDrop(i + 1)"
          @dragend="onDragEnd"
        >
          <div class="drag-handle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-8 h-8"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <circle cx="9" cy="6" r="1.5" />
              <circle cx="15" cy="6" r="1.5" />
              <circle cx="9" cy="12" r="1.5" />
              <circle cx="15" cy="12" r="1.5" />
              <circle cx="9" cy="18" r="1.5" />
              <circle cx="15" cy="18" r="1.5" />
            </svg>
          </div>
          <span class="row-number">{{ i + 2 }}</span>
          <img
            v-if="anime.image"
            :src="anime.image"
            :alt="anime.title"
            class="row-cover"
          />
          <div class="row-info">
            <h3 class="row-title">{{ anime.title_english ?? anime.title }}</h3>
            <div v-if="anime.genres?.length" class="genre-tags">
              <span v-for="g in anime.genres" :key="g" class="genre-tag">{{
                g
              }}</span>
            </div>
          </div>
          <div class="row-stats">
            <p class="stats-label">
              {{ isFinished(anime) ? "Ended" : anime.end_date ? "Ends" : "Ends (est.)" }}
            </p>
            <p class="stats-date" :class="endClass(anime)">
              {{
                anime.end_date
                  ? formatDate(anime.estimatedEnd)
                  : `~ ${formatDate(anime.estimatedEnd)}`
              }}
            </p>
            <p class="stats-eps">
              {{
                anime.episodesKnown
                  ? `${anime.episodes} episodes`
                  : "Episodes unknown"
              }}
            </p>
          </div>
          <button
            class="row-remove"
            @click.stop="bingeStore.remove(anime.id)"
            aria-label="Remove"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-8 h-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useBingeStore } from "@/stores/bingeStore";
import { usePlannerStore } from "@/stores/plannerStore";
import { toPlanned, formatDate, isFinished, type PlannedAnime } from "@/utils/anime";

const bingeStore = useBingeStore();
const plannerStore = usePlannerStore();

const bingeItems = computed<PlannedAnime[]>(() => bingeStore.list.map(toPlanned));
const firstItem = computed(() => bingeItems.value[0] as PlannedAnime);

// ── Drag and drop ─────────────────────────────────────────────────────────────

const draggingIndex = ref<number | null>(null);
const dropIndex = ref<number | null>(null);

function onDragStart(e: DragEvent, index: number) {
  draggingIndex.value = index;
  if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
}

function onDragOver(index: number) {
  if (draggingIndex.value !== null && draggingIndex.value !== index) {
    dropIndex.value = index;
  }
}

function onDrop(index: number) {
  if (draggingIndex.value !== null && draggingIndex.value !== index) {
    bingeStore.move(draggingIndex.value, index);
  }
  draggingIndex.value = null;
  dropIndex.value = null;
}

function onDragEnd() {
  draggingIndex.value = null;
  dropIndex.value = null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────


function endClass(anime: PlannedAnime): string {
  const now = Date.now();
  const start = anime.start_date
    ? new Date(anime.start_date).getTime()
    : Infinity;
  if (anime.endDateKnown && start <= now && anime.estimatedEnd.getTime() < now)
    return "meta-pill--finished";
  return "meta-pill--airing";
}

const hoveredIndex = ref<number | null>(null);

function rowStyle(anime: PlannedAnime, index: number) {
  if (dropIndex.value === index) return {};
  const h = hoveredIndex.value === index;
  const now = Date.now();
  const start = anime.start_date
    ? new Date(anime.start_date).getTime()
    : Infinity;

  let r: string, g: string, b: string;
  if (start > now) {
    r = "107";
    g = "114";
    b = "128";
  } else if (anime.endDateKnown && anime.estimatedEnd.getTime() < now) {
    r = "34";
    g = "197";
    b = "94";
  } else {
    r = "245";
    g = "158";
    b = "11";
  }

  return {
    borderColor: `rgba(${r}, ${g}, ${b}, ${h ? 0.65 : 0.15})`,
    backgroundColor: `rgba(${r}, ${g}, ${b}, ${h ? 0.12 : 0.02})`,
    transition: "border-color 0.2s ease, background-color 0.2s ease",
  };
}
</script>

<style scoped>
.binge-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  text-align: center;
}

.section-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #6b7280;
  padding: 0 16px;
  margin-bottom: 6px;
}
.section-label--next {
  margin-top: 24px;
}

/* ── Rows ── */
.binge-row {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background-color: var(--bg-card);
  cursor: grab;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
  min-height: 144px;
}
.binge-row:active {
  cursor: grabbing;
}
.binge-row.drag-over {
  border-color: var(--accent);
  background-color: color-mix(in srgb, var(--accent) 8%, var(--bg-card));
}

.binge-row--now {
  min-height: 288px;
}
.binge-row--now.drag-over {
  border-color: var(--accent);
}

/* ── Drag handle ── */
.drag-handle {
  color: #374151;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}
.binge-row:hover .drag-handle {
  color: #6b7280;
}

/* ── Row number ── */
.row-number {
  font-size: 13px;
  font-weight: 700;
  color: #4b5563;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

/* ── Cover ── */
.row-cover {
  width: 96px;
  aspect-ratio: 3/4;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}
.row-cover--now {
  width: 160px;
  border-radius: 10px;
}

/* ── Info ── */
.row-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.row-title {
  font-size: 18px;
  font-weight: 600;
  color: #f3f4f6;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.row-title--now {
  font-size: 24px;
  font-weight: 700;
}
.row-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin-top: -2px;
}

.genre-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 6px;
}
.genre-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: var(--bg-deep);
  border: 1px solid var(--border-input);
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── Stats column ── */
.row-stats {
  flex-shrink: 0;
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-right: 8px;
}
.stats-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
}
.stats-date {
  font-size: 20px;
  font-weight: 700;
  color: #f3f4f6;
  line-height: 1.1;
}
.stats-date--now {
  font-size: 28px;
}
.stats-estimated {
  font-size: 10px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-left: 4px;
  vertical-align: middle;
}
.stats-eps {
  font-size: 13px;
  color: #6b7280;
  margin-top: 2px;
}
.meta-pill--finished {
  color: #22c55e;
}
.meta-pill--airing {
  color: #f59e0b;
}

/* ── Remove button ── */
.row-remove {
  flex-shrink: 0;
  background: none;
  border: none;
  color: #374151;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s;
}
.row-remove:hover {
  color: #ef4444;
}
</style>
