<template>
  <div class="detail-panel" v-if="anime" :style="{ width: panelWidth + 'px' }">
    <div class="resize-handle" @mousedown="startResize" />

    <button
      class="close-btn"
      @click="plannerStore.selectedAnimeId = null"
      aria-label="Close"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-5 h-5"
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

    <div class="detail-header">
      <img
        v-if="anime.image"
        :src="anime.image"
        :alt="anime.title"
        class="detail-cover"
      />
      <div class="detail-titles">
        <h2 class="detail-title">{{ anime.title_english ?? anime.title }}</h2>
        <p
          v-if="anime.title_english && anime.title_english !== anime.title"
          class="detail-subtitle"
        >
          {{ anime.title }}
        </p>
      </div>
    </div>

    <!-- Tab bar -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === 'info' }"
        @click="activeTab = 'info'"
      >
        Info
      </button>
      <button
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === 'reviews' }"
        @click="switchToReviews"
      >
        Reviews
        <span v-if="reviews.length" class="tab-count">{{
          reviews.length
        }}</span>
      </button>
    </div>

    <!-- Info tab -->
    <template v-if="activeTab === 'info'">
      <div class="detail-stats">
        <div class="stat">
          <span class="stat-label">Score</span>
          <span class="stat-value" :class="scoreColor(anime.score)">{{
            anime.score ? `★ ${anime.score.toFixed(1)}` : "N/A"
          }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Episodes</span>
          <span class="stat-value">{{
            anime.episodesKnown ? anime.episodes : "Unknown"
          }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Starts</span>
          <span class="stat-value">{{
            formatDate(new Date(anime.start_date))
          }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Ends</span>
          <span class="stat-value">{{
            anime.endDateKnown ? formatDate(anime.estimatedEnd) : "Unknown"
          }}</span>
        </div>
      </div>

      <div v-if="anime.genres?.length" class="genre-pills">
        <span v-for="genre in anime.genres" :key="genre" class="genre-pill">{{
          genre
        }}</span>
      </div>

      <button
        class="binge-toggle-btn"
        :class="
          bingeStore.has(anime.id)
            ? 'binge-toggle-btn--added'
            : 'binge-toggle-btn--idle'
        "
        @click="bingeStore.toggle(anime)"
      >
        <svg
          v-if="bingeStore.has(anime.id)"
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
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
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        {{
          bingeStore.has(anime.id)
            ? "Remove from Binge List"
            : "Add to Binge List"
        }}
      </button>

      <div class="detail-section">
        <h3 class="detail-section-title">Synopsis</h3>
        <p v-if="anime.synopsis" ref="synopsisEl" class="detail-synopsis" :class="{ 'detail-synopsis--clamped': !synopsisExpanded }">
          {{ anime.synopsis }}
        </p>
        <button v-if="anime.synopsis && synopsisIsClamped && !synopsisExpanded" class="review-expand-btn" @click="synopsisExpanded = true">Read more</button>
        <p v-else-if="!anime.synopsis" class="detail-placeholder">No synopsis available</p>
      </div>

      <div class="detail-section">
        <h3 class="detail-section-title">Where to Watch</h3>
        <div v-if="uniqueStreaming.length" class="streaming-list">
          <a
            v-for="s in uniqueStreaming"
            :key="s.url"
            :href="s.url"
            target="_blank"
            rel="noopener noreferrer"
            class="streaming-link"
            :data-label="s.name"
          >
            <img
              v-if="!failedLogos.includes(s.name)"
              :src="LOGO_OVERRIDES[s.name] ?? `https://www.google.com/s2/favicons?domain_url=${s.url}&sz=64`"
              :alt="s.name"
              class="streaming-logo"
              @error="onLogoError(s.name)"
            />
            <span v-else class="streaming-logo-fallback">{{ s.name.slice(0, 2) }}</span>
          </a>
        </div>
        <p v-else class="detail-placeholder">No streaming links available</p>
      </div>
    </template>

    <!-- Reviews tab -->
    <template v-else>
      <div v-if="reviewsLoading" class="reviews-loading">
        <div class="reviews-spinner" />
        <span>Loading reviews…</span>
      </div>
      <div v-else-if="reviewsError" class="reviews-empty">
        Failed to load reviews.
      </div>
      <div v-else-if="!reviews.length" class="reviews-empty">
        No reviews yet on MyAnimeList.
      </div>
      <template v-else>
        <div class="reviews-summary">
          <div class="reviews-summary-bar">
            <div
              class="reviews-fill-pos"
              :style="{ width: positivePercent + '%' }"
            />
            <div
              class="reviews-fill-neg"
              :style="{ width: negativePercent + '%' }"
            />
          </div>
          <div class="reviews-summary-labels">
            <span class="reviews-label-pos">{{ positiveCount }} positive</span>
            <span class="reviews-label-neg">{{ negativeCount }} negative</span>
          </div>
        </div>

        <div class="review-list">
          <div v-for="r in reviews" :key="r.id" class="review-card">
            <div class="review-header">
              <div class="review-meta">
                <span class="review-username">{{ r.username }}</span>
                <span class="review-date">{{
                  formatDate(new Date(r.date))
                }}</span>
              </div>
              <div class="review-score" :class="reviewScoreClass(r.score)">
                {{ r.score }}<span class="review-score-denom">/10</span>
              </div>
            </div>
            <div
              v-if="r.isSpoiler && !expandedSpoilers.has(r.id)"
              class="review-spoiler-gate"
            >
              <span>⚠ Contains spoilers</span>
              <button
                class="review-spoiler-btn"
                @click="expandedSpoilers.add(r.id)"
              >
                Show anyway
              </button>
            </div>
            <template v-else>
              <p
                class="review-text"
                :class="{ 'review-text--clamped': !expandedReviews.has(r.id) }"
              >
                {{ r.review }}
              </p>
              <button
                v-if="!expandedReviews.has(r.id)"
                class="review-expand-btn"
                @click="expandedReviews.add(r.id)"
              >
                Read more
              </button>
            </template>
            <div class="review-footer">
              <span class="review-votes">{{ r.votes }} found helpful</span>
              <span v-if="r.isPreliminary" class="review-tag">Preliminary</span>
            </div>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onUnmounted } from "vue";
import BilibiliTVLogo from "@/assets/BilibiliTV.png";

const LOGO_OVERRIDES: Record<string, string> = {
  "Bilibili TV": BilibiliTVLogo,
};
import { usePlannerStore } from "@/stores/plannerStore";
import { useBingeStore } from "@/stores/bingeStore";
import { fetchAnimeReviews } from "@/api/jikanApi";
import type { Anime, AnimeReview } from "@/api/jikanApi";

const plannerStore = usePlannerStore();
const bingeStore = useBingeStore();

function toPlanned(a: Anime) {
  const episodesKnown = a.episodes > 0;
  const endDateKnown = !!a.end_date || episodesKnown;
  const estimatedEnd = a.end_date
    ? new Date(a.end_date)
    : new Date(
        new Date(a.start_date).getTime() +
          ((episodesKnown ? a.episodes : 12) - 1) * 7 * 86400000,
      );
  return { ...a, episodesKnown, endDateKnown, estimatedEnd };
}

const anime = computed(() => {
  const id = plannerStore.selectedAnimeId;
  if (id === null) return null;
  const fromPlanned = plannerStore.plannedAnime.find((a) => a.id === id);
  if (fromPlanned) return fromPlanned;
  const fromBinge = bingeStore.list.find((a) => a.id === id);
  return fromBinge ? toPlanned(fromBinge) : null;
});

// Tabs
const activeTab = ref<"info" | "reviews">("info");

// Reviews state
const reviews = ref<AnimeReview[]>([]);
const reviewsLoading = ref(false);
const reviewsError = ref(false);
const reviewsFetchedFor = ref<number | null>(null);
const expandedReviews = ref(new Set<number>());
const expandedSpoilers = ref(new Set<number>());
const synopsisExpanded = ref(false);
const synopsisIsClamped = ref(false);
const synopsisEl = ref<HTMLElement | null>(null);
const failedLogos = ref<string[]>([]);

const uniqueStreaming = computed(() => {
  const seen = new Set<string>();
  return (anime.value?.streaming ?? []).filter((s) => {
    if (seen.has(s.name)) return false;
    seen.add(s.name);
    return true;
  });
});

function onLogoError(name: string) {
  if (!LOGO_OVERRIDES[name]) failedLogos.value.push(name);
}

const positiveCount = computed(
  () => reviews.value.filter((r) => r.score >= 7).length,
);
const negativeCount = computed(
  () => reviews.value.filter((r) => r.score <= 3).length,
);
const positivePercent = computed(() =>
  reviews.value.length
    ? Math.round((positiveCount.value / reviews.value.length) * 100)
    : 0,
);
const negativePercent = computed(() =>
  reviews.value.length
    ? Math.round((negativeCount.value / reviews.value.length) * 100)
    : 0,
);

async function loadReviews(id: number) {
  if (reviewsFetchedFor.value === id) return;
  reviewsLoading.value = true;
  reviewsError.value = false;
  try {
    reviews.value = await fetchAnimeReviews(id);
    reviewsFetchedFor.value = id;
  } catch {
    reviewsError.value = true;
  } finally {
    reviewsLoading.value = false;
  }
}

function switchToReviews() {
  activeTab.value = "reviews";
  if (anime.value) loadReviews(anime.value.id);
}

// Reset when anime changes
watch(
  () => anime.value?.id,
  async () => {
    activeTab.value = "info";
    reviews.value = [];
    reviewsFetchedFor.value = null;
    expandedReviews.value = new Set();
    expandedSpoilers.value = new Set();
    synopsisExpanded.value = false;
    synopsisIsClamped.value = false;
    failedLogos.value = [];
    await nextTick();
    if (synopsisEl.value) {
      synopsisIsClamped.value = synopsisEl.value.scrollHeight > synopsisEl.value.clientHeight;
    }
  },
);

function reviewScoreClass(score: number) {
  if (score >= 7) return "review-score--high";
  if (score <= 3) return "review-score--low";
  return "review-score--mid";
}

// Panel resize
const panelWidth = ref(440);
let startX = 0;
let startWidth = 0;

function startResize(e: MouseEvent) {
  startX = e.clientX;
  startWidth = panelWidth.value;
  window.addEventListener("mousemove", onResize);
  window.addEventListener("mouseup", stopResize);
  e.preventDefault();
}

function onResize(e: MouseEvent) {
  const delta = startX - e.clientX;
  panelWidth.value = Math.min(720, Math.max(280, startWidth + delta));
}

function stopResize() {
  window.removeEventListener("mousemove", onResize);
  window.removeEventListener("mouseup", stopResize);
}

onUnmounted(stopResize);

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
.detail-panel {
  position: sticky;
  top: 0;
  flex-shrink: 0;
  height: 100vh;
  overflow-y: auto;
  background-color: var(--bg-header);
  border-left: 1px solid var(--border);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition:
    background-color 0.4s ease,
    border-color 0.4s ease;
  scrollbar-width: none;
}
.detail-panel::-webkit-scrollbar {
  display: none;
}

.resize-handle {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  cursor: ew-resize;
  z-index: 10;
}
.resize-handle:hover,
.resize-handle:active {
  background-color: var(--accent);
  opacity: 0.5;
  transition: background-color 0.4s ease;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-input);
  color: #9ca3af;
  border-radius: 8px;
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    color 0.15s,
    border-color 0.15s;
}
.close-btn:hover {
  color: white;
  border-color: var(--accent);
}

.detail-header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding-right: 36px;
}
.detail-cover {
  width: 100px;
  flex-shrink: 0;
  border-radius: 8px;
  object-fit: cover;
  aspect-ratio: 3/4;
}
.detail-title {
  font-size: 18px;
  font-weight: 700;
  color: #f3f4f6;
  line-height: 1.3;
}
.detail-subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: #6b7280;
}

