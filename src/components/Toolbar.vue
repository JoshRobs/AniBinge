<template>
  <header
    class="border-b transition-[background-color,border-color] duration-400"
    style="background-color: var(--bg-header); border-color: var(--border)"
  >
    <div class="toolbar-inner max-w-350 mx-auto">
      <!-- Logo -->
      <button class="logo-btn" @click="goHome">
        Ani<span style="color: var(--accent)" class="transition-colors duration-400">Binge</span>
      </button>

      <!-- Search (desktop: inline; mobile: full-width row, hidden in binge mode) -->
      <div class="search-wrap" :class="{ 'search-wrap--binge': plannerStore.mode === 'binge' }">
        <svg
          class="search-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          :value="searchStore.query"
          @input="onInput"
          placeholder="Search all anime…"
          class="search-input"
        />
        <div v-if="searchStore.loading" class="search-spinner" />
        <button
          v-else-if="searchStore.query"
          class="search-clear"
          aria-label="Clear search"
          @click="searchStore.clear()"
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
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Actions: share + ko-fi -->
      <div class="toolbar-actions">
        <button
          v-if="bingeStore.list.length > 0"
          class="share-btn"
          :class="{ 'share-btn--copied': copied }"
          @click="copyShareLink"
          title="Copy share link"
        >
          <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" class="share-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="share-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span class="share-label">{{ copied ? "Copied!" : "Share" }}</span>
        </button>
        <a
          href="https://ko-fi.com/S1X221F6YG"
          target="_blank"
          rel="noopener noreferrer"
          class="kofi-btn"
        >
          <img :src="KofiLogo" class="kofi-icon" alt="Ko-fi" />
          <span class="kofi-label">Buy me a coffee</span>
        </a>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useSearchStore } from "@/stores/searchStore";
import { usePlannerStore } from "@/stores/plannerStore";
import { useBingeStore } from "@/stores/bingeStore";
import KofiLogo from "@/assets/kofiLogo.svg";

const searchStore = useSearchStore();
const plannerStore = usePlannerStore();
const bingeStore = useBingeStore();

const copied = ref(false);

function goHome() {
  plannerStore.mode = plannerStore.mode === "explore" ? "binge" : "explore";
}

function onInput(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  if (value.trim().length > 0 && plannerStore.mode === "binge") {
    plannerStore.mode = "explore";
  }
  searchStore.setQuery(value);
}

async function copyShareLink() {
  const ids = bingeStore.list.map((a) => a.id).join(",");
  const url = `${window.location.origin}/share?ids=${ids}`;
  await navigator.clipboard.writeText(url);
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 2000);
}
</script>

<style scoped>
/* ── Layout ── */
.toolbar-inner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  margin-left: auto;
}

/* ── Logo ── */
.logo-btn {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  flex-shrink: 0;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
}

/* ── Ko-fi ── */
.kofi-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid #72a4f2;
  color: #72a4f2;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background-color 0.15s, color 0.15s;
}
.kofi-btn:hover {
  background-color: #72a4f2;
  color: #0d1015;
}
.kofi-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* ── Search ── */
.search-wrap {
  position: relative;
  flex: 1;
  max-width: 400px;
  min-width: 0;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 12px;
  width: 15px;
  height: 15px;
  color: #6b7280;
  pointer-events: none;
}
.search-input {
  width: 100%;
  min-width: 0;
  background-color: var(--bg-card);
  border: 1px solid var(--border-input);
  border-radius: 8px;
  padding: 7px 36px;
  font-size: 16px; /* 16px prevents iOS auto-zoom */
  color: #f3f4f6;
  outline: none;
  transition: border-color 0.15s;
}
.search-input::placeholder {
  color: #4b5563;
}
.search-input:focus {
  border-color: var(--accent);
}
.search-clear {
  position: absolute;
  right: 10px;
  width: 18px;
  height: 18px;
  color: #6b7280;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.search-clear svg {
  width: 14px;
  height: 14px;
}
.search-clear:hover {
  color: #e5e7eb;
}

/* ── Share ── */
.share-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid var(--border-input);
  color: #9ca3af;
  background: none;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.share-btn:hover {
  border-color: #9ca3af;
  color: #e5e7eb;
}
.share-btn--copied {
  border-color: #22c55e;
  color: #22c55e;
}
.share-btn--copied:hover {
  border-color: #22c55e;
  color: #22c55e;
}
.share-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

/* ── Search spinner ── */
.search-spinner {
  position: absolute;
  right: 10px;
  width: 14px;
  height: 14px;
  border: 2px solid var(--accent);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Mobile ── */
@media (max-width: 768px) {
  .toolbar-inner {
    flex-wrap: wrap;
    padding: 10px 16px;
    gap: 10px;
  }

  /* Logo and actions stay on the first row */
  .logo-btn { order: 1; }
  .toolbar-actions { order: 2; margin-left: auto; }

  /* Search drops to full-width second row */
  .search-wrap {
    order: 3;
    flex: none;
    width: 100%;
    max-width: none;
  }

  /* Ko-fi: icon only on mobile */
  .kofi-label {
    display: none;
  }
  .kofi-btn {
    padding: 7px 9px;
  }

  /* Share: icon only */
  .share-label {
    display: none;
  }
  .share-btn {
    padding: 7px 9px;
  }
}
</style>
