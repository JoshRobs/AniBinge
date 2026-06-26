<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal" role="dialog" aria-modal="true" aria-label="Saved Lists">
        <button class="modal-close" @click="$emit('close')" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <h2 class="modal-title">Saved Lists</h2>

        <!-- Save section -->
        <div class="save-section">
          <p class="save-label">Save current list</p>
          <div v-if="bingeStore.list.length" class="save-row">
            <input
              ref="nameInputEl"
              v-model="saveName"
              placeholder="Give this list a name…"
              class="save-input"
              maxlength="60"
              @keydown.enter="handleSave"
              @keydown.escape="$emit('close')"
            />
            <button class="save-btn" :disabled="!saveName.trim()" @click="handleSave">
              Save
            </button>
          </div>
          <p v-else class="save-empty">Your binge list is empty — nothing to save.</p>
          <p v-if="saveConfirmed" class="save-confirmed">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Saved!
          </p>
        </div>

        <!-- Saved lists -->
        <div class="lists-section">
          <p v-if="savedStore.lists.length" class="lists-count">
            {{ savedStore.lists.length }} saved {{ savedStore.lists.length === 1 ? 'list' : 'lists' }}
          </p>

          <div v-if="savedStore.lists.length" class="list-cards">
            <div v-for="list in savedStore.lists" :key="list.id" class="list-card">
              <!-- Covers preview -->
              <div class="list-covers">
                <img
                  v-for="anime in list.items.slice(0, 4)"
                  :key="anime.id"
                  :src="anime.image"
                  :alt="anime.title"
                  class="list-cover"
                />
                <div v-for="i in Math.max(0, 4 - list.items.length)" :key="'blank-' + i" class="list-cover list-cover--blank" />
              </div>

              <!-- Info -->
              <div class="list-info">
                <p class="list-name">{{ list.name }}</p>
                <p class="list-meta">{{ list.items.length }} anime · {{ formatDate(list.createdAt) }}</p>
              </div>

              <!-- Actions -->
              <div class="list-actions">
                <button
                  class="list-btn list-btn--load"
                  :class="{ 'list-btn--confirming': confirmLoadId === list.id }"
                  @click="handleLoad(list)"
                  :title="confirmLoadId === list.id ? 'Click again to replace your current list' : 'Load this list'"
                >
                  {{ confirmLoadId === list.id ? 'Confirm?' : 'Load' }}
                </button>
                <button
                  class="list-btn list-btn--delete"
                  :class="{ 'list-btn--confirming': confirmDeleteId === list.id }"
                  @click="handleDelete(list.id)"
                  :title="confirmDeleteId === list.id ? 'Click again to delete' : 'Delete'"
                >
                  {{ confirmDeleteId === list.id ? 'Confirm?' : 'Delete' }}
                </button>
              </div>
            </div>
          </div>

          <div v-else class="lists-empty">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 mb-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            <p>No saved lists yet.</p>
            <p class="lists-empty-sub">Build a binge list and save it here to come back to it later.</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from "vue";
import { useBingeStore } from "@/stores/bingeStore";
import { useSavedListsStore } from "@/stores/savedListsStore";
import type { SavedList } from "@/stores/savedListsStore";

const emit = defineEmits<{ close: [] }>();

const bingeStore = useBingeStore();
const savedStore = useSavedListsStore();

// ── Save ──────────────────────────────────────────────────────────────────────

const saveName = ref("");
const saveConfirmed = ref(false);
const nameInputEl = ref<HTMLInputElement | null>(null);
let saveConfirmTimer: ReturnType<typeof setTimeout> | null = null;

function handleSave() {
  if (!saveName.value.trim()) return;
  savedStore.save(saveName.value, bingeStore.list);
  saveName.value = "";
  saveConfirmed.value = true;
  if (saveConfirmTimer) clearTimeout(saveConfirmTimer);
  saveConfirmTimer = setTimeout(() => { saveConfirmed.value = false; }, 2500);
}

// ── Load ──────────────────────────────────────────────────────────────────────

const confirmLoadId = ref<string | null>(null);
let confirmLoadTimer: ReturnType<typeof setTimeout> | null = null;

