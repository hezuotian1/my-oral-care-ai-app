<template>
  <div class="layout">
    <AppSidebar />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
</script>

<style scoped>
.main-content {
  margin-left: 232px;
  padding: 12px 12px 12px 0;
  min-height: 100vh;
  background: var(--sidebar-bg);
  overflow-y: auto;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 64px;
    padding: 10px 10px 10px 0;
  }
}
</style>
