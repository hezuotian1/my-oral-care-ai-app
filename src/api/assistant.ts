import request from './request'
import type { ChatMessage, ConversationListItem } from '@/types'

export function listConversations() {
  return request.get<{ list: ConversationListItem[] }>('/conversations')
}

export function createConversation(title?: string) {
  return request.post<{ id: string; title: string; messages: ChatMessage[] }>('/conversations', {
    title,
  })
}

export function getConversation(id: string) {
  return request.get<{ id: string; title: string; messages: ChatMessage[] }>(`/conversations/${id}`)
}

export function sendMessage(id: string, content: string) {
  return request.post<{ userMessage: ChatMessage; assistantMessage: ChatMessage }>(
    `/conversations/${id}/messages`,
    { content },
    { timeout: 90000 },
  )
}

export function deleteConversation(id: string) {
  return request.delete<{ message: string }>(`/conversations/${id}`)
}
