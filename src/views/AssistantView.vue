<template>
  <div class="assistant-page">
    <div class="ai-assistant-container">
      <!-- 左：会话列表 -->
      <aside class="ai-chat-sidebar">
        <div class="ai-chat-sidebar-header">
          <h3>AI 咨询助手</h3>
          <button class="ai-new-chat-btn" @click="onNewChat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            开启新对话
          </button>
        </div>

        <div class="ai-chat-history">
          <div
            v-for="c in conversations"
            :key="c.id"
            class="ai-history-item"
            :class="{ active: c.id === activeId }"
            @click="selectConversation(c.id)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <div class="ai-history-info">
              <div class="ai-history-title">{{ c.title }}</div>
              <div class="ai-history-time">{{ fromNow(c.updatedAt) }}</div>
            </div>
            <button class="ai-history-del" title="删除会话" @click.stop="onDelete(c.id)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <p v-if="!conversations.length" class="ai-history-empty">还没有会话，点击上方开启新对话</p>
        </div>

        <div class="ai-chat-sidebar-footer">
          <div class="ai-quick-title">常见问题</div>
          <div class="ai-quick-list">
            <button v-for="q in quickPrompts" :key="q" class="ai-quick-btn" @click="askQuick(q)">
              {{ q }}
            </button>
          </div>
        </div>
      </aside>

      <!-- 右：对话区 -->
      <section class="ai-chat-main">
        <div ref="scrollRef" class="ai-chat-messages">
          <div v-if="!messages.length" class="ai-welcome">
            <div class="ai-avatar ai-avatar-system">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <circle cx="12" cy="5" r="2" />
                <path d="M12 7v4" />
              </svg>
            </div>
            <h3>你好，我是口腔健康助手</h3>
            <p>可以问我舌象、牙齿护理、中医养生等问题。我提供的是健康科普与日常护理建议，不做疾病诊断。</p>
          </div>

          <div
            v-for="(m, i) in messages"
            :key="i"
            class="ai-message"
            :class="m.role === 'user' ? 'ai-message-user' : 'ai-message-system'"
          >
            <div class="ai-avatar" :class="m.role === 'user' ? 'ai-avatar-user' : 'ai-avatar-system'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path v-if="m.role === 'user'" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle v-if="m.role === 'user'" cx="12" cy="7" r="4" />
                <template v-else>
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <circle cx="12" cy="5" r="2" />
                  <path d="M12 7v4" />
                </template>
              </svg>
            </div>
            <div class="ai-message-content">
              <div class="ai-message-text">{{ m.content }}</div>
            </div>
          </div>

          <div v-if="sending" class="ai-message ai-message-system">
            <div class="ai-avatar ai-avatar-system">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <circle cx="12" cy="5" r="2" />
                <path d="M12 7v4" />
              </svg>
            </div>
            <div class="ai-message-loading"><span></span><span></span><span></span></div>
          </div>
        </div>

        <!-- 输入区 -->
        <div class="ai-chat-input-area">
          <div class="ai-chat-input-wrapper">
            <textarea
              v-model="draft"
              class="ai-chat-input"
              placeholder="输入你的问题…（Enter 发送，Shift+Enter 换行）"
              rows="2"
              @keydown.enter.exact.prevent="onSend"
            ></textarea>
            <div class="ai-input-footer">
              <span class="ai-input-hint">回答由 AI 生成，仅供参考，不构成医学诊断</span>
              <button class="ai-send-btn" :disabled="sending || !draft.trim()" @click="onSend">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                发送
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import {
  createConversation,
  deleteConversation,
  getConversation,
  listConversations,
  sendMessage,
} from '@/api/assistant'
import { useToast } from '@/composables/useToast'
import { fromNow } from '@/utils/format'
import type { ChatMessage, ConversationListItem } from '@/types'

const toast = useToast()

const conversations = ref<ConversationListItem[]>([])
const activeId = ref('')
const messages = ref<ChatMessage[]>([])
const draft = ref('')
const sending = ref(false)
const scrollRef = ref<HTMLElement | null>(null)

const quickPrompts = ['牙龈出血怎么办？', '齿痕舌说明什么？', '每天该怎么正确刷牙？', '牙结石能自己刷掉吗？']

async function loadConversations() {
  try {
    const res = await listConversations()
    conversations.value = res.list
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '加载失败')
  }
}

async function selectConversation(id: string) {
  if (id === activeId.value) return
  activeId.value = id
  try {
    const res = await getConversation(id)
    messages.value = res.messages
    await scrollToBottom()
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '加载失败')
  }
}

async function onNewChat() {
  try {
    const res = await createConversation()
    conversations.value.unshift({
      id: res.id,
      title: res.title,
      preview: '',
      updatedAt: new Date().toISOString(),
      messageCount: 0,
    })
    activeId.value = res.id
    messages.value = []
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '创建失败')
  }
}

async function ensureConversation(): Promise<string> {
  if (activeId.value) return activeId.value
  const res = await createConversation()
  conversations.value.unshift({
    id: res.id,
    title: res.title,
    preview: '',
    updatedAt: new Date().toISOString(),
    messageCount: 0,
  })
  activeId.value = res.id
  messages.value = []
  return res.id
}

async function onSend() {
  const content = draft.value.trim()
  if (!content || sending.value) return
  sending.value = true
  draft.value = ''
  messages.value.push({ role: 'user', content })
  await scrollToBottom()

  try {
    const id = await ensureConversation()
    const res = await sendMessage(id, content)
    // 用服务端返回的真实消息替换本地乐观插入
    messages.value.splice(messages.value.length - 1, 1, res.userMessage)
    messages.value.push(res.assistantMessage)
    await loadConversations()
    await scrollToBottom()
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '发送失败')
  } finally {
    sending.value = false
  }
}

