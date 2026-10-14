<template>
  <div class="records-page">
    <header class="page-header">
      <h2>口腔档案</h2>
      <p>查看历次筛查记录与健康评分变化趋势</p>
    </header>

    <!-- 趋势 -->
    <section class="card">
      <div class="card-head">
        <h3 class="card-title">健康评分趋势</h3>
        <div class="range-tabs">
          <button
            v-for="d in [7, 30, 90]"
            :key="d"
            class="range-tab"
            :class="{ active: days === d }"
            @click="changeDays(d)"
          >
            {{ d }} 天
          </button>
        </div>
      </div>
      <TrendChart :points="trend" />
    </section>

    <!-- 列表 -->
    <section class="card">
      <div class="card-head">
        <h3 class="card-title">历史记录</h3>
        <span class="count-badge">共 {{ total }} 条</span>
      </div>

      <div v-if="loading" class="list-loading">
        <div class="loading-spinner"></div>
      </div>

      <template v-else>
        <div v-if="list.length" class="history-list">
          <article v-for="item in list" :key="item.id" class="history-card" @click="openDetail(item.id)">
            <div class="history-card-header">
              <div class="history-score-ring" :style="{ borderColor: scoreColor(item.score), color: scoreColor(item.score) }">
                <span>{{ item.score }}</span>
              </div>
              <div class="history-card-info">
                <div class="history-date">{{ formatDateTime(item.createdAt) }}</div>
                <span class="history-level" :style="{ background: scoreColor(item.score) }">
                  {{ LEVEL_TEXT[item.level] }}风险
                </span>
              </div>
              <button class="history-delete" title="删除" @click.stop="onDelete(item.id)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
              </button>
            </div>
            <div class="history-factors">
              <span class="history-factor-tag factor-tongue">舌象：{{ item.tongueSummary || '—' }}</span>
              <span class="history-factor-tag factor-teeth">牙齿：{{ item.teethSummary || '—' }}</span>
              <span v-for="f in item.factors" :key="f" class="history-factor-tag factor-risk">{{ f }}</span>
            </div>
          </article>
        </div>

        <EmptyState
          v-else
          title="还没有筛查记录"
          desc="完成一次拍照自查后，报告会自动归档到这里"
          badge="暂无归档记录"
        />
      </template>

      <div v-if="totalPages > 1" class="pager">
        <button class="btn btn-secondary btn-sm" :disabled="page <= 1" @click="go(page - 1)">上一页</button>
        <span class="pager-info">{{ page }} / {{ totalPages }}</span>
        <button class="btn btn-secondary btn-sm" :disabled="page >= totalPages" @click="go(page + 1)">下一页</button>
      </div>
    </section>

    <!-- 详情弹窗 -->
    <BaseModal v-if="detailVisible" large @close="detailVisible = false">
      <template #title>
        <span>筛查报告详情</span>
      </template>
      <div v-if="detailLoading" class="list-loading">
        <div class="loading-spinner"></div>
      </div>
      <ReportPanel v-else-if="detail" :report="detail" />
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import TrendChart from '@/components/TrendChart.vue'
import EmptyState from '@/components/EmptyState.vue'
import BaseModal from '@/components/BaseModal.vue'
import ReportPanel from '@/components/ReportPanel.vue'
import { deleteRecord, getRecord, getTrend, listRecords } from '@/api/records'
import { useToast } from '@/composables/useToast'
import { formatDateTime } from '@/utils/format'
import type { Level, RecordDetail, RecordListItem, TrendPoint } from '@/types'

const toast = useToast()

const list = ref<RecordListItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 5
const loading = ref(true)

const trend = ref<TrendPoint[]>([])
const days = ref(30)

const detailVisible = ref(false)
const detailLoading = ref(false)
const detail = ref<RecordDetail | null>(null)

const LEVEL_TEXT: Record<Level, string> = {
  healthy: '低',
  mild: '轻度',
  moderate: '中度',
  severe: '高',
}

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

function scoreColor(score: number): string {
  if (score >= 85) return '#10b981'
  if (score >= 70) return '#f59e0b'
  if (score >= 50) return '#f97316'
  return '#ef4444'
}

async function loadList() {
  loading.value = true
  try {
    const res = await listRecords(page.value, pageSize)
    list.value = res.list
    total.value = res.total
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '加载失败')
  } finally {
    loading.value = false
  }
}

async function loadTrend() {
  try {
    const res = await getTrend(days.value)
    trend.value = res.points
  } catch {
    trend.value = []
  }
}

function changeDays(d: number) {
  days.value = d
  loadTrend()
}

function go(p: number) {
  page.value = p
  loadList()
}

async function openDetail(id: string) {
  detailVisible.value = true
  detailLoading.value = true
  detail.value = null
  try {
    detail.value = await getRecord(id)
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '加载失败')
    detailVisible.value = false
  } finally {
    detailLoading.value = false
  }
}

async function onDelete(id: string) {
  if (!window.confirm('确定删除这条记录吗？删除后不可恢复。')) return
  try {
    await deleteRecord(id)
    toast.success('已删除')
    if (list.value.length === 1 && page.value > 1) page.value -= 1
    await Promise.all([loadList(), loadTrend()])
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '删除失败')
  }
}

onMounted(() => {
  loadList()
  loadTrend()
})
</script>

<style scoped>
.records-page {
  padding: 20px;
  background: var(--panel-bg);
  border-radius: var(--radius-xl);
  box-shadow: 0 2px 12px rgba(30, 82, 68, 0.06);
  min-height: calc(100vh - 24px);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  text-align: center;
  margin-bottom: 4px;
}

.page-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 6px;
}

.page-header p {
  font-size: 14px;
  color: #6b7280;
}

.card {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: 0 2px 12px rgba(30, 82, 68, 0.08);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.range-tabs {
  display: flex;
  gap: 6px;
}

.range-tab {
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  transition: all 0.2s;
}

.range-tab.active {
  background: var(--primary);
  color: #fff;
}

.count-badge {
  font-size: 12px;
  color: #9ca3af;
}

.list-loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
}

.history-card:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 16px rgba(13, 148, 136, 0.1);
  transform: translateY(-1px);
}

.history-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.history-score-ring {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border: 3px solid;
  border-radius: 50%;
  flex-shrink: 0;
}

.history-score-ring span {
  font-size: 17px;
  font-weight: 700;
}

.history-card-info {
  flex: 1;
}

.history-date {
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 6px;
}

.history-level {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 12px;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
}

.history-delete {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #9ca3af;
  transition: all 0.2s;
  flex-shrink: 0;
}

.history-delete:hover {
  background: #fef2f2;
  color: #ef4444;
}

.history-delete svg {
  width: 16px;
  height: 16px;
}

.history-factors {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.history-factor-tag {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
}

.factor-tongue {
  background: #f0fdfa;
  color: #0f766e;
}

.factor-teeth {
  background: #eff6ff;
  color: #1d4ed8;
}

.factor-risk {
  background: #fef3c7;
  color: #92400e;
}

.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
}

.pager-info {
  font-size: 13px;
  color: #6b7280;
}
</style>
