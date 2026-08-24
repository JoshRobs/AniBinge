<template>
  <div id="binge-timeline" class="binge-list">
    <!-- Empty state -->
    <div v-if="!bingeStore.list.length" class="empty-state">
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
      <button class="empty-saved-btn" @click="savedListsOpen = true">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
        Load a saved list
      </button>
    </div>

    <template v-else>
      <!-- ── Binge toolbar ──────────────────────────────────────────────── -->
      <div class="binge-toolbar" data-html2canvas-ignore>
        <div ref="sortRef" class="btool-sort-wrap">
          <button class="btool-btn" @click="sortOpen = !sortOpen">
            <svg xmlns="http://www.w3.org/2000/svg" class="btool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="9" y2="18"/>
            </svg>
            <span class="btool-label">{{ sortLabel }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="btool-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <div v-if="sortOpen" class="btool-dropdown">
            <button class="btool-dropdown-option" :class="{ 'btool-dropdown-option--active': bingeStore.bingeSortBy === 'endDate' }" @click="doSort('endDate')">
              <svg xmlns="http://www.w3.org/2000/svg" class="btool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              End Date
            </button>
            <button class="btool-dropdown-option" :class="{ 'btool-dropdown-option--active': bingeStore.bingeSortBy === 'score' }" @click="doSort('score')">
              <svg xmlns="http://www.w3.org/2000/svg" class="btool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Score
            </button>
            <button class="btool-dropdown-option" :class="{ 'btool-dropdown-option--active': bingeStore.bingeSortBy === 'episodes' }" @click="doSort('episodes')">
              <svg xmlns="http://www.w3.org/2000/svg" class="btool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
              Episodes
            </button>
            <div v-if="bingeStore.bingeSortBy === 'custom'" class="btool-dropdown-option btool-dropdown-option--active btool-dropdown-option--custom">
              <svg xmlns="http://www.w3.org/2000/svg" class="btool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="5 9 2 12 5 15"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/>
              </svg>
              Custom Order
            </div>
          </div>
        </div>

        <div ref="exportRef" class="btool-export-wrap">
          <button class="btool-btn" :disabled="exporting" @click="exportOpen = !exportOpen">
            <svg xmlns="http://www.w3.org/2000/svg" class="btool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span class="btool-label">{{ exporting ? "Exporting…" : "Export" }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="btool-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <div v-if="exportOpen" class="btool-dropdown">
            <button class="btool-dropdown-option" @click="doExport('png')">
              <svg xmlns="http://www.w3.org/2000/svg" class="btool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
              PNG Image
            </button>
            <button class="btool-dropdown-option" @click="doExport('pdf')">
              <svg xmlns="http://www.w3.org/2000/svg" class="btool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              PDF Document
            </button>
            <button class="btool-dropdown-option" @click="doExport('clipboard')">
              <svg xmlns="http://www.w3.org/2000/svg" class="btool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              </svg>
              Copy to Clipboard
            </button>
          </div>
        </div>

        <button
          class="btool-btn"
          :class="{ 'btool-btn--copied': copied }"
          @click="copyShareLink"
          title="Copy share link"
        >
          <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" class="btool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="btool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span class="btool-label">{{ copied ? "Copied!" : "Share" }}</span>
        </button>

        <button
          class="btool-btn"
          @click="savedListsOpen = true"
          title="Saved Lists"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="btool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          <span class="btool-label">Saved Lists</span>
        </button>

        <button
          class="btool-btn btool-btn--danger"
          :class="{ 'btool-btn--confirming': clearConfirm }"
          @click="handleClearAll"
          :title="clearConfirm ? 'Click again to confirm' : 'Clear all anime'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="btool-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
          <span class="btool-label">{{ clearConfirm ? "Confirm?" : "Clear All" }}</span>
        </button>
      </div>

      <!-- ── Active items ─────────────────────────────────────────────── -->
      <template v-if="previewItems.length">
        <p class="section-label">Binging Now</p>
        <!-- Single TransitionGroup for ALL active rows so that dragging any item
             to slot 0 keeps its DOM element inside the group (FLIP-animates it
             to the top) rather than removing it, which would break touch events. -->
        <TransitionGroup name="binge-list" tag="div" class="binge-all-group">
          <template v-for="(anime, i) in previewItems" :key="anime.id">
            <!-- "Up Next" section label injected before the second row -->
            <div
              v-if="i === 1"
              :key="'__up-next-label__'"
              class="up-next-header section-label--inline"
            >
              <p class="section-label section-label--next">Up Next</p>
              <span class="up-next-count">{{ previewItems.length - 1 }}</span>
            </div>

            <div
              :data-row-index="i"
              :class="[
                'binge-row',
                i === 0 ? 'binge-row--now' : '',
                { 'row-dragging': anime.id === draggingId },
              ]"
              :style="rowStyle(anime, i)"
              draggable="true"
              @click="
                plannerStore.selectedAnimeId =
                  plannerStore.selectedAnimeId === anime.id ? null : anime.id
              "
              @mouseenter="hoveredIndex = i"
              @mouseleave="hoveredIndex = null"
              @dragstart="onDragStart($event, i)"
              @dragover.prevent="onDragOver(i)"
              @drop.prevent="onDrop(i)"
              @dragend="onDragEnd"
            >
              <div
                class="drag-handle"
                @touchstart.prevent="onHandleTouchStart($event, i)"
              >
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

              <!-- ── Binging Now layout (slot 0) ── -->
              <template v-if="i === 0">
                <img
                  v-if="anime.image"
                  :src="anime.image"
                  :alt="anime.title"
                  class="row-cover row-cover--now"
                />
                <div class="row-main">
                  <div class="row-info">
                    <h3 class="row-title row-title--now">
                      {{ anime.title_english ?? anime.title }}
                    </h3>
                    <p
                      v-if="
                        anime.title_english &&
                        anime.title_english !== anime.title
                      "
                      class="row-subtitle"
                    >
                      {{ anime.title }}
                    </p>
                    <div v-if="anime.genres?.length" class="genre-tags">
                      <span
                        v-for="g in anime.genres"
                        :key="g"
                        class="genre-tag"
                        >{{ g }}</span
                      >
                    </div>
                  </div>
                  <div class="row-meta">
                    <div class="row-stats">
                      <p class="stats-label">
                        {{
                          isFinished(anime)
                            ? "Ended"
                            : anime.end_date
                              ? "Ends"
                              : "Ends (est.)"
                        }}
                      </p>
                      <p
                        class="stats-date stats-date--now"
                        :class="endClass(anime)"
                      >
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
                  </div>
                </div>
              </template>

              <!-- ── Up Next layout (slots 1+) ── -->
              <template v-else>
                <span class="row-number">{{ i + 1 }}</span>
                <img
                  v-if="anime.image"
                  :src="anime.image"
                  :alt="anime.title"
                  class="row-cover"
                />
                <div class="row-main">
                  <div class="row-info">
                    <h3 class="row-title">
                      {{ anime.title_english ?? anime.title }}
                    </h3>
                    <div v-if="anime.genres?.length" class="genre-tags">
                      <span
                        v-for="g in anime.genres"
                        :key="g"
                        class="genre-tag"
                        >{{ g }}</span
                      >
                    </div>
                  </div>
                  <div class="row-meta">
                    <div class="row-stats">
                      <p class="stats-label">
                        {{
                          isFinished(anime)
                            ? "Ended"
                            : anime.end_date
                              ? "Ends"
                              : "Ends (est.)"
                        }}
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
                  </div>
                </div>
              </template>

              <!-- ── Split action sliver ── -->
              <div class="row-split-actions">
                <button
                  class="row-action row-remove"
                  @click.stop="bingeStore.remove(anime.id)"
                  aria-label="Remove"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
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
                <button
                  class="row-action row-complete"
                  @click.stop="bingeStore.toggleComplete(anime.id)"
                  aria-label="Mark as completed"
                  title="Mark as completed"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
              </div>
            </div>
          </template>
        </TransitionGroup>
      </template>

      <!-- All-done state -->
      <div v-else class="all-done-state">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-10 h-10 mb-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          style="color: #22c55e; opacity: 0.6"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <p class="text-gray-400 font-medium">All caught up!</p>
        <p class="text-gray-600 text-sm mt-1">
          Everything on your list is marked as completed.
        </p>
      </div>

      <!-- ── Completed section ──────────────────────────────────────────── -->
      <template v-if="completedItems.length">
        <div class="completed-header">
          <p class="section-label">Completed</p>
          <span class="completed-count">{{ completedItems.length }}</span>
        </div>
        <div
          v-for="anime in completedItems"
          :key="anime.id"
          class="binge-row binge-row--completed"
          @click="
            plannerStore.selectedAnimeId =
              plannerStore.selectedAnimeId === anime.id ? null : anime.id
          "
        >
          <div class="completed-icon">
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
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <img
            v-if="anime.image"
            :src="anime.image"
            :alt="anime.title"
            class="row-cover"
          />
          <div class="row-main">
            <div class="row-info">
              <h3 class="row-title">
                {{ anime.title_english ?? anime.title }}
              </h3>
              <div v-if="anime.genres?.length" class="genre-tags">
                <span v-for="g in anime.genres" :key="g" class="genre-tag">{{
                  g
                }}</span>
              </div>
            </div>
            <div class="row-meta">
              <div class="row-stats">
                <p class="stats-label">
                  {{
                    isFinished(anime)
                      ? "Ended"
                      : anime.end_date
                        ? "Ends"
                        : "Ends (est.)"
                  }}
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
            </div>
          </div>
          <!-- ── Split action sliver ── -->
          <div class="row-split-actions">
            <button
              class="row-action row-remove"
              @click.stop="bingeStore.remove(anime.id)"
              aria-label="Remove"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
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
            <button
              class="row-action row-unmark"
              @click.stop="bingeStore.toggleComplete(anime.id)"
              aria-label="Mark as not completed"
              title="Move back to list"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-4.51" />
              </svg>
            </button>
          </div>
        </div>
      </template>
    </template>
  </div>

  <SavedListsModal v-if="savedListsOpen" @close="savedListsOpen = false" />
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted, nextTick } from "vue";
import { useBingeStore } from "@/stores/bingeStore";
import { usePlannerStore } from "@/stores/plannerStore";
import SavedListsModal from "@/components/SavedListsModal.vue";
import { useToastStore } from "@/stores/toastStore";
import { exportToPng, exportToPdf, copyToClipboard } from "@/composables/useExport";
import {
  toPlanned,
  formatDate,
  isFinished,
  type PlannedAnime,
} from "@/utils/anime";

