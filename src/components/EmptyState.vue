<template>
  <div class="empty-page">
    <div class="empty-page-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    </div>
    <h3 class="empty-page-title">{{ title }}</h3>
    <p class="empty-page-desc">{{ desc }}</p>
    <div v-if="badge" class="empty-page-badge">{{ badge }}</div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ title: string; desc?: string; badge?: string }>(), {
  desc: '',
  badge: '',
})
</script>
