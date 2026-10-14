<template>
  <div class="report">
    <!-- 综合结论 -->
    <div class="report-head">
      <ScoreRing :score="report.fusion.score" :size="150" label="健康评分" />
      <div class="report-head-info">
        <span class="level-badge" :class="`level-${report.fusion.level}`">
          {{ LEVEL_TEXT[report.fusion.level] }}风险
        </span>
        <p class="report-summary">{{ report.fusion.summary }}</p>
        <div class="report-tags">
          <span v-for="tag in report.fusion.riskTags" :key="tag" class="risk-tag">{{ tag }}</span>
          <span v-if="!report.fusion.riskTags.length" class="risk-tag ok">未见明显风险项</span>
        </div>
        <p class="report-meta">
          <span class="ai-badge" :class="report.aiEnhanced ? 'on' : 'off'">
            {{ report.aiEnhanced ? `AI 模型 · ${report.aiModel}` : '本地规则兜底' }}
          </span>
          <span v-if="report.processingTime">耗时 {{ report.processingTime }}</span>
        </p>
      </div>
    </div>

    <!-- 双分支结果 -->
    <div class="report-grid">
      <section class="report-section">
        <h4 class="report-section-title">舌象分析</h4>
        <p class="report-diagnosis">{{ report.tongue.diagnosis }}</p>
        <p class="report-desc">{{ report.tongue.description }}</p>
        <dl class="feature-list">
          <div><dt>舌质</dt><dd>{{ report.tongue.features.tongueColor || '—' }}</dd></div>
          <div><dt>舌苔</dt><dd>{{ report.tongue.features.coating || '—' }}</dd></div>
          <div><dt>舌体</dt><dd>{{ report.tongue.features.shape || '—' }}</dd></div>
          <div><dt>舌下络脉</dt><dd>{{ report.tongue.features.sublingualVein || '—' }}</dd></div>
        </dl>
        <p v-if="report.tongue.advice" class="report-advice">{{ report.tongue.advice }}</p>
        <p v-if="report.tongue.medicalBasis" class="report-basis">依据：{{ report.tongue.medicalBasis }}</p>
      </section>

      <section class="report-section">
        <h4 class="report-section-title">牙齿 / 牙龈分析</h4>
        <p class="report-diagnosis">{{ report.teeth.diagnosis }}</p>
        <p class="report-desc">{{ report.teeth.description }}</p>
        <ul v-if="report.teeth.findings.length" class="finding-list">
          <li v-for="(f, i) in report.teeth.findings" :key="i">
            <span class="sev" :class="`sev-${f.severity}`">{{ SEVERITY_TEXT[f.severity] }}</span>
            <span class="finding-label">{{ f.label }}</span>
            <span class="finding-note">{{ f.note }}</span>
          </li>
        </ul>
        <p v-else class="report-desc muted">未识别到明显的牙齿外观异常。</p>
        <p v-if="report.teeth.advice" class="report-advice">{{ report.teeth.advice }}</p>
      </section>
    </div>

    <!-- 辨证与养护 -->
    <section class="report-section">
      <h4 class="report-section-title">中医辨证融合</h4>
      <p class="report-desc">
        辨证倾向：<strong>{{ report.fusion.syndrome }}</strong>
      </p>
      <p class="report-basis">依据：{{ report.fusion.medicalBasis }}</p>
    </section>

    <section class="report-section">
      <h4 class="report-section-title">个性化养护方案</h4>
      <p class="report-advice care">{{ report.fusion.advice }}</p>
    </section>

    <!-- 原图 -->
    <section v-if="report.images" class="report-section">
      <h4 class="report-section-title">采集图像</h4>
      <div class="report-images">
        <figure>
          <img :src="report.images.tongue" alt="舌象照片" />
          <figcaption>舌象</figcaption>
        </figure>
        <figure>
          <img :src="report.images.teeth" alt="牙齿照片" />
          <figcaption>牙齿</figcaption>
        </figure>
      </div>
    </section>

    <p class="report-disclaimer">{{ report.disclaimer }}</p>
  </div>