const bingeStore = useBingeStore();
const plannerStore = usePlannerStore();

// ── Toolbar: export ───────────────────────────────────────────────────────────

const exportRef = ref<HTMLElement | null>(null);
const exportOpen = ref(false);
const exporting = ref(false);

function onExportDocClick(e: MouseEvent) {
  if (exportRef.value && !exportRef.value.contains(e.target as Node)) {
    exportOpen.value = false;
  }
}

watch(exportOpen, (open) => {
  if (open) document.addEventListener("click", onExportDocClick);
  else document.removeEventListener("click", onExportDocClick);
});

async function doExport(format: "png" | "pdf" | "clipboard") {
  exportOpen.value = false;
  exporting.value = true;
  try {
    if (format === "png") await exportToPng("binge-timeline");
    else if (format === "pdf") await exportToPdf("binge-timeline");
    else await copyToClipboard("binge-timeline");
  } finally {
    exporting.value = false;
  }
}

// ── Toolbar: sort ─────────────────────────────────────────────────────────────

const sortRef = ref<HTMLElement | null>(null);
const sortOpen = ref(false);

const sortLabel = computed(() => {
  switch (bingeStore.bingeSortBy) {
    case "score": return "Score";
    case "episodes": return "Episodes";
    case "custom": return "Custom Order";
    default: return "End Date";
  }
});