/* Tab bar */
.tab-bar {
  display: flex;
  border-bottom: 1px solid var(--border-input);
  gap: 0;
}
.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  cursor: pointer;
  transition:
    color 0.15s,
    border-color 0.15s;
}
.tab-btn:hover {
  color: #d1d5db;
}
.tab-btn--active {
  color: white;
  border-bottom-color: var(--accent);
}
.tab-count {
  font-size: 11px;
  font-weight: 700;
  background-color: var(--bg-card);
  color: #9ca3af;
  padding: 1px 6px;
  border-radius: 999px;
  border: 1px solid var(--border-input);
}

.detail-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  background-color: var(--bg-card);
  border-radius: 10px;
  padding: 16px;
  transition: background-color 0.4s ease;
}
.stat {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.stat-label {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}
.stat-value {
  font-size: 15px;
  font-weight: 700;
  color: #e5e7eb;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.detail-section-title {
  font-size: 13px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.detail-synopsis {
  font-size: 14px;
  color: #9ca3af;
  line-height: 1.65;
}
.detail-synopsis--clamped {
  display: -webkit-box;
  -webkit-line-clamp: 5;
  line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.detail-placeholder {
  font-size: 14px;
  color: #4b5563;
  font-style: italic;
}

.genre-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.genre-pill {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
  background-color: var(--bg-card);
  border: 1px solid var(--border-input);
  color: #9ca3af;
  letter-spacing: 0.03em;
}

.binge-toggle-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    opacity 0.2s ease;
}
.binge-toggle-btn--idle {
  background-color: var(--bg-card);
  border-color: var(--border-input);
  color: #e5e7eb;
}
.binge-toggle-btn--idle:hover {
  border-color: var(--accent);
  color: white;
}
.binge-toggle-btn--added {
  background-color: var(--accent);
  border-color: var(--accent);
  color: white;
}
.binge-toggle-btn--added:hover {
  opacity: 0.8;
}

.streaming-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.streaming-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background-color: var(--bg-card);
  border: 1px solid var(--border-input);
  border-radius: 10px;
  text-decoration: none;
  transition:
    border-color 0.15s,
    transform 0.15s;
}
.streaming-link:hover {
  border-color: var(--accent);
  transform: scale(1.1);
}
.streaming-logo {
  width: 26px;
  height: 26px;
  object-fit: contain;
  border-radius: 4px;
}
.streaming-logo-fallback {
  font-size: 11px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  line-height: 1;
}
.streaming-link::after {
  content: attr(data-label);
  position: absolute;
  bottom: calc(100% + 7px);
  left: 50%;
  transform: translateX(-50%);
  background: #111827;
  color: #f3f4f6;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 5px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s;
}
.streaming-link:hover::after {
  opacity: 1;
}

/* Reviews */
.reviews-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 0;
  color: #6b7280;
  font-size: 14px;
}
.reviews-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--accent);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.reviews-empty {
  padding: 48px 0;
  text-align: center;
  font-size: 14px;
  color: #4b5563;
  font-style: italic;
}

