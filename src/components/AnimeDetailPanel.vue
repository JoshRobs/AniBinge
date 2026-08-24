<template>
  <div
    class="detail-panel"
    ref="panelEl"
    v-if="anime"
    :style="{
      width: panelWidth + 'px',
      height: panelHeight,
      transform: swipeDelta ? `translateY(${swipeDelta}px)` : undefined,
      transition: swipeTransition,
    }"
    @touchstart.passive="onTouchStart"
    @touchmove="onTouchMove"
    @touchend.passive="onTouchEnd"
  >
    <div class="drag-handle" />
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
        @click="imageViewerUrl = anime.image"
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
      <button
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === 'characters' }"
        @click="switchToCharacters"
      >
        Characters
      </button>
      <button
        v-if="trailerEmbedUrl"
        class="tab-btn"
        :class="{ 'tab-btn--active': activeTab === 'trailer' }"
        @click="activeTab = 'trailer'"
      >
        Trailer
      </button>
    </div>

    <!-- Info tab -->
    <template v-if="activeTab === 'info'">
      <div
        class="detail-stats"
        :style="{ border: `2px solid ${statusBorderColor}75` }"
      >
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
          <span class="stat-label">{{
            isStarted(anime) ? "Started" : "Starts"
          }}</span>
          <span class="stat-value">{{
            formatDate(new Date(anime.start_date))
          }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">{{
            isFinished(anime) ? "Ended" : "Ends"
          }}</span>
          <span class="stat-value">{{
            anime.end_date
              ? formatDate(anime.estimatedEnd)
              : `~ ${formatDate(anime.estimatedEnd)}`
          }}</span>
          <span v-if="!anime.end_date" class="stat-estimated">estimated</span>
        </div>
        <div v-if="details?.studios?.length" class="stat stat--wide">
          <span class="stat-label">Studio</span>
          <span class="stat-value">{{ details.studios.join(", ") }}</span>
        </div>
        <div v-if="details?.producers?.length" class="stat stat--wide">
          <span class="stat-label">Producers</span>
          <span class="stat-value stat-value--muted">{{
            details.producers.join(", ")
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
        <p
          v-if="anime.synopsis"
          ref="synopsisEl"
          class="detail-synopsis"
          :class="{ 'detail-synopsis--clamped': !synopsisExpanded }"
        >
          {{ anime.synopsis }}
        </p>
        <button
          v-if="anime.synopsis && synopsisIsClamped && !synopsisExpanded"
          class="review-expand-btn"
          @click="synopsisExpanded = true"
        >
          Read more
        </button>
        <p v-else-if="!anime.synopsis" class="detail-placeholder">
          No synopsis available
        </p>
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
              :src="
                LOGO_OVERRIDES[s.name] ??
                `https://www.google.com/s2/favicons?domain_url=${s.url}&sz=64`
              "
              :alt="s.name"
              class="streaming-logo"
              @error="onLogoError(s.name)"
            />
            <span v-else class="streaming-logo-fallback">{{
              s.name.slice(0, 2)
            }}</span>
          </a>
        </div>
        <p v-else class="detail-placeholder">No streaming links available</p>
      </div>
    </template>

    <!-- Characters tab -->
    <template v-else-if="activeTab === 'characters'">
      <div v-if="charactersLoading" class="reviews-loading">
        <div class="reviews-spinner" />
        <span>Loading characters…</span>
      </div>
      <div v-else-if="!characters.length" class="reviews-empty">
        No character data available.
      </div>
      <div v-else class="character-grid">
        <div
          v-for="char in characters"
          :key="char.id"
          class="character-card"
          @click="openCharacterModal(char)"
        >
          <img
            v-if="char.image"
            :src="char.image"
            :alt="char.name"
            class="char-img"
          />
          <div v-else class="char-img char-img--empty" />
          <div class="char-info">
            <p class="char-name">{{ char.name }}</p>
            <p class="char-role">{{ char.role }}</p>
            <p v-if="jaVA(char)" class="char-va">{{ jaVA(char)!.name }}</p>
          </div>
        </div>
      </div>
    </template>

    <!-- Trailer tab -->
    <template v-else-if="activeTab === 'trailer'">
      <div class="trailer-wrap">
        <iframe
          :src="trailerEmbedUrl!"
          class="trailer-iframe"
          frameborder="0"
          allow="
            accelerometer;
            autoplay;
            clipboard-write;
            encrypted-media;
            gyroscope;
            picture-in-picture;
          "
          allowfullscreen
        />
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

  <!-- Image viewer -->
  <Teleport to="body">
    <div
      v-if="imageViewerUrl"
      class="cover-modal-backdrop"
      @click="imageViewerUrl = null"
    >
      <img :src="imageViewerUrl" class="cover-modal-img" @click.stop />
    </div>
  </Teleport>

  <!-- Character modal -->
  <Teleport to="body">
    <div
      v-if="selectedCharacter"
      class="char-modal-backdrop"
      @click="closeCharacterModal"
    >
      <div class="char-modal" ref="charModalEl" @click.stop>
        <button
          class="char-modal-close"
          @click="closeCharacterModal"
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

        <div class="char-modal-body">
          <!-- Portrait -->
          <img
            :src="characterInfo?.largeImage ?? selectedCharacter.image"
            :alt="selectedCharacter.name"
            class="char-modal-portrait"
            @click="
              imageViewerUrl =
                characterInfo?.largeImage ?? selectedCharacter.image
            "
          />

          <!-- Info -->
          <div class="char-modal-content">
            <div class="char-modal-heading">
              <h2 class="char-modal-name">{{ selectedCharacter.name }}</h2>
              <p v-if="characterInfo?.nameKanji" class="char-modal-kanji">
                {{ characterInfo.nameKanji }}
              </p>
              <span class="char-modal-role">{{ selectedCharacter.role }}</span>
            </div>

            <div
              v-if="characterInfo?.nicknames?.length"
              class="char-modal-nicknames"
            >
              <span
                v-for="n in characterInfo.nicknames"
                :key="n"
                class="nickname-tag"
                >{{ n }}</span
              >
            </div>

            <!-- Voice actors -->
            <div
              v-if="selectedCharacter.voiceActors.length"
              class="char-modal-section char-modal-vas"
            >
              <h3 class="char-modal-section-title">Voice Actors</h3>
              <div class="va-grid">
                <div
                  v-for="va in selectedCharacter.voiceActors"
                  :key="va.id"
                  class="va-card"
                >
                  <img
                    v-if="va.image"
                    :src="va.image"
                    :alt="va.name"
                    class="va-img"
                  />
                  <div v-else class="va-img va-img--empty" />
                  <div class="va-info">
                    <p class="va-name">{{ va.name }}</p>
                    <p class="va-lang">{{ va.language }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- About -->
            <div v-if="characterInfoLoading" class="char-modal-loading">
              <div class="reviews-spinner" />
              Loading…
            </div>
            <div v-else-if="characterInfo?.about" class="char-modal-section">
              <h3 class="char-modal-section-title">About</h3>
              <p
                class="char-modal-about"
                :class="{ 'char-modal-about--clamped': !aboutExpanded }"
              >
                {{ stripBBCode(characterInfo.about) }}
              </p>
              <button
                v-if="!aboutExpanded"
                class="review-expand-btn"
                @click="aboutExpanded = true"
              >
                Read more
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from "vue";
import BilibiliTVLogo from "@/assets/BilibiliTV.png";

const LOGO_OVERRIDES: Record<string, string> = {
  "Bilibili TV": BilibiliTVLogo,
};
import { usePlannerStore } from "@/stores/plannerStore";
import { useBingeStore } from "@/stores/bingeStore";
import { useSearchStore } from "@/stores/searchStore";
import {
  fetchAnimeReviews,
  fetchAnimeDetails,
  fetchAnimeCharacters,
  fetchCharacterInfo,
} from "@/api/jikanApi";
import type {
  AnimeReview,
  AnimeDetails,
  Character,
  CharacterInfo,
} from "@/api/jikanApi";
import {
  toPlanned,
  formatDate,
  scoreColor,
  isStarted,
  isFinished,
} from "@/utils/anime";

const plannerStore = usePlannerStore();
const bingeStore = useBingeStore();
const searchStore = useSearchStore();

const anime = computed(() => {
  const id = plannerStore.selectedAnimeId;
  if (id === null) return null;
  const fromPlanned = plannerStore.plannedAnime.find((a) => a.id === id);
  if (fromPlanned) return fromPlanned;
  const fromBinge = bingeStore.list.find((a) => a.id === id);
  if (fromBinge) return toPlanned(fromBinge);
  const fromSearch = searchStore.results.find((a) => a.id === id);
  return fromSearch ? toPlanned(fromSearch) : null;
});

// ── Tabs ──────────────────────────────────────────────────────────────────────
const activeTab = ref<"info" | "reviews" | "characters" | "trailer">("info");

// ── Details (studios, producers, trailer) ─────────────────────────────────────
const details = ref<AnimeDetails | null>(null);
const detailsCache = new Map<number, AnimeDetails | null>();

async function loadDetails(id: number) {
  if (detailsCache.has(id)) {
    details.value = detailsCache.get(id) ?? null;
    return;
  }
  const result = await fetchAnimeDetails(id);
  detailsCache.set(id, result);
  if (anime.value?.id === id) details.value = result;
}

const trailerEmbedUrl = computed(() => {
  const yid = details.value?.trailer?.youtubeId;
  if (!yid) return null;
  return `https://www.youtube-nocookie.com/embed/${yid}?rel=0&modestbranding=1`;
});

// ── Reviews ───────────────────────────────────────────────────────────────────
const reviews = ref<AnimeReview[]>([]);
const reviewsLoading = ref(false);
const reviewsError = ref(false);
const reviewsFetchedFor = ref<number | null>(null);
const expandedReviews = ref(new Set<number>());
const expandedSpoilers = ref(new Set<number>());

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

// ── Characters ────────────────────────────────────────────────────────────────
const characters = ref<Character[]>([]);
const charactersLoading = ref(false);
const charactersCache = new Map<number, Character[]>();

async function switchToCharacters() {
  activeTab.value = "characters";
  const id = anime.value?.id;
  if (!id) return;
  if (charactersCache.has(id)) {
    characters.value = charactersCache.get(id)!;
    return;
  }
  charactersLoading.value = true;
  const result = await fetchAnimeCharacters(id);
  charactersCache.set(id, result);
  if (anime.value?.id === id) {
    characters.value = result;
    charactersLoading.value = false;
  }
}

// ── Character modal ───────────────────────────────────────────────────────────
const selectedCharacter = ref<Character | null>(null);
const characterInfo = ref<CharacterInfo | null>(null);
const characterInfoLoading = ref(false);
const characterInfoCache = new Map<number, CharacterInfo | null>();
const aboutExpanded = ref(false);

async function openCharacterModal(char: Character) {
  selectedCharacter.value = char;
  characterInfo.value = null;
  aboutExpanded.value = false;
  if (characterInfoCache.has(char.id)) {
    characterInfo.value = characterInfoCache.get(char.id) ?? null;
    return;
  }
  characterInfoLoading.value = true;
  const info = await fetchCharacterInfo(char.id);
  characterInfoCache.set(char.id, info);
  if (selectedCharacter.value?.id === char.id) {
    characterInfo.value = info;
    characterInfoLoading.value = false;
  }
}

function closeCharacterModal() {
  selectedCharacter.value = null;
  characterInfo.value = null;
}

function stripBBCode(text: string): string {
  return text
    .replace(/\[url=[^\]]*\](.*?)\[\/url\]/gi, "$1")
    .replace(/\[\/?(b|i|u|h[1-6])\]/gi, "")
    .trim();
}

// ── Status color (mirrors AnimeCard glow) ────────────────────────────────────
const statusBorderColor = computed(() => {
  if (!anime.value) return "#6b7280";
  const now = Date.now();
  const start = anime.value.start_date
    ? new Date(anime.value.start_date).getTime()
    : Infinity;
  if (start > now) return "#6b7280";
  if (isFinished(anime.value)) return "#22c55e";
  return "#f59e0b";
});

// ── Shared UI state ───────────────────────────────────────────────────────────
const synopsisExpanded = ref(false);
const synopsisIsClamped = ref(false);
const synopsisEl = ref<HTMLElement | null>(null);
const failedLogos = ref<string[]>([]);
const imageViewerUrl = ref<string | null>(null);

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

// ── Reset when anime changes ──────────────────────────────────────────────────
watch(
  () => anime.value?.id,
  async (id) => {
    activeTab.value = "info";
    reviews.value = [];
    reviewsFetchedFor.value = null;
    expandedReviews.value = new Set();
    expandedSpoilers.value = new Set();
    synopsisExpanded.value = false;
    synopsisIsClamped.value = false;
    failedLogos.value = [];
    imageViewerUrl.value = null;
    details.value = null;
    characters.value = [];
    charactersLoading.value = false;
    selectedCharacter.value = null;
    characterInfo.value = null;

    await nextTick();
    if (synopsisEl.value) {
      synopsisIsClamped.value =
        synopsisEl.value.scrollHeight > synopsisEl.value.clientHeight;
    }
    if (id) loadDetails(id);
  },
  { immediate: true },
);

function reviewScoreClass(score: number) {
  if (score >= 7) return "review-score--high";
  if (score <= 3) return "review-score--low";
  return "review-score--mid";
}

function jaVA(char: Character) {
  return char.voiceActors.find((v) => v.language === "Japanese");
}

// ── Panel height (clips to viewport when header is visible) ───────────────────
const panelEl = ref<HTMLElement | null>(null);
const panelHeight = ref('100vh');

function updatePanelHeight() {
  if (!panelEl.value || window.innerWidth <= 768) return;
  const top = panelEl.value.getBoundingClientRect().top;
  panelHeight.value = top > 0 ? `calc(100vh - ${top}px)` : '100vh';
}

onMounted(() => {
  updatePanelHeight();
  window.addEventListener('scroll', updatePanelHeight, { passive: true });
});

// ── Swipe to dismiss (mobile) ─────────────────────────────────────────────────
const charModalEl = ref<HTMLElement | null>(null);

// Prevent wheel + touch scroll everywhere except inside the char modal when it
// actually has overflow to scroll. { passive: false } is required for preventDefault().
function preventScroll(e: Event) {
  if (
    selectedCharacter.value &&
    charModalEl.value?.contains(e.target as Node)
  ) {
    const hasOverflow =
      charModalEl.value.scrollHeight > charModalEl.value.clientHeight;
    if (hasOverflow) return;
  }
  e.preventDefault();
}

watch([selectedCharacter, imageViewerUrl], ([char, viewer]) => {
  const open = !!(char || viewer);
  if (panelEl.value) panelEl.value.style.overflowY = open ? "hidden" : "";
  if (open) {
    document.addEventListener("wheel", preventScroll, { passive: false });
    document.addEventListener("touchmove", preventScroll, { passive: false });
  } else {
    document.removeEventListener("wheel", preventScroll);
    document.removeEventListener("touchmove", preventScroll);
  }
});
const swipeDelta = ref(0);
const swipeTransition = ref<string | undefined>(undefined);
let swipeActive = false;
let swipeStartY = 0;

function onTouchStart(e: TouchEvent) {
  if (selectedCharacter.value) return;
  if ((panelEl.value?.scrollTop ?? 0) > 0) return;
  if (!e.touches[0]) return;
  swipeStartY = e.touches[0].clientY;
  swipeActive = false;
}

function onTouchMove(e: TouchEvent) {
  if (selectedCharacter.value) return;
  if ((panelEl.value?.scrollTop ?? 0) > 0) return; // panel is scrolling its own content
  if (!e.touches[0]) return;

  const dy = e.touches[0].clientY - swipeStartY;

  if (dy < 0) {
    // Finger moving up = user wants to scroll content down.
    // Only block propagation if the panel has nothing to scroll.
    const hasOverflow =
      (panelEl.value?.scrollHeight ?? 0) > (panelEl.value?.clientHeight ?? 0);
    if (!hasOverflow) e.preventDefault();
    return;
  }

  // Finger moving down = swipe-to-dismiss direction. Take over and block page scroll.
  e.preventDefault();
  swipeActive = true;
  swipeDelta.value = dy;
}

function onTouchEnd() {
  if (!swipeActive) return;
  swipeActive = false;
  if (swipeDelta.value > 120) {
    swipeTransition.value = "transform 0.25s ease";
    swipeDelta.value = window.innerHeight * 1.1;
    setTimeout(() => {
      plannerStore.selectedAnimeId = null;
    }, 260);
  } else {
    swipeDelta.value = 0;
    swipeTransition.value = undefined;
  }
}

// ── Panel resize ──────────────────────────────────────────────────────────────
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

function onKeyDown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    if (selectedCharacter.value) closeCharacterModal();
    else imageViewerUrl.value = null;
  }
}