function onSortDocClick(e: MouseEvent) {
  if (sortRef.value && !sortRef.value.contains(e.target as Node)) {
    sortOpen.value = false;
  }
}

watch(sortOpen, (open) => {
  if (open) document.addEventListener("click", onSortDocClick);
  else document.removeEventListener("click", onSortDocClick);
});

function doSort(val: "endDate" | "score" | "episodes") {
  sortOpen.value = false;
  if (val === "endDate") bingeStore.sortByEndDate();
  else if (val === "score") bingeStore.sortByScore();
  else if (val === "episodes") bingeStore.sortByEpisodes();
}

// ── Toolbar: share ────────────────────────────────────────────────────────────

const toastStore = useToastStore();
const copied = ref(false);

async function copyShareLink() {
  const ids = bingeStore.list.map((a) => a.id).join(",");
  const url = `${window.location.origin}/share?ids=${ids}`;
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = url;
    ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
  copied.value = true;
  toastStore.show("Link copied to clipboard", { duration: 2500 });
  setTimeout(() => { copied.value = false; }, 2000);
}

// ── Toolbar: clear all ────────────────────────────────────────────────────────

const clearConfirm = ref(false);
const savedListsOpen = ref(false);
let clearConfirmTimer: ReturnType<typeof setTimeout> | null = null;