function handleLoad(list: SavedList) {
  if (confirmLoadId.value === list.id) {
    bingeStore.replaceAll(list.items);
    emit("close");
  } else {
    confirmLoadId.value = list.id;
    if (confirmLoadTimer) clearTimeout(confirmLoadTimer);
    confirmLoadTimer = setTimeout(() => { confirmLoadId.value = null; }, 3000);
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────

const confirmDeleteId = ref<string | null>(null);
let confirmDeleteTimer: ReturnType<typeof setTimeout> | null = null;

function handleDelete(id: string) {
  if (confirmDeleteId.value === id) {
    savedStore.remove(id);
    confirmDeleteId.value = null;
    if (confirmDeleteTimer) clearTimeout(confirmDeleteTimer);
  } else {
    confirmDeleteId.value = id;
    if (confirmDeleteTimer) clearTimeout(confirmDeleteTimer);
    confirmDeleteTimer = setTimeout(() => { confirmDeleteId.value = null; }, 3000);
  }
}

// ── Date format ───────────────────────────────────────────────────────────────

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// ── Keyboard / focus ──────────────────────────────────────────────────────────

function onKeyDown(e: KeyboardEvent) {
  if (e.key === "Escape") emit("close");
}

onMounted(async () => {
  window.addEventListener("keydown", onKeyDown);
  await nextTick();
  nameInputEl.value?.focus();
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeyDown);
  if (saveConfirmTimer) clearTimeout(saveConfirmTimer);
  if (confirmLoadTimer) clearTimeout(confirmLoadTimer);
  if (confirmDeleteTimer) clearTimeout(confirmDeleteTimer);
});
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.modal {
  position: relative;
  background-color: var(--bg-header);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 28px;
  width: 100%;
  max-width: 560px;
  max-height: 80vh;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.modal::-webkit-scrollbar { display: none; }

.modal-close {
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
  transition: color 0.15s, border-color 0.15s;
}
.modal-close:hover { color: white; border-color: var(--accent); }

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #f3f4f6;
  padding-right: 36px;
}

/* ── Save section ── */
.save-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.save-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
}
.save-row {
  display: flex;
  gap: 8px;
}
.save-input {
  flex: 1;
  min-width: 0;
  background-color: var(--bg-card);
  border: 1px solid var(--border-input);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  color: #f3f4f6;
  outline: none;
  transition: border-color 0.15s;
}
.save-input::placeholder { color: #4b5563; }
.save-input:focus { border-color: var(--accent); }
.save-btn {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid var(--accent);
  background-color: var(--accent);
  color: white;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: opacity 0.15s;
}
.save-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.save-btn:not(:disabled):hover { opacity: 0.85; }
.save-empty {
  font-size: 13px;
  color: #4b5563;
  font-style: italic;
}
.save-confirmed {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #22c55e;
}

/* ── Lists section ── */
.lists-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.lists-count {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
}

.list-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background-color: var(--bg-card);
  border: 1px solid var(--border-input);
  border-radius: 10px;
  padding: 12px 14px;
  transition: border-color 0.15s;
}
.list-card:hover { border-color: #4b5563; }

.list-covers {
  display: flex;
  gap: 3px;
  flex-shrink: 0;
}
.list-cover {
  width: 28px;
  aspect-ratio: 3/4;
  object-fit: cover;
  border-radius: 3px;
  flex-shrink: 0;
}
.list-cover--blank {
  background-color: var(--bg-deep);
  border: 1px solid var(--border-input);
}

.list-info {
  flex: 1;
  min-width: 0;
}
.list-name {
  font-size: 14px;
  font-weight: 600;
  color: #e5e7eb;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.list-meta {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.list-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}
.list-btn {
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid var(--border-input);
  background: none;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.15s, color 0.15s, background-color 0.15s;
}
.list-btn--load {
  color: #e5e7eb;
}
.list-btn--load:hover {
  border-color: var(--accent);
  color: white;
}
.list-btn--delete {
  color: #6b7280;
}
.list-btn--delete:hover {
  border-color: #ef4444;
  color: #ef4444;
}
.list-btn--confirming {
  border-color: #ef4444 !important;
  color: #ef4444 !important;
}

/* ── Empty state ── */
.lists-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}
.lists-empty-sub {
  margin-top: 6px;
  font-size: 13px;
  font-weight: 400;
  color: #4b5563;
}

/* ── Mobile ── */
@media (max-width: 768px) {
  .modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }
  .modal {
    border-radius: 20px 20px 0 0;
    max-height: 85vh;
    padding: 20px 20px 32px;
  }
  .list-covers { display: none; }
}
</style>