window.addEventListener("keydown", onKeyDown);
onUnmounted(() => {
  stopResize();
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("scroll", updatePanelHeight);
  document.removeEventListener("touchmove", preventScroll);
});
</script>

<style scoped>
.detail-panel {
  position: sticky;
  top: 0;
  flex-shrink: 0;
  height: 100vh;
  overflow-y: auto;
  overscroll-behavior: contain;
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
  cursor: zoom-in;
  transition: opacity 0.15s;
}
.detail-cover:hover {
  opacity: 0.85;
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
  transition:
    background-color 0.4s ease,
    border-color 0.4s ease;
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
.stat-estimated {
  font-size: 10px;
  font-weight: 600;
  color: #4b5563;
  text-transform: uppercase;
  letter-spacing: 0.06em;
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
  font-size: 15px;
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
  font-size: 15px;
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
.cover-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
  backdrop-filter: blur(4px);
  touch-action: none;
}
.cover-modal-img {
  max-height: 90vh;
  max-width: 90vw;
  border-radius: 12px;
  object-fit: contain;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
  cursor: default;
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

/* ── Stats extras ── */
.stat--wide {
  grid-column: 1 / -1;
}
.stat-value--muted {
  font-size: 13px;
  font-weight: 500;
  color: #9ca3af;
}

/* ── Character cards (in list) ── */
.character-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.character-card {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  background-color: var(--bg-card);
  border: 1px solid var(--border-input);
  border-radius: 8px;
  padding: 10px;
  min-width: 0;
  cursor: pointer;
  transition:
    background-color 0.15s,
    border-color 0.15s;
}
.character-card:hover {
  border-color: var(--accent);
  background-color: color-mix(in srgb, var(--accent) 6%, var(--bg-card));
}
.char-img {
  width: 44px;
  aspect-ratio: 2/3;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}
.char-img--empty {
  background-color: var(--bg-deep);
}
.char-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.char-name {
  font-size: 12px;
  font-weight: 600;
  color: #e5e7eb;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.char-role {
  font-size: 10px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.char-va {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Trailer ── */
.trailer-wrap {
  width: 100%;
}
.trailer-iframe {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 8px;
  border: none;
  background: #000;
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
  font-size: 14px;
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

/* ── Character modal ── */
.char-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  touch-action: none;
}
.char-modal {
  position: relative;
  background-color: var(--bg-header);
  border: 1px solid var(--border);
  border-radius: 16px;
  max-width: 680px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  overscroll-behavior: contain;
  touch-action: pan-y;
  scrollbar-width: none;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
}
.char-modal::-webkit-scrollbar {
  display: none;
}

.char-modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
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
  z-index: 1;
}
.char-modal-close:hover {
  color: white;
  border-color: var(--accent);
}

.char-modal-body {
  display: flex;
  gap: 24px;
  padding: 28px;
}
.char-modal-portrait {
  width: 140px;
  flex-shrink: 0;
  aspect-ratio: 2/3;
  object-fit: cover;
  border-radius: 10px;
  align-self: flex-start;
  cursor: zoom-in;
  transition: opacity 0.15s;
}
.char-modal-portrait:hover {
  opacity: 0.85;
}
.char-modal-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.char-modal-heading {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 36px;
}
.char-modal-name {
  font-size: 22px;
  font-weight: 700;
  color: #f3f4f6;
  line-height: 1.2;
  word-break: break-word;
  overflow-wrap: break-word;
}
.char-modal-kanji {
  font-size: 14px;
  color: #9ca3af;
}
.char-modal-role {
  display: inline-block;
  margin-top: 4px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
  border-radius: 4px;
  padding: 2px 8px;
}

.char-modal-nicknames {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.nickname-tag {
  font-size: 12px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 999px;
  background-color: var(--bg-card);
  border: 1px solid var(--border-input);
  color: #9ca3af;
}

.char-modal-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.char-modal-section-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
}

.va-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.va-card {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--bg-card);
  border: 1px solid var(--border-input);
  border-radius: 8px;
  padding: 8px 12px 8px 8px;
}
.va-img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.va-img--empty {
  background-color: var(--bg-deep);
}
.va-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.va-name {
  font-size: 13px;
  font-weight: 600;
  color: #e5e7eb;
  white-space: nowrap;
}
.va-lang {
  font-size: 11px;
  color: #6b7280;
}

.char-modal-about {
  font-size: 13px;
  color: #9ca3af;
  line-height: 1.65;
  white-space: pre-wrap;
  word-break: break-word;
}
.char-modal-about--clamped {
  display: -webkit-box;
  -webkit-line-clamp: 6;
  line-clamp: 6;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.char-modal-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #6b7280;
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

/* ── Drag handle (mobile only) ── */
.drag-handle {
  display: none;
  width: 36px;
  height: 4px;
  background: var(--border-input);
  border-radius: 2px;
  margin: 0 auto;
  flex-shrink: 0;
}

/* ── Mobile bottom sheet ── */
@media (max-width: 768px) {
  .drag-handle {
    display: block;
  }

  .detail-panel {
    position: fixed !important;
    top: auto !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    height: 85vh !important;
    border-left: none !important;
    border-top: 1px solid var(--border) !important;
    border-radius: 20px 20px 0 0 !important;
    z-index: 100;
    padding-top: 12px !important;
  }

  .resize-handle {
    display: none;
  }

  /* ── Character modal on mobile ── */
  .char-modal-backdrop {
    padding: 12px;
    align-items: flex-end;
  }

  .char-modal {
    max-width: 100%;
    border-radius: 20px 20px 0 0;
    max-height: 92vh;
  }

  .char-modal-body {
    flex-direction: column;
    padding: 20px;
    gap: 16px;
  }

  .char-modal-portrait {
    width: 110px;
    align-self: center;
  }

  /* Push voice actors to bottom of the content column */
  .char-modal-vas {
    order: 10;
  }
}
</style>