function handleClearAll() {
  if (clearConfirm.value) {
    bingeStore.clearAll();
    clearConfirm.value = false;
    if (clearConfirmTimer) clearTimeout(clearConfirmTimer);
  } else {
    clearConfirm.value = true;
    if (clearConfirmTimer) clearTimeout(clearConfirmTimer);
    clearConfirmTimer = setTimeout(() => { clearConfirm.value = false; }, 3000);
  }
}

const activeItems = computed<PlannedAnime[]>(() =>
  bingeStore.list.filter((a) => !bingeStore.isCompleted(a.id)).map(toPlanned),
);
const completedItems = computed<PlannedAnime[]>(() =>
  bingeStore.list.filter((a) => bingeStore.isCompleted(a.id)).map(toPlanned),
);

// ── Drag state ────────────────────────────────────────────────────────────────

const draggingIndex = ref<number | null>(null); // activeItems index of dragged item
const dropIndex = ref<number | null>(null); // activeItems index of current drop target

// ID of the item being dragged (for CSS class)
const draggingId = computed(() =>
  draggingIndex.value !== null
    ? (activeItems.value[draggingIndex.value]?.id ?? null)
    : null,
);

// Live-preview order: move dragged item to drop target position
const previewItems = computed<PlannedAnime[]>(() => {
  const from = draggingIndex.value;
  const to = dropIndex.value;
  if (from === null || to === null || from === to) return activeItems.value;
  const items = [...activeItems.value];
  const [moved] = items.splice(from, 1);
  if (!moved) return activeItems.value;
  items.splice(to, 0, moved);
  return items;
});

// Map activeItems index → binge store list index
function activeListIndex(activeIdx: number): number {
  const id = activeItems.value[activeIdx]?.id;
  return bingeStore.list.findIndex((a) => a.id === id);
}

function commitDrop() {
  if (
    draggingIndex.value !== null &&
    dropIndex.value !== null &&
    draggingIndex.value !== dropIndex.value
  ) {
    bingeStore.move(
      activeListIndex(draggingIndex.value),
      activeListIndex(dropIndex.value),
    );
  }
  draggingIndex.value = null;
  dropIndex.value = null;
}

// ── Desktop drag-and-drop ─────────────────────────────────────────────────────

function onDragStart(e: DragEvent, visualIdx: number) {
  draggingIndex.value = visualIdx;
  swapUnlockedAt = 0;
  if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
}

function onDragOver(visualIdx: number) {
  if (draggingIndex.value === null) return;
  if (Date.now() < swapUnlockedAt) return;
  if (visualIdx === dropIndex.value) return;
  const scrollY = window.scrollY;
  dropIndex.value = visualIdx;
  swapUnlockedAt = Date.now() + SWAP_ANIMATION_MS;
  nextTick(() => {
    window.scrollTo(0, scrollY);
  });
}

function onDrop(visualIdx: number) {
  if (draggingIndex.value !== null) dropIndex.value = visualIdx;
  commitDrop();
}

function onDragEnd() {
  // Fires if dropped outside a valid target
  draggingIndex.value = null;
  dropIndex.value = null;
}

// ── Touch drag-and-drop ───────────────────────────────────────────────────────

// Timestamp after which the next swap is allowed. Prevents the FLIP animation's
// mid-flight transform from causing the detector to immediately un-swap.
let swapUnlockedAt = 0;
const SWAP_ANIMATION_MS = 110; // must match .binge-list-move transition duration

function onHandleTouchStart(_e: TouchEvent, visualIdx: number) {
  draggingIndex.value = visualIdx;
  swapUnlockedAt = 0;
  document.addEventListener("touchmove", onTouchMove, { passive: false });
  document.addEventListener("touchend", onTouchEnd, { passive: true });
  document.addEventListener("touchcancel", onTouchEnd, { passive: true });
}

