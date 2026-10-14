import request from './request'
import type { ArticleDetail, ArticleListItem } from '@/types'

export function listArticles(category?: string) {
  return request.get<{ list: ArticleListItem[]; categories: string[] }>('/articles', {
    params: category ? { category } : undefined,
  })
}

export function getArticle(id: string) {
  return request.get<ArticleDetail>(`/articles/${id}`)
}
