<template>
  <div class="dashboard">
    <div v-if="loading" class="dashboard-loading">
      <div class="loading-spinner"></div>
      <span class="loading-text">正在加载…</span>
    </div>

    <template v-else>
      <!-- 今日口腔状态 -->
      <div class="dash-card dash-card-wide">
        <div class="dash-card-header">
          <div class="dash-card-icon" style="background: #e8f5e9; color: #2e7d32">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a5 5 0 0 0-5 5v2a3 3 0 0 0-3 3v1a3 3 0 0 0 3 3v1a5 5 0 0 0 5 5 5 5 0 0 0 5-5v-1a3 3 0 0 0 3-3v-1a3 3 0 0 0-3-3V7a5 5 0 0 0-5-5z" />
            </svg>
          </div>
          <span class="dash-card-title">今日口腔状态</span>
        </div>

        <div v-if="overview?.today.hasRecord" class="dash-card-body">
          <div class="dash-stat">
            <span class="dash-stat-num">{{ levelLabel(overview.today.level) }}</span>
            <span class="dash-stat-label">整体评级</span>
          </div>
          <div class="dash-stat">
            <span class="dash-stat-num">{{ overview.today.abnormalCount }}</span>
            <span class="dash-stat-label">异常项</span>
          </div>
          <div class="dash-stat">
            <span class="dash-stat-num">{{ overview.today.score }}</span>
            <span class="dash-stat-label">健康评分</span>
          </div>
        </div>

        <div v-else class="dash-empty">
          <p>今天还没有进行口腔自查</p>
          <RouterLink to="/scan" class="btn btn-primary btn-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            立即拍照自查
          </RouterLink>
        </div>
      </div>

      <!-- 快捷入口 -->
      <div class="dash-card">
        <div class="dash-card-header">
          <div class="dash-card-icon" style="background: #e3f2fd; color: #1565c0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <span class="dash-card-title">快捷入口</span>
        </div>
        <div class="dash-quick-grid">
          <RouterLink to="/scan" class="dash-quick-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span>拍照自查</span>
          </RouterLink>
          <RouterLink to="/records" class="dash-quick-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span>口腔档案</span>
          </RouterLink>
          <RouterLink to="/articles" class="dash-quick-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            <span>健康科普</span>
          </RouterLink>
          <RouterLink to="/assistant" class="dash-quick-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <circle cx="12" cy="5" r="2" />
              <path d="M12 7v4" />
            </svg>
            <span>AI咨询</span>
          </RouterLink>
        </div>
      </div>

      <!-- 待办提醒 -->
      <div class="dash-card">
        <div class="dash-card-header">
          <div class="dash-card-icon" style="background: #fff3e0; color: #e65100">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <span class="dash-card-title">待办提醒</span>
        </div>
        <div class="dash-todo-list">
          <div v-for="todo in overview?.todos || []" :key="todo.text" class="dash-todo-item" :class="{ done: todo.done }">
            <span class="dash-todo-dot"></span>{{ todo.text }}
            <span class="dash-todo-state">{{ todo.done ? '已完成' : '待完成' }}</span>
          </div>
        </div>
      </div>

      <!-- 健康小贴士 -->
      <div class="dash-card">
        <div class="dash-card-header">
          <div class="dash-card-icon" style="background: #f3e5f5; color: #7b1fa2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18h6" />
              <path d="M10 22h4" />
              <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
            </svg>
          </div>
          <span class="dash-card-title">{{ overview?.tip.title || '口腔健康小贴士' }}</span>
        </div>
        <div class="dash-tip">{{ overview?.tip.content }}</div>
      </div>

      <!-- 连续打卡 -->
      <div class="dash-card">
        <div class="dash-card-header">
          <div class="dash-card-icon" style="background: #fff8e1; color: #f57f17">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 2v4" />
              <path d="M16 2v4" />
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M3 10h18" />
            </svg>
          </div>
          <span class="dash-card-title">连续打卡天数</span>
        </div>
        <div class="dash-checkin">
          <span class="dash-checkin-num">{{ overview?.streakDays ?? 0 }}</span>
          <span class="dash-checkin-unit">天</span>
        </div>
        <div class="dash-checkin-sub">坚持记录，保持口腔健康</div>
        <button class="btn btn-primary btn-sm dash-checkin-btn" @click="onCheckin">今日打卡</button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getOverview } from '@/api/stats'