function onTouchMove(e: TouchEvent) {
  e.preventDefault();
  const touch = e.touches[0];
  if (!touch || draggingIndex.value === null) return;

  // While an animation is in progress, the FLIP transform makes rows appear at
  // their old positions. Skip swap detection until the animation has settled.
  if (Date.now() < swapUnlockedAt) return;

  const rows = Array.from(
    document.querySelectorAll<HTMLElement>("#binge-timeline [data-row-index]"),
  );
  let closestVisualIdx = -1;
  let closestDist = Infinity;
  for (const row of rows) {
    const rect = row.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const dist = Math.abs(touch.clientY - midY);
    const vi = parseInt(row.dataset.rowIndex!, 10);
    if (!isNaN(vi) && dist < closestDist) {
      closestDist = dist;
      closestVisualIdx = vi;
    }
  }

  if (closestVisualIdx !== -1 && closestVisualIdx !== dropIndex.value) {
    const scrollY = window.scrollY;
    dropIndex.value = closestVisualIdx;
    swapUnlockedAt = Date.now() + SWAP_ANIMATION_MS;
    nextTick(() => {
      window.scrollTo(0, scrollY);
    });
  }
}

function onTouchEnd() {
  document.removeEventListener("touchmove", onTouchMove);
  document.removeEventListener("touchend", onTouchEnd);
  document.removeEventListener("touchcancel", onTouchEnd);
  commitDrop();
}

onUnmounted(() => {
  document.removeEventListener("touchmove", onTouchMove);
  document.removeEventListener("touchend", onTouchEnd);
  document.removeEventListener("touchcancel", onTouchEnd);
  document.removeEventListener("click", onExportDocClick);
  document.removeEventListener("click", onSortDocClick);
  if (clearConfirmTimer) clearTimeout(clearConfirmTimer);
});

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

function rowStyle(anime: PlannedAnime, previewIdx: number) {
  // During drag, glow follows the dragged item's current visual position.
  // Outside drag, use normal mouse hover.
  const isDragging = draggingIndex.value !== null;
  const h = isDragging
    ? previewIdx === (dropIndex.value ?? draggingIndex.value)
    : hoveredIndex.value === previewIdx;
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
  };
}
</script>

<style scoped>
/* ── Binge toolbar ── */
.binge-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.btool-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid var(--border-input);
  background-color: var(--bg-card);
  color: #9ca3af;
  cursor: pointer;
  white-space: nowrap;
  transition:
    border-color 0.15s,
    color 0.15s,
    background-color 0.15s;
}
.btool-btn:hover:not(:disabled) {
  border-color: #9ca3af;
  color: #e5e7eb;
}
.btool-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btool-btn--copied {
  border-color: #22c55e;
  color: #22c55e;
}
.btool-btn--copied:hover {
  border-color: #22c55e;
  color: #22c55e;
}
.btool-btn--danger:hover:not(:disabled) {
  border-color: #ef4444;
  color: #ef4444;
}
.btool-btn--confirming {
  border-color: #ef4444 !important;
  color: #ef4444 !important;
}

.btool-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
.btool-chevron {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

.btool-sort-wrap {
  position: relative;
}

.btool-dropdown-option--active {
  color: var(--accent);
}
.btool-dropdown-option--active:hover {
  color: var(--accent);
}
.btool-dropdown-option--custom {
  cursor: default;
  opacity: 0.7;
}

.btool-export-wrap {
  position: relative;
}
.btool-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  background-color: var(--bg-header);
  border: 1px solid var(--border-input);
  border-radius: 8px;
  padding: 4px;
  min-width: 160px;
  z-index: 100;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}
.btool-dropdown-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  font-size: 13px;
  font-weight: 500;
  color: #d1d5db;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  transition:
    background-color 0.1s,
    color 0.1s;
}
.btool-dropdown-option:hover {
  background-color: var(--bg-card);
  color: white;
}


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
.empty-saved-btn {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid var(--border-input);
  background: none;
  color: #6b7280;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.empty-saved-btn:hover {
  border-color: #9ca3af;
  color: #e5e7eb;
}

.all-done-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0 32px;
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

.up-next-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
}
.up-next-header .section-label {
  margin-top: 0;
  margin-bottom: 0;
}
.up-next-count {
  font-size: 11px;
  font-weight: 700;
  color: #9ca3af;
  background: rgba(156, 163, 175, 0.12);
  border: 1px solid rgba(156, 163, 175, 0.25);
  border-radius: 10px;
  padding: 1px 7px;
  line-height: 1.6;
}

.completed-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 32px;
}
.completed-header .section-label {
  margin-bottom: 0;
}
.completed-count {
  font-size: 11px;
  font-weight: 700;
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.25);
  border-radius: 10px;
  padding: 1px 7px;
  line-height: 1.6;
}

