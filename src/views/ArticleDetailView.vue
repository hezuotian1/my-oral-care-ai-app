<template>
  <div class="detail-page">
    <button class="back-link" @click="router.back()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
      返回
    </button>

    <div v-if="loading" class="list-loading">
      <div class="loading-spinner"></div>
    </div>

    <article v-else-if="article" class="article-detail">
      <span class="article-category">{{ article.category }}</span>
      <h1 class="article-detail-title">{{ article.title }}</h1>
      <div class="article-meta">
        <span>{{ formatDate(article.publishedAt) }}</span>
        <span>{{ article.readCount }} 次阅读</span>
      </div>

      <p class="article-summary">{{ article.summary }}</p>

      <div class="article-content">
        <p v-for="(para, i) in paragraphs" :key="i">{{ para }}</p>
      </div>

      <div class="article-tags">
        <span v-for="t in article.tags" :key="t">{{ t }}</span>
      </div>
    </article>

    <EmptyState v-else title="文章不存在" desc="该文章可能已被删除" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EmptyState from '@/components/EmptyState.vue'
import { getArticle } from '@/api/articles'
import { useToast } from '@/composables/useToast'
import { formatDate } from '@/utils/format'
import type { ArticleDetail } from '@/types'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const article = ref<ArticleDetail | null>(null)
const loading = ref(true)

const paragraphs = computed(() =>
  (article.value?.content || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean),
)

onMounted(async () => {
  try {
    article.value = await getArticle(String(route.params.id))
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '加载失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.detail-page {
  padding: 20px;
  background: var(--panel-bg);
  border-radius: var(--radius-xl);
  box-shadow: 0 2px 12px rgba(30, 82, 68, 0.06);
  min-height: calc(100vh - 24px);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #4b5563;
  margin-bottom: 16px;
  transition: color 0.2s;
}

.back-link:hover {
  color: var(--primary);
}

.back-link svg {
  width: 16px;
  height: 16px;
}

.list-loading {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.article-detail {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 32px;
  box-shadow: 0 2px 12px rgba(30, 82, 68, 0.08);
  max-width: 820px;
  margin: 0 auto;
}

.article-category {
  display: inline-block;
  padding: 2px 12px;
  background: #f0fdfa;
  color: var(--primary-dark);
  border-radius: 999px;
  font-size: 12px;
  margin-bottom: 12px;
}

.article-detail-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.5;
  margin-bottom: 10px;
}

.article-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.article-summary {
  font-size: 14px;
  color: var(--primary-dark);
  background: #f0fdfa;
  border-radius: 8px;
  padding: 12px 16px;
  line-height: 1.8;
  margin-bottom: 20px;
}

.article-content p {
  font-size: 15px;
  color: #374151;
  line-height: 2;
  margin-bottom: 16px;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.article-tags span {
  font-size: 12px;
  color: #6b7280;
  background: #f9fafb;
  padding: 3px 10px;
  border-radius: 6px;
}
</style>
