<template>
  <div class="trend">
    <svg v-if="points.length" :viewBox="`0 0 ${W} ${H}`" class="trend-svg" preserveAspectRatio="none">
      <!-- 网格线 -->
      <line v-for="t in ticks" :key="t" :x1="PAD" :y1="y(t)" :x2="W - PAD" :y2="y(t)" stroke="#eef2f1" stroke-width="1" />
      <text v-for="t in ticks" :key="`l${t}`" :x="4" :y="y(t) + 4" class="trend-tick">{{ t }}</text>

      <!-- 折线 -->
      <polyline :points="polyline" fill="none" :stroke="strokeColor" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />

      <!-- 数据点 -->
      <circle v-for="(p, i) in points" :key="i" :cx="x(i)" :cy="y(p.score)" r="3.5" fill="#fff" :stroke="strokeColor" stroke-width="2" />
    </svg>
    <div v-else class="trend-empty">暂无趋势数据，完成一次自查后即可查看变化曲线</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TrendPoint } from '@/types'

const props = defineProps<{ points: TrendPoint[] }>()

const W = 640
const H = 200
const PAD = 34

const ticks = [100, 75, 50, 25, 0]

const strokeColor = computed(() => '#0d9488')

function x(i: number): number {
  const n = props.points.length
  if (n <= 1) return W / 2
  return PAD + (i * (W - PAD * 2)) / (n - 1)
}

function y(score: number): number {
  const clamped = Math.min(100, Math.max(0, score))
  return H - PAD - (clamped / 100) * (H - PAD * 2)
}

const polyline = computed(() => props.points.map((p, i) => `${x(i)},${y(p.score)}`).join(' '))
</script>

<style scoped>
.trend {
  width: 100%;
}

.trend-svg {
  width: 100%;
  height: 200px;
}

.trend-tick {
  font-size: 10px;
  fill: #9ca3af;
}

.trend-empty {
  padding: 40px 0;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}
</style>
