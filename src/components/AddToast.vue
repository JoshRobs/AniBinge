<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="toastStore.visible" class="add-toast" role="status" aria-live="polite">
        <span class="add-toast-text">
          <span v-if="toastStore.title" class="add-toast-title" :style="{ color: toastStore.titleColor }">{{ toastStore.title }}</span>
          {{ toastStore.message }}
        </span>
        <button v-if="toastStore.showAction" class="add-toast-view" @click="viewBingeList">
          View Binge List
        </button>
        <button class="add-toast-close" @click="toastStore.dismiss()" aria-label="Dismiss">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useToastStore } from "@/stores/toastStore";
import { usePlannerStore } from "@/stores/plannerStore";

const toastStore = useToastStore();
const plannerStore = usePlannerStore();

function viewBingeList() {
  plannerStore.mode = "binge";
  toastStore.dismiss();
}
</script>

<style scoped>
.add-toast {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  background: #1f2937;
  color: #f3f4f6;
  border: 1px solid #374151;
  border-radius: 8px;
  padding: 10px 14px 10px 18px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  z-index: 9999;
  max-width: calc(100vw - 32px);
}

.add-toast-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.add-toast-title {
  font-weight: 600;
}

.add-toast-view {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: white;
  background-color: var(--accent);
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  transition: opacity 0.15s ease;
}
.add-toast-view:hover {
  opacity: 0.85;
}

.add-toast-close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
  transition: color 0.15s ease;
  padding: 0;
}
.add-toast-close:hover {
  color: #e5e7eb;
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}
</style>
