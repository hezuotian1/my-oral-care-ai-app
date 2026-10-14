<template>
  <div class="articles-page">
    <header class="page-header">
      <h2>健康科普</h2>
      <p>中医舌诊与口腔护理知识，帮助你理解筛查结果</p>
    </header>

    <div class="category-tabs">
      <button class="category-tab" :class="{ active: !activeCategory }" @click="selectCategory('')">
        全部
      </button>
      <button
        v-for="c in categories"
        :key="c"
        class="category-tab"
        :class="{ active: activeCategory === c }"
        @click="selectCategory(c)"
      >
        {{ c }}
      </button>
    </div>

    <div v-if="loading" class="list-loading">
      <div class="loading-spinner"></div>
    </div>

    <div v-else-if="list.length" class="article-grid">
      <RouterLink v-for="a in list" :key="a.id" :to="`/articles/${a.id}`" class="article-card">
        <span class="article-category">{{ a.category }}</span>
        <h3 class="article-title">{{ a.title }}</h3>
        <p class="article-summary">{{ a.summary }}</p>
        <div class="article-foot">
          <div class="article-tags">
            <span v-for="t in a.tags.slice(0, 3)" :key="t">{{ t }}</span>
          </div>
          <span class="article-read">{{ a.readCount }} 次阅读</span>
        </div>
      </RouterLink>
    </div>

    <EmptyState v-else title="暂无文章" desc="暂无可展示的科普内容" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import EmptyState from '@/components/EmptyState.vue'
import { listArticles } from '@/api/articles'
import { useToast } from '@/composables/useToast'
import type { ArticleListItem } from '@/types'

const toast = useToast()
const list = ref<ArticleListItem[]>([])
const categories = ref<string[]>([])
const activeCategory = ref('')
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const res = await listArticles(activeCategory.value || undefined)
    list.value = res.list
    if (!activeCategory.value) categories.value = res.categories
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '加载失败')
  } finally {
    loading.value = false
  }
}

function selectCategory(c: string) {
  activeCategory.value = c
  load()
}

onMounted(load)
</script>

<style scoped>
.articles-page {
  padding: 20px;
  background: var(--panel-bg);
  border-radius: var(--radius-xl);
  box-shadow: 0 2px 12px rgba(30, 82, 68, 0.06);
  min-height: calc(100vh - 24px);
}

.page-header {
  text-align: center;
  margin-bottom: 20px;
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

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 20px;
}

.category-tab {
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 13px;
  color: #4b5563;
  background: #fff;
  transition: all 0.2s;
}

.category-tab:hover {
  color: var(--primary);
}

.category-tab.active {
  background: var(--primary);
  color: #fff;
}

.list-loading {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.article-card {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: 0 2px 12px rgba(30, 82, 68, 0.08);
  display: flex;
  flex-direction: column;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(30, 82, 68, 0.16);
}

.article-category {
  align-self: flex-start;
  padding: 2px 10px;
  background: #f0fdfa;
  color: var(--primary-dark);
  border-radius: 999px;
  font-size: 12px;
  margin-bottom: 10px;
}

.article-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.5;
  margin-bottom: 8px;
}

.article-summary {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.7;
  flex: 1;
  margin-bottom: 12px;
}

.article-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.article-tags span {
  font-size: 11px;
  color: #9ca3af;
  background: #f9fafb;
  padding: 2px 8px;
  border-radius: 6px;
}

.article-read {
  font-size: 12px;
  color: #9ca3af;
  flex-shrink: 0;
}

@media (max-width: 1100px) {
  .article-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .article-grid {
    grid-template-columns: 1fr;
  }
}
</style>