function askQuick(q: string) {
  draft.value = q
  onSend()
}

async function onDelete(id: string) {
  if (!window.confirm('确定删除该会话吗？')) return
  try {
    await deleteConversation(id)
    conversations.value = conversations.value.filter((c) => c.id !== id)
    if (activeId.value === id) {
      activeId.value = ''
      messages.value = []
    }
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '删除失败')
  }
}

async function scrollToBottom() {
  await nextTick()
  if (scrollRef.value) scrollRef.value.scrollTop = scrollRef.value.scrollHeight
}

onMounted(async () => {
  await loadConversations()
  if (conversations.value.length) {
    const first = conversations.value[0]
    if (first) await selectConversation(first.id)
  }
})
</script>

<style scoped>
.assistant-page {
  padding: 20px;
  background: var(--panel-bg);
  border-radius: var(--radius-xl);
  box-shadow: 0 2px 12px rgba(30, 82, 68, 0.06);
  min-height: calc(100vh - 24px);
}

.ai-assistant-container {
  display: flex;
  height: calc(100vh - 64px);
  background: #fff;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(30, 82, 68, 0.08);
}

/* 左侧会话列表 */
.ai-chat-sidebar {
  width: 268px;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  background: #fafafa;
  flex-shrink: 0;
}

.ai-chat-sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.ai-chat-sidebar-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

.ai-new-chat-btn {
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.ai-new-chat-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
}

.ai-new-chat-btn svg {
  width: 16px;
  height: 16px;
}

.ai-chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.ai-history-empty {
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
  padding: 20px 8px;
  line-height: 1.7;
}

.ai-history-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;
}

.ai-history-item:hover {
  background: #f0fdfa;
}

.ai-history-item.active {
  background: var(--primary);
  color: #fff;
}

.ai-history-item > svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: var(--primary);
}

.ai-history-item.active > svg {
  color: #fff;
}

.ai-history-info {
  flex: 1;
  min-width: 0;
}

.ai-history-title {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ai-history-time {
  font-size: 11px;
  color: #9ca3af;
}

.ai-history-item.active .ai-history-time {
  color: rgba(255, 255, 255, 0.7);
}

.ai-history-del {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: #9ca3af;
  flex-shrink: 0;
  opacity: 0;
  transition: all 0.2s;
}

.ai-history-item:hover .ai-history-del {
  opacity: 1;
}

.ai-history-del:hover {
  background: #fee2e2;
  color: #ef4444;
}

.ai-history-del svg {
  width: 14px;
  height: 14px;
}

.ai-chat-sidebar-footer {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

.ai-quick-title {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 10px;
  font-weight: 500;
}

.ai-quick-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ai-quick-btn {
  padding: 6px 10px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  font-size: 12px;
  color: #4b5563;
  transition: all 0.2s;
  white-space: nowrap;
}

.ai-quick-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: #f0fdfa;
}

/* 右侧聊天 */
.ai-chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  min-width: 0;
}

.ai-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ai-welcome {
  margin: auto;
  text-align: center;
  color: #6b7280;
  max-width: 420px;
}

.ai-welcome .ai-avatar {
  margin: 0 auto 12px;
}

.ai-welcome h3 {
  font-size: 17px;
  color: #1f2937;
  margin-bottom: 8px;
}

.ai-welcome p {
  font-size: 13px;
  line-height: 1.8;
}

.ai-message {
  display: flex;
  gap: 12px;
  max-width: 80%;
}

.ai-message-user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.ai-message-system {
  align-self: flex-start;
}

.ai-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-avatar svg {
  width: 20px;
  height: 20px;
}

.ai-avatar-system {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff;
}

.ai-avatar-user {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
}

.ai-message-content {
  display: flex;
  flex-direction: column;
}

.ai-message-text {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.7;
  color: #1f2937;
  white-space: pre-wrap;
  word-break: break-word;
}

.ai-message-system .ai-message-text {
  background: #f3f4f6;
  border-bottom-left-radius: 4px;
}

.ai-message-user .ai-message-text {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff;
  border-bottom-right-radius: 4px;
}

.ai-message-loading {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 14px 16px;
  background: #f3f4f6;
  border-radius: 12px;
  width: fit-content;
}

.ai-message-loading span {
  width: 8px;
  height: 8px;
  background: #9ca3af;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.ai-message-loading span:nth-child(1) {
  animation-delay: -0.32s;
}
.ai-message-loading span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.ai-chat-input-area {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  background: #fff;
}

.ai-chat-input-wrapper {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  transition: all 0.2s;
  background: #fafafa;
}

.ai-chat-input-wrapper:focus-within {
  border-color: var(--primary);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
}

.ai-chat-input {
  width: 100%;
  border: none;
  background: transparent;
  resize: none;
  font-size: 14px;
  line-height: 1.6;
  color: #1f2937;
  min-height: 48px;
  max-height: 150px;
  font-family: inherit;
}

.ai-chat-input:focus {
  outline: none;
}

.ai-input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  gap: 12px;
}

.ai-input-hint {
  font-size: 11px;
  color: #9ca3af;
}

.ai-send-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  flex-shrink: 0;
}

.ai-send-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
}

.ai-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ai-send-btn svg {
  width: 16px;
  height: 16px;
}

@media (max-width: 820px) {
  .ai-assistant-container {
    flex-direction: column;
    height: auto;
  }
  .ai-chat-sidebar {
    width: 100%;
    height: 220px;
  }
  .ai-message {
    max-width: 92%;
  }
}
</style>
