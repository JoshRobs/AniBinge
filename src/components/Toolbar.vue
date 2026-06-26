<template>
  <header
    class="border-b transition-[background-color,border-color] duration-400"
    style="background-color: var(--bg-header); border-color: var(--border)"
  >
    <div class="toolbar-inner max-w-350 mx-auto">
      <!-- Logo -->
      <button class="logo-btn" @click="goHome">
        Ani<span
          style="color: var(--accent)"
          class="transition-colors duration-400"
          >Binge</span
        >
      </button>

      <!-- Search (desktop: inline; mobile: full-width row, hidden in binge mode) -->
      <div
        class="search-wrap"
        :class="{ 'search-wrap--binge': plannerStore.mode === 'binge' }"
      >
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
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
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
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Actions: feedback + ko-fi -->
      <div class="toolbar-actions">
        <a
          href="https://github.com/JoshRobs/AniBinge/issues"
          target="_blank"
          rel="noopener noreferrer"
          class="feedback-btn"
          title="Report a bug or give feedback"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="feedback-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span class="feedback-label">Feedback</span>
        </a>
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
import { useSearchStore } from "@/stores/searchStore";
import { usePlannerStore } from "@/stores/plannerStore";
import KofiLogo from "@/assets/kofiLogo.svg";

const searchStore = useSearchStore();
const plannerStore = usePlannerStore();

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

/* ── Feedback ── */
.feedback-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid var(--border-input);
  color: #9ca3af;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  transition: border-color 0.15s, color 0.15s;
}
.feedback-btn:hover {
  border-color: #9ca3af;
  color: #e5e7eb;
}
.feedback-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
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
  transition:
    background-color 0.15s,
    color 0.15s;
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
  to {
    transform: rotate(360deg);
  }
}

/* ── Mobile ── */
@media (max-width: 768px) {
  .toolbar-inner {
    flex-wrap: wrap;
    padding: 10px 16px;
    gap: 10px;
  }

  /* Logo and actions stay on the first row */
  .logo-btn {
    order: 1;
  }
  .toolbar-actions {
    order: 2;
    margin-left: auto;
  }

  /* Search drops to full-width second row */
  .search-wrap {
    order: 3;
    flex: none;
    width: 100%;
    max-width: none;
  }

  /* Feedback: icon only on mobile */
  .feedback-label {
    display: none;
  }
  .feedback-btn {
    padding: 7px 9px;
  }

  /* Ko-fi: icon only on mobile */
  .kofi-label {
    display: none;
  }
  .kofi-btn {
    padding: 7px 9px;
  }
}
</style>
