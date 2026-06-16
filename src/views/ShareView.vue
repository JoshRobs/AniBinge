<template>
  <div class="page" style="background-color: var(--bg-deep)">
    <!-- Header -->
    <header
      class="page-header"
      style="background-color: var(--bg-header); border-color: var(--border)"
    >
      <div class="header-inner">
        <RouterLink to="/" class="logo">
          Ani<span style="color: var(--accent)">Binge</span>
        </RouterLink>
        <RouterLink to="/" class="open-app-btn">Open AniBinge</RouterLink>
      </div>
    </header>

    <main class="main-inner">
      <!-- Loading -->
      <template v-if="status === 'loading'">
        <div class="page-heading">
          <h1 class="page-title">Shared Binge List</h1>
          <p class="page-subtitle">
            <span class="spinner" />
            Loading {{ fetchedCount }} / {{ ids.length }}…
          </p>
        </div>
        <div class="skeleton-list">
          <div v-for="i in ids.length" :key="i" class="skeleton-row" />
        </div>
      </template>

      <!-- Error / invalid link -->
      <template v-else-if="status === 'error'">
        <div class="empty-state">
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
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p class="text-gray-400 font-medium">
            This share link is invalid or has expired.
          </p>
          <RouterLink to="/" class="open-app-btn mt-6"
            >Go to AniBinge</RouterLink
          >
        </div>
      </template>

      <!-- Ready -->
      <template v-else>
        <div class="page-heading">
          <h1 class="page-title">Shared Binge List</h1>
          <p class="page-subtitle">
            {{ anime.length }} anime · shared via AniBinge
          </p>
        </div>

        <div class="list">
          <div v-for="(a, i) in plannedAnime" :key="a.id" class="row">
            <span class="row-number">{{ i + 1 }}</span>
            <img
              v-if="a.image"
              :src="a.image"
              :alt="a.title"
              class="row-cover"
            />
            <div class="row-info">
              <h3 class="row-title">{{ a.title_english ?? a.title }}</h3>
              <p
                v-if="a.title_english && a.title_english !== a.title"
                class="row-subtitle"
              >
                {{ a.title }}
              </p>
              <div v-if="a.genres?.length" class="genre-tags">
                <span v-for="g in a.genres" :key="g" class="genre-tag">{{
                  g
                }}</span>
              </div>
            </div>
            <div class="row-stats">
              <p class="stats-label">
                {{
                  isFinished(a) ? "Ended" : a.end_date ? "Ends" : "Ends (est.)"
                }}
              </p>
              <p class="stats-date" :class="endClass(a)">
                {{
                  a.end_date
                    ? formatDate(a.estimatedEnd)
                    : `~ ${formatDate(a.estimatedEnd)}`
                }}
              </p>
              <p class="stats-eps">
                {{
                  a.episodesKnown
                    ? `${a.episodes} episodes`
                    : "Episodes unknown"
                }}
              </p>
            </div>
            <button
              class="row-add-btn"
              :class="{ 'row-add-btn--added': bingeStore.has(a.id) }"
              @click="bingeStore.toggle(anime[i])"
              @mouseenter="hoveredAddId = a.id"
              @mouseleave="hoveredAddId = null"
              :aria-label="bingeStore.has(a.id) ? 'Remove from my list' : 'Add to my list'"
            >
              <!-- Added + hovering: show X -->
              <svg v-if="bingeStore.has(a.id) && hoveredAddId === a.id" xmlns="http://www.w3.org/2000/svg" class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              <!-- Added: show checkmark -->
              <svg v-else-if="bingeStore.has(a.id)" xmlns="http://www.w3.org/2000/svg" class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <!-- Not added: show plus -->
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="cta-bar">
          <button class="cta-btn" @click="importList">
            <svg
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
              <polyline points="19 12 12 19 5 12" />
            </svg>
            Add all to my list
          </button>
          <RouterLink to="/" class="cta-link"
            >Browse AniBinge instead</RouterLink
          >
        </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { fetchAnimeById, type Anime } from "@/api/jikanApi";
import { useBingeStore } from "@/stores/bingeStore";
import {
  toPlanned,
  formatDate,
  isFinished,
  type PlannedAnime,
} from "@/utils/anime";
import { getCachedAnime, setCachedAnime } from "@/utils/animeCache";

const route = useRoute();
const router = useRouter();
const bingeStore = useBingeStore();

const ids = computed<number[]>(() => {
  const param = route.query.ids;
  if (!param || typeof param !== "string") return [];
  return param
    .split(",")
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0);
});

const status = ref<"loading" | "ready" | "error">("loading");
const anime = ref<Anime[]>([]);
const fetchedCount = ref(0);

const plannedAnime = computed<PlannedAnime[]>(() => anime.value.map(toPlanned));

const hoveredAddId = ref<number | null>(null);

let cancelled = false;
onUnmounted(() => {
  cancelled = true;
});

const BATCH_SIZE = 2;
const BATCH_DELAY_MS = 1100; // slightly over 1s to stay within Jikan's 3 req/sec

