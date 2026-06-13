<template>
  <div class="flex flex-col items-center justify-center py-32 gap-4 text-center">
    <svg xmlns="http://www.w3.org/2000/svg" class="icon w-16 h-16 transition-colors duration-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
    <h2 class="text-2xl font-bold text-gray-200">Binge Timeline</h2>
    <p class="text-gray-500 max-w-sm">
      Your Gantt-style binge planner is coming soon. It will show you the optimal order to watch this season's anime based on air dates and episode counts.
    </p>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.icon {
  color: var(--accent);
  opacity: 0.4;
}
</style>
