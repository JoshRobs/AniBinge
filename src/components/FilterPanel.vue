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
        </div>
      </div>
      <div class="filter-actions">
        <button v-if="plannerStore.mode === 'binge'" class="sort-btn" @click="bingeStore.sortByEndDate()" title="Sort by End Date">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="9" y2="18"/>
          </svg>
          <span class="sort-label">Sort by End Date</span>
        </button>
        <div v-if="plannerStore.mode === 'binge'" ref="exportRef" class="relative">
          <button class="export-btn" :disabled="exporting" @click="exportOpen = !exportOpen">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {{ exporting ? "Exporting…" : "Export" }}
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <div v-if="exportOpen" class="export-dropdown">
            <button class="export-option" @click="doExport('png')">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
              PNG Image
            </button>
            <button class="export-option" @click="doExport('pdf')">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              PDF Document
            </button>
            <button class="export-option" @click="doExport('clipboard')">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              </svg>
              Copy to Clipboard
            </button>
          </div>
        </div>
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
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from "vue";
import { useSeasonStore } from "@/stores/seasonStore";
import { useAnimeStore } from "@/stores/animeStore";
import { usePlannerStore } from "@/stores/plannerStore";
import { exportToPng, exportToPdf, copyToClipboard } from "@/composables/useExport";
import { useBingeStore } from "@/stores/bingeStore";

const seasonStore = useSeasonStore();
const animeStore = useAnimeStore();
const plannerStore = usePlannerStore();
const bingeStore = useBingeStore();

const seasons = ["winter", "spring", "summer", "fall"] as const;
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function onSeasonChange() {
  animeStore.loadSeason();
}

const exportRef = ref<HTMLElement | null>(null);
const exportOpen = ref(false);
const exporting = ref(false);

function onDocClick(e: MouseEvent) {
  if (exportRef.value && !exportRef.value.contains(e.target as Node)) {
    exportOpen.value = false;
  }
}

watch(exportOpen, (open) => {
  if (open) document.addEventListener("click", onDocClick);
  else document.removeEventListener("click", onDocClick);
});

onUnmounted(() => document.removeEventListener("click", onDocClick));

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
  align-items: center;
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

/* ── Sort button ── */
.sort-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid var(--border-input);
  background-color: var(--bg-card);
  color: #e5e7eb;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  white-space: nowrap;
}
.sort-btn:hover {
  border-color: var(--accent);
  color: white;
}

/* ── Export ── */
.export-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid var(--border-input);
  background-color: var(--bg-card);
  color: #e5e7eb;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  white-space: nowrap;
}
.export-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: white;
}
.export-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.export-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background-color: var(--bg-header);
  border: 1px solid var(--border-input);
  border-radius: 8px;
  padding: 4px;
  min-width: 160px;
  z-index: 100;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}
.export-option {
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
  transition: background-color 0.1s, color 0.1s;
}
.export-option:hover {
  background-color: var(--bg-card);
  color: white;
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

  /* Export hidden on mobile */
  .export-btn {
    display: none;
  }

  /* Sort: icon only */
  .sort-label {
    display: none;
  }
  .sort-btn {
    padding: 7px 9px;
  }

  /* Compact mode toggle */
  .mode-btn {
    padding: 7px 14px;
    font-size: 13px;
  }
}
</style>
