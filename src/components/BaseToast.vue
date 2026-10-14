<template>
  <Teleport to="body">
    <div class="toast-container">
      <div v-for="item in toasts" :key="item.id" class="toast" :class="`toast-${item.type}`">
        {{ item.message }}
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts } = useToast()
</script>
