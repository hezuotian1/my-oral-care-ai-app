<template>
  <div class="scan-page">
    <header class="scan-header">
      <h2>拍照自查</h2>
      <p>分别上传舌象照片与牙齿现状照片，系统将进行双分支分析与中医辨证融合评估</p>
    </header>

    <!-- 步骤指示 -->
    <div class="steps-indicator">
      <div class="step-dot" :class="{ active: step === 0, done: step > 0 }">1</div>
      <div class="step-line" :class="{ done: step > 0 }"></div>
      <div class="step-dot" :class="{ active: step === 1, done: step > 1 }">2</div>
      <div class="step-line" :class="{ done: step > 1 }"></div>
      <div class="step-dot" :class="{ active: step === 2, done: step > 2 }">3</div>
    </div>

    <div class="scan-body">
      <!-- 左：上传 -->
      <section class="scan-panel">
        <h3 class="panel-title">上传照片</h3>
        <div class="upload-grid">
          <UploadDropzone v-model="tongueFile" label="上传舌象照片" hint="自然伸舌，光线充足，避免反光" />
          <UploadDropzone v-model="teethFile" label="上传牙齿照片" hint="微张口露出牙齿与牙龈，正面拍摄" />
        </div>

        <p class="privacy-note">
          提示：上传的图片将发送至智谱云端视觉模型进行分析，用于本次筛查；服务端按账号隔离存储。
        </p>

        <div class="scan-actions">
          <button class="btn btn-primary" :disabled="!canAnalyze || loading" @click="onAnalyze">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a5 5 0 0 0-5 5v2a3 3 0 0 0-3 3v1a3 3 0 0 0 3 3v1a5 5 0 0 0 5 5 5 5 0 0 0 5-5v-1a3 3 0 0 0 3-3v-1a3 3 0 0 0-3-3V7a5 5 0 0 0-5-5z" />
            </svg>
            {{ loading ? '分析中…' : '开始分析' }}
          </button>
          <button class="btn btn-secondary" :disabled="loading" @click="reset">重置</button>
        </div>
      </section>

      <!-- 右：结果 -->
      <section class="scan-panel result-panel">
        <h3 class="panel-title">筛查报告</h3>

        <div v-if="loading" class="loading-overlay">
          <div class="loading-spinner"></div>
          <span class="loading-text">正在调用视觉模型分析，请稍候…</span>
        </div>

        <ReportPanel v-else-if="report" :report="report" />

        <div v-else class="result-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <p>上传两张照片后点击「开始分析」</p>
          <span>报告将在此处展示</span>
        </div>
      </section>
    </div>

    <div v-if="report" class="scan-footer">
      <RouterLink to="/records" class="btn btn-secondary btn-sm">查看口腔档案</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import UploadDropzone from '@/components/UploadDropzone.vue'
import ReportPanel from '@/components/ReportPanel.vue'
import { analyzeImages } from '@/api/analyze'
import { useToast } from '@/composables/useToast'
import type { AnalyzeReport } from '@/types'

const toast = useToast()

const tongueFile = ref<File | null>(null)
const teethFile = ref<File | null>(null)
const loading = ref(false)
const step = ref(0)
const report = ref<AnalyzeReport | null>(null)

const canAnalyze = computed(() => Boolean(tongueFile.value && teethFile.value))

async function onAnalyze() {
  if (!canAnalyze.value) {
    toast.error('请先上传舌象与牙齿两张照片')
    return
  }
  loading.value = true
  step.value = 1
  report.value = null
  try {
    const res = await analyzeImages(tongueFile.value as File, teethFile.value as File)
    report.value = res
    step.value = 2
    if (res.aiEnhanced) {
      toast.success('分析完成')
    } else {
      toast.info('AI 模型不可用，已返回本地规则结果')
    }
  } catch (err) {
    step.value = 0
    toast.error(err instanceof Error ? err.message : '分析失败')
  } finally {
    loading.value = false
  }
}

function reset() {
  tongueFile.value = null
  teethFile.value = null
  report.value = null
  step.value = 0
}
</script>

<style scoped>
.scan-page {
  padding: 20px;
  background: var(--panel-bg);
  border-radius: var(--radius-xl);
  box-shadow: 0 2px 12px rgba(30, 82, 68, 0.06);
  min-height: calc(100vh - 24px);
}

.scan-header {
  text-align: center;
  margin-bottom: 20px;
}

.scan-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 6px;
}

.scan-header p {
  font-size: 14px;
  color: #6b7280;
}

.steps-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.step-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}

.step-dot.active {
  background: var(--primary);
  color: #fff;
}

.step-dot.done {
  background: #10b981;
  color: #fff;
}

.step-line {
  width: 40px;
  height: 2px;
  background: #e5e7eb;
}

.step-line.done {
  background: #10b981;
}

.scan-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
}

.scan-panel {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: 0 2px 12px rgba(30, 82, 68, 0.08);
}

.result-panel {
  position: relative;
  min-height: 320px;
}

.panel-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.upload-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.privacy-note {
  margin-top: 14px;
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.7;
}

.scan-actions {
  display: flex;
  gap: 12px;
  margin-top: 18px;
  justify-content: center;
}

.result-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 260px;
  color: #9ca3af;
  text-align: center;
}

.result-placeholder p {
  font-size: 15px;
  color: #6b7280;
  margin-top: 8px;
}

.result-placeholder span {
  font-size: 13px;
}

.scan-footer {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

@media (max-width: 980px) {
  .scan-body {
    grid-template-columns: 1fr;
  }
  .upload-grid {
    grid-template-columns: 1fr;
  }
}
</style>
