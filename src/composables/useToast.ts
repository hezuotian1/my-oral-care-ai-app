import { ref } from 'vue'

export type ToastType = 'info' | 'success' | 'error'

export interface ToastItem {
  id: number
  message: string
  type: ToastType
}

const toasts = ref<ToastItem[]>([])
let seq = 0

function push(message: string, type: ToastType) {
  const id = ++seq
  toasts.value = [...toasts.value, { id, message, type }]
  window.setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }, 2600)
}

/**
 * 全局单例 Toast：任意组件调用 useToast() 都操作同一份队列，
 * 由 App.vue 中的 <BaseToast /> 统一渲染。
 */
export function useToast() {
  return {
    toasts,
    show: push,
    info: (message: string) => push(message, 'info'),
    success: (message: string) => push(message, 'success'),
    error: (message: string) => push(message, 'error'),
  }
}