/* ── Active items TransitionGroup (Binging Now + Up Next in one group) ── */
.binge-all-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* "Up Next" label rendered inside the TransitionGroup — sits above FLIP rows */
.section-label--inline {
  position: relative;
  z-index: 1;
}

/* ── Rows ── */
.binge-row {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 24px 20px 24px;
  padding-right: 108px; /* 24px gap + 84px sliver */
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid var(--border);
  background-color: var(--bg-card);
  cursor: grab;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    opacity 0.15s ease;
  min-height: 144px;
}
.binge-row:active {
  cursor: grabbing;
}

/* FLIP move — must appear after .binge-row so transition: transform takes precedence */
.binge-list-move {
  transition:
    transform 0.16s ease,
    border-color 0.2s ease,
    background-color 0.2s ease,
    opacity 0.15s ease;
}

.binge-row--now {
  min-height: 288px;
}

.binge-row--completed {
  cursor: default;
  opacity: 0.6;
  border-color: rgba(34, 197, 94, 0.15);
  background-color: rgba(34, 197, 94, 0.02);
}
.binge-row--completed:hover {
  opacity: 0.85;
  border-color: rgba(34, 197, 94, 0.3);
  background-color: rgba(34, 197, 94, 0.06);
  transition:
    opacity 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;
}

/* Item being dragged — fades to show it's "in flight" */
.row-dragging {
  opacity: 0.75;
  border-style: dashed;
}

/* ── Drag handle ── */
.drag-handle {
  color: #374151;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  transition: color 0.15s;
  touch-action: none;
}
.binge-row:hover .drag-handle {
  color: #6b7280;
}

/* ── Completed icon ── */
.completed-icon {
  color: #22c55e;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  opacity: 0.8;
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

/* ── row-main ── */
.row-main {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 20px;
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
  line-clamp: 2;
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

/* ── row-meta ── */
.row-meta {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ── Stats ── */
.row-stats {
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

/* ── Split action sliver ── */
.row-split-actions {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 84px;
  display: flex;
  flex-direction: column;
}
.row-action {
  flex: 1;
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.15s,
    color 0.15s;
}
.row-action svg {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
}
.row-remove {
  color: #374151;
}
.row-remove:hover {
  color: #ef4444;
  background-color: rgba(239, 68, 68, 0.08);
}
.row-complete {
  color: #374151;
}
.row-complete:hover {
  color: #22c55e;
  background-color: rgba(34, 197, 94, 0.08);
}
.row-unmark {
  color: #374151;
}
.row-unmark:hover {
  color: #22c55e;
  background-color: rgba(34, 197, 94, 0.08);
}

/* ── Mobile ── */
@media (max-width: 768px) {
  .btool-export-wrap {
    display: none;
  }

  .binge-row {
    padding: 12px 14px;
    gap: 10px;
    min-height: auto;
    align-items: flex-start;
    cursor: default;
  }
  .binge-row--now {
    min-height: auto;
  }

  .drag-handle {
    color: #4b5563;
    align-self: stretch;
    justify-content: center;
    cursor: grab;
  }
  .drag-handle svg {
    width: 20px;
    height: 20px;
  }
  .drag-handle:active {
    cursor: grabbing;
    color: #9ca3af;
  }

  .row-number {
    display: none;
  }

  .completed-icon {
    align-self: center;
  }
  .completed-icon svg {
    width: 18px;
    height: 18px;
  }

  .row-cover {
    width: 54px;
    border-radius: 6px;
  }
  .row-cover--now {
    width: 70px;
    border-radius: 8px;
  }

  .row-main {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }

  .genre-tags {
    display: none;
  }
  .row-subtitle {
    display: none;
  }

  .row-title {
    font-size: 14px;
  }
  .row-title--now {
    font-size: 15px;
  }

  .row-meta {
    justify-content: space-between;
    gap: 4px;
  }

  .row-stats {
    flex-direction: row;
    align-items: baseline;
    gap: 5px;
    text-align: left;
    padding-right: 0;
  }
  .stats-label {
    display: none;
  }
  .stats-date {
    font-size: 13px;
    font-weight: 700;
    line-height: 1;
  }
  .stats-date--now {
    font-size: 14px;
  }
  .stats-eps {
    font-size: 11px;
    margin-top: 0;
  }

  .row-split-actions {
    width: 50px;
  }
  .binge-row {
    padding-right: 50px; /* 14px gap + 50px sliver */
  }
  .row-action svg {
    width: 24px;
    height: 24px;
  }
}
</style>