</template>

<script setup lang="ts">
import ScoreRing from './ScoreRing.vue'
import type { Level, Severity, TongueResult, TeethResult, FusionResult } from '@/types'

defineProps<{
  report: {
    tongue: TongueResult
    teeth: TeethResult
    fusion: FusionResult
    images?: { tongue: string; teeth: string }
    aiEnhanced: boolean
    aiModel: string
    processingTime?: string
    disclaimer: string
  }
}>()

const LEVEL_TEXT: Record<Level, string> = {
  healthy: '低',
  mild: '轻度',
  moderate: '中度',
  severe: '高',
}

const SEVERITY_TEXT: Record<Severity, string> = {
  mild: '轻微',
  moderate: '中度',
  severe: '重度',
}
</script>

<style scoped>
.report {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.report-head {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #f0fdfa, #e6fbf5);
  border: 1px solid #99f6e4;
  border-radius: var(--radius-md);
}

.report-head-info {
  flex: 1;
  min-width: 0;
}

.level-badge {
  display: inline-block;
  padding: 5px 16px;
  border-radius: 999px;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 10px;
}

.level-healthy {
  background: #10b981;
}
.level-mild {
  background: #f59e0b;
}
.level-moderate {
  background: #f97316;
}
.level-severe {
  background: #ef4444;
}

.report-summary {
  font-size: 14px;
  color: #374151;
  line-height: 1.7;
  margin-bottom: 10px;
}

.report-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.risk-tag {
  padding: 3px 10px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 10px;
  font-size: 12px;
}

.risk-tag.ok {
  background: #dcfce7;
  color: #166534;
}

.report-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #6b7280;
}

.ai-badge {
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
}

.ai-badge.on {
  background: #0d9488;
  color: #fff;
}

.ai-badge.off {
  background: #f3f4f6;
  color: #6b7280;
}

.report-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.report-section {
  background: #fff;
  border: 1px solid #eef2f1;
  border-radius: var(--radius-md);
  padding: 18px;
}

.report-section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-dark);
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0fdfa;
}

.report-diagnosis {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 6px;
}

.report-desc {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.7;
  margin-bottom: 10px;
}

.report-desc.muted {
  color: #9ca3af;
}

.feature-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
}

.feature-list div {
  display: flex;
  gap: 8px;
  font-size: 13px;
}

.feature-list dt {
  color: #9ca3af;
  flex-shrink: 0;
}

.feature-list dd {
  color: #374151;
  font-weight: 500;
}

.finding-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}

.finding-list li {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 13px;
}

.sev {
  flex-shrink: 0;
  padding: 1px 8px;
  border-radius: 8px;
  font-size: 11px;
  color: #fff;
}

.sev-mild {
  background: #f59e0b;
}
.sev-moderate {
  background: #f97316;
}
.sev-severe {
  background: #ef4444;
}

.finding-label {
  font-weight: 600;
  color: #1f2937;
  flex-shrink: 0;
}

.finding-note {
  color: #6b7280;
}

.report-advice {
  font-size: 13px;
  color: #0f766e;
  line-height: 1.8;
  background: #f0fdfa;
  border-radius: 8px;
  padding: 10px 14px;
}

.report-advice.care {
  white-space: pre-wrap;
}

.report-basis {
  margin-top: 8px;
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.7;
}

.report-images {
  display: flex;
  gap: 16px;
}

.report-images figure {
  flex: 1;
  text-align: center;
}

.report-images img {
  width: 100%;
  max-height: 180px;
  object-fit: contain;
  border-radius: 8px;
  background: #f9fafb;
}

.report-images figcaption {
  margin-top: 6px;
  font-size: 12px;
  color: #9ca3af;
}

.report-disclaimer {
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.7;
  padding: 10px 14px;
  background: #f9fafb;
  border-radius: 8px;
}

@media (max-width: 820px) {
  .report-head {
    flex-direction: column;
    text-align: center;
  }
  .report-grid {
    grid-template-columns: 1fr;
  }
}
</style>