.reviews-summary {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.reviews-summary-bar {
  position: relative;
  height: 6px;
  border-radius: 999px;
  background-color: var(--bg-card);
  overflow: hidden;
}
.reviews-fill-pos,
.reviews-fill-neg {
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: 999px;
  transition: width 0.4s ease;
}
.reviews-fill-pos {
  left: 0;
  background-color: #4ade80;
}
.reviews-fill-neg {
  right: 0;
  background-color: #f87171;
}
.reviews-summary-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
}
.reviews-label-pos {
  color: #4ade80;
}
.reviews-label-neg {
  color: #f87171;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.review-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-input);
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition:
    background-color 0.4s ease,
    border-color 0.4s ease;
}
.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}
.review-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.review-username {
  font-size: 13px;
  font-weight: 700;
  color: #e5e7eb;
}
.review-date {
  font-size: 11px;
  color: #6b7280;
}
.review-score {
  font-size: 18px;
  font-weight: 800;
  flex-shrink: 0;
  line-height: 1;
}
.review-score-denom {
  font-size: 11px;
  font-weight: 600;
  opacity: 0.6;
}
.review-score--high {
  color: #4ade80;
}
.review-score--mid {
  color: #fcd34d;
}
.review-score--low {
  color: #f87171;
}

.review-spoiler-gate {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #fcd34d;
}
.review-spoiler-btn {
  font-size: 12px;
  color: #9ca3af;
  background: none;
  border: 1px solid var(--border-input);
  border-radius: 5px;
  padding: 2px 8px;
  cursor: pointer;
  transition:
    color 0.15s,
    border-color 0.15s;
}
.review-spoiler-btn:hover {
  color: white;
  border-color: var(--accent);
}

.review-text {
  font-size: 13px;
  color: #9ca3af;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}
.review-text--clamped {
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.review-expand-btn {
  align-self: flex-start;
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.15s;
}
.review-expand-btn:hover {
  opacity: 1;
}

.review-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}
.review-votes {
  font-size: 11px;
  color: #4b5563;
}
.review-tag {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: var(--bg-deep, #0d1015);
  color: #6b7280;
  border: 1px solid var(--border-input);
}
</style>