import { doCheckin } from '@/api/checkin'
import { useToast } from '@/composables/useToast'
import type { Level, Overview } from '@/types'

const toast = useToast()
const loading = ref(true)
const overview = ref<Overview | null>(null)

const LEVEL_TEXT: Record<Level, string> = {
  healthy: '良好',
  mild: '轻度',
  moderate: '中度',
  severe: '重度',
}

function levelLabel(level: Level | null): string {
  return level ? LEVEL_TEXT[level] : '--'
}

async function load() {
  loading.value = true
  try {
    overview.value = await getOverview()
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '加载失败')
  } finally {
    loading.value = false
  }
}

async function onCheckin() {
  try {
    const res = await doCheckin()
    toast.success(`打卡成功，已连续 ${res.streakDays} 天`)
    await load()
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '打卡失败')
  }
}

onMounted(load)
</script>

<style scoped>
.dashboard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 20px;
  background: var(--panel-bg);
  border-radius: var(--radius-xl);
  box-shadow: 0 2px 12px rgba(30, 82, 68, 0.06);
  min-height: calc(100vh - 24px);
}

.dashboard-loading {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 60vh;
}

.dash-card {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: 0 2px 12px rgba(30, 82, 68, 0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.dash-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(30, 82, 68, 0.16);
}

.dash-card-wide {
  grid-column: span 3;
}

.dash-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.dash-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dash-card-icon svg {
  width: 22px;
  height: 22px;
}

.dash-card-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.dash-card-body {
  display: flex;
  gap: 48px;
  justify-content: center;
  padding: 8px 0;
}

.dash-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.dash-stat-num {
  font-size: 28px;
  font-weight: 700;
  color: var(--sidebar-bg);
}

.dash-stat-label {
  font-size: 12px;
  color: #999;
}

.dash-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 16px 0;
  color: #9ca3af;
  font-size: 14px;
}

.dash-quick-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.dash-quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  border-radius: 10px;
  background: #f9fafb;
  color: #555;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.dash-quick-item:hover {
  background: #f0fdf4;
}

.dash-quick-item svg {
  width: 24px;
  height: 24px;
  color: var(--sidebar-bg);
}

.dash-todo-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dash-todo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #555;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.dash-todo-item:last-child {
  border-bottom: none;
}

.dash-todo-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff9800;
  flex-shrink: 0;
}

.dash-todo-item.done {
  color: #9ca3af;
}

.dash-todo-item.done .dash-todo-dot {
  background: #10b981;
}

.dash-todo-state {
  margin-left: auto;
  font-size: 12px;
  color: #9ca3af;
}

.dash-tip {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  padding: 8px 0;
}

.dash-checkin {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  padding: 12px 0 4px;
}

.dash-checkin-num {
  font-size: 48px;
  font-weight: 800;
  color: #f57f17;
  line-height: 1;
}

.dash-checkin-unit {
  font-size: 18px;
  color: #999;
}

.dash-checkin-sub {
  text-align: center;
  font-size: 12px;
  color: #aaa;
}

.dash-checkin-btn {
  display: block;
  margin: 14px auto 0;
}

@media (max-width: 1100px) {
  .dashboard {
    grid-template-columns: repeat(2, 1fr);
  }
  .dash-card-wide {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .dashboard {
    grid-template-columns: 1fr;
  }
  .dash-card-wide {
    grid-column: span 1;
  }
  .dash-card-body {
    gap: 24px;
  }
}
</style>
