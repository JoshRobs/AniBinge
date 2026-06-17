<template>
  <div
    class="border-b transition-[background-color,border-color] duration-400"
    style="background-color: var(--bg-header); border-color: var(--border)"
  >
    <div class="filter-inner max-w-350 mx-auto">
      <div class="flex flex-col gap-1.5">
        <label class="filter-label">Season</label>
        <select v-model="seasonStore.season" @change="onSeasonChange" class="filter-select">
          <option v-for="s in seasons" :key="s" :value="s">{{ capitalize(s) }}</option>
        </select>
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="filter-label">Year</label>
        <select v-model.number="seasonStore.year" @change="onSeasonChange" class="filter-select">
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="filter-label">Sort By</label>
        <select v-model="plannerStore.sortBy" class="filter-select">
          <option value="endDate">End Date</option>
          <option value="score">Score</option>
          <option value="episodes">Episodes</option>
        </select>
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="filter-label">Min Score</label>
        <select v-model.number="plannerStore.minScore" class="filter-select">
          <option :value="0">Any</option>
          <option v-for="n in [5, 6, 7, 8, 9]" :key="n" :value="n">{{ n }}+</option>
        </select>
      </div>
      <div class="flex flex-col gap-1.5 filter-exclude">
        <label class="filter-label">Exclude</label>
        <div class="flex gap-2">
          <button
            @click="plannerStore.hideUnscored = !plannerStore.hideUnscored"
            :class="plannerStore.hideUnscored ? 'pill-active' : 'pill-inactive'"
            class="pill"
          >No Score</button>
          <button
            @click="plannerStore.hideSingleEpisode = !plannerStore.hideSingleEpisode"
            :class="plannerStore.hideSingleEpisode ? 'pill-active' : 'pill-inactive'"
            class="pill"
          >OVA/Movie</button>
          <button
            @click="plannerStore.hideAiring = !plannerStore.hideAiring"
            :class="plannerStore.hideAiring ? 'pill-active' : 'pill-inactive'"
            class="pill"
          >Still Airing</button>
        </div>
      </div>
      <div class="filter-actions">
        <div class="flex flex-col gap-1.5">
          <label class="filter-label">View</label>
          <div class="mode-toggle">
          <button
            @click="plannerStore.mode = 'explore'"
            :class="plannerStore.mode === 'explore' ? 'mode-btn-active' : 'mode-btn-inactive'"
            class="mode-btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
            Explore
          </button>
          <div class="mode-divider"></div>
          <button
            @click="plannerStore.mode = 'binge'"
            :class="plannerStore.mode === 'binge' ? 'mode-btn-active' : 'mode-btn-inactive'"
            class="mode-btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            Binge
          </button>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSeasonStore } from "@/stores/seasonStore";
import { useAnimeStore } from "@/stores/animeStore";
import { usePlannerStore } from "@/stores/plannerStore";

const seasonStore = useSeasonStore();
const animeStore = useAnimeStore();
const plannerStore = usePlannerStore();

const seasons = ["winter", "spring", "summer", "fall"] as const;
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function onSeasonChange() {
  animeStore.loadSeason();
}
</script>

<style scoped>
/* ── Layout ── */
.filter-inner {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: flex-end;
  justify-content: space-between;
  padding: 16px 24px;
}

.filter-actions {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  margin-left: auto;
}

.filter-label {
  font-size: 11px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
}

/* ── Selects ── */
.filter-select {
  background-color: var(--bg-card);
  border: 1px solid var(--border-input);
  color: white;
  border-radius: 6px;
  padding: 7px 28px 7px 12px;
  font-size: 14px;
  cursor: pointer;
  min-width: 120px;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  transition: background-color 0.4s ease, border-color 0.15s ease;
}
.filter-select:hover,
.filter-select:focus {
  outline: none;
  border-color: var(--accent);
}
option {
  background-color: var(--bg-card);
}

/* ── Pills ── */
.pill {
  padding: 7px 12px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid var(--border-input);
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  white-space: nowrap;
}
.pill-active {
  background-color: var(--accent);
  border-color: var(--accent);
  color: white;
}
.pill-inactive {
  background-color: var(--bg-card);
  color: #9ca3af;
}
.pill-inactive:hover {
  color: white;
  border-color: var(--accent);
}

/* ── Mode toggle ── */
.mode-toggle {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-input);
  transition: border-color 0.4s ease;
}
.mode-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background-color 0.3s ease, color 0.3s ease;
}
.mode-btn-active {
  background-color: var(--accent);
  color: white;
}
.mode-btn-inactive {
  background-color: var(--bg-card);
  color: #9ca3af;
}
.mode-btn-inactive:hover {
  color: white;
}
.mode-divider {
  width: 1px;
  background-color: var(--border-input);
  transition: background-color 0.4s ease;
}

/* ── Mobile ── */
@media (max-width: 768px) {
  .filter-inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    padding: 12px 16px;
    justify-content: unset;
  }

  .filter-select {
    min-width: 0;
    width: 100%;
    font-size: 13px;
  }

  /* Exclude pills and actions each span both columns */
  .filter-exclude,
  .filter-actions {
    grid-column: 1 / -1;
    margin-left: 0;
  }

  .filter-actions {
    justify-content: space-between;
  }

  /* Compact mode toggle */
  .mode-btn {
    padding: 7px 14px;
    font-size: 13px;
  }
}
</style>
