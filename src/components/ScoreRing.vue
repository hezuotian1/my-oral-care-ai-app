<template>
  <div class="score-ring" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
      <circle :cx="center" :cy="center" :r="radius" fill="none" stroke="#eef2f1" :stroke-width="stroke" />
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke="color"
        :stroke-width="stroke"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        transform-origin="center"
        transform="rotate(-90)"
        style="transition: stroke-dashoffset 0.8s ease"
      />
    </svg>
    <div class="score-ring-text">
      <span class="score-ring-value" :style="{ color }">{{ display }}</span>
      <span v-if="label" class="score-ring-label">{{ label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    score: number
    size?: number
    stroke?: number
    label?: string
    /** 进度比例，默认按 score/100 */
    ratio?: number
  }>(),
  { size: 160, stroke: 10, label: '', ratio: undefined },
)

const center = computed(() => props.size / 2)
const radius = computed(() => props.size / 2 - props.stroke)
const circumference = computed(() => 2 * Math.PI * radius.value)

/** 环形填充比例：健康评分越高，环越满 */
const percent = computed(() => {
  const r = props.ratio ?? props.score / 100
  return Math.min(1, Math.max(0, r))
})

const dashOffset = computed(() => circumference.value * (1 - percent.value))
const display = computed(() => (Number.isFinite(props.score) ? props.score : '--'))

const color = computed(() => {
  const s = props.score
  if (s >= 85) return '#10b981'
  if (s >= 70) return '#f59e0b'
  if (s >= 50) return '#f97316'
  return '#ef4444'
})
</script>

<style scoped>
.score-ring {
  position: relative;
  margin: 0 auto;
}

.score-ring svg {
  display: block;
}

.score-ring-text {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.score-ring-value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
}

.score-ring-label {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}
</style>
