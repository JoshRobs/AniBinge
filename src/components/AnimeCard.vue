<template>
  <div class="card">
    <h3>{{ anime.title }}</h3>
    <p>{{ anime.episodes }} episodes</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ anime: any }>();
</script>
