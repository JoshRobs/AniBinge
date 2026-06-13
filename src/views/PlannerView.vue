<template>
  <div class="planner">
    <Toolbar />
    <SeasonSelector />

    <div class="layout">
      <FilterPanel />
      <AnimeList />
      <BingeOrder />
    </div>
  </div>
</template>

<script setup lang="ts">
import Toolbar from "@/components/Toolbar.vue";
import SeasonSelector from "@/components/SeasonSelector.vue";
import FilterPanel from "@/components/FilterPanel.vue";
import AnimeList from "@/components/AnimeList.vue";
import BingeOrder from "@/components/BingeOrder.vue";
</script>