onMounted(async () => {
  if (ids.value.length === 0) {
    status.value = "error";
    return;
  }

  const byId = new Map<number, Anime>();
  const toFetch: number[] = [];

  // Resolve from binge store (already in memory) or localStorage cache
  for (const id of ids.value) {
    const fromStore = bingeStore.list.find((a) => a.id === id);
    if (fromStore) {
      byId.set(id, fromStore);
      continue;
    }
    const cached = getCachedAnime(id);
    if (cached) {
      byId.set(id, cached);
      continue;
    }
    toFetch.push(id);
  }
  fetchedCount.value = byId.size;

  // Batch-fetch remaining IDs 3 at a time
  for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
    if (cancelled) return;
    const batch = toFetch.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map((id) => fetchAnimeById(id)));
    if (cancelled) return;
    for (let j = 0; j < batch.length; j++) {
      const a = results[j];
      if (a) {
        byId.set(batch[j]!, a);
        setCachedAnime(a);
      }
      fetchedCount.value++;
    }
    if (i + BATCH_SIZE < toFetch.length) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  // Reconstruct in the original shared order
  anime.value = ids.value.map((id) => byId.get(id)).filter(Boolean) as Anime[];
  status.value = anime.value.length > 0 ? "ready" : "error";
});

function endClass(a: PlannedAnime): string {
  const now = Date.now();
  const start = a.start_date ? new Date(a.start_date).getTime() : Infinity;
  if (a.endDateKnown && start <= now && a.estimatedEnd.getTime() < now)
    return "stats-date--finished";
  return "stats-date--airing";
}

function importList() {
  for (const a of anime.value) {
    bingeStore.add(a);
  }
  router.push({ path: "/", query: { mode: "binge" } });
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: white;
}

/* ── Header ── */
.page-header {
  border-bottom: 1px solid;
  padding: 16px 24px;
}
.header-inner {
  max-width: 70vw;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  text-decoration: none;
  color: inherit;
}
.open-app-btn {
  font-size: 15px;
  font-weight: 600;
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid var(--accent);
  color: var(--accent);
  text-decoration: none;
  cursor: pointer;
  background: none;
  transition:
    background-color 0.15s,
    color 0.15s;
}
.open-app-btn:hover {
  background-color: var(--accent);
  color: #0d1015;
}

/* ── Main ── */
.main-inner {
  max-width: 70vw;
  margin: 0 auto;
  width: 100%;
  padding: 48px 24px 80px;
}

/* ── Heading ── */
.page-heading {
  margin-bottom: 32px;
}
.page-title {
  font-size: 36px;
  font-weight: 700;
  color: #f3f4f6;
  margin-bottom: 6px;
}
.page-subtitle {
  font-size: 17px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ── Spinner ── */
.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid var(--accent);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  flex-shrink: 0;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Skeletons ── */
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.skeleton-row {
  height: 112px;
  border-radius: 10px;
  background: linear-gradient(
    90deg,
    var(--bg-card) 25%,
    color-mix(in srgb, var(--bg-card) 60%, #fff 3%) 50%,
    var(--bg-card) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}

/* ── List rows ── */
.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 40px;
}
.row {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px 32px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background-color: var(--bg-card);
  min-height: 160px;
}
.row-number {
  font-size: 16px;
  font-weight: 700;
  color: #4b5563;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}
.row-cover {
  width: 96px;
  aspect-ratio: 3/4;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}
.row-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.row-title {
  font-size: 22px;
  font-weight: 600;
  color: #f3f4f6;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.row-subtitle {
  font-size: 15px;
  color: #6b7280;
}
.genre-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.genre-tag {
  font-size: 13px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: var(--bg-deep);
  border: 1px solid var(--border-input);
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.row-stats {
  flex-shrink: 0;
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.stats-label {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
}
.stats-date {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.1;
}
.stats-date--finished {
  color: #22c55e;
}
.stats-date--airing {
  color: #f59e0b;
}
.stats-eps {
  font-size: 15px;
  color: #6b7280;
  margin-top: 2px;
}

/* ── Per-row add button ── */
.row-add-btn {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--border-input);
  background: none;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}
.row-add-btn:hover {
  border-color: var(--accent);
  background-color: color-mix(in srgb, var(--accent) 12%, transparent);
  color: var(--accent);
}
.row-add-btn--added {
  border-color: var(--accent);
  background-color: var(--accent);
  color: #0d1015;
}
.row-add-btn--added:hover {
  border-color: #f97316;
  background-color: transparent;
  color: #f97316;
}
.btn-icon {
  width: 20px;
  height: 20px;
}

/* ── CTA ── */
.cta-bar {
  display: flex;
  align-items: center;
  gap: 24px;
}
.cta-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: 8px;
  border: none;
  background-color: var(--accent);
  color: #0d1015;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
}
.cta-btn:hover {
  opacity: 0.85;
}
.cta-link {
  font-size: 15px;
  color: #6b7280;
  text-decoration: none;
  transition: color 0.15s;
}
.cta-link:hover {
  color: #e5e7eb;
}

/* ── Empty / error ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  text-align: center;
}
</style>
